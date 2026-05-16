'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { track } from '@/lib/amplitude';
import { useLocale } from '@/components/providers/locale-provider';

// ── Apple logo (Material Icons style, 24x24 grid) ─────────────────────────
function AppleIcon() {
  return (
    <svg width="18" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

// ── Google Play colorful icon ──────────────────────────────────────────────
function PlayIcon() {
  return (
    <svg width="18" height="20" viewBox="0 0 512 512" fill="none" style={{ flexShrink: 0 }}>
      <path d="M99.617 8.057a50.191 50.191 0 00-38.815-6.713l230.932 230.933 74.846-74.846L99.617 8.057z" fill="#4CAF50" />
      <path d="M32.139 20.116c-6.441 8.563-10.148 19.077-10.148 30.199v411.358c0 11.123 3.708 21.636 10.148 30.199l235.877-235.877L32.139 20.116z" fill="#00BCD4" />
      <path d="M464.261 212.087l-67.266-37.637-81.544 81.544 81.548 81.548 67.273-37.64c19.117-10.716 19.117-37.238-.011-47.815z" fill="#FFD740" />
      <path d="M140.396 489.711a50.185 50.185 0 0038.822-6.22L410.299 334.986l-74.832-74.832-195.071 229.557z" fill="#F44336" />
    </svg>
  );
}

// ── StoreButtons ───────────────────────────────────────────────────────────
interface StoreButtonsProps {
  onOpenModal: () => void;
  location?: string;
  size?: 'default' | 'compact';
}

export function StoreButtons({ onOpenModal, location = 'unknown', size = 'default' }: StoreButtonsProps) {
  const { messages } = useLocale();
  const [hoveredIos, setHoveredIos] = useState(false);
  const [hoveredAndroid, setHoveredAndroid] = useState(false);

  const isCompact = size === 'compact';

  const baseStyle = (hovered: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: isCompact ? 8 : 10,
    background: hovered ? 'var(--btn-store-bg-hover)' : 'var(--btn-store-bg)',
    border: '1px solid var(--btn-store-border)',
    borderRadius: isCompact ? 10 : 12,
    padding: isCompact ? '8px 14px' : '11px 20px',
    cursor: 'pointer',
    color: 'var(--btn-store-color)',
    transition: 'all 200ms ease',
    minWidth: isCompact ? 130 : 155,
    transform: hovered ? 'translateY(-1px)' : 'none',
    boxShadow: hovered ? 'var(--btn-store-shadow-hover)' : 'var(--btn-store-shadow)',
    fontFamily: 'inherit',
  });

  const handleClick = (store: 'ios' | 'android') => {
    trackEvent('app_download_click', {
      store,
      location,
      button_id: `app_download_${store}_${location}`,
    });
    track('cta_click', { store, location });
    onOpenModal();
  };

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
      {/* App Store */}
      <button
        type="button"
        style={baseStyle(hoveredIos)}
        onMouseEnter={() => setHoveredIos(true)}
        onMouseLeave={() => setHoveredIos(false)}
        onClick={() => handleClick('ios')}
      >
        <AppleIcon />
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: isCompact ? 8 : 9, opacity: 0.6, letterSpacing: '0.02em' }}>
            {messages.storeButtons.appStore.eyebrow}
          </div>
          <div style={{ fontSize: isCompact ? 13 : 15, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            {messages.storeButtons.appStore.label}
          </div>
        </div>
      </button>

      {/* Google Play */}
      <button
        type="button"
        style={baseStyle(hoveredAndroid)}
        onMouseEnter={() => setHoveredAndroid(true)}
        onMouseLeave={() => setHoveredAndroid(false)}
        onClick={() => handleClick('android')}
      >
        <PlayIcon />
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: isCompact ? 8 : 9, opacity: 0.6, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
            {messages.storeButtons.googlePlay.eyebrow}
          </div>
          <div style={{ fontSize: isCompact ? 13 : 15, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            {messages.storeButtons.googlePlay.label}
          </div>
        </div>
      </button>
    </div>
  );
}
