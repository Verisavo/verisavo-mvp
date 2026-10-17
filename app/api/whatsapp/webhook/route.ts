import crypto from "node:crypto";
import { after } from "next/server";
import { released } from "@/lib/release";
import { webhookConfigured } from "@/lib/server/whatsapp/api";
import { handleWebhook } from "@/lib/server/whatsapp/handle";

// The WhatsApp Cloud API webhook (M4.1). Not behind the session proxy (see proxy.ts).
export const maxDuration = 120;   // the reply is written after the 200, inside this time (the answer itself stops at 75 s)
const MAX_BODY = 1024 * 1024;

// The body, read with a running count so a chunked request can't get past the cap
async function readCapped(request: Request): Promise<Buffer | null> {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY || !request.body) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  const reader = request.body.getReader();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_BODY) { await reader.cancel().catch(() => {}); return null; }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// GET: Meta checks the URL once, with the verify token we entered in the app settings
export async function GET(request: Request) {
  if (!released(4)) return new Response("Not found", { status: 404 });
  const p = new URL(request.url).searchParams;
  const token = process.env.WHATSAPP_VERIFY_TOKEN ?? "";
  if (p.get("hub.mode") === "subscribe" && token && safeEqual(p.get("hub.verify_token") ?? "", token)) {
    return new Response(p.get("hub.challenge") ?? "", { headers: { "Content-Type": "text/plain" } });
  }
  return new Response("Forbidden", { status: 403 });
}

// POST: messages. Meta signs the raw body with the app secret; anything else is refused before it's read. We answer
// 200 straight away and write the reply afterwards, because Meta retries slow deliveries.
export async function POST(request: Request) {
  if (!released(4) || !webhookConfigured()) return new Response("Not found", { status: 404 });
  const raw = await readCapped(request);
  if (!raw) return new Response("Too large", { status: 413 });
  const want = "sha256=" + crypto.createHmac("sha256", process.env.WHATSAPP_APP_SECRET!).update(raw).digest("hex");
  if (!safeEqual(request.headers.get("x-hub-signature-256") ?? "", want)) return new Response("Invalid signature", { status: 401 });
  let payload: unknown;
  try { payload = JSON.parse(raw.toString("utf8")); } catch { return new Response("Bad JSON", { status: 400 }); }
  after(() => handleWebhook(payload).catch(err => console.error("[whatsapp] webhook failed:", err instanceof Error ? err.name : "error")));
  return new Response("ok");
}
