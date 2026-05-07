'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { useLocale } from '@/components/providers/locale-provider';

const DEPT_URL = '/france-departments.json';
const GOLD = '#f0c876';
const BURGUNDY_DEPTS = new Set(['21', '71', '89', '58', '01', '70', '39']);

type FilterKey = 'subregion' | 'producer' | 'vineyard';

// ── Data ────────────────────────────────────────────────────────────────────

type SubRegionData = {
  id: string; name: string; nameKo: string; coords: [number, number];
  grapes: string; blurb: string; color: string;
};

type ProducerData = {
  id: string; name: string; initials: string; coords: [number, number];
  village: string; blurb: string;
};

type VineyardData = {
  id: string; name: string; coords: [number, number];
  classification: 'Grand Cru' | '1er Cru';
  subregion: string; area: string;
};

type Wine = {
  id: string;
  name: string;
  vintage: number;
  producerId: string;
  vineyardId?: string;
  subregionId: string;
  village: string;
  date: string;
  occasion?: string;
  note: string;
  coords: [number, number];
  color: string;
  label: string;
  rating: number;
  appellation: string;
};

const SUB_REGIONS: SubRegionData[] = [
  { id: 'chablis',     name: 'Chablis',          nameKo: '샤블리',         coords: [3.80, 47.83], grapes: 'Chardonnay',          blurb: '백악·미네랄의 정점',                color: '#4A7AB5' },
  { id: 'cote-nuits',  name: 'Côte de Nuits',    nameKo: '코트 드 뉘',     coords: [5.01, 47.21], grapes: 'Pinot Noir',          blurb: '피노 누아의 성지',                  color: '#8B1A2A' },
  { id: 'cote-beaune', name: 'Côte de Beaune',   nameKo: '코트 드 본',     coords: [4.85, 46.99], grapes: 'Chardonnay · Pinot',  blurb: 'Montrachet의 고향',                 color: '#C9A84C' },
  { id: 'chalonnaise', name: 'Côte Chalonnaise', nameKo: '코트 샬로네즈',  coords: [4.78, 46.72], grapes: 'Pinot · Chardonnay',  blurb: 'Mercurey·Givry 가성비',             color: '#9B7A4C' },
  { id: 'maconnais',   name: 'Mâconnais',        nameKo: '마코네',         coords: [4.78, 46.42], grapes: 'Chardonnay',          blurb: 'Pouilly-Fuissé 1er Cru',            color: '#6B8E4E' },
  { id: 'beaujolais',  name: 'Beaujolais',       nameKo: '보졸레',         coords: [4.45, 46.08], grapes: 'Gamay',               blurb: '화강암 위 10개 크뤼',               color: '#7B2D5E' },
];

const PRODUCERS: ProducerData[] = [
  { id: 'drc',      name: 'Domaine de la Romanée-Conti', initials: 'DRC', coords: [4.975, 47.171], village: 'Vosne-Romanée',     blurb: '전설 중의 전설. 모노폴 1.81ha.' },
  { id: 'rousseau', name: 'Armand Rousseau',             initials: 'AR',  coords: [5.002, 47.226], village: 'Gevrey-Chambertin', blurb: '게브레이의 절대자. Chambertin의 기준.' },
  { id: 'leroy',    name: 'Domaine Leroy',               initials: 'LR',  coords: [4.970, 47.174], village: 'Vosne-Romanée',     blurb: '비오디나믹. 에이커당 부르고뉴 최고가.' },
  { id: 'coche',    name: 'Coche-Dury',                  initials: 'CD',  coords: [4.836, 46.976], village: 'Meursault',         blurb: '뫼르소 최고봉. 희소성과 정교함.' },
  { id: 'lafon',    name: 'Comtes Lafon',                initials: 'CL',  coords: [4.831, 46.973], village: 'Meursault',         blurb: '뫼르소 왕가. Perrières는 매년 완판.' },
  { id: 'leflaive', name: 'Domaine Leflaive',            initials: 'LF',  coords: [4.797, 46.941], village: 'Puligny-Montrachet',blurb: '화이트 부르고뉴의 정점.' },
  { id: 'roulot',   name: 'Domaine Roulot',              initials: 'RL',  coords: [4.833, 46.978], village: 'Meursault',         blurb: '장-마르크 룰로. 현대 뫼르소의 기준.' },
  { id: 'raveneau', name: 'Raveneau',                    initials: 'RV',  coords: [3.801, 47.821], village: 'Chablis',           blurb: '샤블리 최고봉. 구하기 가장 어려운 와인.' },
  { id: 'dujac',    name: 'Domaine Dujac',               initials: 'DJ',  coords: [4.983, 47.201], village: 'Morey-Saint-Denis', blurb: '엘레강스와 투명함의 정수.' },
  { id: 'gouges',   name: 'Henri Gouges',                initials: 'HG',  coords: [4.959, 47.109], village: 'Nuits-Saint-Georges',blurb: '뉘-생-조르주의 기준. 그랑 크뤼 없는 최고 도멘.' },
];

