import "./platform.css";
import Skip from "@/components/platform/Skip";
import Header from "@/components/platform/Header";
import Menu from "@/components/platform/Menu";
import Main from "@/components/platform/Main";
import Footer from "@/components/platform/Footer";
import EarlyAccessDialog from "@/components/platform/EarlyAccessDialog";
import ComingSoonDialog from "@/components/platform/ComingSoonDialog";
import LegalDialog from "@/components/platform/LegalDialog";
import AssistantWindow from "@/components/platform/AssistantWindow";
import AuthDialog from "@/components/platform/AuthDialog";
import PlatformClient from "@/components/platform/PlatformClient";

export const metadata = {
  title: "Verisavo Intelligence Assistant · Ask about your market",
  description: "Ask market questions in plain language and see the evidence behind each answer, how confident it is and what is still unknown. In early access on WhatsApp.",
  alternates: { canonical: "/platform" },
  openGraph: { title: "Verisavo Intelligence Assistant", description: "Ask market questions in plain language and see the evidence behind each answer, how confident it is and what is still unknown.", url: "/platform", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Verisavo, the intelligence layer for African markets" }] }
};

export default function PlatformPage() {
  return (
    <>
      <Skip />
      <Header />
      <Menu />
      <Main />
      <Footer />
      <EarlyAccessDialog />
      <ComingSoonDialog />
      <LegalDialog />
      <AssistantWindow />
      <AuthDialog />
      <PlatformClient />
    </>
  );
}
