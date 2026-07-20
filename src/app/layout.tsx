import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Capricorn Energy Ltd | Secure Oil & Gas Investment Platform",
    template: "%s | Capricorn Energy Ltd"
  },
  description: "Capricorn Energy Ltd is a world-class Oil and Gas energy company. Secure robust daily compound returns from managed crude oil tranches, natural gas pipelines, and clean-energy transitions directly through our secure, high-yield digital investment platform.",
  keywords: ["Capricorn Energy", "Capricorn Energy Ltd", "Oil and Gas Investment", "Energy Invest Platform", "Daily Yield returns", "Crude Oil Tranches", "Natural Gas Investment", "Passive energy returns", "Secure yield platform", "sustainable energy investment", "daily oil returns"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Capricorn Energy Ltd | Secure Oil & Gas Investment Platform",
    description: "Capricorn Energy Ltd is a world-class Oil and Gas energy company. Secure robust daily compound returns from managed crude oil tranches, natural gas pipelines, and clean-energy transitions directly through our secure, high-yield digital investment platform.",
    url: "https://capricornenergy.com",
    siteName: "Capricorn Energy Ltd",
    images: [
      {
        url: "/CapricornLogo.png",
        width: 800,
        height: 600,
        alt: "Capricorn Energy Ltd",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Capricorn Energy Ltd | Secure Oil & Gas Investment Platform",
    description: "Capricorn Energy Ltd is a world-class Oil and Gas energy company. Secure robust daily compound returns from managed crude oil tranches, natural gas pipelines, and clean-energy transitions directly through our secure, high-yield digital investment platform.",
    images: ["/CapricornLogo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
