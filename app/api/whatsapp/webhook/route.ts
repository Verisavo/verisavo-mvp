import crypto from "node:crypto";
import { after } from "next/server";
import { released } from "@/lib/release";
import { viaKapso, webhookConfigured } from "@/lib/server/whatsapp/api";
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

// The raw body's signature, keyed with WHATSAPP_APP_SECRET. Meta sends "sha256=<hex>" in X-Hub-Signature-256 (key: the
// app secret). Kapso forwards Meta's payload unchanged ("Meta webhook" on the number) and sends a bare hex HMAC in
// X-Webhook-Signature (key: the secret_key we gave that webhook). Only the configured provider's header is accepted.
function signed(request: Request, raw: Buffer): boolean {
  const hex = crypto.createHmac("sha256", process.env.WHATSAPP_APP_SECRET!).update(raw).digest("hex");
  return viaKapso()
    ? safeEqual((request.headers.get("x-webhook-signature") ?? "").toLowerCase(), hex)
    : safeEqual(request.headers.get("x-hub-signature-256") ?? "", "sha256=" + hex);
}

// POST: messages. Anything without a valid signature is refused before it's parsed. We answer 200 straight away and write
// the reply afterwards, because Meta and Kapso retry slow deliveries (Kapso waits 10 s at most).
export async function POST(request: Request) {
  if (!released(4) || !webhookConfigured()) return new Response("Not found", { status: 404 });
  const raw = await readCapped(request);
  if (!raw) return new Response("Too large", { status: 413 });
  if (!signed(request, raw)) return new Response("Invalid signature", { status: 401 });
  let payload: unknown;
  try { payload = JSON.parse(raw.toString("utf8")); } catch { return new Response("Bad JSON", { status: 400 }); }
  after(() => handleWebhook(payload).catch(err => console.error("[whatsapp] webhook failed:", err instanceof Error ? err.name : "error")));
  return new Response("ok");
}
