import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileGuard from '@/components/ProfileGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BiteShare - Hyper-Local Surplus Food Redistribution Network',
  description: 'Connect local business surplus food with community members and shelters in real time.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 antialiased`}>
        {/* Global Sticky Header */}
        <Navbar />

        {/* Dynamic Page Content Protected by ProfileGuard */}
        <main className="flex-grow">
          <ProfileGuard>
            {children}
          </ProfileGuard>
        </main>

        {/* Global Footer */}
        <Footer />
      </body>
    </html>
  );
}