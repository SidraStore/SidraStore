import Header from "@/components/Header";
import DesignerCaps from "@/components/DesignerCaps";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Designer Islamic Caps | Sidra Store",
  description: "Explore our premium collection of designer Islamic caps - Barkati, Owaisi, Omani, Jarkali, Imama Shareef and exclusive designer styles. Handcrafted with tradition and elegance.",
};

export default function DesignerCapsPage() {
  return (
    <>
      <Header />
      <main>
        <DesignerCaps />
      </main>
      <Footer />
    </>
  );
}