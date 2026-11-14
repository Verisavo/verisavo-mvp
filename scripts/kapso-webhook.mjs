#!/usr/bin/env node
// Points Kapso at our WhatsApp webhook. It adds a "Meta webhook" on Verisavo's number: Kapso then forwards Meta's own
// payload to us unchanged, signed with WHATSAPP_APP_SECRET (header X-Webhook-Signature). Kapso allows one per number.
//
// Usage (from the repo root):
//   node scripts/kapso-webhook.mjs --env .env.prod.local                 list the number's webhooks
//   node scripts/kapso-webhook.mjs --env .env.prod.local --create        add ours: <APP_URL>/api/whatsapp/webhook
//
// Options:
//   --env <file>   file to read WHATSAPP_TOKEN (the Kapso API key), WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_APP_SECRET and
//                  APP_URL from; values already in the environment win (default .env.local)
//   --url <url>    webhook URL instead of <APP_URL>/api/whatsapp/webhook
//   --create       create the webhook (otherwise only list)
import fs from "node:fs";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    env: { type: "string", default: ".env.local" },
    url: { type: "string" },
    create: { type: "boolean", default: false },
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

const apiKey = readEnv("WHATSAPP_TOKEN");
const phoneId = readEnv("WHATSAPP_PHONE_NUMBER_ID");
const secret = readEnv("WHATSAPP_APP_SECRET");
const url = values.url || (readEnv("APP_URL").replace(/\/$/, "") + "/api/whatsapp/webhook");
const missing = [!apiKey && "WHATSAPP_TOKEN", !phoneId && "WHATSAPP_PHONE_NUMBER_ID", values.create && !secret && "WHATSAPP_APP_SECRET"].filter(Boolean);
if (missing.length) { console.error(`Missing ${missing.join(", ")} (environment or ${values.env}).`); process.exit(1); }
if (values.create && !/^https:\/\//.test(url)) { console.error(`The webhook URL must be https: ${url}`); process.exit(1); }

const endpoint = `https://api.kapso.ai/platform/v1/whatsapp/phone_numbers/${encodeURIComponent(phoneId)}/webhooks`;
const headers = { "X-API-Key": apiKey, "Content-Type": "application/json" };
// never print a secret back
const show = data => JSON.stringify(data, (k, v) => (/secret/i.test(k) && v ? "(hidden)" : v), 2);

const res = values.create
  ? await fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ whatsapp_webhook: { kind: "meta", url, secret_key: secret, active: true } }) })
  : await fetch(endpoint, { headers });
const data = await res.json().catch(() => null);
console.log(`${res.status} ${values.create ? `create Meta webhook → ${url}` : "webhooks on this number"}`);
console.log(show(data));
if (!res.ok) process.exit(1);
