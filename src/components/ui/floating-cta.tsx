'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';

function AppleIconSmall() {
  return (
    <svg width="13" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
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
  isModalOpen?: boolean;
}

export function FloatingCTA({ onOpenModal, isModalOpen = false }: FloatingCTAProps) {
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
      {show && !isModalOpen && (
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
