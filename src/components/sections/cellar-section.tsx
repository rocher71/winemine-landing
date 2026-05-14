'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocale } from '@/components/providers/locale-provider';

type WineStatus = 'ready' | 'hold' | 'peak' | 'past';
type WineType = 'red' | 'white' | 'sparkling';

const STATUS_COLOR: Record<WineStatus, { text: string; bg: string; border: string; dot: string }> = {
  ready: { text: '#C9A84C', bg: 'rgba(201,168,76,0.14)',  border: 'rgba(201,168,76,0.45)',  dot: '#C9A84C' },
  hold:  { text: '#D4C5B0', bg: 'rgba(212,197,176,0.10)', border: 'rgba(212,197,176,0.30)', dot: '#D4C5B0' },
  peak:  { text: '#E06070', bg: 'rgba(196,30,58,0.18)',   border: 'rgba(196,30,58,0.55)',   dot: '#C41E3A' },
  past:  { text: '#9B8B7A', bg: 'rgba(155,139,122,0.10)', border: 'rgba(155,139,122,0.30)', dot: '#9B8B7A' },
};

// 음용 적기 타임라인 시각 위치 (0~1). status별로 from / current / peak / to 위치.
const TIMELINE_POSITIONS: Record<WineStatus, { from: number; peak: number; to: number; current: number }> = {
  ready: { from: 0, peak: 0.45, to: 1, current: 0.36 },
  hold:  { from: 0, peak: 0.70, to: 1, current: 0.22 },
  peak:  { from: 0, peak: 0.55, to: 1, current: 0.55 },
  past:  { from: 0, peak: 0.55, to: 1, current: 0.93 },
};

// 와인병 SVG (간단 inline)
function MiniBottle({ type }: { type: WineType }) {
  const fill =
    type === 'red' ? '#8B1A2A'
    : type === 'white' ? '#F5F0E8'
    : '#C9A84C'; // sparkling: gold
  const stroke = type === 'white' ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.35)';
  return (
    <svg width={36} height={96} viewBox="0 0 36 96" aria-hidden>
      {/* neck */}
      <rect x={15} y={4} width={6} height={20} rx={1.5} fill="#2D1540" />
      {/* foil */}
      <rect x={14} y={4} width={8} height={10} rx={1.5} fill="#0F0718" />
      {/* shoulder + body */}
      <path
        d="M 12 24 Q 12 30 8 36 Q 6 42 6 50 L 6 88 Q 6 92 10 92 L 26 92 Q 30 92 30 88 L 30 50 Q 30 42 28 36 Q 24 30 24 24 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={0.8}
      />
      {/* label */}
      <rect x={9} y={56} width={18} height={26} rx={1} fill={type === 'white' ? '#0F0718' : '#F5F0E8'} opacity={0.92} />
      <rect x={12} y={62} width={12} height={1.5} fill={type === 'white' ? '#C9A84C' : '#8B1A2A'} />
      <rect x={12} y={67} width={12} height={1} fill={type === 'white' ? '#C9A84C' : '#8B1A2A'} opacity={0.6} />
    </svg>
  );
}

type CellarWineRaw = {
  name: string;
  producer: string;
  vintage: string;
  place: string;
  acquired: string;
  price: string;
  type: string;
  status: string;
  peakLabel: string;
};

function StatusBadge({ status, label }: { status: WineStatus; label: string }) {
  const c = STATUS_COLOR[status];
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        background: c.bg,
        border: `1px solid ${c.border}`,
        fontSize: 11,
        fontWeight: 600,
        color: c.text,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {label}
    </div>
  );
}

function DrinkWindowBar({ status }: { status: WineStatus }) {
  const pos = TIMELINE_POSITIONS[status];
  const c = STATUS_COLOR[status];
  return (
    <div style={{ position: 'relative', width: '100%', marginTop: 4 }}>
      {/* track */}
      <div
        style={{
          position: 'relative',
          height: 6,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        {/* gradient from→peak→to */}
        <div
          style={{
            position: 'absolute',
            left: `${pos.from * 100}%`,
            right: `${(1 - pos.to) * 100}%`,
            top: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, rgba(155,139,122,0.4) 0%, rgba(201,168,76,0.85) 50%, rgba(155,139,122,0.4) 100%)',
            borderRadius: 999,
          }}
        />
      </div>
      {/* current marker dot */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: `${pos.current * 100}%`,
          transform: 'translate(-50%, -50%)',
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: c.dot,
          boxShadow: `0 0 0 3px rgba(0,0,0,0.55), 0 0 10px ${c.dot}`,
        }}
      />
      {/* peak tick */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: `${pos.peak * 100}%`,
          transform: 'translate(-50%, -50%)',
          width: 2,
          height: 10,
          background: '#C9A84C',
          opacity: 0.7,
        }}
      />
    </div>
  );
}

