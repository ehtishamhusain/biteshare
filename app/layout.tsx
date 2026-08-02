import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import ProfileGuard from '@/components/ProfileGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://biteshare.in'),
  title: {
    default: 'BiteShare - Hyper-Local Food Redistribution Network',
    template: '%s | BiteShare',
  },
  description:
    'Connect with local food donors, restaurants, and shelters to rescue fresh surplus food in real time.',
  keywords: [
    'food waste',
    'surplus food',
    'hunger',
    'biteshare',
    'food redistribution',
    'sustainability',
    'ESG',
    'CSR food rescue',
  ],
  authors: [{ name: 'BiteShare Team' }],
  openGraph: {
    title: 'BiteShare - Hyper-Local Food Redistribution Network',
    description:
      'Rescue fresh surplus food near you, prevent food waste in real time, and take a step toward zero hunger.',
    url: 'https://biteshare.in',
    siteName: 'BiteShare',
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
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
        {/* Conditional Header Wrapper */}
        <NavbarWrapper />

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