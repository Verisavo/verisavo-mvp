#!/usr/bin/env node
// Builds the public website from the client's single-file design (site/source/verisavo.html) into public/site/.
//
//   index.html     → /           home, product, about, insights, pricing, careers, community, contact, demo
//   assistant.html → /platform   Ask Verisavo product page with the Assistant inside it (/assistant opens the Assistant)
//   docs.html      → /docs
//   apply.html     → /apply      careers application
//
// What it does to the client's pages:
//   1. unpacks the four pages and the music from the single file
//   2. moves the large embedded images and audio into hashed files under public/site/a/ (the pages load ~5 MB less)
//   3. points links between pages at real URLs, and replaces the single-file router with a real one
//   4. applies the patches in site/patches.mjs: these switch the demo flows to the real backend through
//      site/live.js (sign-in, the Assistant, conversations, uploads, PDF, billing) and show "Coming soon" for
//      features that aren't built (SavoScouts, investigations, credits, company knowledge, workspaces)
//
// Every patch must match exactly what it expects, otherwise the build stops and names it. When the client sends a
// new version: copy it over site/source/verisavo.html, run `npm run site:build`, and fix any patch it names.
//
// Run: npm run site:build   (it also runs before `next dev` and `next build`)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { patches } from "../site/patches.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const SRC = path.join(ROOT, "site/source/verisavo.html");
const OUT = path.join(ROOT, "public/site");
const ASSETS = path.join(OUT, "a");
const URLS = { "index.html": "/", "assistant.html": "/platform", "docs.html": "/docs", "apply.html": "/apply" };
const MIN_EXTERNAL = 3000;   // data URIs smaller than this stay inline (icons, the favicon)

// a JSON object literal that starts at `from` (the shell writes the pages as one)
function readObject(text, marker) {
  const start = text.indexOf(marker);
  if (start < 0) throw new Error(`build-site: "${marker}" not found in ${SRC}`);
  const i = start + marker.length;
  let depth = 0, inStr = false, esc = false, j = i;
  for (; j < text.length; j++) {
    const c = text[j];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true; else if (c === "{") depth++; else if (c === "}" && !--depth) break;
  }
  return JSON.parse(text.slice(i, j + 1));
}

const EXT = { "image/webp": "webp", "image/png": "png", "image/jpeg": "jpg", "image/svg+xml": "svg", "audio/wav": "wav", "audio/mpeg": "mp3", "image/gif": "gif" };
const written = new Set();
function asset(bytes, ext) {
  const name = crypto.createHash("sha256").update(bytes).digest("hex").slice(0, 16) + "." + ext;
  if (!written.has(name)) { fs.writeFileSync(path.join(ASSETS, name), bytes); written.add(name); }
  return "/site/a/" + name;
}
function externalise(html) {
  return html.replace(/data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)/g, (all, mime, b64) => {
    if (all.length < MIN_EXTERNAL || !EXT[mime]) return all;
    return asset(Buffer.from(b64, "base64"), EXT[mime]);
  });
}

