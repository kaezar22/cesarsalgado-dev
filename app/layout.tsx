import type { Metadata } from "next";
import "@fontsource/fraunces/latin-500.css";
import "@fontsource/fraunces/latin-600.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import { SITE_URL, T } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: T.en.meta_title,
  description: T.en.meta_description,
  alternates: { canonical: "/", languages: { en: "/", es: "/es" } },
  openGraph: {
    title: T.en.meta_title,
    description: T.en.meta_description,
    url: SITE_URL,
    siteName: "César Salgado",
    images: ["/profile.jpg"],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
