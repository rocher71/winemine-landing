'use client';

import { useRef, useState, useLayoutEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const DEPT_URL = '/france-departments.json';

// ── Wine department definitions ─────────────────────────────────────────────
// department code → wine region data
// Ordered by reveal sequence (most famous first)
const WINE_DEPTS: Record<string, {
  korName: string;
  frName: string;
  count: number;
  opacity: number;
  labelCoords: [number, number];
  showLabel: boolean;
  featured?: boolean;
  revealOrder: number; // 1 = first to appear
}> = {
  '21': { // Côte-d'Or — Meursault, Gevrey-Chambertin, etc.
    korName: '뫼르소',
    frName: "Côte-d'Or · Bourgogne",
    count: 28,
    opacity: 0.95,
    labelCoords: [4.88, 47.20],
    showLabel: true,
    featured: true,
    revealOrder: 1,
  },
  '33': { // Gironde — Bordeaux
    korName: '보르도',
    frName: 'Gironde · Bordeaux',
    count: 19,
    opacity: 0.68,
    labelCoords: [-0.62, 44.82],
    showLabel: true,
    revealOrder: 2,
  },
  '51': { // Marne — Champagne
    korName: '샹파뉴',
    frName: 'Marne · Champagne',
    count: 12,
    opacity: 0.50,
    labelCoords: [4.12, 49.00],
    showLabel: true,
    revealOrder: 3,
  },
  '67': { // Bas-Rhin — Alsace (upper)
    korName: '알자스',
    frName: 'Alsace',
    count: 7,
    opacity: 0.36,
    labelCoords: [7.52, 48.58],
    showLabel: true,
    revealOrder: 4,
  },
  '68': { // Haut-Rhin — Alsace (lower, same region, no duplicate label)
    korName: '',
    frName: '',
    count: 7,
    opacity: 0.36,
    labelCoords: [7.52, 48.58],
    showLabel: false,
    revealOrder: 4,
  },
  '69': { // Rhône — Côtes du Rhône
    korName: '론 밸리',
    frName: 'Rhône · Côtes du Rhône',
    count: 5,
    opacity: 0.20,
    labelCoords: [4.68, 45.80],
    showLabel: true,
    revealOrder: 5,
  },
};

// ── Meursault wines (shown in list below map) ────────────────────────────────
const MEURSAULT_WINES = [
  { name: 'Meursault Perrières',   grade: '1er Cru',   year: '2021', note: '헤이즐넛 · 버터 · 미네랄', producer: 'Domaine Leflaive' },
  { name: 'Meursault Charmes',     grade: '1er Cru',   year: '2020', note: '풍성한 과일 · 오크 · 꿀',   producer: 'Comtes Lafon' },
  { name: 'Meursault Genevrières', grade: '1er Cru',   year: '2019', note: '크리미 · 헤이즐넛 · 스모키', producer: 'Coche-Dury' },
  { name: 'Meursault Village',     grade: 'AOC',       year: '2022', note: '레몬 · 바닐라 · 아몬드',    producer: 'Patrick Javillier' },
  { name: 'Meursault Narvaux',     grade: 'Lieu-dit',  year: '2021', note: '미네랄 · 감귤 · 흰꽃',     producer: 'Roulot' },
];

// ── preserveAspectRatio="xMidYMid slice" hook ───────────────────────────────
function useSliceSvg(ref: React.RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const apply = () => {
      ref.current?.querySelectorAll('svg').forEach((svg) => {
        svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        svg.style.display = 'block';
      });
    };
    apply();
    const obs = new MutationObserver(apply);
    if (ref.current) obs.observe(ref.current, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [ref]);
}

// ── Region label marker ──────────────────────────────────────────────────────
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
      {/* Pill background */}
      <rect
        x={featured ? -44 : -36} y={featured ? -24 : -20}
        width={featured ? 88 : 72} height={featured ? 38 : 32}
        rx={6}
        fill="rgba(4,1,10,0.75)"
        stroke={featured ? 'rgba(255,208,96,0.5)' : 'rgba(255,255,255,0.1)'}
        strokeWidth={featured ? 1 : 0.5}
      />
      {/* Region name */}
      <text
        textAnchor="middle"
        y={featured ? -8 : -6}
        style={{
          fill: featured ? '#FFD060' : '#F5F0E8',
          fontSize: featured ? 11 : 9,
          fontFamily: 'Inter, -apple-system, sans-serif',
          fontWeight: featured ? 700 : 600,
          paintOrder: 'stroke fill',
        } as React.CSSProperties}
      >
        {featured ? `✦ ${korName}` : korName}
      </text>
      {/* Wine count */}
      <text
        textAnchor="middle"
        y={featured ? 8 : 7}
        style={{
          fill: featured ? '#FFD060' : '#C9A84C',
          fontSize: featured ? 13 : 11,
          fontFamily: 'Inter, -apple-system, sans-serif',
          fontWeight: 700,
        } as React.CSSProperties}
      >
        {count}병
      </text>
    </motion.g>
  );
}

