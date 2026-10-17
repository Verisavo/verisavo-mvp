import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// M3.7: a branded PDF of one answer or a whole conversation, drawn with pdf-lib in Verisavo's colours and Poppins, the
// site's own font (OFL, lib/server/pdf/fonts). next.config.mjs includes the font files in the deployed route.

export type ReportItem = { question: string; answer: string; market: string | null; files: string[] };
export type Report = { title: string; preparedFor: string; items: ReportItem[]; date: Date; shortened?: boolean };

const INK = rgb(0x1f / 255, 0x27 / 255, 0x3f / 255);
const BRAND_800 = rgb(0x3a / 255, 0x52 / 255, 0x92 / 255);
const BRAND_200 = rgb(0xcc / 255, 0xdd / 255, 0xf1 / 255);
const W = 595.28, H = 841.89, MX = 56, TOP = H - 76, BOTTOM = 64;   // A4, in points
const FONT_DIR = join(process.cwd(), "lib/server/pdf/fonts");

let fontBytes: Promise<[Buffer, Buffer]> | null = null;
const loadFonts = () => (fontBytes ??= Promise.all([readFile(join(FONT_DIR, "Poppins-Regular.ttf")), readFile(join(FONT_DIR, "Poppins-SemiBold.ttf"))]));

// Poppins covers Latin letters and common symbols, but not every currency sign, arrow or African letter. Currency signs
// become their ISO codes, a letter with a mark it lacks keeps its base letter (ẹ → e, ṣ → s), and anything else the
// font can't draw becomes "?", so a PDF never fails because of one character
const SUBSTITUTE: Record<string, string> = { "₦": "NGN ", "₵": "GHS ", "₹": "INR ", "→": "->", "←": "<-", "ŋ": "ng", "Ŋ": "Ng", "\t": "  " };
function printable(text: string, charset: Set<number>): string {
  let out = "";
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (SUBSTITUTE[ch]) out += SUBSTITUTE[ch];
    else if (cp < 32) continue;
    else if (charset.has(cp)) out += ch;
    else {
      const base = ch.normalize("NFD")[0];
      out += base !== ch && charset.has(base.codePointAt(0)!) ? base : "?";
    }
  }
  return out;
}

// Text width as the sum of cached per-character widths: linear in the text, where measuring whole prefixes again and
// again was cubic for very long words. Kerning is ignored, so lines keep a small margin.
function measurer(font: PDFFont, size: number) {
  const cache = new Map<string, number>();
  return (s: string) => {
    let w = 0;
    for (const ch of s) {
      let c = cache.get(ch);
      if (c === undefined) { c = font.widthOfTextAtSize(ch, size); cache.set(ch, c); }
      w += c;
    }
    return w;
  };
}

function wrap(text: string, measure: (s: string) => number, width: number): string[] {
  const lines: string[] = [];
  const space = measure(" ");
  let line = "", lineW = 0;
  for (const word of text.split(/ +/)) {
    const w = measure(word);
    if (line && lineW + space + w <= width) { line += " " + word; lineW += space + w; continue; }
    if (line) { lines.push(line); line = ""; lineW = 0; }
    if (w <= width) { line = word; lineW = w; continue; }
    for (const ch of word) {   // a word longer than the line: cut it
      const cw = measure(ch);
      if (line && lineW + cw > width) { lines.push(line); line = ""; lineW = 0; }
      line += ch; lineW += cw;
    }
  }
  lines.push(line);
  return lines;
}

