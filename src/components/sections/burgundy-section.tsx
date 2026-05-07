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
  grapes: string; style: string; gcCount: number; pcCount: number;
  desc: string; color: string;
};

type ProducerData = {
  id: string; name: string; initials: string; coords: [number, number];
  village: string; specialty: string; keyWines: string[]; style: string;
};

type VineyardData = {
  id: string; name: string; coords: [number, number];
  classification: 'Grand Cru' | '1er Cru';
  subregion: string; area: string; producer: string; grape: string;
};

const SUB_REGIONS: SubRegionData[] = [
  { id: 'chablis', name: 'Chablis', nameKo: '샤블리', coords: [3.80, 47.83], grapes: 'Chardonnay 100%', style: '미네랄·백악 토양·날카로운 산도', gcCount: 7, pcCount: 40, desc: '굴 껍데기 화석이 있는 킴메리지안 점토. 가장 미네랄한 샤르도네. Grand Cru 7개 — Valmur, Les Clos, Vaudésir 등.', color: '#4A7AB5' },
  { id: 'cote-nuits', name: 'Côte de Nuits', nameKo: '코트 드 뉘', coords: [5.01, 47.21], grapes: 'Pinot Noir', style: '세계 최고급 레드, 피노 누아의 성지', gcCount: 24, pcCount: 143, desc: 'Gevrey-Chambertin ~ Nuits-Saint-Georges까지 약 20km. Chambertin, Musigny, Romanée-Conti. 부르고뉴 최고급 레드.', color: '#8B1A2A' },
  { id: 'cote-beaune', name: 'Côte de Beaune', nameKo: '코트 드 본', coords: [4.85, 46.99], grapes: 'Chardonnay · Pinot Noir', style: '화이트의 왕국, Montrachet의 고향', gcCount: 9, pcCount: 300, desc: '세계 최고의 드라이 화이트. Meursault의 버터, Puligny의 정밀함, Chassagne의 힘. Le Montrachet 8ha.', color: '#C9A84C' },
  { id: 'chalonnaise', name: 'Côte Chalonnaise', nameKo: '코트 샬로네즈', coords: [4.78, 46.72], grapes: 'Pinot Noir · Chardonnay', style: '가성비 부르고뉴, Mercurey 중심', gcCount: 0, pcCount: 120, desc: 'Mercurey, Givry, Rully, Montagny. 코트 드 본 바로 남쪽. 합리적 가격에 즐기는 클래식 부르고뉴.', color: '#9B7A4C' },
  { id: 'maconnais', name: 'Mâconnais', nameKo: '마코네', coords: [4.78, 46.42], grapes: 'Chardonnay', style: 'Pouilly-Fuissé, 2020년 첫 1er Cru', gcCount: 0, pcCount: 22, desc: 'Pouilly-Fuissé가 2020년 마코네 최초로 22개 클리마를 1er Cru로 승격. 따뜻하고 풍성한 화이트.', color: '#6B8E4E' },
  { id: 'beaujolais', name: 'Beaujolais', nameKo: '보졸레', coords: [4.45, 46.08], grapes: 'Gamay 100%', style: '10개 크뤼 마을, 화강암 토양', gcCount: 0, pcCount: 0, desc: 'Moulin-à-Vent, Morgon, Fleurie, Côte de Brouilly. 화강암 토양이 만드는 장기 숙성 가메. Nouveau와는 다른 세계.', color: '#7B2D5E' },
];

