'use client';

// Tasting Note Playground — Day 1~5 풀 인터랙티브 데모
// spec §pages_and_interfaces 풀 사양 (정적 mockup 아님 — 실제 인터랙션)
// 메인 랜딩의 정적 mockup과 별개. 입력은 어디에도 저장되지 않음.

import Link from 'next/link';
import { useReducer, useState } from 'react';
import { useLocale } from '@/components/providers/locale-provider';
import {
  SWEETNESS_LABELS,
  ACIDITY_LABELS,
  BODY_LABELS,
  ALCOHOL_LABELS,
  caudalieCategory,
  type FormVariant,
  type WSETScale,
  type Fault,
  type EvolutionPoint,
  type TanninTexture,
  type BubbleSize,
  type BubblePersistence,
  type MousseTexture,
  type SparklingMethod,
  type SparklingDosage,
} from '@/lib/tasting-note-lexicon';
import WSETSlider from '@/components/tasting-note/wset-slider';
import AromaWheel from '@/components/tasting-note/aroma-wheel';
import CaudalieMeter from '@/components/tasting-note/caudalie-meter';
import FaultChecklist from '@/components/tasting-note/fault-checklist';
import OpeningTimeline from '@/components/tasting-note/opening-timeline';
import AutoDescription from '@/components/tasting-note/auto-description';
import BlindMode from '@/components/tasting-note/blind-mode';
import { TanninPanel, BubblePanel } from '@/components/tasting-note/tannin-bubble-panels';
import BeginnerNote from '@/components/tasting-note/beginner-note';
import WaitlistModal from '@/components/waitlist/waitlist-modal';
import { StoreButtons } from '@/components/ui/store-buttons';
import { FloatingCTA } from '@/components/ui/floating-cta';

type Mode = 'beginner' | 'expert';

const GOLD = '#C9A84C';
const WINE_RED = '#8B1A2A';
const MUTED = '#9B8B7A';
const BORDER = '#2D1540';

interface State {
  variant: FormVariant;
  meta: { vintage: number | null; producer: string; region: string; wineName: string; grapeVarieties: string[] };
  aromaIntensity: WSETScale;
  aromaSelected: string[];
  sweetness: WSETScale;
  acidity: WSETScale;
  body: WSETScale;
  alcohol: WSETScale;
  tannin: { intensity: WSETScale; texture: TanninTexture; ripeness: 'ripe' | 'unripe' | 'overripe' };
  bubbles: { size: BubbleSize; persistence: BubblePersistence; mousse: MousseTexture; pressure: number; method: SparklingMethod };
  dosage: SparklingDosage;
  caudalies: number;
  faults: Fault[];
  evolution: { openedAt: string | null; decanted: boolean; timepoints: EvolutionPoint[]; peakIndex: number | null };
  rating: number;
}

const INITIAL: State = {
  variant: 'red',
  meta: {
    vintage: 2017,
    producer: 'Domaine de Courcel',
    region: 'Burgundy / Côte de Beaune',
    wineName: 'Pommard 1er Cru Les Rugiens',
    grapeVarieties: ['Pinot Noir 100%'],
  },
  aromaIntensity: 'mediumPlus',
  aromaSelected: ['black-cherry', 'violet', 'leather'],
  sweetness: 'low',
  acidity: 'mediumPlus',
  body: 'mediumPlus',
  alcohol: 'medium',
  tannin: { intensity: 'mediumPlus', texture: 'fineGrained', ripeness: 'ripe' },
  bubbles: { size: 'fine', persistence: 'persistent', mousse: 'creamy', pressure: 6, method: 'traditional' },
  dosage: 'brut',
  caudalies: 0,
  faults: [],
  evolution: { openedAt: null, decanted: false, timepoints: [], peakIndex: null },
  rating: 0,
};

