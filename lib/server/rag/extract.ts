import "server-only";
import mammoth from "mammoth";
import { extractText as pdfToText } from "unpdf";

// Uploads go through a server action, and the hosting platform caps a request at about 4.5 MB
// (serverActions.bodySizeLimit in next.config.mjs). Longer documents can be pasted as text instead.
export const KB_MAX_BYTES = 4 * 1024 * 1024;
export const KB_ACCEPT = ".pdf,.docx,.txt,.md";

export class ExtractError extends Error {}

// Plain text from an uploaded PDF, Word (.docx), text or Markdown file
export async function extractText(file: File): Promise<string> {
  if (file.size > KB_MAX_BYTES) throw new ExtractError("That file is larger than 4 MB. Split it, or paste its text instead.");
  const name = file.name.toLowerCase();
  const bytes = new Uint8Array(await file.arrayBuffer());
  let text: string;
  if (name.endsWith(".pdf")) text = (await pdfToText(bytes, { mergePages: true })).text;
  else if (name.endsWith(".docx")) text = (await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value;
  else if (name.endsWith(".txt") || name.endsWith(".md")) text = new TextDecoder().decode(bytes);
  else throw new ExtractError("Upload a PDF, Word (.docx), .txt or .md file.");
  return tidyText(text);
}

export const tidyText = (text: string): string =>
  text.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