const VINEYARDS: VineyardData[] = [
  { id: 'romanee-conti',     name: 'Romanée-Conti',           coords: [4.975, 47.171], classification: 'Grand Cru', subregion: 'Vosne-Romanée',     area: '1.81 ha' },
  { id: 'la-tache',          name: 'La Tâche',                coords: [4.974, 47.168], classification: 'Grand Cru', subregion: 'Vosne-Romanée',     area: '6.06 ha' },
  { id: 'richebourg',        name: 'Richebourg',              coords: [4.974, 47.175], classification: 'Grand Cru', subregion: 'Vosne-Romanée',     area: '8.03 ha' },
  { id: 'chambertin',        name: 'Chambertin',              coords: [5.003, 47.223], classification: 'Grand Cru', subregion: 'Gevrey-Chambertin', area: '12.9 ha' },
  { id: 'clos-saint-jacques',name: 'Clos Saint-Jacques',      coords: [5.004, 47.228], classification: '1er Cru',   subregion: 'Gevrey-Chambertin', area: '6.7 ha' },
  { id: 'musigny',           name: 'Musigny',                 coords: [4.972, 47.203], classification: 'Grand Cru', subregion: 'Chambolle-Musigny', area: '10.7 ha' },
  { id: 'clos-de-la-roche',  name: 'Clos de la Roche',        coords: [4.978, 47.205], classification: 'Grand Cru', subregion: 'Morey-Saint-Denis', area: '16.9 ha' },
  { id: 'clos-vougeot',      name: 'Clos de Vougeot',         coords: [4.970, 47.195], classification: 'Grand Cru', subregion: 'Vougeot',           area: '50.6 ha' },
  { id: 'les-pruliers',      name: 'NSG Les Pruliers',        coords: [4.959, 47.109], classification: '1er Cru',   subregion: 'Nuits-Saint-Georges',area: '7.1 ha' },
  { id: 'perrieres',         name: 'Meursault Perrières',     coords: [4.830, 46.978], classification: '1er Cru',   subregion: 'Meursault',         area: '13.7 ha' },
  { id: 'charmes',           name: 'Meursault Charmes',       coords: [4.829, 46.974], classification: '1er Cru',   subregion: 'Meursault',         area: '31.1 ha' },
  { id: 'montrachet',        name: 'Chevalier-Montrachet',    coords: [4.797, 46.942], classification: 'Grand Cru', subregion: 'Puligny-Montrachet',area: '7.5 ha' },
  { id: 'valmur',            name: 'Chablis GC Valmur',       coords: [3.815, 47.823], classification: 'Grand Cru', subregion: 'Chablis',           area: '11.0 ha' },
];

