import type { NextConfig } from 'next';
import path from 'path';

// CSRF 강화: Server Action을 허용할 origin 명시. NEXT_PUBLIC_SITE_URL이 있으면 해당 호스트도 추가.
// (Next.js 15는 기본적으로 same-origin만 허용하지만, 프록시/커스텀 도메인 환경에서 명시적으로 화이트리스트)
const SITE_HOST = (() => {
  try {
    return process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host
      : null;
  } catch {
    return null;
  }
})();

const ALLOWED_ORIGINS = Array.from(
  new Set(
    [
      'winemine.vercel.app',
      'winemine.app',
      'www.winemine.app',
      SITE_HOST,
    ].filter((v): v is string => Boolean(v))
  )
);

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    serverActions: {
      allowedOrigins: ALLOWED_ORIGINS,
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // HSTS — HTTPS 강제 (Vercel/프로덕션 HTTPS 환경 가정)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Permissions-Policy — 사용하지 않는 강력 API 차단 (defense-in-depth)
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
