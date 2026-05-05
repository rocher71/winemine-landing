'use client';

import { useRef, useState, useLayoutEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const DEPT_URL = '/france-departments.json';

// ── Wine department definitions ────────────────────────────────────────────
const WINE_DEPTS: Record<string, {
  korName: string; count: number; opacity: number;
  labelCoords: [number, number]; showLabel: boolean;
  featured?: boolean; revealOrder: number;
}> = {
  '21': { korName: '뫼르소',  count: 28, opacity: 0.95, labelCoords: [4.88, 47.20], showLabel: true, featured: true, revealOrder: 1 },
  '33': { korName: '보르도',  count: 19, opacity: 0.68, labelCoords: [-0.62, 44.82], showLabel: true, revealOrder: 2 },
  '51': { korName: '샹파뉴',  count: 12, opacity: 0.50, labelCoords: [4.12, 49.00], showLabel: true, revealOrder: 3 },
  '67': { korName: '알자스',  count: 7,  opacity: 0.36, labelCoords: [7.52, 48.58], showLabel: true, revealOrder: 4 },
  '68': { korName: '',        count: 7,  opacity: 0.36, labelCoords: [7.52, 48.58], showLabel: false, revealOrder: 4 },
  '69': { korName: '론 밸리', count: 5,  opacity: 0.20, labelCoords: [4.68, 45.80], showLabel: true, revealOrder: 5 },
};

// ── Meursault wines ────────────────────────────────────────────────────────
const MEURSAULT_WINES = [
  { name: 'Meursault Perrières',   grade: '1er Cru', year: '2021', note: '헤이즐넛 · 버터 · 미네랄', producer: 'Domaine Leflaive' },
  { name: 'Meursault Charmes',     grade: '1er Cru', year: '2020', note: '풍성한 과일 · 오크 · 꿀',   producer: 'Comtes Lafon' },
  { name: 'Meursault Genevrières', grade: '1er Cru', year: '2019', note: '크리미 · 헤이즐넛 · 스모키', producer: 'Coche-Dury' },
  { name: 'Meursault Village',     grade: 'AOC',     year: '2022', note: '레몬 · 바닐라 · 아몬드',    producer: 'Patrick Javillier' },
  { name: 'Meursault Narvaux',     grade: 'Lieu-dit',year: '2021', note: '미네랄 · 감귤 · 흰꽃',     producer: 'Roulot' },
];

// ── Region label ───────────────────────────────────────────────────────────
function RegionLabel({ korName, count, featured, visible }: {
  korName: string; count: number; featured?: boolean; visible: boolean;
}) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.6 }}
      animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ pointerEvents: 'none' }}
    >
      <rect
        x={featured ? -44 : -36} y={featured ? -24 : -20}
        width={featured ? 88 : 72} height={featured ? 38 : 32}
        rx={6}
        fill="rgba(4,1,10,0.82)"
        stroke={featured ? 'rgba(255,208,96,0.55)' : 'rgba(255,255,255,0.12)'}
        strokeWidth={featured ? 1.2 : 0.6}
      />
      <text textAnchor="middle" y={featured ? -8 : -6} style={{
        fill: featured ? '#FFD060' : '#F5F0E8',
        fontSize: featured ? 11 : 9,
        fontFamily: 'Inter, sans-serif',
        fontWeight: featured ? 700 : 600,
        paintOrder: 'stroke fill',
      } as React.CSSProperties}>
        {featured ? `✦ ${korName}` : korName}
      </text>
      <text textAnchor="middle" y={featured ? 8 : 7} style={{
        fill: featured ? '#FFD060' : '#C9A84C',
        fontSize: featured ? 13 : 11,
        fontFamily: 'Inter, sans-serif', fontWeight: 700,
      } as React.CSSProperties}>
        {count}병
      </text>
    </motion.g>
  );
}

