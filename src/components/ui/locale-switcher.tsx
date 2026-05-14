'use client';

import { useLocale } from '@/components/providers/locale-provider';
import type { Locale } from '@/lib/i18n';

const LOCALE_LABELS: Record<Locale, string> = {
  ko: 'KO',
  en: 'EN',
};

function setLocaleCookie(next: Locale) {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `NEXT_LOCALE=${next}; max-age=${oneYear}; path=/; samesite=lax`;
}

export function LocaleSwitcher() {
  const { locale } = useLocale();

  const handleSelect = (target: Locale) => {
    if (target === locale) return;
    setLocaleCookie(target);
    window.location.reload();
  };

  return (
    <div
      role="group"
      aria-label="Language"
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 100,
        display: 'inline-flex',
        alignItems: 'center',
        padding: 3,
        gap: 2,
        borderRadius: 999,
        background: 'rgba(15,7,24,0.72)',
        border: '1px solid rgba(201,168,76,0.35)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        fontSize: 11,
        letterSpacing: '0.08em',
        fontWeight: 600,
      }}
    >
      {(['ko', 'en'] as Locale[]).map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => handleSelect(l)}
            aria-pressed={active}
            aria-label={l === 'ko' ? '한국어로 보기' : 'View in English'}
            style={{
              minWidth: 30,
              padding: '5px 9px',
              borderRadius: 999,
              border: 'none',
              cursor: active ? 'default' : 'pointer',
              background: active ? '#C9A84C' : 'transparent',
              color: active ? '#05020A' : '#D4C5B0',
              transition: 'background 160ms ease, color 160ms ease',
              letterSpacing: '0.08em',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {LOCALE_LABELS[l]}
          </button>
        );
      })}
    </div>
  );
}
