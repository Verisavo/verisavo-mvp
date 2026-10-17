// M2: the knowledge base (upload, publish, search, edit re-embeds, market tags, archive) through the admin pages.
// Needs a search key (Gemini or OpenAI). Uses its own uniquely named document and removes it afterwards.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { Client, cleanup, configured, createUser, pdf, sql } from "./helpers.mjs";

const skip = !configured.search && "needs GOOGLE_GENERATIVE_AI_API_KEY or OPENAI_API_KEY for knowledge search";
const TAG = `e2e-kb-${Date.now()}`;
const admin = new Client();
let docId;

before(async () => { await admin.login(await createUser({ admin: true })); });
after(async () => {
  await sql`delete from kb_documents where title like ${TAG + "%"}`;
  await cleanup();
  await sql.end({ timeout: 2 });
});

// "Try a question" on the knowledge-base page: the results list after the form, as [{ id, title, pct }]
async function search(q, market = "All markets") {
  const r = await admin.submit("/admin/knowledge", 'name="q"', { q, market });
  const list = r.text.slice(r.text.indexOf('name="q"')).match(/<ol[\s\S]*?<\/ol>/)?.[0] ?? "";
  return [...list.matchAll(/href="\/admin\/knowledge\/([0-9a-f-]+)">([^<]+)<\/a>[\s\S]*?match (\d+)%/g)].map(m => ({ id: m[1], title: m[2], pct: Number(m[3]) }));
}
const status = text => [...text.matchAll(/role="status"[^>]*>([^<]+)</g)].map(m => m[1]).join(" | ");

test("a PDF upload becomes a draft with its text extracted", { skip }, async () => {
  const file = new File([pdf([[`${TAG}: Zorvex field notes`, "Zorvex laundry soap sells best in Tamale markets.", "Traders restock it every Thursday."]])], `${TAG}.pdf`);
  const r = await admin.submit("/admin/knowledge", "Add as draft", { title: TAG, file, body: "" }, "/admin/knowledge");
  assert.ok([303, 307].includes(r.status) && r.location.includes("/admin/knowledge/"), `upload → ${r.status} ${r.location}`);
  docId = r.location.match(/knowledge\/([0-9a-f-]{36})/)[1];
  const page = (await admin.page(`/admin/knowledge/${docId}`)).html;
  assert.match(page, /Zorvex laundry soap sells best in Tamale markets\./);
});

test("drafts aren't searchable; publishing makes the document findable", { skip }, async () => {
  assert.ok(!(await search("Where does Zorvex laundry soap sell best?")).some(h => h.id === docId), "a draft is not found");
  const r = await admin.submit(`/admin/knowledge/${docId}`, 'value="publish"', { op: "publish" });
  assert.match(status(r.text), /^Published:/);
  const [chunk] = await sql`select count(*)::int n, min(vector_dims(embedding)) dims from kb_chunks where document_id = ${docId}`;
  assert.ok(chunk.n >= 1 && chunk.dims === 1536);
  const hits = await search("Where does Zorvex laundry soap sell best?");
  assert.equal(hits[0]?.id, docId, JSON.stringify(hits));
});

test("an unrelated question finds nothing (the match cut-off works)", { skip }, async () => {
  const hits = await search("What is the best way to bake sourdough bread at home?");
  assert.ok(!hits.some(h => h.id === docId), JSON.stringify(hits));
});

test("editing a published document re-embeds it; market tags filter search", { skip }, async () => {
  const [v] = await sql`select v.body from kb_versions v join kb_documents d on d.current_version_id = v.id where d.id = ${docId}`;
  const r = await admin.submit(`/admin/knowledge/${docId}`, "Save changes", { title: TAG, body: v.body + "\n\nZorvex also launched a lemon scent in Kumasi.", markets: "Ghana" });
  assert.match(status(r.text), /search now uses the new version/);
  assert.equal((await search("Did Zorvex launch a new scent in Kumasi?", "Ghana"))[0]?.id, docId);
  assert.ok(!(await search("Did Zorvex launch a new scent in Kumasi?", "Nigeria")).some(h => h.id === docId), "a Ghana-only document isn't used for Nigeria");
});

test("archiving removes the document from search at once; restore makes it a draft", { skip }, async () => {
  const r = await admin.submit(`/admin/knowledge/${docId}`, 'value="archive"', { op: "archive" });
  assert.match(status(r.text), /^Archived/);
  assert.ok(!(await search("Where does Zorvex laundry soap sell best?")).some(h => h.id === docId));
  const [n] = await sql`select count(*)::int n from kb_chunks where document_id = ${docId}`;
  assert.equal(n.n, 0);
  const p = await admin.submit(`/admin/knowledge/${docId}`, 'value="restore"', { op: "publish" });   // publishing an archived document
  assert.match(status(p.text), /archived\. Restore it/);
  const back = await admin.submit(`/admin/knowledge/${docId}`, 'value="restore"', { op: "restore" });
  assert.match(status(back.text), /^Restored as a draft/);
});

test("uploads that can't be read are refused with a clear message", { skip }, async () => {
  const scanned = await admin.submit("/admin/knowledge", "Add as draft", { title: TAG + "-scan", file: new File([pdf([[]])], "scan.pdf"), body: "" }, "/admin/knowledge");
  assert.match(status(scanned.text), /couldn't find any text/);
  const broken = await admin.submit("/admin/knowledge", "Add as draft", { title: TAG + "-broken", file: new File([Buffer.from("%PDF-1.4\nnot really")], "broken.pdf"), body: "" }, "/admin/knowledge");
  assert.match(status(broken.text), /couldn't read that file/);
});
