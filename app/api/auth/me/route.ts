import { released } from "@/lib/release";
import { getCurrentUser, publicUser } from "@/lib/server/auth";
import { json, notFound } from "@/lib/server/http";

// GET -> { user } for the signed-in user, or { user: null }. The pages call this on load to restore the session.
export async function GET() {
  if (!released(1)) return notFound();
  const user = await getCurrentUser();
  return json({ user: user ? publicUser(user, user.profile) : null });
}
