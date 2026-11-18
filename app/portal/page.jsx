import HomeShell from "@/components/home/HomeShell";

export const metadata = {
  title: "SavoScout opportunities | Verisavo",
  description: "Open research roles and tasks for SavoScouts. Find work you can do from anywhere and apply in about a minute.",
  alternates: { canonical: "/portal" }
};

export default function Page() {
  return <HomeShell start="portal" />;
}
