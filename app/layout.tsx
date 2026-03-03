import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Motomarket BI Dashboard",
  description:
    "Business Intelligence Dashboard για το Motomarket — analytics, KPIs, AI σύμβουλος.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-900 text-white antialiased">{children}</body>
    </html>
  );
}
