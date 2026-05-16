'use client';

// Opening Timeline — 8 timepoint × 5 입력 + Recommendation + Evolution SVG
// spec §opening_timeline

import { useState, useEffect, useRef } from 'react';
import { useLocale } from '@/components/providers/locale-provider';
import {
  WineGlassRedIcon,
  StarFilledIcon,
  CheckIcon,
  StarBurstIcon,
} from '@/components/icons/wine-icons';
import {
  TIMEPOINT_PRESETS,
  matchOpeningGuide,
  type EvolutionPoint,
  type FormVariant,
  type Delta,
} from '@/lib/tasting-note-lexicon';

const GOLD = 'var(--color-gold)';
const WINE_RED = 'var(--color-wine-red)';
const MUTED = 'var(--color-text-muted)';
const BORDER = 'var(--color-border)';

interface Props {
  variant: FormVariant;
  meta: {
    vintage: number | null;
    grapeVarieties: string[];
    region: string;
  };
  state: {
    openedAt: string | null;
    decanted: boolean;
    timepoints: EvolutionPoint[];
    peakIndex: number | null;
  };
  onOpenedAt: (iso: string | null) => void;
  onDecant: (b: boolean) => void;
  onUpsert: (tp: EvolutionPoint) => void;
  onPeak: (idx: number | null) => void;
}

