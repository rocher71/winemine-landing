'use client';

// Tasting Note Section
// 4종 양식 (White/Red/Sparkling/Blind) 의 "이미 작성된" 정적 mockup 전시.
// 사용자는 4탭만 전환하며, mockup 안의 모든 필드는 인터랙티브하지 않다 —
// "앱을 쓰면 이런 식으로 기록할 수 있다"를 한눈에 보여주는 것이 목적.
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

const FAKE_DATE = '2026.05.09';

// 디자인 토큰
const PAPER_BG = '#F5F0E8';
const PAPER_INK = '#1A0A1E';
const PAPER_INK_DIM = 'rgba(26,10,30,0.42)';
const PAPER_INK_VERY_DIM = 'rgba(26,10,30,0.18)';
const PAPER_LINE = 'rgba(26,10,30,0.10)';
const GOLD = '#C9A84C';
const WINE_RED = '#8B1A2A';

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

        {/* Form Tab Bar */}
        <FormTabBar active={variant} onSelect={setVariant} t={t} />

        {/* Phone Mockup with full mock tasting note */}
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

        {/* Section Footer */}
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
// Phone Frame (베젤만 — 안은 종이 양식 mockup)
// ─────────────────────────────────────────────────────────────────────────────

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 392,
        background: '#0F0718',
        borderRadius: 40,
        padding: 8,
        border: '1px solid rgba(245,240,232,0.06)',
        boxShadow:
          '0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,168,76,0.08), inset 0 0 0 1px rgba(245,240,232,0.04)',
      }}
    >
      <div
        style={{
          background: PAPER_BG,
          borderRadius: 32,
          overflow: 'hidden',
          color: PAPER_INK,
          fontFamily: 'var(--font-inter, system-ui, sans-serif)',
        }}
      >
        {children}
      </div>
    </div>
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
// Mockup — common building blocks
// ─────────────────────────────────────────────────────────────────────────────

