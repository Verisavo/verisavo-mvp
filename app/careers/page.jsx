import HomeShell from "@/components/home/HomeShell";

export const metadata = {
  title: "Careers at Verisavo",
  description: "Join a small team connecting fragmented market evidence across Africa. Open roles in engineering, research, design, field operations and partnerships.",
  alternates: { canonical: "/careers" },
  openGraph: { title: "Careers at Verisavo", description: "Join a small team connecting fragmented market evidence across Africa. Open roles in engineering, research, design, field operations and partnerships.", url: "/careers", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Verisavo, the intelligence layer for African markets" }] }
};

export default function Page() {
  return <HomeShell start="careers" />;
}
