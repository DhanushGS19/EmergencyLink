import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EmergencyLink",
  description: "Emergency assistance, connected.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} h-screen w-screen overflow-hidden bg-slate-950 text-white relative`}>
        {/* DEMO MODE BANNER */}
        <div className="bg-medical-teal text-white text-center font-semibold py-1.5 px-4 shadow-lg text-xs z-50 relative w-full tracking-wider uppercase border-b border-white/20">
          DEMO DATA — Simulation Mode Active
        </div>
        
        {/* Floating Glass Header */}
        <header className="absolute top-8 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-7xl glass-panel rounded-2xl flex items-center justify-between px-6 py-4 shadow-2xl">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-medical-blue flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-xl">✚</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight group-hover:text-medical-teal transition-colors">
              Emergency<span className="font-light opacity-80">Link</span>
            </h1>
          </a>
          <nav className="flex gap-6 text-sm font-semibold tracking-wide text-slate-300">
            <a href="/" className="hover:text-medical-teal transition-colors py-1">Patient</a>
            <a href="/driver" className="hover:text-medical-teal transition-colors py-1">Driver</a>
            <a href="/dispatcher" className="hover:text-medical-teal transition-colors py-1">Dispatcher</a>
            <a href="/hospital" className="hover:text-medical-teal transition-colors py-1">Hospital</a>
            <a href="/admin" className="hover:text-medical-teal transition-colors py-1">Admin</a>
          </nav>
        </header>

        {/* Main Content (Map and Floating Panels) */}
        <main className="w-full h-full relative z-10 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
