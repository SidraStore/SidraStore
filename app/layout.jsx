import { Inter, Playfair_Display, Yellowtail } from "next/font/google";
import StoreProviders from "@/components/StoreProviders";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const script = Yellowtail({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

export const metadata = {
  title: "Sidra Store | Premium Attar & Islamic Lifestyle",
  icons: {
    icon: "/fevicon.png",
    shortcut: "/fevicon.png",
    apple: "/fevicon.png",
  },
  description:
    "Discover premium attars, Islamic caps, surma, prayer essentials and more — crafted for a meaningful everyday life.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${script.variable} font-sans antialiased`}
      >
        <StoreProviders>{children}</StoreProviders>
      </body>
    </html>
  );
}