const PRODUCERS: ProducerData[] = [
  { id: 'drc', name: 'Domaine de la Romanée-Conti', initials: 'DRC', coords: [4.975, 47.171], village: 'Vosne-Romanée', specialty: 'Pinot Noir Grand Cru', keyWines: ['Romanée-Conti', 'La Tâche', 'Richebourg', 'Romanée-Saint-Vivant'], style: '1.81ha 모노폴. 병당 USD 25,000+. 전설 중의 전설.' },
  { id: 'rousseau', name: 'Armand Rousseau', initials: 'AR', coords: [5.002, 47.226], village: 'Gevrey-Chambertin', specialty: 'Chambertin 전문', keyWines: ['Chambertin', 'Clos de Bèze', 'Clos Saint-Jacques 1er Cru'], style: '게브레이의 절대자. Chambertin의 기준.' },
  { id: 'leroy', name: 'Domaine Leroy', initials: 'LR', coords: [4.970, 47.174], village: 'Vosne-Romanée', specialty: '비오디나믹 전문가', keyWines: ['Musigny', 'Chambertin', 'Richebourg'], style: '랄루 비즈-르루아. 에이커당 부르고뉴 최고가.' },
  { id: 'coche', name: 'Coche-Dury', initials: 'CD', coords: [4.836, 46.976], village: 'Meursault', specialty: 'Chardonnay 1er Cru', keyWines: ['Meursault Perrières', 'Corton-Charlemagne', 'Meursault Les Rougeots'], style: '뫼르소 최고봉. 희소성과 정교함의 정점.' },
  { id: 'lafon', name: 'Comtes Lafon', initials: 'CL', coords: [4.831, 46.973], village: 'Meursault', specialty: 'Meursault & Montrachet', keyWines: ['Meursault Perrières', 'Meursault Charmes', 'Montrachet'], style: '뫼르소 왕가. Perrières는 매년 완판.' },
  { id: 'leflaive', name: 'Domaine Leflaive', initials: 'LF', coords: [4.797, 46.941], village: 'Puligny-Montrachet', specialty: 'Puligny Grand / 1er Cru', keyWines: ['Montrachet', 'Chevalier-Montrachet', 'Bâtard-Montrachet'], style: '화이트 부르고뉴의 정점. 비오디나믹.' },
  { id: 'roulot', name: 'Domaine Roulot', initials: 'RL', coords: [4.833, 46.978], village: 'Meursault', specialty: 'Meursault', keyWines: ['Meursault Perrières', 'Meursault Tessons', 'Meursault Charmes'], style: '장-마르크 룰로. 현대 뫼르소의 기준.' },
  { id: 'raveneau', name: 'Raveneau', initials: 'RV', coords: [3.801, 47.821], village: 'Chablis', specialty: 'Chablis Grand / 1er Cru', keyWines: ['Chablis Grand Cru Valmur', 'Montée de Tonnerre', 'Butteaux'], style: '샤블리 최고봉. 구하기 가장 어려운 와인.' },
  { id: 'dujac', name: 'Domaine Dujac', initials: 'DJ', coords: [4.983, 47.201], village: 'Morey-Saint-Denis', specialty: 'Clos de la Roche', keyWines: ['Clos de la Roche', 'Chambolle-Musigny', 'Bonnes Mares'], style: '엘레강스와 투명함. 영국계 컬렉터 최애.' },
  { id: 'gouges', name: 'Henri Gouges', initials: 'HG', coords: [4.959, 47.109], village: 'Nuits-Saint-Georges', specialty: '1er Cru 전문', keyWines: ['NSG Les Pruliers', 'NSG Les Vaucrains', 'NSG Clos des Porrets'], style: '뉘-생-조르주의 기준. 그랑 크뤼 없는 최고 도멘.' },
];

const VINEYARDS: VineyardData[] = [
  { id: 'romanee-conti', name: 'Romanée-Conti', coords: [4.975, 47.171], classification: 'Grand Cru', subregion: 'Vosne-Romanée', area: '1.81 ha', producer: 'DRC (Monopole)', grape: 'Pinot Noir' },
  { id: 'la-tache', name: 'La Tâche', coords: [4.974, 47.168], classification: 'Grand Cru', subregion: 'Vosne-Romanée', area: '6.06 ha', producer: 'DRC (Monopole)', grape: 'Pinot Noir' },
  { id: 'chambertin', name: 'Chambertin', coords: [5.003, 47.223], classification: 'Grand Cru', subregion: 'Gevrey-Chambertin', area: '12.9 ha', producer: 'Rousseau, Leroy, Trapet', grape: 'Pinot Noir' },
  { id: 'musigny', name: 'Musigny', coords: [4.972, 47.203], classification: 'Grand Cru', subregion: 'Chambolle-Musigny', area: '10.7 ha', producer: 'Leroy, Vogüé, Roumier', grape: 'Pinot Noir' },
  { id: 'montrachet', name: 'Le Montrachet', coords: [4.800, 46.943], classification: 'Grand Cru', subregion: 'Puligny / Chassagne', area: '8 ha', producer: 'DRC, Lafon, Leflaive', grape: 'Chardonnay' },
  { id: 'clos-de-tart', name: 'Clos de Tart', coords: [4.981, 47.199], classification: 'Grand Cru', subregion: 'Morey-Saint-Denis', area: '7.53 ha', producer: 'Clos de Tart (Monopole)', grape: 'Pinot Noir' },
  { id: 'richebourg', name: 'Richebourg', coords: [4.974, 47.175], classification: 'Grand Cru', subregion: 'Vosne-Romanée', area: '8.03 ha', producer: 'DRC, Leroy, Gros', grape: 'Pinot Noir' },
  { id: 'clos-vougeot', name: 'Clos de Vougeot', coords: [4.970, 47.195], classification: 'Grand Cru', subregion: 'Vougeot', area: '50.6 ha', producer: '80개 이상의 소유주', grape: 'Pinot Noir' },
  { id: 'perrieres', name: 'Meursault Perrières', coords: [4.830, 46.978], classification: '1er Cru', subregion: 'Meursault', area: '13.7 ha', producer: 'Coche-Dury, Lafon, Roulot', grape: 'Chardonnay' },
  { id: 'clos-saint-jacques', name: 'Clos Saint-Jacques', coords: [5.004, 47.228], classification: '1er Cru', subregion: 'Gevrey-Chambertin', area: '6.7 ha', producer: 'Rousseau, Esmonin, Fourrier', grape: 'Pinot Noir' },
];

