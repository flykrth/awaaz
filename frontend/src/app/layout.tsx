import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Project Awaaz | Evidence-Grounded Case Resolution System",
  description:
    "A deterministic multi-agent governance architecture ensuring zero-harm, privacy-preserving case resolution for high-stakes missing-child investigations across connected urban infrastructure.",
  keywords: [
    "Project Awaaz",
    "Trustworthy AI",
    "Responsible AI",
    "LangGraph",
    "FastMCP",
    "Zero-LLM Governance",
  ],
  authors: [{ name: "Project Awaaz Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#080D1A] text-slate-100 min-h-screen antialiased selection:bg-trust-600 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
