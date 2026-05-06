'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface FinalCTASectionProps {
  onOpenModal: () => void;
}

export default function FinalCTASection({ onOpenModal }: FinalCTASectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <section style={{ background: 'var(--bg-tile-dark-glow)', padding: 'clamp(48px,8vw,80px) 24px' }}>
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}
        >
          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 600,
            color: 'var(--color-on-dark)',
            letterSpacing: '-0.374px',
            lineHeight: 1.1,
          }}>
            Make your own Wine Map
          </h2>
          <p style={{
            fontSize: 17,
            color: 'var(--color-on-dark-muted)',
            letterSpacing: '-0.374px',
            lineHeight: 1.47,
            marginTop: 16,
          }}>
            사전 신청하시면 출시 즉시 알려드립니다.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 40, flexWrap: 'wrap' }}>
            <button
              onClick={onOpenModal}
              className="btn-pill btn-primary-on-dark"
              style={{ height: 44, padding: '0 22px', fontSize: 17 }}
            >
              앱 다운받기
            </button>
            <button
              onClick={onOpenModal}
              className="btn-pill btn-ghost-on-dark"
              style={{ height: 44, padding: '0 22px', fontSize: 17 }}
            >
              더 알아보기
            </button>
          </div>
        </motion.div>
      </section>

      <footer style={{
        background: 'var(--color-tile-dark-2)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '28px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '-0.12px',
        }}>
          © 2025 winemine. All rights reserved.
        </p>
      </footer>
    </>
  );
}
