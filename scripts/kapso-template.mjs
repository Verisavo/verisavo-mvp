#!/usr/bin/env node
// Creates, or checks, the WhatsApp AUTHENTICATION template that sends number-linking codes (WHATSAPP_OTP_TEMPLATE).
// Meta fixes the wording of authentication templates; we only choose the options:
//
//   *123456* is your verification code. For your security, do not share this code.
//   This code expires in 10 minutes.                                    [ Copy code ]
//
// Meta approves it in minutes to a day, and only for a verified business. When it shows APPROVED, set
// WHATSAPP_OTP_TEMPLATE=verisavo_link_code and WHATSAPP_OTP_TEMPLATE_LANG=en in Vercel and redeploy.
//
// Usage (from the repo root):
//   node scripts/kapso-template.mjs --env .env.prod.local             show the template and its status
//   node scripts/kapso-template.mjs --env .env.prod.local --create    submit it to Meta
//
// Options:
//   --env <file>    file to read WHATSAPP_TOKEN (the Kapso API key) and WHATSAPP_WABA_ID from (default .env.local)
//   --name <name>   template name (default verisavo_link_code)
//   --create        submit it (otherwise only show)
import fs from "node:fs";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    env: { type: "string", default: ".env.local" },
    name: { type: "string", default: "verisavo_link_code" },
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
const waba = readEnv("WHATSAPP_WABA_ID");
const missing = [!apiKey && "WHATSAPP_TOKEN", !waba && "WHATSAPP_WABA_ID"].filter(Boolean);
if (missing.length) { console.error(`Missing ${missing.join(", ")} (environment or ${values.env}).`); process.exit(1); }

const endpoint = `https://api.kapso.ai/meta/whatsapp/v24.0/${encodeURIComponent(waba)}/message_templates`;
const headers = { "X-API-Key": apiKey, "Content-Type": "application/json" };

// The code also goes in the copy-code button (lib/server/whatsapp/api.ts sendCodeTemplate); the app's codes last 10 minutes
const template = {
  name: values.name,
  language: "en",
  category: "AUTHENTICATION",
  components: [
    { type: "BODY", add_security_recommendation: true },
    { type: "FOOTER", code_expiration_minutes: 10 },
    { type: "BUTTONS", buttons: [{ type: "OTP", otp_type: "COPY_CODE", text: "Copy code" }] },
  ],
};

const res = values.create
  ? await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(template) })
  : await fetch(`${endpoint}?name=${encodeURIComponent(values.name)}`, { headers });
const data = await res.json().catch(() => null);
console.log(`${res.status} ${values.create ? `submit template "${values.name}"` : `template "${values.name}"`}`);
console.log(JSON.stringify(data, null, 2));
if (!res.ok) process.exit(1);
