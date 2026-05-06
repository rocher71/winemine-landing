'use client';

import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const WorldMap = dynamic(() => import('@/components/map/world-map'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0" style={{ background: '#1a1214' }} />
  ),
});

interface HeroSectionProps {
  onOpenModal: () => void;
}

export default function HeroSection({ onOpenModal }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = shouldReduceMotion
    ? {}
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <section className="relative overflow-hidden" style={{ height: '100vh' }}>
      <WorldMap />

      {/* Minimal overlay — atmosphere, not decoration */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(26,18,20,0.1) 0%, rgba(26,18,20,0.5) 55%, rgba(26,18,20,0.82) 100%)',
        }}
      />

      {/* Content */}
      <div
        className="absolute left-1/2 text-center"
        style={{
          top: '38%',
          transform: 'translateX(-50%)',
          width: '100%',
          padding: '0 24px',
        }}
      >
        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, var(--font-inter), system-ui, sans-serif',
            fontSize: 'clamp(40px, 7vw, 56px)',
            fontWeight: 600,
            color: '#f5f0e8',
            letterSpacing: '-0.28px',
            lineHeight: 1.07,
            margin: 0,
          }}
        >
          winemine
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.42 }}
          style={{
            fontSize: 'clamp(17px, 2.5vw, 21px)',
            fontWeight: 600,
            color: 'rgba(245,240,232,0.75)',
            letterSpacing: '0.231px',
            marginTop: 16,
            marginBottom: 0,
          }}
        >
          Your wine journey, mapped.
        </motion.p>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            fontSize: 17,
            fontWeight: 400,
            color: 'rgba(245,240,232,0.55)',
            letterSpacing: '-0.374px',
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          라벨을 찍으면, 세계가 물든다.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.65 }}
          style={{
            marginTop: 40,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={onOpenModal}
            className="btn-pill btn-primary-on-dark"
            style={{ height: 44, padding: '0 22px', fontSize: 17 }}
          >
            앱 다운받기
          </button>
          <button
            type="button"
            onClick={onOpenModal}
            className="btn-pill btn-ghost-on-dark"
            style={{ height: 44, padding: '0 22px', fontSize: 17 }}
          >
            더 알아보기
          </button>
        </motion.div>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.72 }}
          style={{
            fontSize: 12,
            color: 'rgba(245,240,232,0.35)',
            letterSpacing: '-0.12px',
            marginTop: 14,
          }}
        >
          coming soon — 지금 사전 신청하세요
        </motion.p>
      </div>

      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(245,240,232,0.4)',
        }}
      >
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
}
