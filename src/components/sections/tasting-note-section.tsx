'use client';

// Tasting Note Section
// 4종 양식 (White/Red/Sparkling/Blind) 의 "이미 작성된" 정적 mockup 전시.
// 사용자는 4탭만 전환하며, mockup 안의 모든 필드는 인터랙티브하지 않다.
// 모든 텍스트는 useLocale() 의 t() 또는 lex[locale] 로 분기.
// 폰 베젤은 iPhone 14/15 스타일 (Dynamic Island + status bar + home indicator).
//
// spec: _workspace/tasting-note-section-spec.md

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/components/providers/locale-provider';
import {
  MOCK_WINES,
  LEX_BY_ID,
  SWEETNESS_LABELS,
  ACIDITY_LABELS,
  BODY_LABELS,
  ALCOHOL_LABELS,
  TANNIN_INTENSITY_LABELS,
  DOSAGE_LABELS,
  SPARKLING_METHOD_LABELS,
  caudalieCategory,
  caudalieComparison,
  type FormVariant,
  type MockWine,
  type WSETScale,
} from '@/lib/tasting-note-lexicon';

const VARIANTS: { id: FormVariant; icon: string }[] = [
  { id: 'white',     icon: '🥂' },
  { id: 'red',       icon: '🍷' },
  { id: 'sparkling', icon: '✨' },
  { id: 'blind',     icon: '🎯' },
];

// 디자인 토큰
const PAPER_BG = '#F5F0E8';
const PAPER_INK = '#1A0A1E';
const PAPER_INK_DIM = 'rgba(26,10,30,0.42)';
const PAPER_INK_VERY_DIM = 'rgba(26,10,30,0.18)';
const PAPER_LINE = 'rgba(26,10,30,0.10)';
const GOLD = '#C9A84C';
const WINE_RED = '#8B1A2A';

// 폰 mockup 크기
const PHONE_WIDTH = 392;
const PHONE_BEZEL = 12;
const PHONE_INNER_RADIUS = 44;
const STATUS_BAR_HEIGHT = 48;

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
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          style={{ textAlign: 'center', marginBottom: 32 }}
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

        <FormTabBar active={variant} onSelect={setVariant} t={t} />

        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
          <PhoneFrame>
            <AnimatePresence mode="wait">
              <motion.div
                key={variant}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              >
                <MockupForVariant variant={variant} />
              </motion.div>
            </AnimatePresence>
          </PhoneFrame>
        </div>

        <div
          style={{
            marginTop: 56,
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

// ─────────────────────────────────────────────────────────────────────────────
// Section header / Tab bar
// ─────────────────────────────────────────────────────────────────────────────

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
        color: GOLD,
      }}
    >
      <span style={{ width: 8, height: 1, background: GOLD }} />
      {text}
      <span style={{ width: 8, height: 1, background: GOLD }} />
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
              background: isActive ? 'rgba(139,26,42,0.22)' : 'transparent',
              border: 'none',
              borderBottom: isActive ? `2px solid ${GOLD}` : '2px solid transparent',
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

// ─────────────────────────────────────────────────────────────────────────────
// iPhone Mockup Frame — Dynamic Island + status bar + home indicator
// ─────────────────────────────────────────────────────────────────────────────

