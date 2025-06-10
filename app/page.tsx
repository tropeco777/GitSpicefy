import {
  ExternalLink,
  FileText,
  Home,
  Crown,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import HeroSection from "@/components/HeroSection";
import Features from "@/components/Features";
import PremiumSection from "@/components/PremiumSection";
import ContactUs from "@/components/ContactUs";
import Footer from "@/components/Footer";

const navItems = [
  { name: "Home", link: "#home", icon: <Home /> },
  { name: "Pricing", link: "/pricing", icon: <Crown /> },
  { name: "GitHub", link: "https://github.com/anomusly", icon: <ExternalLink /> },
];

const Homepage = () => {
  return (
    <>
      <main className="flex flex-col px-5 sm:px-10 relative min-h-screen">
        <div className="max-w-7xl mx-auto w-full">
          <Navbar navItems={navItems} />
          <HeroSection />
        </div>

        {/* Features Section */}
        <Features />

        {/* Premium Section */}
        <PremiumSection />

        {/* Contact Us Section */}
        <section className="py-16 sm:py-20">
          <ContactUs />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default Homepage;
