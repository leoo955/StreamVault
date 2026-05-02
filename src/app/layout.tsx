import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  // Requesting specific weights for the cinematic look
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "StreamVault",
  description: "Votre cinéma personnel · haut de gamme",
  appleWebApp: {
    title: "StreamVault",
    statusBarStyle: "black-translucent",
  }
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-deep-black text-text-primary">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
