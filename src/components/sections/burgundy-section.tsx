'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { useLocale } from '@/components/providers/locale-provider';

const DEPT_URL = '/france-departments.json';
const GOLD = '#f0c876';
const BURGUNDY_DEPTS = new Set(['21', '71', '89', '58', '01', '70', '39']);

type FilterKey = 'cru' | 'vineyard' | 'producer' | 'vintage';

type Cru = 'Grand Cru' | '1er Cru' | 'Village' | 'Régional';
type ProducerType = 'Domaine' | 'Maison' | 'Négociant-Éleveur';

// ── Data ────────────────────────────────────────────────────────────────────

type ProducerData = {
  id: string; name: string; nameKo: string; initials: string; coords: [number, number];
  village: string; blurb: string; type: ProducerType;
};

type VineyardData = {
  id: string; name: string; nameKo: string; coords: [number, number];
  classification: 'Grand Cru' | '1er Cru';
  subregion: string; area: string;
  isMonopole?: boolean;
};

type Wine = {
  id: string;
  name: string;
  nameKo: string;
  vintage: number;
  producerId: string;
  vineyardId?: string;
  subregionId: string;
  village: string;
  villageKo: string;
  cru: Cru;
  date: string;
  occasion?: string;
  note: string;
  coords: [number, number];
  color: string;
  label: string;
  rating: number;
  appellation: string;
};

// ── 등급 시각 토큰 ───────────────────────────────────────────────────────────
const CRU_ORDER: Cru[] = ['Grand Cru', '1er Cru', 'Village', 'Régional'];
const CRU_META: Record<Cru, { ko: string; chip: string; color: string; bg: string; border: string }> = {
  'Grand Cru': { ko: '그랑 크뤼',    chip: 'GC',  color: '#E06070', bg: 'rgba(212,32,64,0.20)',  border: 'rgba(212,32,64,0.55)'  },
  '1er Cru':   { ko: '프르미에 크뤼', chip: '1er', color: '#E0B560', bg: 'rgba(201,168,76,0.18)', border: 'rgba(201,168,76,0.55)' },
  'Village':   { ko: '빌라주',       chip: 'V',   color: '#9B8B7A', bg: 'rgba(155,139,122,0.14)',border: 'rgba(155,139,122,0.45)' },
  'Régional':  { ko: '레지오날',     chip: 'R',   color: '#7A6E5A', bg: 'rgba(122,110,90,0.12)', border: 'rgba(122,110,90,0.40)'  },
};
const PRODUCER_TYPE_KO: Record<ProducerType, string> = {
  'Domaine': '도멘',
  'Maison': '메종',
  'Négociant-Éleveur': '네고시앙-엘레뵈르',
};

const MOBILE_TAB_BAR_HEIGHT = 58; // 모바일 하단 필터 탭 바 높이 (시트 bottomOffset)

// 지도 배경 앰비언트 라벨 (마커보다 흐림, 맥락 이해용)
type AmbientSize = 'lg' | 'md' | 'sm';
const AMBIENT_LABELS: { text: string; coords: [number, number]; size: AmbientSize }[] = [
  // 광역 / 꼬뜨
  { text: 'Côte de Nuits',     coords: [5.20, 47.18], size: 'lg' },
  { text: 'Côte de Beaune',    coords: [5.05, 46.95], size: 'lg' },
  { text: 'Chablis',           coords: [3.95, 47.83], size: 'md' },
  // 주요 마을 (와인이 자주 등장)
  { text: 'Gevrey-Chambertin', coords: [5.07, 47.23], size: 'sm' },
  { text: 'Vosne-Romanée',     coords: [5.04, 47.17], size: 'sm' },
  { text: 'Nuits-Saint-Georges',coords:[5.04, 47.10], size: 'sm' },
  { text: 'Meursault',         coords: [4.88, 46.98], size: 'sm' },
  { text: 'Puligny-Montrachet',coords: [4.86, 46.94], size: 'sm' },
];

const AMBIENT_FONT: Record<AmbientSize, { fontSize: number; letter: string; weight: number; opacity: number }> = {
  lg: { fontSize: 7,   letter: '0.36em', weight: 600, opacity: 0.32 },
  md: { fontSize: 5.5, letter: '0.28em', weight: 600, opacity: 0.30 },
  sm: { fontSize: 3.6, letter: '0.18em', weight: 500, opacity: 0.40 },
};

// 빈티지 평가 차트 (보고서 §1-7: Wine Spectator / Cult Wines / Jancis Robinson 종합)
type VintageRating = { red: number; white: number; comment: string; isLandmark?: boolean };
const VINTAGE_RATINGS: Record<number, VintageRating> = {
  2015: { red: 5, white: 4, comment: '"역사적 빈티지". 따뜻한 여름, 농축, 장기 숙성', isLandmark: true },
  2016: { red: 4, white: 5, comment: '봄 서리로 수량 적음, 살아남은 와인은 정밀' },
  2017: { red: 4, white: 5, comment: '화이트의 해. 신선·미네랄, "2014 이후 최고 화이트"' },
  2018: { red: 5, white: 3, comment: '풍년·풍성한 레드' },
  2019: { red: 5, white: 5, comment: '농축과 신선의 균형. "이 시대의 클래식"', isLandmark: true },
  2020: { red: 5, white: 5, comment: '"2010 이후 최고", 집중·신선·구조',         isLandmark: true },
  2021: { red: 2, white: 3, comment: '서리 피해 심각, 수량 1/3 감소' },
  2022: { red: 4, white: 4, comment: '회복의 해, 풍성' },
};

// 종합 별점 (red+white 평균 반올림)
function vintageScore(year: number): number {
  const r = VINTAGE_RATINGS[year];
  if (!r) return 3;
  return Math.round(((r.red + r.white) / 2) * 2) / 2; // 0.5 단위 반올림
}

