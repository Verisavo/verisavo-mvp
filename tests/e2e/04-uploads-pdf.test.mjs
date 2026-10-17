// M3.6 and M3.7: subscribers' file and image uploads (used as context, limits enforced on the server) and PDF reports.
// The answer test needs AI keys (one short answer); the rest doesn't.
import { createRequire } from "node:module";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import zlib from "node:zlib";
import { Client, cleanup, configured, createUser, pdf, png, sql, uuid } from "./helpers.mjs";

const JSZip = createRequire(import.meta.url)("jszip");
const { PDFDocument } = createRequire(import.meta.url)("pdf-lib");
const paid = new Client(), free = new Client();
let paidUser;
before(async () => {
  paidUser = await createUser({ paid: true });
  await paid.login(paidUser);
  await free.login(await createUser());
});
after(async () => { await cleanup(); await sql.end({ timeout: 2 }); });

async function xlsx() {
  const z = new JSZip();
  z.file("xl/workbook.xml", '<workbook><sheets><sheet name="Prices" sheetId="1" r:id="rId1"/></sheets></workbook>');
  z.file("xl/_rels/workbook.xml.rels", '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>');
  z.file("xl/sharedStrings.xml", "<sst><si><t>City</t></si><si><t>Price per crate (USD)</t></si><si><t>Lagos</t></si><si><t>Accra</t></si></sst>");
  z.file("xl/worksheets/sheet1.xml", '<worksheet><sheetData><row><c t="s"><v>0</v></c><c t="s"><v>1</v></c></row><row><c t="s"><v>2</v></c><c><v>42</v></c></row><row><c t="s"><v>3</v></c><c><v>37.5</v></c></row></sheetData></worksheet>');
  return z.generateAsync({ type: "nodebuffer" });
}
async function pptx() {
  const z = new JSZip();
  z.file("ppt/slides/slide1.xml", "<p:sld><a:p><a:r><a:t>Kumasi launch plan</a:t></a:r></a:p><a:p><a:r><a:t>Target: 120 shops in the first quarter</a:t></a:r></a:p></p:sld>");
  return z.generateAsync({ type: "nodebuffer" });
}
// a zip whose header claims 100 bytes but unpacks to 300 MB
function lyingZip() {
  const raw = Buffer.alloc(300 * 1024 * 1024, 0x61), comp = zlib.deflateRawSync(raw, { level: 9 }), fn = Buffer.from("ppt/slides/slide1.xml");
  const lfh = Buffer.alloc(30); lfh.writeUInt32LE(0x04034b50, 0); lfh.writeUInt16LE(20, 4); lfh.writeUInt16LE(8, 8); lfh.writeUInt32LE(comp.length, 18); lfh.writeUInt32LE(100, 22); lfh.writeUInt16LE(fn.length, 26);
  const cdh = Buffer.alloc(46); cdh.writeUInt32LE(0x02014b50, 0); cdh.writeUInt16LE(20, 4); cdh.writeUInt16LE(20, 6); cdh.writeUInt16LE(8, 10); cdh.writeUInt32LE(comp.length, 20); cdh.writeUInt32LE(100, 24); cdh.writeUInt16LE(fn.length, 28);
  const eocd = Buffer.alloc(22); eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(1, 8); eocd.writeUInt16LE(1, 10); eocd.writeUInt32LE(46 + fn.length, 12); eocd.writeUInt32LE(30 + fn.length + comp.length, 16);
  return Buffer.concat([lfh, fn, comp, cdh, fn, eocd]);
}
const stored = async id => (await sql`select kind, text from attachments where id = ${id}`)[0];

test("subscribers can attach PDF, Excel, PowerPoint, CSV and images; text is extracted", async () => {
  for (const [name, bytes, kind, expect] of [
    ["notes.pdf", pdf([["Ikeja and Lekki led retail growth."]]), "document", "Ikeja and Lekki"],
    ["prices.xlsx", await xlsx(), "document", "Lagos | 42"],
    ["plan.pptx", await pptx(), "document", "Slide 1\nKumasi launch plan"],
    ["notes.csv", Buffer.from("market,channel\nNairobi,M-Pesa\n"), "document", "Nairobi,M-Pesa"],
    ["red.png", png(32, 32, [220, 30, 30]), "image", null]
  ]) {
    const u = await paid.upload(name, bytes);
    assert.equal(u.status, 200, `${name}: ${u.data?.message}`);
    const row = await stored(u.data.attachment.id);
    assert.equal(row.kind, kind);
    if (expect) assert.ok(row.text.includes(expect), `${name}: ${row.text.slice(0, 60)}`);
  }
});

test("uploads that are unsafe or out of limits are refused", async () => {
  assert.equal((await paid.upload("fake.png", Buffer.from("not an image"))).status, 422);
  assert.equal((await paid.upload("virus.exe", Buffer.from("MZ"))).status, 422);
  const bomb = await paid.upload("bomb.pptx", lyingZip());
  assert.equal(bomb.status, 422);
  assert.match(bomb.data.message, /too large once unpacked/);
  const big = await paid.upload("huge.png", Buffer.concat([png(1, 1, [0, 0, 0]).subarray(0, 8), Buffer.alloc(3.8 * 1024 * 1024)]));
  assert.match(big.data.message, /3\.5 MB/);
  assert.equal((await paid.upload("prices.xlsx", await xlsx(), { origin: "https://evil.example" })).status, 403);
  assert.equal((await paid.upload("prices.xlsx", await xlsx(), { origin: null })).status, 403);
});

test("the free plan can't upload files or download PDFs", async () => {
  const u = await free.upload("notes.csv", Buffer.from("a,b\n1,2\n"));
  assert.equal(u.status, 402);
  assert.equal(u.data.reason, "feature_requires_subscription");
});

test("attached files are used to answer, and a PDF report can be downloaded", { skip: !(configured.answers && configured.search) && "needs AI keys" }, async () => {
  const sheet = (await paid.upload("prices.xlsx", await xlsx())).data.attachment.id;
  const image = (await paid.upload("red.png", png(48, 48, [210, 25, 25]))).data.attachment.id;
  const a = await paid.ask("From my spreadsheet, what is the Lagos price per crate? And what colour is my image?", { attachmentIds: [sheet, image] });
  assert.equal(a.end?.type, "done", JSON.stringify(a.end));
  assert.match(a.text, /42/);
  assert.match(a.text, /red/i);
  // files belong to that conversation and that user
  assert.equal((await paid.ask("Again", { attachmentIds: [sheet] })).status, 400);
  assert.equal((await paid.ask("Too many", { attachmentIds: Array.from({ length: 6 }, uuid) })).status, 400);
  const conv = a.start.conversationId;
  // PDF of the whole conversation and of one answer
  const r = await paid.req("GET", `/api/assistant/conversations/${conv}/pdf`);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("content-type"), "application/pdf");
  assert.match(r.headers.get("content-disposition") ?? "", /attachment; filename="verisavo-.*\.pdf"/);
  assert.ok((await PDFDocument.load(Buffer.from(await r.arrayBuffer()))).getPageCount() >= 1);
  const one = await paid.req("GET", `/api/assistant/conversations/${conv}/pdf?message=${a.end.messageId}`);
  assert.equal(one.status, 200);
  assert.equal((await free.req("GET", `/api/assistant/conversations/${conv}/pdf`)).status, 402, "the free plan gets 402 (before the ownership check)");
  assert.equal((await paid.req("GET", `/api/assistant/conversations/${uuid()}/pdf`)).status, 404);
});
