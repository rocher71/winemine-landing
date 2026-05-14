'use client';

// Tasting Note Section
// 4종 양식 (White/Red/Sparkling/Blind) 의 "이미 작성된" 정적 mockup 전시.
// 사용자는 4탭만 전환하며, mockup 안의 모든 필드는 인터랙티브하지 않다.
// 모든 텍스트는 useLocale() 의 t() 또는 lex[locale] 로 분기.
// 폰 베젤은 iPhone 14/15 스타일 (Dynamic Island + status bar + home indicator).
//
// spec: _workspace/tasting-note-section-spec.md

import { useState, type ReactNode, type ComponentType } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/components/providers/locale-provider';
import { trackEvent } from '@/lib/analytics';
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
import {
  WineGlassRedIcon,
  WineGlassWhiteIcon,
  ChampagneFluteIcon,
  TargetIcon,
  SparkleIcon,
  SproutIcon,
  GraduationCapIcon,
  StarEyesFaceIcon,
  SmileFaceIcon,
  ThinkingFaceIcon,
  StrawberryIcon,
  LemonIcon,
  PeachIcon,
  RoseIcon,
  ChiliIcon,
  HoneyJarIcon,
  LeafIcon,
  BreadIcon,
  StopwatchIcon,
  ClockIcon,
  CheckIcon,
  CrossIcon,
  TrophyIcon,
  ArrowRightIcon,
  type IconProps,
} from '@/components/icons/wine-icons';

type IconComponent = ComponentType<IconProps>;

const VARIANTS: { id: FormVariant; Icon: IconComponent }[] = [
  { id: 'white',     Icon: WineGlassWhiteIcon },
  { id: 'red',       Icon: WineGlassRedIcon },
  { id: 'sparkling', Icon: ChampagneFluteIcon },
  { id: 'blind',     Icon: TargetIcon },
];

// 디자인 토큰
const PAPER_BG = 'var(--color-paper)';
const PAPER_INK = 'var(--color-ink)';
const PAPER_INK_DIM = 'var(--color-ink-dim)';
const PAPER_INK_VERY_DIM = 'var(--color-ink-very-dim)';
const PAPER_LINE = 'var(--color-ink-line)';
const GOLD = 'var(--color-gold)';
const WINE_RED = 'var(--color-wine-red)';

// 폰 mockup 크기
const PHONE_WIDTH = 392;
const PHONE_BEZEL = 12;
const PHONE_INNER_RADIUS = 44;
const STATUS_BAR_HEIGHT = 48;

type Mode = 'beginner' | 'expert';

interface Props {
  onOpenModal?: () => void;
}

