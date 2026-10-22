import { Fragment } from "react";
import { createAdminCatalogClient } from "@/lib/adminCatalog";
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

export const dynamic = "force-dynamic";

async function getInitialHeroContent() {
  const { data, error } = await createAdminCatalogClient()
    .from("hero_slides")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw new Error(`Unable to load the initial hero slide: ${error.message}`);
  return { hero_slides: data || [] };
}

async function getInitialCategories() {
  const { data, error } = await createAdminCatalogClient()
    .from("categories")
    .select("id,name,slug,image_url,sort_order")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw new Error(`Unable to load the initial categories: ${error.message}`);
  return data || [];
}

function optimizeHeroImageUrl(source, width) {
  if (!source || !source.includes("ik.imagekit.io/") || source.includes("tr=")) return source;
  const separator = source.includes("?") ? "&" : "?";
  return `${source}${separator}tr=f-auto,q-75,w-${width}`;
}

export default async function Home() {
  const [initialHeroContent, initialCategories] = await Promise.all([getInitialHeroContent(), getInitialCategories()]);

  return (
    <>
      {initialHeroContent.hero_slides.map((slide, index) => {
        const slideDesktopImage = optimizeHeroImageUrl(slide.desktop_image_url, 1920);
        const slideMobileImage = optimizeHeroImageUrl(slide.mobile_image_url || slide.desktop_image_url, 1080);
        return <Fragment key={slide.id || `${slide.title}-${index}`}>
          {slideDesktopImage && <link rel="preload" as="image" href={slideDesktopImage} media="(min-width: 1024px)" fetchPriority={index === 0 ? "high" : "auto"} />}
          {slideMobileImage && <link rel="preload" as="image" href={slideMobileImage} media="(max-width: 1023px)" fetchPriority={index === 0 ? "high" : "auto"} />}
        </Fragment>;
      })}
      <div className="min-h-screen">
        <Header />
        <main>
          <Hero initialContent={initialHeroContent} />
          <CategoryStrip initialCategories={initialCategories} />
          <OudhCollection />
          <Lifestyle />
          <Bestsellers />
          <Essence />
          <ShopCategory initialCategories={initialCategories} />
          <Gifts />
          <Testimonials />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </>
  );
}
