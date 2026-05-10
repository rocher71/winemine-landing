'use client';

import { useRef, useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, MotionValue } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Line, Marker, ZoomableGroup } from 'react-simple-maps';
import { useLocale } from '@/components/providers/locale-provider';
import { ScanPanel } from './features-section';
import { STARTING_WINE, ALL_WINES, formatKrw, type RecommendedWine } from '@/lib/recommended-wines';

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

// ── Wave model — all reveal fast at the start ────────────────────────────
type ConnectionLine = { from: [number, number]; to: [number, number] };
type Wave = {
  isos: string[];
  pinIds: string[];
  newLines: ConnectionLine[];
};

const FRANCE: [number, number] = STARTING_WINE.coords;
const ITALY_HUB: [number, number] = [12.5, 41.9];

const WAVES: Wave[] = [
  {
    isos: ['250'],
    pinIds: ['bdx-margaux'],
    newLines: [],
  },
  {
    isos: ['250', '380', '724'],
    pinIds: ['chianti', 'rioja'],
    newLines: [
      { from: FRANCE, to: [12.5, 41.9] },
      { from: FRANCE, to: [-3.7, 40.4] },
    ],
  },
  {
    // NZ removed entirely — no pin, no line, no active fill.
    isos: ['250', '380', '724', '152', '032', '036', '840'],
    pinIds: ['casillero', 'mendoza', 'jacobs', 'napa-cab'],
    newLines: [
      { from: ITALY_HUB, to: [-70.66, -33.45] },
      { from: ITALY_HUB, to: [-68.85, -32.89] },
      { from: ITALY_HUB, to: [138.6, -34.93] },
      { from: ITALY_HUB, to: [-122.27, 38.30] },
    ],
  },
];

// All waves trigger within the first 8% so neural-link extends quickly,
// then the camera tour runs from 0.10 onward.
const WAVE_THRESHOLDS = [0.0, 0.03, 0.06];

const COUNTRY_FILL_ACTIVE = '#8B1A2A';
const COUNTRY_FILL_HIGHLIGHT = '#C41E3A';
const COUNTRY_FILL_INACTIVE = '#1A0A2E';
const COUNTRY_STROKE = '#2A0C58';

const LINE_DRAW_DURATION = 0.55; // fast simultaneous draw
const LINE_DRAW_STAGGER = 0;

function ConnectionLineDrawing({ line, delay }: { line: ConnectionLine; delay: number }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), Math.max(0, delay * 1000) + 16);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <Line
      from={line.from}
      to={line.to}
      stroke="#C9A84C"
      strokeWidth={1.4}
      fill="none"
      style={{
        strokeDasharray: 800,
        strokeDashoffset: drawn ? 0 : 800,
        opacity: drawn ? 0.95 : 0,
        transition: `stroke-dashoffset ${LINE_DRAW_DURATION}s ease-out, opacity 0.3s ease-out`,
        filter: 'drop-shadow(0 0 5px rgba(201,168,76,0.85)) drop-shadow(0 0 12px rgba(201,168,76,0.45))',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vectorEffect: 'non-scaling-stroke' as any,
      }}
    />
  );
}

// ── Camera tour ──────────────────────────────────────────────────────────
// Two-stop tour: hold tight on France while the neural-link extends, then
// zoom out to a wide world view so every reached region is visible at once.
// No more country-by-country zoom-ins — just France → world.
type TourStop = { wine: RecommendedWine; coord: [number, number]; zoom: number };

const wineById = (id: string): RecommendedWine =>
  ALL_WINES.find(w => w.id === id) as RecommendedWine;

// Mobile screens get a much wider world view because slice-cropping eats most
// of the SVG horizontally. Desktop already shows the full 16:9 SVG.
const getTourStops = (isMobile: boolean): TourStop[] => [
  // Open on France (Bordeaux) — origin of the neural-link.
  { wine: wineById('chianti'),  coord: STARTING_WINE.coords, zoom: 3.5 },
  // Zoom out to the world — all reached regions visible in one frame.
  { wine: wineById('napa-cab'), coord: [10, 22],             zoom: isMobile ? 0.4 : 0.85 },
];

// Wine sequence is viewport-independent — used by RecommendationCard.
const TOUR_STOPS = getTourStops(false);

