import Script from "next/script";
import { Instrument_Sans, Martian_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { site } from "@/data/site";
import "./globals.css";

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const martian = Martian_Mono({
  variable: "--font-martian",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
  "%c  TAP ─●─▶ DEVICE ─●─▶ SITE ─●─▶ CLOUD ─●─▶ SETTLED\\n" +
  "        └──── telemetry ────┴──── obs rail ────┘\\n" +
  "  the trace is live; the queue survives outages.\\n" +
  "  ⌘K → 'Run a transaction' · data sheet: /resume.json",
  "color:#ffb454;font-family:monospace"
);`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${martian.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="tag absolute left-1/2 top-2 z-[70] -translate-x-1/2 -translate-y-16 rounded-sm bg-amber px-3 py-2 text-ground transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <Header />
        <div id="main" className="flex-1">
          {children}
        </div>
        <Footer />
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
