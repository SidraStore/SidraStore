import Header from "@/components/Header";
import WishlistPage from "@/components/WishlistPage";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Wishlist | Sidra Store",
  description: "View and manage your saved Sidra Store products.",
};

export default function WishlistRoute() {
  return (
    <>
      <Header />
      <WishlistPage />
      <Footer />
    </>
  );
}
