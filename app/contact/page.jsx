import HomeShell from "@/components/home/HomeShell";

export const metadata = {
  title: "Contact Verisavo",
  description: "Tell us about the market or decision you are working on. Write to the Verisavo team at hello@verisavo.com.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact Verisavo", description: "Tell us about the market or decision you are working on. Write to the Verisavo team at hello@verisavo.com.", url: "/contact", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Verisavo, the intelligence layer for African markets" }] }
};

export default function Page() {
  return <HomeShell start="contact" />;
}
