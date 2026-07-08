import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tausif Hasan",
  description:
    "A living moodboard and casual portfolio: fits, objects, photography, and the things I keep close.",
};

// Runs before first paint: applies the persisted theme so there's no flash of the
// default. (The cinematic intro now lives on the apex hub, not here.)
const prePaintScript = `(function(){
  try{var t=localStorage.getItem('theme');if(t){document.documentElement.dataset.theme=t;}}catch(e){}
})();`;

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
        <script dangerouslySetInnerHTML={{ __html: prePaintScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-cream font-sans tracking-tight text-black antialiased dark:bg-black dark:text-white red:bg-cream red:text-red">
        <SmoothScroll>{children}</SmoothScroll>
        <Cursor />
        <Analytics />
      </body>
    </html>
  );
}
