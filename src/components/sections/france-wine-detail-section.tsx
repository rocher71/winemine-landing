'use client';

import { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const DEPT_URL = '/france-departments.json';

// ── Design tokens ──────────────────────────────────────────────────────────
const GOLD = '#f0c876';

// ── Wine data model ────────────────────────────────────────────────────────
type Wine = {
  id: string; name: string; producer: string;
  appellation: string; subregion: string; vintage: number;
  grapes: string[]; rating: number; drankAt: string;
  occasion: string; note: string; color: string; label: string;
};

// ── Bordeaux 13 wines ─────────────────────────────────────────────────────
const BORDEAUX: Wine[] = [
  { id:'w01', name:'Château Margaux',            producer:'Premier Grand Cru Classé',   appellation:'Margaux',        subregion:'Médoc',      vintage:2015, grapes:['Cabernet Sauvignon','Merlot'],  rating:5, drankAt:'2026.04.18', occasion:'결혼기념일',    note:'잘 익은 카시스, 시가박스, 제비꽃. 우아한 탄닌이 한참 머무름.',    color:'#5b1424', label:'M'  },
  { id:'w02', name:'Château Pichon Baron',       producer:'Deuxièmes Crus',             appellation:'Pauillac',       subregion:'Médoc',      vintage:2016, grapes:['Cabernet Sauvignon','Merlot'],  rating:5, drankAt:'2026.03.22', occasion:'와인 모임',     note:'연필심, 블랙커런트, 스모키한 오크. 구조감이 압도적.',             color:'#3d0f1f', label:'P'  },
  { id:'w03', name:'Château Lynch-Bages',        producer:'Cinquièmes Crus',            appellation:'Pauillac',       subregion:'Médoc',      vintage:2014, grapes:['Cabernet Sauvignon','Merlot'],  rating:4, drankAt:'2026.02.14', occasion:'발렌타인 디너', note:'농밀한 검은 과실, 다크초콜릿, 가죽 뉘앙스.',                     color:'#4a1226', label:'L'  },
  { id:'w04', name:"Château L'Évangile",         producer:'Pomerol',                    appellation:'Pomerol',        subregion:'Right Bank', vintage:2017, grapes:['Merlot','Cabernet Franc'],      rating:5, drankAt:'2026.01.30', occasion:'특별한 손님',   note:'실키한 텍스처, 자두 콩포트, 트러플의 매혹적인 향.',               color:'#601628', label:'É'  },
  { id:'w05', name:'Château Cheval Blanc',       producer:'Premier Grand Cru Classé A', appellation:'Saint-Émilion', subregion:'Right Bank', vintage:2010, grapes:['Cabernet Franc','Merlot'],      rating:5, drankAt:'2025.12.24', occasion:'크리스마스 이브',note:'향신료, 말린 장미, 아시아 향신료. 지적인 와인.',                  color:'#2a0a18', label:'CB' },
  { id:'w06', name:'Château Pavie',              producer:'Premier Grand Cru Classé A', appellation:'Saint-Émilion', subregion:'Right Bank', vintage:2015, grapes:['Merlot','Cabernet Franc'],      rating:4, drankAt:'2025.11.11', occasion:'와인 동호회',   note:'풀바디, 농축된 과실, 미네랄. 조금 더 기다려도 좋을 듯.',          color:'#3a0d1c', label:'PV' },
  { id:'w07', name:'Château Léoville-Poyferré',  producer:'Deuxièmes Crus',             appellation:'Saint-Julien',  subregion:'Médoc',      vintage:2018, grapes:['Cabernet Sauvignon','Merlot'],  rating:4, drankAt:'2025.10.05', occasion:'주말 디너',     note:'균형감 좋은 과실, 부드러운 탄닌, 마시기 편한 클래식.',             color:'#4d1124', label:'LP' },
  { id:'w08', name:'Château Beychevelle',        producer:'Quatrièmes Crus',            appellation:'Saint-Julien',  subregion:'Médoc',      vintage:2016, grapes:['Cabernet Sauvignon','Merlot'],  rating:4, drankAt:'2025.09.20', occasion:'동료 송별',     note:'체리, 삼나무, 은은한 바닐라. 우아함의 정석.',                     color:'#451123', label:'B'  },
  { id:'w09', name:'Château Brane-Cantenac',     producer:'Deuxièmes Crus',             appellation:'Margaux',        subregion:'Médoc',      vintage:2017, grapes:['Cabernet Sauvignon','Merlot'],  rating:4, drankAt:'2025.08.14', occasion:'여름 휴가',     note:'가벼운 꽃향, 라즈베리, 매끄러운 마무리.',                        color:'#52132a', label:'BC' },
  { id:'w10', name:'Château Smith Haut Lafitte', producer:'Cru Classé de Graves',       appellation:'Pessac-Léognan',subregion:'Graves',     vintage:2015, grapes:['Cabernet Sauvignon','Merlot'],  rating:5, drankAt:'2025.07.30', occasion:'생일',          note:'훈연향, 블루베리, 광물성. 모던과 클래식의 균형.',                 color:'#370e1c', label:'SH' },
  { id:'w11', name:'Château Haut-Bailly',        producer:'Cru Classé de Graves',       appellation:'Pessac-Léognan',subregion:'Graves',     vintage:2016, grapes:['Cabernet Sauvignon','Merlot'],  rating:4, drankAt:'2025.06.18', occasion:'비즈니스 디너', note:'섬세한 향, 카시스, 흑연. 구조와 우아함이 공존.',                  color:'#3f0f20', label:'HB' },
  { id:'w12', name:'Château Rauzan-Ségla',       producer:'Deuxièmes Crus',             appellation:'Margaux',        subregion:'Médoc',      vintage:2018, grapes:['Cabernet Sauvignon','Merlot'],  rating:4, drankAt:'2025.05.25', occasion:'봄 피크닉',     note:'향긋한 꽃, 잘 익은 자두, 비단 같은 탄닌.',                       color:'#481128', label:'RS' },
  { id:'w13', name:"Château d'Issan",            producer:'Troisièmes Crus',            appellation:'Margaux',        subregion:'Médoc',      vintage:2019, grapes:['Cabernet Sauvignon','Merlot'],  rating:3, drankAt:'2025.04.10', occasion:'캐주얼 디너',   note:'신선한 베리, 가벼운 바디. 영하지만 매력 있는 한 잔.',              color:'#56142b', label:'DI' },
];

// ── Meursault 5 wines ─────────────────────────────────────────────────────
const MEURSAULT: Wine[] = [
  { id:'m01', name:'Meursault Perrières',   producer:'Domaine Leflaive',  appellation:'Côte de Beaune', subregion:'Burgundy', vintage:2021, grapes:['Chardonnay'], rating:5, drankAt:'2026.04.05', occasion:'생일 파티', note:'헤이즐넛, 버터, 순수한 미네랄. 우아함의 극치.',    color:'#7a5c10', label:'MP' },
  { id:'m02', name:'Meursault Charmes',     producer:'Comtes Lafon',      appellation:'Côte de Beaune', subregion:'Burgundy', vintage:2020, grapes:['Chardonnay'], rating:5, drankAt:'2026.02.28', occasion:'기념일',    note:'풍성한 과실, 오크, 꿀. 무게감 있는 부르고뉴.',      color:'#6a4c08', label:'MC' },
  { id:'m03', name:'Meursault Genevrières', producer:'Coche-Dury',        appellation:'Côte de Beaune', subregion:'Burgundy', vintage:2019, grapes:['Chardonnay'], rating:5, drankAt:'2026.01.14', occasion:'친구 모임', note:'크리미, 헤이즐넛, 스모키. 완성도 높은 1er Cru.',     color:'#5a3c05', label:'MG' },
  { id:'m04', name:'Meursault Village',     producer:'Patrick Javillier', appellation:'Côte de Beaune', subregion:'Burgundy', vintage:2022, grapes:['Chardonnay'], rating:4, drankAt:'2025.12.20', occasion:'혼자',       note:'레몬, 바닐라, 아몬드. 입문하기 좋은 클래식.',       color:'#4a3003', label:'MV' },
  { id:'m05', name:'Meursault Narvaux',     producer:'Roulot',            appellation:'Côte de Beaune', subregion:'Burgundy', vintage:2021, grapes:['Chardonnay'], rating:4, drankAt:'2025.11.05', occasion:'디너 파티', note:'미네랄, 감귤, 흰꽃. 섬세하고 산도가 좋음.',         color:'#402800', label:'MN' },
];

// ── Champagne 3 wines ─────────────────────────────────────────────────────
const CHAMPAGNE: Wine[] = [
  { id:'c01', name:'Krug Grande Cuvée', producer:'Krug',            appellation:'Champagne', subregion:'Épernay', vintage:0,    grapes:['Chardonnay','Pinot Noir'], rating:5, drankAt:'2026.03.15', occasion:'새해 파티',  note:'브리오슈, 사과, 헤이즐넛. 끝없는 피니시.',  color:'#1a3050', label:'KG' },
  { id:'c02', name:'Dom Pérignon',      producer:'Moët & Chandon',  appellation:'Épernay',   subregion:'Épernay', vintage:2013, grapes:['Chardonnay','Pinot Noir'], rating:5, drankAt:'2026.01.01', occasion:'생일',       note:'시트러스, 아몬드, 미네랄. 완벽한 균형.',    color:'#102030', label:'DP' },
  { id:'c03', name:'Billecart-Salmon',  producer:'Billecart-Salmon',appellation:'Mareuil',   subregion:'Marne',   vintage:2012, grapes:['Chardonnay'],              rating:4, drankAt:'2025.12.31', occasion:'카운트다운', note:'흰꽃, 레몬, 크리미. 섬세하고 우아.',        color:'#203040', label:'BS' },
];

const REGION_WINES: Record<string, Wine[]> = { '33': BORDEAUX, '21': MEURSAULT, '51': CHAMPAGNE };

const REGION_META: Record<string, { count: number; avg: number; top: string; en: string }> = {
  '33': { count: 13, avg: 4.4, top: 'Margaux',   en: 'Bordeaux'  },
  '21': { count: 28, avg: 4.7, top: 'Perrières', en: 'Bourgogne' },
  '51': { count: 12, avg: 4.5, top: 'Krug',      en: 'Champagne' },
};

const REGION_KOR: Record<string, string> = { '33': '보르도', '21': '뫼르소', '51': '샹파뉴' };

// Static map: 3 regions always lit
const STATIC_REGION_FILL: Record<string, { fill: string; opacity: number }> = {
  '33': { fill: '#D42040', opacity: 0.68 },
  '21': { fill: '#D42040', opacity: 0.95 },
  '51': { fill: '#D42040', opacity: 0.50 },
};

function sortWines(wines: Wine[], by: 'recent' | 'rating' | 'vintage'): Wine[] {
  const a = [...wines];
  if (by === 'recent')  a.sort((x, y) => y.drankAt.localeCompare(x.drankAt));
  if (by === 'rating')  a.sort((x, y) => y.rating - x.rating);
  if (by === 'vintage') a.sort((x, y) => y.vintage - x.vintage);
  return a;
}

// ── SVG Components ─────────────────────────────────────────────────────────
function WineGlassIcon({ filled, size = 11, color = GOLD, dim = 'rgba(255,255,255,0.18)' }: {
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

function WineGlassRating({ value, size = 11, color = GOLD, gap = 2 }: {
  value: number; size?: number; color?: string; gap?: number;
}) {
  return (
    <div style={{ display: 'flex', gap, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => <WineGlassIcon key={i} filled={i <= value} size={size} color={color} />)}
    </div>
  );
}

function BottleSilhouette({ wine, width = 48, height = 108 }: { wine: Wine; width?: number; height?: number }) {
  const uid = `bd-${wine.id}`;
  const c = wine.color;
  const lbl = wine.vintage > 0 ? String(wine.vintage) : 'NV';
  const app = (wine.appellation || '').slice(0, 8).toUpperCase();
  return (
    <svg width={width} height={height} viewBox="0 0 48 108" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="1" />
          <stop offset="75%" stopColor={c} stopOpacity="0.85" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path d="M15 30 L15 90 Q15 98 24 98 Q33 98 33 90 L33 30 Q31 28 29 26 L29 18 Q29 14 25 14 L23 14 Q19 14 19 18 L19 26 Q17 28 15 30 Z" fill={`url(#${uid})`} />
      <rect x="20" y="9" width="8" height="9" rx="2" fill="#0a0612" fillOpacity="0.85" />
      <rect x="19" y="15" width="10" height="2" fill={GOLD} fillOpacity="0.8" />
      <rect x="17" y="50" width="14" height="24" rx="1" fill="#f5ecd6" stroke={GOLD} strokeWidth="0.5" strokeOpacity="0.6" />
      <text x="24" y="57" textAnchor="middle" fontFamily="Georgia,serif" fontSize="3.5" fontStyle="italic" fill="#3d1a26">Château</text>
      <text x="24" y="63" textAnchor="middle" fontFamily="Georgia,serif" fontSize="5" fontWeight="bold" fill="#3d1a26">{wine.label}</text>
      <line x1="19" y1="65" x2="29" y2="65" stroke="#3d1a26" strokeWidth="0.4" strokeOpacity="0.5" />
      <text x="24" y="68.5" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="2.5" letterSpacing="0.8" fill="#3d1a26">{app}</text>
      <text x="24" y="72.5" textAnchor="middle" fontFamily="Georgia,serif" fontSize="4" fontWeight="600" fill="#3d1a26">{lbl}</text>
    </svg>
  );
}

function WineRowA({ wine }: { wine: Wine }) {
  return (
    <div style={{
      display: 'flex', gap: 12, padding: 12,
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{
        width: 56, height: 110, borderRadius: 8, flexShrink: 0,
        background: 'radial-gradient(ellipse at top, transparent 60%, rgba(0,0,0,0.4) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <BottleSilhouette wine={wine} width={44} height={105} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 17, fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 600, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.2px' }}>
          {wine.name}
        </div>
        <div style={{ fontSize: 10, color: GOLD, letterSpacing: '0.5px', textTransform: 'uppercase' as const, fontWeight: 500 }}>
          {wine.appellation} · {wine.vintage > 0 ? wine.vintage : 'NV'}
        </div>
        <div style={{
          fontSize: 11.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.45, marginTop: 2,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        } as React.CSSProperties}>
          {wine.note}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <WineGlassRating value={wine.rating} size={9} color={GOLD} gap={2} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{wine.drankAt}</span>
        </div>
      </div>
    </div>
  );
}

// ── Static France Map (3 regions always lit) ───────────────────────────────
function StaticFranceMap({ selectedRegion }: { selectedRegion: string }) {
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
        projectionConfig={{ center: [2.4, 46.8], scale: 1950 }}
        width={600} height={680}
        style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
      >
        <Geographies geography={DEPT_URL}>
          {({ geographies }) => geographies.map(geo => {
            const code = geo.properties.code as string;
            const r = STATIC_REGION_FILL[code];
            const isSelected = code === selectedRegion;
            const fill = r ? r.fill : '#1C0838';
            const fillOpacity = r ? r.opacity : 1;
            const stroke = r ? (isSelected ? '#f0c876' : '#5A1028') : '#3A1068';
            const strokeWidth = isSelected ? 1.2 : 0.8;
            return (
              <Geography key={geo.rsmKey} geography={geo} style={{
                default: { fill, fillOpacity, stroke, strokeWidth, outline: 'none', transition: 'stroke 200ms' },
                hover:   { fill, fillOpacity, stroke, strokeWidth, outline: 'none' },
                pressed: { fill, fillOpacity, stroke, strokeWidth, outline: 'none' },
              }} />
            );
          })}
        </Geographies>
      </ComposableMap>
    </div>
  );
}

// ── Region Tab Button ──────────────────────────────────────────────────────
function RegionTab({ regionKey, selectedRegion, onSelect }: {
  regionKey: string; selectedRegion: string; onSelect: (k: string) => void;
}) {
  const d = REGION_META[regionKey];
  const active = selectedRegion === regionKey;
  return (
    <button
      onClick={() => onSelect(regionKey)}
      style={{
        padding: '6px 14px', borderRadius: 9999, cursor: 'pointer',
        background: active ? 'rgba(240,200,118,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? 'rgba(240,200,118,0.45)' : 'rgba(255,255,255,0.08)'}`,
        color: active ? GOLD : '#9B8B7A',
        fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all 200ms',
        whiteSpace: 'nowrap' as const,
      }}
    >
      {REGION_KOR[regionKey]}
      {' '}
      <span style={{ fontSize: 11, opacity: 0.7 }}>{d.count}</span>
    </button>
  );
}

// ── Wine list panel content (shared between mobile sheet and desktop panel) ─
function WineListContent({ selectedRegion, sortBy, setSortBy }: {
  selectedRegion: string;
  sortBy: 'recent' | 'rating' | 'vintage';
  setSortBy: (v: 'recent' | 'rating' | 'vintage') => void;
}) {
  const meta = REGION_META[selectedRegion];
  const korName = REGION_KOR[selectedRegion] ?? '';
  const wines = sortWines(REGION_WINES[selectedRegion] ?? [], sortBy);

  return (
    <>
      {/* Region header */}
      <div style={{ padding: '14px 20px 12px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 24, fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 600, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
            {korName}
          </span>
          {meta && (
            <span style={{ fontSize: 13, fontFamily: "'Cormorant Garamond',Georgia,serif", fontStyle: 'italic', color: 'rgba(255,200,150,0.55)' }}>
              {meta.en}
            </span>
          )}
        </div>
        {meta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {[
              { label: '총', value: `${meta.count}병`, serif: false },
              null,
              { label: '평균', value: String(meta.avg), serif: false, glass: true },
              null,
              { label: '최애', value: meta.top, serif: true },
            ].map((item, i) => {
              if (!item) return <div key={i} style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.4)' }}>
                    {item.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{
                      fontSize: 13, fontWeight: item.serif ? 400 : 600, color: '#fff',
                      fontFamily: item.serif ? "'Cormorant Garamond',Georgia,serif" : undefined,
                      fontStyle: item.serif ? 'italic' : undefined,
                    }}>
                      {item.value}
                    </span>
                    {item.glass && <WineGlassIcon filled size={10} color={GOLD} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sort tabs */}
      <div style={{ padding: '8px 20px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {(['recent', 'rating', 'vintage'] as const).map(tab => {
          const labels = { recent: '최근', rating: '평점', vintage: '빈티지' };
          const active = sortBy === tab;
          return (
            <button key={tab} onClick={() => setSortBy(tab)} style={{
              padding: '5px 14px', borderRadius: 9999, border: 'none', cursor: 'pointer',
              background: active ? GOLD : 'transparent',
              color: active ? '#1a0d24' : 'rgba(255,255,255,0.55)',
              fontSize: 12, fontWeight: 500, fontFamily: 'inherit', transition: 'all 150ms',
            }}>
              {labels[tab]}
            </button>
          );
        })}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{wines.length}</span>
      </div>

      {/* Wine list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 24px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedRegion}-${sortBy}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {wines.map(w => <WineRowA key={w.id} wine={w} />)}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

// ── Mobile Always-visible Sheet ────────────────────────────────────────────
function MobileAlwaysSheet({ selectedRegion, onSelectRegion, visible }: {
  selectedRegion: string; onSelectRegion: (k: string) => void; visible: boolean;
}) {
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'vintage'>('recent');

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: visible ? 0 : '100%' }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: '55%',
        background: 'linear-gradient(180deg, rgba(28,18,42,0.98) 0%, rgba(15,8,25,0.99) 100%)',
        backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.5)',
        zIndex: 30, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      {/* Drag handle (visual only) */}
      <div style={{ padding: '10px 0 6px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)' }} />
      </div>

      {/* Region tabs */}
      <div style={{ padding: '4px 20px 10px', display: 'flex', gap: 8, flexShrink: 0 }}>
        {['33', '21', '51'].map(key => (
          <RegionTab key={key} regionKey={key} selectedRegion={selectedRegion} onSelect={onSelectRegion} />
        ))}
      </div>

      <WineListContent selectedRegion={selectedRegion} sortBy={sortBy} setSortBy={setSortBy} />
    </motion.div>
  );
}

// ── Desktop Wine Panel ─────────────────────────────────────────────────────
function DesktopWinePanel({ selectedRegion, onSelectRegion, visible }: {
  selectedRegion: string; onSelectRegion: (k: string) => void; visible: boolean;
}) {
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'vintage'>('recent');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 20 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      style={{
        position: 'absolute', top: '10%', right: '3vw',
        width: 'clamp(220px,28vw,320px)', maxHeight: '80vh',
        zIndex: 20,
        background: 'rgba(5,2,14,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid rgba(240,200,118,0.22)`, borderRadius: 16,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Region tabs */}
      <div style={{ padding: '14px 16px 10px', display: 'flex', gap: 6, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {['33', '21', '51'].map(key => (
          <RegionTab key={key} regionKey={key} selectedRegion={selectedRegion} onSelect={onSelectRegion} />
        ))}
      </div>

      <WineListContent selectedRegion={selectedRegion} sortBy={sortBy} setSortBy={setSortBy} />
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function FranceWineDetailSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('33');
  const [panelVisible, setPanelVisible] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // IntersectionObserver: animate in when section enters viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setPanelVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ height: '100vh', position: 'relative', overflow: 'hidden', background: '#04010A' }}
    >
      {/* Section title */}
      <div style={{
        position: 'absolute', top: 'clamp(14px,2.5vh,28px)', left: '50%', transform: 'translateX(-50%)',
        textAlign: 'center', zIndex: 10, pointerEvents: 'none', whiteSpace: 'nowrap',
      }}>
        <div style={{ fontSize: 9, letterSpacing: '0.28em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 6 }}>내가 마신 와인</div>
        <h2 style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 'clamp(18px,3vw,32px)', fontWeight: 400, color: '#F5F0E8' }}>와인 컬렉션</h2>
      </div>

      {/* Map area */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: isMobile ? '45%' : '100%',
      }}>
        <StaticFranceMap selectedRegion={selectedRegion} />
      </div>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 85% 80% at 50% 52%, transparent 50%, rgba(4,1,10,0.88) 100%)',
      }} />

      {/* Mobile: Always-visible bottom sheet */}
      {isMobile && (
        <MobileAlwaysSheet
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          visible={panelVisible}
        />
      )}

      {/* Desktop: Right panel */}
      {!isMobile && (
        <DesktopWinePanel
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          visible={panelVisible}
        />
      )}
    </section>
  );
}
