import HomeShell from "@/components/home/HomeShell";

export const metadata = {
  title: "Verisavo · The intelligence layer for African markets",
  description: "Verisavo connects fragmented market information, from company data and public records to evidence gathered on the ground, so teams can see what is happening, what the evidence supports and what is still unknown.",
  alternates: { canonical: "/" },
  openGraph: { title: "Verisavo · The intelligence layer for African markets", description: "Verisavo connects fragmented market information, from company data and public records to evidence gathered on the ground, so teams can see what is happening, what the evidence supports and what is still unknown.", url: "/", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Verisavo, the intelligence layer for African markets" }] }
};

export default function Page() {
  return <HomeShell />;
}
