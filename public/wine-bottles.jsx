// Wine Bottle SVGs — 4 types × 3 styles
// Types: Red (Bordeaux / Burgundy), White (Alsace), Rosé (Provence), Sparkling (Champagne)
// Styles: A Detailed realistic, B Illustrated flat, C Line minimal

const BT_TOKENS = {
  bg: '#05020A',
  bgDeep: '#0A050F',
  surface: '#0F0718',
  gold: '#C9A84C',
  goldDim: '#8a7434',
  cream: '#F5F0E8',
  wine: '#8B1A2A',
  muted: '#9B8B7A',
};

const bottleShell = {
  width: '100%', height: '100%', background: BT_TOKENS.bg,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 24,
};

// Bottle shapes — each returns a <path d="..." /> for the silhouette
const SHAPES = {
  // Bordeaux: straight high shoulders
  bordeaux: "M 76 8 Q 76 4 80 4 L 100 4 Q 104 4 104 8 L 104 14 Q 104 18 102 18 L 102 92 Q 104 100 110 108 Q 124 124 124 140 L 124 432 Q 124 448 108 452 L 72 452 Q 56 448 56 432 L 56 140 Q 56 124 70 108 Q 76 100 78 92 L 78 18 Q 76 18 76 14 Z",
  // Burgundy: sloped shoulders
  burgundy: "M 76 8 Q 76 4 80 4 L 100 4 Q 104 4 104 8 L 104 14 Q 104 18 102 18 L 102 86 Q 110 100 124 132 Q 132 156 132 184 L 132 428 Q 132 448 112 452 L 68 452 Q 48 448 48 428 L 48 184 Q 48 156 56 132 Q 70 100 78 86 L 78 18 Q 76 18 76 14 Z",
  // Champagne: thick, sloped, heavy
  champagne: "M 74 6 Q 74 2 78 2 L 102 2 Q 106 2 106 6 L 106 14 Q 106 20 104 22 L 104 78 Q 112 92 128 122 Q 138 148 138 178 L 138 426 Q 138 450 112 454 L 68 454 Q 42 450 42 426 L 42 178 Q 42 148 52 122 Q 68 92 76 78 L 76 22 Q 74 20 74 14 Z",
  // Alsace/Flute: tall slender
  flute: "M 78 6 Q 78 2 82 2 L 98 2 Q 102 2 102 6 L 102 12 Q 102 16 100 16 L 100 84 Q 104 100 110 116 Q 114 132 114 148 L 114 430 Q 114 448 102 452 L 78 452 Q 66 448 66 430 L 66 148 Q 66 132 70 116 Q 76 100 80 84 L 80 16 Q 78 16 78 12 Z",
};

// Liquid path inside the glass (shows through tinted glass)
const LIQUID = {
  bordeaux: "M 60 200 L 120 200 L 120 432 Q 120 446 106 450 L 74 450 Q 60 446 60 432 Z",
  burgundy: "M 50 230 L 130 230 L 130 428 Q 130 446 112 450 L 68 450 Q 50 446 50 428 Z",
  champagne: "M 44 230 L 136 230 L 136 426 Q 136 448 112 452 L 68 452 Q 44 448 44 426 Z",
  flute: "M 67 200 L 113 200 L 113 430 Q 113 446 102 450 L 78 450 Q 67 446 67 430 Z",
};