function AlertToggleCard({ label }: { label: string }) {
  const [on, setOn] = useState(true);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 18px',
        background: 'rgba(201,168,76,0.05)',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: 12,
      }}
    >
      <div
        aria-hidden
        style={{
          fontSize: 18,
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'rgba(201,168,76,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        🔔
      </div>
      <div style={{ flex: 1, fontSize: 13, color: '#D4C5B0' }}>{label}</div>
      <button
        type="button"
        onClick={() => setOn(v => !v)}
        aria-pressed={on}
        style={{
          width: 42,
          height: 24,
          borderRadius: 999,
          background: on ? '#C9A84C' : 'rgba(255,255,255,0.12)',
          position: 'relative',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 200ms ease',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: on ? 21 : 3,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#05020A',
            transition: 'left 200ms ease',
          }}
        />
      </button>
    </div>
  );
}

export default function CellarSection() {
  const shouldReduceMotion = useReducedMotion();
  const { messages } = useLocale();
  const cellar = messages.cellar;
  const wines: CellarWineRaw[] = (cellar?.wines as CellarWineRaw[]) ?? [];
  const badges = cellar?.badges ?? { ready: '', hold: '', peak: '', past: '' };
  const peakTpl: string = cellar?.peakLabel ?? '{years}';

  return (
    <section
      style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 58%), #0A050F',
        padding: 'clamp(80px,10vw,112px) 24px',
      }}
    >
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vw,64px)' }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.28em',
              color: '#C9A84C',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            {cellar?.sectionLabel}
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(26px,4vw,40px)',
              fontWeight: 400,
              color: '#F5F0E8',
              maxWidth: 720,
              margin: '0 auto',
              lineHeight: 1.25,
            }}
          >
            {cellar?.heading}
          </h2>
          <div style={{ width: 60, height: 2, background: '#C9A84C', margin: '20px auto 18px' }} />
          <p style={{ fontSize: 15, color: '#9B8B7A', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            {cellar?.subheading}
          </p>
        </motion.div>

        {/* Cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
            marginBottom: 40,
          }}
        >
          {wines.map((wine, i) => {
            const status = (wine.status as WineStatus) ?? 'hold';
            const type = (wine.type as WineType) ?? 'red';
            const badgeLabel = (badges as Record<string, string>)[status] ?? '';
            const peakReadout =
              wine.peakLabel === '지금' || wine.peakLabel === 'Now'
                ? cellar?.peakNow ?? wine.peakLabel
                : peakTpl.replace('{years}', wine.peakLabel);

            return (
              <motion.div
                key={i}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                viewport={{ once: true, margin: '-40px' }}
                style={{
                  background: 'rgba(15,7,24,0.7)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16,
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {/* Top row: bottle + meta */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <MiniBottle type={type} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        fontSize: 18,
                        color: '#F5F0E8',
                        lineHeight: 1.25,
                        marginBottom: 4,
                      }}
                    >
                      {wine.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#9B8B7A', marginBottom: 10 }}>
                      {wine.producer} · {wine.vintage}
                    </div>
                    <StatusBadge status={status} label={badgeLabel} />
                  </div>
                </div>

                {/* Drink window timeline */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6A5E4A', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    <span>{cellar?.timelineFrom ?? 'From'}</span>
                    <span style={{ color: '#C9A84C', fontWeight: 600 }}>{peakReadout}</span>
                    <span>{cellar?.timelineTo ?? 'To'}</span>
                  </div>
                  <DrinkWindowBar status={status} />
                </div>

                {/* Meta lines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9B8B7A' }}>
                    <span style={{ color: '#6A5E4A' }}>위치</span>
                    <span>{wine.place}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9B8B7A' }}>
                    <span style={{ color: '#6A5E4A' }}>취득</span>
                    <span>{wine.acquired}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9B8B7A' }}>
                    <span style={{ color: '#6A5E4A' }}>구매가</span>
                    <span style={{ color: '#D4C5B0', fontWeight: 600 }}>{wine.price}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Alert toggle */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={{ once: true }}
          style={{ maxWidth: 520, margin: '0 auto 48px' }}
        >
          <AlertToggleCard label={cellar?.alertToggle ?? ''} />
        </motion.div>

        {/* Bullets */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {(cellar?.bullets ?? []).map((b, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '8px 12px' }}>
              <div style={{ fontSize: 14, color: '#F5F0E8', fontWeight: 600, marginBottom: 6 }}>{b.title}</div>
              <div style={{ fontSize: 12, color: '#9B8B7A', lineHeight: 1.6 }}>{b.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
