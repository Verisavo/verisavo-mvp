import { released } from "@/lib/release";
import { getCurrentUser } from "@/lib/server/auth";
import { forbidden, json, notFound, tooMany } from "@/lib/server/http";
import { allow, LIMITS } from "@/lib/server/rate-limit";
import { getEntitlements, usageView } from "@/lib/server/entitlements";
import { ATTACH, AttachmentError, saveAttachment } from "@/lib/server/assistant/attachments";

export const maxDuration = 30;   // reading a large PDF or spreadsheet

// A multipart form can't use fromOurSite's JSON rule, so uploads require a same-site Origin (browsers always send one)
function sameSite(request: Request): boolean {
  const origin = request.headers.get("origin");
  try { return Boolean(origin) && new URL(origin!).host === request.headers.get("host"); } catch { return false; }
}

// POST multipart { file } (M3.6, paid only) -> { attachment: { id, kind, name, size, truncated } }
// One file per request; the question then sends the ids. Uploading doesn't count as a message (decision D4).
export async function POST(request: Request) {
  if (!released(3)) return notFound();
  if (!sameSite(request)) return forbidden();
  const user = await getCurrentUser();
  if (!user) return json({ error: "signed_out" }, 401);
  const ent = await getEntitlements(user.id);
  if (!ent.features.uploads) return json({ error: "limit_reached", reason: "feature_requires_subscription", usage: usageView(ent) }, 402);
  if (Number(request.headers.get("content-length") ?? 0) > ATTACH.MAX_BYTES + 256 * 1024) return json({ error: "too_large", message: "That file is larger than 4 MB." }, 413);
  if (!(await allow(LIMITS.upload(user.id)))) return json({ error: "rate_limited", message: "You’ve attached a lot of files in the last hour. Please wait a while and try again." }, 429);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return json({ error: "no_file", message: "Choose a file to attach." }, 400);
  try {
    return json({ attachment: await saveAttachment(user.id, file) });
  } catch (err) {
    if (err instanceof AttachmentError) return json({ error: "unreadable", message: err.message }, 422);
    console.error("[assistant/attachments] failed:", err instanceof Error ? err.name : "error");
    return json({ error: "failed", message: "That file couldn’t be attached. Please try again." }, 500);
  }
}
