import "server-only";

// The WhatsApp Cloud API (M4, see the verisavo-whatsapp skill): send text, send the code template, mark as read, and
// download media. WHATSAPP_API_BASE can point at a local stand-in for tests; without WHATSAPP_TOKEN nothing is sent
// and the message is logged instead (development without Meta).

const MAX_TEXT = 4096;   // WhatsApp's limit for one text message
const MAX_MEDIA_BYTES = 4 * 1024 * 1024;

const GRAPH = "https://graph.facebook.com";
// the stand-in is for local tests only: a production build always talks to Meta, so the token can't be sent elsewhere
const testBase = () => (process.env.NODE_ENV !== "production" && process.env.WHATSAPP_API_BASE ? process.env.WHATSAPP_API_BASE : "");
const cfg = () => ({
  base: (testBase() || GRAPH).replace(/\/$/, ""),
  version: process.env.WHATSAPP_GRAPH_VERSION || "v23.0",
  token: process.env.WHATSAPP_TOKEN ?? "",
  phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? ""
});

// The webhook can only be trusted with the app secret; sending needs the token and the sender's phone number id
export const webhookConfigured = () => Boolean(process.env.WHATSAPP_APP_SECRET);
export const sendingConfigured = () => Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
// Verisavo's own number, digits only, for wa.me links
export const verisavoNumber = () => (process.env.WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
export const waLink = (text?: string) => `https://wa.me/${verisavoNumber()}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

async function post(payload: object): Promise<boolean> {
  const { base, version, token, phoneId } = cfg();
  if (!token || !phoneId) {   // no message text or full number in the logs
    const p = payload as { to?: string; type?: string; status?: string };
    console.info("[whatsapp] not configured, would send:", p.type ?? p.status ?? "message", "to", p.to ? `…${p.to.slice(-4)}` : "-");
    return false;
  }
  try {
    const r = await fetch(`${base}/${version}/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
      signal: AbortSignal.timeout(15_000)
    });
    if (!r.ok) console.error("[whatsapp] send failed:", r.status, (await r.text()).slice(0, 200));
    return r.ok;
  } catch (err) {
    console.error("[whatsapp] send failed:", err instanceof Error ? err.name : "error");
    return false;
  }
}

// Long answers are split at paragraph breaks (then lines, then hard cuts) to fit 4096 characters per message
export function splitText(text: string, max = MAX_TEXT): string[] {
  const parts: string[] = [];
  let rest = text.trim();
  while (rest.length > max) {
    let cut = rest.lastIndexOf("\n\n", max);
    if (cut < max / 2) cut = rest.lastIndexOf("\n", max);
    if (cut < max / 2) cut = rest.lastIndexOf(" ", max);
    if (cut < max / 2) cut = max;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

export async function sendText(to: string, body: string): Promise<boolean> {
  let ok = true;
  for (const part of splitText(body)) ok = (await post({ recipient_type: "individual", to, type: "text", text: { preview_url: false, body: part } })) && ok;
  return ok;
}

// An approved AUTHENTICATION template with a copy-code button: the code goes in the body and in the button
export async function sendCodeTemplate(to: string, code: string): Promise<boolean> {
  return post({
    to, type: "template",
    template: {
      name: process.env.WHATSAPP_OTP_TEMPLATE,
      language: { code: process.env.WHATSAPP_OTP_TEMPLATE_LANG || "en" },
      components: [
        { type: "body", parameters: [{ type: "text", text: code }] },
        { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: code }] }
      ]
    }
  });
}

// Blue ticks and a typing indicator while the answer is being written (best effort)
export const markRead = (messageId: string) => post({ status: "read", message_id: messageId, typing_indicator: { type: "text" } });

// Media sent to us: Meta gives a short-lived URL for the media id; the bearer token is only ever sent to Meta's hosts
// (or the configured test stand-in)
function trustedMediaHost(url: string): boolean {
  try {
    const u = new URL(url);
    if (testBase() && u.host === new URL(testBase()).host) return true;
    return u.protocol === "https:" && /(^|\.)(fbsbx\.com|facebook\.com|whatsapp\.net|fbcdn\.net)$/.test(u.hostname);
  } catch { return false; }
}

export async function downloadMedia(mediaId: string): Promise<{ bytes: Uint8Array<ArrayBuffer>; mimeType: string } | { error: string }> {
  const { base, version, token } = cfg();
  if (!token) return { error: "not_configured" };
  try {
    const info = await fetch(`${base}/${version}/${encodeURIComponent(mediaId)}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15_000) });
    if (!info.ok) return { error: `info_${info.status}` };
    const meta = await info.json() as { url?: string; mime_type?: string; file_size?: number };
    if (!meta.url || !trustedMediaHost(meta.url)) return { error: "bad_url" };
    if ((meta.file_size ?? 0) > MAX_MEDIA_BYTES) return { error: "too_large" };
    const file = await fetch(meta.url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20_000) });
    if (!file.ok) return { error: `download_${file.status}` };
    if (Number(file.headers.get("content-length") ?? 0) > MAX_MEDIA_BYTES) return { error: "too_large" };
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.length > MAX_MEDIA_BYTES) return { error: "too_large" };
    return { bytes, mimeType: meta.mime_type ?? file.headers.get("content-type") ?? "application/octet-stream" };
  } catch (err) {
    return { error: err instanceof Error ? err.name : "error" };
  }
}
