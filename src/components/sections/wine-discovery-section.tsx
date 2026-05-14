'use client';

import { useRef, useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, MotionValue } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Line, Marker, ZoomableGroup } from 'react-simple-maps';
import { useLocale } from '@/components/providers/locale-provider';
import { ScanPanel } from './features-section';
import { STARTING_WINE, ALL_WINES, formatKrw, type RecommendedWine } from '@/lib/recommended-wines';
import { Bottle, BOTTLE_PRESETS, type BottleShape } from '@/components/wine-bottles/wine-bottle';

const TOTAL_STEPS = 2; // 0 scan, 1 recommend

// Decorative variety bottles placed on the world map to show wine type diversity.
// These are pure visual accents — not part of the recommendation flow.
const VARIETY_BOTTLES: Array<{
  id: string;
  coords: [number, number];
  preset: keyof typeof BOTTLE_PRESETS;
}> = [
  { id: 'variety-alsace',    coords: [7.74,  48.30], preset: 'white-alsace' },        // White
  { id: 'variety-provence',  coords: [6.20,  43.40], preset: 'rose-provence' },       // Rosé
  { id: 'variety-champagne', coords: [4.10,  49.05], preset: 'sparkling-champagne' }, // Sparkling
];

function StepHeader({ label, title, body }: { label?: string; title: string; body?: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 'clamp(20px, 3vh, 36px)' }}>
      {label && (
        <div style={{
          fontSize: 10,
          letterSpacing: '0.28em',
          color: 'var(--color-gold)',
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
        color: 'var(--color-text-primary)',
        lineHeight: 1.2,
        marginBottom: body ? 14 : 0,
        whiteSpace: 'pre-line',
      }}>
        {title}
      </h2>
      {body && (
        <p style={{
          fontSize: 'clamp(13px, 1.5vw, 15px)',
          color: 'var(--color-text-muted)',
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

// ── WineBottleSilhouette: adapter that maps RecommendedWine → new Bottle component ─
// Uses presets from wine-bottles/wine-bottle.tsx with per-wine overrides for color/label/vintage.
const WINE_TYPE_TO_SHAPE: Record<RecommendedWine['wineType'], BottleShape> = {
  red:    'bordeaux',
  white:  'burgundy',
  'rosé': 'burgundy',
};

const WINE_TYPE_LABEL_BG: Record<RecommendedWine['wineType'], string> = {
  red:    'var(--color-text-primary)',
  white:  'var(--color-text-primary)',
  'rosé': 'var(--color-text-primary)',
};

const WINE_TYPE_LABEL_FG: Record<RecommendedWine['wineType'], string> = {
  red:    '#3a1a20',
  white:  '#1a3a1a',
  'rosé': '#7a3a3a',
};

function WineBottleSilhouette({
  wine,
  width = 44,
  height = 105,
}: {
  wine: RecommendedWine;
  width?: number;
  height?: number;
  /** @deprecated kept for call-site compatibility; ignored — useId provides uniqueness. */
  uidSuffix?: string;
}) {
  const shape = WINE_TYPE_TO_SHAPE[wine.wineType];
  const vintageStr = wine.vintage > 0 ? String(wine.vintage) : 'NV';
  const region = `${wine.appellation} · ${vintageStr}`;
  return (
    <Bottle
      shape={shape}
      style="detailed"
      glass={wine.bottleColor}
      liquid={wine.bottleColor}
      foil={shape === 'bordeaux' ? '#5C0E1C' : 'var(--color-wine-red)'}
      label={WINE_TYPE_LABEL_BG[wine.wineType]}
      labelText={WINE_TYPE_LABEL_FG[wine.wineType]}
      typeName={wine.label}
      region={region}
      ornament="crest"
      width={width}
      height={height}
    />
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

const COUNTRY_FILL_ACTIVE = 'var(--color-wine-red)';
const COUNTRY_FILL_HIGHLIGHT = '#C41E3A';
const COUNTRY_FILL_INACTIVE = 'var(--color-map-inactive)';
const COUNTRY_STROKE = 'var(--color-map-stroke)';

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
      stroke="var(--color-gold)"
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

        {/* Decorative variety bottles — Red/White/Rosé/Sparkling diversity on the map. */}
        {VARIETY_BOTTLES.map((b, idx) => {
          const decoScale = Math.max(0.35, 0.85 / Math.max(zoom, 1));
          const w = pinW * decoScale;
          const h = pinH * decoScale;
          return (
            <Marker key={b.id} coordinates={b.coords}>
              <motion.g
                initial={{ opacity: 0, y: -8, scale: 0.6 }}
                animate={{ opacity: 0.92, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 + idx * 0.12, ease: 'easeOut' }}
                style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }}
              >
                <g transform={`translate(${-w / 2}, ${-h})`}>
                  <Bottle {...BOTTLE_PRESETS[b.preset]} width={w} height={h} />
                </g>
              </motion.g>
            </Marker>
          );
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
        background: 'var(--color-map-bg)',
        // Map is a passive backdrop — page scroll passes through unimpeded.
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div ref={ref} style={{ width: '100%', height: '100%' }}>
        <MapContent {...mapProps} />
      </div>
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
        fontSize: 11, color: 'var(--overlay-strong)',
        letterSpacing: '0.06em', whiteSpace: 'nowrap',
      }}>
        {text}
      </span>
      <span style={{
        fontSize: 9, color: 'var(--overlay-strong)',
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
          <path d="M1 1.5L8 8.5L15 1.5" stroke="var(--overlay-strong)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
        color: 'var(--color-text-primary)',
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
    <>
    <style>{`
      .rec-bottle-disc {
        background: radial-gradient(circle at 30% 25%, rgba(42,31,18,0.04), rgba(42,31,18,0.10));
      }
      @media (prefers-color-scheme: dark) {
        .rec-bottle-disc {
          background: radial-gradient(circle at 30% 25%, rgba(245,240,232,0.10), rgba(0,0,0,0.55));
        }
      }
    `}</style>
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
        // Surface token + gold border keeps the card readable in both modes.
        // Previously hard-coded rgba(12,4,24,0.94) which stayed deep-purple on light
        // background. The surface token resolves to cream in light, deep purple in dark.
        background: 'var(--color-bg-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(201,168,76,0.40)',
        borderRadius: 16,
        padding: '16px 24px 16px 18px',
        boxShadow: '0 14px 50px rgba(0,0,0,0.35), 0 0 30px rgba(201,168,76,0.12)',
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
            className="rec-bottle-disc"
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
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
              color: 'var(--color-gold)',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 6,
            }}>
              {cardLabel}
            </div>
            <div style={{
              fontFamily: 'Georgia, serif',
              fontSize: 18,
              color: 'var(--color-text-primary)',
              marginBottom: 4,
              lineHeight: 1.2,
            }}>
              {wine.name}
            </div>
            <div style={{
              fontSize: 13,
              color: 'var(--color-text-secondary)',
            }}>
              {wine.country[locale]} · <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>{formatKrw(wine.priceKrw)}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
    </>
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
    setStep(v < 0.20 ? 0 : 1);
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
        background: 'var(--color-map-bg)',
      }}
    >
      <div style={{
        position: 'sticky', top: 0,
        height: '100vh', overflow: 'hidden',
        background: 'var(--color-map-bg)',
      }}>
        <FullScreenMap progress={recProgress} visible={step === 1} />

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
            color: 'var(--color-gold)', textTransform: 'uppercase',
            opacity: 0.85, marginBottom: 8,
          }}>
            {t.sectionLabel}
          </div>
          <h3 style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(15px, 2.2vw, 20px)',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
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
                  <StepHeader
                    label={t.step1.label}
                    title={t.step1.title}
                    body={t.step1.body}
                  />
                  <ScanPanel />
                </>
              )}

              {step === 1 && (
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

        {step === 1 && (
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
              background: i === step ? 'var(--color-gold)' : 'var(--overlay-medium)',
              transition: 'all 320ms cubic-bezier(0.4,0,0.2,1)',
            }} />
          ))}
        </div>

        <AnimatePresence>
          {step < 1 && (
            <motion.div
              key="scroll-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
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
                fontSize: 11, color: 'var(--overlay-strong)',
                letterSpacing: '0.06em', whiteSpace: 'nowrap',
              }}>
                {t.scrollHint}
              </span>
              <span style={{
                fontSize: 9, color: 'var(--overlay-strong)',
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
                  <path d="M1 1.5L8 8.5L15 1.5" stroke="var(--overlay-strong)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
