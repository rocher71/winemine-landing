import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'winemine — Your wine journey, mapped.',
  description: '와인 라벨을 찍으면 세계가 물든다. 마신 와인을 세계 지도 위에 기록하고 공유하세요.',
  openGraph: {
    title: 'winemine',
    description: '와인 라벨을 찍으면 세계가 물든다.',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'winemine',
    description: '와인 라벨을 찍으면 세계가 물든다.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${playfairDisplay.variable} ${inter.variable}`}>
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}