// links between pages: "index.html#about-us" → "/#about-us", "apply.html?role=x" → "/apply?role=x"
function relink(html) {
  return html.replace(/(["'(=])(index|assistant|docs|apply)\.html(?=[#?"'\\)])/g, (_, pre, name) => pre + URLS[name + ".html"]);
}

const ROUTER = `/* links between the site's pages (replaces the single-file router): real URLs, and same-page hashes stay in place */
(function () {
  var MAP = ${JSON.stringify(URLS)};
  function norm(u) {
    u = String(u || "");
    var m = /^(index|assistant|docs|apply)\\.html(.*)$/.exec(u);
    return m ? MAP[m[1] + ".html"] + m[2] : u;
  }
  window.vsGo = function (u) {
    u = norm(u);
    if (/^https?:/.test(u) && u.indexOf(location.origin) !== 0) { window.open(u, "_blank", "noopener"); return; }
    var b = u.split("#")[0].split("?")[0], hash = u.indexOf("#") >= 0 ? u.slice(u.indexOf("#")) : "";
    if ((b === "" || b === location.pathname) && hash && u.indexOf("?") < 0) { location.hash = hash; return; }
    location.href = u;
  };
})();`;

function applyPatches(name, html) {
  for (const p of patches.filter(p => p.page === name || p.page === "*" || (Array.isArray(p.page) && p.page.includes(name)))) {
    if (p.from) {   // a region: from the start of `from` up to (not including) the next `to`
      const a = html.indexOf(p.from), b = a < 0 ? -1 : html.indexOf(p.to, a + p.from.length);
      if (a < 0 || b < 0 || html.indexOf(p.from, a + 1) >= 0) throw new Error(`build-site: patch "${p.name}" on ${name}: region not found exactly once. The client's page changed here; update site/patches.mjs.`);
      html = html.slice(0, a) + p.replace + html.slice(b);
      continue;
    }
    const finds = Array.isArray(p.find) ? p.find : [p.find];
    for (const find of finds) {
      const count = find instanceof RegExp ? (html.match(new RegExp(find.source, find.flags.includes("g") ? find.flags : find.flags + "g")) || []).length : html.split(find).length - 1;
      const want = p.count ?? 1;
      if (want === "any" ? count < 1 : count !== want) throw new Error(`build-site: patch "${p.name}" on ${name} matched ${count} time(s), expected ${want}. The client's page changed here; update site/patches.mjs.`);
      html = find instanceof RegExp ? html.replace(find, p.replace) : html.split(find).join(typeof p.replace === "function" ? p.replace(find) : p.replace);
    }
  }
  return html;
}

const text = fs.readFileSync(SRC, "utf8");
const pages = readObject(text, "var PAGES = ");
const audio = readObject(text, "var AUDIO = ");
// empty the output folder (not delete it: on Windows the dev server or OneDrive may hold the folder itself open)
fs.mkdirSync(ASSETS, { recursive: true });
for (const dir of [ASSETS, OUT]) for (const f of fs.readdirSync(dir)) { const p = path.join(dir, f); if (fs.statSync(p).isFile()) fs.rmSync(p, { force: true }); }

// the music the pages ask the shell for (vsAsset) becomes a plain file
const music = Object.fromEntries(Object.entries(audio).map(([n, b64]) => [n, asset(Buffer.from(b64, "base64"), "mp3")]));

const live = fs.readFileSync(path.join(ROOT, "site/live.js"));
const liveUrl = "/site/live.js?v=" + crypto.createHash("sha256").update(live).digest("hex").slice(0, 10);
fs.writeFileSync(path.join(OUT, "live.js"), live);

let total = 0;
for (const [name, raw] of Object.entries(pages)) {
  if (!URLS[name]) { console.warn(`build-site: skipping unknown page ${name}`); continue; }
  let html = raw;
  html = html.replace("<!--VSHASH-->", "");
  html = html.replace(/window\.parent && window\.parent\.vsAsset \? window\.parent\.vsAsset\("([\w-]+\.mp3)"\) : "\1"/g, (_, n) => JSON.stringify(music[n] ?? "/" + n));
  html = externalise(html);
  html = relink(html);
  // the single-file router (one per page) → real links (after relink, which would rewrite the router's own map)
  const r0 = html.indexOf("/* single file: links between pages switch the page inside this file */");
  if (r0 < 0) throw new Error(`build-site: router not found in ${name}`);
  const r1 = html.indexOf("</script>", r0);
  html = html.slice(0, r0) + ROUTER + "\n" + html.slice(r1);
  html = applyPatches(name, html);
  // our runtime first, so the patched page scripts can call it; then our layout overrides (site/overrides/<page>.css).
  // They go in the head (anything appended after the client's last tag can be swallowed by it) and win over the
  // client's styles by specificity, not by order.
  const head = '<meta charset="utf-8">';
  if (!html.includes(head)) throw new Error(`build-site: ${name} has no ${head}`);
  const ov = path.join(ROOT, "site/overrides", name.replace(/\.html$/, ".css"));
  const icon = /<link rel="icon"[^>]*>/.exec(text)?.[0] ?? "";   // the client's favicon, for pages without one
  const iconTag = icon && !/rel="icon"/.test(html) ? "\n" + icon : "";
  const ovTag = fs.existsSync(ov) ? `\n<style data-vs-override>\n${fs.readFileSync(ov, "utf8")}\n</style>` : "";
  html = html.replace(head, `${head}\n<script src="${liveUrl}"></script>${iconTag}${ovTag}`);
  fs.writeFileSync(path.join(OUT, name), html);
  total += html.length;
  console.log(`site: ${URLS[name].padEnd(10)} ${name.padEnd(15)} ${(html.length / 1024).toFixed(0)} KB`);
}
console.log(`site: ${written.size} assets, pages ${(total / 1024 / 1024).toFixed(1)} MB (was ${(text.length / 1024 / 1024).toFixed(1)} MB in one file)`);
