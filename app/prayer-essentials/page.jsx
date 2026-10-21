import Header from "@/components/Header";
import CategoryPage from "@/components/CategoryPage";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Prayer Essentials | Sidra Store",
  description: "Premium prayer mats and essentials - Ja Namaz, Velvet Ja Namaz, Prayer Attar Sets. For your spiritual journey.",
};

export default function PrayerEssentialsPage() {
  return (
    <>
      <Header />
      <main>
        <CategoryPage categoryKey="prayer-essentials" initialCount={4} />
      </main>
      <Footer />
    </>
  );
}