type Action =
  | { type: 'SET_VARIANT'; v: FormVariant }
  | { type: 'TOGGLE_AROMA'; id: string }
  | { type: 'SET_AROMA_INTENSITY'; v: WSETScale }
  | { type: 'SET_PALATE'; key: 'sweetness' | 'acidity' | 'body' | 'alcohol'; v: WSETScale }
  | { type: 'SET_TANNIN'; tannin: State['tannin'] }
  | { type: 'SET_BUBBLES'; bubbles: State['bubbles'] }
  | { type: 'SET_DOSAGE'; dosage: SparklingDosage }
  | { type: 'SET_CAUDALIES'; n: number }
  | { type: 'TOGGLE_FAULT'; id: Fault }
  | { type: 'SET_OPENED_AT'; iso: string | null }
  | { type: 'SET_DECANT'; b: boolean }
  | { type: 'UPSERT_TIMEPOINT'; tp: EvolutionPoint }
  | { type: 'SET_PEAK'; idx: number | null }
  | { type: 'SET_RATING'; n: number };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'SET_VARIANT':         return { ...s, variant: a.v };
    case 'TOGGLE_AROMA':        return { ...s, aromaSelected: s.aromaSelected.includes(a.id) ? s.aromaSelected.filter(x => x !== a.id) : [...s.aromaSelected, a.id] };
    case 'SET_AROMA_INTENSITY': return { ...s, aromaIntensity: a.v };
    case 'SET_PALATE':          return { ...s, [a.key]: a.v };
    case 'SET_TANNIN':          return { ...s, tannin: a.tannin };
    case 'SET_BUBBLES':         return { ...s, bubbles: a.bubbles };
    case 'SET_DOSAGE':          return { ...s, dosage: a.dosage };
    case 'SET_CAUDALIES':       return { ...s, caudalies: a.n };
    case 'TOGGLE_FAULT':        return { ...s, faults: s.faults.includes(a.id) ? s.faults.filter(x => x !== a.id) : [...s.faults, a.id] };
    case 'SET_OPENED_AT':       return { ...s, evolution: { ...s.evolution, openedAt: a.iso } };
    case 'SET_DECANT':          return { ...s, evolution: { ...s.evolution, decanted: a.b } };
    case 'UPSERT_TIMEPOINT':    {
      const existing = s.evolution.timepoints.findIndex(tp => tp.minutesAfterOpen === a.tp.minutesAfterOpen);
      const next = existing >= 0
        ? s.evolution.timepoints.map((tp, i) => i === existing ? a.tp : tp)
        : [...s.evolution.timepoints, a.tp];
      return { ...s, evolution: { ...s.evolution, timepoints: next } };
    }
    case 'SET_PEAK':            return { ...s, evolution: { ...s.evolution, peakIndex: a.idx } };
    case 'SET_RATING':          return { ...s, rating: a.n };
  }
}

const VARIANTS: { id: FormVariant; icon: string }[] = [
  { id: 'white',     icon: '🥂' },
  { id: 'red',       icon: '🍷' },
  { id: 'sparkling', icon: '✨' },
  { id: 'blind',     icon: '🎯' },
];

