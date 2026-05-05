'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent, useTransform } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const GEO_URL = '/world-50m.json';

// ── Wine region data ────────────────────────────────────────────────────────
interface WineRegion {
  name: string;
  coords: [number, number];
  r: number;
  opacity: number;
  color: string;
  textColor: string;
  textSize: number;
  anchor: 'start' | 'end' | 'middle';
  tx: number; // text x offset from circle edge
  ty: number; // text y offset
  featured?: boolean; // Meursault etc.
}

const MAJOR_REGIONS: WineRegion[] = [
  { name: 'Bordeaux',        coords: [-0.57, 44.84], r: 28, opacity: 0.88, color: '#C41E3A', textColor: '#F5F0E8', textSize: 12, anchor: 'end',   tx: -32, ty: 4, },
  { name: 'Champagne',       coords: [4.03,  49.05], r: 22, opacity: 0.72, color: '#C41E3A', textColor: '#F5F0E8', textSize: 12, anchor: 'start', tx:  26, ty: 4, },
  { name: 'Bourgogne',       coords: [4.83,  47.15], r: 20, opacity: 0.85, color: '#C41E3A', textColor: '#F5F0E8', textSize: 12, anchor: 'start', tx:  24, ty: 4, },
  { name: 'Val. de la Loire',coords: [-0.70, 47.40], r: 22, opacity: 0.65, color: '#C41E3A', textColor: '#F5F0E8', textSize: 12, anchor: 'end',   tx: -26, ty: 4, },
  { name: 'Côtes du Rhône',  coords: [4.77,  44.95], r: 18, opacity: 0.74, color: '#C41E3A', textColor: '#F5F0E8', textSize: 12, anchor: 'start', tx:  22, ty: 4, },
];

const SUB_REGIONS: WineRegion[] = [
  // Burgundy sub-regions
  { name: 'Chablis',             coords: [3.80,  47.82], r: 9,  opacity: 0.78, color: '#C9A84C', textColor: '#E8C97A', textSize: 8.5, anchor: 'start', tx: 12, ty: 3, },
  { name: 'Gevrey-Chambertin',   coords: [4.955, 47.23], r: 7,  opacity: 0.92, color: '#C9A84C', textColor: '#E8C97A', textSize: 7.5, anchor: 'start', tx: 10, ty: 3, },
  { name: 'Vosne-Romanée',       coords: [4.95,  47.16], r: 6,  opacity: 0.90, color: '#C9A84C', textColor: '#E8C97A', textSize: 7,   anchor: 'start', tx: 10, ty: 3, },
  { name: 'Meursault',           coords: [4.76,  47.00], r: 9,  opacity: 1.00, color: '#E8C97A', textColor: '#E8C97A', textSize: 9,   anchor: 'end',   tx: -12, ty: 3, featured: true },
  { name: 'Puligny-Montrachet',  coords: [4.75,  46.94], r: 6,  opacity: 0.88, color: '#C9A84C', textColor: '#E8C97A', textSize: 7,   anchor: 'end',   tx: -10, ty: 3, },
  { name: 'Beaujolais',          coords: [4.55,  46.10], r: 12, opacity: 0.60, color: '#C9A84C', textColor: '#E8C97A', textSize: 8.5, anchor: 'start', tx: 15, ty: 3, },
  // Other regions
  { name: 'Sancerre',            coords: [2.83,  47.33], r: 8,  opacity: 0.74, color: '#C9A84C', textColor: '#E8C97A', textSize: 8,   anchor: 'start', tx: 11, ty: 3, },
  { name: 'Alsace',              coords: [7.45,  48.25], r: 11, opacity: 0.68, color: '#C9A84C', textColor: '#E8C97A', textSize: 8.5, anchor: 'start', tx: 14, ty: 3, },
  { name: 'Languedoc',           coords: [3.10,  43.65], r: 17, opacity: 0.62, color: '#C9A84C', textColor: '#E8C97A', textSize: 8.5, anchor: 'end',   tx: -20, ty: 3, },
  { name: 'Provence',            coords: [5.80,  43.55], r: 15, opacity: 0.64, color: '#C9A84C', textColor: '#E8C97A', textSize: 8.5, anchor: 'start', tx: 18, ty: 3, },
];

// ── Region marker ───────────────────────────────────────────────────────────
function RegionMarker({ region, visible }: { region: WineRegion; visible: boolean }) {
  return (
    <Marker coordinates={region.coords}>
      <motion.g
        initial={{ opacity: 0, scale: 0.4 }}
        animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
        transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Glow ring for featured */}
        {region.featured && (
          <circle
            r={region.r + 5}
            fill="none"
            stroke={region.color}
            strokeWidth={1}
            opacity={0.35}
          />
        )}
        {/* Main dot */}
        <circle r={region.r} fill={region.color} fillOpacity={region.opacity} />

        {/* Label with outline for readability */}
        <text
          textAnchor={region.anchor}
          x={region.anchor === 'end' ? -(region.r + 4) : region.r + 4}
          y={region.ty}
          style={{
            fill: region.textColor,
            fontSize: region.textSize,
            fontFamily: 'Inter, -apple-system, sans-serif',
            fontWeight: region.featured ? 700 : 600,
            paintOrder: 'stroke fill',
            stroke: '#05020A',
            strokeWidth: 2.5,
            strokeLinejoin: 'round',
          } as React.CSSProperties}
        >
          {region.featured ? `✦ ${region.name}` : region.name}
        </text>
      </motion.g>
    </Marker>
  );
}

