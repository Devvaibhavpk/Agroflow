import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/components/AuthProvider';
import { ToastProvider } from '@/components/ui/ToastProvider';

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agroflow",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  description: "Agroflow: Your Smart Farming Companion",
  keywords: [
    "Agroflow",
    "Smart Farming",
    "IoT",
    "Agriculture",
    "Data Analytics",
    "Machine Learning",
    "AI",
    "Crop Management",
    "Weather Forecasting",
    "Soil Monitoring",
    "Yield Prediction",
    "Sustainable Agriculture",
    "Precision Agriculture",
    "Farm Management",
    "Remote Sensing",
    "Agricultural Technology",
    "AgTech",
    "Smart Irrigation",
    "Pest Management",
    "Crop Health Monitoring",
    "Farm Automation",
    "Data-Driven Farming",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Navbar />
          <ToastProvider>
            {children}
          </ToastProvider>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
