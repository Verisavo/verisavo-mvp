import HomeShell from "@/components/home/HomeShell";

export const metadata = {
  title: "Pricing · Verisavo",
  description: "Early access pricing: start free with five market questions, then $6.99 a month for ongoing access to the Verisavo Intelligence Assistant.",
  alternates: { canonical: "/pricing" },
  openGraph: { title: "Pricing · Verisavo", description: "Early access pricing: start free with five market questions, then $6.99 a month for ongoing access to the Verisavo Intelligence Assistant.", url: "/pricing", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Verisavo, the intelligence layer for African markets" }] }
};

export default function Page() {
  return <HomeShell start="pricing" />;
}
