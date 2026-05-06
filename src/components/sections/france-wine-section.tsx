'use client';

import { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const DEPT_URL = '/france-departments.json';

// ── Design tokens ──────────────────────────────────────────────────────────
const GOLD = '#f0c876';

// ── Wine data model (SPEC.md §3) ──────────────────────────────────────────
type Wine = {
  id: string; name: string; producer: string;
  appellation: string; subregion: string; vintage: number;
  grapes: string[]; rating: number; drankAt: string;
  occasion: string; note: string; color: string; label: string;
};

// ── Bordeaux 13 wines (SPEC.md §3.2) ──────────────────────────────────────
const BORDEAUX: Wine[] = [
  { id:'w01', name:'Château Margaux',           producer:'Premier Grand Cru Classé',   appellation:'Margaux',        subregion:'Médoc',       vintage:2015, grapes:['Cabernet Sauvignon','Merlot'],      rating:5, drankAt:'2026.04.18', occasion:'결혼기념일',     note:'잘 익은 카시스, 시가박스, 제비꽃. 우아한 탄닌이 한참 머무름.', color:'#5b1424', label:'M'  },
  { id:'w02', name:'Château Pichon Baron',      producer:'Deuxièmes Crus',             appellation:'Pauillac',       subregion:'Médoc',       vintage:2016, grapes:['Cabernet Sauvignon','Merlot'],      rating:5, drankAt:'2026.03.22', occasion:'와인 모임',      note:'연필심, 블랙커런트, 스모키한 오크. 구조감이 압도적.',          color:'#3d0f1f', label:'P'  },
  { id:'w03', name:'Château Lynch-Bages',       producer:'Cinquièmes Crus',            appellation:'Pauillac',       subregion:'Médoc',       vintage:2014, grapes:['Cabernet Sauvignon','Merlot'],      rating:4, drankAt:'2026.02.14', occasion:'발렌타인 디너',  note:'농밀한 검은 과실, 다크초콜릿, 가죽 뉘앙스.',                  color:'#4a1226', label:'L'  },
  { id:'w04', name:"Château L'Évangile",        producer:'Pomerol',                    appellation:'Pomerol',        subregion:'Right Bank',  vintage:2017, grapes:['Merlot','Cabernet Franc'],           rating:5, drankAt:'2026.01.30', occasion:'특별한 손님',    note:'실키한 텍스처, 자두 콩포트, 트러플의 매혹적인 향.',            color:'#601628', label:'É'  },
  { id:'w05', name:'Château Cheval Blanc',      producer:'Premier Grand Cru Classé A', appellation:'Saint-Émilion', subregion:'Right Bank',  vintage:2010, grapes:['Cabernet Franc','Merlot'],           rating:5, drankAt:'2025.12.24', occasion:'크리스마스 이브', note:'향신료, 말린 장미, 아시아 향신료. 지적인 와인.',               color:'#2a0a18', label:'CB' },
  { id:'w06', name:'Château Pavie',             producer:'Premier Grand Cru Classé A', appellation:'Saint-Émilion', subregion:'Right Bank',  vintage:2015, grapes:['Merlot','Cabernet Franc'],           rating:4, drankAt:'2025.11.11', occasion:'와인 동호회',    note:'풀바디, 농축된 과실, 미네랄. 조금 더 기다려도 좋을 듯.',       color:'#3a0d1c', label:'PV' },
  { id:'w07', name:'Château Léoville-Poyferré', producer:'Deuxièmes Crus',             appellation:'Saint-Julien',  subregion:'Médoc',       vintage:2018, grapes:['Cabernet Sauvignon','Merlot'],      rating:4, drankAt:'2025.10.05', occasion:'주말 디너',      note:'균형감 좋은 과실, 부드러운 탄닌, 마시기 편한 클래식.',          color:'#4d1124', label:'LP' },
  { id:'w08', name:'Château Beychevelle',       producer:'Quatrièmes Crus',            appellation:'Saint-Julien',  subregion:'Médoc',       vintage:2016, grapes:['Cabernet Sauvignon','Merlot'],      rating:4, drankAt:'2025.09.20', occasion:'동료 송별',      note:'체리, 삼나무, 은은한 바닐라. 우아함의 정석.',                  color:'#451123', label:'B'  },
  { id:'w09', name:'Château Brane-Cantenac',    producer:'Deuxièmes Crus',             appellation:'Margaux',        subregion:'Médoc',       vintage:2017, grapes:['Cabernet Sauvignon','Merlot'],      rating:4, drankAt:'2025.08.14', occasion:'여름 휴가',      note:'가벼운 꽃향, 라즈베리, 매끄러운 마무리.',                      color:'#52132a', label:'BC' },
  { id:'w10', name:'Château Smith Haut Lafitte',producer:'Cru Classé de Graves',       appellation:'Pessac-Léognan',subregion:'Graves',      vintage:2015, grapes:['Cabernet Sauvignon','Merlot'],      rating:5, drankAt:'2025.07.30', occasion:'생일',           note:'훈연향, 블루베리, 광물성. 모던과 클래식의 균형.',              color:'#370e1c', label:'SH' },
  { id:'w11', name:'Château Haut-Bailly',       producer:'Cru Classé de Graves',       appellation:'Pessac-Léognan',subregion:'Graves',      vintage:2016, grapes:['Cabernet Sauvignon','Merlot'],      rating:4, drankAt:'2025.06.18', occasion:'비즈니스 디너',  note:'섬세한 향, 카시스, 흑연. 구조와 우아함이 공존.',               color:'#3f0f20', label:'HB' },
  { id:'w12', name:'Château Rauzan-Ségla',      producer:'Deuxièmes Crus',             appellation:'Margaux',        subregion:'Médoc',       vintage:2018, grapes:['Cabernet Sauvignon','Merlot'],      rating:4, drankAt:'2025.05.25', occasion:'봄 피크닉',      note:'향긋한 꽃, 잘 익은 자두, 비단 같은 탄닌.',                     color:'#481128', label:'RS' },
  { id:'w13', name:"Château d'Issan",           producer:'Troisièmes Crus',            appellation:'Margaux',        subregion:'Médoc',       vintage:2019, grapes:['Cabernet Sauvignon','Merlot'],      rating:3, drankAt:'2025.04.10', occasion:'캐주얼 디너',    note:'신선한 베리, 가벼운 바디. 영하지만 매력 있는 한 잔.',           color:'#56142b', label:'DI' },
];

const MEURSAULT: Wine[] = [
  { id:'m01', name:'Meursault Perrières',   producer:'Domaine Leflaive',  appellation:'Côte de Beaune', subregion:'Burgundy', vintage:2021, grapes:['Chardonnay'], rating:5, drankAt:'2026.04.05', occasion:'생일 파티',  note:'헤이즐넛, 버터, 순수한 미네랄. 우아함의 극치.',       color:'#7a5c10', label:'MP' },
  { id:'m02', name:'Meursault Charmes',     producer:'Comtes Lafon',      appellation:'Côte de Beaune', subregion:'Burgundy', vintage:2020, grapes:['Chardonnay'], rating:5, drankAt:'2026.02.28', occasion:'기념일',     note:'풍성한 과실, 오크, 꿀. 무게감 있는 부르고뉴.',         color:'#6a4c08', label:'MC' },
  { id:'m03', name:'Meursault Genevrières', producer:'Coche-Dury',        appellation:'Côte de Beaune', subregion:'Burgundy', vintage:2019, grapes:['Chardonnay'], rating:5, drankAt:'2026.01.14', occasion:'친구 모임',  note:'크리미, 헤이즐넛, 스모키. 완성도 높은 1er Cru.',       color:'#5a3c05', label:'MG' },
  { id:'m04', name:'Meursault Village',     producer:'Patrick Javillier', appellation:'Côte de Beaune', subregion:'Burgundy', vintage:2022, grapes:['Chardonnay'], rating:4, drankAt:'2025.12.20', occasion:'혼자',        note:'레몬, 바닐라, 아몬드. 입문하기 좋은 클래식.',           color:'#4a3003', label:'MV' },
  { id:'m05', name:'Meursault Narvaux',     producer:'Roulot',            appellation:'Côte de Beaune', subregion:'Burgundy', vintage:2021, grapes:['Chardonnay'], rating:4, drankAt:'2025.11.05', occasion:'디너 파티',  note:'미네랄, 감귤, 흰꽃. 섬세하고 산도가 좋음.',             color:'#402800', label:'MN' },
];

const CHAMPAGNE: Wine[] = [
  { id:'c01', name:'Krug Grande Cuvée', producer:'Krug',            appellation:'Champagne',  subregion:'Épernay', vintage:0,    grapes:['Chardonnay','Pinot Noir'], rating:5, drankAt:'2026.03.15', occasion:'새해 파티',   note:'브리오슈, 사과, 헤이즐넛. 끝없는 피니시.',    color:'#1a3050', label:'KG' },
  { id:'c02', name:'Dom Pérignon',      producer:'Moët & Chandon',  appellation:'Épernay',    subregion:'Épernay', vintage:2013, grapes:['Chardonnay','Pinot Noir'], rating:5, drankAt:'2026.01.01', occasion:'생일',        note:'시트러스, 아몬드, 미네랄. 완벽한 균형.',      color:'#102030', label:'DP' },
  { id:'c03', name:'Billecart-Salmon',  producer:'Billecart-Salmon',appellation:'Mareuil',    subregion:'Marne',   vintage:2012, grapes:['Chardonnay'],              rating:4, drankAt:'2025.12.31', occasion:'카운트다운',  note:'흰꽃, 레몬, 크리미. 섬세하고 우아.',          color:'#203040', label:'BS' },
];

const REGION_WINES: Record<string, Wine[]> = { '33': BORDEAUX, '21': MEURSAULT, '51': CHAMPAGNE };

const REGION_META: Record<string, { count: number; avg: number; top: string; en: string }> = {
  '33': { count: 13, avg: 4.4, top: 'Margaux',    en: 'Bordeaux'   },
  '21': { count: 28, avg: 4.7, top: 'Perrières',  en: 'Bourgogne'  },
  '51': { count: 12, avg: 4.5, top: 'Krug',       en: 'Champagne'  },
};

function sortWines(wines: Wine[], by: 'recent' | 'rating' | 'vintage'): Wine[] {
  const a = [...wines];
  if (by === 'recent')  a.sort((x, y) => y.drankAt.localeCompare(x.drankAt));
  if (by === 'rating')  a.sort((x, y) => y.rating - x.rating);
  if (by === 'vintage') a.sort((x, y) => y.vintage - x.vintage);
  return a;
}

// ── SVG Components ─────────────────────────────────────────────────────────

function WineGlassIcon({ filled, size = 11, color = GOLD, dim = 'rgba(255,255,255,0.18)' }: { filled: boolean; size?: number; color?: string; dim?: string }) {
  const c = filled ? color : dim;
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 12 16" style={{ flexShrink: 0 }}>
      <path d="M2.5 1 Q2.5 6 6 7 Q9.5 6 9.5 1 Z" fill={filled ? color : 'transparent'} stroke={c} strokeWidth="0.8" strokeLinejoin="round" />
      <line x1="6" y1="7" x2="6" y2="13" stroke={c} strokeWidth="0.8" />
      <line x1="3.5" y1="13.5" x2="8.5" y2="13.5" stroke={c} strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

function WineGlassRating({ value, size = 11, color = GOLD, gap = 2 }: { value: number; size?: number; color?: string; gap?: number }) {
  return (
    <div style={{ display: 'flex', gap, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => <WineGlassIcon key={i} filled={i <= value} size={size} color={color} />)}
    </div>
  );
}

function BottleSilhouette({ wine, width = 48, height = 108 }: { wine: Wine; width?: number; height?: number }) {
  const uid = `b-${wine.id}`;
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
      {/* Body */}
      <path d="M15 30 L15 90 Q15 98 24 98 Q33 98 33 90 L33 30 Q31 28 29 26 L29 18 Q29 14 25 14 L23 14 Q19 14 19 18 L19 26 Q17 28 15 30 Z" fill={`url(#${uid})`} />
      {/* Foil */}
      <rect x="20" y="9" width="8" height="9" rx="2" fill="#0a0612" fillOpacity="0.85" />
      <rect x="19" y="15" width="10" height="2" fill={GOLD} fillOpacity="0.8" />
      {/* Label */}
      <rect x="17" y="50" width="14" height="24" rx="1" fill="#f5ecd6" stroke={GOLD} strokeWidth="0.5" strokeOpacity="0.6" />
      <text x="24" y="57" textAnchor="middle" fontFamily="Georgia,serif" fontSize="3.5" fontStyle="italic" fill="#3d1a26">Château</text>
      <text x="24" y="63" textAnchor="middle" fontFamily="Georgia,serif" fontSize="5" fontWeight="bold" fill="#3d1a26">{wine.label}</text>
      <line x1="19" y1="65" x2="29" y2="65" stroke="#3d1a26" strokeWidth="0.4" strokeOpacity="0.5" />
      <text x="24" y="68.5" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="2.5" letterSpacing="0.8" fill="#3d1a26">{app}</text>
      <text x="24" y="72.5" textAnchor="middle" fontFamily="Georgia,serif" fontSize="4" fontWeight="600" fill="#3d1a26">{lbl}</text>
    </svg>
  );
}

// ── WineRowA (SPEC.md §4) ─────────────────────────────────────────────────
function WineRowA({ wine }: { wine: Wine }) {
  return (
    <div style={{
      display: 'flex', gap: 12, padding: 12,
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)',
    }}>
      {/* Bottle */}
      <div style={{
        width: 56, height: 110, borderRadius: 8, flexShrink: 0,
        background: 'radial-gradient(ellipse at top, transparent 60%, rgba(0,0,0,0.4) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <BottleSilhouette wine={wine} width={44} height={105} />
      </div>

      {/* Right */}
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

// ── Map region config ──────────────────────────────────────────────────────
type RegionData = { korName: string; count: number; opacity: number; labelCoords: [number, number]; showLabel: boolean; featured?: boolean; revealOrder: number };

const WINE_DEPTS: Record<string, RegionData> = {
  '21': { korName: '뫼르소', count: 28, opacity: 0.95, labelCoords: [4.88, 47.20], showLabel: true, featured: true, revealOrder: 1 },
  '33': { korName: '보르도', count: 13, opacity: 0.68, labelCoords: [-0.62, 44.82], showLabel: true, revealOrder: 2 },
  '51': { korName: '샹파뉴', count: 12, opacity: 0.50, labelCoords: [4.12, 49.00], showLabel: true, revealOrder: 3 },
  '67': { korName: '알자스', count: 7, opacity: 0.36, labelCoords: [7.52, 48.58], showLabel: true, revealOrder: 4 },
  '68': { korName: '', count: 7, opacity: 0.36, labelCoords: [7.52, 48.58], showLabel: false, revealOrder: 4 },
  '69': { korName: '론 밸리', count: 5, opacity: 0.20, labelCoords: [4.68, 45.80], showLabel: true, revealOrder: 5 },
};

const primaryKey = (code: string) => (code === '68' ? '67' : code);
const MOBILE_KEYS = ['21', '33', '51'];

// ── RegionLabel (SVG) ──────────────────────────────────────────────────────
function RegionLabel({ korName, count, featured, visible, selected, onClick }: {
  korName: string; count: number; featured?: boolean; visible: boolean; selected: boolean; onClick: () => void;
}) {
  const border = selected ? GOLD : featured ? 'rgba(255,208,96,0.55)' : 'rgba(255,255,255,0.12)';
  const sw = selected ? 1.8 : featured ? 1.2 : 0.6;

  const handleTouch = (e: React.TouchEvent) => {
    if (!visible) return;
    e.preventDefault(); // click 이벤트 중복 방지
    e.stopPropagation();
    onClick();
  };

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.6 }}
      animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ cursor: visible ? 'pointer' : 'default', pointerEvents: visible ? 'auto' : 'none' }}
      onClick={visible ? onClick : undefined}
      onTouchEnd={visible ? handleTouch : undefined}
      whileHover={visible ? { scale: 1.08 } : undefined}
    >
      {/* 투명 대형 히트 영역 — 모바일 터치 타겟 확보 (실제 레이블보다 훨씬 큰 영역) */}
      <rect
        x={featured ? -60 : -52} y={featured ? -44 : -40}
        width={featured ? 120 : 104} height={featured ? 80 : 72}
        fill="transparent"
        stroke="none"
      />
      {/* 보이는 레이블 */}
      <rect x={featured ? -44 : -36} y={featured ? -24 : -20} width={featured ? 88 : 72} height={featured ? 38 : 32} rx={6}
        fill={selected ? 'rgba(4,1,10,0.94)' : 'rgba(4,1,10,0.82)'} stroke={border} strokeWidth={sw} />
      <text textAnchor="middle" y={featured ? -8 : -6}
        style={{ fill: selected ? GOLD : featured ? GOLD : '#F5F0E8', fontSize: featured ? 11 : 9, fontFamily: 'Inter,sans-serif', fontWeight: featured ? 700 : 600 } as React.CSSProperties}>
        {featured ? `✦ ${korName}` : korName}
      </text>
      <text textAnchor="middle" y={featured ? 8 : 7}
        style={{ fill: selected ? GOLD : '#C9A84C', fontSize: featured ? 13 : 11, fontFamily: 'Inter,sans-serif', fontWeight: 700 } as React.CSSProperties}>
        {count}병
      </text>
    </motion.g>
  );
}

