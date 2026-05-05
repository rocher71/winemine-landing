'use client';

import { useRef, useState, useLayoutEffect, useCallback } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const GEO_URL = '/world-50m.json';

// ── Utility ────────────────────────────────────────────────────────────────
const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));
const norm = (v: number, lo: number, hi: number) => (v - lo) / (hi - lo);

// ── Wine region data ────────────────────────────────────────────────────────
interface Region {
  name: string;
  label: string;
  coords: [number, number];
  r: number;
  opacity: number;
  color: string;
  textColor: string;
  anchor: 'start' | 'end';
  phase: 1 | 2;
}

const MAJOR: Region[] = [
  { name: 'Bordeaux',      label: 'Bordeaux',          coords: [-0.57, 44.84], r: 26, opacity: 0.88, color: '#E8253E', textColor: '#F5F0E8', anchor: 'end',   phase: 1 },
  { name: 'Champagne',     label: 'Champagne',          coords: [ 4.03, 49.05], r: 20, opacity: 0.72, color: '#E0203A', textColor: '#F5F0E8', anchor: 'start', phase: 1 },
  { name: 'Bourgogne',     label: 'Bourgogne',          coords: [ 4.83, 47.15], r: 18, opacity: 0.85, color: '#E8253E', textColor: '#F5F0E8', anchor: 'start', phase: 1 },
  { name: 'Loire',         label: 'Val. de la Loire',   coords: [-0.70, 47.40], r: 20, opacity: 0.65, color: '#D81C36', textColor: '#F5F0E8', anchor: 'end',   phase: 1 },
  { name: 'Rhône',         label: 'Côtes du Rhône',     coords: [ 4.77, 44.95], r: 16, opacity: 0.74, color: '#D82038', textColor: '#F5F0E8', anchor: 'start', phase: 1 },
];

const SUB: Region[] = [
  { name: 'Chablis',           label: 'Chablis',              coords: [ 3.80, 47.82], r: 8,  opacity: 0.80, color: '#C9A84C', textColor: '#E8C97A', anchor: 'start', phase: 2 },
  { name: 'Gevrey',            label: 'Gevrey-Chambertin',    coords: [ 4.955, 47.23], r: 7,  opacity: 0.92, color: '#C9A84C', textColor: '#E8C97A', anchor: 'start', phase: 2 },
  { name: 'Vosne',             label: 'Vosne-Romanée',        coords: [ 4.95, 47.16], r: 6,  opacity: 0.88, color: '#C9A84C', textColor: '#E8C97A', anchor: 'start', phase: 2 },
  { name: 'Meursault',         label: 'Meursault',            coords: [ 4.76, 47.00], r: 10, opacity: 1.00, color: '#FFD060', textColor: '#FFD060', anchor: 'end',   phase: 2 },
  { name: 'Puligny',           label: 'Puligny-Montrachet',   coords: [ 4.75, 46.94], r: 6,  opacity: 0.86, color: '#C9A84C', textColor: '#E8C97A', anchor: 'end',   phase: 2 },
  { name: 'Beaujolais',        label: 'Beaujolais',           coords: [ 4.55, 46.10], r: 12, opacity: 0.60, color: '#C9A84C', textColor: '#E8C97A', anchor: 'start', phase: 2 },
  { name: 'Sancerre',          label: 'Sancerre',             coords: [ 2.83, 47.33], r: 8,  opacity: 0.74, color: '#C9A84C', textColor: '#E8C97A', anchor: 'start', phase: 2 },
  { name: 'Alsace',            label: 'Alsace',               coords: [ 7.45, 48.25], r: 10, opacity: 0.68, color: '#C9A84C', textColor: '#E8C97A', anchor: 'start', phase: 2 },
  { name: 'Languedoc',         label: 'Languedoc',            coords: [ 3.10, 43.65], r: 15, opacity: 0.62, color: '#C9A84C', textColor: '#E8C97A', anchor: 'end',   phase: 2 },
  { name: 'Provence',          label: 'Provence',             coords: [ 5.80, 43.55], r: 14, opacity: 0.64, color: '#C9A84C', textColor: '#E8C97A', anchor: 'start', phase: 2 },
];

