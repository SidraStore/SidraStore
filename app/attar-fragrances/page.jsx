import Header from "@/components/Header";
import CategoryPage from "@/components/CategoryPage";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Attar & Fragrances | Sidra Store",
  description: "Discover premium attars and fragrances - Sidra Oudh, Aseel, White Oudh, Jannatul Ferdous, Rose Bulgari, Fasli Gulab, CR 7. Authentic, long-lasting, alcohol-free.",
};

export default function AttarFragrancesPage() {
  return (
    <>
      <Header />
      <main>
        <CategoryPage categoryKey="attar-fragrances" initialCount={7} />
      </main>
      <Footer />
    </>
  );
}