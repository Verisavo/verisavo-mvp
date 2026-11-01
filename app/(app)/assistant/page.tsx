import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { released } from "@/lib/release";
import { requireUser } from "@/lib/server/auth";
import { getEntitlements, usageView } from "@/lib/server/entitlements";
import { getConversation, listConversations } from "@/lib/server/assistant/conversations";
import Assistant from "./Assistant";

export const metadata: Metadata = {
  title: "Verisavo Intelligence Assistant",
  description: "Ask Verisavo about African markets, competitors and decisions.",
  robots: { index: false, follow: false }
};

// The Intelligence Assistant: signed-in users only (Haider, 2026-10-16; free questions need a free account).
// Signed-out visitors are sent to sign in, then come back here.
export default async function AssistantPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();   // depends on the signed-in user, so render per request
  if (!released(1)) notFound();
  const user = await requireUser();
  // answers, saved conversations and the plan's limits arrive with M3; before that the page says it isn't connected
  const live = released(3);
  const [usage, convs] = live ? await Promise.all([getEntitlements(user.id).then(usageView), listConversations(user.id)]) : [null, []];
  // ?c=<id> opens one of the user's own chats, even one too old for the sidebar's list
  const { c } = await searchParams;
  const asked = live && typeof c === "string" && /^[0-9a-f-]{36}$/i.test(c) ? await getConversation(user.id, c) : null;
  const list = convs.map(x => ({ id: x.id, title: x.title }));
  if (asked && !list.some(x => x.id === asked.id)) list.push({ id: asked.id, title: asked.title });
  return <Assistant user={{ id: user.id, name: user.profile.name, email: user.email }} live={live} usage={usage} conversations={list} openId={asked?.id} />;
}
