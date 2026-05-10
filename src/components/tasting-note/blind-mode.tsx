'use client';

// Blind Mode — GUESS THE WINE 4 항목 + 정답 공개 + 100점 채점
// spec §blind_mode + §blind_mode_scoring

import { useState } from 'react';
import { useLocale } from '@/components/providers/locale-provider';
import { TargetIcon, EyeIcon, CheckIcon } from '@/components/icons/wine-icons';

const GOLD = '#C9A84C';
const WINE_RED = '#8B1A2A';
const MUTED = '#9B8B7A';
const BORDER = '#2D1540';

const ANSWER = {
  grape: 'Cabernet Sauvignon 75% · Merlot 25%',
  region: 'Bordeaux / Pauillac',
  vintage: '2015',
  priceLabel: { ko: '10~20만', en: '100K~200K' },
};

type PriceRange = '~30k' | '30–60k' | '60–100k' | '100–200k' | '200k+';

const PRICE_OPTIONS: PriceRange[] = ['~30k', '30–60k', '60–100k', '100–200k', '200k+'];

interface Props {
  onCTA?: () => void;
}

export default function BlindMode({ onCTA }: Props) {
  const { t, locale } = useLocale();
  const [grape, setGrape] = useState('');
  const [region, setRegion] = useState('');
  const [vintage, setVintage] = useState('');
  const [price, setPrice] = useState<PriceRange | null>(null);
  const [revealed, setRevealed] = useState(false);

  const score = revealed ? compute(grape, region, vintage, price) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: 22, color: '#F5F0E8', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span aria-hidden style={{ color: WINE_RED, display: 'inline-flex' }}><TargetIcon size={20} /></span>
        {t('tastingNote.blind.title')}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        <Field label={t('tastingNote.blind.grape')} value={grape} onChange={setGrape} placeholder="Cabernet Sauvignon" />
        <Field label={t('tastingNote.blind.region')} value={region} onChange={setRegion} placeholder="Bordeaux / Burgundy …" />
        <Field label={t('tastingNote.blind.vintage')} value={vintage} onChange={setVintage} type="number" placeholder="2015" />
        <div>
          <label style={{ fontSize: 11, color: MUTED, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {t('tastingNote.blind.priceRange')}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {PRICE_OPTIONS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPrice(p)}
                style={{
                  padding: '6px 10px',
                  background: price === p ? WINE_RED : 'transparent',
                  color: price === p ? '#F5F0E8' : MUTED,
                  border: `1px solid ${price === p ? WINE_RED : BORDER}`,
                  borderRadius: 16,
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setRevealed(true)}
        disabled={revealed}
        style={{
          padding: '12px 24px',
          background: revealed ? BORDER : WINE_RED,
          color: revealed ? MUTED : '#F5F0E8',
          border: 'none',
          borderRadius: 28,
          fontSize: 14,
          fontWeight: 600,
          cursor: revealed ? 'default' : 'pointer',
          fontFamily: 'inherit',
          alignSelf: 'flex-start',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {revealed ? <CheckIcon size={16} aria-hidden /> : <EyeIcon size={16} aria-hidden />}
          {t('tastingNote.blind.reveal')}
        </span>
      </button>

      {revealed && score && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ScoreRow labelKey="grape" guess={grape || '—'} answer={ANSWER.grape} pts={score.grape} />
          <ScoreRow labelKey="region" guess={region || '—'} answer={ANSWER.region} pts={score.region} />
          <ScoreRow labelKey="vintage" guess={vintage || '—'} answer={ANSWER.vintage} pts={score.vintage} />
          <ScoreRow labelKey="price" guess={price ?? '—'} answer={ANSWER.priceLabel[locale]} pts={score.price} />
          <div
            style={{
              padding: 20,
              background: 'rgba(139,26,42,0.18)',
              border: `1px solid ${WINE_RED}`,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                background: WINE_RED,
                color: '#F5F0E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-playfair, Georgia, serif)',
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {score.total}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#F5F0E8', marginBottom: 4 }}>
                {rankLabel(score.total, t)}
              </div>
              <div style={{ fontSize: 12, color: MUTED, fontStyle: 'italic' }}>
                {t('tastingNote.blind.scoreTotal').replace('{score}', String(score.total))}
              </div>
            </div>
            {onCTA && (
              <button
                type="button"
                onClick={onCTA}
                style={{
                  marginLeft: 'auto',
                  padding: '8px 16px',
                  background: GOLD,
                  color: '#1A0A1E',
                  border: 'none',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {t('tastingNote.cta.waitlist')}
              </button>
            )}
          </div>
          <p style={{ fontSize: 11, color: MUTED, fontStyle: 'italic', textAlign: 'center' }}>
            {t('tastingNote.blind.demoNote')}
          </p>
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: 'text' | 'number'; placeholder?: string }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: MUTED, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          marginTop: 6,
          padding: '10px 12px',
          background: '#1A0A1E',
          color: '#F5F0E8',
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          fontSize: 13,
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

function ScoreRow({ labelKey, guess, answer, pts }: { labelKey: string; guess: string; answer: string; pts: number }) {
  const { t } = useLocale();
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr auto',
        gap: 12,
        alignItems: 'center',
        padding: '10px 12px',
        background: 'rgba(15,7,24,0.5)',
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: MUTED, textTransform: 'uppercase' }}>
        {t(`tastingNote.mockup.guessLabel.${labelKey}`)}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 11, color: MUTED, fontStyle: 'italic' }}>
          {t('tastingNote.mockup.guessRow.guess')} · {guess}
        </span>
        <span style={{ fontSize: 13, color: '#F5F0E8', fontWeight: 600 }}>
          {t('tastingNote.mockup.guessRow.answer')} · {answer}
        </span>
      </div>
      <span
        style={{
          padding: '4px 10px',
          background: pts >= 25 ? GOLD : pts >= 15 ? '#C9A84C66' : pts >= 8 ? BORDER : '#5C2030',
          color: pts >= 15 ? '#1A0A1E' : '#F5F0E8',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 700,
          minWidth: 36,
          textAlign: 'center',
        }}
      >
        {pts}
      </span>
    </div>
  );
}

function compute(grape: string, region: string, vintage: string, price: PriceRange | null) {
  const g = grape.toLowerCase();
  const grapePts = g.includes('cabernet sauvignon') ? 25 : g.includes('cabernet') ? 15 : g ? 5 : 0;
  const r = region.toLowerCase();
  const regionPts = r.includes('pauillac') ? 25 : r.includes('bordeaux') ? 15 : r ? 5 : 0;
  const v = parseInt(vintage, 10);
  const vintagePts = v === 2015 ? 25 : Math.abs(v - 2015) <= 2 ? 15 : Math.abs(v - 2015) <= 5 ? 8 : 0;
  const pricePts = price === '100–200k' ? 25 : price === '60–100k' || price === '200k+' ? 12 : price ? 0 : 0;
  return {
    grape: grapePts,
    region: regionPts,
    vintage: isNaN(v) ? 0 : vintagePts,
    price: pricePts,
    total: grapePts + regionPts + (isNaN(v) ? 0 : vintagePts) + pricePts,
  };
}

function rankLabel(total: number, t: (k: string) => string): string {
  if (total >= 90) return t('tastingNote.blind.rankMaster');
  if (total >= 70) return t('tastingNote.blind.rankAdvanced');
  if (total >= 50) return t('tastingNote.blind.rankEnthusiast');
  if (total >= 30) return t('tastingNote.blind.rankExploring');
  return t('tastingNote.blind.rankFinding');
}
