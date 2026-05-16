'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const Icon = theme === 'dark' ? Sun : Moon;
  const nextLabel = theme === 'dark' ? 'Light' : 'Dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${nextLabel.toLowerCase()} mode`}
      style={{
        background: 'transparent',
        border: '1px solid var(--color-border-soft)',
        color: 'var(--color-text-disabled)',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        fontSize: 10,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 10px',
        borderRadius: 999,
        opacity: 0.75,
        transition: 'opacity 160ms ease, color 160ms ease, border-color 160ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.color = 'var(--color-text-muted)';
        e.currentTarget.style.borderColor = 'var(--color-gold-tint-soft)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.75';
        e.currentTarget.style.color = 'var(--color-text-disabled)';
        e.currentTarget.style.borderColor = 'var(--color-border-soft)';
      }}
    >
      <Icon size={11} strokeWidth={2} aria-hidden />
      {nextLabel}
    </button>
  );
}
