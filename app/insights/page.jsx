import HomeShell from "@/components/home/HomeShell";

export const metadata = {
  title: "Insights · Verisavo",
  description: "Research, articles and case studies on how teams use connected evidence to understand African markets.",
  alternates: { canonical: "/insights" },
  openGraph: { title: "Insights · Verisavo", description: "Research, articles and case studies on how teams use connected evidence to understand African markets.", url: "/insights", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Verisavo, the intelligence layer for African markets" }] }
};

export default function Page() {
  return <HomeShell start="research" />;
}
