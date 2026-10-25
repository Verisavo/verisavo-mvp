import HomeShell from "@/components/home/HomeShell";

export const metadata = {
  title: "About Verisavo",
  description: "Verisavo is building a connected intelligence layer for African markets, helping businesses understand what is happening around them, why it matters and what remains unknown.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About Verisavo", description: "Verisavo is building a connected intelligence layer for African markets, helping businesses understand what is happening around them, why it matters and what remains unknown.", url: "/about", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Verisavo, the intelligence layer for African markets" }] }
};

export default function Page() {
  return <HomeShell start="about-us" />;
}
