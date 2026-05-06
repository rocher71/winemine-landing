'use client';

import { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { useLocale } from '@/components/providers/locale-provider';

const DEPT_URL = '/france-departments.json';

// ── Design tokens ──────────────────────────────────────────────────────────
const GOLD = '#f0c876';

// ── Map region config ──────────────────────────────────────────────────────
type RegionData = {
  korName: string; count: number; opacity: number;
  labelCoords: [number, number]; showLabel: boolean;
  featured?: boolean; revealOrder: number;
};

const WINE_DEPTS: Record<string, RegionData> = {
  '21': { korName: '부르고뉴',  count: 28, opacity: 0.95, labelCoords: [4.88,  47.20], showLabel: true,  featured: true, revealOrder: 1  },
  '33': { korName: '보르도',    count: 13, opacity: 0.68, labelCoords: [-0.62, 44.82], showLabel: true,                  revealOrder: 2  },
  '51': { korName: '샹파뉴',    count: 12, opacity: 0.50, labelCoords: [4.12,  49.00], showLabel: true,                  revealOrder: 3  },
  '67': { korName: '알자스',    count: 7,  opacity: 0.36, labelCoords: [7.52,  48.58], showLabel: true,                  revealOrder: 4  },
  '68': { korName: '',          count: 7,  opacity: 0.36, labelCoords: [7.52,  48.58], showLabel: false,                 revealOrder: 4  },
  '69': { korName: '론 밸리',   count: 5,  opacity: 0.20, labelCoords: [4.68,  45.80], showLabel: true,                  revealOrder: 5  },
  '34': { korName: '랑그독',    count: 0,  opacity: 0.45, labelCoords: [3.5,   43.6 ], showLabel: false,                 revealOrder: 6  },
  '84': { korName: '론 밸리',   count: 0,  opacity: 0.58, labelCoords: [5.1,   44.0 ], showLabel: false,                 revealOrder: 7  },
  '83': { korName: '프로방스',  count: 0,  opacity: 0.42, labelCoords: [6.2,   43.4 ], showLabel: false,                 revealOrder: 8  },
  '13': { korName: '프로방스',  count: 0,  opacity: 0.35, labelCoords: [5.4,   43.3 ], showLabel: false,                 revealOrder: 9  },
  '49': { korName: '루아르',    count: 0,  opacity: 0.40, labelCoords: [-0.7,  47.5 ], showLabel: false,                 revealOrder: 10 },
  '37': { korName: '루아르',    count: 0,  opacity: 0.35, labelCoords: [0.5,   47.2 ], showLabel: false,                 revealOrder: 11 },
  '71': { korName: '부르고뉴',  count: 0,  opacity: 0.48, labelCoords: [4.6,   46.5 ], showLabel: false,                 revealOrder: 12 },
  '11': { korName: '랑그독',    count: 0,  opacity: 0.32, labelCoords: [2.4,   43.1 ], showLabel: false,                 revealOrder: 13 },
  '18': { korName: '루아르',    count: 0,  opacity: 0.45, labelCoords: [2.8,   47.3 ], showLabel: false,                 revealOrder: 14 },
  '44': { korName: '루아르',    count: 0,  opacity: 0.30, labelCoords: [-1.6,  47.2 ], showLabel: false,                 revealOrder: 15 },
};

// ── RegionLabel (SVG) — no click, no hit area ─────────────────────────────
function RegionLabel({ korName, count, featured, visible, bottleUnit }: {
  korName: string; count: number; featured?: boolean; visible: boolean; bottleUnit: string;
}) {
  const border = featured ? 'rgba(255,208,96,0.55)' : 'rgba(255,255,255,0.12)';
  const sw = featured ? 1.2 : 0.6;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.6 }}
      animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ pointerEvents: 'none' }}
      whileHover={visible ? { scale: 1.08 } : undefined}
    >
      <rect
        x={featured ? -44 : -36} y={featured ? -24 : -20}
        width={featured ? 88 : 72} height={featured ? 38 : 32}
        rx={6}
        fill="rgba(4,1,10,0.82)" stroke={border} strokeWidth={sw}
      />
      <text textAnchor="middle" y={featured ? -8 : -6}
        style={{ fill: featured ? GOLD : '#F5F0E8', fontSize: featured ? 11 : 9, fontFamily: 'Inter,sans-serif', fontWeight: featured ? 700 : 600 } as React.CSSProperties}>
        {featured ? `✦ ${korName}` : korName}
      </text>
      <text textAnchor="middle" y={featured ? 8 : 7}
        style={{ fill: '#C9A84C', fontSize: featured ? 13 : 11, fontFamily: 'Inter,sans-serif', fontWeight: 700 } as React.CSSProperties}>
        {count}{bottleUnit}
      </text>
    </motion.g>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function FranceWineSection() {
  const { messages } = useLocale();
  const outerRef = useRef<HTMLDivElement>(null);
  const mapRef   = useRef<HTMLDivElement>(null);

  const [mapVisible,    setMapVisible]    = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);

  useLayoutEffect(() => {
    const apply = () => mapRef.current?.querySelectorAll('svg').forEach(s => {
      s.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      s.style.display = 'block';
    });
    apply();
    const obs = new MutationObserver(apply);
    if (mapRef.current) obs.observe(mapRef.current, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: outerRef, offset: ['start start', 'end start'] });
  useMotionValueEvent(scrollYProgress, 'change', v => {
    setMapVisible(v > 0.06);
    const count =
      v < 0.08 ? 0
      : v < 0.14 ? 1 : v < 0.20 ? 2 : v < 0.26 ? 3
      : v < 0.32 ? 4 : v < 0.37 ? 5 : v < 0.42 ? 6
      : v < 0.47 ? 7 : v < 0.51 ? 8 : v < 0.55 ? 9
      : v < 0.58 ? 10 : v < 0.61 ? 11 : v < 0.64 ? 12
      : v < 0.67 ? 13 : v < 0.70 ? 14 : 15;
    setRevealedCount(count);
  });

  const isDeptVisible = (order: number) => revealedCount >= order;

  const visibleLabels = Object.entries(WINE_DEPTS).filter(([, d]) => d.showLabel && d.korName);

  return (
    <div ref={outerRef} style={{ height: '340vh', position: 'relative' }}>
      <div style={{
        position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
        background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(139,26,42,0.12) 0%, transparent 55%), #04010A',
      }}>
        {/* Map */}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }}>
          <motion.div style={{ width: '100%', height: '100%' }} initial={{ opacity: 0 }} animate={{ opacity: mapVisible ? 1 : 0 }} transition={{ duration: 0.7 }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center: [2.4, 46.8], scale: 1950 }}
              width={600} height={680}
              style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
            >
              <Geographies geography={DEPT_URL}>
                {({ geographies }) => geographies.map(geo => {
                  const code = geo.properties.code as string;
                  const d = WINE_DEPTS[code];
                  const shown = d && isDeptVisible(d.revealOrder);
                  return (
                    <Geography key={geo.rsmKey} geography={geo} style={{
                      default: { fill: shown ? '#D42040' : '#1C0838', fillOpacity: shown ? (d?.opacity ?? 0) : 1, stroke: shown ? '#5A1028' : '#3A1068', strokeWidth: 0.8, outline: 'none', transition: 'fill 400ms, fill-opacity 400ms' },
                      hover:   { fill: shown ? '#D42040' : '#1C0838', fillOpacity: shown ? (d?.opacity ?? 0) : 1, stroke: shown ? '#5A1028' : '#3A1068', strokeWidth: 0.8, outline: 'none' },
                      pressed: { fill: '#1C0838', fillOpacity: 1, stroke: '#3A1068', strokeWidth: 0.8, outline: 'none' },
                    }} />
                  );
                })}
              </Geographies>
              {visibleLabels.map(([code, d]) => (
                <Marker key={code} coordinates={d.labelCoords}>
                  <RegionLabel
                    korName={d.korName} count={d.count} featured={d.featured}
                    visible={isDeptVisible(d.revealOrder)}
                    bottleUnit={messages.franceWineDetail.bottleUnit}
                  />
                </Marker>
              ))}
            </ComposableMap>
          </motion.div>
        </div>

        {/* Vignette */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 85% 80% at 50% 52%, transparent 50%, rgba(4,1,10,0.88) 100%)' }} />

        {/* Header */}
        <AnimatePresence>
          {mapVisible && (
            <motion.div key="ttl" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              style={{ position: 'absolute', top: 'clamp(14px,2.5vh,28px)', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.28em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 6 }}>{messages.franceWine.sectionLabel}</div>
              <h2 style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 'clamp(18px,3vw,32px)', fontWeight: 400, color: '#F5F0E8' }}>{messages.franceWine.heading}</h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll dots — 5 dots, each covers 3 regions */}
        <div style={{ position: 'absolute', left: 'clamp(12px,2.5vw,24px)', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 10 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              width: 5,
              height: revealedCount >= i * 3 ? 20 : 5,
              borderRadius: 3,
              background: revealedCount >= i * 3 ? '#C41E3A' : 'rgba(255,255,255,0.12)',
              transition: 'all 350ms',
            }} />
          ))}
        </div>

        {/* Scroll hint (맵 등장 전) */}
        <AnimatePresence>
          {!mapVisible && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
              <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ color: '#4A3D56', fontSize: 11, letterSpacing: '0.12em', textAlign: 'center' }}>{messages.franceWine.scrollHint}</motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
