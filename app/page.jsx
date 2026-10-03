import "./home.css";
import Header from "@/components/home/Header";
import Menu from "@/components/home/Menu";
import AboutUsPage from "@/components/home/AboutUsPage";
import ResearchPage from "@/components/home/ResearchPage";
import ResearchDetail from "@/components/home/ResearchDetail";
import PricingPage from "@/components/home/PricingPage";
import CareersPage from "@/components/home/CareersPage";
import ContactPage from "@/components/home/ContactPage";
import Main from "@/components/home/Main";
import Footer from "@/components/home/Footer";
import ComingSoonDialog from "@/components/home/ComingSoonDialog";
import LegalDialog from "@/components/home/LegalDialog";
import EarlyAccessDialog from "@/components/home/EarlyAccessDialog";
import AuthDialog from "@/components/home/AuthDialog";
import HomeClient from "@/components/home/HomeClient";

export const metadata = {
  title: "Verisavo",
  description: "Verisavo is a connected intelligence layer for African markets."
};

export default function HomePage() {
  return (
    <>
      <Header />
      <Menu />
      <AboutUsPage />
      <ResearchPage />
      <ResearchDetail />
      <PricingPage />
      <CareersPage />
      <ContactPage />
      <Main />
      <Footer />
      <ComingSoonDialog />
      <LegalDialog />
      <EarlyAccessDialog />
      <AuthDialog />
      <HomeClient />
    </>
  );
}
