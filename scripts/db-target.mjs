// Which database the scripts are about to touch. Supabase connection strings name their project either in the pooler
// user ("postgres.<ref>") or in the direct host ("db.<ref>.supabase.co"); comparing that ref tells dev from live.
import fs from "node:fs";

export function readUrl(file) {
  const line = fs.existsSync(file) && fs.readFileSync(file, "utf8").split(/\r?\n/).find(l => l.startsWith("DATABASE_URL_MIGRATE="));
  return line ? line.slice("DATABASE_URL_MIGRATE=".length).trim().replace(/^["']|["']$/g, "") : "";
}

export function projectRef(url) {
  try {
    const u = new URL(url);
    return u.username.split(".")[1] || u.hostname.match(/^db\.([a-z0-9]+)\./)?.[1] || u.hostname;
  } catch { return ""; }
}

// "same": .env.local points at the live project; "unknown": there's no .env.prod.local to compare with; "different": fine
export function devVersusLive() {
  const live = readUrl(".env.prod.local");
  if (!live) return "unknown";
  return projectRef(readUrl(".env.local")) === projectRef(live) ? "same" : "different";
}
