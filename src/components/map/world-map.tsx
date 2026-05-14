'use client';

import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const GEO_URL = '/world-110m.json';

const WINE_REGIONS: Record<string, { opacity: number; fill: string }> = {
  '250': { opacity: 1.00, fill: '#E8253E' }, // France
  '380': { opacity: 0.90, fill: '#D82038' }, // Italy
  '724': { opacity: 0.75, fill: '#CC1C34' }, // Spain
  '840': { opacity: 0.82, fill: '#D42040' }, // USA
  '276': { opacity: 0.60, fill: '#C41E3A' }, // Germany
  '032': { opacity: 0.75, fill: '#CC1C34' }, // Argentina
  '152': { opacity: 0.68, fill: '#C41E3A' }, // Chile
  '620': { opacity: 0.80, fill: '#D42040' }, // Portugal
  '040': { opacity: 0.52, fill: '#C41E3A' }, // Austria
  '554': { opacity: 0.60, fill: '#C41E3A' }, // New Zealand
  '036': { opacity: 0.64, fill: '#CC1C34' }, // Australia
  '710': { opacity: 0.50, fill: '#C41E3A' }, // South Africa
};

function MapInstance() {
  return (
    <ComposableMap
      projection="geoEquirectangular"
      projectionConfig={{ scale: 153, rotate: [-40, 0, 0] }}
      width={960}
      height={500}
      style={{ width: '100%', height: '100%', display: 'block', background: 'var(--color-map-bg)' }}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const geoId = String((geo as any).id).padStart(3, '0');
            const wine = WINE_REGIONS[geoId];

            const fill   = wine ? wine.fill    : 'var(--color-map-inactive)';
            const fillOp = wine ? wine.opacity : 1;
            const stroke = wine ? 'var(--color-map-stroke)' : 'var(--color-map-stroke)';

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: { fill, fillOpacity: fillOp, stroke, strokeWidth: 0.5, outline: 'none' },
                  hover:   { fill, fillOpacity: fillOp, stroke, strokeWidth: 0.5, outline: 'none' },
                  pressed: { fill, fillOpacity: fillOp, stroke, strokeWidth: 0.5, outline: 'none' },
                }}
              />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
}

export default function WorldMap() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'var(--color-map-bg)' }}>
      {/*
        Width = 384vh = 2 × (100vh × 960/500).
        Each 50%-wide child has aspect ratio 960/500 so SVG fills exactly, no cropping.
        The right edge of copy 1 (= Pacific seam at 140°W) meets the left edge of copy 2
        (= same 140°W), so the tiling is seamless over open ocean.
        translateX(-50%) = exactly one copy's width per loop cycle.
      */}
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '384vh',
          animation: 'mapSlideLeft 100s linear infinite',
          willChange: 'transform',
        }}
      >
        <div style={{ width: '50%', height: '100%', flexShrink: 0 }}>
          <MapInstance />
        </div>
        <div style={{ width: '50%', height: '100%', flexShrink: 0 }}>
          <MapInstance />
        </div>
      </div>

      {/* Wine-glow radial gradient overlay — only in dark mode.
          On light mode the wine-red haze reads as a muddy brown smudge over the cream
          base, so we swap to a near-invisible gold warmth that preserves the focal
          composition without dirtying the background. */}
      <div
        className="world-map-glow"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />
      <style>{`
        .world-map-glow {
          background: radial-gradient(ellipse 75% 55% at 50% 58%, rgba(201,168,76,0.06) 0%, rgba(201,168,76,0.03) 45%, transparent 72%);
        }
        @media (prefers-color-scheme: dark) {
          .world-map-glow {
            background: radial-gradient(ellipse 75% 55% at 50% 58%, rgba(220,35,60,0.28) 0%, rgba(140,20,40,0.14) 45%, transparent 72%);
          }
        }
      `}</style>
    </div>
  );
}
