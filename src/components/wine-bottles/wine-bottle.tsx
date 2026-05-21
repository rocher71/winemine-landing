import { useId } from 'react';

export type BottleShape = 'bordeaux' | 'burgundy' | 'champagne' | 'flute';
export type BottleStyle = 'detailed' | 'flat' | 'line';
export type BottleOrnament = 'crest' | 'line' | 'none';

const TOKENS = {
  gold: 'var(--color-gold)',
  bg: 'var(--color-bg-deepest)',
} as const;

const SHAPES: Record<BottleShape, string> = {
  bordeaux:
    'M 76 8 Q 76 4 80 4 L 100 4 Q 104 4 104 8 L 104 14 Q 104 18 102 18 L 102 92 Q 104 100 110 108 Q 124 124 124 140 L 124 432 Q 124 448 108 452 L 72 452 Q 56 448 56 432 L 56 140 Q 56 124 70 108 Q 76 100 78 92 L 78 18 Q 76 18 76 14 Z',
  burgundy:
    'M 76 8 Q 76 4 80 4 L 100 4 Q 104 4 104 8 L 104 14 Q 104 18 102 18 L 102 86 Q 110 100 124 132 Q 132 156 132 184 L 132 428 Q 132 448 112 452 L 68 452 Q 48 448 48 428 L 48 184 Q 48 156 56 132 Q 70 100 78 86 L 78 18 Q 76 18 76 14 Z',
  champagne:
    'M 74 6 Q 74 2 78 2 L 102 2 Q 106 2 106 6 L 106 14 Q 106 20 104 22 L 104 78 Q 112 92 128 122 Q 138 148 138 178 L 138 426 Q 138 450 112 454 L 68 454 Q 42 450 42 426 L 42 178 Q 42 148 52 122 Q 68 92 76 78 L 76 22 Q 74 20 74 14 Z',
  flute:
    'M 78 6 Q 78 2 82 2 L 98 2 Q 102 2 102 6 L 102 12 Q 102 16 100 16 L 100 84 Q 104 100 110 116 Q 114 132 114 148 L 114 430 Q 114 448 102 452 L 78 452 Q 66 448 66 430 L 66 148 Q 66 132 70 116 Q 76 100 80 84 L 80 16 Q 78 16 78 12 Z',
};

const LIQUID: Record<BottleShape, string> = {
  bordeaux:
    'M 60 200 L 120 200 L 120 432 Q 120 446 106 450 L 74 450 Q 60 446 60 432 Z',
  burgundy:
    'M 50 230 L 130 230 L 130 428 Q 130 446 112 450 L 68 450 Q 50 446 50 428 Z',
  champagne:
    'M 44 230 L 136 230 L 136 426 Q 136 448 112 452 L 68 452 Q 44 448 44 426 Z',
  flute:
    'M 67 200 L 113 200 L 113 430 Q 113 446 102 450 L 78 450 Q 67 446 67 430 Z',
};

const FOIL_PATH: Record<BottleShape, string> = {
  bordeaux:
    'M 76 8 Q 76 4 80 4 L 100 4 Q 104 4 104 8 L 104 14 Q 104 18 102 18 L 102 86 L 78 86 L 78 18 Q 76 18 76 14 Z',
  burgundy:
    'M 76 8 Q 76 4 80 4 L 100 4 Q 104 4 104 8 L 104 14 Q 104 18 102 18 L 102 86 L 78 86 L 78 18 Q 76 18 76 14 Z',
  champagne:
    'M 74 6 Q 74 2 78 2 L 102 2 Q 106 2 106 6 L 106 14 Q 106 20 104 22 L 104 92 L 76 92 L 76 22 Q 74 20 74 14 Z',
  flute:
    'M 78 6 Q 78 2 82 2 L 98 2 Q 102 2 102 6 L 102 12 Q 102 16 100 16 L 100 80 L 80 80 L 80 16 Q 78 16 78 12 Z',
};

type LabelRect = { x: number; y: number; w: number; h: number };
const LABEL_RECT: Record<BottleShape, LabelRect> = {
  bordeaux:  { x: 60, y: 230, w: 60, h: 130 },
  burgundy:  { x: 54, y: 250, w: 72, h: 130 },
  champagne: { x: 50, y: 260, w: 80, h: 130 },
  flute:     { x: 68, y: 240, w: 44, h: 140 },
};

const FOIL_BAND: Record<BottleShape, { x: number; y: number; w: number }> = {
  bordeaux:  { x: 78, y: 80, w: 24 },
  burgundy:  { x: 78, y: 80, w: 24 },
  champagne: { x: 76, y: 86, w: 28 },
  flute:     { x: 80, y: 74, w: 20 },
};

