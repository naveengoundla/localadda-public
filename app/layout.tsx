import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";
import WishlistFab from "@/components/WishlistFab";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
        {/* Capture the install prompt before hydration so it's never missed */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__deferredInstall=e;window.dispatchEvent(new Event('installavailable'))})",
          }}
        />
      </head>
      <body className={`min-h-screen ${inter.variable}`}>
        {children}
        <WishlistFab />
        <InstallPrompt />
      </body>
    </html>
  );
}
