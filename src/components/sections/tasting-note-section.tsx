'use client';

// Tasting Note Section
// 와인 시음 노트 디지털 양식 시연 — White / Red / Sparkling / Blind 4탭
// spec: _workspace/tasting-note-section-spec.md
//
// Day 1: 빈 골격 + 헤더만. Day 2 이후 양식 mockup, 부케 휠, 카우달리,
//        결함 체크리스트, Opening Timeline, 자동 묘사 박스 순서로 채워짐.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from '@/components/providers/locale-provider';
import type { FormVariant } from '@/lib/tasting-note-lexicon';

const VARIANTS: { id: FormVariant; icon: string }[] = [
  { id: 'white',     icon: '🥂' },
  { id: 'red',       icon: '🍷' },
  { id: 'sparkling', icon: '✨' },
  { id: 'blind',     icon: '🎯' },
];

interface Props {
  onOpenModal?: () => void;
}

export default function TastingNoteSection({ onOpenModal }: Props) {
  const { t } = useLocale();
  const [variant, setVariant] = useState<FormVariant>('white');

  return (
    <section
      id="tasting-note"
      style={{
        background: '#0A050F',
        borderTop: '1px solid rgba(201,168,76,0.12)',
        padding: 'clamp(64px, 12vw, 128px) clamp(20px, 5vw, 48px)',
        color: '#F5F0E8',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <SectionEyebrow text={t('tastingNote.eyebrow')} />
          <h2
            style={{
              fontFamily: 'var(--font-playfair, Georgia, serif)',
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#F5F0E8',
              margin: '24px auto 16px',
              maxWidth: 720,
              lineHeight: 1.25,
            }}
          >
            {t('tastingNote.heading')}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-inter, system-ui, sans-serif)',
              fontSize: 16,
              lineHeight: 1.6,
              color: '#9B8B7A',
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            {t('tastingNote.subhead')}
          </p>
        </motion.div>

        {/* Form Tab Bar */}
        <FormTabBar active={variant} onSelect={setVariant} t={t} />

        {/* Main Canvas — Day 2 이후 채워짐 */}
        <div
          style={{
            marginTop: 48,
            minHeight: 320,
            border: '1px dashed rgba(201,168,76,0.18)',
            borderRadius: 16,
            padding: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9B8B7A',
            fontSize: 14,
            fontFamily: 'var(--font-inter, system-ui, sans-serif)',
          }}
        >
          <span style={{ opacity: 0.6 }}>
            {t('tastingNote.placeholder').replace('{variant}', t(`tastingNote.tabs.${variant}`))}
          </span>
        </div>

        {/* Section Footer */}
        <div
          style={{
            marginTop: 64,
            textAlign: 'center',
            color: '#D4C5B0',
            fontFamily: 'var(--font-inter, system-ui, sans-serif)',
            fontSize: 16,
            lineHeight: 1.5,
          }}
        >
          <p style={{ marginBottom: 24, color: '#9B8B7A' }}>{t('tastingNote.outro')}</p>
          {onOpenModal && (
            <button
              type="button"
              onClick={onOpenModal}
              style={{
                background: 'transparent',
                border: '1px solid #C9A84C',
                color: '#C9A84C',
                padding: '12px 28px',
                borderRadius: 28,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 200ms ease',
              }}
            >
              {t('tastingNote.cta.waitlist')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SectionEyebrow({ text }: { text: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'var(--font-inter, system-ui, sans-serif)',
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#C9A84C',
      }}
    >
      <span style={{ width: 8, height: 1, background: '#C9A84C' }} />
      {text}
      <span style={{ width: 8, height: 1, background: '#C9A84C' }} />
    </div>
  );
}

function FormTabBar({
  active,
  onSelect,
  t,
}: {
  active: FormVariant;
  onSelect: (v: FormVariant) => void;
  t: (key: string) => string;
}) {
  return (
    <div
      role="tablist"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        background: 'rgba(15,7,24,0.6)',
        border: '1px solid rgba(201,168,76,0.16)',
        borderRadius: 12,
        overflow: 'hidden',
        maxWidth: 720,
        margin: '0 auto',
      }}
    >
      {VARIANTS.map(v => {
        const isActive = active === v.id;
        return (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(v.id)}
            style={{
              background: isActive ? 'rgba(139,26,42,0.18)' : 'transparent',
              border: 'none',
              borderBottom: isActive ? '2px solid #C9A84C' : '2px solid transparent',
              color: isActive ? '#F5F0E8' : '#9B8B7A',
              padding: '14px 8px',
              cursor: 'pointer',
              fontFamily: 'var(--font-inter, system-ui, sans-serif)',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 200ms ease, color 200ms ease',
            }}
          >
            <span style={{ fontSize: 18 }} aria-hidden>
              {v.icon}
            </span>
            <span>{t(`tastingNote.tabs.${v.id}`)}</span>
          </button>
        );
      })}
    </div>
  );
}
