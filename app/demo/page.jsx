import HomeShell from "@/components/home/HomeShell";

export const metadata = {
  title: "Request a Verisavo demo",
  description: "Request a demo of Verisavo. Tell us the market and the decision in front of you, and we will walk you through it.",
  alternates: { canonical: "/demo" },
  openGraph: { title: "Request a Verisavo demo", description: "Request a demo of Verisavo. Tell us the market and the decision in front of you, and we will walk you through it.", url: "/demo", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Verisavo, the intelligence layer for African markets" }] }
};

export default function Page() {
  return <HomeShell start="demo" />;
}
