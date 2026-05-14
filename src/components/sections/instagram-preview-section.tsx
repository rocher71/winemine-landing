'use client';

import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { useLocale } from '@/components/providers/locale-provider';
// ── Story card content ──────────────────────────────────────────────────────
const STORY_COUNTRIES: { name: string; wines: number; pct: number }[] = [
  { name: 'France',      wines: 28, pct: 92 },
  { name: 'Italy',       wines: 21, pct: 70 },
  { name: 'Chile',       wines: 18, pct: 58 },
  { name: 'New Zealand', wines: 14, pct: 44 },
  { name: 'Spain',       wines: 11, pct: 34 },
];

const COLOR_SPLIT = [
  { key: 'red',       pct: 76, color: 'var(--color-wine-red)' },
  { key: 'white',     pct: 14, color: '#E8D89A' },
  { key: 'sparkling', pct:  6, color: 'var(--color-gold)' },
  { key: 'rose',      pct:  4, color: '#D4756B' },
] as const;

// Wine regions for mini-map (same ISO numeric codes as world-map.tsx)
const MINI_WINE: Record<string, number> = {
  '250': 0.95, '380': 0.80, '724': 0.65, '840': 0.72,
  '276': 0.50, '032': 0.65, '152': 0.55, '620': 0.70,
  '040': 0.38, '554': 0.50, '036': 0.55, '710': 0.42,
};