export default function TastingNoteSection({ onOpenModal }: Props) {
  const { t } = useLocale();
  const [mode, setMode] = useState<Mode>('beginner');
  const [variant, setVariant] = useState<FormVariant>('white');

  // Beginner 모드에서는 Blind 비활성 — 자동으로 white로 fallback
  const effectiveVariant: FormVariant =
    mode === 'beginner' && variant === 'blind' ? 'white' : variant;

  return (
    <section
      id="tasting-note"
      style={{
        background: 'var(--color-bg-deep)',
        borderTop: '1px solid rgba(201,168,76,0.12)',
        padding: 'clamp(64px, 12vw, 128px) clamp(20px, 5vw, 48px)',
        color: 'var(--color-text-primary)',
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
              color: 'var(--color-text-primary)',
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
              color: 'var(--color-text-muted)',
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            {t('tastingNote.subhead')}
          </p>
        </motion.div>

        <ModeToggle active={mode} onSelect={setMode} t={t} />

        <FormTabBar
          active={effectiveVariant}
          onSelect={setVariant}
          t={t}
          showBlind={mode === 'expert'}
        />

        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
          <PhoneFrame>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${mode}-${effectiveVariant}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              >
                {mode === 'beginner' ? (
                  <BeginnerMockupForVariant variant={effectiveVariant} />
                ) : (
                  <MockupForVariant variant={effectiveVariant} />
                )}
              </motion.div>
            </AnimatePresence>
          </PhoneFrame>
        </div>

        {/* 플레이그라운드 초대 카드 — mockup 직후 시각 강조 */}
        <PlaygroundInviteCard />

        <div
          style={{
            marginTop: 40,
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-inter, system-ui, sans-serif)',
            fontSize: 16,
            lineHeight: 1.5,
          }}
        >
          <p style={{ marginBottom: 24, color: 'var(--color-text-muted)' }}>{t('tastingNote.outro')}</p>
          {onOpenModal && (
            <button
              type="button"
              onClick={() => {
                trackEvent('waitlist_cta_click', {
                  location: 'tasting_note_section',
                  button_id: 'waitlist_cta_tasting_note',
                });
                onOpenModal();
              }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(245,240,232,0.18)',
                color: 'var(--color-text-secondary)',
                padding: '10px 24px',
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 200ms ease, border-color 200ms ease',
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
// Playground Invite Card — mockup 직후 시각 강조 진입점
// ─────────────────────────────────────────────────────────────────────────────

function PlaygroundInviteCard() {
  const { t } = useLocale();
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
      style={{ marginTop: 56, display: 'flex', justifyContent: 'center' }}
    >
      <Link
        href="/tasting-note-playground"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          maxWidth: 640,
          padding: 'clamp(20px, 4vw, 32px)',
          background: hovered
            ? 'linear-gradient(135deg, rgba(201,168,76,0.28) 0%, rgba(139,26,42,0.22) 100%)'
            : 'linear-gradient(135deg, rgba(201,168,76,0.16) 0%, rgba(139,26,42,0.14) 100%)',
          border: `2px solid ${hovered ? GOLD : 'rgba(201,168,76,0.55)'}`,
          borderRadius: 20,
          textDecoration: 'none',
          color: 'var(--color-text-primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          boxShadow: hovered
            ? '0 16px 40px rgba(201,168,76,0.22), 0 8px 24px rgba(139,26,42,0.18)'
            : '0 8px 24px rgba(0,0,0,0.4)',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'background 240ms ease, border-color 240ms ease, box-shadow 240ms ease, transform 240ms ease',
        }}
      >
        {/* Row 1: 아이콘 + 텍스트 (좁은 화면에서도 안 깨짐) */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* 펄스 sparkle 아이콘 */}
          <div
            style={{
              position: 'relative',
              flexShrink: 0,
              width: 52,
              height: 52,
              borderRadius: 999,
              background: 'rgba(201,168,76,0.20)',
              border: `1.5px solid ${GOLD}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: GOLD,
            }}
            aria-hidden
          >
            <SparkleIcon size={24} />
            <motion.span
              animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 999,
                border: `2px solid ${GOLD}`,
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* 텍스트 영역 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: GOLD,
                marginBottom: 6,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {t('tastingNote.invite.eyebrow')}
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-playfair, Georgia, serif)',
                fontSize: 'clamp(18px, 4.4vw, 24px)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 8px',
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
                wordBreak: 'keep-all',
              }}
            >
              {t('tastingNote.invite.title')}
            </h3>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.55,
                color: 'var(--color-text-secondary)',
                margin: 0,
                wordBreak: 'keep-all',
              }}
            >
              {t('tastingNote.invite.subtitle')}
            </p>
          </div>
        </div>

        {/* Row 2: 4 미리보기 칩 (wrap) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
          {(['bullet1', 'bullet2', 'bullet3', 'bullet4'] as const).map(k => (
            <span
              key={k}
              style={{
                padding: '5px 11px',
                background: 'var(--color-bg-surface)',
                border: '1px solid rgba(245,240,232,0.10)',
                borderRadius: 999,
                fontSize: 11,
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
              }}
            >
              {t(`tastingNote.invite.${k}`)}
            </span>
          ))}
        </div>

        {/* Row 3: 큰 CTA 버튼 + hint (카드 너비 전체) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            paddingTop: 4,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 360,
              padding: '14px 20px',
              background: GOLD,
              color: 'var(--color-bg-map)',
              borderRadius: 28,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: hovered
                ? '0 8px 20px rgba(201,168,76,0.35)'
                : '0 4px 12px rgba(0,0,0,0.25)',
              transition: 'box-shadow 240ms ease',
            }}
          >
            <span>{t('tastingNote.invite.cta')}</span>
            <motion.span
              animate={{ x: hovered ? 4 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'inline-flex', alignItems: 'center' }}
              aria-hidden
            >
              <ArrowRightIcon size={16} />
            </motion.span>
          </div>
          <span
            style={{
              fontSize: 10,
              color: 'var(--color-text-muted)',
              fontStyle: 'italic',
              textAlign: 'center',
              wordBreak: 'keep-all',
            }}
          >
            {t('tastingNote.invite.hint')}
          </span>
        </div>
      </Link>
    </motion.div>
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

function ModeToggle({
  active,
  onSelect,
  t,
}: {
  active: Mode;
  onSelect: (m: Mode) => void;
  t: (key: string) => string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Mode"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
        maxWidth: 720,
        margin: '0 auto 16px',
      }}
    >
      {(['beginner', 'expert'] as Mode[]).map(m => {
        const isActive = active === m;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onSelect(m)}
            style={{
              padding: '14px 18px',
              background: isActive
                ? m === 'beginner'
                  ? 'linear-gradient(135deg, rgba(201,168,76,0.22) 0%, rgba(201,168,76,0.10) 100%)'
                  : 'linear-gradient(135deg, rgba(139,26,42,0.28) 0%, rgba(139,26,42,0.10) 100%)'
                : 'var(--color-bg-surface)',
              border: `1.5px solid ${isActive ? (m === 'beginner' ? GOLD : 'var(--color-wine-red-hover)') : 'rgba(245,240,232,0.10)'}`,
              borderRadius: 12,
              cursor: 'pointer',
              fontFamily: 'var(--font-inter, system-ui, sans-serif)',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'background 200ms ease, border-color 200ms ease',
            }}
          >
            <span aria-hidden style={{ display: 'inline-flex', flexShrink: 0, color: m === 'beginner' ? GOLD : 'var(--color-wine-red-hover)' }}>
              {m === 'beginner' ? <SproutIcon size={22} /> : <GraduationCapIcon size={22} />}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontFamily: 'var(--font-playfair, Georgia, serif)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  letterSpacing: '-0.01em',
                }}
              >
                {t(`tastingNote.playground.mode.${m}`)}
              </span>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {t(`tastingNote.playground.mode.${m}Subtitle`)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function FormTabBar({
  active,
  onSelect,
  t,
  showBlind = true,
}: {
  active: FormVariant;
  onSelect: (v: FormVariant) => void;
  t: (key: string) => string;
  showBlind?: boolean;
}) {
  const visible = showBlind ? VARIANTS : VARIANTS.filter(v => v.id !== 'blind');
  return (
    <div
      role="tablist"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${visible.length}, 1fr)`,
        background: 'var(--color-bg-surface)',
        border: '1px solid rgba(201,168,76,0.16)',
        borderRadius: 12,
        overflow: 'hidden',
        maxWidth: 720,
        margin: '0 auto',
      }}
    >
      {visible.map(v => {
        const isActive = active === v.id;
        const Icon = v.Icon;
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
              color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
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
            <Icon size={18} aria-hidden />
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
          background: 'var(--color-bg-deep)',
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
          background: 'var(--color-bg-deep)',
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
          background: 'var(--color-bg-deep)',
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
          background: 'var(--color-bg-deep)',
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
                color: 'var(--color-text-primary)',
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
              color: 'var(--color-text-primary)',
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
              style={{ fontSize: 13, fontWeight: 700, color: PAPER_INK, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {t('tastingNote.mockup.score.master')}
              <span aria-hidden style={{ color: GOLD, display: 'inline-flex' }}>
                <TrophyIcon size={16} />
              </span>
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
        }}
        aria-hidden
      >
        {correct ? <CheckIcon size={11} /> : <CrossIcon size={11} />}
      </span>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Beginner Mockups — 입문자가 작성한 짧은 노트 (정적, 인터랙션 X)
// 데이터: WSET 5단계 -> 3단계, 어휘 200개 -> 4 큰 카테고리, 카우달리 X
// ─────────────────────────────────────────────────────────────────────────────

type Level = 'low' | 'mid' | 'high';
type Impression = 'love' | 'ok' | 'meh';
type FinishLevel = 'short' | 'medium' | 'long';

interface BeginnerData {
  variant: FormVariant;
  impression: Impression;
  sweetness: Level;
  acidity: Level;
  body: Level;
  tannin?: Level;
  bubbles?: Level;
  aromas: string[]; // 'berry' | 'citrus' | 'stoneFruit' | 'floral' | 'spice' | 'sweet' | 'earth' | 'yeast'
  finish: FinishLevel;
  rating: number;
}

const BEGINNER_DATA: Record<'white' | 'red' | 'sparkling', BeginnerData> = {
  white: {
    variant: 'white',
    impression: 'love',
    sweetness: 'low',
    acidity: 'high',
    body: 'mid',
    aromas: ['citrus', 'stoneFruit', 'floral', 'yeast'],
    finish: 'long',
    rating: 5,
  },
  red: {
    variant: 'red',
    impression: 'love',
    sweetness: 'low',
    acidity: 'mid',
    body: 'mid',
    tannin: 'mid',
    aromas: ['berry', 'spice', 'earth', 'floral'],
    finish: 'long',
    rating: 5,
  },
  sparkling: {
    variant: 'sparkling',
    impression: 'love',
    sweetness: 'low',
    acidity: 'high',
    body: 'mid',
    bubbles: 'mid',
    aromas: ['citrus', 'stoneFruit', 'yeast', 'floral'],
    finish: 'long',
    rating: 5,
  },
};

const AROMA_ICON: Record<string, IconComponent> = {
  berry: StrawberryIcon,
  citrus: LemonIcon,
  stoneFruit: PeachIcon,
  floral: RoseIcon,
  spice: ChiliIcon,
  sweet: HoneyJarIcon,
  earth: LeafIcon,
  yeast: BreadIcon,
};

function BeginnerMockupForVariant({ variant }: { variant: FormVariant }) {
  if (variant === 'blind') return null;
  const wine = MOCK_WINES.find(w => w.variant === variant);
  if (!wine) return null;
  const data = BEGINNER_DATA[variant as 'white' | 'red' | 'sparkling'];
  return <BeginnerMockup wine={wine} data={data} />;
}

function BeginnerMockup({ wine, data }: { wine: MockWine; data: BeginnerData }) {
  const { t } = useLocale();
  const variantKey = wine.variant as 'white' | 'red' | 'sparkling';

  const ImpIcon: Record<Impression, IconComponent> = {
    love: StarEyesFaceIcon,
    ok: SmileFaceIcon,
    meh: ThinkingFaceIcon,
  };

  return (
    <>
      {/* Header */}
      <div style={{ padding: '8px 22px 16px', borderBottom: `1px solid ${PAPER_LINE}` }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
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
              {t(`tastingNote.mockup.beginner.title.${variantKey}`)}
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
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span aria-hidden style={{ color: GOLD, display: 'inline-flex' }}>
                  <SproutIcon size={11} />
                </span>
                {t('tastingNote.playground.mode.beginner')}
              </span>
            </div>
          </div>
          <div style={{ fontSize: 10, color: PAPER_INK_DIM, letterSpacing: '0.06em' }}>
            {t('tastingNote.mockup.fakeDate')}
          </div>
        </div>
        <div style={{ marginTop: 12, height: 2, width: 36, background: GOLD, borderRadius: 2 }} />
      </div>

      {/* Wine identity */}
      <div style={{ padding: '14px 22px', borderBottom: `1px solid ${PAPER_LINE}` }}>
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
        <div style={{ fontSize: 11, fontStyle: 'italic', color: PAPER_INK_DIM }}>
          {wine.producer} · {wine.vintage === 0 ? 'NV' : wine.vintage}
        </div>
      </div>

      {/* First impression */}
      <div style={{ padding: '16px 22px', borderBottom: `1px solid ${PAPER_LINE}` }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: PAPER_INK,
            marginBottom: 10,
          }}
        >
          {t('tastingNote.beginner.step.impression')}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            padding: '10px 14px',
            background: 'rgba(201,168,76,0.14)',
            border: `1.5px solid ${GOLD}`,
            borderRadius: 12,
          }}
        >
          <span aria-hidden style={{ display: 'inline-flex', color: WINE_RED }}>
            {(() => {
              const Icon = ImpIcon[data.impression];
              return <Icon size={28} />;
            })()}
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: PAPER_INK,
            }}
          >
            {t(`tastingNote.beginner.impression.${data.impression}`)}
          </span>
        </div>
      </div>

      {/* Taste — 3 levels */}
      <div style={{ padding: '14px 22px', borderBottom: `1px solid ${PAPER_LINE}` }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: PAPER_INK,
            marginBottom: 10,
          }}
        >
          {t('tastingNote.beginner.step.taste')}
        </div>
        <ThreeWayRow
          label={t('tastingNote.beginner.tasteLabel.sweetness')}
          value={data.sweetness}
          options={['sweetLow', 'sweetMid', 'sweetHigh']}
        />
        <ThreeWayRow
          label={t('tastingNote.beginner.tasteLabel.acidity')}
          value={data.acidity}
          options={['acidLow', 'acidMid', 'acidHigh']}
        />
        <ThreeWayRow
          label={t('tastingNote.beginner.tasteLabel.body')}
          value={data.body}
          options={['bodyLow', 'bodyMid', 'bodyHigh']}
        />
        {data.tannin && (
          <ThreeWayRow
            label={t('tastingNote.beginner.tasteLabel.tannin')}
            value={data.tannin}
            options={['tanninLow', 'tanninMid', 'tanninHigh']}
          />
        )}
        {data.bubbles && (
          <ThreeWayRow
            label={t('tastingNote.beginner.tasteLabel.bubbles')}
            value={data.bubbles}
            options={['bubblesLow', 'bubblesMid', 'bubblesHigh']}
          />
        )}
      </div>

      {/* Aroma cards */}
      <div style={{ padding: '14px 22px', borderBottom: `1px solid ${PAPER_LINE}` }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: PAPER_INK,
            marginBottom: 10,
          }}
        >
          {t('tastingNote.beginner.step.aroma')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {data.aromas.map(id => (
            <div
              key={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 10px',
                background: 'rgba(139,26,42,0.10)',
                border: `1px solid ${WINE_RED}`,
                borderRadius: 10,
              }}
            >
              <span aria-hidden style={{ display: 'inline-flex', color: WINE_RED }}>
                {(() => {
                  const Icon = AROMA_ICON[id];
                  return Icon ? <Icon size={18} /> : null;
                })()}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: PAPER_INK }}>
                {t(`tastingNote.beginner.aromaCard.${id}`)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Finish */}
      <div style={{ padding: '14px 22px', borderBottom: `1px solid ${PAPER_LINE}` }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: PAPER_INK,
            marginBottom: 8,
          }}
        >
          {t('tastingNote.beginner.step.finish')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden style={{ display: 'inline-flex', color: WINE_RED }}>
            {data.finish === 'short' ? <StopwatchIcon size={22} />
              : data.finish === 'medium' ? <ClockIcon size={22} />
              : <WineGlassRedIcon size={22} />}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: PAPER_INK }}>
            {t(`tastingNote.beginner.finishOption.${data.finish}`)}
          </span>
        </div>
      </div>

      {/* Rating + memo */}
      <div style={{ padding: '14px 22px', borderBottom: `1px solid ${PAPER_LINE}` }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: PAPER_INK,
            marginBottom: 8,
          }}
        >
          {t('tastingNote.beginner.step.rating')}
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 12 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <WineGlassMark key={i} filled={i <= data.rating} />
          ))}
          <span style={{ fontSize: 11, color: PAPER_INK_DIM, marginLeft: 8 }}>
            {data.rating}/5
          </span>
        </div>
        <div
          style={{
            padding: '10px 12px',
            background: 'var(--color-ink-line)',
            borderLeft: `2px solid ${GOLD}`,
            borderRadius: 4,
            fontSize: 12,
            fontStyle: 'italic',
            color: PAPER_INK,
            lineHeight: 1.5,
          }}
        >
          “{t(`tastingNote.mockup.beginner.note.${variantKey}`)}”
        </div>
      </div>
    </>
  );
}

function ThreeWayRow({
  label,
  value,
  options,
}: {
  label: string;
  value: Level;
  options: [string, string, string]; // i18n keys for sweetLow/Mid/High etc.
}) {
  const { t } = useLocale();
  const idx = value === 'low' ? 0 : value === 'mid' ? 1 : 2;
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
        <span style={{ fontSize: 11, fontWeight: 700, color: PAPER_INK }}>{label}</span>
        <span style={{ fontSize: 11, color: WINE_RED, fontStyle: 'italic', fontWeight: 600 }}>
          {t(`tastingNote.beginner.scale.${options[idx]}`)}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
        {options.map((opt, i) => {
          const active = i === idx;
          return (
            <div
              key={opt}
              style={{
                padding: '4px 6px',
                textAlign: 'center',
                background: active ? WINE_RED : 'transparent',
                color: active ? 'var(--color-text-primary)' : PAPER_INK_DIM,
                border: `1px solid ${active ? WINE_RED : PAPER_LINE}`,
                borderRadius: 6,
                fontSize: 10,
                fontWeight: active ? 700 : 400,
              }}
            >
              {t(`tastingNote.beginner.scale.${opt}`)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
