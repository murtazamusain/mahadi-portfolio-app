import './globals.css';
import Navbar from '@/components/Navbar';

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
      <body className="antialiased pt-16 md:pt-20 bg-[#0F172A] text-white">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