export default function PlaygroundPage() {
  const { t } = useLocale();
  const [mode, setMode] = useState<Mode>('beginner');
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [modalOpen, setModalOpen] = useState(false);
  const openModal  = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // Blind 모드는 expert 전용. beginner에서는 자동으로 red 양식으로 fallback
  const effectiveVariant: FormVariant = mode === 'beginner' && state.variant === 'blind'
    ? 'red'
    : state.variant;

  // Beginner mode UI
  if (mode === 'beginner') {
    return (
      <main style={pageStyle}>
        <TopBar
          variant={effectiveVariant}
          onSelect={v => dispatch({ type: 'SET_VARIANT', v })}
          mode={mode}
          onMode={setMode}
          showBlind={false}
        />
        <Container>
          <BeginnerNote
            variant={effectiveVariant}
            wineName={state.meta.wineName}
            producer={state.meta.producer}
          />
          <DownloadCta onOpenModal={openModal} />
        </Container>
        <WaitlistModal isOpen={modalOpen} onClose={closeModal} />
        <FloatingCTA onOpenModal={openModal} isModalOpen={modalOpen} />
      </main>
    );
  }

  // Expert mode — Blind 양식
  if (state.variant === 'blind') {
    return (
      <main style={pageStyle}>
        <TopBar
          variant={state.variant}
          onSelect={v => dispatch({ type: 'SET_VARIANT', v })}
          mode={mode}
          onMode={setMode}
          showBlind
        />
        <Container>
          <BlindMode onCTA={openModal} />
          <DownloadCta onOpenModal={openModal} />
        </Container>
        <WaitlistModal isOpen={modalOpen} onClose={closeModal} />
        <FloatingCTA onOpenModal={openModal} isModalOpen={modalOpen} />
      </main>
    );
  }

  // Expert mode — White/Red/Sparkling
  return (
    <main style={pageStyle}>
      <TopBar
        variant={state.variant}
        onSelect={v => dispatch({ type: 'SET_VARIANT', v })}
        mode={mode}
        onMode={setMode}
        showBlind
      />
      <Container>
        <Step n={1} titleKey="tastingNote.playground.stepCapture">
          <CaptureCard meta={state.meta} />
        </Step>

        <Step n={2} titleKey="tastingNote.playground.stepAroma">
          <div style={{ marginBottom: 16 }}>
            <WSETSlider
              labelKey="tastingNote.dimensions.intensity"
              value={state.aromaIntensity}
              onChange={v => dispatch({ type: 'SET_AROMA_INTENSITY', v })}
              labels={{
                low: { ko: '닫힘', en: 'Closed' },
                mediumMinus: { ko: '은은함', en: 'Subtle' },
                medium: { ko: '중간', en: 'Medium' },
                mediumPlus: { ko: '뚜렷함', en: 'Pronounced' },
                high: { ko: '폭발적', en: 'Explosive' },
              }}
            />
          </div>
          <AromaWheel
            variant={state.variant}
            selected={state.aromaSelected}
            onToggle={id => dispatch({ type: 'TOGGLE_AROMA', id })}
          />
        </Step>

        <Step n={3} titleKey="tastingNote.playground.stepPalate">
          <WSETSlider labelKey="tastingNote.dimensions.sweetness" value={state.sweetness} onChange={v => dispatch({ type: 'SET_PALATE', key: 'sweetness', v })} labels={SWEETNESS_LABELS} />
          <WSETSlider labelKey="tastingNote.dimensions.acidity"   value={state.acidity}   onChange={v => dispatch({ type: 'SET_PALATE', key: 'acidity',   v })} labels={ACIDITY_LABELS} />
          <WSETSlider labelKey="tastingNote.dimensions.body"      value={state.body}      onChange={v => dispatch({ type: 'SET_PALATE', key: 'body',      v })} labels={BODY_LABELS} />
          <WSETSlider labelKey="tastingNote.dimensions.alcohol"   value={state.alcohol}   onChange={v => dispatch({ type: 'SET_PALATE', key: 'alcohol',   v })} labels={ALCOHOL_LABELS} />
          {state.variant === 'red' && (
            <div style={{ marginTop: 16 }}>
              <TanninPanel state={state.tannin} onChange={tannin => dispatch({ type: 'SET_TANNIN', tannin })} />
            </div>
          )}
          {state.variant === 'sparkling' && (
            <div style={{ marginTop: 16 }}>
              <BubblePanel
                bubbles={state.bubbles}
                dosage={state.dosage}
                onBubbles={bubbles => dispatch({ type: 'SET_BUBBLES', bubbles })}
                onDosage={dosage => dispatch({ type: 'SET_DOSAGE', dosage })}
              />
            </div>
          )}
        </Step>

        <Step n={4} titleKey="tastingNote.playground.stepFinish" hint={t('tastingNote.playground.finishHint')}>
          <CaudalieMeter caudalies={state.caudalies} onChange={n => dispatch({ type: 'SET_CAUDALIES', n })} />
        </Step>

        <Step n={5} titleKey="tastingNote.playground.stepFaults">
          <FaultChecklist selected={state.faults} onToggle={id => dispatch({ type: 'TOGGLE_FAULT', id })} />
        </Step>

        <Step n={6} titleKey="tastingNote.playground.stepEvolution">
          <OpeningTimeline
            variant={state.variant}
            meta={{ vintage: state.meta.vintage, grapeVarieties: state.meta.grapeVarieties, region: state.meta.region }}
            state={state.evolution}
            onOpenedAt={iso => dispatch({ type: 'SET_OPENED_AT', iso })}
            onDecant={b => dispatch({ type: 'SET_DECANT', b })}
            onUpsert={tp => dispatch({ type: 'UPSERT_TIMEPOINT', tp })}
            onPeak={idx => dispatch({ type: 'SET_PEAK', idx })}
          />
        </Step>

        <Step n={7} titleKey="tastingNote.playground.stepRating">
          <RatingPicker value={state.rating} onChange={n => dispatch({ type: 'SET_RATING', n })} />
          <div style={{ marginTop: 24 }}>
            <AutoDescription
              variant={state.variant}
              meta={state.meta}
              aroma={{ intensity: state.aromaIntensity, primary: state.aromaSelected, secondary: [] }}
              palate={{
                sweetness: state.sweetness,
                acidity: state.acidity,
                body: state.body,
                alcohol: state.alcohol,
                tannin: state.variant === 'red' ? { intensity: state.tannin.intensity, texture: state.tannin.texture } : undefined,
              }}
              finish={{
                caudalies: state.caudalies > 0 ? state.caudalies : null,
                length: caudalieCategory(state.caudalies),
              }}
              rating={state.rating}
              evolution={{
                peak: state.evolution.peakIndex != null
                  ? state.evolution.timepoints[state.evolution.peakIndex] ?? null
                  : null,
              }}
            />
          </div>
        </Step>

        <p style={{ textAlign: 'center', fontSize: 12, color: MUTED, marginTop: 32, fontStyle: 'italic' }}>
          {t('tastingNote.playground.demoNote')}
        </p>
        <DownloadCta onOpenModal={openModal} />
      </Container>
      <WaitlistModal isOpen={modalOpen} onClose={closeModal} />
      <FloatingCTA onOpenModal={openModal} isModalOpen={modalOpen} />
    </main>
  );
}

