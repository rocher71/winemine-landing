'use client';

import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const GEO_URL = '/world-110m.json';

// ISO 3166-1 numeric (3-digit, zero-padded) → wine data
const WINE_REGIONS: Record<string, { opacity: number }> = {
  '250': { opacity: 0.92 }, // France
  '380': { opacity: 0.78 }, // Italy
  '724': { opacity: 0.58 }, // Spain
  '840': { opacity: 0.68 }, // USA
  '276': { opacity: 0.42 }, // Germany
  '032': { opacity: 0.58 }, // Argentina
  '152': { opacity: 0.50 }, // Chile
  '620': { opacity: 0.64 }, // Portugal
  '040': { opacity: 0.34 }, // Austria
  '554': { opacity: 0.44 }, // New Zealand
  '036': { opacity: 0.46 }, // Australia
  '710': { opacity: 0.32 }, // South Africa
};

function MapInstance() {
  return (
    <ComposableMap
      projection="geoEquirectangular"
      projectionConfig={{ scale: 155 }}
      width={960}
      height={500}
      style={{ width: '100%', height: '100%', background: '#080218' }}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const geoId = String((geo as any).id).padStart(3, '0');
            const wine = WINE_REGIONS[geoId];

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: wine ? '#C41E3A' : '#1E0835',
                    fillOpacity: wine ? wine.opacity : 1,
                    stroke: '#3A1060',
                    strokeWidth: 0.4,
                    outline: 'none',
                  },
                  hover: {
                    fill: wine ? '#C41E3A' : '#1E0835',
                    fillOpacity: wine ? wine.opacity : 1,
                    stroke: '#3A1060',
                    strokeWidth: 0.4,
                    outline: 'none',
                  },
                  pressed: {
                    fill: wine ? '#C41E3A' : '#1E0835',
                    fillOpacity: wine ? wine.opacity : 1,
                    stroke: '#3A1060',
                    strokeWidth: 0.4,
                    outline: 'none',
                  },
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
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#080218' }}>
      {/* Two side-by-side maps, CSS-animated for seamless left slide */}
      <div
        style={{
          display: 'flex',
          width: '200%',
          height: '100%',
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

      {/* Subtle wine-glow from center */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 50% at 50% 55%, rgba(196,30,58,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