// ─────────────────────────────────────────────────────────
// Base Bottle Component
// ─────────────────────────────────────────────────────────
function Bottle({
  shape = 'bordeaux',
  style = 'detailed',     // detailed | flat | line
  glass,                  // outer glass color
  liquid,                 // wine liquid color
  foil,                   // foil/capsule color
  label,                  // label background
  labelText,              // label text color
  typeName,               // "Cabernet Sauvignon"
  region,                 // "Bordeaux 2019"
  ornament = 'crest',     // crest | line | none
}) {
  const t = BT_TOKENS;
  const path = SHAPES[shape];
  const liquidPath = LIQUID[shape];
  const isLine = style === 'line';
  const isFlat = style === 'flat';
  const showLabel = !isLine;
  const showLiquid = !isLine && liquid;

  // Label rect by shape
  const labelRect = {
    bordeaux: { x: 60, y: 230, w: 60, h: 130 },
    burgundy: { x: 54, y: 250, w: 72, h: 130 },
    champagne: { x: 50, y: 260, w: 80, h: 130 },
    flute: { x: 68, y: 240, w: 44, h: 140 },
  }[shape];

  const id = React.useId().replace(/:/g, '');

  return (
    <svg width="100%" height="100%" viewBox="0 0 180 470" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`glass-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={glass} stopOpacity="0.6"/>
          <stop offset="20%" stopColor={glass} stopOpacity="0.95"/>
          <stop offset="50%" stopColor={glass} stopOpacity="1"/>
          <stop offset="80%" stopColor={glass} stopOpacity="0.95"/>
          <stop offset="100%" stopColor={glass} stopOpacity="0.6"/>
        </linearGradient>
        <linearGradient id={`liquid-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={liquid} stopOpacity="0.95"/>
          <stop offset="100%" stopColor={liquid} stopOpacity="1"/>
        </linearGradient>
        <linearGradient id={`foil-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={foil} stopOpacity="0.7"/>
          <stop offset="50%" stopColor={foil} stopOpacity="1"/>
          <stop offset="100%" stopColor={foil} stopOpacity="0.7"/>
        </linearGradient>
        <clipPath id={`clip-${id}`}>
          <path d={path}/>
        </clipPath>
      </defs>

      {/* Drop shadow under bottle */}
      {!isLine && (
        <ellipse cx="90" cy="460" rx="58" ry="5" fill="rgba(0,0,0,0.6)"/>
      )}

      {/* Bottle silhouette (glass) */}
      {isLine ? (
        <path d={path} stroke={t.gold} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
      ) : (
        <g>
          <path d={path} fill={isFlat ? glass : `url(#glass-${id})`}/>

          {/* Liquid fill inside via clip */}
          {showLiquid && (
            <g clipPath={`url(#clip-${id})`}>
              <path d={liquidPath} fill={isFlat ? liquid : `url(#liquid-${id})`}/>
            </g>
          )}

          {/* Highlights */}
          {!isFlat && (
            <g clipPath={`url(#clip-${id})`}>
              <rect x={60} y={20} width={6} height={420} fill="rgba(255,255,255,0.18)"/>
              <rect x={110} y={120} width={3} height={280} fill="rgba(255,255,255,0.08)"/>
            </g>
          )}

          {/* Outline */}
          <path d={path} stroke={isFlat ? t.bg : 'rgba(0,0,0,0.5)'} strokeWidth="1.2" fill="none"/>
        </g>
      )}

      {/* Foil/capsule covering neck */}
      {!isLine && foil && (
        <g>
          {/* Foil wrap */}
          <path d={
            shape === 'champagne'
              ? "M 74 6 Q 74 2 78 2 L 102 2 Q 106 2 106 6 L 106 14 Q 106 20 104 22 L 104 92 L 76 92 L 76 22 Q 74 20 74 14 Z"
              : shape === 'flute'
              ? "M 78 6 Q 78 2 82 2 L 98 2 Q 102 2 102 6 L 102 12 Q 102 16 100 16 L 100 80 L 80 80 L 80 16 Q 78 16 78 12 Z"
              : "M 76 8 Q 76 4 80 4 L 100 4 Q 104 4 104 8 L 104 14 Q 104 18 102 18 L 102 86 L 78 86 L 78 18 Q 76 18 76 14 Z"
          } fill={isFlat ? foil : `url(#foil-${id})`}/>
          {/* foil bottom band */}
          <rect x={shape === 'champagne' ? 76 : (shape === 'flute' ? 80 : 78)}
            y={shape === 'champagne' ? 86 : (shape === 'flute' ? 74 : 80)}
            width={shape === 'champagne' ? 28 : (shape === 'flute' ? 20 : 24)}
            height={6} fill={t.gold} opacity="0.7"/>
        </g>
      )}

      {/* Label */}
      {showLabel && labelRect && label && (
        <g>
          <rect x={labelRect.x} y={labelRect.y} width={labelRect.w} height={labelRect.h}
            fill={label} stroke={t.gold} strokeWidth="0.4" opacity={isFlat ? 1 : 0.97}/>

          {/* ornament */}
          {ornament === 'crest' && (
            <g transform={`translate(${labelRect.x + labelRect.w / 2} ${labelRect.y + 16})`}>
              <path d="M -6 0 L 0 -7 L 6 0 L 4 8 L -4 8 Z" fill={t.gold} opacity="0.85"/>
            </g>
          )}
          {ornament === 'line' && (
            <line x1={labelRect.x + 6} y1={labelRect.y + 16}
              x2={labelRect.x + labelRect.w - 6} y2={labelRect.y + 16}
              stroke={t.gold} strokeWidth="0.6"/>
          )}

          {/* type name */}
          <text x={labelRect.x + labelRect.w / 2} y={labelRect.y + labelRect.h / 2 + 2}
            textAnchor="middle" fontFamily="Playfair Display, serif"
            fontSize={shape === 'flute' ? 6.5 : 8} fontWeight="700"
            fill={labelText} style={{ letterSpacing: '-0.3px' }}>
            {typeName}
          </text>

          {/* divider */}
          <line x1={labelRect.x + 10} y1={labelRect.y + labelRect.h / 2 + 10}
            x2={labelRect.x + labelRect.w - 10} y2={labelRect.y + labelRect.h / 2 + 10}
            stroke={labelText} strokeWidth="0.3" opacity="0.5"/>

          {/* region */}
          <text x={labelRect.x + labelRect.w / 2} y={labelRect.y + labelRect.h / 2 + 22}
            textAnchor="middle" fontFamily="Inter, sans-serif"
            fontSize="4.5" fill={labelText} opacity="0.8"
            style={{ letterSpacing: '0.8px' }}>
            {region}
          </text>

          {/* bottom mark */}
          <text x={labelRect.x + labelRect.w / 2} y={labelRect.y + labelRect.h - 8}
            textAnchor="middle" fontFamily="Inter, sans-serif"
            fontSize="3.5" fill={labelText} opacity="0.6"
            style={{ letterSpacing: '1px' }}>
            winemine
          </text>
        </g>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────
// Wrapper: title beneath bottle
// ─────────────────────────────────────────────────────────
function BottleCard({ title, subtitle, children }) {
  const t = BT_TOKENS;
  return (
    <div style={bottleShell}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        height: '100%', justifyContent: 'space-between',
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', width: '100%' }}>
          {children}
        </div>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <div style={{
            fontFamily: '"Playfair Display", serif', fontSize: 14,
            color: t.cream, letterSpacing: '-0.01em',
          }}>{title}</div>
          {subtitle && (
            <div style={{
              fontFamily: 'Inter, sans-serif', fontSize: 9,
              letterSpacing: '0.3em', color: t.gold,
              textTransform: 'uppercase', marginTop: 4,
              paddingLeft: '0.3em',
            }}>{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// RED — 3 variants
// ─────────────────────────────────────────────────────────
function BottleRedBordeaux() {
  return (
    <BottleCard title="Cabernet Sauvignon" subtitle="Bordeaux · Detailed">
      <Bottle
        shape="bordeaux" style="detailed"
        glass="#0E1A0D"
        liquid="#3a0a14"
        foil="#5C0E1C"
        label="#F5F0E8" labelText="#3a1a20"
        typeName="Château" region="BORDEAUX · 2019"
        ornament="crest"
      />
    </BottleCard>
  );
}

function BottleRedBurgundy() {
  return (
    <BottleCard title="Pinot Noir" subtitle="Burgundy · Flat">
      <Bottle
        shape="burgundy" style="flat"
        glass="#1F2E1C"
        liquid="#5C0E1C"
        foil="#8B1A2A"
        label="#1A0A1E" labelText="#F5F0E8"
        typeName="Pinot Noir" region="CÔTE DE NUITS"
        ornament="line"
      />
    </BottleCard>
  );
}

function BottleRedLine() {
  return (
    <BottleCard title="Bordeaux Silhouette" subtitle="Red · Line">
      <Bottle shape="bordeaux" style="line"/>
    </BottleCard>
  );
}

// ─────────────────────────────────────────────────────────
// WHITE — 3 variants
// ─────────────────────────────────────────────────────────
function BottleWhiteAlsace() {
  return (
    <BottleCard title="Riesling" subtitle="Alsace · Detailed">
      <Bottle
        shape="flute" style="detailed"
        glass="#3a5a3a"
        liquid="#e8dfa8"
        foil="#C9A84C"
        label="#F5F0E8" labelText="#3a3a1a"
        typeName="Riesling" region="ALSACE · 2022"
        ornament="crest"
      />
    </BottleCard>
  );
}

function BottleWhiteBurgundy() {
  return (
    <BottleCard title="Chardonnay" subtitle="Burgundy · Flat">
      <Bottle
        shape="burgundy" style="flat"
        glass="#2d4a2d"
        liquid="#d4c574"
        foil="#F5F0E8"
        label="#F5F0E8" labelText="#1a3a1a"
        typeName="Chardonnay" region="CHABLIS · 2021"
        ornament="line"
      />
    </BottleCard>
  );
}

function BottleWhiteLine() {
  return (
    <BottleCard title="Alsace Silhouette" subtitle="White · Line">
      <Bottle shape="flute" style="line"/>
    </BottleCard>
  );
}

// ─────────────────────────────────────────────────────────
// ROSÉ — 3 variants
// ─────────────────────────────────────────────────────────
function BottleRoseProvence() {
  return (
    <BottleCard title="Rosé de Provence" subtitle="Burgundy · Detailed">
      <Bottle
        shape="burgundy" style="detailed"
        glass="#d8b8a8"
        liquid="#e8a890"
        foil="#F5F0E8"
        label="#F5F0E8" labelText="#7a3a3a"
        typeName="Provence" region="CÔTES DE PROVENCE"
        ornament="crest"
      />
    </BottleCard>
  );
}

function BottleRoseFlat() {
  return (
    <BottleCard title="Tavel Rosé" subtitle="Bordeaux · Flat">
      <Bottle
        shape="bordeaux" style="flat"
        glass="#f0c8b8"
        liquid="#e08070"
        foil="#8B1A2A"
        label="#FFF8F0" labelText="#7a2030"
        typeName="Tavel" region="RHÔNE · 2022"
        ornament="line"
      />
    </BottleCard>
  );
}

function BottleRoseLine() {
  return (
    <BottleCard title="Burgundy Silhouette" subtitle="Rosé · Line">
      <Bottle shape="burgundy" style="line"/>
    </BottleCard>
  );
}

// ─────────────────────────────────────────────────────────
// SPARKLING — 3 variants
// ─────────────────────────────────────────────────────────
function BottleSparklingChampagne() {
  return (
    <BottleCard title="Champagne Brut" subtitle="Champagne · Detailed">
      <Bottle
        shape="champagne" style="detailed"
        glass="#0E1A0D"
        liquid="#d4b85c"
        foil="#C9A84C"
        label="#1A0A1E" labelText="#C9A84C"
        typeName="Brut" region="RÉSERVE · NV"
        ornament="crest"
      />
    </BottleCard>
  );
}

function BottleSparklingProsecco() {
  return (
    <BottleCard title="Prosecco" subtitle="Champagne · Flat">
      <Bottle
        shape="champagne" style="flat"
        glass="#3a5a3a"
        liquid="#e8d878"
        foil="#F5F0E8"
        label="#F5F0E8" labelText="#3a3a1a"
        typeName="Prosecco" region="VENETO · DOC"
        ornament="line"
      />
    </BottleCard>
  );
}

function BottleSparklingLine() {
  return (
    <BottleCard title="Champagne Silhouette" subtitle="Sparkling · Line">
      <Bottle shape="champagne" style="line"/>
    </BottleCard>
  );
}

// ─────────────────────────────────────────────────────────
// Hero — all four together
// ─────────────────────────────────────────────────────────
function BottleHero() {
  const t = BT_TOKENS;
  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg,
      padding: 40, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{
          fontFamily: '"Playfair Display", serif',
          fontSize: 32, fontWeight: 700, color: t.cream,
          letterSpacing: '-0.02em',
        }}>The Four Vines</div>
        <div style={{
          fontSize: 9, letterSpacing: '0.5em', color: t.gold,
          textTransform: 'uppercase', marginTop: 8,
          paddingLeft: '0.5em',
        }}>Red · White · Rosé · Sparkling</div>
      </div>
      <div style={{
        flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
        alignItems: 'end',
      }}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Bottle shape="bordeaux" style="detailed"
            glass="#0E1A0D" liquid="#3a0a14" foil="#5C0E1C"
            label="#F5F0E8" labelText="#3a1a20"
            typeName="Cabernet" region="BORDEAUX" ornament="crest"/>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 13, color: t.cream, marginTop: 8 }}>Red</div>
        </div>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Bottle shape="flute" style="detailed"
            glass="#3a5a3a" liquid="#e8dfa8" foil="#C9A84C"
            label="#F5F0E8" labelText="#3a3a1a"
            typeName="Riesling" region="ALSACE" ornament="crest"/>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 13, color: t.cream, marginTop: 8 }}>White</div>
        </div>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Bottle shape="burgundy" style="detailed"
            glass="#d8b8a8" liquid="#e8a890" foil="#F5F0E8"
            label="#F5F0E8" labelText="#7a3a3a"
            typeName="Provence" region="ROSÉ" ornament="crest"/>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 13, color: t.cream, marginTop: 8 }}>Rosé</div>
        </div>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Bottle shape="champagne" style="detailed"
            glass="#0E1A0D" liquid="#d4b85c" foil="#C9A84C"
            label="#1A0A1E" labelText="#C9A84C"
            typeName="Brut" region="CHAMPAGNE" ornament="crest"/>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 13, color: t.cream, marginTop: 8 }}>Sparkling</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Bottle, BottleCard, BT_TOKENS,
  BottleRedBordeaux, BottleRedBurgundy, BottleRedLine,
  BottleWhiteAlsace, BottleWhiteBurgundy, BottleWhiteLine,
  BottleRoseProvence, BottleRoseFlat, BottleRoseLine,
  BottleSparklingChampagne, BottleSparklingProsecco, BottleSparklingLine,
  BottleHero,
});
