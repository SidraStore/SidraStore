import Header from "@/components/Header";
import AllProducts from "@/components/AllProducts";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Shop | Sidra Store",
  description: "Shop Sidra Store's complete collection of attars, Islamic caps, prayer essentials, wear, and gifts.",
};

export default function ShopPage({ searchParams }) {
  return <><Header /><main><AllProducts initialCategory={searchParams?.category || ""} /></main><Footer /></>;
}
