import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import Providers from "@/components/Providers";
import SplashScreen from "@/components/SplashScreen";
import ProfileGuard from "@/components/ProfileGuard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StreamVault — Votre Cinéma Personnel",
  description:
    "StreamVault est un site de streaming personnel. Explorez votre bibliothèque de films et séries avec une expérience Netflix-like.",
  keywords: ["streaming", "films", "séries", "VOD"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C6A55C" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{ background: "var(--deep-black)" }}
      >
        <SplashScreen />
        <Providers>
          <ProfileGuard>
            <Sidebar />
            <MainContent>{children}</MainContent>
          </ProfileGuard>
        </Providers>
      </body>
    </html>
  );
}

