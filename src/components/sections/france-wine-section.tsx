'use client';

import { useRef, useState, useLayoutEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const DEPT_URL = '/france-departments.json';

// ── Types ──────────────────────────────────────────────────────────────────
type WineItem = { name: string; grade: string; year: string; note: string; producer: string };

type RegionData = {
  korName: string; count: number; opacity: number;
  labelCoords: [number, number]; showLabel: boolean;
  featured?: boolean; revealOrder: number;
  wines: WineItem[];
};

// ── Wine data by département ───────────────────────────────────────────────
const WINE_DEPTS: Record<string, RegionData> = {
  '21': {
    korName: '뫼르소', count: 28, opacity: 0.95,
    labelCoords: [4.88, 47.20], showLabel: true, featured: true, revealOrder: 1,
    wines: [
      { name: 'Meursault Perrières',   grade: '1er Cru',  year: '2021', note: '헤이즐넛 · 버터 · 미네랄',     producer: 'Domaine Leflaive' },
      { name: 'Meursault Charmes',     grade: '1er Cru',  year: '2020', note: '풍성한 과일 · 오크 · 꿀',      producer: 'Comtes Lafon' },
      { name: 'Meursault Genevrières', grade: '1er Cru',  year: '2019', note: '크리미 · 헤이즐넛 · 스모키',   producer: 'Coche-Dury' },
      { name: 'Meursault Village',     grade: 'AOC',       year: '2022', note: '레몬 · 바닐라 · 아몬드',       producer: 'Patrick Javillier' },
      { name: 'Meursault Narvaux',     grade: 'Lieu-dit',  year: '2021', note: '미네랄 · 감귤 · 흰꽃',        producer: 'Roulot' },
    ],
  },
  '33': {
    korName: '보르도', count: 19, opacity: 0.68,
    labelCoords: [-0.62, 44.82], showLabel: true, revealOrder: 2,
    wines: [
      { name: 'Château Pétrus',    grade: 'Pomerol',         year: '2018', note: '체리 · 트러플 · 벨벳',        producer: 'Établissements Moueix' },
      { name: 'Château Margaux',   grade: '1er Grand Cru',   year: '2016', note: '장미 · 블랙커런트 · 삼나무',   producer: 'Château Margaux' },
      { name: 'Lynch-Bages',       grade: '5ème Cru Classé', year: '2019', note: '담배 · 블랙베리 · 가죽',       producer: 'Cazes Family' },
      { name: 'Léoville-Barton',   grade: '2ème Cru Classé', year: '2015', note: '자두 · 삼나무 · 스파이스',    producer: 'Barton Family' },
    ],
  },
  '51': {
    korName: '샹파뉴', count: 12, opacity: 0.50,
    labelCoords: [4.12, 49.00], showLabel: true, revealOrder: 3,
    wines: [
      { name: 'Krug Grande Cuvée', grade: 'Brut',            year: 'NV',   note: '브리오슈 · 사과 · 헤이즐넛',  producer: 'Krug' },
      { name: 'Dom Pérignon',      grade: 'Blanc Vintage',   year: '2013', note: '시트러스 · 아몬드 · 미네랄',   producer: 'Moët & Chandon' },
      { name: 'Billecart-Salmon',  grade: 'Blanc de Blancs', year: '2012', note: '흰꽃 · 레몬 · 크리미',         producer: 'Billecart-Salmon' },
    ],
  },
  '67': {
    korName: '알자스', count: 7, opacity: 0.36,
    labelCoords: [7.52, 48.58], showLabel: true, revealOrder: 4,
    wines: [
      { name: 'Clos Sainte-Hune',  grade: 'Riesling GC',    year: '2017', note: '미네랄 · 복숭아 · 휘발유',    producer: 'Trimbach' },
      { name: 'Pinot Gris Rangen', grade: 'Grand Cru',      year: '2019', note: '훈연 · 꿀 · 망고',           producer: 'Zind-Humbrecht' },
      { name: 'Gewurztraminer',    grade: 'Furstentum GC',  year: '2018', note: '장미 · 리치 · 생강',          producer: 'Domaine Weinbach' },
    ],
  },
  '68': {
    korName: '', count: 7, opacity: 0.36,
    labelCoords: [7.52, 48.58], showLabel: false, revealOrder: 4,
    wines: [],
  },
  '69': {
    korName: '론 밸리', count: 5, opacity: 0.20,
    labelCoords: [4.68, 45.80], showLabel: true, revealOrder: 5,
    wines: [
      { name: 'Château Rayas', grade: 'Châteauneuf-du-Pape', year: '2017', note: '체리 · 라벤더 · 가죽',         producer: 'Château Rayas' },
      { name: 'La Mouline',    grade: 'Côte-Rôtie',          year: '2016', note: '바이올렛 · 블랙베리 · 베이컨',  producer: 'E. Guigal' },
    ],
  },
};

const primaryKey = (code: string) => (code === '68' ? '67' : code);

// ── Region label (SVG inside Marker) ──────────────────────────────────────
function RegionLabel({ korName, count, featured, visible, selected, onClick }: {
  korName: string; count: number; featured?: boolean;
  visible: boolean; selected: boolean; onClick: () => void;
}) {
  const borderColor = selected
    ? '#FFD060'
    : featured ? 'rgba(255,208,96,0.55)' : 'rgba(255,255,255,0.12)';
  const strokeWidth = selected ? 1.8 : featured ? 1.2 : 0.6;
  const bg = selected ? 'rgba(4,1,10,0.94)' : 'rgba(4,1,10,0.82)';

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.6 }}
      animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ cursor: visible ? 'pointer' : 'default', pointerEvents: visible ? 'auto' : 'none' }}
      onClick={visible ? onClick : undefined}
      whileHover={visible ? { scale: 1.08 } : undefined}
    >
      <rect
        x={featured ? -44 : -36} y={featured ? -24 : -20}
        width={featured ? 88 : 72} height={featured ? 38 : 32}
        rx={6}
        fill={bg}
        stroke={borderColor}
        strokeWidth={strokeWidth}
      />
      <text textAnchor="middle" y={featured ? -8 : -6} style={{
        fill: selected ? '#FFD060' : featured ? '#FFD060' : '#F5F0E8',
        fontSize: featured ? 11 : 9,
        fontFamily: 'Inter, sans-serif',
        fontWeight: featured ? 700 : 600,
        paintOrder: 'stroke fill',
      } as React.CSSProperties}>
        {featured ? `✦ ${korName}` : korName}
      </text>
      <text textAnchor="middle" y={featured ? 8 : 7} style={{
        fill: selected ? '#FFD060' : '#C9A84C',
        fontSize: featured ? 13 : 11,
        fontFamily: 'Inter, sans-serif', fontWeight: 700,
      } as React.CSSProperties}>
        {count}병
      </text>
    </motion.g>
  );
}

