import HomeShell from "@/components/home/HomeShell";
import { OPPS } from "@/lib/home/portalData";

// Each opportunity has its own address and link preview, so it can be shared on WhatsApp and social media.
export function generateStaticParams() {
  return OPPS.map(o => ({ slug: o.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const o = OPPS.find(x => x.slug === slug);
  if (!o) return { title: "SavoScout opportunities | Verisavo", robots: { index: false } };
  const title = `${o.title} | SavoScout opportunity | Verisavo`;
  return {
    title,
    description: o.card,
    alternates: { canonical: `/portal/${o.slug}` },
    openGraph: { title, description: o.card, url: `/portal/${o.slug}`, type: "website" }
  };
}

export default function Page() {
  return <HomeShell start="portal" />;
}
