import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  title: 'AuraTick | Modern Corporate IT Service Desk Portal',
  description: 'AuraTick is a high-fidelity IT ticketing portal supporting active-tracking analytics, SLA workflows, simulated live chat, and instant knowledge solutions.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="bg-slate-950 text-slate-100 font-sans min-h-screen relative select-none selection:bg-indigo-500/30 selection:text-indigo-200">
        {/* Global ambient background glow blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-950/15 blur-[120px] pointer-events-none z-0"></div>
        
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
