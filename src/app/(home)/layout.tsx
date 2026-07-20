import React from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import SmartsuppWidget from "@/components/SmartsuppWidget";
import PageLoader from "@/components/PageLoader";
import ScrollToTop from "@/components/ScrollToTop";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageLoader />
      <Header />
      <main className="relative flex flex-col min-h-screen">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
      <SmartsuppWidget />
    </>
  );
}
