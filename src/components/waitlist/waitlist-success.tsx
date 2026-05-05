'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface WaitlistSuccessProps {
  onClose: () => void;
}

export default function WaitlistSuccess({ onClose }: WaitlistSuccessProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ textAlign: 'center', padding: '16px 0' }}
    >
      <CheckCircle2 size={64} style={{ color: '#C9A84C', margin: '0 auto 24px' }} />
      <h3
        style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontSize: 28,
          fontWeight: 400,
          color: '#F5F0E8',
          marginBottom: 12,
        }}
      >
        신청이 완료되었습니다!
      </h3>
      <p style={{ fontSize: 14, color: '#9B8B7A', lineHeight: 1.6 }}>
        출시되면 가장 먼저 알려드리겠습니다.
        <br />
        좋은 와인과 함께하는 날을 기대해주세요.
      </p>
      <button
        onClick={onClose}
        style={{
          marginTop: 32,
          border: '1px solid #2D1540',
          background: 'transparent',
          color: '#9B8B7A',
          padding: '12px 32px',
          borderRadius: 4,
          fontSize: 15,
          cursor: 'pointer',
          transition: 'all 150ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#8B1A2A';
          e.currentTarget.style.color = '#F5F0E8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#2D1540';
          e.currentTarget.style.color = '#9B8B7A';
        }}
      >
        닫기
      </button>
    </motion.div>
  );
}