const TOUR_START = 0.10; // before this, hold on stop 0 + lines drawing
const TOUR_END   = 0.85; // last stop reached here, then hold until 1.0 (dwell time)

// Build keyframe arrays for useTransform — hold start, linear transition to end, hold end.
function buildTour(stops: TourStop[]) {
  const inputs: number[] = [0];
  const lons: number[]   = [stops[0].coord[0]];
  const lats: number[]   = [stops[0].coord[1]];
  const zooms: number[]  = [stops[0].zoom];

  // Hold on the opening stop until TOUR_START so the neural-link can draw.
  inputs.push(TOUR_START);
  lons.push(stops[0].coord[0]);
  lats.push(stops[0].coord[1]);
  zooms.push(stops[0].zoom);

  const span = TOUR_END - TOUR_START;
  const segLen = span / Math.max(1, stops.length - 1);

  for (let i = 1; i < stops.length; i++) {
    const curr = stops[i];
    const arriveT = TOUR_START + i * segLen;
    inputs.push(arriveT);
    lons.push(curr.coord[0]);
    lats.push(curr.coord[1]);
    zooms.push(curr.zoom);
  }

  // Hold the final stop until the section end (dwell time).
  const last = stops[stops.length - 1];
  inputs.push(1.0);
  lons.push(last.coord[0]);
  lats.push(last.coord[1]);
  zooms.push(last.zoom);

  return { inputs, lons, lats, zooms };
}


// ── Map content — controlled ZoomableGroup, no user input ─────────────────
type MapContentProps = {
  activeIsos: Set<string>;
  visibleLineKeys: { key: string; line: ConnectionLine; waveSpawned: number }[];
  visiblePins: { wine: RecommendedWine; waveSpawned: number; orderInWave: number }[];
  waveIdx: number;
  pinW: number;
  pinH: number;
  startingIso: string;
  zoom: number;
  center: [number, number];
};

function MapContent({
  activeIsos,
  visibleLineKeys,
  visiblePins,
  waveIdx,
  pinW,
  pinH,
  startingIso,
  zoom,
  center,
}: MapContentProps) {
  return (
    <ComposableMap
      projection="geoEquirectangular"
      projectionConfig={{ scale: 200, center: [10, 22] }}
      width={1600}
      height={900}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <ZoomableGroup
        zoom={zoom}
        center={center}
        minZoom={0.3}
        maxZoom={10}
        // Disable all user input — camera is fully scroll-driven.
        filterZoomEvent={() => false}
        disablePanning
        disableZooming
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

        {visibleLineKeys.map(({ key, line, waveSpawned }, idx) => {
          const delay = waveSpawned === waveIdx ? idx * LINE_DRAW_STAGGER : 0;
          return <ConnectionLineDrawing key={key} line={line} delay={delay} />;
        })}

        {visiblePins.map(({ wine, waveSpawned, orderInWave }) => {
          const delay = waveSpawned === waveIdx ? 0.05 + orderInWave * 0.05 : 0;
          const isStart = wine.id === STARTING_WINE.id;
          // Pin sizes scale inversely with zoom so they stay visually consistent.
          const pinScale = Math.max(0.45, 1 / Math.max(zoom, 1));
          return (
            <Marker key={wine.id} coordinates={wine.coords}>
              <motion.g
                initial={{ opacity: 0, y: -10, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, delay, ease: 'easeOut' }}
                style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }}
              >
                {isStart && (
                  <circle
                    cx={0}
                    cy={(-pinH * pinScale) / 2}
                    r={pinW * pinScale * 1.2}
                    fill="rgba(212,32,64,0.30)"
                    style={{ filter: 'blur(3px)' }}
                  />
                )}
                <g transform={`translate(${(-pinW * pinScale) / 2}, ${-pinH * pinScale})`}>
                  <WineBottleSilhouette
                    wine={wine}
                    width={pinW * pinScale}
                    height={pinH * pinScale}
                    uidSuffix={`pin-${wine.id}`}
                  />
                </g>
              </motion.g>
            </Marker>
          );
        })}
      </ZoomableGroup>
    </ComposableMap>
  );
}

