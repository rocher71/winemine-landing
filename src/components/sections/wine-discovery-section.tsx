'use client';

import { useRef, useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, MotionValue } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Line } from 'react-simple-maps';
import { useLocale } from '@/components/providers/locale-provider';
import { ScanPanel } from './features-section';
import { RECOMMENDED_WINES, STARTING_WINE, formatKrw, type RecommendedWine } from '@/lib/recommended-wines';

const TOTAL_STEPS = 3; // 0 intro, 1 scan, 2 recommend

function StepHeader({ label, title, body }: { label?: string; title: string; body?: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 'clamp(20px, 3vh, 36px)' }}>
      {label && (
        <div style={{
          fontSize: 10,
          letterSpacing: '0.28em',
          color: '#C9A84C',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          {label}
        </div>
      )}
      <h2 style={{
        fontFamily: 'var(--font-playfair), Georgia, serif',
        fontSize: 'clamp(26px, 4.5vw, 42px)',
        fontWeight: 400,
        color: '#F5F0E8',
        lineHeight: 1.2,
        marginBottom: body ? 14 : 0,
        whiteSpace: 'pre-line',
      }}>
        {title}
      </h2>
      {body && (
        <p style={{
          fontSize: 'clamp(13px, 1.5vw, 15px)',
          color: '#9B8B7A',
          maxWidth: 520,
          margin: '0 auto',
          lineHeight: 1.7,
          whiteSpace: 'pre-line',
        }}>
          {body}
        </p>
      )}
    </div>
  );
}

// ── WineBottleSilhouette: full label-bearing bottle ────────────────────────
const WINE_TYPE_LABEL_BG: Record<RecommendedWine['wineType'], string> = {
  red:    '#f5ecd6',
  white:  '#fbf6e2',
  'rosé': '#f9e2e6',
};

function WineBottleSilhouette({
  wine,
  width = 44,
  height = 105,
  uidSuffix = '',
}: {
  wine: RecommendedWine;
  width?: number;
  height?: number;
  uidSuffix?: string;
}) {
  const uid = `bb-${wine.id}-${uidSuffix}`;
  const c = wine.bottleColor;
  const labelBg = WINE_TYPE_LABEL_BG[wine.wineType];
  const lbl = wine.vintage > 0 ? String(wine.vintage) : 'NV';
  const app = (wine.appellation || '').slice(0, 8).toUpperCase();
  return (
    <svg width={width} height={height} viewBox="0 0 48 108" style={{ flexShrink: 0 }} aria-hidden="true">
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor={c} stopOpacity="1" />
          <stop offset="75%" stopColor={c} stopOpacity="0.85" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path
        d="M15 30 L15 90 Q15 98 24 98 Q33 98 33 90 L33 30 Q31 28 29 26 L29 18 Q29 14 25 14 L23 14 Q19 14 19 18 L19 26 Q17 28 15 30 Z"
        fill={`url(#${uid})`}
      />
      <rect x="20" y="9"  width="8"  height="9"  rx="2" fill="#0a0612" fillOpacity="0.85" />
      <rect x="19" y="15" width="10" height="2" fill="#C9A84C" fillOpacity="0.8" />
      <rect x="17" y="50" width="14" height="24" rx="1" fill={labelBg} stroke="#C9A84C" strokeWidth="0.5" strokeOpacity="0.6" />
      <text x="24" y="57"   textAnchor="middle" fontFamily="Georgia,serif"  fontSize="3.5" fontStyle="italic" fill="#3d1a26">winemine</text>
      <text x="24" y="63"   textAnchor="middle" fontFamily="Georgia,serif"  fontSize="5"   fontWeight="bold" fill="#3d1a26">{wine.label}</text>
      <line x1="19" y1="65" x2="29" y2="65" stroke="#3d1a26" strokeWidth="0.4" strokeOpacity="0.5" />
      <text x="24" y="68.5" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="2.5" letterSpacing="0.8" fill="#3d1a26">{app}</text>
      <text x="24" y="72.5" textAnchor="middle" fontFamily="Georgia,serif"   fontSize="4"   fontWeight="600" fill="#3d1a26">{lbl}</text>
    </svg>
  );
}

// ── Wave model ────────────────────────────────────────────────────────────
type ConnectionLine = { from: [number, number]; to: [number, number] };
type Wave = {
  isos: string[];
  newLines: ConnectionLine[];
};

const FRANCE: [number, number] = STARTING_WINE.coords;
const ITALY_HUB: [number, number] = [12.5, 41.9];