function PaperHeader({ title, subtitle, accent }: { title: string; subtitle?: string; accent: string }) {
  return (
    <div
      style={{
        padding: '20px 22px 16px',
        borderBottom: `1px solid ${PAPER_LINE}`,
        background: `linear-gradient(180deg, ${PAPER_BG} 0%, rgba(245,240,232,0.92) 100%)`,
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
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: PAPER_INK,
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 10,
                fontStyle: 'italic',
                color: PAPER_INK_DIM,
                letterSpacing: '0.04em',
                marginTop: 4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        <div
          style={{
            fontSize: 10,
            color: PAPER_INK_DIM,
            letterSpacing: '0.06em',
          }}
        >
          {FAKE_DATE}
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

function PaperSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
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
          {title}
        </div>
        {hint && (
          <div style={{ fontSize: 10, fontStyle: 'italic', color: PAPER_INK_DIM }}>{hint}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string | number }) {
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
      <span style={{ color: PAPER_INK_DIM, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 10, fontWeight: 600 }}>
        {label}
      </span>
      <span style={{ color: PAPER_INK, textAlign: 'right', maxWidth: '70%', wordBreak: 'break-word' }}>
        {value}
      </span>
    </div>
  );
}

function WineIdentity({ wine }: { wine: MockWine }) {
  return (
    <PaperSection title="Wine">
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
      <div style={{ fontSize: 11, fontStyle: 'italic', color: PAPER_INK_DIM, marginBottom: 10 }}>
        {wine.producer}
      </div>
      <MetaRow label="Vintage" value={wine.vintage === 0 ? 'NV' : wine.vintage} />
      <MetaRow label="Region" value={wine.region} />
      <MetaRow label="Appellation" value={wine.appellation} />
      <MetaRow label="Grape" value={wine.grapeVarieties.join(' · ')} />
      <MetaRow label="Price" value={`₩${wine.pricePaid.toLocaleString()}`} />
    </PaperSection>
  );
}

// 향 카테고리별 어휘 칩 — 양식별 아로마 카테고리 fixed list
const AROMA_GROUPS_WHITE: { title: string; ids: string[] }[] = [
  { title: 'Citrus',     ids: ['lemon', 'grapefruit', 'lime', 'orange-peel'] },
  { title: 'Tree Fruit', ids: ['apple', 'pear', 'peach', 'apricot'] },
  { title: 'Tropical',   ids: ['pineapple', 'mango', 'lychee', 'passion-fruit'] },
  { title: 'Floral',     ids: ['acacia', 'honeysuckle', 'jasmine', 'orange-blossom'] },
  { title: 'Mineral',    ids: ['flint', 'wet-stone', 'chalk', 'oyster-shell'] },
  { title: 'Yeast / Oak', ids: ['brioche', 'hazelnut', 'butter', 'vanilla'] },
];

const AROMA_GROUPS_RED: { title: string; ids: string[] }[] = [
  { title: 'Red Berry',   ids: ['strawberry', 'raspberry', 'red-cherry', 'cranberry'] },
  { title: 'Black Berry', ids: ['blackberry', 'blueberry', 'black-cherry', 'cassis'] },
  { title: 'Floral',      ids: ['violet', 'rose', 'lavender'] },
  { title: 'Spicy',       ids: ['black-pepper', 'clove', 'cinnamon', 'licorice'] },
  { title: 'Earth · Leather', ids: ['leather', 'forest-floor', 'truffle', 'mushroom', 'tobacco'] },
  { title: 'Oak',         ids: ['vanilla', 'cedar', 'pencil-lead', 'cocoa', 'coffee'] },
];

const AROMA_GROUPS_SPARKLING: { title: string; ids: string[] }[] = [
  { title: 'Citrus',      ids: ['lemon', 'grapefruit'] },
  { title: 'Tree Fruit',  ids: ['apple', 'pear'] },
  { title: 'Floral',      ids: ['honeysuckle', 'acacia'] },
  { title: 'Autolytic',   ids: ['brioche', 'bread-dough', 'yeast', 'butter'] },
  { title: 'Nutty',       ids: ['hazelnut', 'almond', 'walnut'] },
  { title: 'Mineral',     ids: ['flint', 'chalk'] },
];

const AROMA_GROUPS_BLIND: { title: string; ids: string[] }[] = [
  { title: 'Red Berry',   ids: ['red-cherry', 'raspberry'] },
  { title: 'Black Berry', ids: ['cassis', 'blackberry', 'black-cherry'] },
  { title: 'Spicy',       ids: ['black-pepper', 'clove'] },
  { title: 'Earth',       ids: ['tobacco', 'graphite', 'leather'] },
  { title: 'Oak',         ids: ['cedar', 'pencil-lead', 'vanilla'] },
];

function AromaSection({
  variant,
  intensity,
  selected,
}: {
  variant: FormVariant;
  intensity: WSETScale;
  selected: string[];
}) {
  const groups =
    variant === 'white'     ? AROMA_GROUPS_WHITE :
    variant === 'red'       ? AROMA_GROUPS_RED :
    variant === 'sparkling' ? AROMA_GROUPS_SPARKLING :
                              AROMA_GROUPS_BLIND;
  const intensityLabel: Record<WSETScale, string> = {
    low: 'Light', mediumMinus: 'Medium−', medium: 'Medium', mediumPlus: 'Pronounced', high: 'Pronounced',
  };
  return (
    <PaperSection title="Aroma" hint={intensityLabel[intensity]}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {groups.map(g => (
          <div key={g.title}>
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
              {g.title}
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
                    {lex.ko}
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
      <path d="M2 6l3 3 5-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SCALE_ORDER: WSETScale[] = ['low', 'mediumMinus', 'medium', 'mediumPlus', 'high'];

function PalateRow({
  label,
  value,
  labels,
}: {
  label: string;
  value: WSETScale;
  labels: Record<WSETScale, { ko: string; en: string }>;
}) {
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
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: PAPER_INK }}>
          {label}
        </span>
        <span style={{ fontSize: 10, color: PAPER_INK_DIM, fontStyle: 'italic' }}>
          {labels[value].ko}
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

function CaudalieDisplay({
  caudalies,
  showComparison = true,
}: {
  caudalies: number;
  showComparison?: boolean;
}) {
  const cat = caudalieCategory(caudalies);
  const catLabel: Record<typeof cat, string> = {
    short:    'Short',
    medium:   'Medium',
    long:     'Long',
    veryLong: 'Very Long',
  };
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          marginBottom: showComparison ? 6 : 0,
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
        <span style={{ fontSize: 11, color: PAPER_INK_DIM }}>caudalies</span>
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
          {catLabel[cat]}
        </span>
      </div>
      {showComparison && (
        <div style={{ fontSize: 11, fontStyle: 'italic', color: PAPER_INK_DIM, lineHeight: 1.4 }}>
          ≈ {caudalieComparison(caudalies, 'ko')}
        </div>
      )}
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
      <line x1="6" y1="7" x2="6" y2="13" stroke={filled ? WINE_RED : PAPER_INK_VERY_DIM} strokeWidth="0.8" />
      <line x1="3.5" y1="13.5" x2="8.5" y2="13.5" stroke={filled ? WINE_RED : PAPER_INK_VERY_DIM} strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-variant mockups
// ─────────────────────────────────────────────────────────────────────────────

function WhiteMockup({ wine }: { wine: MockWine }) {
  return (
    <>
      <PaperHeader
        title="WHITE WINE TASTING NOTES"
        subtitle="A page from your cellar journal"
        accent={GOLD}
      />
      <WineIdentity wine={wine} />
      <AromaSection variant="white" intensity={wine.presets.aroma.intensity} selected={wine.presets.aroma.selectedLexIds} />
      <PaperSection title="Palate">
        <PalateRow label="Sweetness" value={wine.presets.palate.sweetness} labels={SWEETNESS_LABELS} />
        <PalateRow label="Acidity"   value={wine.presets.palate.acidity}   labels={ACIDITY_LABELS} />
        <PalateRow label="Body"      value={wine.presets.palate.body}      labels={BODY_LABELS} />
        <PalateRow label="Alcohol"   value={wine.presets.palate.alcohol}   labels={ALCOHOL_LABELS} />
      </PaperSection>
      <PaperSection title="Finish">
        <CaudalieDisplay caudalies={wine.presets.finish.caudalies} />
      </PaperSection>
      <PaperSection title="Overall Impression">
        <p style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: 13, fontStyle: 'italic', lineHeight: 1.55, color: PAPER_INK, margin: 0 }}>
          {`${wine.vintage}년 ${wine.region}, ${wine.producer}. 강한 향에 레몬·라임이 도드라지고 아카시아·헤이즐넛·부싯돌이 뒤를 받칩니다. 중간+ 바디에 또렷한 산도, 드라이 단맛. 끈기 있고 미네랄리티가 살아있는 마무리.`}
        </p>
      </PaperSection>
      <PaperSection title="Rating">
        <StarsRow value={wine.presets.rating} />
      </PaperSection>
    </>
  );
}

function RedMockup({ wine }: { wine: MockWine }) {
  const tannin = wine.presets.palate.tannin;
  return (
    <>
      <PaperHeader
        title="RED WINE TASTING NOTES"
        subtitle="A page from your cellar journal"
        accent={WINE_RED}
      />
      <WineIdentity wine={wine} />
      <AromaSection variant="red" intensity={wine.presets.aroma.intensity} selected={wine.presets.aroma.selectedLexIds} />
      <PaperSection title="Palate">
        <PalateRow label="Sweetness" value={wine.presets.palate.sweetness} labels={SWEETNESS_LABELS} />
        <PalateRow label="Acidity"   value={wine.presets.palate.acidity}   labels={ACIDITY_LABELS} />
        <PalateRow label="Body"      value={wine.presets.palate.body}      labels={BODY_LABELS} />
        <PalateRow label="Alcohol"   value={wine.presets.palate.alcohol}   labels={ALCOHOL_LABELS} />
        {tannin && (
          <>
            <PalateRow label="Tannin" value={tannin.intensity} labels={TANNIN_INTENSITY_LABELS} />
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <Pill color={GOLD}>Texture · {tannin.texture}</Pill>
              <Pill color={GOLD}>{tannin.ripeness === 'ripe' ? 'Ripe' : tannin.ripeness === 'unripe' ? 'Unripe' : 'Overripe'}</Pill>
            </div>
          </>
        )}
      </PaperSection>
      <PaperSection title="Finish">
        <CaudalieDisplay caudalies={wine.presets.finish.caudalies} />
      </PaperSection>
      <PaperSection title="Overall Impression">
        <p style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: 13, fontStyle: 'italic', lineHeight: 1.55, color: PAPER_INK, margin: 0 }}>
          {`${wine.vintage}년 ${wine.region}, ${wine.producer}. 강한 향에 검은체리·제비꽃이 도드라지고 가죽·담뱃잎·숲바닥이 뒤를 받칩니다. 중간+ 바디에 또렷한 산도. 타닌은 fine-grained 인상으로 매끈하게 짜여 있습니다. 끈기 있고 우아한 마무리.`}
        </p>
      </PaperSection>
      <PaperSection title="Rating">
        <StarsRow value={wine.presets.rating} />
      </PaperSection>
    </>
  );
}

function SparklingMockup({ wine }: { wine: MockWine }) {
  const bubbles = wine.presets.palate.bubbles;
  const dosage = wine.presets.palate.sparklingDosage;
  return (
    <>
      <PaperHeader
        title="CHAMPAGNE TASTING NOTES"
        subtitle="A page from your cellar journal"
        accent={GOLD}
      />
      <WineIdentity wine={wine} />
      <AromaSection variant="sparkling" intensity={wine.presets.aroma.intensity} selected={wine.presets.aroma.selectedLexIds} />
      <PaperSection title="Bubbles · Mousse" hint={bubbles ? SPARKLING_METHOD_LABELS[bubbles.method].ko : undefined}>
        {bubbles && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <Pill color={GOLD}>크기 · {bubbles.size}</Pill>
            <Pill color={GOLD}>지속 · {bubbles.persistence}</Pill>
            <Pill color={GOLD}>무쎄 · {bubbles.mousse}</Pill>
            <Pill color={GOLD}>{bubbles.pressure} bar</Pill>
          </div>
        )}
        {dosage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: PAPER_INK_DIM, textTransform: 'uppercase' }}>
              Dosage
            </span>
            <span style={{ padding: '3px 10px', borderRadius: 4, background: WINE_RED, color: '#F5F0E8', fontSize: 11, fontWeight: 600 }}>
              {DOSAGE_LABELS[dosage].ko}
            </span>
            <span style={{ fontSize: 10, color: PAPER_INK_DIM, fontStyle: 'italic' }}>
              {DOSAGE_LABELS[dosage].range}
            </span>
          </div>
        )}
      </PaperSection>
      <PaperSection title="Palate">
        <PalateRow label="Sweetness" value={wine.presets.palate.sweetness} labels={SWEETNESS_LABELS} />
        <PalateRow label="Acidity"   value={wine.presets.palate.acidity}   labels={ACIDITY_LABELS} />
        <PalateRow label="Body"      value={wine.presets.palate.body}      labels={BODY_LABELS} />
        <PalateRow label="Alcohol"   value={wine.presets.palate.alcohol}   labels={ALCOHOL_LABELS} />
      </PaperSection>
      <PaperSection title="Finish">
        <CaudalieDisplay caudalies={wine.presets.finish.caudalies} />
      </PaperSection>
      <PaperSection title="Overall Impression">
        <p style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: 13, fontStyle: 'italic', lineHeight: 1.55, color: PAPER_INK, margin: 0 }}>
          {`${wine.producer}의 ${wine.wineName}. 강한 향에 브리오슈·헤이즐넛이 도드라지고 사과·인동초·버터가 뒤를 받칩니다. fine 기포가 persistent하게 올라오며 creamy 무쎄를 만듭니다. 복합적이고 매끄러운 마무리.`}
        </p>
      </PaperSection>
      <PaperSection title="Rating">
        <StarsRow value={wine.presets.rating} />
      </PaperSection>
    </>
  );
}

