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

// Runs before first paint. (1) Applies the persisted theme so there's no flash
// of the default. (2) If the intro should play (not seen this session, motion
// allowed), marks <html> so a black cover paints immediately — this hides the
// landing until the preloader mounts, so the loader appears first (no flash of
// the page). A safety timer clears the cover if the intro never runs.
const prePaintScript = `(function(){
  try{var t=localStorage.getItem('theme');if(t){document.documentElement.dataset.theme=t;}}catch(e){}
  try{
    var seen=sessionStorage.getItem('intro-seen');
    var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!seen&&!reduced){
      var d=document.documentElement;d.classList.add('intro-pending');
      setTimeout(function(){d.classList.remove('intro-pending');},5000);
    }
  }catch(e){}
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
