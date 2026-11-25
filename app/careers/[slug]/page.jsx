import HomeShell from "@/components/home/HomeShell";

const ROLES = {
  "founding-full-stack-engineer": "Founding full-stack engineer",
  "data-and-evidence-engineer": "Data and evidence engineer",
  "applied-ai-engineer": "Applied AI engineer",
  "market-intelligence-analyst": "Market intelligence analyst",
  "savoscouts-operations-lead": "SavoScouts operations lead",
  "product-designer": "Product designer",
  "partnerships-lead": "Partnerships lead"
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const t = ROLES[slug] || slug.replace(/-/g, " ").replace(/^./, c => c.toUpperCase());
  return { title: `${t} | Careers at Verisavo`, alternates: { canonical: `/careers/${slug}` } };
}

export default function Page() {
  return <HomeShell start="careers" />;
}