function BlindMockup({ wine }: { wine: MockWine }) {
  const tannin = wine.presets.palate.tannin;
  return (
    <>
      <PaperHeader
        title="BLIND TASTING SHEET"
        subtitle="What is in the glass?"
        accent={WINE_RED}
      />
      <PaperSection title="Visual">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <ColorSwatch color="#5A0E18" />
          <ColorSwatch color="#7A1828" active />
          <ColorSwatch color="#A02E3E" />
          <ColorSwatch color="#C75A4A" />
          <span style={{ fontSize: 11, color: PAPER_INK_DIM, marginLeft: 8 }}>
            Garnet · Deep
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Pill color={GOLD}>Depth · Deep</Pill>
          <Pill color={GOLD}>Clarity · Clear</Pill>
          <Pill color={GOLD}>Legs · Thick</Pill>
        </div>
      </PaperSection>
      <AromaSection variant="blind" intensity={wine.presets.aroma.intensity} selected={wine.presets.aroma.selectedLexIds} />
      <PaperSection title="Palate">
        <PalateRow label="Sweetness" value={wine.presets.palate.sweetness} labels={SWEETNESS_LABELS} />
        <PalateRow label="Acidity"   value={wine.presets.palate.acidity}   labels={ACIDITY_LABELS} />
        <PalateRow label="Body"      value={wine.presets.palate.body}      labels={BODY_LABELS} />
        <PalateRow label="Alcohol"   value={wine.presets.palate.alcohol}   labels={ALCOHOL_LABELS} />
        {tannin && <PalateRow label="Tannin" value={tannin.intensity} labels={TANNIN_INTENSITY_LABELS} />}
      </PaperSection>
      <PaperSection title="Finish">
        <CaudalieDisplay caudalies={wine.presets.finish.caudalies} />
      </PaperSection>
      <PaperSection title="Guess The Wine">
        <GuessRow label="Grape"   guess="Cabernet Sauvignon" answer="Cabernet Sauvignon 75% · Merlot 25%" correct />
        <GuessRow label="Region"  guess="Bordeaux"            answer="Bordeaux / Pauillac"                correct />
        <GuessRow label="Vintage" guess="2015"                answer="2015"                                correct />
        <GuessRow label="Price"   guess="100~200K"            answer="₩280,000"                            correct />
      </PaperSection>
      <PaperSection title="Score">
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
            <div style={{ fontSize: 13, fontWeight: 700, color: PAPER_INK, marginBottom: 2 }}>
              Master Sommelier 수준 🏆
            </div>
            <div style={{ fontSize: 10, color: PAPER_INK_DIM, fontStyle: 'italic' }}>
              4 / 4 fields matched
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
  label,
  guess,
  answer,
  correct,
}: {
  label: string;
  guess: string;
  answer: string;
  correct: boolean;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '60px 1fr auto',
        alignItems: 'center',
        gap: 8,
        padding: '6px 0',
        borderBottom: `1px dashed ${PAPER_LINE}`,
        fontSize: 11,
      }}
    >
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: PAPER_INK_DIM }}>
        {label}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ color: PAPER_INK_DIM, fontSize: 10, fontStyle: 'italic' }}>
          추정 · {guess}
        </span>
        <span style={{ color: PAPER_INK, fontWeight: 600 }}>
          정답 · {answer}
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
