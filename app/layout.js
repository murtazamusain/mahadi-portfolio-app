import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Mahadi Hasan - Professional Driver in France',
  description: 'Uber, Drive, Private Transfers, Airport Service in France',
  keywords: 'driver, uber, france, paris, airport transfer, private driver',
  authors: [{ name: 'Mahadi Hasan' }],
  openGraph: {
    title: 'Mahadi Hasan - Professional Driver in France',
    description: 'Safe, reliable, and professional driving services in France.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-16 md:pt-20`}
      >
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
