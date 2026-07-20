import type { Metadata } from "next";
import { EB_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SustainBL | Client Portal",
  description: "SustainBL client portal for IEP services and coaching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full font-body">{children}</body>
    </html>
  );
}