function PhoneFrame({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: PHONE_WIDTH,
      }}
    >
      {/* Side buttons (volume + power) — purely decorative */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: -2,
          top: 96,
          width: 3,
          height: 28,
          background: '#0A050F',
          borderTopLeftRadius: 2,
          borderBottomLeftRadius: 2,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: -2,
          top: 138,
          width: 3,
          height: 52,
          background: '#0A050F',
          borderTopLeftRadius: 2,
          borderBottomLeftRadius: 2,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: -2,
          top: 196,
          width: 3,
          height: 52,
          background: '#0A050F',
          borderTopLeftRadius: 2,
          borderBottomLeftRadius: 2,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: -2,
          top: 156,
          width: 3,
          height: 76,
          background: '#0A050F',
          borderTopRightRadius: 2,
          borderBottomRightRadius: 2,
        }}
      />

      {/* Outer bezel */}
      <div
        style={{
          background: '#050208',
          borderRadius: 56,
          padding: PHONE_BEZEL,
          border: '1px solid rgba(245,240,232,0.08)',
          boxShadow:
            '0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,168,76,0.06), inset 0 0 0 1px rgba(245,240,232,0.04)',
        }}
      >
        {/* Inner screen */}
        <div
          style={{
            position: 'relative',
            background: PAPER_BG,
            borderRadius: PHONE_INNER_RADIUS,
            overflow: 'hidden',
            color: PAPER_INK,
            fontFamily: 'var(--font-inter, system-ui, sans-serif)',
            paddingBottom: 28, // home indicator 자리
          }}
        >
          {/* Status bar row */}
          <div
            style={{
              position: 'relative',
              height: STATUS_BAR_HEIGHT,
              padding: '0 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 14,
              fontWeight: 600,
              color: PAPER_INK,
              letterSpacing: '-0.01em',
            }}
          >
            <span>{t('tastingNote.mockup.statusTime')}</span>

            {/* Dynamic Island — absolute centered */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 108,
                height: 30,
                background: '#000',
                borderRadius: 999,
              }}
            />

            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }} aria-hidden>
              <SignalGlyph />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em' }}>LTE</span>
              <BatteryGlyph />
            </span>
          </div>

          {/* Mock content */}
          {children}

          {/* Home indicator */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 132,
              height: 5,
              background: PAPER_INK,
              opacity: 0.32,
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function SignalGlyph() {
  return (
    <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
      <rect x="0"  y="7" width="3" height="4"  rx="0.6" />
      <rect x="4"  y="5" width="3" height="6"  rx="0.6" />
      <rect x="8"  y="3" width="3" height="8"  rx="0.6" />
      <rect x="12" y="0" width="3" height="11" rx="0.6" />
    </svg>
  );
}

function BatteryGlyph() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="currentColor" strokeOpacity="0.4" />
      <rect x="2"   y="2"   width="14" height="8"  rx="1.5" fill="currentColor" />
      <rect x="23"  y="4"   width="1.5" height="4" rx="0.5" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mockup dispatcher
// ─────────────────────────────────────────────────────────────────────────────

function MockupForVariant({ variant }: { variant: FormVariant }) {
  const wine = MOCK_WINES.find(w => w.variant === variant);
  if (!wine) return null;
  switch (variant) {
    case 'white':     return <WhiteMockup wine={wine} />;
    case 'red':       return <RedMockup wine={wine} />;
    case 'sparkling': return <SparklingMockup wine={wine} />;
    case 'blind':     return <BlindMockup wine={wine} />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Common building blocks (i18n-aware)
// ─────────────────────────────────────────────────────────────────────────────

function PaperHeader({
  titleKey,
  subtitleKey,
  accent,
}: {
  titleKey: 'white' | 'red' | 'sparkling' | 'blind';
  subtitleKey: 'journal' | 'blind';
  accent: string;
}) {
  const { t } = useLocale();
  return (
    <div
      style={{
        padding: '8px 22px 14px',
        borderBottom: `1px solid ${PAPER_LINE}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-playfair, Georgia, serif)',
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: PAPER_INK,
              lineHeight: 1.2,
            }}
          >
            {t(`tastingNote.mockup.title.${titleKey}`)}
          </div>
          <div
            style={{
              fontSize: 10,
              fontStyle: 'italic',
              color: PAPER_INK_DIM,
              letterSpacing: '0.04em',
              marginTop: 4,
            }}
          >
            {t(`tastingNote.mockup.subtitle.${subtitleKey}`)}
          </div>
        </div>
        <div
          style={{
            fontSize: 10,
            color: PAPER_INK_DIM,
            letterSpacing: '0.06em',
          }}
        >
          {t('tastingNote.mockup.fakeDate')}
        </div>
      </div>
      <div
        style={{
          marginTop: 12,
          height: 2,
          width: 36,
          background: accent,
          borderRadius: 2,
        }}
      />
    </div>
  );
}

function PaperSection({
  titleKey,
  hint,
  children,
}: {
  titleKey: string;
  hint?: string;
  children: ReactNode;
}) {
  const { t } = useLocale();
  return (
    <div style={{ padding: '14px 22px', borderBottom: `1px solid ${PAPER_LINE}` }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: PAPER_INK,
          }}
        >
          {t(titleKey)}
        </div>
        {hint && (
          <div style={{ fontSize: 10, fontStyle: 'italic', color: PAPER_INK_DIM }}>{hint}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function MetaRow({ labelKey, value }: { labelKey: string; value: string | number }) {
  const { t } = useLocale();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        padding: '4px 0',
        borderBottom: `1px dashed ${PAPER_LINE}`,
        fontSize: 12,
      }}
    >
      <span
        style={{
          color: PAPER_INK_DIM,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          fontSize: 10,
          fontWeight: 600,
        }}
      >
        {t(labelKey)}
      </span>
      <span
        style={{ color: PAPER_INK, textAlign: 'right', maxWidth: '70%', wordBreak: 'break-word' }}
      >
        {value}
      </span>
    </div>
  );
}

function WineIdentity({ wine }: { wine: MockWine }) {
  const { t, locale } = useLocale();
  const priceFmt = locale === 'ko'
    ? `₩${wine.pricePaid.toLocaleString('ko-KR')}`
    : `₩${wine.pricePaid.toLocaleString('en-US')}`;
  return (
    <PaperSection titleKey="tastingNote.mockup.section.wine">
      <div
        style={{
          fontFamily: 'var(--font-playfair, Georgia, serif)',
          fontSize: 16,
          fontWeight: 700,
          color: PAPER_INK,
          lineHeight: 1.3,
          marginBottom: 4,
        }}
      >
        {wine.wineName}
      </div>
      <div
        style={{ fontSize: 11, fontStyle: 'italic', color: PAPER_INK_DIM, marginBottom: 10 }}
      >
        {wine.producer}
      </div>
      <MetaRow
        labelKey="tastingNote.mockup.meta.vintage"
        value={wine.vintage === 0 ? t('tastingNote.mockup.meta.nv') : wine.vintage}
      />
      <MetaRow labelKey="tastingNote.mockup.meta.region" value={wine.region} />
      <MetaRow labelKey="tastingNote.mockup.meta.appellation" value={wine.appellation} />
      <MetaRow labelKey="tastingNote.mockup.meta.grape" value={wine.grapeVarieties.join(' · ')} />
      <MetaRow labelKey="tastingNote.mockup.meta.price" value={priceFmt} />
    </PaperSection>
  );
}

// 양식별 아로마 그룹 — group id는 i18n 키
const AROMA_GROUPS: Record<FormVariant, { id: string; ids: string[] }[]> = {
  white: [
    { id: 'citrus',     ids: ['lemon', 'grapefruit', 'lime', 'orange-peel'] },
    { id: 'treeFruit',  ids: ['apple', 'pear', 'peach', 'apricot'] },
    { id: 'tropical',   ids: ['pineapple', 'mango', 'lychee', 'passion-fruit'] },
    { id: 'floral',     ids: ['acacia', 'honeysuckle', 'jasmine', 'orange-blossom'] },
    { id: 'mineral',    ids: ['flint', 'wet-stone', 'chalk', 'oyster-shell'] },
    { id: 'yeastOak',   ids: ['brioche', 'hazelnut', 'butter', 'vanilla'] },
  ],
  red: [
    { id: 'redBerry',     ids: ['strawberry', 'raspberry', 'red-cherry', 'cranberry'] },
    { id: 'blackBerry',   ids: ['blackberry', 'blueberry', 'black-cherry', 'cassis'] },
    { id: 'floral',       ids: ['violet', 'rose', 'lavender'] },
    { id: 'spicy',        ids: ['black-pepper', 'clove', 'cinnamon', 'licorice'] },
    { id: 'earthLeather', ids: ['leather', 'forest-floor', 'truffle', 'mushroom', 'tobacco'] },
    { id: 'oak',          ids: ['vanilla', 'cedar', 'pencil-lead', 'cocoa', 'coffee'] },
  ],
  sparkling: [
    { id: 'citrus',     ids: ['lemon', 'grapefruit'] },
    { id: 'treeFruit',  ids: ['apple', 'pear'] },
    { id: 'floral',     ids: ['honeysuckle', 'acacia'] },
    { id: 'autolytic',  ids: ['brioche', 'bread-dough', 'yeast', 'butter'] },
    { id: 'nutty',      ids: ['hazelnut', 'almond', 'walnut'] },
    { id: 'mineral',    ids: ['flint', 'chalk'] },
  ],
  blind: [
    { id: 'redBerry',   ids: ['red-cherry', 'raspberry'] },
    { id: 'blackBerry', ids: ['cassis', 'blackberry', 'black-cherry'] },
    { id: 'spicy',      ids: ['black-pepper', 'clove'] },
    { id: 'earth',      ids: ['tobacco', 'graphite', 'leather'] },
    { id: 'oak',        ids: ['cedar', 'pencil-lead', 'vanilla'] },
  ],
};

function AromaSection({
  variant,
  intensity,
  selected,
}: {
  variant: FormVariant;
  intensity: WSETScale;
  selected: string[];
}) {
  const { t, locale } = useLocale();
  const groups = AROMA_GROUPS[variant];
  const intensityKey: Record<WSETScale, string> = {
    low:         'light',
    mediumMinus: 'mediumMinus',
    medium:      'medium',
    mediumPlus:  'pronounced',
    high:        'pronounced',
  };
  return (
    <PaperSection
      titleKey="tastingNote.mockup.section.aroma"
      hint={t(`tastingNote.mockup.intensity.${intensityKey[intensity]}`)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {groups.map(g => (
          <div key={g.id}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: PAPER_INK_DIM,
                marginBottom: 4,
              }}
            >
              {t(`tastingNote.mockup.aromaGroup.${g.id}`)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {g.ids.map(id => {
                const lex = LEX_BY_ID[id];
                if (!lex) return null;
                const isOn = selected.includes(id);
                return (
                  <span
                    key={id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 8px',
                      fontSize: 11,
                      borderRadius: 999,
                      border: `1px solid ${isOn ? WINE_RED : PAPER_LINE}`,
                      background: isOn ? 'rgba(139,26,42,0.10)' : 'transparent',
                      color: isOn ? WINE_RED : PAPER_INK_DIM,
                      fontWeight: isOn ? 600 : 400,
                    }}
                  >
                    {isOn && <CheckMark color={WINE_RED} />}
                    {locale === 'ko' ? lex.ko : lex.en}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </PaperSection>
  );
}

function CheckMark({ color }: { color: string }) {
  return (
    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
      <path
        d="M2 6l3 3 5-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SCALE_ORDER: WSETScale[] = ['low', 'mediumMinus', 'medium', 'mediumPlus', 'high'];

function PalateRow({
  labelKey,
  value,
  labels,
}: {
  labelKey: string;
  value: WSETScale;
  labels: Record<WSETScale, { ko: string; en: string }>;
}) {
  const { t, locale } = useLocale();
  const idx = SCALE_ORDER.indexOf(value);
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 4,
        }}
      >
        <span
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: PAPER_INK }}
        >
          {t(labelKey)}
        </span>
        <span style={{ fontSize: 10, color: PAPER_INK_DIM, fontStyle: 'italic' }}>
          {labels[value][locale]}
        </span>
      </div>
      <div style={{ position: 'relative', height: 14, display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 1,
            background: PAPER_LINE,
          }}
        />
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {SCALE_ORDER.map((s, i) => {
            const active = i === idx;
            return (
              <div
                key={s}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: active ? WINE_RED : 'transparent',
                  border: `1px solid ${active ? WINE_RED : PAPER_INK_VERY_DIM}`,
                  boxShadow: active ? `0 0 0 3px rgba(139,26,42,0.18)` : 'none',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CaudalieDisplay({ caudalies }: { caudalies: number }) {
  const { t, locale } = useLocale();
  const cat = caudalieCategory(caudalies);
  const catShort = (locale === 'en'
    ? { short: 'Short', medium: 'Medium', long: 'Long', veryLong: 'Very Long' }
    : { short: '짧음', medium: '중간', long: '긴', veryLong: '매우 긴' }
  )[cat];
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-playfair, Georgia, serif)',
            fontSize: 32,
            fontWeight: 700,
            color: WINE_RED,
            lineHeight: 1,
          }}
        >
          {caudalies}
        </span>
        <span style={{ fontSize: 11, color: PAPER_INK_DIM }}>
          {t('tastingNote.mockup.caudalies')}
        </span>
        <span
          style={{
            marginLeft: 'auto',
            padding: '3px 8px',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            background: GOLD,
            color: PAPER_INK,
            borderRadius: 4,
          }}
        >
          {catShort}
        </span>
      </div>
      <div style={{ fontSize: 11, fontStyle: 'italic', color: PAPER_INK_DIM, lineHeight: 1.4 }}>
        ≈ {caudalieComparison(caudalies, locale)}
      </div>
    </div>
  );
}

function StarsRow({ value }: { value: number }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <WineGlassMark key={i} filled={i <= value} />
      ))}
      <span style={{ fontSize: 11, color: PAPER_INK_DIM, marginLeft: 8 }}>{value}/5</span>
    </div>
  );
}

function WineGlassMark({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="18" viewBox="0 0 12 16" style={{ flexShrink: 0 }}>
      <path
        d="M2.5 1 Q2.5 6 6 7 Q9.5 6 9.5 1 Z"
        fill={filled ? WINE_RED : 'transparent'}
        stroke={filled ? WINE_RED : PAPER_INK_VERY_DIM}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <line
        x1="6"
        y1="7"
        x2="6"
        y2="13"
        stroke={filled ? WINE_RED : PAPER_INK_VERY_DIM}
        strokeWidth="0.8"
      />
      <line
        x1="3.5"
        y1="13.5"
        x2="8.5"
        y2="13.5"
        stroke={filled ? WINE_RED : PAPER_INK_VERY_DIM}
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 자동 묘사 문장 — i18n 템플릿에서 placeholder 치환
function buildOverall(
  t: (k: string) => string,
  variantKey: 'white' | 'red' | 'sparkling',
  wine: MockWine,
): string {
  let template = t(`tastingNote.mockup.overall.${variantKey}`);
  template = template
    .replace('{vintage}', String(wine.vintage))
    .replace('{region}', wine.region)
    .replace('{producer}', wine.producer)
    .replace('{wineName}', wine.wineName);
  return template;
}

function OverallNote({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-playfair, Georgia, serif)',
        fontSize: 13,
        fontStyle: 'italic',
        lineHeight: 1.55,
        color: PAPER_INK,
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-variant mockups
// ─────────────────────────────────────────────────────────────────────────────

function WhiteMockup({ wine }: { wine: MockWine }) {
  const { t } = useLocale();
  return (
    <>
      <PaperHeader titleKey="white" subtitleKey="journal" accent={GOLD} />
      <WineIdentity wine={wine} />
      <AromaSection
        variant="white"
        intensity={wine.presets.aroma.intensity}
        selected={wine.presets.aroma.selectedLexIds}
      />
      <PaperSection titleKey="tastingNote.mockup.section.palate">
        <PalateRow labelKey="tastingNote.dimensions.sweetness" value={wine.presets.palate.sweetness} labels={SWEETNESS_LABELS} />
        <PalateRow labelKey="tastingNote.dimensions.acidity"   value={wine.presets.palate.acidity}   labels={ACIDITY_LABELS} />
        <PalateRow labelKey="tastingNote.dimensions.body"      value={wine.presets.palate.body}      labels={BODY_LABELS} />
        <PalateRow labelKey="tastingNote.dimensions.alcohol"   value={wine.presets.palate.alcohol}   labels={ALCOHOL_LABELS} />
      </PaperSection>
      <PaperSection titleKey="tastingNote.mockup.section.finish">
        <CaudalieDisplay caudalies={wine.presets.finish.caudalies} />
      </PaperSection>
      <PaperSection titleKey="tastingNote.mockup.section.overall">
        <OverallNote>{buildOverall(t, 'white', wine)}</OverallNote>
      </PaperSection>
      <PaperSection titleKey="tastingNote.mockup.section.rating">
        <StarsRow value={wine.presets.rating} />
      </PaperSection>
    </>
  );
}

function RedMockup({ wine }: { wine: MockWine }) {
  const { t } = useLocale();
  const tannin = wine.presets.palate.tannin;
  return (
    <>
      <PaperHeader titleKey="red" subtitleKey="journal" accent={WINE_RED} />
      <WineIdentity wine={wine} />
      <AromaSection
        variant="red"
        intensity={wine.presets.aroma.intensity}
        selected={wine.presets.aroma.selectedLexIds}
      />
      <PaperSection titleKey="tastingNote.mockup.section.palate">
        <PalateRow labelKey="tastingNote.dimensions.sweetness" value={wine.presets.palate.sweetness} labels={SWEETNESS_LABELS} />
        <PalateRow labelKey="tastingNote.dimensions.acidity"   value={wine.presets.palate.acidity}   labels={ACIDITY_LABELS} />
        <PalateRow labelKey="tastingNote.dimensions.body"      value={wine.presets.palate.body}      labels={BODY_LABELS} />
        <PalateRow labelKey="tastingNote.dimensions.alcohol"   value={wine.presets.palate.alcohol}   labels={ALCOHOL_LABELS} />
        {tannin && (
          <>
            <PalateRow labelKey="tastingNote.dimensions.tannin" value={tannin.intensity} labels={TANNIN_INTENSITY_LABELS} />
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <Pill color={GOLD}>{t('tastingNote.mockup.tannin.texture')} · {tannin.texture}</Pill>
              <Pill color={GOLD}>{t(`tastingNote.mockup.tannin.${tannin.ripeness}`)}</Pill>
            </div>
          </>
        )}
      </PaperSection>
      <PaperSection titleKey="tastingNote.mockup.section.finish">
        <CaudalieDisplay caudalies={wine.presets.finish.caudalies} />
      </PaperSection>
      <PaperSection titleKey="tastingNote.mockup.section.overall">
        <OverallNote>{buildOverall(t, 'red', wine)}</OverallNote>
      </PaperSection>
      <PaperSection titleKey="tastingNote.mockup.section.rating">
        <StarsRow value={wine.presets.rating} />
      </PaperSection>
    </>
  );
}

function SparklingMockup({ wine }: { wine: MockWine }) {
  const { t, locale } = useLocale();
  const bubbles = wine.presets.palate.bubbles;
  const dosage = wine.presets.palate.sparklingDosage;
  return (
    <>
      <PaperHeader titleKey="sparkling" subtitleKey="journal" accent={GOLD} />
      <WineIdentity wine={wine} />
      <AromaSection
        variant="sparkling"
        intensity={wine.presets.aroma.intensity}
        selected={wine.presets.aroma.selectedLexIds}
      />
      <PaperSection
        titleKey="tastingNote.mockup.section.bubbles"
        hint={bubbles ? SPARKLING_METHOD_LABELS[bubbles.method][locale] : undefined}
      >
        {bubbles && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <Pill color={GOLD}>{t('tastingNote.mockup.bubbles.size')} · {bubbles.size}</Pill>
            <Pill color={GOLD}>{t('tastingNote.mockup.bubbles.persistence')} · {bubbles.persistence}</Pill>
            <Pill color={GOLD}>{t('tastingNote.mockup.bubbles.mousse')} · {bubbles.mousse}</Pill>
            <Pill color={GOLD}>{bubbles.pressure} {t('tastingNote.mockup.bubbles.bar')}</Pill>
          </div>
        )}
        {dosage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: PAPER_INK_DIM,
                textTransform: 'uppercase',
              }}
            >
              {t('tastingNote.mockup.dosage')}
            </span>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: 4,
                background: WINE_RED,
                color: '#F5F0E8',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {DOSAGE_LABELS[dosage][locale]}
            </span>
            <span style={{ fontSize: 10, color: PAPER_INK_DIM, fontStyle: 'italic' }}>
              {DOSAGE_LABELS[dosage].range}
            </span>
          </div>
        )}
      </PaperSection>
      <PaperSection titleKey="tastingNote.mockup.section.palate">
        <PalateRow labelKey="tastingNote.dimensions.sweetness" value={wine.presets.palate.sweetness} labels={SWEETNESS_LABELS} />
        <PalateRow labelKey="tastingNote.dimensions.acidity"   value={wine.presets.palate.acidity}   labels={ACIDITY_LABELS} />
        <PalateRow labelKey="tastingNote.dimensions.body"      value={wine.presets.palate.body}      labels={BODY_LABELS} />
        <PalateRow labelKey="tastingNote.dimensions.alcohol"   value={wine.presets.palate.alcohol}   labels={ALCOHOL_LABELS} />
      </PaperSection>
      <PaperSection titleKey="tastingNote.mockup.section.finish">
        <CaudalieDisplay caudalies={wine.presets.finish.caudalies} />
      </PaperSection>
      <PaperSection titleKey="tastingNote.mockup.section.overall">
        <OverallNote>{buildOverall(t, 'sparkling', wine)}</OverallNote>
      </PaperSection>
      <PaperSection titleKey="tastingNote.mockup.section.rating">
        <StarsRow value={wine.presets.rating} />
      </PaperSection>
    </>
  );
}

function BlindMockup({ wine }: { wine: MockWine }) {
  const { t, locale } = useLocale();
  const tannin = wine.presets.palate.tannin;
  const priceFmt = locale === 'ko'
    ? `₩${wine.pricePaid.toLocaleString('ko-KR')}`
    : `₩${wine.pricePaid.toLocaleString('en-US')}`;
  return (
    <>
      <PaperHeader titleKey="blind" subtitleKey="blind" accent={WINE_RED} />
      <PaperSection titleKey="tastingNote.mockup.section.visual">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <ColorSwatch color="#5A0E18" />
          <ColorSwatch color="#7A1828" active />
          <ColorSwatch color="#A02E3E" />
          <ColorSwatch color="#C75A4A" />
          <span style={{ fontSize: 11, color: PAPER_INK_DIM, marginLeft: 8 }}>
            {t('tastingNote.mockup.visual.hue')}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Pill color={GOLD}>
            {t('tastingNote.mockup.visual.depth')} · {t('tastingNote.mockup.visual.deep')}
          </Pill>
          <Pill color={GOLD}>
            {t('tastingNote.mockup.visual.clarity')} · {t('tastingNote.mockup.visual.clear')}
          </Pill>
          <Pill color={GOLD}>
            {t('tastingNote.mockup.visual.legs')} · {t('tastingNote.mockup.visual.thick')}
          </Pill>
        </div>
      </PaperSection>
      <AromaSection
        variant="blind"
        intensity={wine.presets.aroma.intensity}
        selected={wine.presets.aroma.selectedLexIds}
      />
      <PaperSection titleKey="tastingNote.mockup.section.palate">
        <PalateRow labelKey="tastingNote.dimensions.sweetness" value={wine.presets.palate.sweetness} labels={SWEETNESS_LABELS} />
        <PalateRow labelKey="tastingNote.dimensions.acidity"   value={wine.presets.palate.acidity}   labels={ACIDITY_LABELS} />
        <PalateRow labelKey="tastingNote.dimensions.body"      value={wine.presets.palate.body}      labels={BODY_LABELS} />
        <PalateRow labelKey="tastingNote.dimensions.alcohol"   value={wine.presets.palate.alcohol}   labels={ALCOHOL_LABELS} />
        {tannin && (
          <PalateRow labelKey="tastingNote.dimensions.tannin" value={tannin.intensity} labels={TANNIN_INTENSITY_LABELS} />
        )}
      </PaperSection>
      <PaperSection titleKey="tastingNote.mockup.section.finish">
        <CaudalieDisplay caudalies={wine.presets.finish.caudalies} />
      </PaperSection>
      <PaperSection titleKey="tastingNote.mockup.section.guess">
        <GuessRow
          labelKey="tastingNote.mockup.guessLabel.grape"
          guess="Cabernet Sauvignon"
          answer={wine.grapeVarieties.join(' · ')}
          correct
        />
        <GuessRow
          labelKey="tastingNote.mockup.guessLabel.region"
          guess="Bordeaux"
          answer={wine.region}
          correct
        />
        <GuessRow
          labelKey="tastingNote.mockup.guessLabel.vintage"
          guess={String(wine.vintage)}
          answer={String(wine.vintage)}
          correct
        />
        <GuessRow
          labelKey="tastingNote.mockup.guessLabel.price"
          guess={locale === 'ko' ? '10~20만' : '100K~200K'}
          answer={priceFmt}
          correct
        />
      </PaperSection>
      <PaperSection titleKey="tastingNote.mockup.section.score">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: WINE_RED,
              color: '#F5F0E8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-playfair, Georgia, serif)',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            100
          </div>
          <div>
            <div
              style={{ fontSize: 13, fontWeight: 700, color: PAPER_INK, marginBottom: 2 }}
            >
              {t('tastingNote.mockup.score.master')} 🏆
            </div>
            <div style={{ fontSize: 10, color: PAPER_INK_DIM, fontStyle: 'italic' }}>
              {t('tastingNote.mockup.score.matched').replace('{n}', '4')}
            </div>
          </div>
        </div>
      </PaperSection>
    </>
  );
}

function Pill({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.04em',
        borderRadius: 4,
        border: `1px solid ${color}`,
        color: PAPER_INK,
        background: 'rgba(201,168,76,0.10)',
      }}
    >
      {children}
    </span>
  );
}

function ColorSwatch({ color, active = false }: { color: string; active?: boolean }) {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: 999,
        background: color,
        border: active ? `2px solid ${GOLD}` : `1px solid ${PAPER_INK_VERY_DIM}`,
        boxShadow: active ? '0 0 0 3px rgba(201,168,76,0.18)' : 'none',
      }}
    />
  );
}

function GuessRow({
  labelKey,
  guess,
  answer,
  correct,
}: {
  labelKey: string;
  guess: string;
  answer: string;
  correct: boolean;
}) {
  const { t } = useLocale();
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '64px 1fr auto',
        alignItems: 'center',
        gap: 8,
        padding: '6px 0',
        borderBottom: `1px dashed ${PAPER_LINE}`,
        fontSize: 11,
      }}
    >
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: PAPER_INK_DIM,
        }}
      >
        {t(labelKey)}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ color: PAPER_INK_DIM, fontSize: 10, fontStyle: 'italic' }}>
          {t('tastingNote.mockup.guessRow.guess')} · {guess}
        </span>
        <span style={{ color: PAPER_INK, fontWeight: 600 }}>
          {t('tastingNote.mockup.guessRow.answer')} · {answer}
        </span>
      </div>
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          background: correct ? GOLD : PAPER_INK_VERY_DIM,
          color: PAPER_INK,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        {correct ? '✓' : '✕'}
      </span>
    </div>
  );
}

