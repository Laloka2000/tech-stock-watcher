import type { Metadata, Viewport } from "next";
import "./globals.css"

export const metadata: Metadata = {
  title: "TechPulse — Stock Dashboard",
  description: "Real-time tech stock watchlist and portfolio tracker",
  manifest: "/manifest.json",
  icons: {
    icon:  [{ url: "/icons/icon-192.png", sizes: "192x192" }],
    apple: [{ url: "/icons/icon-192.png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TechPulse",
  },
  openGraph: {
    title: "TechPulse",
    description: "Real-time tech stock dashboard",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070c09",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-tp-bg text-tp-primary antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