// ── Wine card ──────────────────────────────────────────────────────────────
function WineCard({ name, grade, year, note, producer }: typeof MEURSAULT_WINES[number]) {
  const gradeColor = grade === '1er Cru' ? '#C9A84C' : grade === 'Lieu-dit' ? '#B0A080' : '#9B8B7A';
  return (
    <div style={{
      flexShrink: 0, width: 'clamp(150px, 40vw, 188px)',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,208,96,0.12)',
      borderRadius: 12, padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, color: gradeColor, fontWeight: 700, letterSpacing: '0.1em' }}>{grade}</span>
        <span style={{ fontSize: 9, color: '#6A5E4A' }}>{year}</span>
      </div>
      <div style={{ fontSize: 12, fontFamily: 'Georgia, serif', color: '#F5F0E8', lineHeight: 1.3 }}>{name}</div>
      <div style={{ fontSize: 10, color: '#9B8B7A' }}>{producer}</div>
      <div style={{ fontSize: 10, color: '#C9A84C', lineHeight: 1.5, marginTop: 2 }}>{note}</div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function FranceWineSection() {
  const outerRef = useRef<HTMLDivElement>(null);
  const mapRef   = useRef<HTMLDivElement>(null);

  const [mapVisible,    setMapVisible]    = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showWines,     setShowWines]     = useState(false);

  // Use "meet" — France always shows in full, never cropped
  useLayoutEffect(() => {
    const apply = () => {
      mapRef.current?.querySelectorAll('svg').forEach(svg => {
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.display = 'block';
      });
    };
    apply();
    const obs = new MutationObserver(apply);
    if (mapRef.current) obs.observe(mapRef.current, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: outerRef, offset: ['start start', 'end start'] });

  useMotionValueEvent(scrollYProgress, 'change', v => {
    setMapVisible(v > 0.06);
    setRevealedCount(v < 0.18 ? 0 : v < 0.32 ? 1 : v < 0.44 ? 2 : v < 0.56 ? 3 : v < 0.66 ? 4 : 5);
    setShowWines(v > 0.60);
  });

  const isDeptVisible = (order: number) => revealedCount >= order;

  return (
    <div ref={outerRef} style={{ height: '210vh', position: 'relative' }}>

      {/* ── Sticky full-screen viewport ───────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        overflow: 'hidden', background: '#04010A',
      }}>

        {/* ── France map — fills full container, "meet" keeps France visible ── */}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }}>
          <motion.div
            style={{ width: '100%', height: '100%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: mapVisible ? 1 : 0 }}
            transition={{ duration: 0.7 }}
          >
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center: [2.4, 46.8], scale: 1950 }}
              width={600}
              height={680}
              style={{ width: '100%', height: '100%', display: 'block', background: '#04010A' }}
            >
              <Geographies geography={DEPT_URL}>
                {({ geographies }) => geographies.map(geo => {
                  const code  = geo.properties.code as string;
                  const wine  = WINE_DEPTS[code];
                  const shown = wine && isDeptVisible(wine.revealOrder);
                  return (
                    <Geography key={geo.rsmKey} geography={geo}
                      style={{
                        default: {
                          fill:        shown ? '#D42040' : '#1C0838',
                          fillOpacity: shown ? (wine?.opacity ?? 0) : 1,
                          stroke:      shown ? '#5A1028' : '#3A1068',
                          strokeWidth: 0.8, outline: 'none',
                          transition: 'fill 400ms ease, fill-opacity 400ms ease',
                        },
                        hover:   { fill: shown ? '#D42040' : '#1C0838', fillOpacity: shown ? (wine?.opacity ?? 0) : 1, stroke: shown ? '#5A1028' : '#3A1068', strokeWidth: 0.8, outline: 'none' },
                        pressed: { fill: '#1C0838', fillOpacity: 1, stroke: '#3A1068', strokeWidth: 0.8, outline: 'none' },
                      }}
                    />
                  );
                })}
              </Geographies>

              {/* Region labels with wine counts */}
              {Object.entries(WINE_DEPTS).filter(([, d]) => d.showLabel && d.korName).map(([code, d]) => (
                <Marker key={code} coordinates={d.labelCoords}>
                  <RegionLabel korName={d.korName} count={d.count} featured={d.featured} visible={isDeptVisible(d.revealOrder)} />
                </Marker>
              ))}
            </ComposableMap>
          </motion.div>
        </div>

        {/* ── Overlays ─────────────────────────────────────────────────── */}

        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 85% 80% at 50% 52%, transparent 50%, rgba(4,1,10,0.88) 100%)',
        }} />

        {/* Top: section header */}
        <AnimatePresence>
          {mapVisible && (
            <motion.div key="title"
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute', top: 'clamp(14px,2.5vh,28px)',
                left: '50%', transform: 'translateX(-50%)',
                textAlign: 'center', zIndex: 10, pointerEvents: 'none', whiteSpace: 'nowrap',
              }}
            >
              <div style={{ fontSize: 9, letterSpacing: '0.28em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 6 }}>
                지역 탐험
              </div>
              <h2 style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: 'clamp(18px,3vw,32px)', fontWeight: 400, color: '#F5F0E8',
              }}>
                프랑스 와인 산지
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right: stage dots */}
        <div style={{
          position: 'absolute', right: 'clamp(12px,2.5vw,24px)',
          top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', gap: 8, zIndex: 10,
        }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              width: 5, height: revealedCount >= i ? 20 : 5,
              borderRadius: 3,
              background: revealedCount >= i ? '#C41E3A' : 'rgba(255,255,255,0.12)',
              transition: 'all 350ms ease',
            }} />
          ))}
        </div>

        {/* Bottom: wine list overlay (slides up) */}
        <AnimatePresence>
          {showWines && (
            <motion.div
              key="wine-panel"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 15,
                background: 'rgba(5,2,14,0.94)',
                backdropFilter: 'blur(16px)',
                borderTop: '1px solid rgba(201,168,76,0.18)',
                padding: 'clamp(14px,2vh,22px) clamp(16px,4vw,28px)',
                maxHeight: '42%',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#C9A84C', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 3 }}>
                    내가 마신 와인
                  </div>
                  <h3 style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: 'clamp(13px,2vw,18px)', fontWeight: 400, color: '#F5F0E8', margin: 0,
                  }}>
                    프랑스 뫼르소의 와인들
                  </h3>
                </div>
                <div style={{
                  marginLeft: 'auto', flexShrink: 0,
                  padding: '4px 12px',
                  background: 'rgba(255,208,96,0.1)',
                  border: '1px solid rgba(255,208,96,0.3)',
                  borderRadius: 20,
                  fontSize: 11, color: '#FFD060', fontWeight: 700,
                }}>
                  28병
                </div>
              </div>

              {/* Wine cards (horizontal scroll) */}
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', flex: 1, alignItems: 'flex-start', paddingBottom: 4 }}>
                {MEURSAULT_WINES.map(w => <WineCard key={w.name} {...w} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll hint */}
        <AnimatePresence>
          {!mapVisible && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
              <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ color: '#4A3D56', fontSize: 11, letterSpacing: '0.12em', textAlign: 'center' }}>
                ↓ SCROLL
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
