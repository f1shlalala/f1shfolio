import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import { profile } from "@/lib/moodboard";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${profile.name.trim()} — Moodboard`,
  description:
    "A living moodboard and casual portfolio: fits, objects, photography, and the things I keep close.",
};

// Set the persisted theme before paint to avoid a flash of the default.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="cream"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-cream font-sans tracking-tight text-black antialiased dark:bg-black dark:text-white red:bg-cream red:text-red">
        <SmoothScroll>{children}</SmoothScroll>
        <Cursor />
      </body>
    </html>
  );
}
