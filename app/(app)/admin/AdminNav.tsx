"use client";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/knowledge", label: "Knowledge base" },
  { href: "/admin/activity", label: "Activity" }
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex items-center gap-1 overflow-x-auto">
      {LINKS.map(l => {
        const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
        return (
          <a key={l.href} href={l.href} aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap no-underline ${active ? "bg-brand-200 text-ink" : "text-brand-800 hover:bg-brand-100 hover:text-ink"}`}>
            {l.label}
          </a>
        );
      })}
    </nav>
  );
}
