#!/usr/bin/env node
// Posts a signed fake WhatsApp Cloud API "messages" webhook to the local app,
// so the WhatsApp route can be tested without Meta.
//
// Usage (from the repo root, dev server running):
//   node scripts/whatsapp-fake-inbound.mjs [options]
//
// Options:
//   --from <digits>   sender number, digits only        (default 447700900123)
//   --text <text>     message body                      (default "Hello Verisavo")
//   --id <wamid>      message id; reuse one to test dedupe (default: random)
//   --url <url>       webhook URL  (default http://localhost:3000/api/whatsapp/webhook)
//   --env <file>      file to read WHATSAPP_APP_SECRET from (default .env.local)
//   --bad-sig         sign with a wrong secret; the route must answer 401
//   --kapso           sign like Kapso (X-Webhook-Signature, bare hex). Automatic when WHATSAPP_PROVIDER=kapso.
import crypto from "node:crypto";
import fs from "node:fs";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    from: { type: "string", default: "447700900123" },
    text: { type: "string", default: "Hello Verisavo" },
    id: { type: "string" },
    url: { type: "string", default: "http://localhost:3000/api/whatsapp/webhook" },
    env: { type: "string", default: ".env.local" },
    "bad-sig": { type: "boolean", default: false },
    kapso: { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
});

if (values.help) {
  console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("\n").filter(l => l.startsWith("//")).map(l => l.slice(3)).join("\n"));
  process.exit(0);
}

function readEnv(key) {
  if (process.env[key]) return process.env[key];
  try {
    const line = fs.readFileSync(values.env, "utf8").split(/\r?\n/).find(l => l.startsWith(key + "="));
    if (line) return line.slice(key.length + 1).trim().replace(/^["']|["']$/g, "");
  } catch {}
  return "";
}

const secret = readEnv("WHATSAPP_APP_SECRET");
if (!secret && !values["bad-sig"]) {
  console.error(`WHATSAPP_APP_SECRET is not set. Export it or add it to ${values.env}.`);
  process.exit(1);
}

const id = values.id || "wamid.TEST" + crypto.randomBytes(6).toString("hex");
const payload = {
  object: "whatsapp_business_account",
  entry: [{
    id: "TEST_WABA_ID",
    changes: [{
      field: "messages",
      value: {
        messaging_product: "whatsapp",
        metadata: { display_phone_number: "15550000000", phone_number_id: readEnv("WHATSAPP_PHONE_NUMBER_ID") || "TEST_PHONE_NUMBER_ID" },
        contacts: [{ profile: { name: "Test User" }, wa_id: values.from }],
        messages: [{ from: values.from, id, timestamp: String(Math.floor(Date.now() / 1000)), type: "text", text: { body: values.text } }],
      },
    }],
  }],
};

const body = JSON.stringify(payload);
const key = values["bad-sig"] ? "wrong-secret" : secret;
const hex = crypto.createHmac("sha256", key).update(body).digest("hex");
const kapso = values.kapso || readEnv("WHATSAPP_PROVIDER") === "kapso";
const signature = kapso ? { "X-Webhook-Signature": hex } : { "X-Hub-Signature-256": "sha256=" + hex };

const res = await fetch(values.url, {
  method: "POST",
  headers: { "Content-Type": "application/json", ...signature },
  body,
});
const text = (await res.text()).replace(/\s+/g, " ");
console.log(`${res.status} ${text.length > 200 ? text.slice(0, 200) + "…" : text}  (message id ${id}, from ${values.from})`);
