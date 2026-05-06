'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// ── Panel 1: Wine region data ──────────────────────────────────────────────
const REGIONS = [
  { flag: '🇫🇷', country: '프랑스', wines: 28, bar: 95 },
  { flag: '🇮🇹', country: '이탈리아', wines: 21, bar: 74 },
  { flag: '🇨🇱', country: '칠레', wines: 18, bar: 62 },
  { flag: '🇳🇿', country: '뉴질랜드', wines: 14, bar: 48 },
  { flag: '🇪🇸', country: '스페인', wines: 11, bar: 38 },
  { flag: '🇦🇷', country: '아르헨티나', wines: 9, bar: 30 },
];

function RegionPanel({ isDark }: { isDark?: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const textMuted = isDark ? 'rgba(245,240,232,0.5)' : '#6e6e73';
  const textHover = isDark ? '#f5f0e8' : '#1d1d1f';
  const trackBg   = isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
  const barBg     = isDark ? '#C4394A' : '#8B1A2A';

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {REGIONS.map((r, i) => (
        <div
          key={r.country}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{
            cursor: 'default',
            transition: 'transform 200ms ease',
            transform: hovered === i ? 'translateX(4px)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
            <span style={{
              fontSize: 14,
              letterSpacing: '-0.224px',
              color: hovered === i ? textHover : textMuted,
              transition: 'color 200ms',
            }}>
              {r.flag} {r.country}
            </span>
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              color: isDark ? 'var(--color-gold)' : 'var(--color-action)',
              letterSpacing: '-0.224px',
            }}>
              {r.wines}병
            </span>
          </div>
          <div style={{ height: 3, background: trackBg, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: visible ? `${r.bar}%` : '0%',
              background: barBg,
              borderRadius: 2,
              transition: `width 900ms cubic-bezier(0.4,0,0.2,1) ${i * 80}ms`,
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Panel 2: Label scan demo ───────────────────────────────────────────────
const WINE_TAGS = ['Château Margaux', '2019', 'Bordeaux AOC', 'Cabernet Sauvignon', '🇫🇷 France'];

function ScanPanel({ isDark }: { isDark?: boolean }) {
  const [step, setStep] = useState(0);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    setScanning(true);
    let s = 0;
    const reveal = setInterval(() => {
      s += 1;
      setStep(s);
      if (s >= WINE_TAGS.length) clearInterval(reveal);
    }, 350);

    const cycle = setInterval(() => {
      setScanning(true);
      setStep(0);
      let cs = 0;
      const cr = setInterval(() => {
        cs += 1;
        setStep(cs);
        if (cs >= WINE_TAGS.length) {
          clearInterval(cr);
          setTimeout(() => setScanning(false), 1200);
        }
      }, 350);
    }, 4500);

    return () => clearInterval(cycle);
  }, []);

  const tagBg      = isDark ? 'rgba(255,255,255,0.06)' : '#f5f5f7';
  const tagBorder  = isDark ? 'rgba(255,255,255,0.1)'  : '#e0e0e0';
  const tagColor   = isDark ? '#d4c5b0'                : '#1d1d1f';
  const tagAccBg   = isDark ? 'rgba(196,57,74,0.2)'    : 'rgba(139,26,42,0.08)';
  const tagAccBd   = isDark ? 'rgba(196,57,74,0.4)'    : 'rgba(139,26,42,0.2)';
  const tagAccClr  = isDark ? '#E06070'                : '#8B1A2A';

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
        boxShadow: 'rgba(0,0,0,0.22) 3px 5px 30px 0',
        flexShrink: 0,
      }}>
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.15em', color: '#6B3040', fontWeight: 700, textTransform: 'uppercase' }}>
            Grand Cru Classé
          </div>
          <div style={{ fontSize: 15, fontFamily: 'Georgia, serif', color: '#1A0810', fontWeight: 700, marginTop: 6, lineHeight: 1.2 }}>
            Château<br />Margaux
          </div>
          <div style={{ width: 56, height: 1, background: '#8B1A2A', margin: '8px auto' }} />
          <div style={{ fontSize: 22, color: '#8B1A2A', fontFamily: 'Georgia, serif', fontWeight: 700 }}>2019</div>
          <div style={{ fontSize: 8, color: '#6B3040', marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Margaux · Bordeaux
          </div>
        </div>
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

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', minHeight: 80 }}>
        {WINE_TAGS.slice(0, step).map((tag, i) => (
          <span key={tag} style={{
            padding: '5px 14px',
            borderRadius: 9999,
            background: i === 0 ? tagAccBg : tagBg,
            border: `1px solid ${i === 0 ? tagAccBd : tagBorder}`,
            color: i === 0 ? tagAccClr : tagColor,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '-0.12px',
            animation: 'fadeInTag 0.3s ease both',
          }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Panel 3: Mini story preview ────────────────────────────────────────────
const MAP_DOT_INDICES = [2, 3, 8, 9, 12, 16, 20, 24, 27, 31, 33];
const MAP_DOT_OPACITIES: Record<number, number> = {
  2: 0.95, 3: 0.85, 8: 0.75, 9: 0.65, 12: 0.80,
  16: 0.60, 20: 0.55, 24: 0.70, 27: 0.50, 31: 0.65, 33: 0.45
};

function SharePanel({ onScrollToPreview, isDark }: { onScrollToPreview: () => void; isDark?: boolean }) {
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
      <div style={{
        position: 'relative',
        width: 240 * s, height: 520 * s,
        background: '#0C0C0C',
        borderRadius: 40 * s,
        padding: 8 * s,
        boxShadow: `rgba(0,0,0,0.22) 3px 5px 30px 0, 0 0 0 ${2 * s}px #2A2A2A`,
        flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', top: 12 * s, left: '50%', transform: 'translateX(-50%)', width: 80 * s, height: 22 * s, background: '#0C0C0C', borderRadius: 12 * s, zIndex: 10 }} />
        <div style={{ width: '100%', height: '100%', borderRadius: 32 * s, overflow: 'hidden' }}>
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(170deg, #060115 0%, #120828 40%, #060115 100%)',
            display: 'flex', flexDirection: 'column',
            padding: `${20 * s}px ${16 * s}px ${16 * s}px`,
          }}>
            <div style={{ marginBottom: 14 * s }}>
              <div style={{ height: 2, background: 'rgba(255,255,255,0.15)', borderRadius: 1, marginBottom: 10 * s }}>
                <div style={{ height: '100%', width: animate ? '65%' : '0%', background: '#f5f0e8', borderRadius: 1, transition: 'width 1.2s ease 0.4s' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 * s }}>
                <div style={{ width: 28 * s, height: 28 * s, borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A2A, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 * s, fontWeight: 700, color: '#f5f0e8', flexShrink: 0 }}>W</div>
                <span style={{ fontSize: 11 * s, fontWeight: 600, color: '#f5f0e8' }}>winemine</span>
                <span style={{ fontSize: 10 * s, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>지금</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 16 * s }}>
              <div style={{ fontSize: 9 * s, letterSpacing: '0.25em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 4 * s }}>My Wine Journey</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 22 * s, color: '#f5f0e8', lineHeight: 1.1 }}>2025<br />Recap</div>
              <div style={{ width: 30 * s, height: 1, background: '#C9A84C', margin: `${8 * s}px auto 0` }} />
            </div>
            <div style={{ marginBottom: 14 * s, height: 90 * s, borderRadius: 8 * s, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.15)', background: '#080220', position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 2, padding: 4, height: '100%', alignContent: 'center' }}>
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} style={{ width: '100%', aspectRatio: '1', borderRadius: 1, background: MAP_DOT_INDICES.includes(i) ? `rgba(196,30,58,${MAP_DOT_OPACITIES[i] ?? 0.6})` : '#1C0840' }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', background: 'rgba(255,255,255,0.03)', borderRadius: 8 * s, padding: `${10 * s}px ${8 * s}px`, marginBottom: 14 * s }}>
              {[['82', '병'], ['15', '국가'], ['7', '개월']].map(([n, l]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20 * s, fontWeight: 700, color: '#f5f0e8', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 9 * s, color: '#9B8B7A', marginTop: 3 * s }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 * s, flex: 1 }}>
              {REGIONS.slice(0, 5).map((r, i) => (
                <div key={r.country} style={{ display: 'flex', alignItems: 'center', gap: 8 * s }}>
                  <span style={{ fontSize: 13 * s, flexShrink: 0 }}>{r.flag}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: animate ? `${r.bar}%` : '0%', background: 'rgba(196,30,58,0.8)', borderRadius: 2, transition: `width 900ms cubic-bezier(0.4,0,0.2,1) ${300 + i * 80}ms` }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 10 * s, color: '#C9A84C', flexShrink: 0 }}>{r.wines}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14 * s, paddingTop: 10 * s, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 * s }}>
              <div style={{ width: 16 * s, height: 16 * s, borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A2A, #C9A84C)' }} />
              <span style={{ fontFamily: 'Georgia, serif', fontSize: 11 * s, color: '#C9A84C', letterSpacing: '0.08em' }}>winemine</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onScrollToPreview}
        className="btn-pill"
        style={{
          height: 36,
          padding: '0 18px',
          fontSize: 14,
          letterSpacing: '-0.224px',
          background: isDark ? 'rgba(255,255,255,0.07)' : '#f5f5f7',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e0e0e0'}`,
          color: isDark ? 'rgba(245,240,232,0.7)' : '#6e6e73',
        }}
      >
        전체 미리보기 →
      </button>
    </div>
  );
}

// ── Tile layout ────────────────────────────────────────────────────────────
const TILES = [
  {
    num: '01',
    title: '지도에 새긴다',
    sub: '마신 와인이 쌓일수록 세계 지도가 물들어간다.',
    content: 'region' as const,
    dark: false,
  },
  {
    num: '02',
    title: '찍으면 바로',
    sub: '라벨 하나로 품종, 빈티지, 원산지까지 모든 정보가 채워진다.',
    content: 'scan' as const,
    dark: true,
  },
  {
    num: '03',
    title: '나만의 지도',
    sub: '언제든, 한 번에 — 내 와인 여정을 손쉽게 공유해요.',
    content: 'share' as const,
    dark: false,
  },
];

interface FeaturesSectionProps {
  onScrollToPreview?: () => void;
}

export default function FeaturesSection({ onScrollToPreview }: FeaturesSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {TILES.map((tile, i) => {
        const bg     = tile.dark ? 'var(--bg-tile-dark-glow)' : (i % 2 === 0 ? 'var(--color-canvas)' : 'var(--color-parchment)');
        const titleC = tile.dark ? 'var(--color-on-dark)'     : 'var(--color-ink)';
        const subC   = tile.dark ? 'var(--color-on-dark-muted)' : 'var(--color-ink-muted)';
        const numC   = tile.dark ? 'rgba(255,255,255,0.04)'   : 'rgba(0,0,0,0.04)';

        return (
          <section key={tile.num} style={{ background: bg, padding: 'clamp(48px,8vw,80px) 24px' }}>
            <div style={{ maxWidth: 980, margin: '0 auto' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'clamp(40px,6vw,80px)',
                alignItems: 'center',
              }}>
                {/* Text side */}
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
                  viewport={{ once: true }}
                  style={{ position: 'relative' }}
                >
                  {/* Decorative number */}
                  <div style={{
                    position: 'absolute',
                    top: -16,
                    left: -8,
                    fontSize: 120,
                    fontWeight: 600,
                    color: numC,
                    lineHeight: 1,
                    userSelect: 'none',
                    pointerEvents: 'none',
                    letterSpacing: '-0.28px',
                  }}>
                    {tile.num}
                  </div>

                  <p style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: tile.dark ? 'var(--color-gold)' : 'var(--color-action)',
                    marginBottom: 12,
                    position: 'relative',
                  }}>
                    {tile.num}
                  </p>

                  <h2 style={{
                    fontSize: 'clamp(28px, 4vw, 40px)',
                    fontWeight: 600,
                    color: titleC,
                    letterSpacing: '-0.374px',
                    lineHeight: 1.1,
                    marginBottom: 16,
                    position: 'relative',
                  }}>
                    {tile.title}
                  </h2>

                  <p style={{
                    fontSize: 17,
                    color: subC,
                    lineHeight: 1.6,
                    letterSpacing: '-0.374px',
                    maxWidth: 400,
                  }}>
                    {tile.sub}
                  </p>
                </motion.div>

                {/* Demo side */}
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  viewport={{ once: true }}
                  style={{ display: 'flex', justifyContent: 'center' }}
                >
                  {tile.content === 'region' && <RegionPanel isDark={tile.dark} />}
                  {tile.content === 'scan'   && <ScanPanel isDark={tile.dark} />}
                  {tile.content === 'share'  && (
                    <SharePanel
                      isDark={tile.dark}
                      onScrollToPreview={onScrollToPreview ?? (() => {})}
                    />
                  )}
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