// 빈티지 별점 → 마커 색상
function vintageColor(year: number): string {
  const s = vintageScore(year);
  if (s >= 5)   return '#E0B560'; // 5점: 진한 골드
  if (s >= 4.5) return '#C8965C'; // 4.5: 호박
  if (s >= 4)   return '#A57848'; // 4: 옅은 호박
  if (s >= 3)   return '#7A6E5A'; // 3: 회색-갈색
  return '#4A3D56';               // 2이하: 어두움
}

const PRODUCERS: ProducerData[] = [
  { id: 'drc',      name: 'Domaine de la Romanée-Conti', nameKo: '도멘 드 라 로마네-콩티 (DRC)', initials: 'DRC', coords: [4.975, 47.171], village: 'Vosne-Romanée',      blurb: '전설 중의 전설. 모노폴 1.81ha.',           type: 'Domaine' },
  { id: 'rousseau', name: 'Armand Rousseau',             nameKo: '도멘 아르망 루소',             initials: 'AR',  coords: [5.002, 47.226], village: 'Gevrey-Chambertin',  blurb: '주브레-샹베르탱의 절대자. 샹베르탱의 기준.', type: 'Domaine' },
  { id: 'leroy',    name: 'Domaine Leroy',               nameKo: '도멘 르루아',                 initials: 'LR',  coords: [4.970, 47.174], village: 'Vosne-Romanée',      blurb: '비오디나믹. 에이커당 부르고뉴 최고가.',     type: 'Domaine' },
  { id: 'coche',    name: 'Coche-Dury',                  nameKo: '코슈-뒤리',                   initials: 'CD',  coords: [4.836, 46.976], village: 'Meursault',          blurb: '뫼르소 최고봉. 희소성과 정교함.',           type: 'Domaine' },
  { id: 'lafon',    name: 'Comtes Lafon',                nameKo: '콩트 라퐁',                   initials: 'CL',  coords: [4.831, 46.973], village: 'Meursault',          blurb: '뫼르소 왕가. 페리에르는 매년 완판.',         type: 'Domaine' },
  { id: 'leflaive', name: 'Domaine Leflaive',            nameKo: '도멘 르플레브',               initials: 'LF',  coords: [4.797, 46.941], village: 'Puligny-Montrachet', blurb: '화이트 부르고뉴의 정점. 비오디나믹.',       type: 'Domaine' },
  { id: 'roulot',   name: 'Domaine Roulot',              nameKo: '도멘 룰로',                   initials: 'RL',  coords: [4.833, 46.978], village: 'Meursault',          blurb: '장-마르크 룰로. 현대 뫼르소의 기준.',       type: 'Domaine' },
  { id: 'raveneau', name: 'Raveneau',                    nameKo: '라브노',                       initials: 'RV',  coords: [3.801, 47.821], village: 'Chablis',            blurb: '샤블리 최고봉. 구하기 가장 어려운 와인.',   type: 'Domaine' },
  { id: 'dujac',    name: 'Domaine Dujac',               nameKo: '도멘 뒤작',                   initials: 'DJ',  coords: [4.983, 47.201], village: 'Morey-Saint-Denis',  blurb: '엘레강스와 투명함의 정수.',                  type: 'Domaine' },
  { id: 'gouges',   name: 'Henri Gouges',                nameKo: '앙리 구즈',                   initials: 'HG',  coords: [4.959, 47.109], village: 'Nuits-Saint-Georges',blurb: '뉘-생-조르주의 기준. 그랑 크뤼 없는 최고 도멘.', type: 'Domaine' },
  { id: 'montille', name: 'Domaine de Montille',         nameKo: '도멘 드 몽티유',              initials: 'DM',  coords: [4.778, 46.892], village: 'Volnay',             blurb: '볼네의 정밀파. 빌라주에서도 떼루아 표현.',  type: 'Domaine' },
  { id: 'drouhin',  name: 'Maison Joseph Drouhin',       nameKo: '메종 조제프 드루앵',          initials: 'JD',  coords: [4.840, 47.024], village: 'Beaune',             blurb: '본의 명문 메종. 부르고뉴 광역까지 폭넓게.', type: 'Négociant-Éleveur' },
];

