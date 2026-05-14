'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { StoreButtons } from '@/components/ui/store-buttons';
import { useLocale } from '@/components/providers/locale-provider';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface FinalCTASectionProps {
  onOpenModal: () => void;
}

export default function FinalCTASection({ onOpenModal }: FinalCTASectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLocale();

  return (
    <>
      <section style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(196,30,58,0.08) 0%, transparent 58%), var(--color-bg-deepest)', padding: 'clamp(80px, 10vw, 120px) 24px' }}>
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
              color: 'var(--color-text-primary)',
              lineHeight: 1.2,
            }}
          >
            Make your own Wine Map
          </h2>
          <p style={{ fontSize: 16, color: 'var(--color-text-muted)', marginTop: 16 }}>
            {t('finalCta.body')}
          </p>
          <div style={{ marginTop: 40 }}>
            <StoreButtons onOpenModal={onOpenModal} location="final_cta" />
          </div>
        </motion.div>
      </section>

      <footer
        style={{
          background: 'var(--color-bg-deepest)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          borderTop: '1px solid var(--color-border-soft)',
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--color-text-disabled)' }}>
          {t('finalCta.copyright')}
        </p>
        <ThemeToggle />
      </footer>
    </>
  );
}
