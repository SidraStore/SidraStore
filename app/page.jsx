import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryStrip from "@/components/CategoryStrip";
import OudhCollection from "@/components/OudhCollection";
import Lifestyle from "@/components/Lifestyle";
import Bestsellers from "@/components/Bestsellers";
import Essence from "@/components/Essence";
import ShopCategory from "@/components/ShopCategory";
import Gifts from "@/components/Gifts";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CategoryStrip />
        <OudhCollection />
        <Lifestyle />
        <Bestsellers />
        <Essence />
        <ShopCategory />
        <Gifts />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
