import HomeShell from "@/components/home/HomeShell";

export const metadata = {
  title: "Admin | Verisavo",
  description: "Verisavo admin: the SavoScout opportunities portal and the platform simulation.",
  robots: { index: false, follow: false }
};

export default function Page() {
  return <HomeShell start="admin" />;
}
