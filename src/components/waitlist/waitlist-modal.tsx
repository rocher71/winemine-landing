'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import WaitlistForm from './waitlist-form';
import WaitlistSuccess from './waitlist-success';
import { useLocale } from '@/components/providers/locale-provider';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
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
              background: 'rgba(5,2,8,0.85)',
              backdropFilter: 'blur(4px)',
              zIndex: 50,
            }}
          />

          {/* Modal — desktop: centered, mobile: bottom sheet */}
          <motion.div
            initial={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0, x: '-50%', y: '-50%' }}
            animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
            exit={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0, x: '-50%', y: '-50%' }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={isMobile ? {
              /* Mobile: bottom sheet */
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              background: '#0F0718',
              borderTop: '1px solid #2D1540',
              borderRadius: '20px 20px 0 0',
              padding: '28px 24px 36px',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.7)',
              zIndex: 51,
              maxHeight: '92vh',
              overflowY: 'auto',
            } : {
              /* Desktop: centered modal — framer-motion x/y handle the -50% offset */
              position: 'fixed',
              top: '50%', left: '50%',
              width: 'min(480px, calc(100vw - 32px))',
              background: '#0F0718',
              border: '1px solid #2D1540',
              borderRadius: 8,
              padding: 'clamp(32px, 5vw, 48px) clamp(24px, 5vw, 40px)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
              zIndex: 51,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Mobile: drag handle pill */}
            {isMobile && (
              <div style={{
                width: 40, height: 4, borderRadius: 2,
                background: '#2D1540',
                margin: '-8px auto 20px',
              }} />
            )}

            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'transparent', border: 'none',
                color: '#4A3D56', cursor: 'pointer',
                padding: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'color 150ms ease',
                minWidth: 44, minHeight: 44,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#F5F0E8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#4A3D56'; }}
              aria-label={t('waitlistModal.closeAriaLabel')}
            >
              <X size={20} />
            </button>

            {!showSuccess && (
              <>
                <h2 id="modal-title" style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: isMobile ? 28 : 32,
                  fontWeight: 400, color: '#F5F0E8',
                }}>
                  {t('waitlistModal.title')}
                </h2>
                <p style={{ fontSize: 14, color: '#9B8B7A', marginTop: 12, lineHeight: 1.6 }}>
                  {t('waitlistModal.description').split('\n')[0]}<br />{t('waitlistModal.description').split('\n')[1]}
                </p>
                <div style={{ width: 40, height: 2, background: '#C9A84C', margin: '16px 0 32px' }} />
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
