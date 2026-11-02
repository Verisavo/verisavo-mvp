import HomeShell from "@/components/home/HomeShell";

export const metadata = {
  title: "SavoScout dashboard · Verisavo",
  description: "Your VeriPoints, verified responses, WhatsApp connection and redemption options.",
  alternates: { canonical: "/community/profile" },
  robots: { index: false }
};

export default function Page() {
  return <HomeShell start="scout" />;
}
