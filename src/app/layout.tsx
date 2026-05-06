import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { getLocale, getMessages } from '@/lib/i18n';
import { LocaleProvider } from '@/components/providers/locale-provider';

const GA_ID = 'G-7V8ZDT0TYX';

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://winemine.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'WineMine — Your wine journey, mapped.',
  description: '와인 라벨을 찍으면 세계가 물든다. 마신 와인을 세계 지도 위에 기록하고 공유하세요.',
  openGraph: {
    title: 'WineMine — Your wine journey, mapped.',
    description: '와인 라벨을 찍으면 세계가 물든다. 마신 와인을 세계 지도 위에 기록하고 공유하세요.',
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: 'WineMine',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WineMine — Your wine journey, mapped.',
    description: '와인 라벨을 찍으면 세계가 물든다. 마신 와인을 세계 지도 위에 기록하고 공유하세요.',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages(locale);

  return (
    <html lang={locale} className={`${playfairDisplay.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap"
        />
      </head>
      {/* inter.className 제거 — globals.css의 Noto Sans KR 폰트 스택이 적용되도록 */}
      <body suppressHydrationWarning>
        <LocaleProvider locale={locale} messages={messages}>
          {children}
        </LocaleProvider>

        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