// ── 내가 마신 와인 (AI 자동 분류) ────────────────────────────────────────────
const WINES: Wine[] = [
  { id: 'w01', name: 'Romanée-Conti',              vintage: 2018, producerId: 'drc',      vineyardId: 'romanee-conti',     subregionId: 'cote-nuits',  village: 'Vosne-Romanée',     date: '2025.11.20', occasion: '결혼 10주년', note: '장미꽃잎, 동양 향신료, 끝없는 여운.',  coords: [4.975, 47.171], color: '#5b1424', label: 'RC',  rating: 5, appellation: 'Vosne'     },
  { id: 'w02', name: 'La Tâche',                   vintage: 2017, producerId: 'drc',      vineyardId: 'la-tache',          subregionId: 'cote-nuits',  village: 'Vosne-Romanée',     date: '2025.05.04', occasion: '와인 모임',   note: '검은 체리, 가죽, 트뤼플의 깊이.',      coords: [4.974, 47.168], color: '#4a1226', label: 'LT',  rating: 5, appellation: 'Vosne'     },
  { id: 'w03', name: 'Richebourg',                 vintage: 2016, producerId: 'leroy',    vineyardId: 'richebourg',        subregionId: 'cote-nuits',  village: 'Vosne-Romanée',     date: '2025.09.18', occasion: '생일',        note: '벨벳 같은 질감, 짙은 베리.',           coords: [4.974, 47.175], color: '#56142b', label: 'RB',  rating: 5, appellation: 'Vosne'     },
  { id: 'w04', name: 'Musigny',                    vintage: 2018, producerId: 'leroy',    vineyardId: 'musigny',           subregionId: 'cote-nuits',  village: 'Chambolle-Musigny', date: '2025.07.22',                          note: '제비꽃, 라즈베리, 실키한 탄닌.',       coords: [4.972, 47.203], color: '#481128', label: 'MU',  rating: 5, appellation: 'Chambolle' },
  { id: 'w05', name: 'Chambertin',                 vintage: 2017, producerId: 'rousseau', vineyardId: 'chambertin',        subregionId: 'cote-nuits',  village: 'Gevrey-Chambertin', date: '2025.09.12', occasion: '와인 행사',   note: '구조감의 정점. 검은 과실과 감초.',     coords: [5.003, 47.223], color: '#3d0f1f', label: 'CB',  rating: 5, appellation: 'Gevrey'    },
  { id: 'w06', name: 'Clos Saint-Jacques 1er Cru', vintage: 2019, producerId: 'rousseau', vineyardId: 'clos-saint-jacques',subregionId: 'cote-nuits',  village: 'Gevrey-Chambertin', date: '2025.04.02',                          note: '광물성과 붉은 베리의 균형.',           coords: [5.004, 47.228], color: '#4d1124', label: 'CSJ', rating: 4, appellation: 'Gevrey'    },
  { id: 'w07', name: 'Clos de la Roche',           vintage: 2017, producerId: 'dujac',    vineyardId: 'clos-de-la-roche',  subregionId: 'cote-nuits',  village: 'Morey-Saint-Denis', date: '2025.06.14',                          note: '엘레강스, 투명한 붉은 과실.',          coords: [4.978, 47.205], color: '#52132a', label: 'CR',  rating: 5, appellation: 'Morey'     },
  { id: 'w08', name: 'Clos de Vougeot',            vintage: 2017, producerId: 'dujac',    vineyardId: 'clos-vougeot',      subregionId: 'cote-nuits',  village: 'Vougeot',           date: '2025.03.10', occasion: '디너',        note: '흙내음, 따뜻한 베리.',                 coords: [4.970, 47.195], color: '#45112a', label: 'CV',  rating: 4, appellation: 'Vougeot'   },
  { id: 'w09', name: 'NSG Les Pruliers 1er Cru',   vintage: 2019, producerId: 'gouges',   vineyardId: 'les-pruliers',      subregionId: 'cote-nuits',  village: 'Nuits-Saint-Georges',date:'2025.08.05',                          note: '강건함, 검은 자두, 미네랄.',           coords: [4.959, 47.109], color: '#3a0d1c', label: 'LP',  rating: 4, appellation: 'NSG'       },
  { id: 'w10', name: 'Meursault Perrières 1er Cru',vintage: 2018, producerId: 'coche',    vineyardId: 'perrieres',         subregionId: 'cote-beaune', village: 'Meursault',         date: '2025.07.30', occasion: '여름 디너',   note: '버터, 헤이즐넛, 짭짤한 미네랄.',       coords: [4.830, 46.978], color: '#7a5c10', label: 'MP',  rating: 5, appellation: 'Meursault' },
  { id: 'w11', name: 'Meursault Perrières 1er Cru',vintage: 2017, producerId: 'lafon',    vineyardId: 'perrieres',         subregionId: 'cote-beaune', village: 'Meursault',         date: '2025.10.05',                          note: '풍부한 과실과 정교한 산미.',           coords: [4.831, 46.973], color: '#6a4c08', label: 'MP',  rating: 5, appellation: 'Meursault' },
  { id: 'w12', name: 'Meursault Charmes 1er Cru',  vintage: 2018, producerId: 'roulot',   vineyardId: 'charmes',           subregionId: 'cote-beaune', village: 'Meursault',         date: '2025.11.01',                          note: '흰 꽃, 시트러스, 정밀한 마무리.',      coords: [4.829, 46.974], color: '#5a3c05', label: 'MC',  rating: 4, appellation: 'Meursault' },
  { id: 'w13', name: 'Chevalier-Montrachet',       vintage: 2019, producerId: 'leflaive', vineyardId: 'montrachet',        subregionId: 'cote-beaune', village: 'Puligny-Montrachet',date: '2025.10.15',                          note: '백악, 흰 꽃, 정교한 산미.',            coords: [4.797, 46.942], color: '#4a3003', label: 'CM',  rating: 5, appellation: 'Puligny'   },
  { id: 'w14', name: 'Chablis GC Valmur',          vintage: 2020, producerId: 'raveneau', vineyardId: 'valmur',            subregionId: 'chablis',     village: 'Chablis',           date: '2025.06.05',                          note: '굴 껍데기, 라임, 부싯돌.',             coords: [3.815, 47.823], color: '#ab8b22', label: 'VM',  rating: 5, appellation: 'Chablis'   },
];

