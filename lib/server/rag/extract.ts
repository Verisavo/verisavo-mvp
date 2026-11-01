import "server-only";
import JSZip from "jszip";
import mammoth from "mammoth";
import { extractText as pdfToText, getDocumentProxy } from "unpdf";

// Uploads go through a server action or route, and the hosting platform caps a request at about 4.5 MB
// (serverActions.bodySizeLimit in next.config.mjs). Longer documents can be pasted as text instead.
export const KB_MAX_BYTES = 4 * 1024 * 1024;
// What each upload accepts: the admin knowledge base, and a paid user's attachments in the assistant (M3.6)
export const KB_ACCEPT = ".pdf,.docx,.txt,.md";
export const ATTACHMENT_ACCEPT = ".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md";
const WRONG_TYPE: Record<string, string> = {
  [KB_ACCEPT]: "Upload a PDF, Word (.docx), .txt or .md file.",
  [ATTACHMENT_ACCEPT]: "Attach a PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx), CSV or text file, or an image."
};
// A small file can still unpack into gigabytes (a "zip bomb") or hold thousands of pages, so both are capped before or
// while the parsers work, and the text produced stops at `maxChars`.
const MAX_UNZIPPED_BYTES = 40 * 1024 * 1024;
const MAX_ZIP_ENTRIES = 5000;
const MAX_PDF_PAGES = 500;
const MAX_SHEETS = 50;
const MAX_SHEET_ROWS = 5000;
const TOO_BIG = "That file is too large once unpacked. Split it, or paste its text instead.";
const UNREADABLE = "That file couldn't be read. Try another format, or paste the text instead.";

export class ExtractError extends Error {}

