import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suuder AI",
  description: "Mongolian AI companion",
  manifest: "/manifest.json",
  themeColor: "#22d3ee",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    title: "Suuder AI",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  );
}