// 그룹별 마신 와인 카운트/리스트 헬퍼
const winesBySubregion: Record<string, Wine[]> = {};
const winesByProducer:  Record<string, Wine[]> = {};
const winesByVineyard:  Record<string, Wine[]> = {};
WINES.forEach(w => {
  (winesBySubregion[w.subregionId] ||= []).push(w);
  (winesByProducer[w.producerId]   ||= []).push(w);
  if (w.vineyardId) (winesByVineyard[w.vineyardId] ||= []).push(w);
});

// ── Map markers ─────────────────────────────────────────────────────────────

function CountBadge({ n, x, y }: { n: number; x: number; y: number }) {
  if (n <= 0) return null;
  return (
    <g transform={`translate(${x},${y})`} style={{ pointerEvents: 'none' }}>
      <circle cx={0} cy={0} r={7} fill="#D42040" stroke="#04010A" strokeWidth={1.2} />
      <text textAnchor="middle" y={2.4}
        style={{ fill: '#fff', fontSize: 7.5, fontFamily: 'Inter,sans-serif', fontWeight: 800 } as React.CSSProperties}>
        {n}
      </text>
    </g>
  );
}

function SubRegionMarker({ data, hovered, onHover }: { data: SubRegionData; hovered: boolean; onHover: (id: string | null) => void }) {
  const count = winesBySubregion[data.id]?.length ?? 0;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: hovered ? 1.12 : 1 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ cursor: 'pointer', pointerEvents: 'all' }}
      onMouseEnter={() => onHover(data.id)}
      onMouseLeave={() => onHover(null)}
    >
      <rect x={-40} y={-16} width={80} height={32} rx={8}
        fill={hovered ? data.color + 'CC' : 'rgba(4,1,10,0.85)'}
        stroke={hovered ? data.color : data.color + '66'}
        strokeWidth={hovered ? 1.5 : 0.8}
      />
      <text textAnchor="middle" y={-3}
        style={{ fill: hovered ? '#fff' : data.color, fontSize: 9, fontFamily: 'Inter,sans-serif', fontWeight: 700 } as React.CSSProperties}>
        {data.nameKo}
      </text>
      <text textAnchor="middle" y={9}
        style={{ fill: hovered ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)', fontSize: 7, fontFamily: 'Inter,sans-serif' } as React.CSSProperties}>
        {data.name}
      </text>
      <CountBadge n={count} x={36} y={-14} />
    </motion.g>
  );
}

