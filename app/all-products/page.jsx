import Header from "@/components/Header";
import AllProducts from "@/components/AllProducts";
import Footer from "@/components/Footer";

export const metadata = {
  title: "All Products | Sidra Store",
  description: "Browse our complete collection of premium attars, Islamic caps, surma, prayer essentials, Islamic wear, and gift combos. 25+ authentic products available.",
};

export default function AllProductsPage() {
  return (
    <>
      <Header />
      <main>
        <AllProducts />
      </main>
      <Footer />
    </>
  );
}