export type BottleProps = {
  shape?: BottleShape;
  style?: BottleStyle;
  /** Glass color (outer body). Required unless style="line". */
  glass?: string;
  /** Wine liquid color. Optional. */
  liquid?: string;
  /** Foil/capsule color covering the neck. Optional. */
  foil?: string;
  /** Label background color. Optional (no label if omitted). */
  label?: string;
  /** Label text color. */
  labelText?: string;
  /** Large label text (e.g. grape variety). */
  typeName?: string;
  /** Small label text (e.g. region + vintage). */
  region?: string;
  /** Decorative mark on label. */
  ornament?: BottleOrnament;
  /** SVG width (defaults to 100%). */
  width?: number | string;
  /** SVG height (defaults to 100%). */
  height?: number | string;
  /** Accessibility — pass aria-hidden="true" for purely decorative use. */
  ariaHidden?: boolean;
};

export function Bottle({
  shape = 'bordeaux',
  style = 'detailed',
  glass,
  liquid,
  foil,
  label,
  labelText,
  typeName,
  region,
  ornament = 'crest',
  width = '100%',
  height = '100%',
  ariaHidden = true,
}: BottleProps) {
  const rawId = useId();
  const id = rawId.replace(/:/g, '');
  const path = SHAPES[shape];
  const liquidPath = LIQUID[shape];
  const labelRect = LABEL_RECT[shape];
  const foilPath = FOIL_PATH[shape];
  const foilBand = FOIL_BAND[shape];

  const isLine = style === 'line';
  const isFlat = style === 'flat';
  const showLabel = !isLine && !!label && !!labelText;
  const showLiquid = !isLine && !!liquid;
  const showFoil = !isLine && !!foil;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 180 470"
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden={ariaHidden}
    >
      <defs>
        {glass && (
          <linearGradient id={`glass-${id}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={glass} stopOpacity="0.6" />
            <stop offset="20%" stopColor={glass} stopOpacity="0.95" />
            <stop offset="50%" stopColor={glass} stopOpacity="1" />
            <stop offset="80%" stopColor={glass} stopOpacity="0.95" />
            <stop offset="100%" stopColor={glass} stopOpacity="0.6" />
          </linearGradient>
        )}
        {liquid && (
          <linearGradient id={`liquid-${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={liquid} stopOpacity="0.95" />
            <stop offset="100%" stopColor={liquid} stopOpacity="1" />
          </linearGradient>
        )}
        {foil && (
          <linearGradient id={`foil-${id}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={foil} stopOpacity="0.7" />
            <stop offset="50%" stopColor={foil} stopOpacity="1" />
            <stop offset="100%" stopColor={foil} stopOpacity="0.7" />
          </linearGradient>
        )}
        <clipPath id={`clip-${id}`}>
          <path d={path} />
        </clipPath>
      </defs>

      {!isLine && (
        <ellipse cx="90" cy="460" rx="58" ry="5" fill="rgba(0,0,0,0.6)" />
      )}

      {isLine ? (
        <path
          d={path}
          stroke={TOKENS.gold}
          strokeWidth="1.4"
          fill="none"
          strokeLinejoin="round"
        />
      ) : (
        <g>
          <path d={path} fill={isFlat ? glass : `url(#glass-${id})`} />

          {showLiquid && (
            <g clipPath={`url(#clip-${id})`}>
              <path
                d={liquidPath}
                fill={isFlat ? liquid : `url(#liquid-${id})`}
              />
            </g>
          )}

          {!isFlat && (
            <g clipPath={`url(#clip-${id})`}>
              <rect x={60} y={20} width={6} height={420} fill="var(--overlay-medium)" />
              <rect x={110} y={120} width={3} height={280} fill="var(--overlay-medium)" />
            </g>
          )}

          <path
            d={path}
            stroke={isFlat ? TOKENS.bg : 'rgba(0,0,0,0.5)'}
            strokeWidth="1.2"
            fill="none"
          />
        </g>
      )}

      {showFoil && (
        <g>
          <path d={foilPath} fill={isFlat ? foil : `url(#foil-${id})`} />
          <rect
            x={foilBand.x}
            y={foilBand.y}
            width={foilBand.w}
            height={6}
            fill={TOKENS.gold}
            opacity={0.7}
          />
        </g>
      )}

      {showLabel && (
        <g>
          <rect
            x={labelRect.x}
            y={labelRect.y}
            width={labelRect.w}
            height={labelRect.h}
            fill={label}
            stroke={TOKENS.gold}
            strokeWidth="0.4"
            opacity={isFlat ? 1 : 0.97}
          />

          {ornament === 'crest' && (
            <g transform={`translate(${labelRect.x + labelRect.w / 2} ${labelRect.y + 16})`}>
              <path d="M -6 0 L 0 -7 L 6 0 L 4 8 L -4 8 Z" fill={TOKENS.gold} opacity={0.85} />
            </g>
          )}
          {ornament === 'line' && (
            <line
              x1={labelRect.x + 6}
              y1={labelRect.y + 16}
              x2={labelRect.x + labelRect.w - 6}
              y2={labelRect.y + 16}
              stroke={TOKENS.gold}
              strokeWidth="0.6"
            />
          )}

          {typeName && (
            <text
              x={labelRect.x + labelRect.w / 2}
              y={labelRect.y + labelRect.h / 2 + 2}
              textAnchor="middle"
              fontFamily="var(--font-playfair), Georgia, serif"
              fontSize={shape === 'flute' ? 6.5 : 8}
              fontWeight="700"
              fill={labelText}
              style={{ letterSpacing: '-0.3px' }}
            >
              {typeName}
            </text>
          )}

          <line
            x1={labelRect.x + 10}
            y1={labelRect.y + labelRect.h / 2 + 10}
            x2={labelRect.x + labelRect.w - 10}
            y2={labelRect.y + labelRect.h / 2 + 10}
            stroke={labelText}
            strokeWidth="0.3"
            opacity={0.5}
          />

          {region && (
            <text
              x={labelRect.x + labelRect.w / 2}
              y={labelRect.y + labelRect.h / 2 + 22}
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
              fontSize="4.5"
              fill={labelText}
              opacity={0.8}
              style={{ letterSpacing: '0.8px' }}
            >
              {region}
            </text>
          )}

          <text
            x={labelRect.x + labelRect.w / 2}
            y={labelRect.y + labelRect.h - 8}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="3.5"
            fill={labelText}
            opacity={0.6}
            style={{ letterSpacing: '1px' }}
          >
            WineMine
          </text>
        </g>
      )}
    </svg>
  );
}

export type BottlePreset = 'red-bordeaux' | 'red-burgundy' | 'white-alsace' | 'white-burgundy' | 'rose-provence' | 'sparkling-champagne';

export const BOTTLE_PRESETS: Record<BottlePreset, Omit<BottleProps, 'width' | 'height' | 'ariaHidden'>> = {
  'red-bordeaux': {
    shape: 'bordeaux',
    style: 'detailed',
    glass: '#0E1A0D',
    liquid: '#3a0a14',
    foil: '#5C0E1C',
    label: 'var(--color-paper)',
    labelText: '#3a1a20',
    typeName: 'Château',
    region: 'BORDEAUX',
    ornament: 'crest',
  },
  'red-burgundy': {
    shape: 'burgundy',
    style: 'detailed',
    glass: '#1F2E1C',
    liquid: '#5C0E1C',
    foil: 'var(--color-wine-red)',
    label: 'var(--color-ink)',
    labelText: 'var(--color-paper)',
    typeName: 'Pinot Noir',
    region: 'CÔTE DE NUITS',
    ornament: 'line',
  },
  'white-alsace': {
    shape: 'flute',
    style: 'detailed',
    glass: '#3a5a3a',
    liquid: '#e8dfa8',
    foil: 'var(--color-gold)',
    label: 'var(--color-paper)',
    labelText: '#3a3a1a',
    typeName: 'Riesling',
    region: 'ALSACE',
    ornament: 'crest',
  },
  'white-burgundy': {
    shape: 'burgundy',
    style: 'detailed',
    glass: '#2d4a2d',
    liquid: '#d4c574',
    foil: 'var(--color-paper)',
    label: 'var(--color-paper)',
    labelText: '#1a3a1a',
    typeName: 'Chardonnay',
    region: 'CHABLIS',
    ornament: 'line',
  },
  'rose-provence': {
    shape: 'burgundy',
    style: 'detailed',
    glass: '#d8b8a8',
    liquid: '#e8a890',
    foil: 'var(--color-paper)',
    label: 'var(--color-paper)',
    labelText: '#7a3a3a',
    typeName: 'Provence',
    region: 'CÔTES DE PROVENCE',
    ornament: 'crest',
  },
  'sparkling-champagne': {
    shape: 'champagne',
    style: 'detailed',
    glass: '#0E1A0D',
    liquid: '#d4b85c',
    foil: 'var(--color-gold)',
    label: 'var(--color-ink)',
    labelText: 'var(--color-gold)',
    typeName: 'Brut',
    region: 'CHAMPAGNE',
    ornament: 'crest',
  },
};

/** Convenience: derive Bottle props from a wine-type tag + optional appellation override. */
export function presetByWineType(
  wineType: 'red' | 'white' | 'rosé' | 'sparkling',
  region?: string,
): BottleProps {
  const preset =
    wineType === 'red'      ? BOTTLE_PRESETS['red-bordeaux']
  : wineType === 'white'    ? BOTTLE_PRESETS['white-burgundy']
  : wineType === 'rosé'     ? BOTTLE_PRESETS['rose-provence']
  :                           BOTTLE_PRESETS['sparkling-champagne'];
  return region ? { ...preset, region } : preset;
}
