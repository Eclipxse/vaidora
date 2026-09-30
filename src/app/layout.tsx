import type { Metadata } from "next";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Vaidora Perfume — A scent that’s so you",
    template: "%s | Vaidora Perfume",
  },
  description:
    "Discover 87 Vaidora fragrances. Explore the collection, choose your bottle size and order personally on WhatsApp.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
