import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetails from "@/components/ProductDetails";
import {
  allProducts,
  createProductSlug,
  findProductBySlug,
  getSimilarProducts,
} from "@/lib/productCatalog";

export function generateStaticParams() {
  return allProducts.map((product) => ({ slug: createProductSlug(product.name) }));
}

export function generateMetadata({ params }) {
  const product = findProductBySlug(params.slug);

  if (!product) {
    return { title: "Product Not Found | Sidra Store" };
  }

  return {
    title: `${product.name} | Sidra Store`,
    description: `${product.desc}. Shop authentic ${product.category.toLowerCase()} from Sidra Store.`,
  };
}

export default function ProductPage({ params }) {
  const product = findProductBySlug(params.slug);

  if (!product) notFound();

  const similarProducts = getSimilarProducts(product, 4);

  return (
    <>
      <Header />
      <ProductDetails product={product} similarProducts={similarProducts} />
      <Footer />
    </>
  );
}
