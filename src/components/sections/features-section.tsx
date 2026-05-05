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
      {/* Real wine bottle photo + scan overlay */}
      <div
        style={{
          width: 160,
          height: 220,
          borderRadius: 10,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          flexShrink: 0,
        }}
      >
        {/* Wine bottle photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.pexels.com/photos/3407777/pexels-photo-3407777.jpeg?auto=compress&cs=tinysrgb&w=400"
          alt="와인 라벨 클로즈업"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Dark overlay for readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,1,10,0.35)' }} />

        {/* Camera frame corners */}
        {['top-left','top-right','bottom-left','bottom-right'].map(pos => {
          const isTop = pos.includes('top'), isLeft = pos.includes('left');
          return (
            <div key={pos} style={{
              position: 'absolute',
              [isTop ? 'top' : 'bottom']: 10,
              [isLeft ? 'left' : 'right']: 10,
              width: 20, height: 20,
              borderTop: isTop ? '2px solid #C9A84C' : 'none',
              borderBottom: !isTop ? '2px solid #C9A84C' : 'none',
              borderLeft: isLeft ? '2px solid #C9A84C' : 'none',
              borderRight: !isLeft ? '2px solid #C9A84C' : 'none',
            }} />
          );
        })}

        {/* Scan line */}
        {scanning && (
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, #C9A84C 25%, #FFF 50%, #C9A84C 75%, transparent)',
            animation: 'scanLine 1.8s ease-in-out',
            animationFillMode: 'forwards',
            boxShadow: '0 0 10px rgba(201,168,76,0.9)',
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

// ── Panel 3: Mini story preview ────────────────────────────────────────────
function SharePanel({ onScrollToPreview }: { onScrollToPreview: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Tiny phone + story */}
      <div
        style={{
          width: 110,
          height: 196,
          background: '#111',
          borderRadius: 18,
          padding: 4,
          boxShadow: '0 0 0 1.5px #333, 0 20px 50px rgba(0,0,0,0.6)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 14,
            overflow: 'hidden',
            background: 'linear-gradient(170deg, #080218 0%, #150828 50%, #080218 100%)',
            display: 'flex',
            flexDirection: 'column',
            padding: '8px 6px',
          }}
        >
          {/* Top */}
          <div style={{ fontSize: 7, fontFamily: 'Georgia, serif', color: '#C9A84C', letterSpacing: '0.1em', textAlign: 'center' }}>
            WineMine
          </div>
          <div style={{ fontSize: 5, color: '#4A3D56', textAlign: 'center', marginBottom: 6 }}>2025 RECAP</div>

          {/* Mini map dots */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 8 }}>
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 1,
                  background: [2,3,8,9,14,18,20,22,25].includes(i) ? `rgba(196,30,58,${0.4 + Math.random() * 0.5})` : '#1E0830',
                }}
              />
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 8 }}>
            {[['82', '병'], ['15', '국가']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#F5F0E8' }}>{n}</div>
                <div style={{ fontSize: 5, color: '#9B8B7A' }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Mini bars */}
          {[['🇫🇷', 28, 90], ['🇮🇹', 21, 68], ['🇨🇱', 18, 56]].map(([flag, n, w]) => (
            <div key={String(flag)} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                <span style={{ fontSize: 5, color: '#9B8B7A' }}>{flag}</span>
                <span style={{ fontSize: 5, color: '#C9A84C' }}>{n}</span>
              </div>
              <div style={{ height: 2, background: '#1E0830', borderRadius: 1 }}>
                <div style={{ height: '100%', width: `${w}%`, background: '#C41E3A', borderRadius: 1 }} />
              </div>
            </div>
          ))}

          {/* Footer */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid #1E0830', paddingTop: 4, textAlign: 'center' }}>
            <div style={{ fontSize: 5, color: '#4A3D56', letterSpacing: '0.05em' }}>winemine.com</div>
          </div>
        </div>
      </div>

      <button
        onClick={onScrollToPreview}
        style={{
          padding: '8px 20px',
          background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: 20,
          color: '#C9A84C',
          fontSize: 12,
          cursor: 'pointer',
          transition: 'all 200ms ease',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(201,168,76,0.2)';
          e.currentTarget.style.borderColor = '#C9A84C';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(201,168,76,0.1)';
          e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)';
        }}
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
    sub: '언제든, 한 번에\n인스타 스토리로',
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
      style={{ background: '#05020A', padding: 'clamp(80px,10vw,120px) 24px', overflow: 'hidden' }}
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
