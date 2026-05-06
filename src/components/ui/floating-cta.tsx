'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';

function AppleIconSmall() {
  return (
    <svg width="13" height="16" viewBox="0 0 814 1000" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-47.4-148.2-112.7C141 420.5 147 350.5 156.2 315c35.9-130.8 130.8-202.1 220.4-202.1 76 0 130.8 51.4 186.4 51.4 53 0 115.7-55.8 186.4-55.8 32.1 0 107.6 2.6 156.3 77.4zm-286.5-58.5c-21.2-26.2-60.7-45.2-99.9-45.2-5.7 0-11.4.6-16.4 1.3 7.7 53.1 35.3 100.3 69.9 127.3 32.1 25 70.5 40.1 108.4 40.1 3.2 0 6.4-.3 9.6-.6-10.3-53.7-40.1-96.9-71.6-122.9z" />
    </svg>
  );
}

function PlayIconSmall() {
  return (
    <svg width="13" height="15" viewBox="0 0 512 512" fill="none" style={{ flexShrink: 0 }}>
      <path d="M99.617 8.057a50.191 50.191 0 00-38.815-6.713l230.932 230.933 74.846-74.846L99.617 8.057z" fill="#4CAF50" />
      <path d="M32.139 20.116c-6.441 8.563-10.148 19.077-10.148 30.199v411.358c0 11.123 3.708 21.636 10.148 30.199l235.877-235.877L32.139 20.116z" fill="#00BCD4" />
      <path d="M464.261 212.087l-67.266-37.637-81.544 81.544 81.548 81.548 67.273-37.64c19.117-10.716 19.117-37.238-.011-47.815z" fill="#FFD740" />
      <path d="M140.396 489.711a50.185 50.185 0 0038.822-6.22L410.299 334.986l-74.832-74.832-195.071 229.557z" fill="#F44336" />
    </svg>
  );
}

interface FloatingCTAProps {
  onOpenModal: () => void;
}

export function FloatingCTA({ onOpenModal }: FloatingCTAProps) {
  const [show, setShow] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      // 히어로 섹션(1vh) 지나면 표시
      setShow(scrollY > vh * 0.9);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    trackEvent('floating_cta_click', { location: 'floating' });
    onOpenModal();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: 'fixed',
            bottom: 28,
            right: 24,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: hovered ? '#A02030' : '#8B1A2A',
            border: 'none',
            borderRadius: 28,
            padding: '12px 18px 12px 14px',
            cursor: 'pointer',
            color: '#F5F0E8',
            boxShadow: hovered
              ? '0 8px 32px rgba(139,26,42,0.6), 0 2px 8px rgba(0,0,0,0.3)'
              : '0 4px 24px rgba(139,26,42,0.45), 0 2px 8px rgba(0,0,0,0.3)',
            transition: 'background 200ms ease, box-shadow 200ms ease',
            transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
            fontFamily: 'inherit',
          }}
        >
          {/* 스토어 아이콘 2개 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <AppleIconSmall />
            <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.25)' }} />
            <PlayIconSmall />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            앱 다운받기
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
