import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { released } from "@/lib/release";
import { getCurrentUser, type CurrentUser } from "@/lib/server/auth";
import { createSupabase } from "@/lib/server/supabase";

// For every admin page and action. Anyone who isn't an admin gets a plain 404, so the admin area isn't advertised.
// Admin actions matter more than everyday ones, so besides the token check the session is confirmed with Supabase
// (getUser), which also catches a session that was signed out or revoked.
export const requireAdmin = cache(async (): Promise<CurrentUser> => {
  if (!released(2)) notFound();
  const user = await getCurrentUser();
  if (!user) redirect("/platform#signin");
  if (user.profile.role !== "admin") notFound();
  const { data, error } = await (await createSupabase()).auth.getUser();
  if (error || data.user?.id !== user.id) redirect("/platform#signin");
  return user;
});
