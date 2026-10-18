import { Databuddy } from "@databuddy/sdk/react";
import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { siteJsonLd } from "@/lib/seo";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/site";
import "./globals.css";
import { PresenceGate } from "@/components/landing/presence-gate";
import { LiquidShell } from "@/components/liquid-shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const openRunde = localFont({
  variable: "--font-open-runde",
  src: [
    {
      path: "../public/fonts/OpenRunde-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/OpenRunde-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/OpenRunde-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/OpenRunde-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TAGLINE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: "Veap Core Team", url: "https://github.com/veapjs" }],
  creator: "Veap Core Team",
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/logos/logo.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    // images: [
    //   {
    //     url: "/ogimage.webp",
    //     width: 2400,
    //     height: 1260,
    //     alt: "Veap - The Modular Full-Stack Web Framework",
    //     type: "image/webp",
    //   },
    // ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    // images: ["/ogimage.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} ${openRunde.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()) }}
        />
      </head>
      <body className=" min-h-svh relative flex flex-col">
        <PresenceGate durationSeconds={2.0}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div
              data-slot="wrapper"
              className="relative z-10 flex flex-1 flex-col"
            >
              {children} <LiquidShell />
            </div>
            <Databuddy
              clientId={process.env.NEXT_PUBLIC_DATABUDDY_CLIENT_ID!}
              trackHashChanges={true}
              trackAttributes={true}
              trackOutgoingLinks={true}
              trackInteractions={true}
              trackWebVitals={true}
              trackErrors={true}
            />
            {/** biome-ignore lint/a11y/noSvgWithoutTitle: <any> */}
            <svg className="grain-noise">
              <filter id="grain">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.6"
                  stitchTiles="stitch"
                ></feTurbulence>
              </filter>
            </svg>
          </ThemeProvider>
        </PresenceGate>
      </body>
    </html>
  );
}
