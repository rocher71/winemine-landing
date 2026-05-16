'use client';

import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const GEO_URL = '/world-110m.json';

const WINE_REGIONS: Record<string, { opacity: number; fill: string }> = {
  '250': { opacity: 1.00, fill: '#E8C97A' }, // France — gold bright
  '380': { opacity: 0.90, fill: '#D8B85A' }, // Italy — gold medium-bright
  '724': { opacity: 0.75, fill: '#C9A84C' }, // Spain — gold main
  '840': { opacity: 0.82, fill: '#D4B85C' }, // USA — gold medium
  '276': { opacity: 0.60, fill: '#C9A84C' }, // Germany
  '032': { opacity: 0.75, fill: '#C9A84C' }, // Argentina
  '152': { opacity: 0.68, fill: '#C9A84C' }, // Chile
  '620': { opacity: 0.80, fill: '#D4B85C' }, // Portugal
  '040': { opacity: 0.52, fill: '#B89438' }, // Austria — gold deep
  '554': { opacity: 0.60, fill: '#C9A84C' }, // New Zealand
  '036': { opacity: 0.64, fill: '#C9A84C' }, // Australia
  '710': { opacity: 0.50, fill: '#B89438' }, // South Africa — gold deep
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

    </div>
  );
}
