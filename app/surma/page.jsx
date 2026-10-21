import Header from "@/components/Header";
import CategoryPage from "@/components/CategoryPage";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Surma | Sidra Store",
  description: "Pure Surma Kohl - Traditional eye kohl for beautiful, healthy eyes. Authentic Islamic surma.",
};

export default function SurmaPage() {
  return (
    <>
      <Header />
      <main>
        <CategoryPage categoryKey="surma" initialCount={4} />
      </main>
      <Footer />
    </>
  );
}