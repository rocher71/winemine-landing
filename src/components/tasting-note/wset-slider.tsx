'use client';

// WSET 5단계 슬라이더 — 클릭/키보드 인터랙션
// spec §wset_slider

import { useLocale } from '@/components/providers/locale-provider';
import type { WSETScale } from '@/lib/tasting-note-lexicon';

const SCALE_ORDER: WSETScale[] = ['low', 'mediumMinus', 'medium', 'mediumPlus', 'high'];

const GOLD = '#C9A84C';
const BORDER = '#2D1540';

interface Props {
  labelKey: string;
  value: WSETScale;
  onChange: (v: WSETScale) => void;
  labels: Record<WSETScale, { ko: string; en: string }>;
  hint?: string;
}

export default function WSETSlider({ labelKey, value, onChange, labels, hint }: Props) {
  const { t, locale } = useLocale();
  const idx = SCALE_ORDER.indexOf(value);

  function move(delta: number) {
    const next = Math.max(0, Math.min(SCALE_ORDER.length - 1, idx + delta));
    onChange(SCALE_ORDER[next]);
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F0E8' }}>{t(labelKey)}</span>
        <span style={{ fontSize: 12, color: GOLD }}>{labels[value][locale]}</span>
      </div>
      {hint && (
        <div style={{ fontSize: 11, color: '#9B8B7A', marginBottom: 8, fontStyle: 'italic' }}>
          {hint}
        </div>
      )}
      <div
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={idx}
        aria-label={t(labelKey)}
        onKeyDown={e => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            move(-1);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            move(1);
          }
        }}
        style={{
          position: 'relative',
          height: 24,
          display: 'flex',
          alignItems: 'center',
          outline: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 7,
            right: 7,
            height: 2,
            background: BORDER,
            borderRadius: 2,
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
              <button
                key={s}
                type="button"
                onClick={() => onChange(s)}
                aria-label={`${t(labelKey)} ${labels[s][locale]}`}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: active ? GOLD : '#1A0A1E',
                  border: `1px solid ${active ? GOLD : BORDER}`,
                  cursor: 'pointer',
                  padding: 0,
                  boxShadow: active ? `0 0 12px rgba(201,168,76,0.55)` : 'none',
                  transition: 'background 200ms ease, box-shadow 200ms ease',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
