// Splits a document into overlapping chunks for embedding (see the verisavo-assistant-rag skill).
// Paragraphs are packed into chunks of about TARGET characters (roughly 600 tokens) with a little overlap, and
// every chunk starts with the document title, so a chunk like "It grew 4% in 2025" still says what "it" is.
const TARGET = 2400;
const OVERLAP = 300;
const HARD_MAX = 3600;

function splitLong(text: string): string[] {
  if (text.length <= HARD_MAX) return [text];
  // Sentences and lines first (PDF text ends every visual line with a single \n), then a plain cut for anything still
  // too long. Every character lands in exactly one piece and the pattern never backtracks: nothing is lost, and
  // megabytes of text split in milliseconds.
  const sentences = text.match(/[^.!?\n]+(?:[.!?]+["')\]]*[ \t]*|\n+|$)|[.!?]+["')\]]*[ \t]*|\n+/g) ?? [text];
  const out: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if (buf && buf.length + s.length > TARGET) { out.push(buf.trim()); buf = ""; }
    buf += s;
  }
  if (buf.trim()) out.push(buf.trim());
  return out.flatMap(p => {
    if (p.length <= HARD_MAX) return [p];
    const parts: string[] = [];
    for (let i = 0; i < p.length; i += TARGET - OVERLAP) parts.push(p.slice(i, i + TARGET));
    return parts;
  });
}

export function chunkText(title: string, body: string): string[] {
  const pieces = body.split(/\n{2,}/).map(p => p.trim()).filter(Boolean).flatMap(splitLong);
  const chunks: string[] = [];
  let cur = "";
  for (const piece of pieces) {
    if (cur && cur.length + piece.length + 2 > TARGET) {
      chunks.push(cur);
      const tail = cur.slice(-OVERLAP);
      cur = tail.slice(tail.indexOf(" ") + 1) + "\n\n" + piece;   // carry the end of the last chunk, from a word boundary
    } else {
      cur = cur ? cur + "\n\n" + piece : piece;
    }
  }
  if (cur.trim()) chunks.push(cur);
  return chunks.map(c => `${title}\n\n${c.trim()}`);
}
