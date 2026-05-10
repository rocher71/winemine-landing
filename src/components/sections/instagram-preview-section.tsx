'use client';

import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { useLocale } from '@/components/providers/locale-provider';
import { CountryFlag, type CountryFlagProps } from '@/components/icons/wine-icons';

// ── Story card content ──────────────────────────────────────────────────────
const STORY_COUNTRIES: { code: CountryFlagProps['code']; name: string; wines: number; pct: number }[] = [
  { code: 'FR', name: 'France',      wines: 28, pct: 92 },
  { code: 'IT', name: 'Italy',       wines: 21, pct: 70 },
  { code: 'CL', name: 'Chile',       wines: 18, pct: 58 },
  { code: 'NZ', name: 'New Zealand', wines: 14, pct: 44 },
  { code: 'ES', name: 'Spain',       wines: 11, pct: 34 },
];

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
        svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
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
                      fill: opacity ? '#D42040' : '#1C0840',
                      fillOpacity: opacity ?? 1,
                      stroke: '#2A0C58',
                      strokeWidth: 0.3,
                      outline: 'none',
                    },
                    hover:   { outline: 'none', fill: opacity ? '#D42040' : '#1C0840', fillOpacity: opacity ?? 1, stroke: '#2A0C58', strokeWidth: 0.3 },
                    pressed: { outline: 'none', fill: opacity ? '#D42040' : '#1C0840', fillOpacity: opacity ?? 1, stroke: '#2A0C58', strokeWidth: 0.3 },
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
        background: 'linear-gradient(170deg, #060115 0%, #120828 40%, #060115 100%)',
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
          height: 2, background: 'rgba(255,255,255,0.15)', borderRadius: 1, marginBottom: 10
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
            background: 'linear-gradient(135deg, #8B1A2A, #C9A84C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#F5F0E8',
            flexShrink: 0,
          }}>W</div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#F5F0E8' }}>winemine</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>{messages.instagramPreview.timestamp}</span>
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{
          fontSize: 9, letterSpacing: '0.25em', color: '#C9A84C',
          textTransform: 'uppercase', marginBottom: 4,
        }}>
          My Wine Journey
        </div>
        <div style={{
          fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400,
          color: '#F5F0E8', lineHeight: 1.1, letterSpacing: '-0.01em',
        }}>
          2026<br />Recap
        </div>
        <div style={{ width: 30, height: 1, background: '#C9A84C', margin: '8px auto 0' }} />
      </div>

      {/* Real mini world map */}
      <div style={{
        marginBottom: 14,
        height: 90,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid rgba(201,168,76,0.15)',
        position: 'relative',
      }}>
        <StoryWorldMap />
        {/* Vignette overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 45%, rgba(6,1,21,0.7) 100%)',
        }} />
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 8, padding: '10px 8px', marginBottom: 14,
      }}>
        {[['82', messages.instagramPreview.statsLabels.bottles], ['15', messages.instagramPreview.statsLabels.countries], ['7', messages.instagramPreview.statsLabels.months]].map(([n, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#F5F0E8', lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 9, color: '#9B8B7A', marginTop: 3, letterSpacing: '0.05em' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Country breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {STORY_COUNTRIES.map((c, i) => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ flexShrink: 0, display: 'inline-flex' }}>
              <CountryFlag code={c.code} size={13} />
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
            <span style={{ fontSize: 10, color: '#C9A84C', flexShrink: 0, minWidth: 20, textAlign: 'right' }}>
              {c.wines}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 14, paddingTop: 10,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: 'linear-gradient(135deg, #8B1A2A, #C9A84C)',
        }} />
        <span style={{
          fontFamily: 'Georgia, serif', fontSize: 11,
          color: '#C9A84C', letterSpacing: '0.08em',
        }}>winemine</span>
        <span style={{ fontSize: 9, color: '#4A3D56', marginLeft: 4 }}>winemine</span>
      </div>
    </div>
  );
}

// ── Phone frame wrapper ────────────────────────────────────────────────────
export function PhoneMockup({ children, scale = 1 }: { children: React.ReactNode; scale?: number }) {
  return (
    <div style={{
      width: 240 * scale,
      height: 520 * scale,
      background: '#0C0C0C',
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
        background: '#0C0C0C',
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
      style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(196,30,58,0.08) 0%, transparent 58%), #0A050F', padding: 'clamp(80px,10vw,120px) 24px', overflow: 'hidden' }}
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
          <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 16 }}>
            {messages.instagramPreview.sectionLabel}
          </div>
          <h2 style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, color: '#F5F0E8', lineHeight: 1.2,
          }}>
            {messages.instagramPreview.heading.split('\n')[0]}<br />{messages.instagramPreview.heading.split('\n')[1]}
          </h2>
          <div style={{ width: 60, height: 2, background: '#C9A84C', margin: '20px auto 16px' }} />
          <p style={{ fontSize: 15, color: '#9B8B7A', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
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
                      fontSize: 16, fontWeight: 600, color: '#F5F0E8', marginBottom: 6,
                    }}>
                      {messages.instagramPreview.features[idx].title}
                    </div>
                    <div style={{ fontSize: 14, color: '#9B8B7A', lineHeight: 1.7 }}>
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
