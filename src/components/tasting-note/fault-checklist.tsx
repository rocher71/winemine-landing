'use client';

// Fault Checklist — 11종 카드, 명시적 체크
// spec §fault_checklist

import { useState } from 'react';
import { useLocale } from '@/components/providers/locale-provider';
import { WarningTriangleIcon, CheckIcon, ArrowUpIcon, ArrowDownIcon } from '@/components/icons/wine-icons';
import { FAULTS, type Fault } from '@/lib/tasting-note-lexicon';

const GOLD = 'var(--color-gold)';
const WINE_RED = 'var(--color-wine-red)';
const MUTED = 'var(--color-text-muted)';

interface Props {
  selected: Fault[];
  onToggle: (id: Fault) => void;
}

export default function FaultChecklist({ selected, onToggle }: Props) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: 'var(--color-bg-surface)', border: '1px solid rgba(201,168,76,0.16)', borderRadius: 12, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          padding: '14px 18px',
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden style={{ color: WINE_RED, display: 'inline-flex' }}>
            <WarningTriangleIcon size={16} />
          </span>
          {t('tastingNote.faults.title')}
          {selected.length > 0 && (
            <span style={{ color: WINE_RED, marginLeft: 4 }}>({selected.length})</span>
          )}
        </span>
        <span aria-hidden style={{ color: MUTED, display: 'inline-flex' }}>
          {open ? <ArrowUpIcon size={13} /> : <ArrowDownIcon size={13} />}
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 18px 18px' }}>
          <p style={{ fontSize: 12, color: MUTED, marginBottom: 12, fontStyle: 'italic' }}>
            {t('tastingNote.faults.intro')}
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 10,
            }}
          >
            {FAULTS.map(f => {
              const isOn = selected.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onToggle(f.id)}
                  style={{
                    textAlign: 'left',
                    padding: 12,
                    background: isOn ? 'rgba(139,26,42,0.18)' : 'var(--color-bg-surface)',
                    border: `1px solid ${isOn ? GOLD : 'rgba(245,240,232,0.08)'}`,
                    borderRadius: 8,
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 200ms ease, border-color 200ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: `1.5px solid ${isOn ? GOLD : MUTED}`,
                        background: isOn ? GOLD : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-bg-map)',
                      }}
                      aria-hidden
                    >
                      {isOn && <CheckIcon size={10} />}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{f.ko}</span>
                  </div>
                  <div style={{ fontSize: 10, color: MUTED, marginLeft: 24, lineHeight: 1.4 }}>
                    <div><strong style={{ color: 'var(--color-text-secondary)' }}>Cause:</strong> {f.cause}</div>
                    <div><strong style={{ color: 'var(--color-text-secondary)' }}>Threshold:</strong> {f.threshold}</div>
                    <div style={{ marginTop: 4 }}>{f.aroma}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 10, color: MUTED, marginTop: 12, fontStyle: 'italic' }}>
            {t('tastingNote.faults.footnote')}
          </p>
        </div>
      )}
    </div>
  );
}
