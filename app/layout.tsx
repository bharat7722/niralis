import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import BackToTop from "@/components/back-to-top";
import PointerFlourish from "@/components/pointer-flourish";
import Varak from "@/components/varak";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Harsh & Nirali — Forever Begins | 11 Feb 2027",
  description:
    "Harsh & Nirali are getting married on 11 February 2027 at Sun Temple, Borsad. RSVP, browse our gallery, and sign the guestbook.",
  openGraph: {
    type: "website",
    title: "Harsh & Nirali — Forever Begins",
    description: "Join Harsh & Nirali on 11 February 2027 at Sun Temple, Borsad, Gujarat.",
    images: ["/images/hero-mandap.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Harsh & Nirali — Forever Begins",
    description: "Join Harsh & Nirali on 11 February 2027 at Sun Temple, Borsad, Gujarat.",
    images: ["/images/hero-mandap.jpg"],
  },
};

/** Tints the phone browser's chrome to match the paper background. */
export const viewport: Viewport = {
  themeColor: "#fdf9f4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${jost.variable}`}>
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <BackToTop />
        <PointerFlourish />
        <Varak />
      </body>
    </html>
  );
}
