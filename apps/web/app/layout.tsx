import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mali AI — Build Your Store in Minutes",
  description: "Describe your business. Get a complete AI-powered dropshipping store with payments, WhatsApp alerts, and more — in minutes.",
  keywords: "AI store builder, dropshipping, Razorpay, WhatsApp alerts, ecommerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
