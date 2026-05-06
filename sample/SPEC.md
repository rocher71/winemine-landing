# Ma Cave — Bordeaux Wine Cellar Mobile UI

> Implementation spec for Claude Code. Two screen variations (**A · Bottom Sheet** and **C · Glass Card Stack**) of the same feature: tapping the **Bordeaux** region on a France map opens the user's tasted‑wines list for that region. This document is the source of truth — design tokens, components, data shapes, interactions, and exact layout.

---

## 0. Project context

- **Product:** "Ma Cave" — a personal wine cellar / journal mobile app.
- **Screen in scope:** France map → tap **Bordeaux** → see all wines from that region the user has tasted.
- **Form factor:** iPhone-class mobile, **390 × 844** logical px (iPhone 14/15 standard). Designs were authored at 360 × 720 inside a phone bezel; **scale up linearly** if the framework width differs.
- **Stack:** Build with React + TypeScript (Next.js or Vite) by default. If the user's repo uses a different stack, port the structure but keep tokens and component shapes identical.
- **Localization:** Korean (primary) + English (region/varietal names stay in Latin script). Use system fonts as fallback if web fonts can't be added.

---

## 1. Design tokens

### 1.1 Color

Palette is dark, jewel-toned. **Three accent palettes** are exposed as a runtime theme; default is `wine`.

```ts
// tokens/colors.ts
export const palettes = {
  wine: {
    accent:   '#b73855', // primary wine red — used for region pins, highlights
    gold:     '#f0c876', // secondary — ratings, sort pill, dividers, callouts
    burgundy: '#5b1424', // deep accent — bottle glass, hero shadows
  },
  gold: {
    accent:   '#c9924d',
    gold:     '#f5d98a',
    burgundy: '#3d2818',
  },
  burgundy: {
    accent:   '#8a1e3a',
    gold:     '#d9b074',
    burgundy: '#2b0a18',
  },
} as const;

export const surface = {
  bgDeep:     '#0a0612', // outermost background, behind map
  bgMid:      '#150b25', // map mid-radial stop
  bgLight:    '#2a1845', // map highlight stop
  bgLighter:  '#321b52', // C variant uses this stop
  bgPanel:    '#14092a', // sheet base in B (kept for parity)
  sheetTop:   'rgba(28,18,42,0.98)',     // bottom sheet top
  sheetBot:   'rgba(15,8,25,0.99)',      // bottom sheet bottom
  glassPanel: 'rgba(20,12,35,0.65)',     // glass dock / pills
  cardTop:    'rgba(48,28,68,0.85)',     // C card top
  cardBot:    'rgba(20,10,30,0.92)',     // C card bottom
};

export const text = {
  primary:    '#ffffff',
  secondary:  'rgba(255,255,255,0.85)',
  body:       'rgba(255,255,255,0.55)',
  muted:      'rgba(255,255,255,0.45)',
  faint:      'rgba(255,255,255,0.4)',
  ghost:      'rgba(255,255,255,0.35)',
  warmMuted:  'rgba(255,200,150,0.55)', // italic English subtitle
  warmLabel:  'rgba(255,200,150,0.6)',  // appellation eyebrow
  warmFaint:  'rgba(255,200,150,0.5)',
  warmGhost:  'rgba(255,200,150,0.45)',
};

export const stroke = {
  hair:    'rgba(255,255,255,0.04)', // list row divider
  thin:    'rgba(255,255,255,0.05)', // card border
  default: 'rgba(255,255,255,0.08)', // glass / chip border
  strong:  'rgba(255,255,255,0.1)',  // active card border
};
```

### 1.2 Typography

Use Google Fonts. Headlines/wine names in serif; UI in sans. Italic Cormorant for English subtitles.

```ts
// tokens/typography.ts
export const fonts = {
  serif: `'Cormorant Garamond', 'Noto Serif KR', Georgia, serif`,
  sans:  `'Inter', -apple-system, 'Pretendard', system-ui, sans-serif`,
};
```

Type scale (px, line-height multiplier, weight, letter-spacing). All sizes are mobile-first; do not auto-scale.

