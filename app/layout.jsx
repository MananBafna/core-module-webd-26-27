import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import ThreeBackground from "@/components/ThreeBackground";
import SettingsModal from "@/components/SettingsModal";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata = {
  title: "Lumina Notes",
  description:
    "A real-time, full-stack notes app built with Next.js, Socket.io and Three.js.",
};

// Applies the saved theme before first paint so there is no flash.
const themeScript = `(function(){try{var p=localStorage.getItem('lumina-theme')||'dark';var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(p==='light'||(p==='system'&&!d)){document.documentElement.classList.add('light');}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="relative min-h-screen">
        <Providers>
          <ThreeBackground />
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 pt-8 sm:px-8">
              {children}
            </main>
            <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--text-faint)]">
              Built with Next.js, Tailwind, Framer Motion, Three.js and Socket.io.
            </footer>
          </div>
          <SettingsModal />
          <Toaster
            theme="system"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--bg-soft)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                backdropFilter: "blur(12px)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
