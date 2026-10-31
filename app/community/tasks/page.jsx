import HomeShell from "@/components/home/HomeShell";

export const metadata = {
  title: "Open tasks | Verisavo Community",
  description: "Tasks posted by Verisavo for SavoScouts. Sign in to see open tasks and register on WhatsApp to take part.",
  alternates: { canonical: "/community/tasks" },
  robots: { index: false }
};

export default function Page() {
  return <HomeShell start="community-tasks" />;
}
