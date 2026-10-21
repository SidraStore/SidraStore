import Header from "@/components/Header";
import CategoryPage from "@/components/CategoryPage";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Gifts & Combos | Sidra Store",
  description: "Curated gift sets - Attar Gift Sets, Premium Gift Boxes. Perfect for Eid and special occasions.",
};

export default function GiftsCombosPage() {
  return (
    <>
      <Header />
      <main>
        <CategoryPage categoryKey="gifts-combos" initialCount={4} />
      </main>
      <Footer />
    </>
  );
}