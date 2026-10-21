import CustomerAuth from "@/components/CustomerAuth";

export const metadata = {
  title: "Customer Login | Sidra Store",
};

export default function LoginPage({ searchParams }) {
  const nextPath = typeof searchParams?.next === "string" && searchParams.next.startsWith("/")
    ? searchParams.next
    : "/checkout";

  return <CustomerAuth nextPath={nextPath} />;
}