// ── Floating wine panel ────────────────────────────────────────────────────
function WinePanel({ regionKey, visible }: { regionKey: string; visible: boolean }) {
  const data = WINE_DEPTS[regionKey];

  const gradeColor = (g: string) => {
    if (g.includes('1er') || g.includes('GC') || g.includes('Grand Cru')) return '#C9A84C';
    if (g.includes('Cru')) return '#B8A060';
    return '#9B8B7A';
  };

  return (
    <AnimatePresence>
      {visible && data && data.wines.length > 0 && (
        <motion.div
          key={regionKey}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: 'absolute',
            top: 'clamp(72px,10vh,100px)',
            right: 'clamp(40px,4.5vw,60px)',
            width: 'clamp(200px,25vw,284px)',
            maxHeight: '70vh',
            zIndex: 20,
            background: 'rgba(5,2,14,0.90)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(201,168,76,0.22)',
            borderRadius: 14,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '12px 16px 10px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>
            <div style={{ fontSize: 9, color: '#C9A84C', letterSpacing: '0.2em', textTransform: 'uppercase' as const, marginBottom: 5 }}>
              내가 마신 와인
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(13px,1.5vw,16px)', fontWeight: 400, color: '#F5F0E8', margin: 0,
              }}>
                프랑스 {data.korName}
              </h3>
              <span style={{
                padding: '2px 10px',
                background: 'rgba(255,208,96,0.10)',
                border: '1px solid rgba(255,208,96,0.28)',
                borderRadius: 20,
                fontSize: 11, color: '#FFD060', fontWeight: 700, flexShrink: 0, marginLeft: 8,
              }}>
                {data.count}병
              </span>
            </div>
          </div>

          {/* Wine list — vertically scrollable */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {data.wines.map((w, i) => (
              <div key={w.name} style={{
                padding: '11px 16px',
                borderBottom: i < data.wines.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                  <span style={{ fontSize: 9, color: gradeColor(w.grade), fontWeight: 700, letterSpacing: '0.07em' }}>
                    {w.grade}
                  </span>
                  <span style={{ fontSize: 9, color: '#6A5E4A' }}>{w.year}</span>
                </div>
                <div style={{ fontSize: 12, fontFamily: 'Georgia, serif', color: '#F5F0E8', lineHeight: 1.3, marginBottom: 3 }}>
                  {w.name}
                </div>
                <div style={{ fontSize: 10, color: '#9B8B7A', marginBottom: 2 }}>{w.producer}</div>
                <div style={{ fontSize: 10, color: '#C9A84C', lineHeight: 1.5 }}>{w.note}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function FranceWineSection() {
  const outerRef = useRef<HTMLDivElement>(null);
  const mapRef   = useRef<HTMLDivElement>(null);

  const [mapVisible,     setMapVisible]     = useState(false);
  const [revealedCount,  setRevealedCount]  = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<string>('21');

  // "meet" — France always shows in full, never cropped
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
  });

  const isDeptVisible  = (order: number) => revealedCount >= order;
  const showPanel      = mapVisible && revealedCount >= 1;

  const handleRegionClick = (code: string) => {
    const key = primaryKey(code);
    if (WINE_DEPTS[key]?.wines.length > 0) setSelectedRegion(key);
  };

  return (
    <div ref={outerRef} style={{ height: '210vh', position: 'relative' }}>

      {/* ── Sticky full-screen viewport ────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(139,26,42,0.12) 0%, transparent 55%), #04010A',
      }}>

        {/* ── France map ─────────────────────────────────────────────── */}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }}>
          <motion.div style={{ width: '100%', height: '100%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: mapVisible ? 1 : 0 }}
            transition={{ duration: 0.7 }}
          >
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center: [2.4, 46.8], scale: 1950 }}
              width={600}
              height={680}
              style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
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

              {/* Clickable region labels */}
              {Object.entries(WINE_DEPTS)
                .filter(([, d]) => d.showLabel && d.korName)
                .map(([code, d]) => (
                  <Marker key={code} coordinates={d.labelCoords}>
                    <RegionLabel
                      korName={d.korName}
                      count={d.count}
                      featured={d.featured}
                      visible={isDeptVisible(d.revealOrder)}
                      selected={selectedRegion === primaryKey(code)}
                      onClick={() => handleRegionClick(code)}
                    />
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

        {/* Left: scroll progress dots */}
        <div style={{
          position: 'absolute', left: 'clamp(12px,2.5vw,24px)',
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

        {/* Right: floating wine panel */}
        <WinePanel regionKey={selectedRegion} visible={showPanel} />

        {/* Click hint — only when first region just appeared */}
        <AnimatePresence>
          {mapVisible && revealedCount === 1 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              style={{
                position: 'absolute', bottom: 'clamp(24px,4vh,40px)',
                left: '50%', transform: 'translateX(-50%)',
                fontSize: 10, color: '#6A5E4A', letterSpacing: '0.10em',
                textAlign: 'center', zIndex: 10, pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              지역 라벨을 클릭하면 해당 와인 리스트를 볼 수 있어요
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll hint (before map appears) */}
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