export async function buildReport(report: Report): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const [regularBytes, semiBytes] = await loadFonts();
  const regular = await pdf.embedFont(regularBytes, { subset: true });
  const semi = await pdf.embedFont(semiBytes, { subset: true });
  const charset = new Set(regular.getCharacterSet());
  pdf.setTitle(printable(report.title, charset));
  pdf.setAuthor("Verisavo");
  pdf.setCreator("Verisavo Intelligence Assistant");
  pdf.setCreationDate(report.date);

  let page!: PDFPage;
  let y = 0;
  const newPage = () => {
    page = pdf.addPage([W, H]);
    page.drawText("Verisavo", { x: MX, y: H - 44, size: 15, font: semi, color: INK });
    const label = "Intelligence report";
    page.drawText(label, { x: W - MX - regular.widthOfTextAtSize(label, 9), y: H - 42, size: 9, font: regular, color: BRAND_800 });
    page.drawLine({ start: { x: MX, y: H - 54 }, end: { x: W - MX, y: H - 54 }, thickness: 0.6, color: BRAND_200 });
    y = TOP;
  };
  // draws wrapped text, starting a new page whenever the next line wouldn't fit
  type Style = { font?: PDFFont; size?: number; lead?: number; color?: typeof INK; indent?: number; hang?: number };
  const measurers = new Map<string, (s: string) => number>();
  const write = (text: string, { font = regular, size = 10.5, lead, color = INK, indent = 0, hang = 0 }: Style = {}) => {
    lead ??= size * 1.48;
    const key = `${font === semi ? "s" : "r"}${size}`;
    if (!measurers.has(key)) measurers.set(key, measurer(font, size));
    const lines = wrap(printable(text, charset), measurers.get(key)!, W - 2 * MX - indent - hang - 2);
    lines.forEach((ln, i) => {
      if (y - lead < BOTTOM) newPage();
      y -= lead;
      page.drawText(ln, { x: MX + indent + (i ? hang : 0), y, size, font, color });
    });
  };
  const gap = (h: number) => { y -= h; };

  newPage();
  write(report.title, { font: semi, size: 20, lead: 26 });
  gap(4);
  const dateText = report.date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  write(`${dateText} · Prepared for ${report.preparedFor}`, { size: 9.5, color: BRAND_800 });
  gap(14);

  report.items.forEach((item, n) => {
    if (n) {
      gap(10);
      if (y - 30 < BOTTOM) newPage();
      page.drawLine({ start: { x: MX, y }, end: { x: W - MX, y }, thickness: 0.6, color: BRAND_200 });
      gap(14);
    }
    write("QUESTION", { font: semi, size: 8, color: BRAND_800 });
    gap(2);
    write(item.question, { font: semi, size: 11.5, lead: 16 });
    const meta = [item.market && item.market !== "All markets" ? `Market: ${item.market}` : "", item.files.length ? `Attached: ${item.files.join(", ")}` : ""].filter(Boolean).join(" · ");
    if (meta) write(meta, { size: 9, color: BRAND_800 });
    gap(10);
    write("ANSWER", { font: semi, size: 8, color: BRAND_800 });
    gap(2);
    for (const para of item.answer.split(/\n{2,}/)) {
      for (const raw of para.split("\n")) {
        const line = raw.trim();
        if (!line) continue;
        if (/^Sources:/i.test(line)) { gap(4); write(line, { size: 9.5, color: BRAND_800 }); }
        else if (/^[-•*]\s+/.test(line)) write(`•  ${line.replace(/^[-•*]\s+/, "")}`, { indent: 6, hang: 11 });
        else write(line);
      }
      gap(6);
    }
  });

  if (report.shortened) { gap(8); write("This conversation is too long for one report, so its later questions were left out. Download single answers for those.", { size: 9.5, color: BRAND_800 }); }

  // footer on every page, once the page count is known
  const pages = pdf.getPages();
  const note = "Verisavo Intelligence Assistant · Based on Verisavo's approved research and your files. Check key figures before acting.";
  // one line, left of the page number: shrink the note to fit rather than let it wrap below the page edge
  const noteSize = Math.min(7.5, (7.5 * (W - 2 * MX - 60)) / regular.widthOfTextAtSize(note, 7.5));
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: MX, y: 46 }, end: { x: W - MX, y: 46 }, thickness: 0.6, color: BRAND_200 });
    p.drawText(note, { x: MX, y: 32, size: noteSize, font: regular, color: BRAND_800 });
    const num = `Page ${i + 1} of ${pages.length}`;
    p.drawText(num, { x: W - MX - regular.widthOfTextAtSize(num, 7.5), y: 32, size: 7.5, font: regular, color: BRAND_800 });
  });
  return pdf.save();
}

export const reportFileName = (title: string) =>
  `verisavo-${title.normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").toLowerCase().slice(0, 50) || "report"}.pdf`;
