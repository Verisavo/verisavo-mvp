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
  title: "Verisavo Intelligence Assistant",
  description: "Verisavo is a connected intelligence layer for African markets."
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