const VINEYARDS: VineyardData[] = [
  { id: 'romanee-conti',     name: 'Romanée-Conti',           nameKo: '로마네-콩티',           coords: [4.975, 47.171], classification: 'Grand Cru', subregion: 'Vosne-Romanée',     area: '1.81 ha',  isMonopole: true },
  { id: 'la-tache',          name: 'La Tâche',                nameKo: '라 타슈',               coords: [4.974, 47.168], classification: 'Grand Cru', subregion: 'Vosne-Romanée',     area: '6.06 ha',  isMonopole: true },
  { id: 'richebourg',        name: 'Richebourg',              nameKo: '리슈부르',              coords: [4.974, 47.175], classification: 'Grand Cru', subregion: 'Vosne-Romanée',     area: '8.03 ha' },
  { id: 'chambertin',        name: 'Chambertin',              nameKo: '샹베르탱',              coords: [5.003, 47.223], classification: 'Grand Cru', subregion: 'Gevrey-Chambertin', area: '12.9 ha' },
  { id: 'clos-saint-jacques',name: 'Clos Saint-Jacques',      nameKo: '클로 생-자크',          coords: [5.004, 47.228], classification: '1er Cru',   subregion: 'Gevrey-Chambertin', area: '6.7 ha'  },
  { id: 'musigny',           name: 'Musigny',                 nameKo: '뮈지니',                coords: [4.972, 47.203], classification: 'Grand Cru', subregion: 'Chambolle-Musigny', area: '10.7 ha' },
  { id: 'clos-de-la-roche',  name: 'Clos de la Roche',        nameKo: '클로 드 라 로슈',       coords: [4.978, 47.205], classification: 'Grand Cru', subregion: 'Morey-Saint-Denis', area: '16.9 ha' },
  { id: 'clos-vougeot',      name: 'Clos de Vougeot',         nameKo: '클로 드 부조',          coords: [4.970, 47.195], classification: 'Grand Cru', subregion: 'Vougeot',           area: '50.6 ha' },
  { id: 'les-pruliers',      name: 'NSG Les Pruliers',        nameKo: '뉘-생-조르주 레 프뤼리에', coords: [4.959, 47.109], classification: '1er Cru',   subregion: 'Nuits-Saint-Georges',area: '7.1 ha'  },
  { id: 'perrieres',         name: 'Meursault Perrières',     nameKo: '뫼르소 레 페리에르',    coords: [4.830, 46.978], classification: '1er Cru',   subregion: 'Meursault',         area: '13.7 ha' },
  { id: 'charmes',           name: 'Meursault Charmes',       nameKo: '뫼르소 레 샤름',        coords: [4.829, 46.974], classification: '1er Cru',   subregion: 'Meursault',         area: '31.1 ha' },
  { id: 'montrachet',        name: 'Chevalier-Montrachet',    nameKo: '슈발리에-몽라셰',       coords: [4.797, 46.942], classification: 'Grand Cru', subregion: 'Puligny-Montrachet',area: '7.5 ha'  },
  { id: 'valmur',            name: 'Chablis GC Valmur',       nameKo: '샤블리 그랑 크뤼 발뮈르', coords: [3.815, 47.823], classification: 'Grand Cru', subregion: 'Chablis',           area: '11.0 ha' },
];

