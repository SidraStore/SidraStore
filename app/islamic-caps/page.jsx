import Header from "@/components/Header";
import CategoryPage from "@/components/CategoryPage";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Islamic Caps | Sidra Store",
  description: "Explore premium Islamic caps - Barkati, Owaisi, Omani, Jarkali, Imama Shareef, Designer collections. Handcrafted with tradition and elegance.",
};

export default function IslamicCapsPage() {
  return (
    <>
      <Header />
      <main>
        <CategoryPage categoryKey="islamic-caps" initialCount={8} />
      </main>
      <Footer />
    </>
  );
}