function ProducerMarker({ data, hovered, onHover }: { data: ProducerData; hovered: boolean; onHover: (id: string | null) => void }) {
  const count = winesByProducer[data.id]?.length ?? 0;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: hovered ? 1.3 : 1 }}
      transition={{ duration: 0.35 }}
      style={{ cursor: 'pointer', pointerEvents: 'all' }}
      onMouseEnter={() => onHover(data.id)}
      onMouseLeave={() => onHover(null)}
    >
      {hovered && (
        <motion.circle cx={0} cy={0} r={12}
          fill="none" stroke={GOLD} strokeWidth={1}
          animate={{ r: [12, 22], opacity: [0.8, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
      <circle cx={0} cy={0} r={9}
        fill={hovered ? '#C9A84C' : 'rgba(201,168,76,0.15)'}
        stroke={GOLD} strokeWidth={hovered ? 1.5 : 0.8}
      />
      <text textAnchor="middle" y={3.5}
        style={{ fill: hovered ? '#0A0510' : GOLD, fontSize: 6.5, fontFamily: 'Inter,sans-serif', fontWeight: 800 } as React.CSSProperties}>
        {data.initials}
      </text>
      <CountBadge n={count} x={8} y={-8} />
    </motion.g>
  );
}

function VineyardMarker({ data, hovered, onHover }: { data: VineyardData; hovered: boolean; onHover: (id: string | null) => void }) {
  const isGC = data.classification === 'Grand Cru';
  const color = isGC ? '#D42040' : '#C9A84C';
  const count = winesByVineyard[data.id]?.length ?? 0;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: hovered ? 1.4 : 1 }}
      transition={{ duration: 0.35 }}
      style={{ cursor: 'pointer', pointerEvents: 'all' }}
      onMouseEnter={() => onHover(data.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Diamond */}
      <polygon points="0,-10 8,0 0,10 -8,0"
        fill={hovered ? color : color + '22'}
        stroke={color} strokeWidth={hovered ? 1.5 : 0.8}
      />
      <text textAnchor="middle" y={3}
        style={{ fill: hovered ? '#fff' : color, fontSize: 5, fontFamily: 'Inter,sans-serif', fontWeight: 800 } as React.CSSProperties}>
        {isGC ? 'GC' : '1C'}
      </text>
      <CountBadge n={count} x={8} y={-8} />
    </motion.g>
  );
}

// ── Right-panel item cards ──────────────────────────────────────────────────

function WineGlassIcon({ filled, size = 9, color = GOLD, dim = 'rgba(255,255,255,0.18)' }: {
  filled: boolean; size?: number; color?: string; dim?: string;
}) {
  const c = filled ? color : dim;
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 12 16" style={{ flexShrink: 0 }}>
      <path d="M2.5 1 Q2.5 6 6 7 Q9.5 6 9.5 1 Z" fill={filled ? color : 'transparent'} stroke={c} strokeWidth="0.8" strokeLinejoin="round" />
      <line x1="6" y1="7" x2="6" y2="13" stroke={c} strokeWidth="0.8" />
      <line x1="3.5" y1="13.5" x2="8.5" y2="13.5" stroke={c} strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

function WineGlassRating({ value, size = 9, color = GOLD, gap = 2 }: { value: number; size?: number; color?: string; gap?: number }) {
  return (
    <div style={{ display: 'flex', gap, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => <WineGlassIcon key={i} filled={i <= value} size={size} color={color} />)}
    </div>
  );
}

function BottleSilhouette({ wine, width = 44, height = 105 }: { wine: Wine; width?: number; height?: number }) {
  const uid = `bb-${wine.id}`;
  const c = wine.color;
  const lbl = wine.vintage > 0 ? String(wine.vintage) : 'NV';
  const app = (wine.appellation || '').slice(0, 8).toUpperCase();
  return (
    <svg width={width} height={height} viewBox="0 0 48 108" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor={c} stopOpacity="1"    />
          <stop offset="75%" stopColor={c} stopOpacity="0.85" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path d="M15 30 L15 90 Q15 98 24 98 Q33 98 33 90 L33 30 Q31 28 29 26 L29 18 Q29 14 25 14 L23 14 Q19 14 19 18 L19 26 Q17 28 15 30 Z" fill={`url(#${uid})`} />
      <rect x="20" y="9"  width="8"  height="9"  rx="2" fill="#0a0612" fillOpacity="0.85" />
      <rect x="19" y="15" width="10" height="2"        fill={GOLD}     fillOpacity="0.8"  />
      <rect x="17" y="50" width="14" height="24" rx="1" fill="#f5ecd6" stroke={GOLD} strokeWidth="0.5" strokeOpacity="0.6" />
      <text x="24" y="57"   textAnchor="middle" fontFamily="Georgia,serif"  fontSize="3.5" fontStyle="italic" fill="#3d1a26">Domaine</text>
      <text x="24" y="63"   textAnchor="middle" fontFamily="Georgia,serif"  fontSize="5"   fontWeight="bold" fill="#3d1a26">{wine.label}</text>
      <line x1="19" y1="65" x2="29" y2="65" stroke="#3d1a26" strokeWidth="0.4" strokeOpacity="0.5" />
      <text x="24" y="68.5" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="2.5" letterSpacing="0.8" fill="#3d1a26">{app}</text>
      <text x="24" y="72.5" textAnchor="middle" fontFamily="Georgia,serif"   fontSize="4"   fontWeight="600" fill="#3d1a26">{lbl}</text>
    </svg>
  );
}

function WineRow({ wine }: { wine: Wine }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ width: 56, height: 110, borderRadius: 8, flexShrink: 0, background: 'radial-gradient(ellipse at top, transparent 60%, rgba(0,0,0,0.4) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BottleSilhouette wine={wine} width={44} height={105} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 600, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.2px' }}>{wine.name}</div>
        <div style={{ fontSize: 9.5, color: GOLD, letterSpacing: '0.5px', textTransform: 'uppercase' as const, fontWeight: 500 }}>{wine.village} · {wine.vintage > 0 ? wine.vintage : 'NV'}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.45, marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{wine.note}</div>
        <div style={{ marginTop: 'auto', paddingTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
          <WineGlassRating value={wine.rating} size={8} color={GOLD} gap={2} />
          <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)' }}>{wine.date}</span>
        </div>
      </div>
    </div>
  );
}

function CollectedBadge({ count }: { count: number }) {
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 9999,
      background: 'rgba(212,32,64,0.16)', border: '1px solid rgba(212,32,64,0.4)',
      color: '#E06070', letterSpacing: '0.02em', fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>
      AI 분류 · {count}병
    </span>
  );
}