// ── 내가 마신 와인 (AI 자동 분류) ────────────────────────────────────────────
const WINES: Wine[] = [
  { id: 'w01', name: 'Romanée-Conti',              nameKo: '로마네-콩티',                vintage: 2018, producerId: 'drc',      vineyardId: 'romanee-conti',     subregionId: 'cote-nuits',  village: 'Vosne-Romanée',      villageKo: '본-로마네',         cru: 'Grand Cru', date: '2025.11.20', occasion: '결혼 10주년', note: '장미꽃잎, 동양 향신료, 끝없는 여운.',  coords: [4.975, 47.171], color: '#5b1424', label: 'RC',  rating: 5, appellation: 'Vosne'     },
  { id: 'w02', name: 'La Tâche',                   nameKo: '라 타슈',                    vintage: 2017, producerId: 'drc',      vineyardId: 'la-tache',          subregionId: 'cote-nuits',  village: 'Vosne-Romanée',      villageKo: '본-로마네',         cru: 'Grand Cru', date: '2025.05.04', occasion: '와인 모임',   note: '검은 체리, 가죽, 트뤼플의 깊이.',      coords: [4.974, 47.168], color: '#4a1226', label: 'LT',  rating: 5, appellation: 'Vosne'     },
  { id: 'w03', name: 'Richebourg',                 nameKo: '리슈부르',                   vintage: 2016, producerId: 'leroy',    vineyardId: 'richebourg',        subregionId: 'cote-nuits',  village: 'Vosne-Romanée',      villageKo: '본-로마네',         cru: 'Grand Cru', date: '2025.09.18', occasion: '생일',        note: '벨벳 같은 질감, 짙은 베리.',           coords: [4.974, 47.175], color: '#56142b', label: 'RB',  rating: 5, appellation: 'Vosne'     },
  { id: 'w04', name: 'Musigny',                    nameKo: '뮈지니',                     vintage: 2018, producerId: 'leroy',    vineyardId: 'musigny',           subregionId: 'cote-nuits',  village: 'Chambolle-Musigny',  villageKo: '샹볼-뮈지니',       cru: 'Grand Cru', date: '2025.07.22',                          note: '제비꽃, 라즈베리, 실키한 탄닌.',       coords: [4.972, 47.203], color: '#481128', label: 'MU',  rating: 5, appellation: 'Chambolle' },
  { id: 'w05', name: 'Chambertin',                 nameKo: '샹베르탱',                   vintage: 2017, producerId: 'rousseau', vineyardId: 'chambertin',        subregionId: 'cote-nuits',  village: 'Gevrey-Chambertin',  villageKo: '주브레-샹베르탱',   cru: 'Grand Cru', date: '2025.09.12', occasion: '와인 행사',   note: '구조감의 정점. 검은 과실과 감초.',     coords: [5.003, 47.223], color: '#3d0f1f', label: 'CB',  rating: 5, appellation: 'Gevrey'    },
  { id: 'w06', name: 'Clos Saint-Jacques 1er Cru', nameKo: '클로 생-자크 1er Cru',       vintage: 2019, producerId: 'rousseau', vineyardId: 'clos-saint-jacques',subregionId: 'cote-nuits',  village: 'Gevrey-Chambertin',  villageKo: '주브레-샹베르탱',   cru: '1er Cru',   date: '2025.04.02',                          note: '광물성과 붉은 베리의 균형.',           coords: [5.004, 47.228], color: '#4d1124', label: 'CSJ', rating: 4, appellation: 'Gevrey'    },
  { id: 'w07', name: 'Clos de la Roche',           nameKo: '클로 드 라 로슈',            vintage: 2017, producerId: 'dujac',    vineyardId: 'clos-de-la-roche',  subregionId: 'cote-nuits',  village: 'Morey-Saint-Denis',  villageKo: '모레-생-드니',      cru: 'Grand Cru', date: '2025.06.14',                          note: '엘레강스, 투명한 붉은 과실.',          coords: [4.978, 47.205], color: '#52132a', label: 'CR',  rating: 5, appellation: 'Morey'     },
  { id: 'w08', name: 'Clos de Vougeot',            nameKo: '클로 드 부조',               vintage: 2017, producerId: 'dujac',    vineyardId: 'clos-vougeot',      subregionId: 'cote-nuits',  village: 'Vougeot',            villageKo: '부조',             cru: 'Grand Cru', date: '2025.03.10', occasion: '디너',        note: '흙내음, 따뜻한 베리.',                 coords: [4.970, 47.195], color: '#45112a', label: 'CV',  rating: 4, appellation: 'Vougeot'   },
  { id: 'w09', name: 'NSG Les Pruliers 1er Cru',   nameKo: '뉘-생-조르주 레 프뤼리에 1er Cru', vintage: 2019, producerId: 'gouges', vineyardId: 'les-pruliers',     subregionId: 'cote-nuits',  village: 'Nuits-Saint-Georges',villageKo: '뉘-생-조르주',     cru: '1er Cru',   date: '2025.08.05',                          note: '강건함, 검은 자두, 미네랄.',           coords: [4.959, 47.109], color: '#3a0d1c', label: 'LP',  rating: 4, appellation: 'NSG'       },
  { id: 'w10', name: 'Meursault Perrières 1er Cru',nameKo: '뫼르소 레 페리에르 1er Cru', vintage: 2018, producerId: 'coche',    vineyardId: 'perrieres',         subregionId: 'cote-beaune', village: 'Meursault',          villageKo: '뫼르소',           cru: '1er Cru',   date: '2025.07.30', occasion: '여름 디너',   note: '버터, 헤이즐넛, 짭짤한 미네랄.',       coords: [4.830, 46.978], color: '#7a5c10', label: 'MP',  rating: 5, appellation: 'Meursault' },
  { id: 'w11', name: 'Meursault Perrières 1er Cru',nameKo: '뫼르소 레 페리에르 1er Cru', vintage: 2017, producerId: 'lafon',    vineyardId: 'perrieres',         subregionId: 'cote-beaune', village: 'Meursault',          villageKo: '뫼르소',           cru: '1er Cru',   date: '2025.10.05',                          note: '풍부한 과실과 정교한 산미.',           coords: [4.831, 46.973], color: '#6a4c08', label: 'MP',  rating: 5, appellation: 'Meursault' },
  { id: 'w12', name: 'Meursault Charmes 1er Cru',  nameKo: '뫼르소 레 샤름 1er Cru',     vintage: 2018, producerId: 'roulot',   vineyardId: 'charmes',           subregionId: 'cote-beaune', village: 'Meursault',          villageKo: '뫼르소',           cru: '1er Cru',   date: '2025.11.01',                          note: '흰 꽃, 시트러스, 정밀한 마무리.',      coords: [4.829, 46.974], color: '#5a3c05', label: 'MC',  rating: 4, appellation: 'Meursault' },
  { id: 'w13', name: 'Chevalier-Montrachet',       nameKo: '슈발리에-몽라셰',            vintage: 2019, producerId: 'leflaive', vineyardId: 'montrachet',        subregionId: 'cote-beaune', village: 'Puligny-Montrachet', villageKo: '퓔리니-몽라셰',    cru: 'Grand Cru', date: '2025.10.15',                          note: '백악, 흰 꽃, 정교한 산미.',            coords: [4.797, 46.942], color: '#4a3003', label: 'CM',  rating: 5, appellation: 'Puligny'   },
  { id: 'w14', name: 'Chablis GC Valmur',          nameKo: '샤블리 GC 발뮈르',           vintage: 2020, producerId: 'raveneau', vineyardId: 'valmur',            subregionId: 'chablis',     village: 'Chablis',            villageKo: '샤블리',           cru: 'Grand Cru', date: '2025.06.05',                          note: '굴 껍데기, 라임, 부싯돌.',             coords: [3.815, 47.823], color: '#ab8b22', label: 'VM',  rating: 5, appellation: 'Chablis'   },
  // Village
  { id: 'w15', name: 'Volnay',                     nameKo: '볼네',                       vintage: 2018, producerId: 'montille',                                  subregionId: 'cote-beaune', village: 'Volnay',             villageKo: '볼네',             cru: 'Village',   date: '2025.08.18', occasion: '평일 저녁',   note: '실키한 탄닌, 붉은 베리, 우아함.',      coords: [4.778, 46.892], color: '#621631', label: 'V',   rating: 4, appellation: 'Volnay'    },
  // Régional
  { id: 'w16', name: 'Bourgogne Pinot Noir',       nameKo: '부르고뉴 피노 누아',         vintage: 2020, producerId: 'drouhin',                                   subregionId: 'cote-beaune', village: 'Bourgogne',          villageKo: '부르고뉴 광역',     cru: 'Régional',  date: '2025.04.20', occasion: '데일리',     note: '신선한 붉은 과실, 부드러운 가성비.',   coords: [4.840, 47.024], color: '#7c1c33', label: 'BP',  rating: 4, appellation: 'Bourgogne' },
];

// 그룹별 마신 와인 카운트/리스트 헬퍼
const winesByCru:      Record<Cru, Wine[]>     = { 'Grand Cru': [], '1er Cru': [], 'Village': [], 'Régional': [] };
const winesByProducer: Record<string, Wine[]>  = {};
const winesByVineyard: Record<string, Wine[]>  = {};
const winesByVintage:  Record<number, Wine[]>  = {};
WINES.forEach(w => {
  winesByCru[w.cru].push(w);
  (winesByProducer[w.producerId] ||= []).push(w);
  if (w.vineyardId) (winesByVineyard[w.vineyardId] ||= []).push(w);
  (winesByVintage[w.vintage] ||= []).push(w);
});
// 마신 빈티지 — 최신순 (내림차순)
const VINTAGE_KEYS: number[] = Object.keys(winesByVintage).map(Number).sort((a, b) => b - a);

