import "server-only";
import mammoth from "mammoth";
import { extractText as pdfToText, getDocumentProxy } from "unpdf";

// Uploads go through a server action, and the hosting platform caps a request at about 4.5 MB
// (serverActions.bodySizeLimit in next.config.mjs). Longer documents can be pasted as text instead.
export const KB_MAX_BYTES = 4 * 1024 * 1024;
export const KB_ACCEPT = ".pdf,.docx,.txt,.md";
// A small file can still unpack into gigabytes (a "zip bomb" .docx) or hold thousands of pages, so both are capped
// before the parsers do the work. M3's user attachments must use these limits too.
const MAX_UNZIPPED_BYTES = 40 * 1024 * 1024;
const MAX_PDF_PAGES = 500;

export class ExtractError extends Error {}

// Plain text from an uploaded PDF, Word (.docx), text or Markdown file
export async function extractText(file: File): Promise<string> {
  if (file.size > KB_MAX_BYTES) throw new ExtractError("That file is larger than 4 MB. Split it, or paste its text instead.");
  const name = file.name.toLowerCase();
  const bytes = new Uint8Array(await file.arrayBuffer());
  let text: string;
  if (name.endsWith(".pdf")) {
    const pdf = await getDocumentProxy(bytes);
    if (pdf.numPages > MAX_PDF_PAGES) throw new ExtractError(`That PDF has more than ${MAX_PDF_PAGES} pages. Split it into smaller documents.`);
    text = (await pdfToText(pdf, { mergePages: true })).text;
  } else if (name.endsWith(".docx")) {
    if (unzippedSize(bytes) > MAX_UNZIPPED_BYTES) throw new ExtractError("That Word file is too large once unpacked. Split it, or paste its text instead.");
    text = (await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value;
  } else if (name.endsWith(".txt") || name.endsWith(".md")) text = new TextDecoder().decode(bytes);
  else throw new ExtractError("Upload a PDF, Word (.docx), .txt or .md file.");
  return tidyText(text);
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
