import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/server/admin";
import AccountHeader from "../AccountHeader";
import AdminNav from "./AdminNav";

export const metadata: Metadata = {
  title: "Admin · Verisavo",
  robots: { index: false, follow: false }
};

// The admin dashboard (M2). Every page and action also calls requireAdmin() itself.
export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireAdmin();
  return (
    <>
      <AccountHeader>
        <span className="rounded-md bg-ink px-2 py-1 text-[11px] font-semibold tracking-[.08em] text-white uppercase">{"Admin"}</span>
        <a className="btn btn-ghost max-sm:hidden" href="/dashboard">{"Your dashboard"}</a>
      </AccountHeader>
      <div className="border-b border-brand-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-2"><AdminNav /></div>
      </div>
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 pt-8 pb-20">{children}</main>
    </>
  );
}