// ── Scroll progress pill ────────────────────────────────────────────────────
function ScrollPill({ progress }: { progress: number }) {
  const steps = ['지도 등장', '주요 산지', '세부 아펠라시옹'];
  const stage = progress < 0.28 ? 0 : progress < 0.55 ? 1 : 2;

  return (
    <div style={{
      position: 'absolute',
      bottom: 28,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      zIndex: 20,
    }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 20,
            background: stage === i ? 'rgba(196,30,58,0.2)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${stage === i ? 'rgba(196,30,58,0.4)' : 'rgba(255,255,255,0.08)'}`,
            transition: 'all 400ms ease',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: stage === i ? '#C41E3A' : '#4A3D56',
              transition: 'background 400ms ease',
            }} />
            <span style={{ fontSize: 10, color: stage === i ? '#F5F0E8' : '#4A3D56', transition: 'color 400ms', whiteSpace: 'nowrap' }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: 16, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main section ────────────────────────────────────────────────────────────
export default function FranceWineSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Track progress in state for render logic
  useMotionValueEvent(scrollYProgress, 'change', (v) => setProgress(v));

  // --- Derived animation values ---
  const mapOpacity   = useTransform(scrollYProgress, [0.00, 0.12], [0, 1]);
  const mapScale     = useTransform(scrollYProgress, [0.00, 0.12], [0.93, 1]);
  const titleOpacity = useTransform(scrollYProgress, [0.00, 0.10, 0.85, 0.95], [0, 1, 1, 0]);

  // How many major regions are visible (0-5, staggered)
  const majorVisible = Math.max(0, Math.min(5, Math.floor((progress - 0.20) * 25)));

  // How many sub-regions are visible (0-10, staggered)
  const subVisible = Math.max(0, Math.min(SUB_REGIONS.length, Math.floor((progress - 0.50) * 35)));

  return (
    /* Scroll container — 280vh of scroll space */
    <div ref={ref} style={{ height: '280vh', position: 'relative' }}>

      {/* Sticky viewport */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        background: '#04010A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>

        {/* Section title */}
        <motion.div
          style={{ position: 'absolute', top: 'clamp(24px,4vh,48px)', textAlign: 'center', zIndex: 10, opacity: titleOpacity }}
        >
          <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 10 }}>
            Zoom In · 지역 탐험
          </div>
          <h2 style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(22px, 3.5vw, 38px)',
            fontWeight: 400,
            color: '#F5F0E8',
            lineHeight: 1.2,
          }}>
            프랑스 와인 산지
          </h2>
        </motion.div>

        {/* France map */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: mapOpacity,
            scale: mapScale,
          }}
        >
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ center: [2.2, 46.4], scale: 2100 }}
            width={800}
            height={900}
            style={{ width: '100%', height: '100%' }}
          >
            {/* France fill + border */}
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .filter((geo) => String((geo as any).id).padStart(3, '0') === '250')
                  .map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: { fill: '#1A0830', stroke: '#4A1A70', strokeWidth: 1.5, outline: 'none' },
                        hover:   { fill: '#1A0830', stroke: '#4A1A70', strokeWidth: 1.5, outline: 'none' },
                        pressed: { fill: '#1A0830', stroke: '#4A1A70', strokeWidth: 1.5, outline: 'none' },
                      }}
                    />
                  ))
              }
            </Geographies>

            {/* Major wine regions (Phase 1) */}
            {MAJOR_REGIONS.map((region, i) => (
              <RegionMarker key={region.name} region={region} visible={i < majorVisible} />
            ))}

            {/* Sub-regions / appellations (Phase 2) */}
            {SUB_REGIONS.map((region, i) => (
              <RegionMarker key={region.name} region={region} visible={i < subVisible} />
            ))}
          </ComposableMap>
        </motion.div>

        {/* Gradient vignette edges */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 90% 85% at 50% 55%, transparent 55%, rgba(4,1,10,0.92) 100%)',
          pointerEvents: 'none',
          zIndex: 5,
        }} />

        {/* Left/right fades */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(4,1,10,0.7) 0%, transparent 20%, transparent 80%, rgba(4,1,10,0.7) 100%)',
          pointerEvents: 'none', zIndex: 5,
        }} />

        {/* Info card — appears with sub-regions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={subVisible >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            bottom: 'clamp(70px,10vh,100px)',
            right: 'clamp(16px,5vw,60px)',
            width: 'clamp(160px,22vw,220px)',
            background: 'rgba(10,2,20,0.85)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 12,
            padding: '14px 18px',
            zIndex: 20,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 8 }}>
            Côte de Beaune
          </div>
          <div style={{
            fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 400,
            color: '#F5F0E8', marginBottom: 6,
          }}>
            ✦ Meursault
          </div>
          <div style={{ fontSize: 11, color: '#9B8B7A', lineHeight: 1.6 }}>
            Chardonnay 100%<br />
            AOC Côte de Beaune<br />
            <span style={{ color: '#C9A84C' }}>프리미에 크뤼 · 그랑 크뤼</span>
          </div>
        </motion.div>

        {/* Scroll progress pills */}
        <ScrollPill progress={progress} />
      </div>
    </div>
  );
}
