'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useLocale } from '@/components/providers/locale-provider';
import { trackEvent } from '@/lib/analytics';

interface WaitlistSuccessProps {
  onClose: () => void;
}

export default function WaitlistSuccess({ onClose }: WaitlistSuccessProps) {
  const { t } = useLocale();
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ textAlign: 'center', padding: '16px 0' }}
    >
      <CheckCircle2 size={64} style={{ color: 'var(--color-gold)', margin: '0 auto 24px' }} />
      <h3
        style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontSize: 28,
          fontWeight: 400,
          color: 'var(--color-text-primary)',
          marginBottom: 12,
        }}
      >
        {t('waitlistSuccess.heading')}
      </h3>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
        {t('waitlistSuccess.message').split('\n')[0]}<br />{t('waitlistSuccess.message').split('\n')[1]}
      </p>
      <button
        onClick={() => {
          trackEvent('waitlist_success_close', {
            button_id: 'waitlist_success_close',
          });
          onClose();
        }}
        style={{
          marginTop: 32,
          border: '1px solid var(--color-border)',
          background: 'transparent',
          color: 'var(--color-text-muted)',
          padding: '12px 32px',
          borderRadius: 4,
          fontSize: 15,
          cursor: 'pointer',
          transition: 'all 150ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-wine-red)';
          e.currentTarget.style.color = 'var(--color-text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.color = 'var(--color-text-muted)';
        }}
      >
        {t('waitlistSuccess.closeButton')}
      </button>
    </motion.div>
  );
}
