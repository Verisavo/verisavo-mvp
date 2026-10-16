import "./app.css";
import type { ReactNode } from "react";

// The app pages (assistant, dashboard, reset password, later admin). Only these pages load Tailwind.
export default function AccountLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
