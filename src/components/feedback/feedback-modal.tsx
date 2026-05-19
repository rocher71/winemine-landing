'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import FeedbackForm from './feedback-form';
import FeedbackSuccess from './feedback-success';
import { useLocale } from '@/components/providers/locale-provider';
import { trackEvent } from '@/lib/analytics';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { t } = useLocale();
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
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'var(--color-modal-backdrop)',
              backdropFilter: 'blur(4px)',
              zIndex: 50,
            }}
          />

          <motion.div
            initial={
              isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0, x: '-50%', y: '-50%' }
            }
            animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
            exit={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0, x: '-50%', y: '-50%' }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={
              isMobile
                ? {
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'var(--color-bg-surface)',
                    borderTop: '1px solid var(--color-border)',
                    borderRadius: '20px 20px 0 0',
                    padding: '28px 24px 36px',
                    boxShadow: '0 -20px 60px rgba(0,0,0,0.7)',
                    zIndex: 51,
                    maxHeight: '92vh',
                    overflowY: 'auto',
                  }
                : {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    width: 'min(520px, calc(100vw - 32px))',
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    padding: 'clamp(32px, 5vw, 48px) clamp(24px, 5vw, 40px)',
                    boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
                    zIndex: 51,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                  }
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
          >
            {isMobile && (
              <div
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  background: 'var(--color-border)',
                  margin: '-8px auto 20px',
                }}
              />
            )}

            <button
              onClick={() => {
                trackEvent('feedback_modal_close', {
                  stage: showSuccess ? 'success' : 'form',
                  button_id: 'feedback_modal_close_x',
                });
                onClose();
              }}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-disabled)',
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 150ms ease',
                minWidth: 44,
                minHeight: 44,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-disabled)';
              }}
              aria-label={t('feedbackModal.closeAriaLabel')}
            >
              <X size={20} />
            </button>

            {!showSuccess && (
              <>
                <h2
                  id="feedback-modal-title"
                  style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontSize: isMobile ? 28 : 32,
                    fontWeight: 400,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {t('feedbackModal.title')}
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--color-text-muted)',
                    marginTop: 12,
                    lineHeight: 1.6,
                  }}
                >
                  {t('feedbackModal.description').split('\n')[0]}
                  <br />
                  {t('feedbackModal.description').split('\n')[1]}
                </p>
                <div
                  style={{
                    width: 40,
                    height: 2,
                    background: 'var(--color-gold)',
                    margin: '16px 0 28px',
                  }}
                />
              </>
            )}

            {showSuccess ? (
              <FeedbackSuccess onClose={onClose} />
            ) : (
              <FeedbackForm onSuccess={() => setShowSuccess(true)} />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