// ── Tiny world map inside the story card ────────────────────────────────────
export function StoryWorldMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const apply = () => {
      ref.current?.querySelectorAll('svg').forEach(svg => {
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.display = 'block';
      });
    };
    apply();
    const obs = new MutationObserver(apply);
    if (ref.current) obs.observe(ref.current, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [mounted]);

  if (!mounted) {
    return <div style={{ width: '100%', height: '100%', background: '#0A0228' }} />;
  }

  return (
    <div ref={ref} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <ComposableMap
        projection="geoEquirectangular"
        projectionConfig={{ scale: 62, rotate: [-40, 0, 0] }}
        width={420}
        height={210}
        style={{ width: '100%', height: '100%', display: 'block', background: '#080220' }}
      >
        <Geographies geography="/world-110m.json">
          {({ geographies }) =>
            geographies.map((geo) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const id = String((geo as any).id).padStart(3, '0');
              const opacity = MINI_WINE[id];
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: opacity ? '#D42040' : 'var(--color-map-inactive)',
                      fillOpacity: opacity ?? 1,
                      stroke: 'var(--color-map-stroke)',
                      strokeWidth: 0.3,
                      outline: 'none',
                    },
                    hover:   { outline: 'none', fill: opacity ? '#D42040' : 'var(--color-map-inactive)', fillOpacity: opacity ?? 1, stroke: 'var(--color-map-stroke)', strokeWidth: 0.3 },
                    pressed: { outline: 'none', fill: opacity ? '#D42040' : 'var(--color-map-inactive)', fillOpacity: opacity ?? 1, stroke: 'var(--color-map-stroke)', strokeWidth: 0.3 },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}

// ── Story Card (9:16 ratio) ────────────────────────────────────────────────
export function StoryCard({ animate }: { animate: boolean }) {
  const { messages } = useLocale();
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(170deg, #0d0810 0%, #120828 40%, #0d0810 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px 16px',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background grain texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />

      {/* Top: logo + progress bar (Instagram-style) */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1, marginBottom: 10
        }}>
          <div style={{
            height: '100%', width: animate ? '65%' : '0%',
            background: '#F5F0E8', borderRadius: 1,
            transition: 'width 1.2s ease 0.4s',
          }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: '#1A0A1E',
            border: '1px solid rgba(201,168,76,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            <Image
              src="/winemine-glass-mark.png"
              alt="winemine"
              width={20}
              height={20}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#F5F0E8' }}>winemine</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.16)', marginLeft: 'auto' }}>{messages.instagramPreview.timestamp}</span>
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{
          fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400,
          color: '#F5F0E8', lineHeight: 1.1, letterSpacing: '-0.01em',
        }}>
          My Wine Journey
        </div>
        <div style={{ width: 30, height: 1, background: 'var(--color-gold)', margin: '8px auto 0' }} />
      </div>

      {/* Real mini world map — full screen-width bleed, fits entire map */}
      <div style={{
        marginLeft: -16,
        marginRight: -16,
        marginBottom: 14,
        height: 130,
        overflow: 'hidden',
        borderTop: '1px solid rgba(201,168,76,0.22)',
        borderBottom: '1px solid rgba(201,168,76,0.22)',
        position: 'relative',
      }}>
        <StoryWorldMap />
        {/* Map pin badge */}
        <div style={{
          position: 'absolute', top: 8, right: 10,
          fontSize: 9, color: 'var(--color-gold)',
          background: 'rgba(6,1,21,0.75)',
          border: '1px solid rgba(201,168,76,0.35)',
          padding: '3px 8px', borderRadius: 10,
          letterSpacing: '0.05em',
          fontWeight: 600,
        }}>
          {messages.instagramPreview.mapBadge}
        </div>
      </div>

      {/* Color split bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{
          display: 'flex', gap: 1, height: 6,
          borderRadius: 3, overflow: 'hidden',
          marginBottom: 6,
          background: 'rgba(255,255,255,0.04)',
        }}>
          {COLOR_SPLIT.map((c, i) => (
            <div
              key={c.key}
              style={{
                background: c.color,
                width: animate ? `${c.pct}%` : '0%',
                transition: `width 800ms cubic-bezier(0.4,0,0.2,1) ${500 + i * 80}ms`,
              }}
            />
          ))}
        </div>
        <div style={{
          display: 'flex', gap: 10, flexWrap: 'wrap',
          justifyContent: 'space-between',
          fontSize: 8.5,
        }}>
          {COLOR_SPLIT.map((c) => (
            <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: c.color, flexShrink: 0,
              }} />
              <span style={{ color: '#D4C5B0' }}>
                {messages.instagramPreview.colorLabels[c.key]}
              </span>
              <span style={{ color: '#9B8B7A' }}>{c.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Avg rating / vintage range / top grape — inline mini row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 10px', marginBottom: 10,
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.18)',
        borderRadius: 8,
        fontSize: 9.5,
        color: '#D4C5B0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: 'var(--color-gold)', fontSize: 11 }}>★</span>
          <span style={{ fontWeight: 600, color: '#F5F0E8' }}>4.6</span>
          <span style={{ color: '#9B8B7A', fontSize: 8.5 }}>{messages.instagramPreview.ratingLabel}</span>
        </div>
        <div style={{ width: 1, height: 10, background: 'rgba(201,168,76,0.2)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: 'var(--color-gold)', fontSize: 10 }}>◈</span>
          <span style={{ fontWeight: 600, color: '#F5F0E8' }}>2007–2024</span>
        </div>
        <div style={{ width: 1, height: 10, background: 'rgba(201,168,76,0.2)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: 'var(--color-gold)', fontSize: 10 }}>✦</span>
          <span style={{ fontWeight: 600, color: '#F5F0E8' }}>12</span>
          <span style={{ color: '#9B8B7A', fontSize: 8.5 }}>{messages.instagramPreview.grapesLabel}</span>
        </div>
      </div>

      {/* Country breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
        {STORY_COUNTRIES.map((c, i) => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              flexShrink: 0,
              minWidth: 70,
              fontSize: 9.5,
              fontWeight: 600,
              color: '#D4C5B0',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}>
              {c.name}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: animate ? `${c.pct}%` : '0%',
                  background: `linear-gradient(90deg, rgba(196,30,58,0.7), rgba(196,30,58,0.9))`,
                  borderRadius: 2,
                  transition: `width 900ms cubic-bezier(0.4,0,0.2,1) ${300 + i * 80}ms`,
                }} />
              </div>
            </div>
            <span style={{ fontSize: 9.5, color: 'var(--color-gold)', flexShrink: 0, minWidth: 18, textAlign: 'right' }}>
              {c.wines}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 10, paddingTop: 8,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <Image
          src="/winemine-glass-mark.png"
          alt=""
          width={16}
          height={16}
          style={{ objectFit: 'contain' }}
        />
        <span style={{
          fontFamily: 'Georgia, serif', fontSize: 11,
          color: 'var(--color-gold)', letterSpacing: '0.08em',
        }}>winemine</span>
        <span style={{ fontSize: 9, color: '#4A3D56', marginLeft: 4 }}>winemine.app</span>
      </div>
    </div>
  );
}

// ── Phone frame wrapper ────────────────────────────────────────────────────
export function PhoneMockup({ children, scale = 1 }: { children: React.ReactNode; scale?: number }) {
  return (
    <div style={{
      width: 250 * scale,
      height: 520 * scale,
      background: '#0d0810',
      borderRadius: 40 * scale,
      padding: 8 * scale,
      boxShadow: `0 0 0 ${2 * scale}px #2A2A2A, 0 0 0 ${3 * scale}px #111, 0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(196,30,58,0.06)`,
      position: 'relative',
      flexShrink: 0,
    }}>
      {/* Notch */}
      <div style={{
        position: 'absolute',
        top: 12 * scale, left: '50%',
        transform: 'translateX(-50%)',
        width: 80 * scale, height: 22 * scale,
        background: '#0d0810',
        borderRadius: 12 * scale,
        zIndex: 10,
      }} />
      {/* Screen */}
      <div style={{
        width: '100%', height: '100%',
        borderRadius: 32 * scale,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {children}
      </div>
    </div>
  );
}

// ── Main section ───────────────────────────────────────────────────────────
export default function InstagramPreviewSection({ id }: { id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { messages } = useLocale();

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.25 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(196,30,58,0.08) 0%, transparent 58%), var(--color-bg-deep)', padding: 'clamp(80px,10vw,120px) 24px', overflow: 'hidden' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <div style={{ fontSize: 11, letterSpacing: '0.25em', color: 'var(--color-gold)', textTransform: 'uppercase', marginBottom: 16 }}>
            {messages.instagramPreview.sectionLabel}
          </div>
          <h2 style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, color: 'var(--color-text-primary)', lineHeight: 1.2,
          }}>
            {messages.instagramPreview.heading.split('\n')[0]}<br />{messages.instagramPreview.heading.split('\n')[1]}
          </h2>
          <div style={{ width: 60, height: 2, background: 'var(--color-gold)', margin: '20px auto 16px' }} />
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            {messages.instagramPreview.body.split('\n')[0]}<br />
            {messages.instagramPreview.body.split('\n')[1]}
          </p>
        </motion.div>

        {/* Content: phone mockup + feature list */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(32px, 6vw, 80px)',
          flexWrap: 'wrap',
        }}>
          {/* Phone */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: -40, rotate: -3 }}
            whileInView={{ opacity: 1, x: 0, rotate: -3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            viewport={{ once: true }}
            style={{ transform: 'rotate(-3deg)' }}
          >
            <PhoneMockup>
              <StoryCard animate={inView} />
            </PhoneMockup>
          </motion.div>

          {/* Feature list */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            viewport={{ once: true }}
            style={{ maxWidth: 380 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {[
                { num: '1' },
                { num: '2' },
                { num: '3' },
              ].map((item, idx) => (
                <div key={item.num} style={{ display: 'flex', gap: 20 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(196,30,58,0.15)',
                    border: '1px solid rgba(196,30,58,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#E06070',
                    flexShrink: 0, marginTop: 2,
                  }}>
                    {item.num}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6,
                    }}>
                      {messages.instagramPreview.features[idx].title}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                      {messages.instagramPreview.features[idx].desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