function DownloadCta({ onOpenModal }: { onOpenModal: () => void }) {
  const { t } = useLocale();
  return (
    <section
      style={{
        marginTop: 64,
        padding: '40px 28px',
        background: 'linear-gradient(135deg, rgba(139,26,42,0.18) 0%, rgba(201,168,76,0.10) 100%)',
        border: `1px solid ${GOLD}`,
        borderRadius: 20,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: GOLD,
          marginBottom: 16,
        }}
      >
        <span style={{ width: 8, height: 1, background: GOLD }} />
        {t('tastingNote.playground.downloadCta.eyebrow')}
        <span style={{ width: 8, height: 1, background: GOLD }} />
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-playfair, Georgia, serif)',
          fontSize: 'clamp(22px, 4vw, 32px)',
          fontWeight: 700,
          color: '#F5F0E8',
          margin: '0 0 16px',
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
        }}
      >
        {t('tastingNote.playground.downloadCta.heading')}
      </h2>
      <p
        style={{
          fontSize: 14,
          color: '#D4C5B0',
          lineHeight: 1.6,
          maxWidth: 520,
          margin: '0 auto 28px',
        }}
      >
        {t('tastingNote.playground.downloadCta.body')}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <StoreButtons onOpenModal={onOpenModal} location="playground_bottom" />
      </div>
      <button
        type="button"
        onClick={onOpenModal}
        style={{
          background: 'transparent',
          border: `1px solid ${GOLD}`,
          color: GOLD,
          padding: '10px 22px',
          borderRadius: 24,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.02em',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {t('tastingNote.playground.downloadCta.waitlist')} →
      </button>
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  background: '#05020A',
  minHeight: '100vh',
  color: '#F5F0E8',
  fontFamily: 'var(--font-inter, system-ui, sans-serif)',
};

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 clamp(20px, 5vw, 48px) 96px' }}>
      {children}
    </div>
  );
}

