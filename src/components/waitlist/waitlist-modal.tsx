'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import WaitlistForm from './waitlist-form';
import WaitlistSuccess from './waitlist-success';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setShowSuccess(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(29,29,31,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 50,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={isMobile ? { y: '100%' } : { scale: 0.96, opacity: 0 }}
            animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
            exit={isMobile ? { y: '100%' } : { scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={isMobile ? {
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              background: 'var(--color-canvas)',
              borderTop: '1px solid var(--color-hairline)',
              borderRadius: '20px 20px 0 0',
              padding: '28px 24px 36px',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
              zIndex: 51,
              maxHeight: '92vh',
              overflowY: 'auto',
            } : {
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(480px, calc(100vw - 32px))',
              background: 'var(--color-canvas)',
              border: '1px solid var(--color-hairline)',
              borderRadius: 18,
              padding: 'clamp(32px, 5vw, 48px) clamp(24px, 5vw, 40px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              zIndex: 51,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Mobile drag handle */}
            {isMobile && (
              <div style={{
                width: 40, height: 4, borderRadius: 2,
                background: 'var(--color-hairline)',
                margin: '-8px auto 20px',
              }} />
            )}

            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'transparent', border: 'none',
                color: 'var(--color-ink-disabled)', cursor: 'pointer',
                padding: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'color 150ms ease',
                minWidth: 44, minHeight: 44,
                borderRadius: 9999,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-ink)'; e.currentTarget.style.background = 'var(--color-parchment)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink-disabled)'; e.currentTarget.style.background = 'transparent'; }}
              aria-label="모달 닫기"
            >
              <X size={20} />
            </button>

            {!showSuccess && (
              <>
                <h2 id="modal-title" style={{
                  fontSize: isMobile ? 24 : 28,
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  letterSpacing: '-0.374px',
                  lineHeight: 1.1,
                }}>
                  사전 신청
                </h2>
                <p style={{
                  fontSize: 17,
                  color: 'var(--color-ink-muted)',
                  marginTop: 10,
                  lineHeight: 1.47,
                  letterSpacing: '-0.374px',
                }}>
                  이메일 또는 전화번호를 남겨주시면<br />
                  앱 출시 시 가장 먼저 알려드립니다.
                </p>
                <div style={{ height: 1, background: 'var(--color-hairline)', margin: '24px 0' }} />
              </>
            )}

            {showSuccess
              ? <WaitlistSuccess onClose={onClose} />
              : <WaitlistForm onSuccess={() => setShowSuccess(true)} />
            }
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