// Plain text from an uploaded PDF, Word, PowerPoint, Excel, CSV, text or Markdown file (whichever `accept` allows),
// at most about `maxChars` long
export async function extractText(file: File, accept: string = KB_ACCEPT, maxChars = 600_000): Promise<string> {
  if (file.size > KB_MAX_BYTES) throw new ExtractError("That file is larger than 4 MB. Split it, or paste its text instead.");
  const name = file.name.toLowerCase();
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  if (!accept.split(",").includes(ext)) throw new ExtractError(WRONG_TYPE[accept] ?? "That file type isn't supported.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  let text: string;
  if (ext === ".pdf") {
    const pdf = await getDocumentProxy(bytes);
    try {
    if (pdf.numPages > MAX_PDF_PAGES) throw new ExtractError(`That PDF has more than ${MAX_PDF_PAGES} pages. Split it into smaller documents.`);
    text = (await pdfToText(pdf, { mergePages: true })).text;
    } finally {
      await pdf.loadingTask.destroy();   // otherwise each PDF stays in memory on a warm server
    }
  } else if (ext === ".docx") {
    await openOffice(bytes);   // proves it unpacks within the cap before mammoth unpacks it again
    text = (await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value;
  } else if (ext === ".pptx") text = await pptxText(await openOffice(bytes), maxChars);
  else if (ext === ".xlsx") text = await xlsxText(await openOffice(bytes), maxChars);
  else text = new TextDecoder().decode(bytes);   // .txt, .md, .csv
  return tidyText(text.slice(0, maxChars));
}

// Office files are zips. Every part is unpacked once through a counting stream that stops at the cap, whatever sizes
// the zip claims for itself, so a small upload can't expand into gigabytes.
async function openOffice(bytes: Uint8Array): Promise<JSZip> {
  let zip: JSZip;
  try { zip = await JSZip.loadAsync(bytes); } catch { throw new ExtractError(UNREADABLE); }
  const entries = Object.values(zip.files).filter(f => !f.dir);
  if (entries.length > MAX_ZIP_ENTRIES) throw new ExtractError(TOO_BIG);
  let total = 0;
  for (const entry of entries) {
    await new Promise<void>((resolve, reject) => {
      const stream = entry.nodeStream("nodebuffer");
      stream.on("data", (chunk: Buffer) => {
        total += chunk.length;
        if (total > MAX_UNZIPPED_BYTES) { stream.pause(); stream.removeAllListeners(); reject(new ExtractError(TOO_BIG)); }
      });
      stream.on("error", () => reject(new ExtractError(UNREADABLE)));
      stream.on("end", () => resolve());
    });
  }
  return zip;
}

// XML is read with forward-only scans, never with patterns that can backtrack: each search starts where the last one
// ended, so crafted XML (unclosed tags, huge attributes) costs linear time.
function* elements(xml: string, tag: string): Generator<{ attrs: string; inner: string }> {
  const open = `<${tag}`, close = `</${tag}>`;
  let i = 0;
  while ((i = xml.indexOf(open, i)) !== -1) {
    const next = xml.charCodeAt(i + open.length);
    if (!(next === 62 || next === 47 || next <= 32)) { i += open.length; continue; }   // "<a:t" must not match "<a:tbl"
    const gt = xml.indexOf(">", i + open.length);
    if (gt === -1) return;
    const attrs = xml.slice(i + open.length, gt);
    if (xml.charCodeAt(gt - 1) === 47) { yield { attrs, inner: "" }; i = gt + 1; continue; }   // <tag ... />
    const end = xml.indexOf(close, gt + 1);
    if (end === -1) return;
    yield { attrs, inner: xml.slice(gt + 1, end) };
    i = end + close.length;
  }
}
function attrValue(attrs: string, name: string): string | null {
  const key = `${name}="`;
  for (let i = attrs.indexOf(key); i !== -1; i = attrs.indexOf(key, i + key.length)) {
    if (i === 0 || attrs.charCodeAt(i - 1) <= 32) {
      const end = attrs.indexOf("\"", i + key.length);
      return end === -1 ? null : attrs.slice(i + key.length, end);
    }
  }
  return null;
}
const codePoint = (n: number) => (n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "");
const decodeXml = (s: string) => s.replace(/&(?:#(\d{1,7})|#x([0-9a-f]{1,6})|(lt|gt|amp|quot|apos));/gi, (_, dec, hex, named) =>
  dec ? codePoint(Number(dec)) : hex ? codePoint(parseInt(hex, 16))
    : ({ lt: "<", gt: ">", amp: "&", quot: "\"", apos: "'" } as Record<string, string>)[named.toLowerCase()]);
const textOf = (xml: string, tag: string) => Array.from(elements(xml, tag), e => decodeXml(e.inner)).join("");
const fileNumber = (path: string) => Number(path.match(/(\d+)\.xml$/)?.[1] ?? 0);
const readPart = async (zip: JSZip, path: string) => (await zip.file(path)?.async("string")) ?? "";

// PowerPoint: the text of each slide, in slide order
async function pptxText(zip: JSZip, maxChars: number): Promise<string> {
  const slides = Object.keys(zip.files).filter(p => /^ppt\/slides\/slide\d+\.xml$/.test(p)).sort((a, b) => fileNumber(a) - fileNumber(b));
  const out: string[] = [];
  let size = 0;
  for (const [i, path] of slides.entries()) {
    if (size > maxChars) break;
    const paras = (await readPart(zip, path)).split("</a:p>").map(p => textOf(p, "a:t")).filter(s => s.trim());
    if (!paras.length) continue;
    const block = `Slide ${i + 1}\n${paras.join("\n")}`;
    out.push(block);
    size += block.length;
  }
  return out.join("\n\n");
}

// Excel: each sheet as rows of cells separated by " | " (values as stored; formulas show their last result)
async function xlsxText(zip: JSZip, maxChars: number): Promise<string> {
  const shared = Array.from(elements(await readPart(zip, "xl/sharedStrings.xml"), "si"), si => textOf(si.inner, "t"));
  const rels = new Map(Array.from(elements(await readPart(zip, "xl/_rels/workbook.xml.rels"), "Relationship"), r => [
    attrValue(r.attrs, "Id") ?? "", (attrValue(r.attrs, "Target") ?? "").replace(/^\/?(xl\/)?/, "xl/")
  ]));
  const seen = new Set<string>();
  const sheets = Array.from(elements(await readPart(zip, "xl/workbook.xml"), "sheet"), s => ({
    name: decodeXml(attrValue(s.attrs, "name") ?? "Sheet"), path: rels.get(attrValue(s.attrs, "r:id") ?? "") ?? ""
  })).filter(s => s.path && !seen.has(s.path) && seen.add(s.path)).slice(0, MAX_SHEETS);   // each part read once

  const out: string[] = [];
  let size = 0;
  for (const sheet of sheets) {
    if (size > maxChars) break;
    const rows: string[] = [];
    for (const row of elements(await readPart(zip, sheet.path), "row")) {
      if (rows.length >= MAX_SHEET_ROWS || size > maxChars) { rows.push("(more rows not included)"); break; }
      const cells = Array.from(elements(row.inner, "c"), c => {
        const type = attrValue(c.attrs, "t");
        const v = decodeXml(elements(c.inner, "v").next().value?.inner ?? "");
        return type === "s" ? shared[Number(v)] ?? "" : type === "inlineStr" ? textOf(c.inner, "t") : v;
      });
      if (!cells.some(c => c.trim())) continue;
      // one row can repeat a huge shared string: stop before joining it into something enormous
      let width = 0;
      const line = cells.filter(c => (width += c.length) <= maxChars).join(" | ");
      rows.push(line);
      size += line.length + 1;
    }
    if (rows.length) out.push(`Sheet: ${sheet.name}\n${rows.join("\n")}`);
  }
  return out.join("\n\n");
}

// Normalise line endings, trim the end of each line, collapse runs of blank lines and drop NUL (Postgres refuses it).
// Splitting lines instead of a whitespace pattern keeps this fast even for megabytes of spaces.
export const tidyText = (text: string): string =>
  text.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").split("\n").map(line => line.trimEnd()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
