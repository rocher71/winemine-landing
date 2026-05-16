import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { getLocale, getMessages } from '@/lib/i18n';
import { LocaleProvider } from '@/components/providers/locale-provider';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';
import { ThemeProvider } from '@/components/providers/theme-provider';

const THEME_FLICKER_SCRIPT = `(function(){try{var s=localStorage.getItem('winemine.theme');if(s==='light'||s==='dark'){document.documentElement.setAttribute('data-theme',s);}}catch(e){}})();`;

const GA_ID = 'G-7V8ZDT0TYX';
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

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
  title: 'WineMine — 와인으로 물들이는 나만의 세계지도',
  description: 'Drink the world. Map your taste. 와인으로 물들이는 나만의 세계지도.',
  openGraph: {
    title: 'WineMine — 와인으로 물들이는 나만의 세계지도',
    description: 'Drink the world. Map your taste. 와인으로 물들이는 나만의 세계지도.',
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: 'WineMine',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WineMine — 와인으로 물들이는 나만의 세계지도',
    description: 'Drink the world. Map your taste. 와인으로 물들이는 나만의 세계지도.',
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
    <html lang={locale} className={`${playfairDisplay.variable} ${inter.variable}`} style={{ colorScheme: 'light dark' }}>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: THEME_FLICKER_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap"
        />
      </head>
      {/* inter.className 제거 — globals.css의 Noto Sans KR 폰트 스택이 적용되도록 */}
      <body suppressHydrationWarning>
        <ThemeProvider>
          <LocaleProvider locale={locale} messages={messages}>
            <LocaleSwitcher />
            {children}
          </LocaleProvider>
        </ThemeProvider>

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

        {/* Meta Pixel */}
        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