export default function OpeningTimeline({ variant, meta, state, onOpenedAt, onDecant, onUpsert, onPeak }: Props) {
  const { t, locale } = useLocale();
  const [activeMin, setActiveMin] = useState<number>(0);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 라이브 타이머 — openedAt 설정되면 1초마다 갱신
  useEffect(() => {
    if (!state.openedAt) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    intervalRef.current = setInterval(() => setTick(n => n + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [state.openedAt]);

  const elapsedSec = state.openedAt ? Math.floor((Date.now() - new Date(state.openedAt).getTime()) / 1000) : 0;
  void tick; // 강제 re-render만 사용
  const elapsedFmt = formatElapsed(elapsedSec);

  const guide = matchOpeningGuide({
    variant,
    vintage: meta.vintage,
    grapeVarieties: meta.grapeVarieties,
    region: meta.region,
  });

  const activeTp = state.timepoints.find(tp => tp.minutesAfterOpen === activeMin);

  function patchActive(patch: Partial<EvolutionPoint>) {
    const preset = TIMEPOINT_PRESETS.find(p => p.minutes === activeMin);
    const base: EvolutionPoint = activeTp ?? {
      minutesAfterOpen: activeMin,
      label: preset?.label ?? `${activeMin}m`,
      aromaIntensityDelta: 0,
      tanninSoftnessDelta: 0,
      bodyDelta: 0,
      reductionPresent: false,
      newAromasEmerged: [],
      overallScore: 3,
      note: '',
    };
    onUpsert({ ...base, ...patch });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 컨트롤 행 */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span aria-hidden style={{ display: 'inline-flex' }}><WineGlassRedIcon size={14} /></span>
            Cork
          </span>
          {state.openedAt ? (
            <button
              type="button"
              onClick={() => onOpenedAt(null)}
              style={pillBtn(true)}
            >
              {elapsedFmt}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenedAt(new Date().toISOString())}
                style={pillBtn(false)}
              >
                {t('tastingNote.evolution.openedAtNow')}
              </button>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: MUTED }}>
            {t('tastingNote.evolution.decantLabel')}
          </span>
          <button type="button" onClick={() => onDecant(true)} style={pillBtn(state.decanted)}>
            {t('tastingNote.evolution.yes')}
          </button>
          <button type="button" onClick={() => onDecant(false)} style={pillBtn(!state.decanted)}>
            {t('tastingNote.evolution.no')}
          </button>
        </div>
      </div>

      {/* Timeline track */}
      <div style={{ position: 'relative', padding: '20px 8px 12px' }}>
        <div style={{ position: 'absolute', left: 16, right: 16, top: 28, height: 1, background: BORDER }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {TIMEPOINT_PRESETS.map(preset => {
            const tp = state.timepoints.find(t => t.minutesAfterOpen === preset.minutes);
            const filled = !!tp;
            const isActive = preset.minutes === activeMin;
            const isPeak = state.peakIndex != null && state.timepoints[state.peakIndex]?.minutesAfterOpen === preset.minutes;
            return (
              <button
                key={preset.minutes}
                type="button"
                onClick={() => setActiveMin(preset.minutes)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: 'inherit',
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: isPeak ? WINE_RED : filled ? GOLD : 'var(--color-bg-map)',
                    border: `2px solid ${isActive ? GOLD : isPeak ? WINE_RED : filled ? GOLD : 'var(--color-text-disabled)'}`,
                    boxShadow: isActive ? `0 0 0 4px rgba(201,168,76,0.18)` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isPeak ? 'var(--color-text-primary)' : 'var(--color-bg-map)',
                  }}
                  aria-hidden
                >
                  {isPeak ? <StarFilledIcon size={9} filled /> : filled ? <CheckIcon size={9} /> : null}
                </div>
                <span style={{ fontSize: 10, color: isActive ? GOLD : MUTED, fontWeight: isActive ? 700 : 400 }}>
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active timepoint panel */}
      <div
        style={{
          padding: 20,
          background: 'var(--color-bg-surface)',
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
        }}
      >
        <div style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: 22, color: 'var(--color-text-primary)', marginBottom: 12, fontWeight: 700 }}>
          T+{TIMEPOINT_PRESETS.find(p => p.minutes === activeMin)?.label}
        </div>

        <DeltaSlider
          labelKey="tastingNote.evolution.deltaAroma"
          value={activeTp?.aromaIntensityDelta ?? 0}
          onChange={d => patchActive({ aromaIntensityDelta: d })}
        />
        {variant === 'red' && (
          <DeltaSlider
            labelKey="tastingNote.evolution.deltaTannin"
            value={activeTp?.tanninSoftnessDelta ?? 0}
            onChange={d => patchActive({ tanninSoftnessDelta: d })}
          />
        )}
        <DeltaSlider
          labelKey="tastingNote.evolution.deltaBody"
          value={activeTp?.bodyDelta ?? 0}
          onChange={d => patchActive({ bodyDelta: d })}
        />

        {/* Reduction toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={activeTp?.reductionPresent ?? false}
            onChange={e => patchActive({ reductionPresent: e.target.checked })}
            style={{ accentColor: WINE_RED }}
          />
          <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
            {t('tastingNote.evolution.reductionLabel')}
          </span>
          <span title={t('tastingNote.evolution.reductionTooltip')} style={{ color: GOLD, cursor: 'help', fontSize: 11 }}>ⓘ</span>
        </label>

        {/* Score + Peak */}
        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: MUTED }}>{t('tastingNote.evolution.scoreLabel')}</span>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => patchActive({ overallScore: n as 1 | 2 | 3 | 4 | 5 })}
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: (activeTp?.overallScore ?? 0) >= n ? GOLD : 'transparent',
                color: (activeTp?.overallScore ?? 0) >= n ? 'var(--color-bg-map)' : MUTED,
                border: `1px solid ${(activeTp?.overallScore ?? 0) >= n ? GOLD : BORDER}`,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              const idx = state.timepoints.findIndex(tp => tp.minutesAfterOpen === activeMin);
              onPeak(idx >= 0 ? idx : null);
            }}
            disabled={!activeTp}
            style={{
              marginLeft: 'auto',
              padding: '6px 14px',
              background: state.peakIndex != null && state.timepoints[state.peakIndex]?.minutesAfterOpen === activeMin ? WINE_RED : 'transparent',
              color: state.peakIndex != null && state.timepoints[state.peakIndex]?.minutesAfterOpen === activeMin ? 'var(--color-text-primary)' : GOLD,
              border: `1px solid ${WINE_RED}`,
              borderRadius: 16,
              cursor: activeTp ? 'pointer' : 'not-allowed',
              opacity: activeTp ? 1 : 0.4,
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <StarFilledIcon size={11} filled aria-hidden />
              {t('tastingNote.evolution.peakLabel')}
            </span>
          </button>
        </div>
      </div>

      {/* Recommendation */}
      {guide && (
        <div style={{ padding: 16, background: 'rgba(201,168,76,0.06)', border: `1px solid ${GOLD}`, borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span aria-hidden style={{ display: 'inline-flex' }}><StarBurstIcon size={12} /></span>
            {t('tastingNote.evolution.recommendationTitle')}
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: 4 }}>
            {locale === 'ko' ? guide.ko : guide.en}
          </div>
          <div style={{ fontSize: 11, color: MUTED, fontStyle: 'italic', marginBottom: 8 }}>
            {t('tastingNote.evolution.recommendedRange')
              .replace('{min}', String(guide.recommendedMinutes.min))
              .replace('{peak}', String(guide.recommendedMinutes.peak))
              .replace('{max}', String(guide.recommendedMinutes.max))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {guide.rationale}
          </div>
          {state.peakIndex != null && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(139,26,42,0.18)', borderRadius: 6, fontSize: 12, color: 'var(--color-text-primary)' }}>
              {peakComparison(state.timepoints[state.peakIndex]?.minutesAfterOpen ?? 0, guide.recommendedMinutes.peak, t)}
            </div>
          )}
        </div>
      )}

      {/* Evolution chart */}
      {state.timepoints.length >= 2 && <EvolutionChart timepoints={state.timepoints} peakIndex={state.peakIndex} />}
    </div>
  );
}

