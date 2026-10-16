import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { released } from "@/lib/release";
import { requireUser } from "@/lib/server/auth";
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
  return <Assistant user={{ id: user.id, name: user.profile.name, email: user.email }} />;
}