// ── Desktop right panel ────────────────────────────────────────────────────
function DesktopWinePanel({ regionKey, visible }: { regionKey: string; visible: boolean }) {
  const wines = REGION_WINES[regionKey] ?? [];
  const meta = REGION_META[regionKey];
  const korName = WINE_DEPTS[regionKey]?.korName ?? '';
  return (
    <AnimatePresence>
      {visible && wines.length > 0 && (
        <motion.div key={regionKey}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: 'absolute', top: 'clamp(72px,10vh,100px)', right: 'clamp(40px,4.5vw,60px)',
            width: 'clamp(220px,26vw,300px)', maxHeight: '72vh', zIndex: 20,
            background: 'rgba(5,2,14,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid rgba(240,200,118,0.22)`, borderRadius: 16,
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }}>
          {/* Header */}
          <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 22, fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 600, color: '#fff' }}>{korName}</span>
              {meta && <span style={{ fontSize: 13, fontFamily: "'Cormorant Garamond',Georgia,serif", fontStyle: 'italic', color: 'rgba(255,200,150,0.55)' }}>{meta.en}</span>}
            </div>
            {meta && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.6px', textTransform: 'uppercase' as const }}>총</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{meta.count}병</div>
                </div>
                <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.6px', textTransform: 'uppercase' as const }}>평균</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{meta.avg}</span>
                    <WineGlassIcon filled size={10} color={GOLD} />
                  </div>
                </div>
                <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.6px', textTransform: 'uppercase' as const }}>최애</div>
                  <div style={{ fontSize: 13, fontFamily: "'Cormorant Garamond',Georgia,serif", fontStyle: 'italic', color: '#fff' }}>{meta.top}</div>
                </div>
              </div>
            )}
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: '10px 14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {wines.map(w => <WineRowA key={w.id} wine={w} />)}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Mobile Bottom Sheet (SPEC.md Variation A) ──────────────────────────────
function MobileBottomSheet({ selectedRegion, visible, revealedCount, onSelectRegion, onClose }: {
  selectedRegion: string; visible: boolean; revealedCount: number;
  onSelectRegion: (k: string) => void; onClose: () => void;
}) {
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'vintage'>('recent');
  const [sheetH, setSheetH] = useState(0.55);
  const sheetHRef = useRef(0.55); // ref로 드래그 중 최신값 추적 (stale closure 방지)
  const handleRef = useRef<HTMLDivElement>(null);

  const wines = sortWines(REGION_WINES[selectedRegion] ?? [], sortBy);
  const meta = REGION_META[selectedRegion];
  const korName = WINE_DEPTS[selectedRegion]?.korName ?? '';

  const updateH = (h: number) => { sheetHRef.current = h; setSheetH(h); };

  // Draggable handle — ref 기반, sheetH 제거로 re-register 방지
  useEffect(() => {
    const el = handleRef.current;
    if (!el) return;
    let y0 = 0, h0 = 0;
    const ph = () => el.parentElement?.offsetHeight ?? 844;
    const move = (y: number) => updateH(Math.min(0.92, Math.max(0.08, h0 + (y0 - y) / ph())));
    const release = (y: number) => {
      const next = h0 + (y0 - y) / ph();
      if (next < 0.18) { onClose(); updateH(0.55); }
      else updateH(Math.min(0.92, Math.max(0.18, next)));
    };
    const onMM = (e: MouseEvent) => move(e.clientY);
    const onTM = (e: TouchEvent) => { e.preventDefault(); move(e.touches[0].clientY); }; // preventDefault: 페이지 스크롤 차단
    const onMU = (e: MouseEvent) => { release(e.clientY); up(); };
    const onTE = (e: TouchEvent) => { release(e.changedTouches[0].clientY); up(); };
    const up = () => { window.removeEventListener('mousemove', onMM); window.removeEventListener('mouseup', onMU); window.removeEventListener('touchmove', onTM); window.removeEventListener('touchend', onTE); };
    const md = (e: MouseEvent) => { y0 = e.clientY; h0 = sheetHRef.current; window.addEventListener('mousemove', onMM); window.addEventListener('mouseup', onMU); };
    const ts = (e: TouchEvent) => { y0 = e.touches[0].clientY; h0 = sheetHRef.current; window.addEventListener('touchmove', onTM, { passive: false }); window.addEventListener('touchend', onTE); };
    el.addEventListener('mousedown', md);
    el.addEventListener('touchstart', ts, { passive: true });
    return () => { el.removeEventListener('mousedown', md); el.removeEventListener('touchstart', ts); up(); };
  }, [onClose]); // sheetH 제거 — re-register 없음

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
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
          {/* Drag handle + close */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div ref={handleRef} style={{ padding: '10px 0 6px', cursor: 'grab', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)' }} />
            </div>
            <button onClick={onClose} style={{
              position: 'absolute', top: 8, right: 16,
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit',
            }}>✕</button>
          </div>

          {/* Header */}
          <div style={{ padding: '4px 20px 14px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 28, fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 600, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                {korName}
              </span>
              <span style={{ fontSize: 14, fontFamily: "'Cormorant Garamond',Georgia,serif", fontStyle: 'italic', color: 'rgba(255,200,150,0.55)' }}>
                {meta?.en}
              </span>
            </div>
            {meta && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {[
                  { label: '총', value: `${meta.count}병`, serif: false },
                  null,
                  { label: '평균', value: meta.avg, serif: false, glass: true },
                  null,
                  { label: '최애', value: meta.top, serif: true },
                ].map((item, i) => {
                  if (!item) return <div key={i} style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }} />;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{
                          fontSize: 14, fontWeight: item.serif ? 400 : 600, color: '#fff',
                          fontFamily: item.serif ? "'Cormorant Garamond',Georgia,serif" : undefined,
                          fontStyle: item.serif ? 'italic' : undefined,
                        }}>
                          {String(item.value)}
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
          <div style={{ padding: '0 20px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
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

          {/* Region tabs */}
          <div style={{ padding: '8px 20px 4px', display: 'flex', gap: 8, flexShrink: 0 }}>
            {MOBILE_KEYS.map(key => {
              const d = WINE_DEPTS[key];
              const active = selectedRegion === key;
              const revealed = revealedCount >= d.revealOrder;
              return (
                <button key={key} onClick={() => revealed && onSelectRegion(key)} style={{
                  padding: '5px 12px', borderRadius: 9999, cursor: revealed ? 'pointer' : 'default',
                  background: active ? 'rgba(240,200,118,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active ? 'rgba(240,200,118,0.45)' : 'rgba(255,255,255,0.08)'}`,
                  color: active ? GOLD : revealed ? '#9B8B7A' : '#4A3D56',
                  fontSize: 12, fontWeight: 600, fontFamily: 'inherit', transition: 'all 200ms',
                }}>
                  {d.korName} <span style={{ fontSize: 10, opacity: 0.7 }}>{d.count}</span>
                </button>
              );
            })}
          </div>

          {/* Wine list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 24px' }}>
            <AnimatePresence mode="wait">
              <motion.div key={`${selectedRegion}-${sortBy}`}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {wines.map(w => <WineRowA key={w.id} wine={w} />)}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function FranceWineSection() {
  const outerRef = useRef<HTMLDivElement>(null);
  const mapRef   = useRef<HTMLDivElement>(null);

  const [isMobile,      setIsMobile]      = useState(false);
  const [mapVisible,    setMapVisible]    = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [selectedRegion,setSelectedRegion]= useState('33');
  const [showPanel,     setShowPanel]     = useState(false);
  const blockAutoShow = useRef(false); // 닫기 후 즉시 재오픈 방지 (800ms)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useLayoutEffect(() => {
    const apply = () => mapRef.current?.querySelectorAll('svg').forEach(s => { s.setAttribute('preserveAspectRatio', 'xMidYMid meet'); s.style.display = 'block'; });
    apply();
    const obs = new MutationObserver(apply);
    if (mapRef.current) obs.observe(mapRef.current, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: outerRef, offset: ['start start', 'end start'] });
  useMotionValueEvent(scrollYProgress, 'change', v => {
    setMapVisible(v > 0.06);
    const count = v < 0.18 ? 0 : v < 0.32 ? 1 : v < 0.44 ? 2 : v < 0.56 ? 3 : v < 0.66 ? 4 : 5;
    setRevealedCount(count);
    // 보르도 등장 시(count>=2) 자동 슬라이드업
    if (count >= 2 && !blockAutoShow.current) setShowPanel(true);
    // 섹션 처음으로 돌아오면 초기화
    if (v < 0.12) { blockAutoShow.current = false; setShowPanel(false); }
  });

  const isDeptVisible = (o: number) => revealedCount >= o;

  const handleClose = () => {
    setShowPanel(false);
    blockAutoShow.current = true; // 라벨 탭 전까지 자동 재오픈 차단 (타임아웃 없음)
  };

  const handleRegionClick = (code: string) => {
    const key = primaryKey(code);
    if (REGION_WINES[key]) {
      setSelectedRegion(key);
      blockAutoShow.current = false;
      setShowPanel(true);
    }
  };

  const visibleLabels = isMobile
    ? Object.entries(WINE_DEPTS).filter(([code, d]) => d.showLabel && d.korName && MOBILE_KEYS.includes(code))
    : Object.entries(WINE_DEPTS).filter(([, d]) => d.showLabel && d.korName);

  return (
    <div ref={outerRef} style={{ height: '210vh', position: 'relative' }}>
      <div style={{
        position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
        background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(139,26,42,0.12) 0%, transparent 55%), #04010A',
      }}>
        {/* Map */}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }}>
          <motion.div style={{ width: '100%', height: '100%' }} initial={{ opacity: 0 }} animate={{ opacity: mapVisible ? 1 : 0 }} transition={{ duration: 0.7 }}>
            <ComposableMap projection="geoMercator" projectionConfig={{ center: [2.4, 46.8], scale: 1950 }} width={600} height={680}
              style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}>
              <Geographies geography={DEPT_URL}>
                {({ geographies }) => geographies.map(geo => {
                  const code = geo.properties.code as string;
                  const d = WINE_DEPTS[code];
                  const shown = d && isDeptVisible(d.revealOrder);
                  return (
                    <Geography key={geo.rsmKey} geography={geo} style={{
                      default: { fill: shown ? '#D42040' : '#1C0838', fillOpacity: shown ? (d?.opacity ?? 0) : 1, stroke: shown ? '#5A1028' : '#3A1068', strokeWidth: 0.8, outline: 'none', transition: 'fill 400ms, fill-opacity 400ms' },
                      hover:   { fill: shown ? '#D42040' : '#1C0838', fillOpacity: shown ? (d?.opacity ?? 0) : 1, stroke: shown ? '#5A1028' : '#3A1068', strokeWidth: 0.8, outline: 'none' },
                      pressed: { fill: '#1C0838', fillOpacity: 1, stroke: '#3A1068', strokeWidth: 0.8, outline: 'none' },
                    }} />
                  );
                })}
              </Geographies>
              {visibleLabels.map(([code, d]) => (
                <Marker key={code} coordinates={d.labelCoords}>
                  <RegionLabel
                    korName={d.korName} count={d.count} featured={d.featured}
                    visible={isDeptVisible(d.revealOrder)}
                    selected={selectedRegion === primaryKey(code)}
                    onClick={() => handleRegionClick(code)}
                  />
                </Marker>
              ))}
            </ComposableMap>
          </motion.div>
        </div>

        {/* Vignette */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 85% 80% at 50% 52%, transparent 50%, rgba(4,1,10,0.88) 100%)' }} />

        {/* Header */}
        <AnimatePresence>
          {mapVisible && (
            <motion.div key="ttl" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              style={{ position: 'absolute', top: 'clamp(14px,2.5vh,28px)', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.28em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 6 }}>지역 탐험</div>
              <h2 style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 'clamp(18px,3vw,32px)', fontWeight: 400, color: '#F5F0E8' }}>프랑스 와인 산지</h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll dots */}
        <div style={{ position: 'absolute', left: 'clamp(12px,2.5vw,24px)', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 10 }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ width: 5, height: revealedCount >= i ? 20 : 5, borderRadius: 3, background: revealedCount >= i ? '#C41E3A' : 'rgba(255,255,255,0.12)', transition: 'all 350ms' }} />)}
        </div>

        {/* Panels */}
        {!isMobile && <DesktopWinePanel regionKey={selectedRegion} visible={showPanel} />}
        {isMobile && <MobileBottomSheet selectedRegion={selectedRegion} visible={showPanel} revealedCount={revealedCount} onSelectRegion={(k) => { blockAutoShow.current = false; setSelectedRegion(k); setShowPanel(true); }} onClose={handleClose} />}

        {/* 모바일 전용 — 지역 클릭 안내 (패널이 닫혔을 때 + 지역이 1개 이상 등장했을 때) */}
        <AnimatePresence>
          {isMobile && mapVisible && !showPanel && revealedCount >= 1 && (
            <motion.div
              key="click-hint"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              style={{
                position: 'absolute',
                top: 'clamp(90px, 14vh, 130px)',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 25,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background: 'rgba(5,2,14,0.82)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(201,168,76,0.4)',
                  borderRadius: 50,
                  padding: '11px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  style={{ fontSize: 16, color: GOLD }}
                >
                  ✦
                </motion.span>
                <span style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#F5F0E8',
                  letterSpacing: '-0.01em',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  지역을 클릭해 보세요
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll hint (맵 등장 전) */}
        <AnimatePresence>
          {!mapVisible && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
              <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ color: '#4A3D56', fontSize: 11, letterSpacing: '0.12em', textAlign: 'center' }}>↓ SCROLL</motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
