'use client';

import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { StoreButtons } from '@/components/ui/store-buttons';
import { useLocale } from '@/components/providers/locale-provider';

const WorldMap = dynamic(() => import('@/components/map/world-map'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0" style={{ background: '#05020A' }} />
  ),
});

interface HeroSectionProps {
  onOpenModal: () => void;
}

export default function HeroSection({ onOpenModal }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLocale();

  const fadeUp = shouldReduceMotion
    ? {}
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <section className="relative overflow-hidden" style={{ height: '100vh' }}>
      <WorldMap />

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(5,2,8,0.05) 0%, rgba(5,2,8,0.35) 50%, rgba(5,2,8,0.75) 100%)',
        }}
      />

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
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(48px, 8vw, 72px)',
            fontWeight: 700,
            color: '#F5F0E8',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          WineMine
        </motion.h1>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            width: 80,
            height: 2,
            background: '#C9A84C',
            margin: '16px auto',
          }}
        />

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.45 }}
          style={{
            fontSize: 18,
            fontWeight: 300,
            color: '#D4C5B0',
            margin: 0,
          }}
        >
          Your wine journey, mapped.
        </motion.p>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            fontSize: 14,
            color: '#9B8B7A',
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.7 }}
          style={{ marginTop: 48 }}
        >
          <StoreButtons onOpenModal={onOpenModal} location="hero" />
        </motion.div>
      </div>

      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#9B8B7A',
        }}
      >
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
}
