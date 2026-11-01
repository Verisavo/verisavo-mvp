import { released } from "@/lib/release";
import { googleEnabled } from "@/lib/server/auth";
import { json, notFound } from "@/lib/server/http";

// GET -> { google } : which extra sign-in buttons the dialog should show
export async function GET() {
  if (!released(1)) return notFound();
  return json({ google: await googleEnabled() });
}
