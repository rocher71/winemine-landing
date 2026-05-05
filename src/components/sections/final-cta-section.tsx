'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface FinalCTASectionProps {
  onOpenModal: () => void;
}

export default function FinalCTASection({ onOpenModal }: FinalCTASectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <section style={{ background: '#05020A', padding: 'clamp(80px, 10vw, 120px) 24px' }}>
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 400,
              color: '#F5F0E8',
              lineHeight: 1.2,
            }}
          >
            Make your own Wine Map
          </h2>
          <p style={{ fontSize: 16, color: '#9B8B7A', marginTop: 16 }}>
            사전 신청하시면 출시 즉시 알려드립니다.
          </p>
          <button
            onClick={onOpenModal}
            style={{
              marginTop: 40,
              background: '#8B1A2A',
              color: '#F5F0E8',
              border: 'none',
              height: 56,
              padding: '0 40px',
              borderRadius: 4,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#A02030';
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(139,26,42,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#8B1A2A';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            앱 다운받기
          </button>
        </motion.div>
      </section>

      <footer
        style={{
          background: '#030106',
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ fontSize: 13, color: '#4A3D56' }}>
          © 2025 winemine. All rights reserved.
        </p>
      </footer>
    </>
  );
}
