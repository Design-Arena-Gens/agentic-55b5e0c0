import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://agentic-55b5e0c0.vercel.app"),
  title: "What Do You Want? — Rapid Survey for Builders",
  description:
    "A fast, design-first survey that translates your current energy and friction into an actionable next move.",
  openGraph: {
    title: "What Do You Want? — Rapid Survey for Builders",
    description:
      "Surface the next move for your craft with a high-signal, five-step survey built for designers and makers.",
    url: "https://agentic-55b5e0c0.vercel.app",
    siteName: "Design Pulse Survey",
    images: [
      {
        url: "/og-card.svg",
        width: 1200,
        height: 630,
        alt: "Survey interface preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "What Do You Want? — Rapid Survey for Builders",
    description:
      "Zero-fluff survey to align your next design move with what you actually need.",
    creator: "@designarena_ai",
    images: ["/og-card.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