const WAVES: Wave[] = [
  // Wave 0 — your origin
  { isos: ['250'], newLines: [] },
  // Wave 1 — adjacent Europe (Italy, Spain)
  {
    isos: ['250', '380', '724'],
    newLines: [
      { from: FRANCE, to: [12.5, 41.9] },   // → Italy
      { from: FRANCE, to: [-3.7, 40.4] },   // → Spain
    ],
  },
  // Wave 2 — new world (Chile, Argentina, NZ, Australia, US)
  {
    isos: ['250', '380', '724', '152', '032', '554', '036', '840'],
    newLines: [
      { from: ITALY_HUB, to: [-70.66, -33.45] }, // → Chile
      { from: ITALY_HUB, to: [-68.85, -32.89] }, // → Argentina
      { from: ITALY_HUB, to: [173.95, -41.52] }, // → New Zealand
      { from: ITALY_HUB, to: [138.6, -34.93] },  // → Australia
      { from: ITALY_HUB, to: [-100, 40] },       // → USA
    ],
  },
];

// recProgress thresholds for each wave inside step 2
const WAVE_THRESHOLDS = [0.10, 0.40, 0.70];

const COUNTRY_FILL_ACTIVE = '#8B1A2A';
const COUNTRY_FILL_HIGHLIGHT = '#C41E3A';
const COUNTRY_FILL_INACTIVE = '#1A0A2E';
const COUNTRY_STROKE = '#2A0C58';

// France projected pixel position for transform-origin (projection scale 220, center [10,22], viewBox 1600×900):
//   x = (-0.578 - 10) * 220 * π/180 + 800 ≈ 759
//   y = -(44.838 - 22) * 220 * π/180 + 450 ≈ 362
// → roughly 47.5% × 40%
const ORIGIN_X_PCT = 47.5;
const ORIGIN_Y_PCT = 40;

function FullScreenMap({ progress, visible }: { progress: MotionValue<number>; visible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [waveIdx, setWaveIdx] = useState(-1);

  useEffect(() => setMounted(true), []);

  useMotionValueEvent(progress, 'change', v => {
    let next = -1;
    for (let i = 0; i < WAVES.length; i++) {
      if (v >= WAVE_THRESHOLDS[i]) next = i;
    }
    setWaveIdx(next);
  });

  const activeIsos = useMemo(() => {
    const set = new Set<string>();
    if (waveIdx >= 0) WAVES[waveIdx].isos.forEach(iso => set.add(iso));
    return set;
  }, [waveIdx]);

  // Lines: accumulate all newLines from wave 0..waveIdx
  const visibleLineKeys = useMemo(() => {
    const items: { key: string; line: ConnectionLine; waveSpawned: number }[] = [];
    for (let w = 0; w <= waveIdx; w++) {
      WAVES[w].newLines.forEach((line, i) => {
        items.push({ key: `w${w}-${i}`, line, waveSpawned: w });
      });
    }
    return items;
  }, [waveIdx]);

  // Map zoom: stays close on France early, gradually pulls back to whole world.
  const mapScale = useTransform(progress, [0, 0.10, 0.40, 0.70, 1.0], [2.0, 2.0, 1.5, 1.15, 1.0]);

  // Make ComposableMap fill the wrapper (preserveAspectRatio slice)
  useLayoutEffect(() => {
    if (!ref.current) return;
    const apply = () => {
      ref.current?.querySelectorAll('svg').forEach(svg => {
        svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        svg.style.display = 'block';
        svg.style.width = '100%';
        svg.style.height = '100%';
      });
    };
    apply();
    const obs = new MutationObserver(apply);
    if (ref.current) obs.observe(ref.current, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [mounted]);

  if (!mounted) return null;

  const startingIso = STARTING_WINE.isoNumeric;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 1.0, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(196,30,58,0.10) 0%, transparent 65%), #08051A',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <motion.div
        ref={ref}
        style={{
          width: '100%',
          height: '100%',
          scale: mapScale,
          transformOrigin: `${ORIGIN_X_PCT}% ${ORIGIN_Y_PCT}%`,
        }}
      >
        <ComposableMap
          projection="geoEquirectangular"
          projectionConfig={{ scale: 220, center: [10, 22] }}
          width={1600}
          height={900}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <Geographies geography="/world-110m.json">
            {({ geographies }) =>
              geographies.map(geo => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const id = String((geo as any).id).padStart(3, '0');
                const isStart = id === startingIso;
                const isActive = activeIsos.has(id);
                const fill = isStart && isActive
                  ? COUNTRY_FILL_HIGHLIGHT
                  : isActive
                    ? COUNTRY_FILL_ACTIVE
                    : COUNTRY_FILL_INACTIVE;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill,
                        stroke: COUNTRY_STROKE,
                        strokeWidth: 0.4,
                        outline: 'none',
                        transition: 'fill 700ms cubic-bezier(0.4, 0, 0.2, 1)',
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        vectorEffect: 'non-scaling-stroke' as any,
                      },
                      hover: { fill, stroke: COUNTRY_STROKE, strokeWidth: 0.4, outline: 'none' },
                      pressed: { fill, stroke: COUNTRY_STROKE, strokeWidth: 0.4, outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Neural-link connection lines */}
          <AnimatePresence>
            {visibleLineKeys.map(({ key, line, waveSpawned }, idx) => {
              // Lines spawned in this wave have a draw-in delay; older lines render fully drawn.
              const delay = waveSpawned === waveIdx ? idx * 0.18 : 0;
              return (
                <motion.g
                  key={key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay, ease: 'easeOut' }}
                >
                  <Line
                    from={line.from}
                    to={line.to}
                    stroke="#C9A84C"
                    strokeWidth={1.4}
                    strokeOpacity={0.92}
                    fill="none"
                    style={{
                      filter: 'drop-shadow(0 0 5px rgba(201,168,76,0.85)) drop-shadow(0 0 12px rgba(201,168,76,0.45))',
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      vectorEffect: 'non-scaling-stroke' as any,
                    }}
                  />
                </motion.g>
              );
            })}
          </AnimatePresence>
        </ComposableMap>
      </motion.div>

      {/* Bottom darken gradient so the recommendation card pops */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(4,1,10,0.55) 0%, rgba(4,1,10,0.10) 28%, rgba(4,1,10,0.10) 60%, rgba(4,1,10,0.85) 100%)',
      }} />
    </motion.div>
  );
}

