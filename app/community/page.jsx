import HomeShell from "@/components/home/HomeShell";

export const metadata = {
  title: "Community: join SavoScouts | Verisavo",
  description: "Join SavoScouts, Verisavo's community of people who capture what is happening in their local markets. Take short tasks on WhatsApp and get rewarded for checked observations.",
  alternates: { canonical: "/community" },
  openGraph: { title: "Join SavoScouts | Verisavo", description: "Join SavoScouts, Verisavo's community of people who capture what is happening in their local markets. Take short tasks on WhatsApp and get rewarded for checked observations.", url: "/community", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Verisavo, the intelligence layer for African markets" }] }
};

export default function Page() {
  return <HomeShell start="community" />;
}
