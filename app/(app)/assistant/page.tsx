import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { released } from "@/lib/release";
import { requireUser } from "@/lib/server/auth";
import { getEntitlements, usageView } from "@/lib/server/entitlements";
import { listConversations } from "@/lib/server/assistant/conversations";
import Assistant from "./Assistant";

export const metadata: Metadata = {
  title: "Verisavo Intelligence Assistant",
  description: "Ask Verisavo about African markets, competitors and decisions.",
  robots: { index: false, follow: false }
};

// The Intelligence Assistant: signed-in users only (Haider, 2026-10-16; free questions need a free account).
// Signed-out visitors are sent to sign in, then come back here.
export default async function AssistantPage() {
  await connection();   // depends on the signed-in user, so render per request
  if (!released(1)) notFound();
  const user = await requireUser();
  // answers, saved conversations and the plan's limits arrive with M3; before that the page says it isn't connected
  const live = released(3);
  const [usage, convs] = live ? await Promise.all([getEntitlements(user.id).then(usageView), listConversations(user.id)]) : [null, []];
  return <Assistant user={{ id: user.id, name: user.profile.name, email: user.email }} live={live} usage={usage} conversations={convs.map(c => ({ id: c.id, title: c.title }))} />;
}