function SubRegionCard({ data, active }: { data: SubRegionData; active: boolean }) {
  const wines = winesBySubregion[data.id] ?? [];
  return (
    <div style={{
      padding: '14px 16px',
      background: active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${active ? data.color + '60' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 12, transition: 'all 200ms',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: data.color, flexShrink: 0, display: 'inline-block' }} />
        <span style={{ fontSize: 15, fontFamily: 'Georgia, serif', color: '#F5F0E8', fontWeight: 600 }}>{data.nameKo}</span>
        <span style={{ fontSize: 11, color: '#9B8B7A', marginLeft: 2 }}>{data.name}</span>
        <span style={{ marginLeft: 'auto' }}>{wines.length > 0 && <CollectedBadge count={wines.length} />}</span>
      </div>
      <div style={{ fontSize: 11, color: GOLD, marginBottom: 2, letterSpacing: '0.02em' }}>{data.grapes}</div>
      <div style={{ fontSize: 11, color: '#7A6E5A', marginBottom: wines.length > 0 ? 10 : 0 }}>{data.blurb}</div>
      {wines.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {wines.map(w => <WineRow key={w.id} wine={w} />)}
        </div>
      )}
    </div>
  );
}

function ProducerCard({ data, active }: { data: ProducerData; active: boolean }) {
  const wines = winesByProducer[data.id] ?? [];
  return (
    <div style={{
      padding: '14px 16px',
      background: active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${active ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 12, transition: 'all 200ms',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: GOLD }}>{data.initials}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: '#F5F0E8', fontWeight: 600, lineHeight: 1.2 }}>{data.name}</div>
          <div style={{ fontSize: 10, color: '#9B8B7A' }}>{data.village}</div>
        </div>
        {wines.length > 0 && <CollectedBadge count={wines.length} />}
      </div>
      <div style={{ fontSize: 11, color: '#6A5E4A', lineHeight: 1.5, marginBottom: wines.length > 0 ? 10 : 0 }}>{data.blurb}</div>
      {wines.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {wines.map(w => <WineRow key={w.id} wine={w} />)}
        </div>
      )}
    </div>
  );
}

function VineyardCard({ data, active }: { data: VineyardData; active: boolean }) {
  const isGC = data.classification === 'Grand Cru';
  const wines = winesByVineyard[data.id] ?? [];
  return (
    <div style={{
      padding: '14px 16px',
      background: active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${active ? (isGC ? 'rgba(212,32,64,0.5)' : 'rgba(201,168,76,0.4)') : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 12, transition: 'all 200ms',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 9, padding: '2px 7px', borderRadius: 9999, fontWeight: 700, letterSpacing: '0.04em',
          background: isGC ? 'rgba(212,32,64,0.2)' : 'rgba(201,168,76,0.15)',
          border: `1px solid ${isGC ? 'rgba(212,32,64,0.5)' : 'rgba(201,168,76,0.4)'}`,
          color: isGC ? '#E06070' : GOLD,
        }}>{data.classification}</span>
        <span style={{ fontSize: 14, fontFamily: 'Georgia, serif', color: '#F5F0E8', fontWeight: 600 }}>{data.name}</span>
        <span style={{ marginLeft: 'auto' }}>{wines.length > 0 && <CollectedBadge count={wines.length} />}</span>
      </div>
      <div style={{ fontSize: 11, color: '#9B8B7A', marginBottom: wines.length > 0 ? 10 : 0 }}>
        {data.subregion} · {data.area}
      </div>
      {wines.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {wines.map(w => <WineRow key={w.id} wine={w} />)}
        </div>
      )}
    </div>
  );
}

// ── Burgundy map ─────────────────────────────────────────────────────────────