// ── Example wine list (simulated user data) ─────────────────────────────────
const WINES = [
  { region: '뫼르소',       name: 'Meursault Perrières',    grade: '1er Cru',   grape: 'Chardonnay', note: '헤이즐넛 · 버터 · 미네랄', year: '2021' },
  { region: '쥬브레-샹베르탱', name: 'Chambertin',           grade: 'Grand Cru', grape: 'Pinot Noir',  note: '파워풀 · 블랙체리 · 스파이스', year: '2019' },
  { region: '뫼르소',       name: 'Meursault Village',      grade: 'AOC',       grape: 'Chardonnay', note: '크리미 · 레몬 · 오크', year: '2022' },
  { region: '샹볼-뮈지니',  name: 'Chambolle-Musigny',      grade: '1er Cru',   grape: 'Pinot Noir',  note: '섬세 · 로즈페탈 · 딸기', year: '2020' },
  { region: '퓔리니-몽라셰', name: 'Puligny-Montrachet',    grade: '1er Cru',   grape: 'Chardonnay', note: '청사과 · 시트러스 · 꽃', year: '2021' },
  { region: '본',          name: 'Beaune Grèves',          grade: '1er Cru',   grape: 'Pinot Noir',  note: '실키 · 라즈베리 · 제비꽃', year: '2020' },
];

// ── Region marker ───────────────────────────────────────────────────────────
function RegionDot({ r, label, anchor, color, textColor, opacity, visible, featured }: {
  r: number; label: string; anchor: 'start' | 'end';
  color: string; textColor: string; opacity: number;
  visible: boolean; featured?: boolean;
}) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {featured && (
        <circle r={r + 6} fill="none" stroke={color} strokeWidth={1.5} opacity={0.4} />
      )}
      <circle r={r} fill={color} fillOpacity={opacity} />
      <text
        textAnchor={anchor}
        x={anchor === 'end' ? -(r + 5) : r + 5}
        y={4}
        style={{
          fill: textColor,
          fontSize: featured ? 11 : 9,
          fontFamily: 'Inter, -apple-system, sans-serif',
          fontWeight: featured ? 700 : 600,
          paintOrder: 'stroke fill',
          stroke: '#04010A',
          strokeWidth: 3,
          strokeLinejoin: 'round',
        } as React.CSSProperties}
      >
        {featured ? `✦ ${label}` : label}
      </text>
    </motion.g>
  );
}