function pillBtn(active: boolean): React.CSSProperties {
  return {
    padding: '6px 12px',
    background: active ? GOLD : 'transparent',
    color: active ? 'var(--color-bg-map)' : 'var(--color-text-secondary)',
    border: `1px solid ${active ? GOLD : BORDER}`,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };
}

function formatElapsed(sec: number): string {
  if (sec < 60) return `T+${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return `T+${m}:${String(s).padStart(2, '0')}`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `T+${h}:${String(rm).padStart(2, '0')}`;
}

function peakComparison(peakMin: number, recMin: number, t: (k: string) => string): string {
  const diff = peakMin - recMin;
  if (Math.abs(diff) <= 15) return t('tastingNote.evolution.compareOnTime');
  if (diff <= -60) return t('tastingNote.evolution.compareWayEarly');
  if (diff < -15) return t('tastingNote.evolution.compareEarly');
  if (diff > 60) return t('tastingNote.evolution.compareWayLate');
  return t('tastingNote.evolution.compareLate');
}

function DeltaSlider({
  labelKey,
  value,
  onChange,
}: {
  labelKey: string;
  value: Delta;
  onChange: (d: Delta) => void;
}) {
  const { t } = useLocale();
  const opts: Delta[] = [-2, -1, 0, 1, 2];
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
        {t(labelKey)}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {opts.map(d => {
          const active = d === value;
          const color =
            d === -2 ? '#5C4070' :
            d === -1 ? '#7A5A8A' :
            d === 0  ? MUTED :
            d === 1  ? GOLD :
            WINE_RED;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onChange(d)}
              style={{
                flex: 1,
                padding: '6px 8px',
                background: active ? color : 'transparent',
                color: active ? 'var(--color-text-primary)' : MUTED,
                border: `1px solid ${active ? color : BORDER}`,
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 11,
                fontWeight: 600,
                transition: 'background 180ms ease, color 180ms ease',
              }}
            >
              {d > 0 ? `+${d}` : d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EvolutionChart({ timepoints, peakIndex }: { timepoints: EvolutionPoint[]; peakIndex: number | null }) {
  const sorted = [...timepoints].sort((a, b) => a.minutesAfterOpen - b.minutesAfterOpen);
  const W = 480;
  const H = 120;
  const PAD = 24;
  const maxMin = Math.max(360, ...sorted.map(s => s.minutesAfterOpen));
  const xOf = (m: number) => PAD + ((m / maxMin) * (W - 2 * PAD));
  const yOf = (s: number) => H - PAD - ((s - 1) / 4) * (H - 2 * PAD);
  const points = sorted.map(s => `${xOf(s.minutesAfterOpen)},${yOf(s.overallScore)}`).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: 'var(--color-bg-surface)', borderRadius: 8, border: `1px solid ${BORDER}` }}>
      {[1, 2, 3, 4, 5].map(s => (
        <line key={s} x1={PAD} y1={yOf(s)} x2={W - PAD} y2={yOf(s)} stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray={s === 1 || s === 5 ? undefined : '2 4'} />
      ))}
      <polyline points={points} fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {sorted.map((s, i) => {
        const peak = peakIndex != null && timepoints[peakIndex]?.minutesAfterOpen === s.minutesAfterOpen;
        return (
          <g key={s.minutesAfterOpen}>
            <circle cx={xOf(s.minutesAfterOpen)} cy={yOf(s.overallScore)} r={peak ? 6 : 4} fill={s.reductionPresent ? 'var(--color-text-muted)' : peak ? WINE_RED : GOLD} />
            {peak && (
              <g transform={`translate(${xOf(s.minutesAfterOpen) - 6}, ${yOf(s.overallScore) - 18})`}>
                <path
                  d="M6 1 L7.2 4.7 L11 4.8 L8 7.2 L9 11 L6 8.8 L3 11 L4 7.2 L1 4.8 L4.8 4.7 Z"
                  fill={WINE_RED}
                />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