// ── Wine card ────────────────────────────────────────────────────────────────
function WineCard({ name, grade, year, note, producer }: typeof MEURSAULT_WINES[number]) {
  const gradeColor = grade === '1er Cru' ? '#C9A84C' : grade === 'Lieu-dit' ? '#B0A080' : '#9B8B7A';
  return (
    <div style={{
      flexShrink: 0,
      width: 'clamp(158px, 42vw, 195px)',
      background: 'rgba(255,255,255,0.035)',
      border: '1px solid rgba(255,208,96,0.12)',
      borderRadius: 12,
      padding: '14px 15px',
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: gradeColor, fontWeight: 700, letterSpacing: '0.12em' }}>{grade}</span>
        <span style={{ fontSize: 9, color: '#6A5E4A' }}>{year}</span>
      </div>
      <div style={{
        fontSize: 13,
        fontFamily: 'Georgia, serif',
        color: '#F5F0E8',
        lineHeight: 1.3,
        fontWeight: 400,
      }}>
        {name}
      </div>
      <div style={{ fontSize: 10, color: '#9B8B7A' }}>{producer}</div>
      <div style={{ fontSize: 10, color: '#C9A84C', lineHeight: 1.5, marginTop: 2 }}>{note}</div>
    </div>
  );
}

// ── Main section ─────────────────────────────────────────────────────────────
export default function FranceWineSection() {
  const outerRef   = useRef<HTMLDivElement>(null);
  const mapRef     = useRef<HTMLDivElement>(null);

  const [mapVisible,    setMapVisible]    = useState(false);
  const [revealedCount, setRevealedCount] = useState(0); // how many regions revealed (1-5)
  const [wineListIn,    setWineListIn]    = useState(false);

  useSliceSvg(mapRef);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end start'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setMapVisible(v > 0.06);
    // Reveal up to 5 regions sequentially
    setRevealedCount(
      v < 0.18 ? 0 :
      v < 0.32 ? 1 :
      v < 0.44 ? 2 :
      v < 0.56 ? 3 :
      v < 0.66 ? 4 : 5
    );
    setWineListIn(v > 0.60);
  });

  // Is a specific department visible?
  const isDeptVisible = (order: number) => revealedCount >= order;

  return (
    <div ref={outerRef} style={{ height: '210vh', position: 'relative' }}>

      {/* ── Sticky viewport ──────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        overflow: 'hidden', background: '#04010A',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={mapVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute', top: 'clamp(14px,2.5vh,32px)',
            left: '50%', transform: 'translateX(-50%)',
            textAlign: 'center', zIndex: 20, pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: '0.28em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 6 }}>
            지역 탐험 · Zoom In
          </div>
          <h2 style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(18px,3.2vw,34px)', fontWeight: 400, color: '#F5F0E8',
          }}>
            프랑스 와인 산지
          </h2>
        </motion.div>

        {/* ── Map (department outlines) ─────────────────────────────────── */}
        <div
          ref={mapRef}
          style={{
            flex: `0 0 ${wineListIn ? '56%' : '100%'}`,
            transition: 'flex 600ms cubic-bezier(0.4,0,0.2,1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
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
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              {/* All France departments */}
              <Geographies geography={DEPT_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const code   = geo.properties.code as string;
                    const wine   = WINE_DEPTS[code];
                    const order  = wine?.revealOrder ?? 999;
                    const shown  = wine && isDeptVisible(order);

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        style={{
                          default: {
                            fill:        shown ? '#D42040' : '#1C0838',
                            fillOpacity: shown ? (wine?.opacity ?? 0) : 1,
                            stroke:      shown ? '#5A1028' : '#3A1068',
                            strokeWidth: 0.8,
                            outline: 'none',
                            transition: 'fill 400ms ease, fill-opacity 400ms ease',
                          },
                          hover: {
                            fill:        shown ? '#D42040' : '#1C0838',
                            fillOpacity: shown ? (wine?.opacity ?? 0) : 1,
                            stroke:      shown ? '#5A1028' : '#3A1068',
                            strokeWidth: 0.8,
                            outline: 'none',
                          },
                          pressed: {
                            fill: '#1C0838', fillOpacity: 1, stroke: '#3A1068',
                            strokeWidth: 0.8, outline: 'none',
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {/* Region labels with wine count */}
              {Object.entries(WINE_DEPTS)
                .filter(([, d]) => d.showLabel && d.korName)
                .map(([code, d]) => (
                  <Marker key={code} coordinates={d.labelCoords}>
                    <RegionLabel
                      korName={d.korName}
                      count={d.count}
                      featured={d.featured}
                      visible={isDeptVisible(d.revealOrder)}
                    />
                  </Marker>
                ))
              }
            </ComposableMap>
          </motion.div>

          {/* Vignette */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 90% 85% at 50% 52%, transparent 55%, rgba(4,1,10,0.88) 100%)',
          }} />

          {/* Stage dots (right side) */}
          <div style={{
            position: 'absolute', right: 'clamp(10px,2.5vw,20px)', top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column', gap: 8, zIndex: 20,
          }}>
            {[1,2,3,4,5].map((i) => (
              <div key={i} style={{
                width: revealedCount >= i ? 16 : 5,
                height: 5,
                borderRadius: 3,
                background: revealedCount >= i ? '#C41E3A' : 'rgba(255,255,255,0.12)',
                transition: 'all 350ms ease',
              }} />
            ))}
          </div>
        </div>

        {/* ── Wine list panel ───────────────────────────────────────────── */}
        <AnimatePresence>
          {wineListIn && (
            <motion.div
              key="wine-panel"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              style={{
                flex: '1 1 0',
                borderTop: '1px solid rgba(255,208,96,0.15)',
                background: 'rgba(5,2,14,0.96)',
                backdropFilter: 'blur(12px)',
                padding: 'clamp(12px,2vh,20px) clamp(16px,4vw,28px)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'clamp(10px,1.8vh,16px)', flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#C9A84C', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 3 }}>
                    내가 마신 와인
                  </div>
                  <h3 style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: 'clamp(13px,2vw,18px)',
                    fontWeight: 400, color: '#F5F0E8', margin: 0,
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

              {/* Horizontal wine cards */}
              <div style={{
                display: 'flex', gap: 12,
                overflowX: 'auto', flex: 1,
                alignItems: 'flex-start',
                paddingBottom: 4,
              }}>
                {MEURSAULT_WINES.map((w) => <WineCard key={w.name} {...w} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll hint */}
        <AnimatePresence>
          {!mapVisible && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                zIndex: 20,
              }}
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ color: '#4A3D56', fontSize: 11, letterSpacing: '0.12em', textAlign: 'center' }}
              >
                ↓ SCROLL
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
