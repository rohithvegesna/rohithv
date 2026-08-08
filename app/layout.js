import Script from "next/script";
import { Big_Shoulders, Overpass, Overpass_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Current from "@/components/Current";
import { site } from "@/data/site";
import "./globals.css";

const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

const overpass = Overpass({
  variable: "--font-overpass-sans",
  subsets: ["latin"],
  display: "swap",
});

const overpassMono = Overpass_Mono({
  variable: "--font-overpass-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Rohith Varma Vegesna — Senior Software Engineer & Tech Lead",
    template: "%s — Rohith Varma Vegesna",
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  verification: { google: "G-FET9JB3RQT" },
};

const CONSOLE_EGG = `console.log(
  "%c  ●───────────────────────────●\\n" +
  "  │  ROHITHV.COM   REV C        │\\n" +
  "  │  FR-4 · COPPER · SILKSCREEN │\\n" +
  "  │  drawn by R.V. Vegesna      │\\n" +
  "  ●───────────────────────────●\\n" +
  "  You read source. Good instinct.\\n" +
  "  Search: Cmd/Ctrl+K\\n" +
  "  Data sheet: /resume.json",
  "color:#c9834a;font-family:monospace"
);`;

const BOOT_GATE = `(function(){try{
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (navigator.connection && navigator.connection.saveData) return;
  if (navigator.deviceMemory !== undefined && navigator.deviceMemory < 3) return;
  var c = document.createElement('canvas');
  if (!(c.getContext('webgl2') || c.getContext('webgl'))) return;
  document.documentElement.classList.add('nr-boot');
}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bigShoulders.variable} ${overpass.variable} ${overpassMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: BOOT_GATE }} />
        <a
          href="#main"
          className="silk-label absolute left-1/2 top-2 z-[70] -translate-x-1/2 -translate-y-16 bg-gold px-3 py-2 text-substrate transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <div className="board-edge" aria-hidden="true">
          <i></i>
          <i></i>
          <i></i>
          <i></i>
        </div>
        <Header />
        <div id="main" className="flex-1">
          {children}
        </div>
        <Footer />
        <Current />
        <script dangerouslySetInnerHTML={{ __html: CONSOLE_EGG }} />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FET9JB3RQT"
          strategy="lazyOnload"
        />
        <Script id="ga" strategy="lazyOnload">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FET9JB3RQT');`}
        </Script>
      </body>
    </html>
  );
}
