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
        display: 'inline-flex',
        alignItems: 'center',
        padding: 2,
        gap: 1,
        borderRadius: 999,
        border: '1px solid var(--color-border-soft)',
        background: 'transparent',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        opacity: 0.75,
        transition: 'opacity 160ms ease, border-color 160ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.borderColor = 'var(--color-gold-tint-soft)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.75';
        e.currentTarget.style.borderColor = 'var(--color-border-soft)';
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
              padding: '4px 9px',
              borderRadius: 999,
              border: 'none',
              cursor: active ? 'default' : 'pointer',
              background: active ? 'var(--color-gold-tint-soft)' : 'transparent',
              color: active ? 'var(--color-text-primary)' : 'var(--color-text-disabled)',
              transition: 'background 160ms ease, color 160ms ease',
              letterSpacing: '0.12em',
              fontSize: 10,
              fontWeight: active ? 700 : 600,
              textTransform: 'uppercase',
              fontFamily: 'inherit',
            }}
          >
            {LOCALE_LABELS[l]}
          </button>
        );
      })}
    </div>
  );
}