function FullScreenMap({ progress, visible }: { progress: MotionValue<number>; visible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [waveIdx, setWaveIdx] = useState(-1);

  // Camera state driven by scroll progress. Tour stops depend on viewport
  // because mobile slice-cropping needs a much wider final world view.
  const tourKF = useMemo(() => buildTour(getTourStops(isMobile)), [isMobile]);
  const lonMV  = useTransform(progress, tourKF.inputs, tourKF.lons);
  const latMV  = useTransform(progress, tourKF.inputs, tourKF.lats);
  const zoomMV = useTransform(progress, tourKF.inputs, tourKF.zooms);
  const [center, setCenter] = useState<[number, number]>([tourKF.lons[0], tourKF.lats[0]]);
  const [zoom, setZoom] = useState<number>(tourKF.zooms[0]);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useMotionValueEvent(progress, 'change', v => {
    let next = -1;
    for (let i = 0; i < WAVES.length; i++) {
      if (v >= WAVE_THRESHOLDS[i]) next = i;
    }
    setWaveIdx(next);
  });

  useMotionValueEvent(lonMV, 'change', v => setCenter(c => (c[0] === v ? c : [v, c[1]])));
  useMotionValueEvent(latMV, 'change', v => setCenter(c => (c[1] === v ? c : [c[0], v])));
  useMotionValueEvent(zoomMV, 'change', v => setZoom(prev => (prev === v ? prev : v)));

  const activeIsos = useMemo(() => {
    const set = new Set<string>();
    if (waveIdx >= 0) WAVES[waveIdx].isos.forEach(iso => set.add(iso));
    return set;
  }, [waveIdx]);

  const visibleLineKeys = useMemo(() => {
    const items: { key: string; line: ConnectionLine; waveSpawned: number }[] = [];
    for (let w = 0; w <= waveIdx; w++) {
      WAVES[w].newLines.forEach((line, i) => {
        items.push({ key: `w${w}-${i}`, line, waveSpawned: w });
      });
    }
    return items;
  }, [waveIdx]);

  const visiblePins = useMemo(() => {
    const items: { wine: RecommendedWine; waveSpawned: number; orderInWave: number }[] = [];
    for (let w = 0; w <= waveIdx; w++) {
      WAVES[w].pinIds.forEach((id, i) => {
        const wine = ALL_WINES.find(x => x.id === id);
        if (wine) items.push({ wine, waveSpawned: w, orderInWave: i });
      });
    }
    return items;
  }, [waveIdx]);

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
  const pinW = isMobile ? 26 : 30;
  const pinH = isMobile ? 60 : 72;

  const mapProps: MapContentProps = {
    activeIsos,
    visibleLineKeys,
    visiblePins,
    waveIdx,
    pinW,
    pinH,
    startingIso,
    zoom,
    center,
  };

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
        // Map is a passive backdrop — page scroll passes through unimpeded.
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div ref={ref} style={{ width: '100%', height: '100%' }}>
        <MapContent {...mapProps} />
      </div>

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(4,1,10,0.55) 0%, rgba(4,1,10,0.10) 28%, rgba(4,1,10,0.10) 60%, rgba(4,1,10,0.85) 100%)',
      }} />
    </motion.div>
  );
}

