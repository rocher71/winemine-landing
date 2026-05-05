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
              background: 'rgba(5,2,8,0.85)',
              backdropFilter: 'blur(4px)',
              zIndex: 50,
            }}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
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
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'transparent',
                border: 'none',
                color: '#4A3D56',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#F5F0E8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#4A3D56';
              }}
              aria-label="모달 닫기"
            >
              <X size={20} />
            </button>

            {!showSuccess && (
              <>
                <h2
                  id="modal-title"
                  style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontSize: 32,
                    fontWeight: 400,
                    color: '#F5F0E8',
                  }}
                >
                  사전 신청
                </h2>
                <p style={{ fontSize: 14, color: '#9B8B7A', marginTop: 12, lineHeight: 1.6 }}>
                  이메일 또는 전화번호를 남겨주시면
                  <br />
                  앱 출시 시 가장 먼저 알려드립니다.
                </p>
                <div
                  style={{
                    width: 40,
                    height: 2,
                    background: '#C9A84C',
                    margin: '16px 0 32px',
                  }}
                />
              </>
            )}

            {showSuccess ? (
              <WaitlistSuccess onClose={onClose} />
            ) : (
              <WaitlistForm onSuccess={() => setShowSuccess(true)} />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
