export type WineType = 'red' | 'white' | 'rosé';

export type RecommendedWine = {
  id: string;
  initials: string;
  label: string;       // short label rendered on bottle (e.g. "CC")
  appellation: string; // small text on bottle (e.g. "CHIANTI")
  vintage: number;     // year shown on bottle
  name: string;
  country: string;
  region: string;
  coords: [number, number];
  isoNumeric: string;
  priceKrw: number;
  styleHint: string;
  wineType: WineType;
  bottleColor: string;
};

// Starting wine — the wine the user already drank (kicks off the recommendation).
// Margaux: Bordeaux 1er Grand Cru, Cabernet Sauvignon · Merlot blend, full-bodied.
export const STARTING_WINE: RecommendedWine = {
  id: 'bdx-margaux',
  initials: 'CM',
  label: 'CM',
  appellation: 'MARGAUX',
  vintage: 2018,
  name: 'Château Margaux',
  country: '프랑스',
  region: 'Bordeaux',
  coords: [-0.578, 44.838],
  isoNumeric: '250',
  priceKrw: 0,
  styleHint: '당신이 마신 와인',
  wineType: 'red',
  bottleColor: '#5b1424',
};

// Recommended starter wines (~₩20–60k) — all selected to mirror Margaux's profile:
// medium-to-full-body dry red, structured tannins, similar drinking occasion.
// One representative per country so the map stays readable.
export const RECOMMENDED_WINES: RecommendedWine[] = [
  {
    id: 'chianti',
    initials: 'CC',
    label: 'CC',
    appellation: 'CHIANTI',
    vintage: 2021,
    name: 'Chianti Classico',
    country: '이탈리아',
    region: 'Toscana',
    coords: [11.376, 43.469],
    isoNumeric: '380',
    priceKrw: 45000,
    styleHint: '미디엄 풀바디 · 산지오베제',
    wineType: 'red',
    bottleColor: '#8B1A2A',
  },
  {
    id: 'rioja',
    initials: 'RJ',
    label: 'RJ',
    appellation: 'RIOJA',
    vintage: 2019,
    name: 'Rioja Crianza',
    country: '스페인',
    region: 'Rioja',
    coords: [-2.45, 42.46],
    isoNumeric: '724',
    priceKrw: 35000,
    styleHint: '풀바디 · 템프라니요·오크',
    wineType: 'red',
    bottleColor: '#6B1421',
  },
  {
    id: 'casillero',
    initials: 'CD',
    label: 'CD',
    appellation: 'MAIPO',
    vintage: 2022,
    name: 'Casillero del Diablo Cabernet',
    country: '칠레',
    region: 'Maipo Valley',
    coords: [-70.66, -33.45],
    isoNumeric: '152',
    priceKrw: 22000,
    styleHint: '미디엄 풀바디 · 카베르네',
    wineType: 'red',
    bottleColor: '#5b1424',
  },
  {
    id: 'mendoza',
    initials: 'MM',
    label: 'MM',
    appellation: 'MENDOZA',
    vintage: 2020,
    name: 'Mendoza Malbec',
    country: '아르헨티나',
    region: 'Mendoza',
    coords: [-68.85, -32.89],
    isoNumeric: '032',
    priceKrw: 32000,
    styleHint: '풀바디 · 말벡',
    wineType: 'red',
    bottleColor: '#4a1226',
  },
  {
    id: 'nz-pinot',
    initials: 'MP',
    label: 'MP',
    appellation: 'MARLBOR',
    vintage: 2021,
    name: 'Marlborough Pinot Noir',
    country: '뉴질랜드',
    region: 'Marlborough',
    coords: [173.95, -41.52],
    isoNumeric: '554',
    priceKrw: 52000,
    styleHint: '미디엄 바디 · 피노 누아',
    wineType: 'red',
    bottleColor: '#7c1c33',
  },
  {
    id: 'jacobs',
    initials: 'JC',
    label: 'JC',
    appellation: 'BAROSSA',
    vintage: 2021,
    name: "Jacob's Creek Shiraz",
    country: '호주',
    region: 'South Australia',
    coords: [138.6, -34.93],
    isoNumeric: '036',
    priceKrw: 28000,
    styleHint: '풀바디 · 시라즈',
    wineType: 'red',
    bottleColor: '#7c1c33',
  },
  {
    id: 'napa-cab',
    initials: 'NC',
    label: 'NC',
    appellation: 'NAPA',
    vintage: 2020,
    name: 'Napa Cabernet',
    country: '미국',
    region: 'Napa Valley',
    coords: [-122.27, 38.30],
    isoNumeric: '840',
    priceKrw: 48000,
    styleHint: '풀바디 · 카베르네',
    wineType: 'red',
    bottleColor: '#5b1424',
  },
];

// Lookup helper — used by the map to resolve pinIds.
export const ALL_WINES: RecommendedWine[] = [STARTING_WINE, ...RECOMMENDED_WINES];

export const formatKrw = (krw: number) => `₩${krw.toLocaleString('ko-KR')}`;