// ── Map markers ─────────────────────────────────────────────────────────────

function CountBadge({ n, x, y }: { n: number; x: number; y: number }) {
  if (n <= 0) return null;
  return (
    <g transform={`translate(${x},${y})`} style={{ pointerEvents: 'none' }}>
      <circle cx={0} cy={0} r={3.6} fill="#D42040" stroke="#04010A" strokeWidth={0.7} />
      <text textAnchor="middle" y={1.3}
        style={{ fill: '#fff', fontSize: 4.2, fontFamily: 'Inter,sans-serif', fontWeight: 800 } as React.CSSProperties}>
        {n}
      </text>
    </g>
  );
}

// 통일 마커 — 모든 탭에서 동일한 모양(작은 동그라미). 색만 의미 전달.
function MapPin({ id, color, hovered, ring, count, onHover }: {
  id: string;
  color: string;
  hovered: boolean;
  ring?: boolean;          // 모노폴 / Landmark 표시
  count?: number;          // 표시할 마신 병수 (없으면 미표시)
  onHover: (id: string | null) => void;
}) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: hovered ? 1.7 : 1 }}
      transition={{ duration: 0.35 }}
      style={{ cursor: 'pointer', pointerEvents: 'all', touchAction: 'manipulation' }}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      onTouchStart={() => onHover(id)}
    >
      {hovered && (
        <motion.circle cx={0} cy={0} r={6}
          fill="none" stroke={color} strokeWidth={0.7}
          animate={{ r: [6, 14], opacity: [0.7, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
      {ring && (
        <circle cx={0} cy={0} r={5}
          fill="none" stroke={color} strokeOpacity={0.55} strokeWidth={0.5}
        />
      )}
      <circle cx={0} cy={0} r={3.2}
        fill={color} fillOpacity={hovered ? 1 : 0.7}
        stroke="#04010A" strokeWidth={0.6}
      />
      {count !== undefined && count > 0 && (
        <CountBadge n={count} x={4.2} y={-4.2} />
      )}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <CruChip cru={wine.cru} size="xs" />
          <span style={{ fontSize: 16, fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 600, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.2px' }}>{wine.nameKo}</span>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'Georgia,serif', fontStyle: 'italic' as const, lineHeight: 1.2 }}>{wine.name}</div>
        <div style={{ fontSize: 9.5, color: GOLD, letterSpacing: '0.5px', textTransform: 'uppercase' as const, fontWeight: 500, marginTop: 1 }}>{wine.villageKo} · {wine.vintage > 0 ? wine.vintage : 'NV'}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.45, marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{wine.note}</div>
        <div style={{ marginTop: 'auto', paddingTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
          <WineGlassRating value={wine.rating} size={8} color={GOLD} gap={2} />
          <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)' }}>{wine.date}</span>
        </div>
      </div>
    </div>
  );
}

function CollectedBadge({ count, color = '#E06070', bg = 'rgba(212,32,64,0.16)', border = 'rgba(212,32,64,0.4)' }: {
  count: number; color?: string; bg?: string; border?: string;
}) {
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 9999,
      background: bg, border: `1px solid ${border}`,
      color, letterSpacing: '0.02em', fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>
      AI 분류 · {count}병
    </span>
  );
}

function CruChip({ cru, size = 'sm' }: { cru: Cru; size?: 'sm' | 'xs' }) {
  const meta = CRU_META[cru];
  const fz = size === 'xs' ? 8.5 : 9.5;
  const px = size === 'xs' ? 5 : 6;
  return (
    <span style={{
      fontSize: fz, padding: `1px ${px}px`, borderRadius: 4, fontWeight: 800, letterSpacing: '0.04em',
      background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color,
    }}>
      {meta.chip}
    </span>
  );
}

function MonopoleBadge() {
  return (
    <span style={{
      fontSize: 9, padding: '1px 6px', borderRadius: 9999, fontWeight: 700, letterSpacing: '0.06em',
      background: 'rgba(240,200,118,0.14)', border: '1px solid rgba(240,200,118,0.55)',
      color: GOLD, textTransform: 'uppercase' as const,
    }}>
      Monopole
    </span>
  );
}

function ProducerTypeBadge({ type }: { type: ProducerType }) {
  const isMaison = type !== 'Domaine';
  return (
    <span style={{
      fontSize: 9, padding: '1px 6px', borderRadius: 9999, fontWeight: 700, letterSpacing: '0.04em',
      background: isMaison ? 'rgba(155,139,122,0.15)' : 'rgba(201,168,76,0.12)',
      border: `1px solid ${isMaison ? 'rgba(155,139,122,0.45)' : 'rgba(201,168,76,0.45)'}`,
      color: isMaison ? '#C5B5A0' : GOLD,
    }}>
      {PRODUCER_TYPE_KO[type]}
    </span>
  );
}

function CruGroupCard({ cru, active }: { cru: Cru; active: boolean }) {
  const wines = winesByCru[cru];
  const meta = CRU_META[cru];
  return (
    <div style={{
      padding: '14px 16px',
      background: active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${active ? meta.border : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 12, transition: 'all 200ms',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <CruChip cru={cru} />
        <span style={{ fontSize: 15, fontFamily: 'Georgia, serif', color: '#F5F0E8', fontWeight: 600 }}>{meta.ko}</span>
        <span style={{ fontSize: 10, color: '#7A6E5A', marginLeft: 2 }}>{cru}</span>
        <span style={{ marginLeft: 'auto' }}>
          {wines.length > 0
            ? <CollectedBadge count={wines.length} color={meta.color} bg={meta.bg} border={meta.border} />
            : <span style={{ fontSize: 10, color: '#4A3D56', fontStyle: 'italic' }}>아직 없음</span>}
        </span>
      </div>
      {wines.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {wines.map(w => <WineRow key={w.id} wine={w} />)}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: '#6A5E4A', lineHeight: 1.5 }}>
          {cru === 'Régional'
            ? '입문용. 좋은 도멘의 레지오날은 가성비 보석.'
            : cru === 'Village' ? '마을 단위 AOC. 데일리 부르고뉴.'
            : '이 등급의 와인을 마시면 여기 자동 분류돼요.'}
        </div>
      )}
    </div>
  );
}

function VintageGroupCard({ year, active }: { year: number; active: boolean }) {
  const wines = winesByVintage[year] ?? [];
  const rating = VINTAGE_RATINGS[year];
  const score = vintageScore(year);
  const color = vintageColor(year);
  const isLandmark = rating?.isLandmark;
  return (
    <div style={{
      padding: '14px 16px',
      background: active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${active ? color + '70' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 12, transition: 'all 200ms',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 22, fontFamily: 'Georgia, serif', color: '#F5F0E8', fontWeight: 700, letterSpacing: '-0.5px' }}>{year}</span>
        {isLandmark && (
          <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 9999, fontWeight: 700, letterSpacing: '0.06em',
            background: 'rgba(240,200,118,0.14)', border: '1px solid rgba(240,200,118,0.55)', color: GOLD, textTransform: 'uppercase' as const }}>
            Landmark
          </span>
        )}
        <span style={{ marginLeft: 'auto' }}>
          <CollectedBadge count={wines.length} color={color} bg={color + '22'} border={color + '70'} />
        </span>
      </div>
      {rating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 10.5, color: '#9B8B7A' }}>
          <span>레드</span>
          <WineGlassRating value={rating.red} size={7} color={color} gap={1.5} />
          <span style={{ marginLeft: 6 }}>화이트</span>
          <WineGlassRating value={rating.white} size={7} color={color} gap={1.5} />
          <span style={{ marginLeft: 'auto', fontSize: 10, color: color, fontWeight: 700 }}>★ {score}</span>
        </div>
      )}
      {rating && (
        <div style={{ fontSize: 11, color: '#7A6E5A', lineHeight: 1.5, marginBottom: wines.length > 0 ? 10 : 0, fontStyle: 'italic' as const }}>
          {rating.comment}
        </div>
      )}
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
          <div style={{ fontSize: 13, color: '#F5F0E8', fontWeight: 600, lineHeight: 1.2 }}>{data.nameKo}</div>
          <div style={{ fontSize: 10, color: '#9B8B7A', marginTop: 1 }}>{data.name}</div>
        </div>
        {wines.length > 0 && <CollectedBadge count={wines.length} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <ProducerTypeBadge type={data.type} />
        <span style={{ fontSize: 10, color: '#7A6E5A' }}>{data.village}</span>
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
        <CruChip cru={isGC ? 'Grand Cru' : '1er Cru'} />
        <span style={{ fontSize: 14, fontFamily: 'Georgia, serif', color: '#F5F0E8', fontWeight: 600 }}>{data.nameKo}</span>
        {data.isMonopole && <MonopoleBadge />}
        <span style={{ marginLeft: 'auto' }}>{wines.length > 0 && <CollectedBadge count={wines.length} />}</span>
      </div>
      <div style={{ fontSize: 10.5, color: '#9B8B7A', marginBottom: wines.length > 0 ? 10 : 0 }}>
        <span style={{ color: '#D4C5B0' }}>{data.name}</span> · {data.subregion} · {data.area}
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

// 필터별 카메라 — center [경도, 위도], zoom (1 = 부르고뉴 전체)
const CAMERA: Record<FilterKey, { zoom: number; center: [number, number] }> = {
  cru:      { zoom: 1.0, center: [4.50, 47.00] },
  vineyard: { zoom: 3.4, center: [4.92, 47.10] },
  producer: { zoom: 2.6, center: [4.88, 47.10] },
  vintage:  { zoom: 1.0, center: [4.50, 47.00] },
};

function BurgundyMap({ filter, hoveredId, onHover }: {
  filter: FilterKey; hoveredId: string | null; onHover: (id: string | null) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState(CAMERA.cru);

  // RAF easing zoom·center transition (700ms easeOutCubic)
  useEffect(() => {
    const target = CAMERA[filter];
    const start = { zoom: view.zoom, center: [...view.center] as [number, number] };
    const dur = 700;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setView({
        zoom: start.zoom + (target.zoom - start.zoom) * e,
        center: [
          start.center[0] + (target.center[0] - start.center[0]) * e,
          start.center[1] + (target.center[1] - start.center[1]) * e,
        ],
      });
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // intentionally only depend on filter; we read view as initial snapshot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

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

  // Counter-scale to keep marker sizes roughly stable as we zoom in
  // (full inverse 1/z would shrink them too much; 0.65 power is a soft compromise)
  const cs = 1 / Math.pow(view.zoom, 0.65);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [4.2, 47.1], scale: 5800 }}
        width={600} height={700}
        style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
      >
        <ZoomableGroup
          zoom={view.zoom}
          center={view.center}
          minZoom={1}
          maxZoom={6}
          filterZoomEvent={() => false}
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
                  default: { fill: fillColor, fillOpacity, stroke: isBurgundy ? '#5A1028' : '#28085A', strokeWidth: (isBurgundy ? 0.8 : 0.4) * cs, outline: 'none', transition: 'fill-opacity 300ms' },
                  hover:   { fill: fillColor, fillOpacity, stroke: isBurgundy ? '#8B1A2A' : '#28085A', strokeWidth: (isBurgundy ? 1.0 : 0.4) * cs, outline: 'none' },
                  pressed: { fill: fillColor, fillOpacity, stroke: '#28085A',                          strokeWidth: 0.4 * cs,                       outline: 'none' },
                }} />
              );
            })}
          </Geographies>

          {/* 앰비언트 라벨 — 마을·꼬뜨 압인. 마커보다 흐림, 모든 탭 공통 */}
          {AMBIENT_LABELS.map(l => {
            const f = AMBIENT_FONT[l.size];
            return (
              <Marker key={l.text} coordinates={l.coords}>
                <g transform={`scale(${cs})`} style={{ pointerEvents: 'none' }}>
                  <text textAnchor="middle"
                    style={{
                      fill: '#D4C5B0', fillOpacity: f.opacity,
                      fontSize: f.fontSize, fontFamily: 'Georgia, serif',
                      fontWeight: f.weight, letterSpacing: f.letter,
                      textTransform: 'uppercase' as const,
                    } as React.CSSProperties}>
                    {l.text}
                  </text>
                </g>
              </Marker>
            );
          })}

          <AnimatePresence>
            {filter === 'cru' && (
              <motion.g key="cru-group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                {WINES.map(w => (
                  <Marker key={w.id} coordinates={w.coords}>
                    <g transform={`scale(${cs})`}>
                      <MapPin id={w.id} color={CRU_META[w.cru].color}
                        hovered={hoveredId === w.id} onHover={onHover} />
                    </g>
                  </Marker>
                ))}
              </motion.g>
            )}
            {filter === 'vineyard' && (
              <motion.g key="vy-group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                {VINEYARDS.map(d => (
                  <Marker key={d.id} coordinates={d.coords}>
                    <g transform={`scale(${cs})`}>
                      <MapPin id={d.id}
                        color={d.classification === 'Grand Cru' ? '#D42040' : '#C9A84C'}
                        hovered={hoveredId === d.id} ring={d.isMonopole}
                        count={winesByVineyard[d.id]?.length ?? 0}
                        onHover={onHover} />
                    </g>
                  </Marker>
                ))}
              </motion.g>
            )}
            {filter === 'producer' && (
              <motion.g key="pr-group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                {PRODUCERS.map(d => (
                  <Marker key={d.id} coordinates={d.coords}>
                    <g transform={`scale(${cs})`}>
                      <MapPin id={d.id} color={GOLD}
                        hovered={hoveredId === d.id}
                        count={winesByProducer[d.id]?.length ?? 0}
                        onHover={onHover} />
                    </g>
                  </Marker>
                ))}
              </motion.g>
            )}
            {filter === 'vintage' && (
              <motion.g key="vt-group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                {WINES.map(w => (
                  <Marker key={w.id} coordinates={w.coords}>
                    <g transform={`scale(${cs})`}>
                      <MapPin id={w.id} color={vintageColor(w.vintage)}
                        hovered={hoveredId === w.id}
                        ring={!!VINTAGE_RATINGS[w.vintage]?.isLandmark}
                        onHover={onHover} />
                    </g>
                  </Marker>
                ))}
              </motion.g>
            )}
          </AnimatePresence>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