// Bottom-center scroll hint shown throughout the cinematic tour, fading out near the end.
function Step2ScrollHint({ progress, text }: { progress: MotionValue<number>; text: string }) {
  const opacity = useTransform(progress, [0, 0.04, 0.78, 0.90], [0, 1, 1, 0]);
  return (
    <motion.div
      style={{
        opacity,
        position: 'absolute',
        bottom: 'clamp(14px, 2.5vh, 24px)',
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
        {text}
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
  );
}

function StartHintPill({ progress, text }: { progress: MotionValue<number>; text: string }) {
  // Pill shows during initial France close-up, fades as tour starts moving.
  const opacity = useTransform(progress, [0, 0.04, 0.10, 0.16], [0, 1, 1, 0]);
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

// Cards crossfade as the tour moves between stops.
function RecommendationCard({
  progress,
  cardLabel,
}: {
  progress: MotionValue<number>;
  cardLabel: string;
}) {
  const { locale } = useLocale();

  // Card appears once the StartHintPill has faded (around 0.13).
  const cardOpacity = useTransform(progress, [0.13, 0.18], [0, 1]);
  const cardY = useTransform(progress, [0.13, 0.20], [28, 0]);

  // Each tour stop owns one card slot; pick whichever stop the camera is closest to.
  const span = TOUR_END - TOUR_START;
  const segLen = span / Math.max(1, TOUR_STOPS.length - 1);

  const [stopIdx, setStopIdx] = useState(0);
  useMotionValueEvent(progress, 'change', v => {
    const raw = (v - TOUR_START) / segLen;
    const idx = Math.min(TOUR_STOPS.length - 1, Math.max(0, Math.round(raw)));
    setStopIdx(idx);
  });

  const wine = TOUR_STOPS[stopIdx].wine;

  return (
    <motion.div
      style={{
        opacity: cardOpacity,
        y: cardY,
        position: 'absolute',
        bottom: 'clamp(80px, 13vh, 124px)',
        left: '50%',
        x: '-50%',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'rgba(12,4,24,0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(201,168,76,0.40)',
        borderRadius: 16,
        padding: '16px 24px 16px 18px',
        boxShadow: '0 14px 50px rgba(0,0,0,0.65), 0 0 30px rgba(201,168,76,0.12)',
        pointerEvents: 'none',
        zIndex: 7,
        minWidth: 280,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={wine.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{ display: 'flex', alignItems: 'center', gap: 16 }}
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
            <WineBottleSilhouette wine={wine} width={32} height={70} uidSuffix={`card-${wine.id}`} />
          </div>
          <div>
            <div style={{
              fontSize: 10,
              letterSpacing: '0.18em',
              color: '#C9A84C',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 6,
            }}>
              {cardLabel}
            </div>
            <div style={{
              fontFamily: 'Georgia, serif',
              fontSize: 18,
              color: '#F5F0E8',
              marginBottom: 4,
              lineHeight: 1.2,
            }}>
              {wine.name}
            </div>
            <div style={{
              fontSize: 13,
              color: '#D4C5B0',
            }}>
              {wine.country[locale]} · <span style={{ color: '#C9A84C', fontWeight: 700 }}>{formatKrw(wine.priceKrw)}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
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

  useMotionValueEvent(scrollYProgress, 'change', v => {
    setStep(v < 0.08 ? 0 : v < 0.20 ? 1 : 2);
  });

  const recProgress = useTransform(scrollYProgress, [0.20, 0.92], [0, 1], { clamp: true });

  // Late in step 2: top header fades and the step 2 heading rises early
  // so the cinematic tour gets full visual focus.
  const topHeaderOpacity = useTransform(recProgress, [0.04, 0.14], [1, 0]);
  const step2HeaderY = useTransform(recProgress, [0.04, 0.14], [0, -260]);
  const step2HeaderScale = useTransform(recProgress, [0.04, 0.14], [1, 0.78]);

  return (
    <section
      ref={outerRef}
      id="wine-discovery"
      style={{
        height: '600vh',
        position: 'relative',
        background: '#04010A',
      }}
    >
      <div style={{
        position: 'sticky', top: 0,
        height: '100vh', overflow: 'hidden',
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(196,30,58,0.05) 0%, transparent 60%), #04010A',
      }}>
        <FullScreenMap progress={recProgress} visible={step === 2} />

        <motion.div
          style={{
            opacity: topHeaderOpacity,
            position: 'absolute',
            top: 'clamp(28px, 4vh, 52px)',
            left: '50%', transform: 'translateX(-50%)',
            textAlign: 'center', whiteSpace: 'nowrap',
            zIndex: 9,
          }}
        >
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
        </motion.div>

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
                <motion.div
                  style={{
                    y: step2HeaderY,
                    scale: step2HeaderScale,
                    transformOrigin: 'center top',
                    width: '100%',
                  }}
                >
                  <StepHeader
                    label={t.step2.label}
                    title={t.step2.title}
                    body={t.step2.body}
                  />
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {step === 2 && (
          <>
            <StartHintPill progress={recProgress} text={t.step2.startHint} />
            <RecommendationCard progress={recProgress} cardLabel={t.step2.cardLabel} />
            <Step2ScrollHint progress={recProgress} text={t.scrollHint} />
          </>
        )}

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
                {t.scrollHint}
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