| Token            | Font  | Size | LH   | Weight | LS    | Use                                        |
|------------------|-------|------|------|--------|-------|--------------------------------------------|
| `display.region` | serif | 28   | 1.1  | 600    | -0.3  | "보르도" header (A sheet)                  |
| `display.wineXL` | serif | 22   | 1.1  | 600    | -0.3  | Wine name on hero card (C)                 |
| `display.wineM`  | serif | 17   | 1.15 | 600    | -0.2  | Wine name on list card (A)                 |
| `display.brand`  | serif | 18   | 1.0  | 600    | 0     | "보르도" in C top bar                       |
| `display.script` | serif italic | 16 | 1.2 | 500 | 0.3 | "Ma Cave" wordmark                          |
| `display.subtitle` | serif italic | 14 | 1.2 | 500 | 0 | English region subtitle ("Bordeaux")     |
| `display.note`   | serif italic | 14 | 1.4 | 500 | 0 | Tasting note quote (C)                    |
| `display.vintageInline` | serif italic | 14 | 1.2 | 500 | 0 | Vintage in row right side               |
| `body.lg`        | sans  | 14   | 1.4  | 500    | 0     | Generic body                              |
| `body.md`        | sans  | 12   | 1.3  | 500    | 0     | Meta values, sort tab labels              |
| `body.sm`        | sans  | 11.5 | 1.45 | 400    | 0     | Tasting note one-liner (A row)            |
| `body.xs`        | sans  | 11   | 1.4  | 400    | 0     | Counters                                  |
| `eyebrow.lg`     | sans  | 10   | 1.2  | 600    | 1.0   | Subregion eyebrow on C ("MÉDOC")          |
| `eyebrow.md`     | sans  | 10   | 1.2  | 500    | 0.5   | Appellation chip (UPPERCASE)              |
| `eyebrow.sm`     | sans  | 9    | 1.2  | 600    | 0.8–1 | Stat / meta labels (UPPERCASE)            |

Stat values default to `body.lg` weight 600 white; "최애" (favorite wine) is rendered in `display.subtitle` italic for visual rhythm.

### 1.3 Spacing & radius

```ts
export const space = {
  hair: 2, xs: 4, sm: 6, md: 8, lg: 10, xl: 12, '2xl': 14, '3xl': 16,
  '4xl': 20, '5xl': 24, '6xl': 32,
};
export const radius = {
  chip: 999,    // pills, sort tabs
  field: 12,    // tasting-note box
  card: 16,     // wine row card
  panel: 22,    // bottom dock (C)
  sheet: 24,    // hero card (C)
  sheetTop: 28, // bottom sheet top corners (A)
  bezel: 36,    // phone inner
  bezelOuter: 44, // phone outer
};
```

### 1.4 Shadows & blur

```ts
export const shadow = {
  sheet:     '0 -8px 30px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.06)',
  card:      '0 20px 60px rgba(0,0,0,0.6)', // C hero card
  cardRing:  '0 0 0 1px {gold}20 inset',   // gold glow ring on C card (sub gold token, 12% alpha)
  dock:      '0 8px 30px rgba(0,0,0,0.4)',
  bottle:    '0 12px 40px rgba(0,0,0,0.4)', // peek cards behind hero
  device:    '0 20px 60px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.05)',
};
export const blur = {
  panel: 'blur(20px)',
  sheet: 'blur(40px)',
  card:  'blur(30px)',
};
```

### 1.5 Iconography

- Top-bar buttons are 36 × 36 circular glass pills containing a single character: back chevron `‹`, search `⌕`. Replace with line icons (Lucide `chevron-left`, `search`) when available; keep 36 × 36 hit area.
- **Wine glass** rating glyph is bespoke — see §2.1.

---

## 2. Atomic components

### 2.1 `<WineGlassRating value={1..5} />`

Replaces star ratings. SVG-drawn glass that fills with the gold token.

```tsx
function WineGlassIcon({ filled, size = 12, color, dim = 'rgba(255,255,255,0.18)' }: Props) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 12 16">
      <path d="M2.5 1 Q2.5 6 6 7 Q9.5 6 9.5 1 Z"
            fill={filled ? color : 'transparent'}
            stroke={filled ? color : dim} strokeWidth="0.8" strokeLinejoin="round"/>
      <line x1="6" y1="7" x2="6" y2="13" stroke={filled ? color : dim} strokeWidth="0.8"/>
      <line x1="3.5" y1="13.5" x2="8.5" y2="13.5"
            stroke={filled ? color : dim} strokeWidth="0.8" strokeLinecap="round"/>
    </svg>
  );
}
```

Renders 5 glasses in a flex row with `gap: 2` (compact) or `gap: 3` (hero). Filled count = `value`.

### 2.2 `<BottleSilhouette wine={Wine} width={N} height={N} />`

SVG bottle with:
1. Body — vertical gradient from `wine.color` (full) → `wine.color * 0.85` → black 60% (right side)
2. Foil cap — `#0a0612` 80%
3. Foil stripe — gold token 80%
4. Label rectangle — `#f5ecd6`, gold border 0.5 width 60% opacity
5. Label text (centered):
   - "Château" — serif italic 10px `#3d1a26`
   - `wine.label` — serif bold 14px `#3d1a26`
   - thin divider — `#3d1a26` 0.4 width 50% opacity
   - "BORDEAUX" — sans 6px letter-spacing 1
   - vintage — serif 600 11px

Default sizes: list rows 44–56 wide; hero card 64 × 150.

