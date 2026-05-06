'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface WaitlistSuccessProps {
  onClose: () => void;
}

export default function WaitlistSuccess({ onClose }: WaitlistSuccessProps) {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ textAlign: 'center', padding: '16px 0' }}
    >
      <CheckCircle2
        size={56}
        style={{ color: 'var(--color-action)', margin: '0 auto 20px' }}
      />
      <h3 style={{
        fontSize: 24,
        fontWeight: 600,
        color: 'var(--color-ink)',
        letterSpacing: '-0.374px',
        lineHeight: 1.1,
        marginBottom: 10,
      }}>
        신청이 완료되었습니다!
      </h3>
      <p style={{
        fontSize: 17,
        color: 'var(--color-ink-muted)',
        lineHeight: 1.47,
        letterSpacing: '-0.374px',
      }}>
        출시되면 가장 먼저 알려드리겠습니다.<br />
        좋은 와인과 함께하는 날을 기대해주세요.
      </p>
      <button
        onClick={onClose}
        className="btn-pill btn-secondary-pill"
        style={{ marginTop: 28, height: 44, padding: '0 28px', fontSize: 17 }}
      >
        닫기
      </button>
    </motion.div>
  );
}
