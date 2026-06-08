import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalAdda — Discover Local Stores Near You",
  description: "Find grocery stores, clothing shops, mobile repair, and more in your city.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LocalAdda",
  },
  openGraph: {
    title: "LocalAdda",
    description: "Discover local stores near you",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#e8401c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
