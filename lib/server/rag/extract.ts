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
// A small file can still unpack into gigabytes (a "zip bomb" .docx) or hold thousands of pages, so both are capped
// before the parsers do the work.
const MAX_UNZIPPED_BYTES = 40 * 1024 * 1024;
const MAX_PDF_PAGES = 500;
const MAX_SHEET_ROWS = 5000;

export class ExtractError extends Error {}

// Plain text from an uploaded PDF, Word, PowerPoint, Excel, CSV, text or Markdown file (whichever `accept` allows)
export async function extractText(file: File, accept: string = KB_ACCEPT): Promise<string> {
  if (file.size > KB_MAX_BYTES) throw new ExtractError("That file is larger than 4 MB. Split it, or paste its text instead.");
  const name = file.name.toLowerCase();
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  if (!accept.split(",").includes(ext)) throw new ExtractError(WRONG_TYPE[accept] ?? "That file type isn't supported.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if ([".docx", ".pptx", ".xlsx"].includes(ext) && unzippedSize(bytes) > MAX_UNZIPPED_BYTES) {
    throw new ExtractError("That file is too large once unpacked. Split it, or paste its text instead.");
  }
  let text: string;
  if (ext === ".pdf") {
    const pdf = await getDocumentProxy(bytes);
    if (pdf.numPages > MAX_PDF_PAGES) throw new ExtractError(`That PDF has more than ${MAX_PDF_PAGES} pages. Split it into smaller documents.`);
    text = (await pdfToText(pdf, { mergePages: true })).text;
  } else if (ext === ".docx") text = (await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value;
  else if (ext === ".pptx") text = await pptxText(bytes);
  else if (ext === ".xlsx") text = await xlsxText(bytes);
  else text = new TextDecoder().decode(bytes);   // .txt, .md, .csv
  return tidyText(text);
}

const decodeXml = (s: string) => s.replace(/&(?:#(\d+)|#x([0-9a-f]+)|(lt|gt|amp|quot|apos));/gi, (_, dec, hex, named) =>
  dec ? String.fromCodePoint(Number(dec)) : hex ? String.fromCodePoint(parseInt(hex, 16))
    : ({ lt: "<", gt: ">", amp: "&", quot: "\"", apos: "'" } as Record<string, string>)[named.toLowerCase()]);
const fileNumber = (path: string) => Number(path.match(/(\d+)\.xml$/)?.[1] ?? 0);

// PowerPoint: the text of each slide, in slide order
async function pptxText(bytes: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(bytes);
  const slides = Object.keys(zip.files).filter(p => /^ppt\/slides\/slide\d+\.xml$/.test(p)).sort((a, b) => fileNumber(a) - fileNumber(b));
  const out: string[] = [];
  for (const [i, path] of slides.entries()) {
    const xml = await zip.file(path)!.async("string");
    const paras = xml.split("</a:p>").map(p => [...p.matchAll(/<a:t(?:\s[^>]*)?>([^<]*)<\/a:t>/g)].map(m => decodeXml(m[1])).join("")).filter(s => s.trim());
    if (paras.length) out.push(`Slide ${i + 1}\n${paras.join("\n")}`);
  }
  return out.join("\n\n");
}

// Excel: each sheet as rows of cells separated by " | " (values as stored; formulas show their last result)
async function xlsxText(bytes: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(bytes);
  const read = async (path: string) => (await zip.file(path)?.async("string")) ?? "";
  const tText = (xml: string) => [...xml.matchAll(/<t(?:\s[^>]*)?>([^<]*)<\/t>/g)].map(m => decodeXml(m[1])).join("");
  const shared = [...(await read("xl/sharedStrings.xml")).matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m => tText(m[1]));
  const rels = new Map([...(await read("xl/_rels/workbook.xml.rels")).matchAll(/<Relationship\b[^>]*>/g)].map(m => [
    m[0].match(/\bId="([^"]*)"/)?.[1] ?? "", (m[0].match(/\bTarget="([^"]*)"/)?.[1] ?? "").replace(/^\/?(xl\/)?/, "xl/")
  ]));
  const sheets = [...(await read("xl/workbook.xml")).matchAll(/<sheet\b[^>]*>/g)].map(m => ({
    name: decodeXml(m[0].match(/\bname="([^"]*)"/)?.[1] ?? "Sheet"), path: rels.get(m[0].match(/\br:id="([^"]*)"/)?.[1] ?? "") ?? ""
  }));
  const out: string[] = [];
  for (const sheet of sheets) {
    const rows: string[] = [];
    for (const row of (await read(sheet.path)).matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
      if (rows.length >= MAX_SHEET_ROWS) { rows.push("(more rows not included)"); break; }
      const cells = [...row[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)].map(c => {
        const type = c[1].match(/\bt="([^"]*)"/)?.[1], inner = c[2] ?? "";
        const v = decodeXml(inner.match(/<v>([^<]*)<\/v>/)?.[1] ?? "");
        return type === "s" ? shared[Number(v)] ?? "" : type === "inlineStr" ? tText(inner) : v;
      });
      if (cells.some(c => c.trim())) rows.push(cells.join(" | "));
    }
    if (rows.length) out.push(`Sheet: ${sheet.name}\n${rows.join("\n")}`);
  }
  return out.join("\n\n");
}

// The total size a zip says its files unpack to, read from its central directory without unpacking anything.
// ZIP64 archives count as too large; a file that isn't a readable zip returns 0 and the parser reports it as unreadable.
function unzippedSize(zip: Uint8Array): number {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  // the end-of-central-directory record is 22 bytes plus an optional comment of up to 64 KB, at the end of the file
  for (let end = zip.length - 22; end >= Math.max(0, zip.length - 22 - 0xffff); end--) {
    if (view.getUint32(end, true) !== 0x06054b50) continue;
    const count = view.getUint16(end + 10, true);
    let at = view.getUint32(end + 16, true);
    if (count === 0xffff || at === 0xffffffff) return Infinity;
    let total = 0;
    for (let i = 0; i < count; i++) {
      if (at + 46 > zip.length || view.getUint32(at, true) !== 0x02014b50) return 0;
      const size = view.getUint32(at + 24, true);
      if (size === 0xffffffff) return Infinity;
      total += size;
      at += 46 + view.getUint16(at + 28, true) + view.getUint16(at + 30, true) + view.getUint16(at + 32, true);
    }
    return total;
  }
  return 0;
}

// Normalise line endings, trim the end of each line, collapse runs of blank lines and drop NUL (Postgres refuses it).
// Splitting lines instead of a whitespace pattern keeps this fast even for megabytes of spaces.
export const tidyText = (text: string): string =>
  text.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").split("\n").map(line => line.trimEnd()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
