import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt|css|js|woff|woff2)).*)'],
};

const SUPPORTED = ['ko', 'en'] as const;
type Locale = (typeof SUPPORTED)[number];
const DEFAULT: Locale = 'ko';
const COOKIE = 'NEXT_LOCALE';

function detectLocale(req: NextRequest): Locale {
  const existing = req.cookies.get(COOKIE)?.value;
  if (existing === 'ko' || existing === 'en') return existing;

  const header = req.headers.get('accept-language') ?? '';
  const langs = header
    .split(',')
    .map((s) => {
      const [lang, q] = s.trim().split(';q=');
      return { lang: lang.trim().slice(0, 2).toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q)
    .map((x) => x.lang);

  for (const lang of langs) {
    if (SUPPORTED.includes(lang as Locale)) return lang as Locale;
  }
  return DEFAULT;
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const locale = detectLocale(req);
  res.cookies.set(COOKIE, locale, { maxAge: 60 * 60 * 24 * 365, path: '/', sameSite: 'lax' });
  return res;
}
