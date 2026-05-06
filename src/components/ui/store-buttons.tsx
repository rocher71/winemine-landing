'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

// ── Apple logo ─────────────────────────────────────────────────────────────
function AppleIcon() {
  return (
    <svg width="18" height="22" viewBox="0 0 814 1000" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-47.4-148.2-112.7C141 420.5 147 350.5 156.2 315c35.9-130.8 130.8-202.1 220.4-202.1 76 0 130.8 51.4 186.4 51.4 53 0 115.7-55.8 186.4-55.8 32.1 0 107.6 2.6 156.3 77.4zm-286.5-58.5c-21.2-26.2-60.7-45.2-99.9-45.2-5.7 0-11.4.6-16.4 1.3 7.7 53.1 35.3 100.3 69.9 127.3 32.1 25 70.5 40.1 108.4 40.1 3.2 0 6.4-.3 9.6-.6-10.3-53.7-40.1-96.9-71.6-122.9z" />
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
  const [hoveredIos, setHoveredIos] = useState(false);
  const [hoveredAndroid, setHoveredAndroid] = useState(false);

  const isCompact = size === 'compact';

  const baseStyle = (hovered: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: isCompact ? 8 : 10,
    background: hovered ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: isCompact ? 10 : 12,
    padding: isCompact ? '8px 14px' : '11px 20px',
    cursor: 'pointer',
    color: '#F5F0E8',
    transition: 'all 200ms ease',
    minWidth: isCompact ? 130 : 155,
    transform: hovered ? 'translateY(-1px)' : 'none',
    boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
    fontFamily: 'inherit',
  });

  const handleClick = (store: 'ios' | 'android') => {
    trackEvent('store_button_click', { store, location });
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
            Download on the
          </div>
          <div style={{ fontSize: isCompact ? 13 : 15, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            App Store
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
            Get it on
          </div>
          <div style={{ fontSize: isCompact ? 13 : 15, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            Google Play
          </div>
        </div>
      </button>
    </div>
  );
}
