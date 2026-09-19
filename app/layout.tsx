import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
    title: "TechPulse — Stock Dashboard",
    description: "Real-time tech stock watchlist and portfolio tracker",
    manifest: "/manifest.json",
    icons: {
        icon: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
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
    themeColor: "#F4E6D3",
    colorScheme: "light",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-tp-paper text-tp-ink antialiased min-h-screen">
                <ErrorBoundary>
                    {children}
                </ErrorBoundary>
            </body>
        </html>
    );
}