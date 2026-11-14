// Assistant answers are Markdown (lib/server/assistant/answer.ts). The web shows them with app/(app)/Markdown.tsx;
// these helpers turn the same text into WhatsApp's own formatting and into simple blocks for the PDF report.
// Only the subset the prompt asks for is handled: ### headings, - and 1. lists (one nested level), **bold**, tables,
// and the closing "Sources:" line. Anything else passes through as text.

const LINK = /\[([^\]\n]+)\]\((\S+?)\)/g;
const isRule = (l: string) => /^\s*([-*_])(\s*\1){2,}\s*$/.test(l);
const isRow = (l: string) => /^\s*\|.*\|\s*$/.test(l);
const isSep = (l: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
const cells = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim());
const sourcesLine = (l: string) => /^Sources:/i.test(l.replace(/[*_]/g, "").trim());

// Text with Markdown's inline marks removed (links keep their address)
export const plainInline = (s: string) => s
  .replace(LINK, "$1 ($2)")
  .replace(/(\*\*|__)(.+?)\1/g, "$2")
  .replace(/(^|[^\w*])\*(?!\s)([^*\n]+?)(?<!\s)\*(?!\*)/g, "$1$2")
  .replace(/(^|[^\w])_(?!\s)([^_\n]+?)(?<!\s)_(?![\w])/g, "$1$2")
  .replace(/~~(.+?)~~/g, "$1")
  .replace(/`([^`\n]+)`/g, "$1");

// WhatsApp: *bold*, _italic_, ~strike~; no headings, tables or link syntax
const waInline = (s: string) => s
  .replace(LINK, "$1 ($2)")
  .replace(/(\*\*|__)(.+?)\1/g, "\u0001$2\u0001")
  .replace(/(^|[^\w*])\*(?!\s)([^*\n]+?)(?<!\s)\*(?!\*)/g, "$1_$2_")
  .replace(/~~(.+?)~~/g, "~$1~")
  .replace(/`([^`\n]+)`/g, "$1")
  .replace(/\u0001/g, "*");

export function toWhatsApp(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isRow(line) && i + 1 < lines.length && isSep(lines[i + 1])) {
      // a table becomes one bullet per row: "• *Nigeria*: Price: ₦500 · Share: 30%"
      const head = cells(line).map(c => plainInline(c));
      for (i += 2; i < lines.length && isRow(lines[i]); i++) {
        const [first, ...rest] = cells(lines[i]);
        const detail = rest.map((v, k) => (head[k + 1] ? `${head[k + 1]}: ` : "") + waInline(v)).join(" · ");
        out.push(`• *${plainInline(first)}*${detail ? `: ${detail}` : ""}`);
      }
      i--;
      continue;
    }
    if (isRule(line)) continue;
    if (sourcesLine(line)) { out.push(`_${line.replace(/[*_]/g, "").trim()}_`); continue; }
    const heading = line.match(/^\s*#{1,6}\s+(.*)$/);
    if (heading) { out.push(`*${plainInline(heading[1]).trim()}*`); continue; }
    const bullet = line.match(/^(\s*)[-*+]\s+(.*)$/);
    if (bullet) { out.push(`${bullet[1].length >= 2 ? "    ◦ " : "• "}${waInline(bullet[2])}`); continue; }
    const quote = line.match(/^\s*>\s?(.*)$/);
    out.push(waInline(quote ? quote[1] : line));
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export type TextBlock =
  | { kind: "heading" | "para" | "sources"; text: string }
  | { kind: "bullet"; text: string; depth: number }
  | { kind: "number"; text: string; n: string; depth: number }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "gap" };

// Blocks for layouts that draw text themselves (the PDF report)
export function markdownBlocks(md: string): TextBlock[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: TextBlock[] = [];
  const gap = () => { if (blocks.length && blocks.at(-1)!.kind !== "gap") blocks.push({ kind: "gap" }); };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || isRule(line)) { gap(); continue; }
    if (isRow(line) && i + 1 < lines.length && isSep(lines[i + 1])) {
      const head = cells(line).map(plainInline), rows: string[][] = [];
      for (i += 2; i < lines.length && isRow(lines[i]); i++) rows.push(cells(lines[i]).map(plainInline));
      i--;
      gap(); blocks.push({ kind: "table", head, rows }); gap();
      continue;
    }
    if (sourcesLine(line)) { gap(); blocks.push({ kind: "sources", text: line.replace(/[*_]/g, "").trim() }); continue; }
    const heading = line.match(/^\s*#{1,6}\s+(.*)$/);
    if (heading) { gap(); blocks.push({ kind: "heading", text: plainInline(heading[1]).trim() }); continue; }
    const bullet = line.match(/^(\s*)[-*+•]\s+(.*)$/);
    if (bullet) { blocks.push({ kind: "bullet", text: plainInline(bullet[2]), depth: bullet[1].length >= 2 ? 1 : 0 }); continue; }
    const num = line.match(/^(\s*)(\d+)[.)]\s+(.*)$/);
    if (num) { blocks.push({ kind: "number", n: num[2], text: plainInline(num[3]), depth: num[1].length >= 2 ? 1 : 0 }); continue; }
    const quote = line.match(/^\s*>\s?(.*)$/);
    blocks.push({ kind: "para", text: plainInline((quote ? quote[1] : line).trim()) });
  }
  while (blocks.at(-1)?.kind === "gap") blocks.pop();
  return blocks;
}
