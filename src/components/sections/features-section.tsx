'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// ── Panel 1: Wine region data ──────────────────────────────────────────────
const REGIONS = [
  { flag: '🇫🇷', country: '프랑스', wines: 28, bar: 95, color: '#C41E3A' },
  { flag: '🇮🇹', country: '이탈리아', wines: 21, bar: 74, color: '#C41E3A' },
  { flag: '🇨🇱', country: '칠레', wines: 18, bar: 62, color: '#C41E3A' },
  { flag: '🇳🇿', country: '뉴질랜드', wines: 14, bar: 48, color: '#C41E3A' },
  { flag: '🇪🇸', country: '스페인', wines: 11, bar: 38, color: '#C41E3A' },
  { flag: '🇦🇷', country: '아르헨티나', wines: 9, bar: 30, color: '#C41E3A' },
];

function RegionPanel() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {REGIONS.map((r, i) => (
        <div
          key={r.country}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{
            cursor: 'default',
            transition: 'transform 200ms ease',
            transform: hovered === i ? 'translateX(6px)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 13, color: hovered === i ? '#F5F0E8' : '#9B8B7A', transition: 'color 200ms' }}>
              {r.flag} {r.country}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#C9A84C' }}>{r.wines}병</span>
          </div>
          <div style={{ height: 4, background: '#1E0835', borderRadius: 2, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: visible ? `${r.bar}%` : '0%',
                background: hovered === i
                  ? 'linear-gradient(90deg, #C41E3A, #E8435A)'
                  : 'linear-gradient(90deg, #8B1A2A, #C41E3A)',
                borderRadius: 2,
                transition: `width 900ms cubic-bezier(0.4,0,0.2,1) ${i * 80}ms, background 200ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Panel 2: Label scan demo ───────────────────────────────────────────────
const WINE_TAGS = ['Château Margaux', '2019', 'Bordeaux AOC', 'Cabernet Sauvignon', '🇫🇷 France'];

function ScanPanel() {
  const [step, setStep] = useState(0);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const cycle = setInterval(() => {
      setScanning(true);
      setStep(0);
      let s = 0;
      const reveal = setInterval(() => {
        s += 1;
        setStep(s);
        if (s >= WINE_TAGS.length) {
          clearInterval(reveal);
          setTimeout(() => setScanning(false), 1200);
        }
      }, 350);
    }, 4500);
    // start immediately
    setScanning(true);
    let s = 0;
    const reveal = setInterval(() => {
      s += 1;
      setStep(s);
      if (s >= WINE_TAGS.length) clearInterval(reveal);
    }, 350);
    return () => clearInterval(cycle);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Wine label card */}
      <div style={{
        width: 160, height: 220,
        background: 'linear-gradient(160deg, #F5F0E8 0%, #E8DDD0 100%)',
        borderRadius: 8,
        padding: '12px 16px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        flexShrink: 0,
      }}>
        {/* Label content */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.15em', color: '#6B3040', fontWeight: 700, textTransform: 'uppercase' }}>
            Grand Cru Classé
          </div>
          <div style={{ fontSize: 15, fontFamily: 'Georgia, serif', color: '#1A0810', fontWeight: 700, marginTop: 6, lineHeight: 1.2 }}>
            Château<br />Margaux
          </div>
          <div style={{ width: 56, height: 1, background: '#8B1A2A', margin: '8px auto' }} />
          <div style={{ fontSize: 22, color: '#8B1A2A', fontFamily: 'Georgia, serif', fontWeight: 700 }}>
            2019
          </div>
          <div style={{ fontSize: 8, color: '#6B3040', marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Margaux · Bordeaux
          </div>
          <div style={{
            width: 48, height: 56, margin: '10px auto 0',
            background: 'linear-gradient(135deg, #8B1A2A 0%, #C41E3A 50%, #8B1A2A 100%)',
            borderRadius: '50% 50% 40% 40%',
            opacity: 0.13,
          }} />
        </div>

        {/* Scan line */}
        {scanning && (
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent 0%, #C9A84C 30%, #FFF 50%, #C9A84C 70%, transparent 100%)',
            animation: 'scanLine 1.8s ease-in-out',
            animationFillMode: 'forwards',
            boxShadow: '0 0 8px rgba(201,168,76,0.8)',
          }} />
        )}
      </div>

      {/* Revealed wine info tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', minHeight: 80 }}>
        {WINE_TAGS.slice(0, step).map((tag, i) => (
          <span
            key={tag}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              background: i === 0 ? 'rgba(196,30,58,0.2)' : i === 4 ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${i === 0 ? 'rgba(196,30,58,0.4)' : i === 4 ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: i === 0 ? '#E06070' : i === 4 ? '#C9A84C' : '#D4C5B0',
              fontSize: 12,
              fontWeight: 500,
              animation: 'fadeInTag 0.3s ease both',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Panel 3: Mini story preview — matches instagram-preview-section design ──
const MAP_DOT_INDICES = [2, 3, 8, 9, 12, 16, 20, 24, 27, 31, 33];
const MAP_DOT_OPACITIES: Record<number, number> = { 2: 0.95, 3: 0.85, 8: 0.75, 9: 0.65, 12: 0.80, 16: 0.60, 20: 0.55, 24: 0.70, 27: 0.50, 31: 0.65, 33: 0.45 };

function SharePanel({ onScrollToPreview }: { onScrollToPreview: () => void }) {
  const [animate, setAnimate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setAnimate(true); },
      { threshold: 0.3 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const s = 0.68;

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Phone frame */}
      <div style={{
        position: 'relative',
        width: 240 * s, height: 520 * s,
        background: '#0C0C0C',
        borderRadius: 40 * s,
        padding: 8 * s,
        boxShadow: `0 0 0 ${2 * s}px #2A2A2A, 0 0 0 ${3 * s}px #111, 0 20px 50px rgba(0,0,0,0.7), 0 0 40px rgba(196,30,58,0.06)`,
        flexShrink: 0,
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 12 * s, left: '50%',
          transform: 'translateX(-50%)',
          width: 80 * s, height: 22 * s,
          background: '#0C0C0C', borderRadius: 12 * s, zIndex: 10,
        }} />
        {/* Screen */}
        <div style={{ width: '100%', height: '100%', borderRadius: 32 * s, overflow: 'hidden' }}>
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(170deg, #060115 0%, #120828 40%, #060115 100%)',
            display: 'flex', flexDirection: 'column',
            padding: `${20 * s}px ${16 * s}px ${16 * s}px`,
            fontFamily: 'Inter, sans-serif',
          }}>
            {/* Story header */}
            <div style={{ marginBottom: 14 * s }}>
              <div style={{ height: 2, background: 'rgba(255,255,255,0.15)', borderRadius: 1, marginBottom: 10 * s }}>
                <div style={{ height: '100%', width: animate ? '65%' : '0%', background: '#F5F0E8', borderRadius: 1, transition: 'width 1.2s ease 0.4s' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 * s }}>
                <div style={{ width: 28 * s, height: 28 * s, borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A2A, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 * s, fontWeight: 700, color: '#F5F0E8', flexShrink: 0 }}>W</div>
                <span style={{ fontSize: 11 * s, fontWeight: 600, color: '#F5F0E8' }}>winemine</span>
                <span style={{ fontSize: 10 * s, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>지금</span>
              </div>
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: 16 * s }}>
              <div style={{ fontSize: 9 * s, letterSpacing: '0.25em', color: '#C9A84C', textTransform: 'uppercase' as const, marginBottom: 4 * s }}>My Wine Journey</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 22 * s, color: '#F5F0E8', lineHeight: 1.1 }}>2025<br />Recap</div>
              <div style={{ width: 30 * s, height: 1, background: '#C9A84C', margin: `${8 * s}px auto 0` }} />
            </div>

            {/* Map dot grid */}
            <div style={{ marginBottom: 14 * s, height: 90 * s, borderRadius: 8 * s, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.15)', background: '#080220', position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 2, padding: 4, height: '100%', alignContent: 'center' }}>
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} style={{ width: '100%', aspectRatio: '1', borderRadius: 1, background: MAP_DOT_INDICES.includes(i) ? `rgba(196,30,58,${MAP_DOT_OPACITIES[i] ?? 0.6})` : '#1C0840' }} />
                ))}
              </div>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 45%, rgba(6,1,21,0.7) 100%)' }} />
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-around', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 * s, padding: `${10 * s}px ${8 * s}px`, marginBottom: 14 * s }}>
              {[['82', '병'], ['15', '국가'], ['7', '개월']].map(([n, l]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20 * s, fontWeight: 700, color: '#F5F0E8', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 9 * s, color: '#9B8B7A', marginTop: 3 * s, letterSpacing: '0.05em' }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Country bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 * s, flex: 1 }}>
              {REGIONS.slice(0, 5).map((r, i) => (
                <div key={r.country} style={{ display: 'flex', alignItems: 'center', gap: 8 * s }}>
                  <span style={{ fontSize: 13 * s, flexShrink: 0 }}>{r.flag}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: animate ? `${r.bar}%` : '0%', background: 'linear-gradient(90deg, rgba(196,30,58,0.7), rgba(196,30,58,0.9))', borderRadius: 2, transition: `width 900ms cubic-bezier(0.4,0,0.2,1) ${300 + i * 80}ms` }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 10 * s, color: '#C9A84C', flexShrink: 0 }}>{r.wines}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 14 * s, paddingTop: 10 * s, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 * s }}>
              <div style={{ width: 16 * s, height: 16 * s, borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A2A, #C9A84C)' }} />
              <span style={{ fontFamily: 'Georgia, serif', fontSize: 11 * s, color: '#C9A84C', letterSpacing: '0.08em' }}>winemine</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onScrollToPreview}
        style={{ padding: '8px 20px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 20, color: '#C9A84C', fontSize: 12, cursor: 'pointer', transition: 'all 200ms ease', fontFamily: 'inherit' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,168,76,0.2)'; e.currentTarget.style.borderColor = '#C9A84C'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; }}
      >
        전체 미리보기 →
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
const PANELS = [
  {
    num: '01',
    title: '지도에 새긴다',
    sub: '마신 와인이 쌓일수록\n세계 지도가 물들어간다',
    content: 'region',
  },
  {
    num: '02',
    title: '찍으면 바로',
    sub: '라벨 하나로\n모든 정보가 채워진다',
    content: 'scan',
  },
  {
    num: '03',
    title: '나만의 지도',
    sub: '언제든, 한 번에\n손쉽게 공유해요',
    content: 'share',
  },
];

interface FeaturesSectionProps {
  onScrollToPreview?: () => void;
}

export default function FeaturesSection({ onScrollToPreview }: FeaturesSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activePanel, setActivePanel] = useState<number | null>(null);

  return (
    <section
      style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(196,30,58,0.08) 0%, transparent 58%), #05020A', padding: 'clamp(80px,10vw,120px) 24px', overflow: 'hidden' }}
    >
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(28px,4vw,40px)',
              fontWeight: 400,
              color: '#F5F0E8',
            }}
          >
            WineMine이 특별한 이유
          </h2>
          <div style={{ width: 60, height: 2, background: '#C9A84C', margin: '20px auto 0' }} />
        </motion.div>

        {/* 3 Panels */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 2,
          }}
        >
          {PANELS.map((panel, i) => (
            <motion.div
              key={panel.num}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              viewport={{ once: true }}
              onMouseEnter={() => setActivePanel(i)}
              onMouseLeave={() => setActivePanel(null)}
              style={{
                position: 'relative',
                background: activePanel === i ? 'rgba(196,30,58,0.04)' : 'rgba(255,255,255,0.015)',
                border: `1px solid ${activePanel === i ? 'rgba(196,30,58,0.2)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 16,
                padding: '40px 32px',
                transition: 'background 350ms ease, border-color 350ms ease',
                cursor: 'default',
                overflow: 'hidden',
              }}
            >
              {/* Decorative number */}
              <div
                style={{
                  position: 'absolute',
                  top: -10,
                  right: 24,
                  fontFamily: 'Georgia, serif',
                  fontSize: 96,
                  fontWeight: 400,
                  color: activePanel === i ? 'rgba(196,30,58,0.08)' : 'rgba(255,255,255,0.025)',
                  lineHeight: 1,
                  transition: 'color 350ms ease',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              >
                {panel.num}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: 22,
                  fontWeight: 400,
                  color: '#F5F0E8',
                  marginBottom: 10,
                  position: 'relative',
                }}
              >
                {panel.title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: '#9B8B7A',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                  marginBottom: 32,
                  position: 'relative',
                }}
              >
                {panel.sub}
              </p>

              {/* Interactive content */}
              <div style={{ position: 'relative' }}>
                {panel.content === 'region' && <RegionPanel />}
                {panel.content === 'scan' && <ScanPanel />}
                {panel.content === 'share' && (
                  <SharePanel onScrollToPreview={onScrollToPreview ?? (() => {})} />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