function StartHintPill({ progress, text }: { progress: MotionValue<number>; text: string }) {
  const opacity = useTransform(progress, [0, 0.10, 0.36, 0.50], [0, 1, 1, 0]);
  return (
    <motion.div
      style={{
        opacity,
        position: 'absolute',
        top: 'clamp(110px, 16vh, 160px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(212,32,64,0.18)',
        border: '1px solid rgba(212,32,64,0.45)',
        color: '#F5F0E8',
        padding: '8px 18px',
        borderRadius: 999,
        fontSize: 12,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 6,
        pointerEvents: 'none',
      }}
    >
      {text}
    </motion.div>
  );
}

function RecommendationCard({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.78, 0.92], [0, 1]);
  const y = useTransform(progress, [0.78, 0.96], [28, 0]);
  const wine = RECOMMENDED_WINES[1]; // Chianti Classico
  return (
    <motion.div
      style={{
        opacity,
        y,
        position: 'absolute',
        bottom: 'clamp(56px, 10vh, 96px)',
        left: '50%',
        x: '-50%',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'rgba(12,4,24,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(201,168,76,0.35)',
        borderRadius: 16,
        padding: '14px 22px 14px 16px',
        boxShadow: '0 14px 50px rgba(0,0,0,0.65)',
        pointerEvents: 'none',
        zIndex: 7,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 25%, rgba(245,240,232,0.10), rgba(0,0,0,0.55))',
          border: '1px solid rgba(201,168,76,0.32)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <WineBottleSilhouette wine={wine} width={32} height={70} uidSuffix="card" />
      </div>
      <div>
        <div style={{
          fontSize: 9,
          letterSpacing: '0.14em',
          color: '#C9A84C',
          textTransform: 'uppercase',
          marginBottom: 3,
        }}>
          {wine.country} · {wine.region}
        </div>
        <div style={{
          fontFamily: 'Georgia, serif',
          fontSize: 16,
          color: '#F5F0E8',
          marginBottom: 4,
        }}>
          {wine.name}
        </div>
        <div style={{
          fontSize: 11,
          color: '#9B8B7A',
        }}>
          {wine.styleHint} · <span style={{ color: '#C9A84C', fontWeight: 700 }}>{formatKrw(wine.priceKrw)}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────
export default function WineDiscoverySection() {
  const { messages } = useLocale();
  const t = messages.wineDiscovery;
  const outerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end start'],
  });

  // 0 (intro) | 1 (scan) | 2 (recommend) — last step runs to end of section
  useMotionValueEvent(scrollYProgress, 'change', v => {
    setStep(v < 0.12 ? 0 : v < 0.30 ? 1 : 2);
  });

  // Sub-progress 0..1 across step 2 region
  const recProgress = useTransform(scrollYProgress, [0.30, 0.95], [0, 1], { clamp: true });

  return (
    <section
      ref={outerRef}
      style={{
        height: '380vh',
        position: 'relative',
        background: '#04010A',
      }}
    >
      <div style={{
        position: 'sticky', top: 0,
        height: '100vh', overflow: 'hidden',
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(196,30,58,0.05) 0%, transparent 60%), #04010A',
      }}>
        {/* Full-screen wine country map (visible from step 2) */}
        <FullScreenMap progress={recProgress} visible={step === 2} />

        {/* Top header — section label + framing question */}
        <div style={{
          position: 'absolute',
          top: 'clamp(28px, 4vh, 52px)',
          left: '50%', transform: 'translateX(-50%)',
          textAlign: 'center', whiteSpace: 'nowrap',
          zIndex: 9,
        }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.32em',
            color: '#C9A84C', textTransform: 'uppercase',
            opacity: 0.85, marginBottom: 8,
          }}>
            {t.sectionLabel}
          </div>
          <h3 style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(15px, 2.2vw, 20px)',
            fontWeight: 400,
            color: '#F5F0E8',
            lineHeight: 1.3,
            margin: 0,
          }}>
            {t.topQuestion}
          </h3>
        </div>

        {/* Step content (centered, swap on step change) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(80px, 14vh, 140px) 24px clamp(120px, 16vh, 160px)',
          zIndex: 5,
          pointerEvents: 'none',
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                width: '100%',
                maxWidth: 760,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'clamp(16px, 2.5vh, 28px)',
              }}
            >
              {step === 0 && (
                <>
                  <StepHeader title={`${t.step0.title}\n${t.step0.subtitle}`} />
                  <div style={{
                    width: 120, height: 168,
                    background: 'linear-gradient(160deg, rgba(245,240,232,0.32) 0%, rgba(232,221,208,0.28) 100%)',
                    borderRadius: 6,
                    filter: 'blur(2px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    position: 'relative',
                    overflow: 'hidden',
                    transform: 'rotate(-3deg)',
                  }}>
                    <div style={{
                      position: 'absolute', top: '40%',
                      left: '20%', right: '20%', height: 1,
                      background: 'rgba(139,26,42,0.5)',
                    }} />
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <StepHeader
                    label={t.step1.label}
                    title={t.step1.title}
                    body={t.step1.body}
                  />
                  <ScanPanel />
                </>
              )}

              {step === 2 && (
                <StepHeader
                  label={t.step2.label}
                  title={t.step2.title}
                  body={t.step2.body}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step 2 floating layers */}
        {step === 2 && (
          <>
            <StartHintPill progress={recProgress} text={t.step2.startHint} />
            <RecommendationCard progress={recProgress} />
          </>
        )}

        {/* Step indicator dots — left center */}
        <div style={{
          position: 'absolute',
          left: 'clamp(16px, 3vw, 32px)',
          top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
          zIndex: 9,
        }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} style={{
              width: 5,
              height: i === step ? 20 : 5,
              borderRadius: 3,
              background: i === step ? '#C9A84C' : 'rgba(255,255,255,0.18)',
              transition: 'all 320ms cubic-bezier(0.4,0,0.2,1)',
            }} />
          ))}
        </div>

        {/* Scroll hint — visible until step 2 */}
        <AnimatePresence>
          {step < 2 && (
            <motion.div
              key="scroll-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: step === 0 ? 0.6 : 0 }}
              style={{
                position: 'absolute',
                bottom: 'clamp(28px, 4.5vh, 48px)',
                left: '50%', transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                pointerEvents: 'none',
                zIndex: 8,
              }}
            >
              <span style={{
                fontSize: 11, color: 'rgba(255,255,255,0.55)',
                letterSpacing: '0.06em', whiteSpace: 'nowrap',
              }}>
                스크롤 해보세요
              </span>
              <span style={{
                fontSize: 9, color: 'rgba(255,255,255,0.28)',
                letterSpacing: '0.14em', textTransform: 'uppercase' as const,
              }}>
                scroll down
              </span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ marginTop: 4 }}
              >
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                  <path d="M1 1.5L8 8.5L15 1.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
