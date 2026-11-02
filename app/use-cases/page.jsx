import HomeShell from "@/components/home/HomeShell";

export const metadata = {
  title: "Use cases · Verisavo",
  description: "Illustrative examples of market decisions in African markets, followed from the question to the evidence, the gaps and what to test next.",
  alternates: { canonical: "/use-cases" },
  openGraph: { title: "Use cases · Verisavo", description: "Illustrative examples of market decisions in African markets, followed from the question to the evidence, the gaps and what to test next.", url: "/use-cases", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Verisavo, the intelligence layer for African markets" }] }
};

export default function Page() {
  return <HomeShell start="use-cases" />;
}
