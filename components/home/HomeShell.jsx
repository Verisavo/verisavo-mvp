import "@/app/home.css";
import "@/app/landing.css";
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


/* The homepage and its inner pages (About, Careers, Pricing, Contact, Insights) share one document; the route decides which panel opens first. */
export default function HomeShell({ start = "" }) {
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
      {start ? <script dangerouslySetInnerHTML={{ __html: `window.__vsStart=${JSON.stringify(start)}` }} /> : null}
    </>
  );
}