// ── Filter tab button ─────────────────────────────────────────────────────────

const FILTER_LABELS: Record<FilterKey, { ko: string; en: string }> = {
  cru:      { ko: '등급',   en: 'Cru' },
  vineyard: { ko: '클리마', en: 'Climat' },
  producer: { ko: '도멘',   en: 'Domaine' },
  vintage:  { ko: '빈티지', en: 'Millésime' },
};

const TAB_ORDER: FilterKey[] = ['cru', 'vineyard', 'producer', 'vintage'];

// ── Item list panel content ───────────────────────────────────────────────────

function PanelContent({ filter, hoveredId, onHover }: {
  filter: FilterKey; hoveredId: string | null; onHover: (id: string | null) => void;
}) {
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
        {filter === 'cru' && CRU_ORDER.map(c => {
          const winesOfCru = winesByCru[c];
          // wine 마커 hover 시 그 와인이 속한 cru 카드 강조
          const active = winesOfCru.some(w => w.id === hoveredId);
          return (
            <div key={c}>
              <CruGroupCard cru={c} active={active} />
            </div>
          );
        })}
        {filter === 'producer' && PRODUCERS.map(d => (
          <div key={d.id} onMouseEnter={() => onHover(d.id)} onMouseLeave={() => onHover(null)}>
            <ProducerCard data={d} active={hoveredId === d.id} />
          </div>
        ))}
        {filter === 'vineyard' && VINEYARDS.map(d => (
          <div key={d.id} onMouseEnter={() => onHover(d.id)} onMouseLeave={() => onHover(null)}>
            <VineyardCard data={d} active={hoveredId === d.id} />
          </div>
        ))}
        {filter === 'vintage' && VINTAGE_KEYS.map(year => {
          const winesOfYear = winesByVintage[year];
          const active = winesOfYear.some(w => w.id === hoveredId);
          return (
            <div key={year}>
              <VintageGroupCard year={year} active={active} />
            </div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Desktop filter tabs (좌측 세로 스택, 지도 위) ───────────────────────────
function DesktopFilterTabs({ filter, setFilter, visible }: {
  filter: FilterKey; setFilter: (f: FilterKey) => void; visible: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -24 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      style={{
        position: 'absolute', top: 'clamp(96px, 14vh, 160px)', left: 'clamp(16px, 3vw, 36px)',
        width: 'clamp(160px, 15vw, 210px)', zIndex: 25,
        display: 'flex', flexDirection: 'column', gap: 6,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: '0.32em', color: '#9B8B7A', textTransform: 'uppercase' as const, fontWeight: 700, paddingLeft: 4, marginBottom: 6 }}>
        분류 축 / Sort by
      </div>
      {TAB_ORDER.map(fk => {
        const { ko, en } = FILTER_LABELS[fk];
        const active = filter === fk;
        return (
          <button key={fk} onClick={() => setFilter(fk)} style={{
            position: 'relative',
            padding: '12px 14px 12px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: active ? 'rgba(240,200,118,0.14)' : 'rgba(5,2,14,0.72)',
            outline: `1px solid ${active ? 'rgba(240,200,118,0.5)' : 'rgba(255,255,255,0.06)'}`,
            color: active ? GOLD : '#D4C5B0',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1,
            fontFamily: 'inherit', textAlign: 'left' as const,
            transition: 'all 200ms',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          }}>
            {active && (
              <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2, background: GOLD }} />
            )}
            <span style={{ fontSize: 14, fontWeight: 600 }}>{ko}</span>
            <span style={{ fontSize: 10, opacity: 0.65, letterSpacing: '0.06em', fontStyle: 'italic' as const }}>{en}</span>
          </button>
        );
      })}
      {/* count footer */}
      <div style={{ marginTop: 4, padding: '8px 12px', fontSize: 10, color: '#7A6E5A', letterSpacing: '0.04em', lineHeight: 1.5 }}>
        내가 마신 부르고뉴 <span style={{ color: GOLD, fontWeight: 700 }}>{WINES.length}병</span>
      </div>
    </motion.div>
  );
}

// ── Mobile filter tabs (화면 최하단 고정 — 시트 위) ─────────────────────────
function MobileFilterTabs({ filter, setFilter, visible }: {
  filter: FilterKey; setFilter: (f: FilterKey) => void; visible: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(5,2,14,0.96)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(240,200,118,0.18)',
        display: 'flex', zIndex: 40,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {TAB_ORDER.map(fk => {
        const { ko, en } = FILTER_LABELS[fk];
        const active = filter === fk;
        return (
          <button key={fk} onClick={() => setFilter(fk)} style={{
            flex: 1, position: 'relative', border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 2, padding: '12px 4px 10px',
            color: active ? GOLD : '#9B8B7A',
            transition: 'color 200ms',
            fontFamily: 'inherit',
          }}>
            {active && (
              <span style={{ position: 'absolute', top: 0, left: '22%', right: '22%', height: 2, background: GOLD, borderRadius: 1 }} />
            )}
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.02em' }}>{ko}</span>
            <span style={{ fontSize: 9, opacity: 0.65, letterSpacing: '0.06em', fontStyle: 'italic' as const }}>{en}</span>
          </button>
        );
      })}
    </motion.div>
  );
}

// ── Desktop panel ─────────────────────────────────────────────────────────────

function DesktopPanel({ filter, hoveredId, onHover, visible }: {
  filter: FilterKey;
  hoveredId: string | null; onHover: (id: string | null) => void;
  visible: boolean;
}) {
  const groupLabel =
    filter === 'cru'      ? '4개 등급으로 분류'
    : filter === 'vineyard' ? `${VINEYARDS.length}개 클리마로 분류`
    : filter === 'producer' ? `${PRODUCERS.length}개 도멘으로 분류`
    :                         `${VINTAGE_KEYS.length}개 빈티지로 분류`;
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 24 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      style={{
        position: 'absolute', top: '8%', right: '3vw',
        width: 'clamp(300px,30vw,380px)', maxHeight: '84vh', zIndex: 20,
        background: 'rgba(5,2,14,0.94)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(240,200,118,0.18)', borderRadius: 18,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Header: 활성 분류 정보만 (탭은 좌측 DesktopFilterTabs로 이전) */}
      <div style={{ padding: '14px 18px 10px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 10, color: '#9B8B7A', letterSpacing: '0.06em' }}>{groupLabel}</div>
      </div>

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 20px' }}>
        <PanelContent filter={filter} hoveredId={hoveredId} onHover={onHover} />
      </div>
    </motion.div>
  );
}

// ── Mobile sheet ──────────────────────────────────────────────────────────────

function MobileSheet({ filter, hoveredId, onHover, visible, bottomOffset }: {
  filter: FilterKey;
  hoveredId: string | null; onHover: (id: string | null) => void;
  visible: boolean;
  bottomOffset: number; // 하단 탭 바 높이 — 시트는 그 위에 위치
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
    const clamp = (v: number) => Math.min(0.86, Math.max(0.30, v));
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
      initial={{ y: '110%' }}
      animate={{ y: visible ? 0 : '110%' }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      style={{
        position: 'absolute', left: 0, right: 0, bottom: bottomOffset,
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
  const [filter, setFilter] = useState<FilterKey>('cru');
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
  const heading = t('burgundy.heading') || '내가 마신 와인이 등급·클리마·도멘·빈티지로';

  return (
    <section id="burgundy" ref={sectionRef} style={{ height: '100vh', position: 'relative', overflow: 'hidden', background: '#04010A' }}>
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

      {/* Filter tabs (탭은 패널/시트에서 분리 → 좌측 / 하단 고정) */}
      {!isMobile && <DesktopFilterTabs filter={filter} setFilter={setFilter} visible={visible} />}

      {/* Panels */}
      {isMobile && <MobileSheet filter={filter} hoveredId={hoveredId} onHover={setHoveredId} visible={visible} bottomOffset={MOBILE_TAB_BAR_HEIGHT} />}
      {!isMobile && <DesktopPanel filter={filter} hoveredId={hoveredId} onHover={setHoveredId} visible={visible} />}

      {/* Mobile filter tabs — 시트 위 z-index, 손가락 닿기 좋은 nudging zone */}
      {isMobile && <MobileFilterTabs filter={filter} setFilter={setFilter} visible={visible} />}
    </section>
  );
}