// ── Wine card ────────────────────────────────────────────────────────────────
function WineCard({ name, grade, grape, note, year, region }: typeof WINES[number]) {
  const gradeColor = grade === 'Grand Cru' ? '#FFD060' : grade === '1er Cru' ? '#C9A84C' : '#9B8B7A';
  return (
    <div style={{
      flexShrink: 0,
      width: 'clamp(160px, 44vw, 200px)',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '14px 16px',
    }}>
      <div style={{ fontSize: 9, color: gradeColor, letterSpacing: '0.15em', marginBottom: 6, fontWeight: 700 }}>
        {region} · {grade}
      </div>
      <div style={{ fontSize: 13, fontFamily: 'Georgia, serif', color: '#F5F0E8', fontWeight: 400, lineHeight: 1.3, marginBottom: 6 }}>
        {name}
      </div>
      <div style={{ fontSize: 10, color: '#9B8B7A', marginBottom: 8 }}>
        {grape} · {year}
      </div>
      <div style={{ fontSize: 10, color: '#C9A84C', lineHeight: 1.5 }}>
        {note}
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function FranceWineSection() {
  const outerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress]       = useState(0);
  const [projScale, setProjScale]     = useState(2100);
  const [projCenter, setProjCenter]   = useState<[number, number]>([2.2, 46.4]);
  const [majorCount, setMajorCount]   = useState(0);
  const [subCount, setSubCount]       = useState(0);
  const [showWines, setShowWines]     = useState(false);

  // ── preserveAspectRatio="xMidYMid slice" on France SVG (fills viewport) ──
  useLayoutEffect(() => {
    const apply = () => {
      mapContainerRef.current?.querySelectorAll('svg').forEach((svg) => {
        svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        svg.style.width = '100%';
        svg.style.height = '100%';
      });
    };
    apply();
    const obs = new MutationObserver(apply);
    if (mapContainerRef.current) obs.observe(mapContainerRef.current, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  // ── Scroll tracking ────────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll({ target: outerRef, offset: ['start start', 'end start'] });

  const rafRef = useRef<number>(0);
  const updateState = useCallback((v: number) => {
    setProgress(v);

    // Scale: 2100 → 5200 (zoom into Burgundy)
    const newScale = Math.round(lerp(2100, 5200, norm(v, 0.12, 0.80)));

    // Center pans from France center → Burgundy
    const cx = lerp(2.2, 4.82, norm(v, 0.30, 0.70));
    const cy = lerp(46.4, 47.05, norm(v, 0.30, 0.70));

    setProjScale(newScale);
    setProjCenter([cx, cy]);

    // Sequential region reveal
    setMajorCount(Math.max(0, Math.min(5, Math.floor(norm(v, 0.22, 0.50) * 25))));
    setSubCount(Math.max(0, Math.min(SUB.length, Math.floor(norm(v, 0.52, 0.80) * 40))));
    setShowWines(v > 0.62);
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => updateState(v));
  });

  // ── Derived display state ──────────────────────────────────────────────────
  const stage = progress < 0.25 ? 0 : progress < 0.52 ? 1 : 2;
  const mapHeight = showWines ? '58%' : '100%';
  const titleVisible = progress > 0.04 && progress < 0.92;

  return (
    <div ref={outerRef} style={{ height: '300vh', position: 'relative' }}>

      {/* ── Sticky viewport ── */}
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        overflow: 'hidden', background: '#04010A',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* ── Section title ── */}
        <AnimatePresence>
          {titleVisible && (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute', top: 'clamp(18px,3vh,40px)',
                left: '50%', transform: 'translateX(-50%)',
                textAlign: 'center', zIndex: 20, pointerEvents: 'none',
              }}
            >
              <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 8 }}>
                Zoom In · 지역 탐험
              </div>
              <h2 style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: 'clamp(20px,3.5vw,36px)', fontWeight: 400, color: '#F5F0E8',
              }}>
                프랑스 와인 산지
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Map area ── */}
        <div ref={mapContainerRef} style={{
          flex: '0 0 auto',
          height: mapHeight,
          transition: 'height 600ms cubic-bezier(0.4,0,0.2,1)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <motion.div
            style={{ width: '100%', height: '100%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: progress > 0.08 ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          >
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center: projCenter, scale: projScale }}
              width={600}
              height={700}
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              {/* France outline */}
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .filter((g) => String((g as any).id).padStart(3, '0') === '250')
                    .map((g) => (
                      <Geography
                        key={g.rsmKey}
                        geography={g}
                        style={{
                          default: { fill: '#1C0838', stroke: '#4A1A78', strokeWidth: 1.5, outline: 'none' },
                          hover:   { fill: '#1C0838', stroke: '#4A1A78', strokeWidth: 1.5, outline: 'none' },
                          pressed: { fill: '#1C0838', stroke: '#4A1A78', strokeWidth: 1.5, outline: 'none' },
                        }}
                      />
                    ))
                }
              </Geographies>

              {/* Major regions — phase 1 */}
              {MAJOR.map((r, i) => (
                <Marker key={r.name} coordinates={r.coords}>
                  <RegionDot {...r} visible={i < majorCount} />
                </Marker>
              ))}

              {/* Sub-regions — phase 2 */}
              {SUB.map((r, i) => (
                <Marker key={r.name} coordinates={r.coords}>
                  <RegionDot {...r} visible={i < subCount} featured={r.name === 'Meursault'} />
                </Marker>
              ))}
            </ComposableMap>
          </motion.div>

          {/* Vignette edges */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 90% 85% at 50% 52%, transparent 50%, rgba(4,1,10,0.90) 100%)',
          }} />

          {/* Meursault info card — desktop only (hidden on mobile via media query below) */}
          <AnimatePresence>
            {subCount >= 4 && (
              <motion.div
                key="meursault-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute', bottom: '16%', right: 'clamp(12px,5vw,56px)',
                  width: 'clamp(150px,20vw,200px)',
                  background: 'rgba(8,2,18,0.88)',
                  border: '1px solid rgba(201,168,76,0.25)',
                  borderRadius: 12,
                  padding: '14px 18px',
                  zIndex: 15,
                  backdropFilter: 'blur(12px)',
                  display: 'var(--card-display, block)',
                }}
              >
                <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 6 }}>
                  Côte de Beaune
                </div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: '#F5F0E8', marginBottom: 8 }}>
                  ✦ Meursault
                </div>
                <div style={{ fontSize: 11, color: '#9B8B7A', lineHeight: 1.65 }}>
                  Chardonnay 100%<br />
                  AOC Côte de Beaune<br />
                  <span style={{ color: '#C9A84C' }}>1er Cru · Grand Cru</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Wine list panel — slides up from bottom ── */}
        <AnimatePresence>
          {showWines && (
            <motion.div
              key="wine-panel"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
              style={{
                flex: '1 1 0',
                display: 'flex', flexDirection: 'column',
                background: 'rgba(6,2,16,0.95)',
                borderTop: '1px solid rgba(201,168,76,0.18)',
                backdropFilter: 'blur(16px)',
                padding: 'clamp(14px,2.5vh,24px) clamp(16px,4vw,28px)',
                overflow: 'hidden',
              }}
            >
              {/* Panel header */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 'clamp(10px,1.8vh,18px)', flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 3 }}>
                    내가 기록한 와인
                  </div>
                  <h3 style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: 'clamp(14px,2.2vw,20px)',
                    fontWeight: 400, color: '#F5F0E8', margin: 0,
                  }}>
                    Bourgogne · 부르고뉴
                  </h3>
                </div>
                <div style={{
                  marginLeft: 'auto',
                  padding: '4px 10px',
                  background: 'rgba(196,30,58,0.15)',
                  border: '1px solid rgba(196,30,58,0.3)',
                  borderRadius: 20,
                  fontSize: 11, color: '#E06070', fontWeight: 600,
                  flexShrink: 0,
                }}>
                  {WINES.length}병
                </div>
              </div>

              {/* Horizontally scrollable wine cards */}
              <div style={{
                display: 'flex',
                gap: 12,
                overflowX: 'auto',
                paddingBottom: 8,
                scrollbarWidth: 'none',
                flex: 1,
                alignItems: 'flex-start',
              }}>
                {WINES.map((w) => <WineCard key={w.name} {...w} />)}
              </div>

              {/* Hint text */}
              <div style={{ fontSize: 10, color: '#4A3D56', marginTop: 'clamp(6px,1vh,12px)', flexShrink: 0 }}>
                실제 앱에서는 내가 기록한 와인이 표시됩니다
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stage indicator (bottom dots) ── */}
        <div style={{
          position: 'absolute',
          bottom: showWines ? 'auto' : 'clamp(14px,3vh,28px)',
          top: showWines ? 'clamp(14px,3vh,28px)' : 'auto',
          right: 'clamp(12px,3vw,28px)',
          display: 'flex', flexDirection: 'column', gap: 6, zIndex: 20,
          transition: 'all 400ms ease',
        }}>
          {['국가', '산지', '아펠라시옹'].map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, flexDirection: 'row-reverse' }}>
              <div style={{
                width: stage === i ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: stage === i ? '#C41E3A' : 'rgba(255,255,255,0.15)',
                transition: 'all 350ms ease',
              }} />
              {stage === i && (
                <span style={{ fontSize: 9, color: '#F5F0E8', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ── Scroll hint ── */}
        <AnimatePresence>
          {progress < 0.08 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 20 }}
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ color: '#4A3D56', fontSize: 11, letterSpacing: '0.12em' }}
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
