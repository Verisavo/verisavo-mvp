import type { ReactNode } from "react";

export default function AccountHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 border-b border-brand-200 bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-3">
        <a href="/" className="mr-auto font-serif text-[1.4rem] leading-none tracking-tight no-underline">{"Verisavo"}</a>
        {children}
      </div>
    </header>
  );
}