### 2.3 `<FranceMap highlight="bordeaux" accent gold onSelect />`

100×100 viewBox, full‑width SVG. Three regions are pre-pinned (only **Bordeaux** is interactive in this scope, but the others must render with callouts):

```ts
const regions = [
  { id: 'champagne', name: '샹파뉴',  count: 12, x: 60, y: 28, path: '...' },
  { id: 'meursault', name: '뫼르소',  count: 28, x: 58, y: 52, path: '...' },
  { id: 'bordeaux',  name: '보르도',  count: 13, x: 28, y: 70, path: '...' },
];
```

Region paths (copy verbatim — these are tuned by eye and shouldn't be re-derived):
- **Champagne:** `M55 24 q4 -3 9 -2 q4 1 6 4 q1 3 -1 5 q-3 2 -7 2 q-5 0 -8 -2 q-2 -3 0 -5 q0 -1 1 -2 z`
- **Meursault (Burgundy):** `M53 48 q3 -2 7 -1 q5 1 7 4 q1 3 -1 6 q-3 3 -7 3 q-5 0 -7 -3 q-2 -3 -1 -6 q0 -1 1 -2 z`
- **Bordeaux:** `M24 60 q4 -3 9 -1 q4 2 5 6 q1 4 -1 8 q-2 5 -6 7 q-4 2 -7 0 q-3 -2 -3 -7 q0 -7 2 -11 q0 -1 1 -2 z`

France silhouette path (copy verbatim):
```
M 22 16 Q 30 12 42 14 Q 52 14 60 12 Q 68 12 74 18 Q 82 22 84 32
Q 88 38 82 44 Q 86 50 82 58 Q 84 66 78 72 Q 76 80 70 84
Q 60 90 48 88 Q 36 90 28 84 Q 20 78 18 70 Q 14 60 18 52
Q 14 44 18 36 Q 16 26 22 16 Z
```
Fill `rgba(120,90,200,0.18)`, stroke `rgba(160,130,220,0.35)` width 0.4. Add an internal grid path for texture (one M-curve, opacity 0.5, width 0.15).

Region styling:
- All regions filled with `accent` (default 0.85 opacity)
- Highlighted region: opacity 1, plus an SVG `feGaussianBlur` glow filter (stdDeviation 0.8) and a `selectedAccent` (gold) outline at width 0.3, opacity 0.8
- **Callouts** (always visible): pill at offset `(x-18, y)` for Bordeaux, `(x+8, y)` otherwise. Pill is 16×8 rounded 1.5, fill `rgba(20,12,30,0.85)`, stroke is gold for highlighted region else `rgba(255,255,255,0.1)`. Two text lines: region name (warm muted, 2.2px) and `{count}병` (gold for highlight, else `rgba(255,220,160,0.95)`, 2.6px bold).

> **Important:** Map text sizes look tiny because the viewBox is 100; the SVG scales with `width: 100%; height: 100%; preserveAspectRatio: xMidYMid meet`.

### 2.4 `<PhoneShell>`

```
Outer: 360 × 720, radius 44, padding 8, background #000
       boxShadow: shadow.device
Inner: 100% × 100%, radius 36, overflow hidden
       background: surface.bgDeep, flex column
Notch: absolute top 8, centered, 100 × 28, radius 18, #000, z 50
```

### 2.5 `<StatusBar>`

44px tall, `0 28px` padding, justify between. Time "9:41" left, signal+battery icons right (see §1.5). All white. Sits above the map, z 30.

---

## 3. Data model

```ts
export type Wine = {
  id: string;             // 'w01' …
  name: string;           // 'Château Margaux'
  producer: string;       // classification line, e.g. 'Premier Grand Cru Classé'
  appellation: string;    // 'Margaux' | 'Pauillac' | 'Pomerol' | …
  subregion: 'Médoc' | 'Right Bank' | 'Graves' | 'Pomerol';
  vintage: number;        // 2015
  grapes: string[];       // ['Cabernet Sauvignon','Merlot']
  rating: 1|2|3|4|5;
  drankAt: string;        // 'YYYY.MM.DD' (string-sortable)
  occasion: string;       // '결혼기념일'
  note: string;           // single-line tasting note (Korean)
  color: string;          // hex; bottle-glass tint, e.g. '#5b1424'
  label: 'M'|'P'|'L'|'É'|'CB'|'PV'|'LP'|'B'|'BC'|'SH'|'HB'|'RS'|'DI'; // 1–2 char label glyph
};
```

### 3.1 Region stats

```ts
export const bordeauxStats = {
  region: '보르도',
  regionEn: 'Bordeaux',
  total: 13,
  totalLabel: '13병',
  avgRating: 4.4,
  topWine: 'Château Margaux 2015',
  subregions: [
    { name: 'Médoc',      count: 7 },
    { name: 'Right Bank', count: 3 },
    { name: 'Graves',     count: 2 },
    { name: 'Pomerol',    count: 1 },
  ],
};
```

### 3.2 Seed wines (13 entries, Korean copy)

Use exactly these 13 entries — same `id`, name, producer, appellation, subregion, vintage, grapes, rating, drankAt, occasion, note, color, label. They are calibrated for visual variety (rating distribution: five 5★, six 4★, one 3★).

```ts
export const bordeauxWines: Wine[] = [
  { id: 'w01', name: 'Château Margaux',           producer: 'Premier Grand Cru Classé',  appellation: 'Margaux',         subregion: 'Médoc',      vintage: 2015, grapes: ['Cabernet Sauvignon','Merlot','Petit Verdot'],         rating: 5, drankAt: '2026.04.18', occasion: '결혼기념일',     note: '잘 익은 카시스, 시가박스, 제비꽃. 우아한 탄닌이 한참 머무름.',  color: '#5b1424', label: 'M'  },
  { id: 'w02', name: 'Château Pichon Baron',      producer: 'Deuxièmes Crus',            appellation: 'Pauillac',        subregion: 'Médoc',      vintage: 2016, grapes: ['Cabernet Sauvignon','Merlot'],                         rating: 5, drankAt: '2026.03.22', occasion: '와인 모임',       note: '연필심, 블랙커런트, 스모키한 오크. 구조감이 압도적.',          color: '#3d0f1f', label: 'P'  },
  { id: 'w03', name: 'Château Lynch-Bages',       producer: 'Cinquièmes Crus',           appellation: 'Pauillac',        subregion: 'Médoc',      vintage: 2014, grapes: ['Cabernet Sauvignon','Merlot','Cabernet Franc'],        rating: 4, drankAt: '2026.02.14', occasion: '발렌타인 디너',   note: '농밀한 검은 과실, 다크초콜릿, 가죽 뉘앙스.',                    color: '#4a1226', label: 'L'  },
  { id: 'w04', name: "Château L'Évangile",        producer: 'Pomerol',                   appellation: 'Pomerol',         subregion: 'Right Bank', vintage: 2017, grapes: ['Merlot','Cabernet Franc'],                            rating: 5, drankAt: '2026.01.30', occasion: '특별한 손님',     note: '실키한 텍스처, 자두 콩포트, 트러플의 매혹적인 향.',             color: '#601628', label: 'É'  },
  { id: 'w05', name: 'Château Cheval Blanc',      producer: 'Premier Grand Cru Classé A',appellation: 'Saint-Émilion',   subregion: 'Right Bank', vintage: 2010, grapes: ['Cabernet Franc','Merlot'],                            rating: 5, drankAt: '2025.12.24', occasion: '크리스마스 이브', note: '향신료, 말린 장미, 아시아 향신료. 지적인 와인.',                color: '#2a0a18', label: 'CB' },
  { id: 'w06', name: 'Château Pavie',             producer: 'Premier Grand Cru Classé A',appellation: 'Saint-Émilion',   subregion: 'Right Bank', vintage: 2015, grapes: ['Merlot','Cabernet Franc','Cabernet Sauvignon'],       rating: 4, drankAt: '2025.11.11', occasion: '와인 동호회',     note: '풀바디, 농축된 과실, 미네랄. 조금 더 기다려도 좋을 듯.',        color: '#3a0d1c', label: 'PV' },
  { id: 'w07', name: 'Château Léoville-Poyferré', producer: 'Deuxièmes Crus',            appellation: 'Saint-Julien',    subregion: 'Médoc',      vintage: 2018, grapes: ['Cabernet Sauvignon','Merlot','Petit Verdot'],         rating: 4, drankAt: '2025.10.05', occasion: '주말 디너',       note: '균형감 좋은 과실, 부드러운 탄닌, 마시기 편한 클래식.',          color: '#4d1124', label: 'LP' },
  { id: 'w08', name: 'Château Beychevelle',       producer: 'Quatrièmes Crus',           appellation: 'Saint-Julien',    subregion: 'Médoc',      vintage: 2016, grapes: ['Cabernet Sauvignon','Merlot','Cabernet Franc'],        rating: 4, drankAt: '2025.09.20', occasion: '동료 송별',       note: '체리, 삼나무, 은은한 바닐라. 우아함의 정석.',                   color: '#451123', label: 'B'  },
  { id: 'w09', name: 'Château Brane-Cantenac',    producer: 'Deuxièmes Crus',            appellation: 'Margaux',         subregion: 'Médoc',      vintage: 2017, grapes: ['Cabernet Sauvignon','Merlot'],                         rating: 4, drankAt: '2025.08.14', occasion: '여름 휴가',       note: '가벼운 꽃향, 라즈베리, 매끄러운 마무리.',                       color: '#52132a', label: 'BC' },
  { id: 'w10', name: 'Château Smith Haut Lafitte',producer: 'Cru Classé de Graves',      appellation: 'Pessac-Léognan',  subregion: 'Graves',     vintage: 2015, grapes: ['Cabernet Sauvignon','Merlot','Petit Verdot'],         rating: 5, drankAt: '2025.07.30', occasion: '생일',            note: '훈연향, 블루베리, 광물성. 모던과 클래식의 균형.',               color: '#370e1c', label: 'SH' },
  { id: 'w11', name: 'Château Haut-Bailly',       producer: 'Cru Classé de Graves',      appellation: 'Pessac-Léognan',  subregion: 'Graves',     vintage: 2016, grapes: ['Cabernet Sauvignon','Merlot'],                         rating: 4, drankAt: '2025.06.18', occasion: '비즈니스 디너',   note: '섬세한 향, 카시스, 흑연. 구조와 우아함이 공존.',                color: '#3f0f20', label: 'HB' },
  { id: 'w12', name: 'Château Rauzan-Ségla',      producer: 'Deuxièmes Crus',            appellation: 'Margaux',         subregion: 'Médoc',      vintage: 2018, grapes: ['Cabernet Sauvignon','Merlot'],                         rating: 4, drankAt: '2025.05.25', occasion: '봄 피크닉 디너',  note: '향긋한 꽃, 잘 익은 자두, 비단 같은 탄닌.',                      color: '#481128', label: 'RS' },
  { id: 'w13', name: "Château d'Issan",           producer: 'Troisièmes Crus',           appellation: 'Margaux',         subregion: 'Médoc',      vintage: 2019, grapes: ['Cabernet Sauvignon','Merlot'],                         rating: 3, drankAt: '2025.04.10', occasion: '캐주얼 디너',     note: '신선한 베리, 가벼운 바디. 영하지만 매력 있는 한 잔.',           color: '#56142b', label: 'DI' },
];
```

### 3.3 Sorting

```ts
function sortWines(wines: Wine[], by: 'recent'|'rating'|'vintage') {
  const arr = [...wines];
  if (by === 'recent')  arr.sort((a,b) => b.drankAt.localeCompare(a.drankAt));
  if (by === 'rating')  arr.sort((a,b) => b.rating - a.rating);
  if (by === 'vintage') arr.sort((a,b) => b.vintage - a.vintage);
  return arr;
}
```

`drankAt` is `'YYYY.MM.DD'` so string compare is equivalent to date compare.

---

## 4. Variation A — Bottom Sheet  *(primary)*

> Map fills the screen; a sheet slides up from the bottom, covering ~62% by default. A drag handle at the top of the sheet **resizes** it (clamped 18%–92% of screen height).

### 4.1 Layout

```
┌───────────────────────────────┐  ← PhoneShell (360×720)
│  ── notch ──                  │
│  9:41             ▭▭ ▭▭       │  ← StatusBar
│                               │
│   ‹    Ma Cave    ⌕           │  ← top bar, glass pills, z 20
│                               │
│   (France map, radial bg)     │  ← absolute, full bleed
│                               │
│  ┌─────────────────────────┐  │
│  │ ▭▭▭   (drag handle)     │  │  ← sheet at sheetHeight*100% of screen
│  │ 보르도  Bordeaux         │  │     (default 62%, range 18–92)
│  │ ▭ 13병  │ 4.4 🍷 │ Margaux│  │
│  ├─────────────────────────┤  │
│  │ [최근][평점][빈티지]   13 │  │
│  ├─────────────────────────┤  │
│  │ [bottle] Wine name       │  │  ← rich list rows
│  │          MARGAUX · 2015  │  │
│  │          tasting note…   │  │
│  │          🍷🍷🍷🍷🍷  date │  │
│  │ ──────────────────────── │  │
│  │ …                        │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

### 4.2 Map area
- Absolute, inset 0.
- Background: `radial-gradient(ellipse at 30% 30%, #2a1845 0%, #150b25 50%, #0a0612 100%)`.
- `<FranceMap>` overlay at `inset:0` opacity 0.95.

### 4.3 Top bar
- Absolute `top: 44`, padding `8 16`, flex justify-between, z 20.
- Two 36×36 glass icon buttons (background `rgba(255,255,255,0.08)` with `backdrop-filter: blur(20px)`).
- Center: `Ma Cave` in Cormorant italic 16, color `text.secondary`, letter-spacing 0.3.

### 4.4 Bottom sheet
- Absolute, left/right/bottom 0, `height: ${sheetHeight*100}%` (state: `sheetHeight`, default `0.62`).
- Background: `linear-gradient(180deg, sheetTop 0%, sheetBot 100%)` + `backdrop-filter: blur(40px)`.
- `border-top-left-radius` and `top-right-radius`: 28.
- Box-shadow: `shadow.sheet`.
- z 30. **No CSS transition** while dragging.

#### Drag handle
- Wrapper: padding `10 0 6`, cursor `grab`, flex center.
- Bar: 40 × 4 radius 2, `rgba(255,255,255,0.25)`.
- Drag math (must match exactly):
  ```ts
  const startY = touch ? e.touches[0].clientY : e.clientY;
  const startH = sheetHeight;
  const containerH = handle.parentElement.offsetHeight; // === phone inner height
  function onMove(ev) {
    const y = touch ? ev.touches[0].clientY : ev.clientY;
    const dy = startY - y;                        // up = positive
    const next = clamp(0.18, 0.92, startH + dy / containerH);
    setSheetHeight(next);
  }
  ```
  Attach `mousemove`/`mouseup` and `touchmove`/`touchend` to `window`. Detach both on release.

#### Header (inside sheet, padding `4 20 14`)
- Row 1, baseline-aligned, gap 8:
  - "보르도" — `display.region` white
  - "Bordeaux" — `display.subtitle` `text.warmMuted`
- Row 2 (margin-top 12), flex gap 14:
  - **총** `13병`
  - vertical 1px divider `rgba(255,255,255,0.08)`
  - **평균** `4.4` + inline `WineGlassIcon size={11} color={gold}`
  - divider
  - **최애** `Margaux` (uses `display.subtitle` style — italic Cormorant 15)

`Stat` component layout: column, gap 2; `eyebrow.sm` label uppercase 0.6 ls; value `body.lg` weight 600 white.

#### Sort tabs (padding `0 20 10`, border-bottom hair)
- Three pill buttons in flex row, gap 6: `[최근] [평점] [빈티지]`.
- Active: background `gold`, color `#1a0d24`, weight 500.
- Inactive: transparent, color `text.body`.
- Right side: count "13" `body.xs` `text.faint`.

#### List
- `flex: 1`, `overflow-y: auto`, padding `12 16 24`, column gap 10.

#### `<WineRowA wine />` — rich row card
```
┌──────────────────────────────────────────┐
│ [bottle 48×108]  Wine Name (serif 17)    │
│                  MARGAUX · 2015 (eyebrow)│
│                  one-line note…          │
│                  🍷🍷🍷🍷🍷       2026.04.18│
└──────────────────────────────────────────┘
```
- Container: flex row, gap 12, padding 12, background `rgba(255,255,255,0.03)`, radius `card`, border `stroke.thin`.
- Bottle wrapper: 56 × 110, radius 8, radial gradient overlay `radial(ellipse at top, transparent 60%, rgba(0,0,0,0.4) 100%)`, contains `<BottleSilhouette width={48} height={108}>`.
- Right column: flex column gap 4.
  - Name: `display.wineM`, color white, `text-wrap: pretty`.
  - Eyebrow: `eyebrow.md` color **gold**, format `${appellation} · ${vintage}` UPPERCASE.
  - Note: `body.sm`, `text.body`, **2-line clamp** (`-webkit-line-clamp: 2`), margin-top 2.
  - Footer (margin-top auto, padding-top 6, flex justify-between):
    - `<WineGlassRating value={rating} size={9} color={gold} gap={2} />`
    - `drankAt` — `body.xs` `text.faint`.

---

## 5. Variation C — Glass Card Stack

> Map fills the screen. A floating glass card overlays the center showing **one** wine in detail. Two faded "peek" cards sit behind it for the next two entries. A glass dock at the bottom shows region stats. Sort pill is centered just under the top bar.

### 5.1 Layout

```
┌───────────────────────────────┐
│  ── notch ──                  │
│  9:41             ▭▭ ▭▭       │
│                               │
│   ‹     BORDEAUX              │  ← top bar, two-line center
│         보르도        ⌕        │
│                               │
│        [ 최근  평점  빈티지 ]    │  ← centered sort pill, glass
│                               │
│   ┌────────────────────────┐  │  ← peek card 2 (under everything)
│   │  ┌────────────────────┐│  │  ← peek card 1
│   │  │ [bottle] MÉDOC      ││  │  ← active glass card
│   │  │          Wine Name  ││  │
│   │  │          Appel·Year ││  │
│   │  │          🍷🍷🍷🍷🍷  ││  │
│   │  │ ┌──────────────────┐││  │
│   │  │ │ TASTING NOTE     │││  │
│   │  │ │ "italic note…"   │││  │
│   │  │ └──────────────────┘││  │
│   │  │ Grapes   Drank      ││  │
│   │  │ Occasion Producer   ││  │
│   │  │ 1/13           ‹  › ││  │
│   │  └────────────────────┘│  │
│   └────────────────────────┘  │
│                               │
│   ┌────────────────────────┐  │
│   │ 총 │ 평균 │ 최애         │  │  ← glass dock
│   └────────────────────────┘  │
└───────────────────────────────┘
```

### 5.2 Background
- Absolute inset 0, `radial-gradient(ellipse at 30% 30%, #321b52 0%, #150b25 50%, #0a0612 100%)` (note **bgLighter** stop, brighter than A).
- `<FranceMap highlight="bordeaux" />` full bleed.

### 5.3 Top bar (`top: 44`, z 30)
- Padding `8 16`, justify between.
- Left: 36×36 glass back button. Background `rgba(20,12,35,0.65)` blur 20, border `stroke.default`. (Slightly darker glass than A — this is intentional because the map is brighter behind C.)
- Center: column, items center.
  - Eyebrow: "BORDEAUX" — `display.subtitle` style but uppercase, font-size 11, color `text.warmFaint`, letter-spacing 0.5.
  - Title: "보르도" — `display.brand`, white.
- Right: search button, same style as left.

### 5.4 Sort pill (`top: 100`, centered, z 30)
- Container: padding 3, radius `chip`, background `surface.glassPanel`, blur 20, border `stroke.default`.
- Three buttons inside, padding `5 14`, font-size 11. Same active/inactive treatment as A. Selecting a tab also resets `idx → 0`.

### 5.5 Card stack (`top: 152, left/right: 18, height: 380, z: 25`)

State: `idx` (number, default 0), `sortBy`. `sorted = sortWines(wines, sortBy)`. `w = sorted[idx]`.

#### Peek cards
For `off ∈ [2, 1]` (render in that order so off=1 paints on top of off=2):
```ts
if (idx + off >= sorted.length) skip;
style = {
  position: 'absolute', inset: 0,
  transform: `translateY(${off*8}px) scale(${1 - off*0.04})`,
  opacity: 0.4 - off*0.15,            // 0.25 for off=2, 0.4 for off=1 — wait, recompute
  borderRadius: radius.sheet,         // 24
  background: 'rgba(40,25,55,0.65)',
  backdropFilter: blur.panel,
  border: `1px solid ${stroke.default}`,
  boxShadow: shadow.bottle,
};
```
*(Effective opacity: off=1 → 0.25, off=2 → 0.10 by formula `0.4 - off*0.15`. Match exactly.)*

#### Active card
- Absolute inset 0, radius 24.
- Background: `linear-gradient(180deg, surface.cardTop 0%, surface.cardBot 100%)`.
- `backdrop-filter: blur(30px)`.
- Border: `1px solid stroke.strong`.
- Box-shadow: `${shadow.card}, 0 0 0 1px ${gold}20 inset` (gold ring at 12% alpha — concatenate the hex tokens with `20`).
- Padding 22, flex column gap 14, overflow hidden.

##### Card body sections
1. **Top** — flex row, gap 16, items start
   - `<BottleSilhouette width={64} height={150} />` (no wrapper)
   - Right column, padding-top 4:
     - Subregion eyebrow — `eyebrow.lg` color `gold`, UPPERCASE
     - Wine name — `display.wineXL`, white, `text-wrap: balance`, margin-top 4
     - Appellation+vintage — `display.subtitle`, color `text.body`, format `${appellation} · ${vintage}`, margin-top 2
     - Margin-top 10: `<WineGlassRating value={rating} size={11} color={gold} gap={3} />`
2. **Tasting note box** — padding `12 14`, background `rgba(255,255,255,0.04)`, radius `field`, border `stroke.thin`.
   - Eyebrow "Tasting Note" — `eyebrow.sm` color `text.warmFaint`, UPPERCASE, margin-bottom 4
   - Note — `display.note`, color `text.secondary`, **wrapped in literal quote marks** `"…"`
3. **Meta grid** — `display: grid`, 2 columns, gap 10. Four `<MetaC>` cells:
   - **Grapes** — first 2 grapes joined by ` · `
   - **Drank** — `wine.drankAt`
   - **Occasion** — `wine.occasion`
   - **Producer** — `wine.producer` *(rendered with `small` flag → font-size 10)*

   Each `<MetaC>`:
   - Label: `eyebrow.sm` color `text.warmGhost`, UPPERCASE.
   - Value: `body.md` (or `body.xs` when small) weight 500 color `text.secondary`, single-line ellipsis.
4. **Footer** — margin-top auto, padding-top 4, flex justify-between, items center.
   - Counter: `display.note` style (italic Cormorant 13) color `text.faint`, format `${idx+1} / ${sorted.length}`.
   - Nav buttons row, gap 8:
     - 36×36 circular. Disabled: bg `rgba(255,255,255,0.04)`, color `rgba(255,255,255,0.2)`. Enabled: bg `gold`, color `#1a0d24` weight 600. Font-size 18.
     - Left `‹` decrements idx (clamp 0). Right `›` increments idx (clamp `len-1`).

#### Optional touch swipe
- On the active card, support horizontal swipe: `touchstart` records `x0`, `touchend` reads `dx`. If `dx < -40` → next; `dx > 40` → prev. Skip if you don't have time — buttons are sufficient for the brief.

### 5.6 Bottom dock (`bottom: 16, left/right: 16, z: 20`)
- Padding `14 18`, radius `panel` (22), background `surface.glassPanel`, blur 30, border `stroke.default`, shadow `shadow.dock`.
- Flex justify-around with two 1×28 dividers between three cells.
- Cells (`<DockStat>`):
  - **총** `13병`
  - **평균** `4.4` + inline 11px gold WineGlassIcon
  - **최애** `Margaux '15` (small → italic Cormorant 14)

`<DockStat>` layout: column items-center gap 2; label `eyebrow.sm` `text.muted` letter-spacing 0.5; value `body.lg` weight 600 white (or italic serif 14 when small).

---

## 6. Top-level shell

```tsx
function App() {
  const [palette, setPalette] = useState<keyof typeof palettes>('wine');
  const p = palettes[palette];
  return (
    <Tabs>
      <Tab label="Bottom Sheet">
        <PhoneShell><VariationA accent={p.accent} gold={p.gold} /></PhoneShell>
      </Tab>
      <Tab label="Glass Card">
        <PhoneShell><VariationC accent={p.accent} gold={p.gold} /></PhoneShell>
      </Tab>
    </Tabs>
  );
}
```

Both variations share `<PhoneShell>`, `<StatusBar>`, `<FranceMap>`, `<BottleSilhouette>`, `<WineGlassRating>`, the seed data, and the sort helper. Drop the in-page palette tabs if not desired — palette can be a single prop on the `<App>` root.

---

## 7. Interaction summary (testable acceptance criteria)

### A · Bottom Sheet
1. Initial render: sheet covers ~62% of phone inner height. Map visible above.
2. Tapping sort tab **최근/평점/빈티지** re-orders the list immediately.
3. Default order is `recent`; first row is `Château Margaux 2015 · 2026.04.18`.
4. Dragging the handle up enlarges the sheet (max 92%); down shrinks (min 18%). Movement tracks finger 1:1.
5. Mouse and touch both work; releasing pointer ends drag.
6. Wine name renders in serif; vintage block in eyebrow uppercase.
7. Notes truncate at 2 lines.
8. Header stats read `13병 · 4.4🍷 · Margaux`.

### C · Glass Card Stack
1. Initial render: hero card shows `idx 0` (Margaux '15 by default sort `recent`). Counter "1 / 13".
2. Right nav button advances `idx`; counter and card content update; left button reverses. Buttons disable at bounds.
3. Behind the hero, exactly two faded peek cards render, scaled and translated down by 8/16 px and 0.04/0.08 scale; opacity 0.25 / 0.10. They disappear correctly when fewer than 2 follow-up wines remain.
4. Sort pill changes order **and** resets `idx` to 0.
5. Tasting note appears in serif italic between literal quote marks.
6. Bottom dock always visible, never overlaps the active card by default.

### Both
- Map highlight on Bordeaux: glow filter + gold outline + gold callout pill `보르도 13병`.
- Wine glass rating glyph used everywhere a rating is shown — no stars.
- Korean text never breaks mid-character (use default `word-break: keep-all` if you see issues).

---

## 8. File layout (suggested)

```
src/
  tokens/
    colors.ts
    typography.ts
    spacing.ts
  data/
    bordeaux.ts            // Wine[], stats
  components/
    PhoneShell.tsx
    StatusBar.tsx
    FranceMap.tsx
    BottleSilhouette.tsx
    WineGlassRating.tsx
  variations/
    BottomSheet/
      index.tsx            // VariationA
      WineRow.tsx
      Stat.tsx
    GlassCardStack/
      index.tsx            // VariationC
      MetaCell.tsx
      DockStat.tsx
  App.tsx
```

If using a single-file delivery instead, keep the same component names and export contracts so structure can be refactored later.

---

## 9. Things NOT to invent

- Don't add new wines, change names, or translate notes.
- Don't substitute star ratings for the bespoke wine-glass glyph.
- Don't move the Bordeaux callout to the right side of the region — Bordeaux's offset is **negative** (`x - 18`) because the region sits on the left of the map and the pill goes further left.
- Don't add Variation B (Split View) — it's intentionally excluded from this handoff.
- Don't add bottom tab bars, FABs, search results, or wine-detail sub-screens. Scope is exactly the two screens above.
- Don't replace Cormorant Garamond with another serif (Playfair, Fraunces). The italic feel is part of the brand.

---

## 10. Reference

The original prototype HTML lives at `Bordeaux Wine Cellar.html`; treat this spec as authoritative when the two disagree.