function BurgundyMap({ filter, hoveredId, onHover }: {
  filter: FilterKey; hoveredId: string | null; onHover: (id: string | null) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const apply = () => mapRef.current?.querySelectorAll('svg').forEach(s => {
      s.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      s.style.display = 'block';
    });
    apply();
    const obs = new MutationObserver(apply);
    if (mapRef.current) obs.observe(mapRef.current, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [4.2, 47.1], scale: 5800 }}
        width={600} height={700}
        style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
      >
        <Geographies geography={DEPT_URL}>
          {({ geographies }) => geographies.map(geo => {
            const code = geo.properties.code as string;
            const isBurgundy = BURGUNDY_DEPTS.has(code);
            const isBeaujolais = code === '69';
            const fillColor = isBurgundy ? '#D42040' : isBeaujolais ? '#9B3060' : '#180830';
            const fillOpacity = isBurgundy ? (code === '21' ? 0.80 : 0.45) : isBeaujolais ? 0.30 : 1;
            return (
              <Geography key={geo.rsmKey} geography={geo} style={{
                default: { fill: fillColor, fillOpacity, stroke: isBurgundy ? '#5A1028' : '#28085A', strokeWidth: isBurgundy ? 0.8 : 0.4, outline: 'none', transition: 'fill-opacity 300ms' },
                hover: { fill: fillColor, fillOpacity, stroke: isBurgundy ? '#8B1A2A' : '#28085A', strokeWidth: isBurgundy ? 1.0 : 0.4, outline: 'none' },
                pressed: { fill: fillColor, fillOpacity, stroke: '#28085A', strokeWidth: 0.4, outline: 'none' },
              }} />
            );
          })}
        </Geographies>

        {/* Sub-region markers */}
        {filter === 'subregion' && SUB_REGIONS.map(d => (
          <Marker key={d.id} coordinates={d.coords}>
            <SubRegionMarker data={d} hovered={hoveredId === d.id} onHover={onHover} />
          </Marker>
        ))}

        {/* Producer markers */}
        {filter === 'producer' && PRODUCERS.map(d => (
          <Marker key={d.id} coordinates={d.coords}>
            <ProducerMarker data={d} hovered={hoveredId === d.id} onHover={onHover} />
          </Marker>
        ))}

        {/* Vineyard markers */}
        {filter === 'vineyard' && VINEYARDS.map(d => (
          <Marker key={d.id} coordinates={d.coords}>
            <VineyardMarker data={d} hovered={hoveredId === d.id} onHover={onHover} />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}

// ── Filter tab button ─────────────────────────────────────────────────────────

const FILTER_LABELS: Record<FilterKey, { ko: string; en: string }> = {
  subregion: { ko: '상세지역', en: 'Sub-regions' },
  producer:  { ko: '생산자',   en: 'Producers' },
  vineyard:  { ko: '밭',       en: 'Vineyards' },
};

function FilterTab({ fk, active, onClick }: { fk: FilterKey; active: boolean; onClick: () => void }) {
  const { ko, en } = FILTER_LABELS[fk];
  return (
    <button onClick={onClick} style={{
      padding: '6px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
      background: active ? 'rgba(240,200,118,0.14)' : 'rgba(255,255,255,0.04)',
      outline: `1px solid ${active ? 'rgba(240,200,118,0.5)' : 'rgba(255,255,255,0.08)'}`,
      color: active ? GOLD : '#9B8B7A',
      fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all 200ms',
      whiteSpace: 'nowrap',
    }}>
      {ko} <span style={{ fontSize: 10, opacity: 0.65, marginLeft: 2 }}>{en}</span>
    </button>
  );
}

// ── Item list panel content ───────────────────────────────────────────────────

function PanelContent({ filter, hoveredId, onHover }: {
  filter: FilterKey; hoveredId: string | null; onHover: (id: string | null) => void;
}) {
  const items =
    filter === 'subregion' ? SUB_REGIONS :
    filter === 'producer'  ? PRODUCERS :
    VINEYARDS;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={filter}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.22 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {filter === 'subregion' && (SUB_REGIONS as SubRegionData[]).map(d => (
          <div key={d.id} onMouseEnter={() => onHover(d.id)} onMouseLeave={() => onHover(null)}>
            <SubRegionCard data={d} active={hoveredId === d.id} />
          </div>
        ))}
        {filter === 'producer' && (PRODUCERS as ProducerData[]).map(d => (
          <div key={d.id} onMouseEnter={() => onHover(d.id)} onMouseLeave={() => onHover(null)}>
            <ProducerCard data={d} active={hoveredId === d.id} />
          </div>
        ))}
        {filter === 'vineyard' && (VINEYARDS as VineyardData[]).map(d => (
          <div key={d.id} onMouseEnter={() => onHover(d.id)} onMouseLeave={() => onHover(null)}>
            <VineyardCard data={d} active={hoveredId === d.id} />
          </div>
        ))}
        {/* suppress unused var warning */}
        {items.length === 0 && null}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Desktop panel ─────────────────────────────────────────────────────────────

function DesktopPanel({ filter, setFilter, hoveredId, onHover, visible }: {
  filter: FilterKey; setFilter: (f: FilterKey) => void;
  hoveredId: string | null; onHover: (id: string | null) => void;
  visible: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 24 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      style={{
        position: 'absolute', top: '8%', right: '3vw',
        width: 'clamp(260px,30vw,360px)', maxHeight: '84vh', zIndex: 20,
        background: 'rgba(5,2,14,0.94)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(240,200,118,0.18)', borderRadius: 18,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Filter tabs */}
      <div style={{ padding: '14px 16px 12px', display: 'flex', gap: 6, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {(['subregion', 'producer', 'vineyard'] as FilterKey[]).map(fk => (
          <FilterTab key={fk} fk={fk} active={filter === fk} onClick={() => setFilter(fk)} />
        ))}
      </div>

      {/* Count badge */}
      <div style={{ padding: '8px 16px 4px', flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: '#9B8B7A', letterSpacing: '0.06em' }}>
          내가 마신 부르고뉴 {WINES.length}병 ·{' '}
          <span style={{ color: '#4A3D56' }}>
            {filter === 'subregion' ? `${SUB_REGIONS.length}개 지역으로 분류` : filter === 'producer' ? `${PRODUCERS.length}개 도멘으로 분류` : `${VINEYARDS.length}개 밭으로 분류`}
          </span>
        </span>
      </div>

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 20px' }}>
        <PanelContent filter={filter} hoveredId={hoveredId} onHover={onHover} />
      </div>
    </motion.div>
  );
}

// ── Mobile sheet ──────────────────────────────────────────────────────────────

function MobileSheet({ filter, setFilter, hoveredId, onHover, visible }: {
  filter: FilterKey; setFilter: (f: FilterKey) => void;
  hoveredId: string | null; onHover: (id: string | null) => void;
  visible: boolean;
}) {
  const [sheetH, setSheetH] = useState(0.52);
  const sheetHRef = useRef(0.52);
  const handleRef = useRef<HTMLDivElement>(null);

  const updateH = (h: number) => { sheetHRef.current = h; setSheetH(h); };

  useEffect(() => {
    const el = handleRef.current;
    if (!el) return;
    let y0 = 0, h0 = 0;
    const ph = () => el.parentElement?.offsetHeight ?? 844;
    const clamp = (v: number) => Math.min(0.90, Math.max(0.32, v));
    const move = (y: number) => updateH(clamp(h0 + (y0 - y) / ph()));
    const onMM = (e: MouseEvent) => move(e.clientY);
    const onTM = (e: TouchEvent) => { e.preventDefault(); move(e.touches[0].clientY); };
    const onMU = (e: MouseEvent) => { move(e.clientY); up(); };
    const onTE = (e: TouchEvent) => { move(e.changedTouches[0].clientY); up(); };
    const up = () => { window.removeEventListener('mousemove', onMM); window.removeEventListener('mouseup', onMU); window.removeEventListener('touchmove', onTM); window.removeEventListener('touchend', onTE); };
    const md = (e: MouseEvent) => { y0 = e.clientY; h0 = sheetHRef.current; window.addEventListener('mousemove', onMM); window.addEventListener('mouseup', onMU); };
    const ts = (e: TouchEvent) => { y0 = e.touches[0].clientY; h0 = sheetHRef.current; window.addEventListener('touchmove', onTM, { passive: false }); window.addEventListener('touchend', onTE); };
    el.addEventListener('mousedown', md);
    el.addEventListener('touchstart', ts, { passive: true });
    return () => { el.removeEventListener('mousedown', md); el.removeEventListener('touchstart', ts); up(); };
  }, []);

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: visible ? 0 : '100%' }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: `${sheetH * 100}%`,
        background: 'linear-gradient(180deg, rgba(28,18,42,0.98) 0%, rgba(15,8,25,0.99) 100%)',
        backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.5)',
        zIndex: 30, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      <div ref={handleRef} style={{ padding: '12px 0 8px', cursor: 'grab', display: 'flex', justifyContent: 'center', flexShrink: 0, touchAction: 'none' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.28)' }} />
      </div>
      <div style={{ padding: '4px 16px 10px', display: 'flex', gap: 6, flexShrink: 0, overflowX: 'auto' }}>
        {(['subregion', 'producer', 'vineyard'] as FilterKey[]).map(fk => (
          <FilterTab key={fk} fk={fk} active={filter === fk} onClick={() => setFilter(fk)} />
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 20px' }}>
        <PanelContent filter={filter} hoveredId={hoveredId} onHover={onHover} />
      </div>
    </motion.div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function BurgundySection() {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('subregion');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const sectionLabel = t('burgundy.sectionLabel') || 'AI 자동 분류 · 부르고뉴';
  const heading = t('burgundy.heading') || '내가 마신 와인이 지역·생산자·밭으로';

  return (
    <section ref={sectionRef} style={{ height: '100vh', position: 'relative', overflow: 'hidden', background: '#04010A' }}>
      {/* Map */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: isMobile ? '46%' : '100%' }}>
        <motion.div
          style={{ width: '100%', height: '100%' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.7 }}
        >
          <BurgundyMap filter={filter} hoveredId={hoveredId} onHover={setHoveredId} />
        </motion.div>
      </div>

      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 85% 80% at 50% 52%, transparent 50%, rgba(4,1,10,0.9) 100%)' }} />

      {/* Header */}
      <div style={{ position: 'absolute', top: 'clamp(14px,2.5vh,28px)', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.28em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 6 }}>{sectionLabel}</div>
        <h2 style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 'clamp(18px,3vw,32px)', fontWeight: 400, color: '#F5F0E8' }}>{heading}</h2>
      </div>

      {/* Panels */}
      {isMobile && <MobileSheet filter={filter} setFilter={setFilter} hoveredId={hoveredId} onHover={setHoveredId} visible={visible} />}
      {!isMobile && <DesktopPanel filter={filter} setFilter={setFilter} hoveredId={hoveredId} onHover={setHoveredId} visible={visible} />}
    </section>
  );
}
