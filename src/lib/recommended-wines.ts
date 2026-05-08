export type RecommendedWine = {
  id: string;
  initials: string;
  name: string;
  country: string;
  region: string;
  coords: [number, number];
  priceKrw: number;
  styleHint: string;
};

export const STARTING_WINE: RecommendedWine = {
  id: 'bdx-margaux',
  initials: 'CM',
  name: 'Château Margaux',
  country: '프랑스',
  region: 'Bordeaux',
  coords: [-0.578, 44.838],
  priceKrw: 0,
  styleHint: '당신이 마신 와인',
};

export const RECOMMENDED_WINES: RecommendedWine[] = [
  {
    id: 'bdx-sup',
    initials: 'BS',
    name: 'Bordeaux Supérieur',
    country: '프랑스',
    region: 'Bordeaux',
    coords: [-0.378, 44.638],
    priceKrw: 35000,
    styleHint: '미디엄 바디 보르도',
  },
  {
    id: 'chianti',
    initials: 'CC',
    name: 'Chianti Classico',
    country: '이탈리아',
    region: 'Toscana',
    coords: [11.376, 43.469],
    priceKrw: 45000,
    styleHint: '체리·허브, 부드러운 탄닌',
  },
  {
    id: 'valpo',
    initials: 'VP',
    name: 'Valpolicella',
    country: '이탈리아',
    region: 'Veneto',
    coords: [10.992, 45.439],
    priceKrw: 38000,
    styleHint: '가벼운 베리, 산미',
  },
  {
    id: 'rioja',
    initials: 'RJ',
    name: 'Rioja Crianza',
    country: '스페인',
    region: 'Rioja',
    coords: [-2.45, 42.46],
    priceKrw: 35000,
    styleHint: '템프라니요 입문',
  },
  {
    id: 'casillero',
    initials: 'CD',
    name: 'Casillero del Diablo',
    country: '칠레',
    region: 'Central Valley',
    coords: [-70.66, -33.45],
    priceKrw: 22000,
    styleHint: '편의점 가성비 입문',
  },
  {
    id: 'mendoza',
    initials: 'MM',
    name: 'Mendoza Malbec',
    country: '아르헨티나',
    region: 'Mendoza',
    coords: [-68.85, -32.89],
    priceKrw: 32000,
    styleHint: '진한 과실, 부드러움',
  },
  {
    id: 'cloudy',
    initials: 'CB',
    name: 'Cloudy Bay SB',
    country: '뉴질랜드',
    region: 'Marlborough',
    coords: [173.95, -41.52],
    priceKrw: 65000,
    styleHint: '상쾌한 화이트 입문',
  },
  {
    id: 'jacobs',
    initials: 'JC',
    name: "Jacob's Creek Shiraz",
    country: '호주',
    region: 'South Australia',
    coords: [138.6, -34.93],
    priceKrw: 28000,
    styleHint: '풀바디 입문',
  },
  {
    id: 'pinot-or',
    initials: 'PO',
    name: 'Oregon Pinot Noir',
    country: '미국',
    region: 'Willamette',
    coords: [-123.06, 45.30],
    priceKrw: 55000,
    styleHint: '가벼운 피노 누아 입문',
  },
];

export const formatKrw = (krw: number) => `₩${krw.toLocaleString('ko-KR')}`;
