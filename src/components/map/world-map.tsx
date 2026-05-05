'use client';

import { useRef, useLayoutEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const GEO_URL = '/world-110m.json';

// Brighter, more visible wine country fills
const WINE_REGIONS: Record<string, { opacity: number; fill: string }> = {
  '250': { opacity: 1.00, fill: '#E8253E' }, // France — vivid
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

// Applies preserveAspectRatio="xMidYMid slice" to all SVGs in the container
// This makes the map cover (not letterbox) on any screen size — critical for mobile
function useSliceSvg(ref: React.RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const apply = () => {
      if (!ref.current) return;
      ref.current.querySelectorAll('svg').forEach((svg) => {
        svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        svg.style.width = '100%';
        svg.style.height = '100%';
      });
    };
    apply();
    const observer = new MutationObserver(apply);
    if (ref.current) observer.observe(ref.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [ref]);
}

function MapInstance() {
  return (
    <ComposableMap
      projection="geoEquirectangular"
      projectionConfig={{ scale: 175 }}
      width={960}
      height={500}
      style={{ width: '100%', height: '100%', display: 'block', background: '#060112' }}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const geoId = String((geo as any).id).padStart(3, '0');
            const wine = WINE_REGIONS[geoId];

            const fill   = wine ? wine.fill    : '#221040';
            const fillOp = wine ? wine.opacity : 1;
            const stroke = wine ? '#5A1A50'    : '#3D1568';

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: { fill, fillOpacity: fillOp, stroke, strokeWidth: 0.4, outline: 'none' },
                  hover:   { fill, fillOpacity: fillOp, stroke, strokeWidth: 0.4, outline: 'none' },
                  pressed: { fill, fillOpacity: fillOp, stroke, strokeWidth: 0.4, outline: 'none' },
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
  const containerRef = useRef<HTMLDivElement>(null);
  useSliceSvg(containerRef);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ background: '#060112' }}
    >
      {/* Two identical maps for seamless CSS left-slide loop */}
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

      {/* Wine-glow radial gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 75% 55% at 50% 58%, rgba(220,35,60,0.18) 0%, rgba(140,20,40,0.08) 45%, transparent 72%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