// ── Map markers ─────────────────────────────────────────────────────────────

function SubRegionMarker({ data, hovered, onHover }: { data: SubRegionData; hovered: boolean; onHover: (id: string | null) => void }) {
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
    </motion.g>
  );
}

function ProducerMarker({ data, hovered, onHover }: { data: ProducerData; hovered: boolean; onHover: (id: string | null) => void }) {
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
    </motion.g>
  );
}

function VineyardMarker({ data, hovered, onHover }: { data: VineyardData; hovered: boolean; onHover: (id: string | null) => void }) {
  const isGC = data.classification === 'Grand Cru';
  const color = isGC ? '#D42040' : '#C9A84C';
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
    </motion.g>
  );
}

// ── Right-panel item cards ──────────────────────────────────────────────────

function SubRegionCard({ data, active }: { data: SubRegionData; active: boolean }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${active ? data.color + '60' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 12, transition: 'all 200ms',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: data.color, flexShrink: 0, display: 'inline-block' }} />
        <span style={{ fontSize: 15, fontFamily: 'Georgia, serif', color: '#F5F0E8', fontWeight: 600 }}>{data.nameKo}</span>
        <span style={{ fontSize: 11, color: '#9B8B7A', marginLeft: 2 }}>{data.name}</span>
      </div>
      <div style={{ fontSize: 11, color: GOLD, marginBottom: 4, letterSpacing: '0.02em' }}>{data.grapes}</div>
      <div style={{ fontSize: 12, color: '#9B8B7A', lineHeight: 1.55, marginBottom: 8 }}>{data.desc}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {data.gcCount > 0 && (
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, background: 'rgba(212,32,64,0.15)', border: '1px solid rgba(212,32,64,0.35)', color: '#E06070' }}>
            Grand Cru {data.gcCount}개
          </span>
        )}
        {data.pcCount > 0 && (
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: GOLD }}>
            1er Cru ~{data.pcCount}개
          </span>
        )}
      </div>
    </div>
  );
}

function ProducerCard({ data, active }: { data: ProducerData; active: boolean }) {
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
        <div>
          <div style={{ fontSize: 13, color: '#F5F0E8', fontWeight: 600, lineHeight: 1.2 }}>{data.name}</div>
          <div style={{ fontSize: 10, color: '#9B8B7A' }}>{data.village} · {data.specialty}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#6A5E4A', lineHeight: 1.5, marginBottom: 8 }}>{data.style}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {data.keyWines.map(w => (
          <span key={w} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 9999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#D4C5B0' }}>{w}</span>
        ))}
      </div>
    </div>
  );
}

function VineyardCard({ data, active }: { data: VineyardData; active: boolean }) {
  const isGC = data.classification === 'Grand Cru';
  return (
    <div style={{
      padding: '14px 16px',
      background: active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${active ? (isGC ? 'rgba(212,32,64,0.5)' : 'rgba(201,168,76,0.4)') : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 12, transition: 'all 200ms',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
        <span style={{
          fontSize: 9, padding: '2px 7px', borderRadius: 9999, fontWeight: 700, letterSpacing: '0.04em',
          background: isGC ? 'rgba(212,32,64,0.2)' : 'rgba(201,168,76,0.15)',
          border: `1px solid ${isGC ? 'rgba(212,32,64,0.5)' : 'rgba(201,168,76,0.4)'}`,
          color: isGC ? '#E06070' : GOLD,
        }}>{data.classification}</span>
        <span style={{ fontSize: 14, fontFamily: 'Georgia, serif', color: '#F5F0E8', fontWeight: 600 }}>{data.name}</span>
      </div>
      <div style={{ fontSize: 11, color: '#9B8B7A', marginBottom: 6 }}>
        {data.subregion} · {data.area} · {data.grape}
      </div>
      <div style={{ fontSize: 11, color: '#6A5E4A' }}>{data.producer}</div>
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
        <span style={{ fontSize: 10, color: '#4A3D56', letterSpacing: '0.06em' }}>
          {filter === 'subregion' ? `${SUB_REGIONS.length}개 세부지역` : filter === 'producer' ? `${PRODUCERS.length}개 도멘` : `${VINEYARDS.length}개 클리마`}
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

  const sectionLabel = t('burgundy.sectionLabel') || '부르고뉴 드릴다운';
  const heading = t('burgundy.heading') || '클리마를 탐험하다';

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
