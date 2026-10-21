import Header from "@/components/Header";
import CategoryPage from "@/components/CategoryPage";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Islamic Wear | Sidra Store",
  description: "Traditional Islamic wear - Ajrak Chadar, Omani Chadar, Imama Shareef. Premium fabrics and craftsmanship.",
};

export default function IslamicWearPage() {
  return (
    <>
      <Header />
      <main>
        <CategoryPage categoryKey="islamic-wear" initialCount={4} />
      </main>
      <Footer />
    </>
  );
}