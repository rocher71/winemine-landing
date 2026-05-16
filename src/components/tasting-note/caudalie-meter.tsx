'use client';

// Caudalie Meter — RAF 카운트다운 + progress ring + 카테고리 자동 분류
// spec §caudalie_meter

import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/components/providers/locale-provider';
import { RefreshIcon } from '@/components/icons/wine-icons';
import {
  caudalieCategory,
  caudalieComparison,
  type FinishLength,
} from '@/lib/tasting-note-lexicon';

const GOLD = 'var(--color-gold)';
const WINE_RED = 'var(--color-wine-red)';
const MUTED = 'var(--color-text-muted)';
const DIM = 'var(--color-text-disabled)';

const RING_SIZE = 220;
const RING_R = 96;
const RING_CIRC = 2 * Math.PI * RING_R;

interface Props {
  caudalies: number | null;
  onChange: (n: number) => void;
}

export default function CaudalieMeter({ caudalies, onChange }: Props) {
  const { t, locale } = useLocale();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(caudalies ?? 0);
  const startedAt = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    function tick(now: number) {
      if (startedAt.current == null) startedAt.current = now;
      const sec = Math.floor((now - startedAt.current) / 1000);
      setElapsed(sec);
      rafId.current = requestAnimationFrame(tick);
    }
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
      rafId.current = null;
    };
  }, [running]);

  function start() {
    startedAt.current = null;
    setElapsed(0);
    setRunning(true);
  }
  function stop() {
    setRunning(false);
    onChange(elapsed);
  }
  function reset() {
    setRunning(false);
    setElapsed(0);
    onChange(0);
  }

  const value = running ? elapsed : (caudalies ?? 0);
  const cat = caudalieCategory(value);
  const ringFill = Math.min(value / 30, 1);
  const offset = RING_CIRC * (1 - ringFill);

  const catColor: Record<FinishLength, string> = {
    short: DIM,
    medium: MUTED,
    long: GOLD,
    veryLong: WINE_RED,
  };

  const catLabel: Record<FinishLength, { ko: string; en: string }> = {
    short:    { ko: '짧음 (Short)',         en: 'Short' },
    medium:   { ko: '중간 (Medium)',         en: 'Medium' },
    long:     { ko: '긴 (Long)',             en: 'Long' },
    veryLong: { ko: '매우 긴 (Very Long)',   en: 'Very Long' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', width: RING_SIZE, height: RING_SIZE }}>
        <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_R}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_R}
            fill="none"
            stroke={catColor[cat]}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 320ms ease' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'var(--color-text-primary)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: 64, fontWeight: 700, lineHeight: 1, color: catColor[cat] }}>
            {value}
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 4, letterSpacing: '0.04em' }}>
            {t('tastingNote.mockup.caudalies')}
          </div>
          <div style={{ fontSize: 12, marginTop: 8, fontWeight: 600, color: catColor[cat] }}>
            {catLabel[cat][locale]}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: MUTED, fontStyle: 'italic', textAlign: 'center', maxWidth: 320 }}>
        ≈ {caudalieComparison(value, locale)}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {!running ? (
          <button
            type="button"
            onClick={start}
            style={{
              padding: '10px 20px',
              background: WINE_RED,
              color: 'var(--color-text-primary)',
              border: 'none',
              borderRadius: 24,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {t('tastingNote.caudalie.tapStart')}
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            style={{
              padding: '10px 20px',
              background: GOLD,
              color: 'var(--color-bg-map)',
              border: 'none',
              borderRadius: 24,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {t('tastingNote.caudalie.tapStop')}
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          aria-label={t('tastingNote.caudalie.reset')}
          style={{
            padding: '10px 16px',
            background: 'transparent',
            color: MUTED,
            border: `1px solid ${MUTED}`,
            borderRadius: 24,
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <RefreshIcon size={13} aria-hidden />
            {t('tastingNote.caudalie.reset')}
          </span>
        </button>
      </div>
    </div>
  );
}