function TopBar({
  variant,
  onSelect,
  mode,
  onMode,
  showBlind,
}: {
  variant: FormVariant;
  onSelect: (v: FormVariant) => void;
  mode: Mode;
  onMode: (m: Mode) => void;
  showBlind: boolean;
}) {
  const { t } = useLocale();
  const visibleVariants = showBlind ? VARIANTS : VARIANTS.filter(v => v.id !== 'blind');
  return (
    <header style={{ padding: 'clamp(24px, 5vw, 48px) clamp(20px, 5vw, 48px) 32px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <Link href="/" style={{ color: GOLD, fontSize: 12, textDecoration: 'none', letterSpacing: '0.08em' }}>
          {t('tastingNote.playground.backToHome')}
        </Link>
        <h1
          style={{
            fontFamily: 'var(--font-playfair, Georgia, serif)',
            fontSize: 'clamp(32px, 5vw, 44px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#F5F0E8',
            margin: '12px 0 12px',
            lineHeight: 1.2,
          }}
        >
          {t('tastingNote.playground.pageTitle')}
        </h1>
        <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, maxWidth: 640, margin: '0 0 28px' }}>
          {t('tastingNote.playground.pageIntro')}
        </p>

        {/* MODE TOGGLE — beginner / expert (큰 버튼) */}
        <div
          role="radiogroup"
          aria-label="Mode"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            maxWidth: 720,
            marginBottom: 20,
          }}
        >
          {(['beginner', 'expert'] as Mode[]).map(m => {
            const isActive = mode === m;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onMode(m)}
                style={{
                  padding: '20px 22px',
                  background: isActive
                    ? m === 'beginner'
                      ? 'linear-gradient(135deg, rgba(201,168,76,0.22) 0%, rgba(201,168,76,0.10) 100%)'
                      : 'linear-gradient(135deg, rgba(139,26,42,0.28) 0%, rgba(139,26,42,0.10) 100%)'
                    : 'rgba(15,7,24,0.6)',
                  border: `2px solid ${isActive ? (m === 'beginner' ? GOLD : '#A02030') : BORDER}`,
                  borderRadius: 16,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  transition: 'background 200ms ease, border-color 200ms ease, transform 200ms ease',
                  transform: isActive ? 'translateY(-1px)' : 'none',
                  boxShadow: isActive ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22 }} aria-hidden>
                    {m === 'beginner' ? '🌱' : '🎓'}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-playfair, Georgia, serif)',
                      fontSize: 20,
                      fontWeight: 700,
                      color: isActive ? '#F5F0E8' : '#D4C5B0',
                    }}
                  >
                    {t(`tastingNote.playground.mode.${m}`)}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: MUTED, marginLeft: 30 }}>
                  {t(`tastingNote.playground.mode.${m}Subtitle`)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Variant tab bar */}
        <div
          role="tablist"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${visibleVariants.length}, 1fr)`,
            background: 'rgba(15,7,24,0.6)',
            border: '1px solid rgba(201,168,76,0.16)',
            borderRadius: 12,
            overflow: 'hidden',
            maxWidth: 720,
          }}
        >
          {visibleVariants.map(v => {
            const isActive = variant === v.id;
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
                  color: isActive ? '#F5F0E8' : MUTED,
                  padding: '14px 8px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 200ms ease',
                }}
              >
                <span style={{ fontSize: 18 }} aria-hidden>{v.icon}</span>
                <span>{t(`tastingNote.tabs.${v.id}`)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

function Step({ n, titleKey, hint, children }: { n: number; titleKey: string; hint?: string; children: React.ReactNode }) {
  const { t } = useLocale();
  return (
    <section style={{ marginBottom: 56, paddingTop: 32, borderTop: `1px solid ${BORDER}` }}>
      <h2
        style={{
          fontFamily: 'var(--font-playfair, Georgia, serif)',
          fontSize: 22,
          color: GOLD,
          margin: '0 0 4px',
          fontWeight: 700,
        }}
      >
        {t(titleKey)}
      </h2>
      {hint && <p style={{ fontSize: 12, color: MUTED, margin: '0 0 20px', fontStyle: 'italic' }}>{hint}</p>}
      <div style={{ marginTop: hint ? 0 : 20 }}>{children}</div>
    </section>
  );
}

function CaptureCard({ meta }: { meta: State['meta'] }) {
  const { t } = useLocale();
  return (
    <div
      style={{
        padding: 20,
        background: 'linear-gradient(135deg, rgba(15,7,24,0.85) 0%, rgba(26,10,30,0.85) 100%)',
        border: `1px solid ${GOLD}`,
        borderRadius: 12,
      }}
    >
      <div style={{ fontSize: 11, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
        📷 Camera · OCR
      </div>
      <h3 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: 20, fontWeight: 700, margin: '0 0 6px', color: '#F5F0E8' }}>
        {meta.wineName}
      </h3>
      <p style={{ fontSize: 13, color: MUTED, fontStyle: 'italic', margin: '0 0 12px' }}>
        {meta.producer}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 6, fontSize: 12 }}>
        <Tile k={t('tastingNote.mockup.meta.vintage')} v={meta.vintage ?? '—'} />
        <Tile k={t('tastingNote.mockup.meta.region')} v={meta.region} />
        <Tile k={t('tastingNote.mockup.meta.grape')} v={meta.grapeVarieties.join(' · ')} />
      </div>
    </div>
  );
}

function Tile({ k, v }: { k: string; v: string | number }) {
  return (
    <div style={{ padding: '6px 10px', background: 'rgba(15,7,24,0.6)', borderRadius: 6 }}>
      <div style={{ fontSize: 9, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>{k}</div>
      <div style={{ color: '#F5F0E8', fontSize: 12 }}>{v}</div>
    </div>
  );
}

function RatingPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const { t } = useLocale();
  return (
    <div>
      <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>
        {t('tastingNote.playground.ratingLabel')}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4, 5].map(i => {
          const filled = i <= value;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i === value ? 0 : i)}
              aria-label={`Rate ${i}`}
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: filled ? WINE_RED : 'transparent',
                border: `1px solid ${filled ? WINE_RED : BORDER}`,
                cursor: 'pointer',
                color: filled ? '#F5F0E8' : MUTED,
                fontSize: 16,
                fontFamily: 'inherit',
              }}
            >
              ★
            </button>
          );
        })}
        <span style={{ marginLeft: 12, alignSelf: 'center', fontSize: 14, color: MUTED }}>
          {value}/5
        </span>
      </div>
    </div>
  );
}
