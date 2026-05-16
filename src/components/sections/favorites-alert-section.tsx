'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart, ShoppingBag, Bell, TrendingUp, type LucideIcon } from 'lucide-react';
import { useLocale } from '@/components/providers/locale-provider';

const STEP_ICONS: LucideIcon[] = [Heart, ShoppingBag, Bell, TrendingUp];

// Mini sparkline (간단 SVG path) — recharts 없이 가볍게 그림
function Sparkline() {
  // 12 points
  const points = [22, 18, 24, 20, 26, 23, 30, 27, 33, 31, 36, 34];
  const w = 120;
  const h = 36;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const dx = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * dx;
      const y = h - ((p - min) / (max - min)) * (h - 4) - 2;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-gold)" stopOpacity={0.4} />
          <stop offset="100%" stopColor="var(--color-gold)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#spark-grad)" />
      <path d={path} fill="none" stroke="var(--color-gold)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PushBanner({ title, body }: { title: string; body: string }) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      viewport={{ once: true, margin: '-40px' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: 'var(--color-bg-surface)',
        border: '1px solid rgba(201,168,76,0.45)',
        borderRadius: 14,
        boxShadow: '0 12px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.08)',
        minWidth: 0,
      }}
    >
      <div
        aria-hidden
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Bell size={16} color="var(--color-text-primary)" strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            color: 'var(--color-text-primary)',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          winemine · {title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--color-text-muted)',
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {body}
        </div>
      </div>
    </motion.div>
  );
}

function AlertToggleRow({ label }: { label: string }) {
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
      <Bell size={18} color="var(--color-gold)" strokeWidth={2} aria-hidden style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 13, color: 'var(--color-text-secondary)' }}>{label}</div>
      <button
        type="button"
        onClick={() => setOn(v => !v)}
        aria-pressed={on}
        style={{
          width: 42,
          height: 24,
          borderRadius: 999,
          background: on ? 'var(--color-gold)' : 'var(--overlay-medium)',
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
            background: 'var(--color-bg-deepest)',
            transition: 'left 200ms ease',
          }}
        />
      </button>
    </div>
  );
}

type FavStep = { title: string; body: string };

function FlowStep({ step, index }: { step: FavStep; index: number }) {
  const isPush = index === 2;
  const Icon = STEP_ICONS[index] ?? Heart;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      viewport={{ once: true, margin: '-40px' }}
      style={{
        flex: '1 1 0',
        minWidth: 180,
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-soft)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: isPush ? 'rgba(201,168,76,0.12)' : 'var(--overlay-soft)',
          border: isPush ? '1px solid rgba(201,168,76,0.45)' : '1px solid var(--color-border-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-hidden
      >
        <Icon size={22} color="var(--color-gold)" strokeWidth={1.8} />
      </div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--color-gold)',
          fontWeight: 600,
        }}
      >
        Step {String(index + 1).padStart(2, '0')}
      </div>
      <div style={{ fontSize: 15, color: 'var(--color-text-primary)', fontWeight: 600 }}>{step.title}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{step.body}</div>

      {/* Step 4 sparkline */}
      {index === 3 && (
        <div style={{ marginTop: 6 }}>
          <Sparkline />
        </div>
      )}
    </motion.div>
  );
}

export default function FavoritesAlertSection() {
  const shouldReduceMotion = useReducedMotion();
  const { messages } = useLocale();
  const fa = messages.favoritesAlert;
  const steps: FavStep[] = (fa?.steps as FavStep[]) ?? [];

  return (
    <section
      style={{
        background: 'var(--color-bg-deep)',
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
              color: 'var(--color-gold)',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            {fa?.sectionLabel}
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(26px,4vw,40px)',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              lineHeight: 1.25,
            }}
          >
            {fa?.heading}
          </h2>
          <div style={{ width: 60, height: 2, background: 'var(--color-gold)', margin: '20px auto 18px' }} />
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            {fa?.subheading}
          </p>
        </motion.div>

        {/* 4-step flow */}
        <div
          style={{
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 36,
          }}
        >
          {steps.map((s, i) => (
            <FlowStep key={i} step={s} index={i} />
          ))}
        </div>

        {/* Push banner demo */}
        <div style={{ maxWidth: 460, margin: '0 auto 28px' }}>
          <PushBanner title={fa?.pushBanner?.title ?? ''} body={fa?.pushBanner?.body ?? ''} />
        </div>

        {/* Alert toggle + hint */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={{ once: true }}
          style={{ maxWidth: 560, margin: '0 auto 48px' }}
        >
          <AlertToggleRow label={fa?.alertToggleLabel ?? ''} />
          <p
            style={{
              fontSize: 13,
              color: 'var(--color-text-muted)',
              lineHeight: 1.7,
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            {fa?.alertHint}
          </p>
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
            borderTop: '1px solid var(--color-border-soft)',
          }}
        >
          {(fa?.bullets ?? []).map((b, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '8px 12px' }}>
              <div style={{ fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: 6 }}>{b.title}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{b.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
