'use client';

import { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const DEPT_URL = '/france-departments.json';

type WineItem = { name: string; grade: string; year: string; note: string; producer: string };

type RegionData = {
  korName: string; count: number; opacity: number;
  labelCoords: [number, number]; showLabel: boolean;
  featured?: boolean; revealOrder: number;
  wines: WineItem[];
};

// ── Wine data ──────────────────────────────────────────────────────────────
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

// Regions shown on mobile (only 3)
const MOBILE_KEYS = ['21', '33', '51'];

// ── Region label ───────────────────────────────────────────────────────────
function RegionLabel({ korName, count, featured, visible, selected, showTapHint, onClick }: {
  korName: string; count: number; featured?: boolean;
  visible: boolean; selected: boolean; showTapHint: boolean; onClick: () => void;
}) {
  const borderColor = selected ? '#FFD060' : featured ? 'rgba(255,208,96,0.55)' : 'rgba(255,255,255,0.12)';
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
      {/* Pulsing tap hint above the label */}
      {showTapHint && visible && (
        <>
          <motion.circle
            cx={0} cy={featured ? -38 : -32}
            r={3}
            fill="#C9A84C"
            animate={{ opacity: [0.9, 0.3, 0.9], r: [3, 4.5, 3] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <text
            textAnchor="middle"
            y={featured ? -26 : -21}
            style={{
              fontSize: 7.5,
              fill: 'rgba(201,168,76,0.80)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              letterSpacing: '0.03em',
            } as React.CSSProperties}
          >
            탭해보세요
          </text>
        </>
      )}

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

// ── Desktop: right-side floating panel ────────────────────────────────────
function DesktopWinePanel({ regionKey, visible }: { regionKey: string; visible: boolean }) {
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
          <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: '#C9A84C', letterSpacing: '0.2em', textTransform: 'uppercase' as const, marginBottom: 5 }}>
              내가 마신 와인
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(13px,1.5vw,16px)', fontWeight: 400, color: '#F5F0E8', margin: 0 }}>
                프랑스 {data.korName}
              </h3>
              <span style={{ padding: '2px 10px', background: 'rgba(255,208,96,0.10)', border: '1px solid rgba(255,208,96,0.28)', borderRadius: 20, fontSize: 11, color: '#FFD060', fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
                {data.count}병
              </span>
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {data.wines.map((w, i) => (
              <div key={w.name} style={{ padding: '11px 16px', borderBottom: i < data.wines.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                  <span style={{ fontSize: 9, color: gradeColor(w.grade), fontWeight: 700, letterSpacing: '0.07em' }}>{w.grade}</span>
                  <span style={{ fontSize: 9, color: '#6A5E4A' }}>{w.year}</span>
                </div>
                <div style={{ fontSize: 12, fontFamily: 'Georgia, serif', color: '#F5F0E8', lineHeight: 1.3, marginBottom: 3 }}>{w.name}</div>
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

// ── Mobile bottom sheet: extended wine data ────────────────────────────────
type MobileWineItem = {
  initials: string; name: string; appellation: string;
  vintage: string; note: string; date: string;
};

const MOBILE_REGION_COLOR: Record<string, string> = {
  '33': '#C41E3A',
  '21': '#C9A84C',
  '51': '#8BB0D4',
};

const MOBILE_WINES: Record<string, MobileWineItem[]> = {
  '33': [
    { initials: 'CM', name: 'Château Margaux',      appellation: 'Margaux',  vintage: '2015', note: '잘 익은 카시스, 시가박스, 제비꽃. 우아한 탄닌.', date: '2026.04.18' },
    { initials: 'PB', name: 'Château Pichon Baron', appellation: 'Pauillac', vintage: '2016', note: '연필심, 블랙커런트, 스모키한 오크. 구조감이 압도적.', date: '2026.03.22' },
    { initials: 'LB', name: 'Château Lynch-Bages',  appellation: 'Pauillac', vintage: '2014', note: '농밀한 검은 과실, 다크초콜릿, 가죽 뉘앙스.', date: '2026.02.14' },
    { initials: 'EV', name: "Château L'Évangile",   appellation: 'Pomerol',  vintage: '2017', note: '실키한 텍스처, 자두 콩포트, 트러플의 매혹적인 향.', date: '2026.01.30' },
  ],
  '21': [
    { initials: 'MP', name: 'Meursault Perrières',   appellation: 'Côte de Beaune', vintage: '2021', note: '헤이즐넛 · 버터 · 미네랄.', date: '2026.04.05' },
    { initials: 'MC', name: 'Meursault Charmes',     appellation: 'Côte de Beaune', vintage: '2020', note: '풍성한 과실 · 오크 · 꿀.', date: '2026.02.28' },
    { initials: 'MG', name: 'Meursault Genevrières', appellation: 'Côte de Beaune', vintage: '2019', note: '크리미 · 헤이즐넛 · 스모키.', date: '2026.01.14' },
    { initials: 'MV', name: 'Meursault Village',     appellation: 'Côte de Beaune', vintage: '2022', note: '레몬 · 바닐라 · 아몬드.', date: '2025.12.20' },
  ],
  '51': [
    { initials: 'KG', name: 'Krug Grande Cuvée', appellation: 'Champagne', vintage: 'NV',   note: '브리오슈 · 사과 · 헤이즐넛 · 끝없는 피니시.', date: '2026.03.15' },
    { initials: 'DP', name: 'Dom Pérignon',      appellation: 'Épernay',   vintage: '2013', note: '시트러스 · 아몬드 · 미네랄. 완벽한 균형.', date: '2026.01.01' },
    { initials: 'BS', name: 'Billecart-Salmon',  appellation: 'Mareuil',   vintage: '2012', note: '흰꽃 · 레몬 · 크리미. 섬세하고 우아.', date: '2025.12.31' },
  ],
};

const MOBILE_STATS: Record<string, { count: number; avgRating: number; favorite: string }> = {
  '33': { count: 19, avgRating: 4.4, favorite: 'Margaux' },
  '21': { count: 28, avgRating: 4.7, favorite: 'Perrières' },
  '51': { count: 12, avgRating: 4.5, favorite: 'Krug' },
};

// ── Mobile: bottom sheet panel ─────────────────────────────────────────────
function MobileBottomSheet({
  selectedRegion, visible, revealedCount, onSelectRegion,
}: {
  selectedRegion: string; visible: boolean; revealedCount: number;
  onSelectRegion: (key: string) => void;
}) {
  const data = WINE_DEPTS[selectedRegion];
  const wines = MOBILE_WINES[selectedRegion] ?? [];
  const stats = MOBILE_STATS[selectedRegion];
  const regionColor = MOBILE_REGION_COLOR[selectedRegion] ?? '#C9A84C';

  const truncateNote = (note: string) =>
    note.length > 40 ? note.slice(0, 40) + '…' : note;

  return (
    <AnimatePresence>
      {visible && data && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            zIndex: 20,
            background: 'rgba(8,2,18,0.96)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderTop: '1px solid rgba(201,168,76,0.20)',
            borderRadius: '20px 20px 0 0',
            maxHeight: '55vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, flexShrink: 0 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)' }} />
          </div>

          {/* Header section */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedRegion + '-header'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              style={{ padding: '10px 16px 8px', flexShrink: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 18, fontWeight: 700, color: '#F5F0E8',
                }}>
                  {data.korName}
                </span>
                <span style={{
                  padding: '2px 8px',
                  background: 'rgba(201,168,76,0.12)',
                  border: '1px solid rgba(201,168,76,0.35)',
                  borderRadius: 20,
                  fontSize: 9, color: '#C9A84C', fontWeight: 600,
                  letterSpacing: '0.04em',
                }}>
                  Ma Cave
                </span>
              </div>
              {stats && (
                <div style={{ fontSize: 11, color: '#9B8B7A', letterSpacing: '0.02em' }}>
                  {stats.count}병 · 평균 {stats.avgRating} · 최애 {stats.favorite}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: 8, padding: '8px 16px', flexShrink: 0 }}>
            {MOBILE_KEYS.map(key => {
              const d = WINE_DEPTS[key];
              const isActive = selectedRegion === key;
              const isRevealed = revealedCount >= d.revealOrder;
              return (
                <button
                  key={key}
                  onClick={() => isRevealed && onSelectRegion(key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: `1px solid ${isActive ? 'rgba(201,168,76,0.45)' : 'rgba(255,255,255,0.08)'}`,
                    background: isActive ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)',
                    color: isActive ? '#FFD060' : isRevealed ? '#6A5E4A' : '#4A3D56',
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 400,
                    cursor: isRevealed ? 'pointer' : 'default',
                    fontFamily: 'inherit',
                    transition: 'all 200ms ease',
                    whiteSpace: 'nowrap' as const,
                  }}
                >
                  {d.korName}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

          {/* Wine list — vertical scroll */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px 16px 20px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRegion + '-wines'}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
              >
                {wines.map((w, i) => (
                  <div key={w.name}>
                    {/* Wine item */}
                    <div style={{ padding: '10px 0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      {/* Circle with initials */}
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: regionColor + '26',
                        border: `1px solid ${regionColor}4D`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: regionColor }}>
                          {w.initials}
                        </span>
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Top row: region chip + year */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
                          <span style={{
                            fontSize: 7, textTransform: 'uppercase' as const,
                            letterSpacing: '0.12em', color: '#C9A84C',
                            border: '1px solid rgba(201,168,76,0.25)',
                            borderRadius: 3, padding: '1px 5px', marginRight: 6,
                          }}>
                            {data.korName}
                          </span>
                          <span style={{ fontSize: 9, color: '#6A5E4A', marginLeft: 'auto' }}>
                            {w.vintage}
                          </span>
                        </div>

                        {/* Wine name */}
                        <div style={{
                          fontSize: 13, fontFamily: 'Georgia, serif',
                          color: '#F5F0E8', lineHeight: 1.3, marginBottom: 2,
                        }}>
                          {w.name}
                        </div>

                        {/* Appellation */}
                        <div style={{ fontSize: 10, color: '#9B8B7A', marginBottom: 2 }}>
                          {w.appellation}
                        </div>

                        {/* Tasting note */}
                        <div style={{ fontSize: 10, color: '#9B8B7A', lineHeight: 1.5 }}>
                          {truncateNote(w.note)}
                        </div>

                        {/* Date */}
                        <div style={{ fontSize: 9, color: '#4A3D56', textAlign: 'right' as const, marginTop: 4 }}>
                          {w.date}
                        </div>
                      </div>
                    </div>

                    {/* Divider between items */}
                    {i < wines.length - 1 && (
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
                    )}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
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

  const [isMobile, setIsMobile] = useState(false);
  const [mapVisible,     setMapVisible]     = useState(false);
  const [revealedCount,  setRevealedCount]  = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<string>('21');

  // Detect mobile and set default region
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      setSelectedRegion(mobile ? '33' : '21');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // "meet" — France always shows in full
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

  // Which labels to show: mobile = 3, desktop = all
  const visibleLabels = isMobile
    ? Object.entries(WINE_DEPTS).filter(([code, d]) => d.showLabel && d.korName && MOBILE_KEYS.includes(code))
    : Object.entries(WINE_DEPTS).filter(([code, d]) => d.showLabel && d.korName);

  return (
    <div ref={outerRef} style={{ height: '210vh', position: 'relative' }}>
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(139,26,42,0.12) 0%, transparent 55%), #04010A',
      }}>

        {/* France map */}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }}>
          <motion.div style={{ width: '100%', height: '100%' }}
            initial={{ opacity: 0 }} animate={{ opacity: mapVisible ? 1 : 0 }} transition={{ duration: 0.7 }}
          >
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center: [2.4, 46.8], scale: 1950 }}
              width={600} height={680}
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
                        default: { fill: shown ? '#D42040' : '#1C0838', fillOpacity: shown ? (wine?.opacity ?? 0) : 1, stroke: shown ? '#5A1028' : '#3A1068', strokeWidth: 0.8, outline: 'none', transition: 'fill 400ms ease, fill-opacity 400ms ease' },
                        hover:   { fill: shown ? '#D42040' : '#1C0838', fillOpacity: shown ? (wine?.opacity ?? 0) : 1, stroke: shown ? '#5A1028' : '#3A1068', strokeWidth: 0.8, outline: 'none' },
                        pressed: { fill: '#1C0838', fillOpacity: 1, stroke: '#3A1068', strokeWidth: 0.8, outline: 'none' },
                      }}
                    />
                  );
                })}
              </Geographies>

              {/* Region labels */}
              {visibleLabels.map(([code, d]) => (
                <Marker key={code} coordinates={d.labelCoords}>
                  <RegionLabel
                    korName={d.korName}
                    count={d.count}
                    featured={d.featured}
                    visible={isDeptVisible(d.revealOrder)}
                    selected={selectedRegion === primaryKey(code)}
                    showTapHint={isMobile && isDeptVisible(d.revealOrder) && selectedRegion !== primaryKey(code)}
                    onClick={() => handleRegionClick(code)}
                  />
                </Marker>
              ))}
            </ComposableMap>
          </motion.div>
        </div>

        {/* Vignette */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 85% 80% at 50% 52%, transparent 50%, rgba(4,1,10,0.88) 100%)' }} />

        {/* Top: section header */}
        <AnimatePresence>
          {mapVisible && (
            <motion.div key="title"
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: 'absolute', top: 'clamp(14px,2.5vh,28px)', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10, pointerEvents: 'none', whiteSpace: 'nowrap' }}
            >
              <div style={{ fontSize: 9, letterSpacing: '0.28em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 6 }}>지역 탐험</div>
              <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(18px,3vw,32px)', fontWeight: 400, color: '#F5F0E8' }}>
                프랑스 와인 산지
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left: scroll progress dots */}
        <div style={{ position: 'absolute', left: 'clamp(12px,2.5vw,24px)', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 10 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ width: 5, height: revealedCount >= i ? 20 : 5, borderRadius: 3, background: revealedCount >= i ? '#C41E3A' : 'rgba(255,255,255,0.12)', transition: 'all 350ms ease' }} />
          ))}
        </div>

        {/* Desktop: right-side floating panel */}
        {!isMobile && <DesktopWinePanel regionKey={selectedRegion} visible={showPanel} />}

        {/* Mobile: bottom sheet */}
        {isMobile && (
          <MobileBottomSheet
            selectedRegion={selectedRegion}
            visible={showPanel}
            revealedCount={revealedCount}
            onSelectRegion={setSelectedRegion}
          />
        )}

        {/* Scroll hint (before map) */}
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
