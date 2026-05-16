'use client';

import { useState, useRef, useLayoutEffect, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { geoCentroid } from 'd3-geo';
import { useLocale } from '@/components/providers/locale-provider';
import { Bottle } from '@/components/wine-bottles/wine-bottle';
import {
  WineGlassRedIcon,
  WineGlassWhiteIcon,
  PinkRoseIcon,
  StarFilledIcon,
} from '@/components/icons/wine-icons';

const DEPT_URL = '/france-departments.json';
// 모드 무관 골드. globals.css `--color-gold` (#C9A84C) — 두 모드에서 동일한 액센트로 사용.
const GOLD = 'var(--color-gold)';
const BURGUNDY_DEPTS = new Set(['21', '71', '89', '58', '01', '70', '39']);

type Cru = 'Grand Cru' | '1er Cru' | 'Village' | 'Régional';
type ProducerType = 'Domaine' | 'Maison' | 'Négociant-Éleveur';
type WineType = 'red' | 'white' | 'rosé';
type Cote = 'Côte de Nuits' | 'Côte de Beaune' | 'Chablis' | 'Côte Chalonnaise' | 'Mâconnais';
type ColorFilter = 'all' | WineType;

// 위계 드릴다운: 부르고뉴 -> 꼬뜨 -> 마을 -> 등급 -> (와인)
type DrillLevel =
  | { kind: 'overview' }
  | { kind: 'cote'; coteId: Cote }
  | { kind: 'commune'; coteId: Cote; communeId: string }
  | { kind: 'cru'; coteId: Cote; communeId: string; cru: Cru };

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
  isGrandCruLevel1er?: boolean;
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
  wineType: WineType;
  date: string;
  occasion?: string;
  note: string;
  coords: [number, number];
  color: string;
  label: string;
  rating: number;
  appellation: string;
};

type CoteData = {
  id: Cote;
  nameKo: string;
  zoom: number;
  center: [number, number];
  character: string;
};

type CommuneData = {
  id: string;            // Wine.village와 매칭되는 키
  name: string;
  nameKo: string;
  cote: Cote;
  coords: [number, number];
  character: string;
  hasGrandCru: boolean;
  notableNote?: string;
};

// ── 등급 시각 토큰 ───────────────────────────────────────────────────────────
const CRU_ORDER: Cru[] = ['Grand Cru', '1er Cru', 'Village', 'Régional'];
const CRU_META: Record<Cru, { ko: string; chip: string; color: string; bg: string; border: string }> = {
  'Grand Cru': { ko: '그랑 크뤼',    chip: 'GC',  color: '#A8233A', bg: 'rgba(123,31,43,0.22)',  border: 'rgba(168,35,58,0.60)'  },
  '1er Cru':   { ko: '프르미에 크뤼', chip: '1er', color: '#C9A227', bg: 'rgba(201,162,39,0.18)', border: 'rgba(201,162,39,0.55)' },
  'Village':   { ko: '빌라주',       chip: 'V',   color: '#9098A8', bg: 'rgba(107,114,128,0.16)',border: 'rgba(107,114,128,0.45)' },
  'Régional':  { ko: '레지오날',     chip: 'R',   color: '#B8A07A', bg: 'rgba(168,149,111,0.14)', border: 'rgba(168,149,111,0.42)'  },
};
const WINE_TYPE_META: Record<WineType, { ko: string; color: string }> = {
  'red':   { ko: '레드',   color: '#A8233A' },
  'white': { ko: '화이트', color: '#D4C065' },
  'rosé':  { ko: '로제',   color: '#D97A8A' },
};

// 꼬뜨(광역) 메타 — 드릴다운 Level 0 -> 1
const COTES: CoteData[] = [
  { id: 'Côte de Nuits',    nameKo: '꼬뜨 드 뉘',    zoom: 4.8, center: [4.97, 47.18], character: '피노 누아의 본거지. 부르고뉴 최고급 레드 거의 전부.' },
  { id: 'Côte de Beaune',   nameKo: '꼬뜨 드 본',    zoom: 4.5, center: [4.80, 46.95], character: '화이트 왕국 + 우아한 레드. 몽라셰·뫼르소·볼네.' },
  { id: 'Chablis',          nameKo: '샤블리',        zoom: 5.0, center: [3.81, 47.82], character: '100% 샤르도네. 키메리지안 토양, 가장 미네랄.' },
  { id: 'Côte Chalonnaise', nameKo: '코트 샬로네즈', zoom: 4.5, center: [4.75, 46.83], character: '가성비 부르고뉴. Bouzeron·Rully·Mercurey·Givry. 알리고테 단일 AOC도 여기.' },
  { id: 'Mâconnais',        nameKo: '마코네',        zoom: 4.8, center: [4.73, 46.30], character: '따뜻한 화이트. Pouilly-Fuissé(2020년 1er Cru 승격)·Saint-Véran.' },
];

// 마을(코뮌) 메타 — 드릴다운 Level 1 -> 2. id는 Wine.village와 일치시킴
const COMMUNES: CommuneData[] = [
  // Côte de Nuits (북->남)
  { id: 'Marsannay',           name: 'Marsannay',           nameKo: '막사네',         cote: 'Côte de Nuits',  coords: [4.972, 47.310], character: '꼬뜨 드 뉘 최북단. 가벼운 피노 + 부르고뉴 유일 빌라주급 로제 AOC.', hasGrandCru: false, notableNote: '부르고뉴 유일 마을명 로제 AOC (1987)' },
  { id: 'Fixin',               name: 'Fixin',               nameKo: '픽생',           cote: 'Côte de Nuits',  coords: [4.987, 47.265], character: '막사네 바로 남쪽. 견고하고 흙내음 강한 레드, 잘 알려지지 않아 가성비.', hasGrandCru: false },
  { id: 'Gevrey-Chambertin',   name: 'Gevrey-Chambertin',   nameKo: '주브레-샹베르탱', cote: 'Côte de Nuits',  coords: [5.003, 47.226], character: '묵직, 남성적, 검은 과실. 샹베르탱·클로 드 베즈.', hasGrandCru: true },
  { id: 'Morey-Saint-Denis',   name: 'Morey-Saint-Denis',   nameKo: '모레-생-드니',   cote: 'Côte de Nuits',  coords: [4.983, 47.211], character: '체리, 견고함. 클로 드 라 로슈·클로 드 타르.',                hasGrandCru: true },
  { id: 'Chambolle-Musigny',   name: 'Chambolle-Musigny',   nameKo: '샹볼-뮈지니',    cote: 'Côte de Nuits',  coords: [4.972, 47.203], character: '가볍고 향기로움, 꽃. 뮈지니·본 마르.',                          hasGrandCru: true },
  { id: 'Vougeot',             name: 'Vougeot',             nameKo: '부조',           cote: 'Côte de Nuits',  coords: [4.970, 47.196], character: '클로 드 부조 50ha를 80여 명이 공유.',                            hasGrandCru: true },
  { id: 'Vosne-Romanée',       name: 'Vosne-Romanée',       nameKo: '본-로마네',      cote: 'Côte de Nuits',  coords: [4.975, 47.171], character: '이국적, 향신료, 깊이. 로마네-콩티·라 타슈·리슈부르.',          hasGrandCru: true },
  { id: 'Nuits-Saint-Georges', name: 'Nuits-Saint-Georges', nameKo: '뉘-생-조르주',   cote: 'Côte de Nuits',  coords: [4.959, 47.109], character: '견고, 광물성. 그랑 크뤼는 없지만 1er Cru 절대 강자.',           hasGrandCru: false },
  // Côte de Beaune (북->남)
  { id: 'Aloxe-Corton',        name: 'Aloxe-Corton',        nameKo: '알록스-코르통',  cote: 'Côte de Beaune', coords: [4.857, 47.062], character: '코트 드 본 최북단. Corton(레드)·Corton-Charlemagne(화이트) — 코트 드 본 유일 GC.', hasGrandCru: true },
  { id: 'Beaune',              name: 'Beaune',              nameKo: '본',             cote: 'Côte de Beaune', coords: [4.840, 47.024], character: '부르고뉴 와인 무역의 수도. 그랑 크뤼는 없으나 1er Cru가 다수.',  hasGrandCru: false },
  { id: 'Pommard',             name: 'Pommard',             nameKo: '포마르',         cote: 'Côte de Beaune', coords: [4.785, 46.934], character: '강건, 흙내음, 검은 과실. 코트 드 본의 가장 남성적 레드. 레 뤼지엥·레 제프노.', hasGrandCru: false, notableNote: '레 뤼지엥은 GC급 1er Cru로 자주 회자' },
  { id: 'Volnay',              name: 'Volnay',              nameKo: '볼네',           cote: 'Côte de Beaune', coords: [4.778, 46.892], character: '우아, 실키. 코트 드 본의 가장 섬세한 레드.',                    hasGrandCru: false },
  { id: 'Meursault',           name: 'Meursault',           nameKo: '뫼르소',         cote: 'Côte de Beaune', coords: [4.831, 46.976], character: '풍성, 버터, 헤이즐넛. 화이트 강자, 그랑 크뤼는 없음.',          hasGrandCru: false },
  { id: 'Puligny-Montrachet',  name: 'Puligny-Montrachet',  nameKo: '퓔리니-몽라셰',  cote: 'Côte de Beaune', coords: [4.797, 46.941], character: '정밀, 미네랄, 시트러스. 몽라셰·슈발리에-몽라셰.',                hasGrandCru: true },
  { id: 'Chassagne-Montrachet',name: 'Chassagne-Montrachet',nameKo: '샤사뉴-몽라셰',  cote: 'Côte de Beaune', coords: [4.737, 46.918], character: '풍성한 화이트 + 견과류 + 레드도 우수. 몽라셰·바타르-몽라셰.',    hasGrandCru: true },
  { id: 'Saint-Aubin',         name: 'Saint-Aubin',         nameKo: '생-토뱅',        cote: 'Côte de Beaune', coords: [4.722, 46.918], character: '몽라셰 마을 뒤편 언덕. 화이트 가성비의 정점. 앙 르미이.',         hasGrandCru: false, notableNote: '앙 르미이는 슈발리에-몽라셰 바로 옆' },
  { id: 'Bourgogne',           name: 'Bourgogne',           nameKo: '부르고뉴 광역',  cote: 'Côte de Beaune', coords: [4.840, 47.024], character: 'Régional AOC. 좋은 도멘의 부르고뉴는 가성비 보석.',              hasGrandCru: false },
  // Chablis
  { id: 'Chablis',             name: 'Chablis',             nameKo: '샤블리',         cote: 'Chablis',        coords: [3.801, 47.821], character: '굴껍데기·라임·부싯돌. 100% 샤르도네 미네랄의 정점.',             hasGrandCru: true },
  // Côte Chalonnaise (북->남)
  { id: 'Bouzeron',            name: 'Bouzeron',            nameKo: '부즈롱',         cote: 'Côte Chalonnaise', coords: [4.738, 46.882], character: '알리고테 단일 품종 AOC — 부르고뉴 유일.',                       hasGrandCru: false, notableNote: '부르고뉴 유일 알리고테 마을 AOC' },
  { id: 'Rully',               name: 'Rully',               nameKo: '륄리',           cote: 'Côte Chalonnaise', coords: [4.755, 46.864], character: '화이트 중심 + 크레망 베이스. 23개 1er Cru 클리마.',                hasGrandCru: false },
  { id: 'Mercurey',            name: 'Mercurey',            nameKo: '메르퀴레',       cote: 'Côte Chalonnaise', coords: [4.718, 46.829], character: '코트 샬로네즈 최대 마을, 레드 중심. 32개 1er Cru.',                hasGrandCru: false },
  { id: 'Givry',               name: 'Givry',               nameKo: '지브리',         cote: 'Côte Chalonnaise', coords: [4.745, 46.776], character: '레드 중심. 헨리 4세가 즐긴 마을로 전해짐.',                       hasGrandCru: false, notableNote: '헨리 4세의 와인' },
  // Mâconnais (북->남)
  { id: 'Saint-Véran',         name: 'Saint-Véran',         nameKo: '생-베랑',        cote: 'Mâconnais',       coords: [4.732, 46.275], character: 'Pouilly-Fuissé 인근. 따뜻하고 풍성한 샤르도네, 가성비.',           hasGrandCru: false },
  { id: 'Pouilly-Fuissé',      name: 'Pouilly-Fuissé',      nameKo: '푸이-퓌세',      cote: 'Mâconnais',       coords: [4.737, 46.286], character: '마코네 최상급 화이트. 2020년 22개 클리마가 1er Cru 승격(마코네 최초).', hasGrandCru: false, notableNote: '2020년 마코네 최초 1er Cru 승격' },
];

// 부르고뉴 dept 코드 → 표시할 행정구역 이름 (지도 위 라벨용)
const DEPT_NAMES: Record<string, string> = {
  '21': "Côte-d'Or",
  '71': 'Saône-et-Loire',
  '89': 'Yonne',
  '58': 'Nièvre',
  '01': 'Ain',
  '70': 'Haute-Saône',
  '39': 'Jura',
};

// Wine.subregionId -> Cote 매핑 (드릴다운 그룹핑용)
const SUBREGION_TO_COTE: Record<string, Cote> = {
  'cote-nuits': 'Côte de Nuits',
  'cote-beaune': 'Côte de Beaune',
  'chablis': 'Chablis',
  'cote-chalonnaise': 'Côte Chalonnaise',
  'maconnais': 'Mâconnais',
};

// 모바일 breadcrumb + 컬러 토글은 시트 상단(드래그 핸들 아래)에 위치 — 하단 바 없음

const PRODUCERS: ProducerData[] = [
  { id: 'drc',      name: 'Domaine de la Romanée-Conti', nameKo: '도멘 드 라 로마네-콩티 (DRC)', initials: 'DRC', coords: [4.975, 47.171], village: 'Vosne-Romanée',      blurb: '전설 중의 전설. 모노폴 1.76ha.',           type: 'Domaine' },
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
  { id: 'mugnier',  name: 'J.-F. Mugnier',               nameKo: '도멘 J.-F. 뮈니에',           initials: 'JM',  coords: [4.972, 47.202], village: 'Chambolle-Musigny',  blurb: '레 자무뢰즈·뮈지니 최고봉. 섬세함과 투명함의 정수.', type: 'Domaine' },
  { id: 'meocamuzet', name: 'Méo-Camuzet',              nameKo: '메오-카뮈제',                  initials: 'MC',  coords: [4.975, 47.173], village: 'Vosne-Romanée',      blurb: '크로 파랑투의 전설. 앙리 자이에에게 물려받은 밭.', type: 'Domaine' },
  { id: 'bart',     name: 'Domaine Bart',                nameKo: '도멘 바르',                   initials: 'B',   coords: [4.972, 47.310], village: 'Marsannay',          blurb: '막사네 4세대 가족 도멘. 마을명 로제로 유명.',     type: 'Domaine' },
  { id: 'pierregelin',name: 'Domaine Pierre Gelin',      nameKo: '도멘 피에르 즐랭',            initials: 'PG',  coords: [4.987, 47.265], village: 'Fixin',              blurb: '픽생의 대표 도멘. 클로 뒤 샤피트르 모노폴 보유.', type: 'Domaine' },
  { id: 'bonneau',  name: 'Bonneau du Martray',          nameKo: '보노 뒤 마르트레',            initials: 'BM',  coords: [4.853, 47.064], village: 'Aloxe-Corton',       blurb: '코르통-샤를마뉴·코르통만 만드는 단일 GC 도멘.',    type: 'Domaine' },
  { id: 'bouchard', name: 'Maison Bouchard Père & Fils', nameKo: '메종 부샤르 페르 에 피스',    initials: 'BF',  coords: [4.840, 47.025], village: 'Beaune',             blurb: '본 성 안의 1731년 메종. 코르통·뫼르소까지 폭넓게.', type: 'Négociant-Éleveur' },
  { id: 'comtearmand',name: 'Domaine Comte Armand',      nameKo: '도멘 콩트 아르망',            initials: 'CA',  coords: [4.789, 46.945], village: 'Pommard',            blurb: '클로 데 제프노 모노폴 5.2ha. 포마르의 강건함의 정점.', type: 'Domaine' },
  { id: 'ramonet',  name: 'Domaine Ramonet',             nameKo: '도멘 라모네',                 initials: 'RM',  coords: [4.738, 46.918], village: 'Chassagne-Montrachet', blurb: '샤사뉴 백포도주 왕가. 몽라셰·바타르의 표준.',    type: 'Domaine' },
  { id: 'huberlamy',name: 'Domaine Hubert Lamy',         nameKo: '도멘 위베르 라미',            initials: 'HL',  coords: [4.722, 46.918], village: 'Saint-Aubin',        blurb: '생-토뱅 정밀파. 앙 르미이 1er Cru로 슈발리에-몽라셰 옆 떼루아.', type: 'Domaine' },
  { id: 'faiveley', name: 'Domaine Faiveley',            nameKo: '도멘 페블레',                 initials: 'FV',  coords: [4.718, 46.829], village: 'Mercurey',           blurb: '메르퀴레 최대 도멘. 클로 데 미글랑 모노폴.',      type: 'Négociant-Éleveur' },
  { id: 'dureuil',  name: 'Vincent Dureuil-Janthial',    nameKo: '뱅상 뒤뢰이-장시알',          initials: 'VD',  coords: [4.755, 46.864], village: 'Rully',              blurb: '륄리 비오디나믹 선두주자. 르 메 카도 1er Cru.',   type: 'Domaine' },
  { id: 'lumpp',    name: 'Domaine François Lumpp',      nameKo: '도멘 프랑수아 룸프',          initials: 'FL',  coords: [4.745, 46.776], village: 'Givry',              blurb: '지브리 1er Cru 전문가. 크라우조·프티 마롤이 시그니처.', type: 'Domaine' },
  { id: 'devillaine',name: 'A. & P. de Villaine',        nameKo: 'A. & P. 드 빌렌',             initials: 'DV',  coords: [4.738, 46.882], village: 'Bouzeron',           blurb: 'DRC 공동 디렉터 오베르 드 빌렌의 도멘. 알리고테 부즈롱 표준.', type: 'Domaine' },
  { id: 'ferret',   name: 'Domaine J.A. Ferret',         nameKo: '도멘 J.A. 페레',              initials: 'JF',  coords: [4.732, 46.286], village: 'Pouilly-Fuissé',     blurb: '푸이-퓌세 명문, 4대째 가족 운영. 레 페리에르 1er Cru.', type: 'Domaine' },
  { id: 'merlin',   name: 'Domaine Olivier Merlin',      nameKo: '도멘 올리비에 메를랭',        initials: 'OM',  coords: [4.730, 46.290], village: 'Saint-Véran',        blurb: '마코네 자연주의 선두. 비에이 비뉴(올드 바인) 정통파.', type: 'Domaine' },
];

const VINEYARDS: VineyardData[] = [
  { id: 'romanee-conti',     name: 'Romanée-Conti',           nameKo: '로마네-콩티',           coords: [4.975, 47.171], classification: 'Grand Cru', subregion: 'Vosne-Romanée',     area: '1.76 ha',  isMonopole: true },
  { id: 'la-tache',          name: 'La Tâche',                nameKo: '라 타슈',               coords: [4.974, 47.168], classification: 'Grand Cru', subregion: 'Vosne-Romanée',     area: '5.08 ha',  isMonopole: true },
  { id: 'richebourg',        name: 'Richebourg',              nameKo: '리슈부르',              coords: [4.974, 47.175], classification: 'Grand Cru', subregion: 'Vosne-Romanée',     area: '7.89 ha' },
  { id: 'chambertin',        name: 'Chambertin',              nameKo: '샹베르탱',              coords: [5.003, 47.223], classification: 'Grand Cru', subregion: 'Gevrey-Chambertin', area: '13.57 ha' },
  { id: 'chambertin-beze',   name: 'Chambertin-Clos de Bèze', nameKo: '샹베르탱-클로 드 베즈', coords: [5.002, 47.221], classification: 'Grand Cru', subregion: 'Gevrey-Chambertin', area: '15.78 ha' },
  { id: 'clos-saint-jacques',name: 'Clos Saint-Jacques',      nameKo: '클로 생-자크',          coords: [5.004, 47.228], classification: '1er Cru',   subregion: 'Gevrey-Chambertin', area: '6.7 ha',   isGrandCruLevel1er: true },
  { id: 'musigny',           name: 'Musigny',                 nameKo: '뮈지니',                coords: [4.972, 47.203], classification: 'Grand Cru', subregion: 'Chambolle-Musigny', area: '10.67 ha' },
  { id: 'les-amoureuses',    name: 'Les Amoureuses',          nameKo: '레 자무뢰즈',           coords: [4.971, 47.200], classification: '1er Cru',   subregion: 'Chambolle-Musigny', area: '5.23 ha',  isGrandCruLevel1er: true },
  { id: 'clos-de-la-roche',  name: 'Clos de la Roche',        nameKo: '클로 드 라 로슈',       coords: [4.978, 47.205], classification: 'Grand Cru', subregion: 'Morey-Saint-Denis', area: '16.52 ha' },
  { id: 'clos-vougeot',      name: 'Clos de Vougeot',         nameKo: '클로 드 부조',          coords: [4.970, 47.195], classification: 'Grand Cru', subregion: 'Vougeot',           area: '49.43 ha' },
  { id: 'cros-parantoux',    name: 'Cros Parantoux',          nameKo: '크로 파랑투',           coords: [4.976, 47.174], classification: '1er Cru',   subregion: 'Vosne-Romanée',     area: '1.01 ha',  isGrandCruLevel1er: true },
  { id: 'les-saint-georges', name: 'Les Saint-Georges',       nameKo: '레 생-조르주',          coords: [4.958, 47.108], classification: '1er Cru',   subregion: 'Nuits-Saint-Georges',area: '9.53 ha',  isGrandCruLevel1er: true },
  { id: 'les-pruliers',      name: 'NSG Les Pruliers',        nameKo: '뉘-생-조르주 레 프뤼리에', coords: [4.960, 47.110], classification: '1er Cru',   subregion: 'Nuits-Saint-Georges',area: '7.1 ha'  },
  { id: 'perrieres',         name: 'Meursault Perrières',     nameKo: '뫼르소 레 페리에르',    coords: [4.830, 46.978], classification: '1er Cru',   subregion: 'Meursault',         area: '13.72 ha', isGrandCruLevel1er: true },
  { id: 'charmes',           name: 'Meursault Charmes',       nameKo: '뫼르소 레 샤름',        coords: [4.829, 46.974], classification: '1er Cru',   subregion: 'Meursault',         area: '31.1 ha' },
  { id: 'les-rugiens',       name: 'Les Rugiens (Bas)',        nameKo: '레 뤼지엥 바',          coords: [4.793, 46.986], classification: '1er Cru',   subregion: 'Pommard',           area: '5.84 ha',  isGrandCruLevel1er: true },
  { id: 'les-pucelles',      name: 'Les Pucelles',            nameKo: '레 퓌셀',               coords: [4.796, 46.940], classification: '1er Cru',   subregion: 'Puligny-Montrachet', area: '6.77 ha', isGrandCruLevel1er: true },
  { id: 'montrachet',        name: 'Chevalier-Montrachet',    nameKo: '슈발리에-몽라셰',       coords: [4.797, 46.942], classification: 'Grand Cru', subregion: 'Puligny-Montrachet',area: '7.47 ha'  },
  { id: 'valmur',            name: 'Chablis GC Valmur',       nameKo: '샤블리 그랑 크뤼 발뮈르', coords: [3.815, 47.823], classification: 'Grand Cru', subregion: 'Chablis',           area: '11.04 ha' },
  { id: 'corton',            name: 'Corton',                  nameKo: '코르통',                coords: [4.857, 47.066], classification: 'Grand Cru', subregion: 'Aloxe-Corton',      area: '160.19 ha' },
  { id: 'corton-charlemagne',name: 'Corton-Charlemagne',      nameKo: '코르통-샤를마뉴',       coords: [4.853, 47.064], classification: 'Grand Cru', subregion: 'Aloxe-Corton',      area: '52.23 ha' },
  { id: 'batard-montrachet', name: 'Bâtard-Montrachet',       nameKo: '바타르-몽라셰',         coords: [4.741, 46.918], classification: 'Grand Cru', subregion: 'Chassagne-Montrachet', area: '11.86 ha' },
  { id: 'clos-mouches',      name: 'Beaune Clos des Mouches', nameKo: '본 클로 데 무슈',        coords: [4.815, 46.998], classification: '1er Cru',   subregion: 'Beaune',            area: '25.18 ha' },
  { id: 'en-remilly',        name: 'Saint-Aubin En Remilly',  nameKo: '생-토뱅 앙 르미이',      coords: [4.724, 46.928], classification: '1er Cru',   subregion: 'Saint-Aubin',       area: '13.75 ha', isGrandCruLevel1er: true },
  { id: 'clos-chapitre',     name: 'Fixin Clos du Chapitre',  nameKo: '픽생 클로 뒤 샤피트르',  coords: [4.987, 47.265], classification: '1er Cru',   subregion: 'Fixin',             area: '4.79 ha',  isMonopole: true },
  { id: 'clos-myglands',     name: 'Mercurey Clos des Myglands', nameKo: '메르퀴레 클로 데 미글랑', coords: [4.720, 46.829], classification: '1er Cru', subregion: 'Mercurey',         area: '7.31 ha',  isMonopole: true },
];

// ── 내가 마신 와인 (AI 자동 분류) ────────────────────────────────────────────
const WINES: Wine[] = [
  { id: 'w01', name: 'Romanée-Conti',              nameKo: '로마네-콩티',                vintage: 2018, producerId: 'drc',      vineyardId: 'romanee-conti',     subregionId: 'cote-nuits',  village: 'Vosne-Romanée',      villageKo: '본-로마네',         cru: 'Grand Cru', wineType: 'red',   date: '2025.11.20', occasion: '결혼 10주년', note: '장미꽃잎, 동양 향신료, 끝없는 여운.',  coords: [4.975, 47.171], color: '#5b1424', label: 'RC',  rating: 5, appellation: 'Vosne'     },
  { id: 'w02', name: 'La Tâche',                   nameKo: '라 타슈',                    vintage: 2017, producerId: 'drc',      vineyardId: 'la-tache',          subregionId: 'cote-nuits',  village: 'Vosne-Romanée',      villageKo: '본-로마네',         cru: 'Grand Cru', wineType: 'red',   date: '2025.05.04', occasion: '와인 모임',   note: '검은 체리, 가죽, 트뤼플의 깊이.',      coords: [4.974, 47.168], color: '#4a1226', label: 'LT',  rating: 5, appellation: 'Vosne'     },
  { id: 'w03', name: 'Richebourg',                 nameKo: '리슈부르',                   vintage: 2016, producerId: 'leroy',    vineyardId: 'richebourg',        subregionId: 'cote-nuits',  village: 'Vosne-Romanée',      villageKo: '본-로마네',         cru: 'Grand Cru', wineType: 'red',   date: '2025.09.18', occasion: '생일',        note: '벨벳 같은 질감, 짙은 베리.',           coords: [4.974, 47.175], color: '#56142b', label: 'RB',  rating: 5, appellation: 'Vosne'     },
  { id: 'w04', name: 'Musigny',                    nameKo: '뮈지니',                     vintage: 2018, producerId: 'leroy',    vineyardId: 'musigny',           subregionId: 'cote-nuits',  village: 'Chambolle-Musigny',  villageKo: '샹볼-뮈지니',       cru: 'Grand Cru', wineType: 'red',   date: '2025.07.22',                          note: '제비꽃, 라즈베리, 실키한 탄닌.',       coords: [4.972, 47.203], color: '#481128', label: 'MU',  rating: 5, appellation: 'Chambolle' },
  { id: 'w05', name: 'Chambertin',                 nameKo: '샹베르탱',                   vintage: 2017, producerId: 'rousseau', vineyardId: 'chambertin',        subregionId: 'cote-nuits',  village: 'Gevrey-Chambertin',  villageKo: '주브레-샹베르탱',   cru: 'Grand Cru', wineType: 'red',   date: '2025.09.12', occasion: '와인 행사',   note: '구조감의 정점. 검은 과실과 감초.',     coords: [5.003, 47.223], color: '#3d0f1f', label: 'CB',  rating: 5, appellation: 'Gevrey'    },
  { id: 'w06', name: 'Clos Saint-Jacques 1er Cru', nameKo: '클로 생-자크 1er Cru',       vintage: 2019, producerId: 'rousseau', vineyardId: 'clos-saint-jacques',subregionId: 'cote-nuits',  village: 'Gevrey-Chambertin',  villageKo: '주브레-샹베르탱',   cru: '1er Cru',   wineType: 'red',   date: '2025.04.02',                          note: '광물성과 붉은 베리의 균형.',           coords: [5.004, 47.228], color: '#4d1124', label: 'CSJ', rating: 4, appellation: 'Gevrey'    },
  { id: 'w07', name: 'Clos de la Roche',           nameKo: '클로 드 라 로슈',            vintage: 2017, producerId: 'dujac',    vineyardId: 'clos-de-la-roche',  subregionId: 'cote-nuits',  village: 'Morey-Saint-Denis',  villageKo: '모레-생-드니',      cru: 'Grand Cru', wineType: 'red',   date: '2025.06.14',                          note: '엘레강스, 투명한 붉은 과실.',          coords: [4.978, 47.205], color: '#52132a', label: 'CR',  rating: 5, appellation: 'Morey'     },
  { id: 'w08', name: 'Clos de Vougeot',            nameKo: '클로 드 부조',               vintage: 2017, producerId: 'dujac',    vineyardId: 'clos-vougeot',      subregionId: 'cote-nuits',  village: 'Vougeot',            villageKo: '부조',             cru: 'Grand Cru', wineType: 'red',   date: '2025.03.10', occasion: '디너',        note: '흙내음, 따뜻한 베리.',                 coords: [4.970, 47.195], color: '#45112a', label: 'CV',  rating: 4, appellation: 'Vougeot'   },
  { id: 'w09', name: 'NSG Les Pruliers 1er Cru',   nameKo: '뉘-생-조르주 레 프뤼리에 1er Cru', vintage: 2019, producerId: 'gouges', vineyardId: 'les-pruliers',     subregionId: 'cote-nuits',  village: 'Nuits-Saint-Georges',villageKo: '뉘-생-조르주',     cru: '1er Cru',   wineType: 'red',   date: '2025.08.05',                          note: '강건함, 검은 자두, 미네랄.',           coords: [4.959, 47.109], color: '#3a0d1c', label: 'LP',  rating: 4, appellation: 'NSG'       },
  { id: 'w10', name: 'Meursault Perrières 1er Cru',nameKo: '뫼르소 레 페리에르 1er Cru', vintage: 2018, producerId: 'coche',    vineyardId: 'perrieres',         subregionId: 'cote-beaune', village: 'Meursault',          villageKo: '뫼르소',           cru: '1er Cru',   wineType: 'white', date: '2025.07.30', occasion: '여름 디너',   note: '버터, 헤이즐넛, 짭짤한 미네랄.',       coords: [4.830, 46.978], color: '#7a5c10', label: 'MP',  rating: 5, appellation: 'Meursault' },
  { id: 'w11', name: 'Meursault Perrières 1er Cru',nameKo: '뫼르소 레 페리에르 1er Cru', vintage: 2017, producerId: 'lafon',    vineyardId: 'perrieres',         subregionId: 'cote-beaune', village: 'Meursault',          villageKo: '뫼르소',           cru: '1er Cru',   wineType: 'white', date: '2025.10.05',                          note: '풍부한 과실과 정교한 산미.',           coords: [4.831, 46.973], color: '#6a4c08', label: 'MP',  rating: 5, appellation: 'Meursault' },
  { id: 'w12', name: 'Meursault Charmes 1er Cru',  nameKo: '뫼르소 레 샤름 1er Cru',     vintage: 2018, producerId: 'roulot',   vineyardId: 'charmes',           subregionId: 'cote-beaune', village: 'Meursault',          villageKo: '뫼르소',           cru: '1er Cru',   wineType: 'white', date: '2025.11.01',                          note: '흰 꽃, 시트러스, 정밀한 마무리.',      coords: [4.829, 46.974], color: '#5a3c05', label: 'MC',  rating: 4, appellation: 'Meursault' },
  { id: 'w13', name: 'Chevalier-Montrachet',       nameKo: '슈발리에-몽라셰',            vintage: 2019, producerId: 'leflaive', vineyardId: 'montrachet',        subregionId: 'cote-beaune', village: 'Puligny-Montrachet', villageKo: '퓔리니-몽라셰',    cru: 'Grand Cru', wineType: 'white', date: '2025.10.15',                          note: '백악, 흰 꽃, 정교한 산미.',            coords: [4.797, 46.942], color: '#4a3003', label: 'CM',  rating: 5, appellation: 'Puligny'   },
  { id: 'w14', name: 'Chablis GC Valmur',          nameKo: '샤블리 GC 발뮈르',           vintage: 2020, producerId: 'raveneau', vineyardId: 'valmur',            subregionId: 'chablis',     village: 'Chablis',            villageKo: '샤블리',           cru: 'Grand Cru', wineType: 'white', date: '2025.06.05',                          note: '굴 껍데기, 라임, 부싯돌.',             coords: [3.815, 47.823], color: '#ab8b22', label: 'VM',  rating: 5, appellation: 'Chablis'   },
  // GC급 1er Cru
  { id: 'w17', name: 'Les Amoureuses 1er Cru',   nameKo: '레 자무뢰즈 1er Cru',         vintage: 2019, producerId: 'mugnier',     vineyardId: 'les-amoureuses',    subregionId: 'cote-nuits',  village: 'Chambolle-Musigny',  villageKo: '샹볼-뮈지니',       cru: '1er Cru',   wineType: 'red',   date: '2025.12.05', occasion: '연말 디너',   note: '뮈지니 바로 아래. 꽃향기와 실크 같은 질감.',  coords: [4.971, 47.200], color: '#3e0e24', label: 'AM',  rating: 5, appellation: 'Chambolle' },
  { id: 'w18', name: 'Cros Parantoux 1er Cru',   nameKo: '크로 파랑투 1er Cru',         vintage: 2018, producerId: 'meocamuzet',  vineyardId: 'cros-parantoux',    subregionId: 'cote-nuits',  village: 'Vosne-Romanée',      villageKo: '본-로마네',         cru: '1er Cru',   wineType: 'red',   date: '2025.10.28',                          note: '앙리 자이에의 전설. 검은 과실, 야생화, 광물성.',  coords: [4.976, 47.174], color: '#4a1122', label: 'CP',  rating: 5, appellation: 'Vosne'     },
  { id: 'w19', name: 'Les Pucelles 1er Cru',     nameKo: '레 퓌셀 1er Cru',             vintage: 2020, producerId: 'leflaive',    vineyardId: 'les-pucelles',      subregionId: 'cote-beaune', village: 'Puligny-Montrachet', villageKo: '퓔리니-몽라셰',    cru: '1er Cru',   wineType: 'white', date: '2025.08.22', occasion: '여름 저녁',   note: '몽라셰 인접. 순수한 미네랄, 레몬, 흰 꽃.',    coords: [4.796, 46.940], color: '#6a5010', label: 'PU',  rating: 5, appellation: 'Puligny'   },
  // Village
  { id: 'w15', name: 'Volnay',                     nameKo: '볼네',                       vintage: 2018, producerId: 'montille',                                  subregionId: 'cote-beaune', village: 'Volnay',             villageKo: '볼네',             cru: 'Village',   wineType: 'red',   date: '2025.08.18', occasion: '평일 저녁',   note: '실키한 탄닌, 붉은 베리, 우아함.',      coords: [4.778, 46.892], color: '#621631', label: 'V',   rating: 4, appellation: 'Volnay'    },
  { id: 'w20', name: 'Marsannay Rosé',             nameKo: '막사네 로제',                vintage: 2022, producerId: 'bart',                                      subregionId: 'cote-nuits',  village: 'Marsannay',          villageKo: '막사네',           cru: 'Village',   wineType: 'rosé',  date: '2025.07.04', occasion: '여름 피크닉', note: '부르고뉴 유일 마을명 로제 AOC. 살구·산딸기·미네랄.', coords: [4.972, 47.310], color: '#d97a8a', label: 'MR',  rating: 4, appellation: 'Marsannay' },
  // Régional
  { id: 'w16', name: 'Bourgogne Pinot Noir',       nameKo: '부르고뉴 피노 누아',         vintage: 2020, producerId: 'drouhin',                                   subregionId: 'cote-beaune', village: 'Bourgogne',          villageKo: '부르고뉴 광역',     cru: 'Régional',  wineType: 'red',   date: '2025.04.20', occasion: '데일리',     note: '신선한 붉은 과실, 부드러운 가성비.',   coords: [4.840, 47.024], color: '#7c1c33', label: 'BP',  rating: 4, appellation: 'Bourgogne' },
  // Côte de Nuits — Fixin (저평가 가성비)
  { id: 'w21', name: 'Fixin Clos du Chapitre 1er Cru', nameKo: '픽생 클로 뒤 샤피트르 1er Cru', vintage: 2019, producerId: 'pierregelin', vineyardId: 'clos-chapitre', subregionId: 'cote-nuits',  village: 'Fixin',              villageKo: '픽생',             cru: '1er Cru',   wineType: 'red',   date: '2025.05.18',                          note: '주브레 바로 북쪽. 흙내음과 검은 자두, 4ha 모노폴.',  coords: [4.987, 47.265], color: '#5c1429', label: 'CCH', rating: 4, appellation: 'Fixin'     },
  // Côte de Beaune — Aloxe-Corton (코트 드 본 유일 GC)
  { id: 'w22', name: 'Corton-Charlemagne',         nameKo: '코르통-샤를마뉴',            vintage: 2019, producerId: 'bonneau',     vineyardId: 'corton-charlemagne',subregionId: 'cote-beaune', village: 'Aloxe-Corton',       villageKo: '알록스-코르통',    cru: 'Grand Cru', wineType: 'white', date: '2025.11.12', occasion: '와인 모임',   note: '강건한 미네랄, 헤이즐넛, 장기 숙성형 GC 화이트.', coords: [4.853, 47.064], color: '#8a6c12', label: 'CC',  rating: 5, appellation: 'Corton'    },
  { id: 'w23', name: 'Corton Le Clos du Roi',      nameKo: '코르통 르 클로 뒤 루아',     vintage: 2017, producerId: 'bouchard',    vineyardId: 'corton',            subregionId: 'cote-beaune', village: 'Aloxe-Corton',       villageKo: '알록스-코르통',    cru: 'Grand Cru', wineType: 'red',   date: '2025.09.28',                          note: '코트 드 본 유일 레드 GC. 검은 베리와 향신료, 견고한 구조.', coords: [4.857, 47.066], color: '#3e0d1e', label: 'CR',  rating: 4, appellation: 'Corton'    },
  // Côte de Beaune — Beaune
  { id: 'w24', name: 'Beaune Clos des Mouches 1er Cru', nameKo: '본 클로 데 무슈 1er Cru', vintage: 2018, producerId: 'drouhin',    vineyardId: 'clos-mouches',      subregionId: 'cote-beaune', village: 'Beaune',             villageKo: '본',               cru: '1er Cru',   wineType: 'red',   date: '2025.06.22',                          note: '드루앵 시그니처 클리마. 우아한 붉은 베리와 향신료.', coords: [4.815, 46.998], color: '#591530', label: 'CM',  rating: 4, appellation: 'Beaune'    },
  // Côte de Beaune — Pommard (강건함의 정점)
  { id: 'w25', name: 'Pommard Les Rugiens 1er Cru', nameKo: '포마르 레 뤼지엥 1er Cru',  vintage: 2018, producerId: 'comtearmand', vineyardId: 'les-rugiens',       subregionId: 'cote-beaune', village: 'Pommard',            villageKo: '포마르',           cru: '1er Cru',   wineType: 'red',   date: '2025.10.20', occasion: '가을 디너',   note: 'GC급 1er Cru. 강건함과 흙내음, 검은 자두의 깊이.', coords: [4.793, 46.986], color: '#3a0d20', label: 'PR',  rating: 5, appellation: 'Pommard'   },
  // Côte de Beaune — Chassagne-Montrachet
  { id: 'w26', name: 'Bâtard-Montrachet',          nameKo: '바타르-몽라셰',              vintage: 2019, producerId: 'ramonet',     vineyardId: 'batard-montrachet', subregionId: 'cote-beaune', village: 'Chassagne-Montrachet', villageKo: '샤사뉴-몽라셰',  cru: 'Grand Cru', wineType: 'white', date: '2025.12.20', occasion: '연말 디너',   note: '풍성한 헤이즐넛, 꿀, 미네랄 산미. 몽라셰 GC 패밀리.', coords: [4.741, 46.918], color: '#6f5208', label: 'BM',  rating: 5, appellation: 'Chassagne' },
  // Côte de Beaune — Saint-Aubin (가성비 화이트)
  { id: 'w27', name: 'Saint-Aubin En Remilly 1er Cru', nameKo: '생-토뱅 앙 르미이 1er Cru', vintage: 2020, producerId: 'huberlamy', vineyardId: 'en-remilly',       subregionId: 'cote-beaune', village: 'Saint-Aubin',        villageKo: '생-토뱅',          cru: '1er Cru',   wineType: 'white', date: '2025.07.15', occasion: '여름 점심',   note: '슈발리에-몽라셰 옆 떼루아. 정밀한 미네랄, 흰 꽃, 시트러스.', coords: [4.724, 46.928], color: '#7a5e10', label: 'ER',  rating: 4, appellation: 'St-Aubin'  },
  // Côte Chalonnaise — Bouzeron (알리고테 단일 AOC)
  { id: 'w28', name: 'Bouzeron Aligoté',           nameKo: '부즈롱 알리고테',            vintage: 2021, producerId: 'devillaine',                                   subregionId: 'cote-chalonnaise', village: 'Bouzeron',         villageKo: '부즈롱',           cru: 'Village',   wineType: 'white', date: '2025.05.10', occasion: '굴 페어링',   note: '부르고뉴 유일 알리고테 마을 AOC. 짭짤한 미네랄과 청사과.', coords: [4.738, 46.882], color: '#a8841a', label: 'BZ',  rating: 4, appellation: 'Bouzeron'  },
  // Côte Chalonnaise — Rully
  { id: 'w29', name: 'Rully Le Meix Cadot 1er Cru', nameKo: '륄리 르 메 카도 1er Cru',   vintage: 2020, producerId: 'dureuil',                                       subregionId: 'cote-chalonnaise', village: 'Rully',            villageKo: '륄리',             cru: '1er Cru',   wineType: 'white', date: '2025.04.15',                          note: '비오디나믹 비에이 비뉴. 정교한 산미와 흰 꽃향.',     coords: [4.755, 46.864], color: '#8a6c10', label: 'MC',  rating: 4, appellation: 'Rully'     },
  // Côte Chalonnaise — Mercurey (메르퀴레 최대 1er Cru 모노폴)
  { id: 'w30', name: 'Mercurey Clos des Myglands 1er Cru', nameKo: '메르퀴레 클로 데 미글랑 1er Cru', vintage: 2019, producerId: 'faiveley', vineyardId: 'clos-myglands', subregionId: 'cote-chalonnaise', village: 'Mercurey',     villageKo: '메르퀴레',         cru: '1er Cru',   wineType: 'red',   date: '2025.08.30',                          note: '페블레 모노폴 7.3ha. 다크 체리, 가죽, 견고한 탄닌.', coords: [4.720, 46.829], color: '#4a1224', label: 'MY',  rating: 4, appellation: 'Mercurey'  },
  // Côte Chalonnaise — Givry (헨리 4세의 와인)
  { id: 'w31', name: 'Givry Crausot 1er Cru',      nameKo: '지브리 크라우조 1er Cru',    vintage: 2020, producerId: 'lumpp',                                         subregionId: 'cote-chalonnaise', village: 'Givry',            villageKo: '지브리',           cru: '1er Cru',   wineType: 'red',   date: '2025.03.25',                          note: '붉은 베리, 가벼운 가죽, 가성비 좋은 1er Cru.',         coords: [4.745, 46.776], color: '#601628', label: 'CT',  rating: 4, appellation: 'Givry'     },
  // Mâconnais — Pouilly-Fuissé (2020년 1er Cru 승격)
  { id: 'w32', name: 'Pouilly-Fuissé Les Perrières 1er Cru', nameKo: '푸이-퓌세 레 페리에르 1er Cru', vintage: 2020, producerId: 'ferret',                          subregionId: 'maconnais',     village: 'Pouilly-Fuissé',     villageKo: '푸이-퓌세',        cru: '1er Cru',   wineType: 'white', date: '2025.06.30', occasion: '여름 디너',   note: '2020년 마코네 최초 승격 1er Cru. 풍성한 백복숭아, 견과류, 따뜻한 미네랄.', coords: [4.737, 46.286], color: '#9a781e', label: 'PF',  rating: 4, appellation: 'Pouilly'   },
  // Mâconnais — Saint-Véran (가성비)
  { id: 'w33', name: 'Saint-Véran Vieilles Vignes', nameKo: '생-베랑 비에이 비뉴',       vintage: 2021, producerId: 'merlin',                                       subregionId: 'maconnais',     village: 'Saint-Véran',        villageKo: '생-베랑',          cru: 'Village',   wineType: 'white', date: '2025.04.05', occasion: '데일리',     note: '올드 바인의 농축. 시트러스, 부드러운 산미, 가성비 정점.', coords: [4.732, 46.275], color: '#b8941e', label: 'SV',  rating: 4, appellation: 'St-Véran'  },
];

// 그룹별 마신 와인 카운트/리스트 헬퍼 (드릴다운에서 사용)
const winesByCommune: Record<string, Wine[]>  = {};
const winesByCote:    Record<Cote, Wine[]>    = { 'Côte de Nuits': [], 'Côte de Beaune': [], 'Chablis': [], 'Côte Chalonnaise': [], 'Mâconnais': [] };
WINES.forEach(w => {
  (winesByCommune[w.village] ||= []).push(w);
  const cote = SUBREGION_TO_COTE[w.subregionId];
  if (cote) winesByCote[cote].push(w);
});

// ── 드릴다운 헬퍼 ────────────────────────────────────────────────────────────
function applyColor<T extends { wineType: WineType }>(items: T[], cf: ColorFilter): T[] {
  return cf === 'all' ? items : items.filter(w => w.wineType === cf);
}

function communesAtCote(cote: Cote): CommuneData[] {
  return COMMUNES.filter(c => c.cote === cote);
}

function getCameraFor(d: DrillLevel): { zoom: number; center: [number, number] } {
  if (d.kind === 'overview') return { zoom: 1.0, center: [4.50, 47.00] };
  if (d.kind === 'cote') {
    const c = COTES.find(x => x.id === d.coteId);
    return c ? { zoom: c.zoom, center: c.center } : { zoom: 1.0, center: [4.50, 47.00] };
  }
  // commune or cru
  const cm = COMMUNES.find(x => x.id === d.communeId);
  if (!cm) return { zoom: 1.0, center: [4.50, 47.00] };
  return { zoom: d.kind === 'cru' ? 7.5 : 6.5, center: cm.coords };
}

// ── Map markers ─────────────────────────────────────────────────────────────

function CountBadge({ n, x, y }: { n: number; x: number; y: number }) {
  if (n <= 0) return null;
  return (
    <g transform={`translate(${x},${y})`} style={{ pointerEvents: 'none' }}>
      <circle cx={0} cy={0} r={3.6} fill="var(--color-map-wine-fill)" stroke="var(--color-map-bg)" strokeWidth={0.7} />
      <text textAnchor="middle" y={1.3}
        style={{ fill: '#fff', fontSize: 4.2, fontFamily: 'Inter,sans-serif', fontWeight: 800 } as React.CSSProperties}>
        {n}
      </text>
    </g>
  );
}

// 통일 마커 — 모든 탭에서 동일한 모양(작은 동그라미). 색만 의미 전달.
function MapPin({ id, color, hovered, ring, count, onHover, onClick }: {
  id: string;
  color: string;
  hovered: boolean;
  ring?: boolean;          // 모노폴 / Landmark 표시
  count?: number;          // 표시할 마신 병수 (없으면 미표시)
  onHover: (id: string | null) => void;
  onClick?: () => void;
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
      onClick={onClick}
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
        stroke="var(--color-map-bg)" strokeWidth={0.6}
      />
      {count !== undefined && count > 0 && (
        <CountBadge n={count} x={4.2} y={-4.2} />
      )}
    </motion.g>
  );
}

// ── Right-panel item cards ──────────────────────────────────────────────────

function WineGlassIcon({ filled, size = 9, color = GOLD, dim = 'var(--overlay-medium)' }: {
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

const BURGUNDY_LABEL_FG: Record<WineType, string> = {
  red:    '#3a1a20',
  white:  '#1a3a1a',
  'rosé': '#7a3a3a',
};

function BottleSilhouette({ wine, width = 44, height = 105 }: { wine: Wine; width?: number; height?: number }) {
  const vintageStr = wine.vintage > 0 ? String(wine.vintage) : 'NV';
  const region = `${(wine.appellation || '').toUpperCase()} · ${vintageStr}`;
  return (
    <Bottle
      shape="burgundy"
      style="detailed"
      glass={wine.color}
      liquid={wine.color}
      foil={wine.wineType === 'white' ? '#C9A84C' : wine.wineType === 'rosé' ? '#F5F0E8' : '#5b1424'}
      label="#F5F0E8"
      labelText={BURGUNDY_LABEL_FG[wine.wineType]}
      typeName={wine.label}
      region={region}
      ornament="line"
      width={width}
      height={height}
    />
  );
}

function WineRow({ wine }: { wine: Wine }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--color-bg-surface)', borderRadius: 16, border: '1px solid var(--color-border)' }}>
      <div style={{ width: 56, height: 110, borderRadius: 8, flexShrink: 0, background: 'radial-gradient(ellipse at top, transparent 60%, rgba(0,0,0,0.4) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BottleSilhouette wine={wine} width={44} height={105} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <CruChip cru={wine.cru} size="xs" />
          <span style={{ fontSize: 16, fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.15, letterSpacing: '-0.2px' }}>{wine.nameKo}</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--overlay-strong)', fontFamily: 'Georgia,serif', fontStyle: 'italic' as const, lineHeight: 1.2 }}>{wine.name}</div>
        <div style={{ fontSize: 9.5, color: GOLD, letterSpacing: '0.5px', textTransform: 'uppercase' as const, fontWeight: 500, marginTop: 1 }}>{wine.villageKo} · {wine.vintage > 0 ? wine.vintage : 'NV'}</div>
        <div style={{ fontSize: 11, color: 'var(--overlay-strong)', lineHeight: 1.45, marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{wine.note}</div>
        <div style={{ marginTop: 'auto', paddingTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
          <WineGlassRating value={wine.rating} size={8} color={GOLD} gap={2} />
          <span style={{ fontSize: 10.5, color: 'var(--overlay-strong)' }}>{wine.date}</span>
        </div>
      </div>
    </div>
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

// ── 가이드 글로우 (Plan B) ────────────────────────────────────────────────────
// 카드 border를 펄스 글로우로 강조해 인터랙티브함을 알림. 텍스트 없음 — 우하단에
// 저투명 동그라미만 추가해 카드 내 텍스트 가독성을 유지. localStorage 미사용.
function GuideGlow({ active, children }: { active: boolean; children: React.ReactNode }) {
  if (!active) return <>{children}</>;
  return (
    <motion.div
      style={{ position: 'relative', borderRadius: 12 }}
      animate={{
        boxShadow: [
          '0 0 0 1px rgba(240,200,118,0.30), 0 0 12px 0 rgba(240,200,118,0.16)',
          '0 0 0 1.5px rgba(240,200,118,0.70), 0 0 22px 4px rgba(240,200,118,0.42)',
          '0 0 0 1px rgba(240,200,118,0.30), 0 0 12px 0 rgba(240,200,118,0.16)',
        ],
      }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
      {/* 작은 펄스 동그라미 — 텍스트 가독성 유지 위해 낮은 opacity */}
      <div
        aria-hidden
        style={{
          position: 'absolute', bottom: 8, right: 10,
          width: 12, height: 12,
          pointerEvents: 'none', zIndex: 5,
        }}
      >
        <motion.div
          style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: GOLD, opacity: 0.32 }}
          animate={{ scale: [1, 1.9], opacity: [0.32, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.div
          style={{ position: 'absolute', inset: 3, borderRadius: '50%', background: GOLD, opacity: 0.45 }}
          animate={{ opacity: [0.45, 0.72, 0.45] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
}

// ── Burgundy map ─────────────────────────────────────────────────────────────

function BurgundyMap({ drill, colorFilter, hoveredId, onHover, onDrill }: {
  drill: DrillLevel;
  colorFilter: ColorFilter;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onDrill: (d: DrillLevel) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState(getCameraFor({ kind: 'overview' }));

  // RAF easing zoom·center transition — drill 변경에 반응
  useEffect(() => {
    const target = getCameraFor(drill);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drill]);

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

  const cs = 1 / Math.pow(view.zoom, 0.65);

  // 지도의 와인 점은 drill 단계와 무관하게 항상 모두 보여준다.
  // colorFilter(Red/White/Rosé)만 적용. drill 단계는 카메라 줌·사이드 패널에서만 의미를 가진다.
  const visibleWines: Wine[] = applyColor(WINES, colorFilter);

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
          minZoom={0.8}
          maxZoom={10}
          filterZoomEvent={() => false}
        >
          <Geographies geography={DEPT_URL}>
            {({ geographies }) => (
              <>
                {geographies.map(geo => {
                  const code = geo.properties.code as string;
                  const isBurgundy = BURGUNDY_DEPTS.has(code);
                  const isBeaujolais = code === '69';
                  const fillColor = isBurgundy ? 'var(--color-map-wine-fill)' : isBeaujolais ? '#9B3060' : 'var(--color-map-inactive)';
                  const fillOpacity = isBurgundy ? (code === '21' ? 0.80 : 0.45) : isBeaujolais ? 0.30 : 1;
                  return (
                    <Geography key={geo.rsmKey} geography={geo} style={{
                      default: { fill: fillColor, fillOpacity, stroke: isBurgundy ? '#5A1028' : 'var(--color-map-stroke)', strokeWidth: (isBurgundy ? 0.8 : 0.4) * cs, outline: 'none', transition: 'fill-opacity 300ms' },
                      hover:   { fill: fillColor, fillOpacity, stroke: isBurgundy ? 'var(--color-wine-red)' : 'var(--color-map-stroke)', strokeWidth: (isBurgundy ? 1.0 : 0.4) * cs, outline: 'none' },
                      pressed: { fill: fillColor, fillOpacity, stroke: 'var(--color-map-stroke)',                          strokeWidth: 0.4 * cs,                       outline: 'none' },
                    }} />
                  );
                })}
                {/* 부르고뉴 dept 라벨 — 행정구역 위 가운데, 흰색 저채도 */}
                {geographies.map(geo => {
                  const code = geo.properties.code as string;
                  const name = DEPT_NAMES[code];
                  if (!name) return null;
                  // react-simple-maps GeographyFeature -> d3-geo Feature 호환 (centroid 계산용)
                  const centroid = geoCentroid(geo as unknown as Parameters<typeof geoCentroid>[0]);
                  return (
                    <Marker key={`dept-label-${code}`} coordinates={centroid}>
                      <g transform={`scale(${cs})`} style={{ pointerEvents: 'none' }}>
                        <text textAnchor="middle" dominantBaseline="middle"
                          style={{
                            fill: 'var(--color-text-primary)', fillOpacity: 0.45,
                            fontSize: 4.5, fontFamily: 'Georgia, serif',
                            fontWeight: 500, letterSpacing: '0.08em',
                          } as React.CSSProperties}>
                          {name}
                        </text>
                      </g>
                    </Marker>
                  );
                })}
              </>
            )}
          </Geographies>

          <AnimatePresence>
            {/* 와인 마커 — 항상 모두 표시 (colorFilter 토글 시에만 fade 재마운트) */}
            <motion.g key={`wines-${colorFilter}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}>
              {visibleWines.map(w => {
                const cote = SUBREGION_TO_COTE[w.subregionId];
                const drillToWineCru = cote
                  ? () => onDrill({ kind: 'cru', coteId: cote, communeId: w.village, cru: w.cru })
                  : undefined;
                return (
                  <Marker key={w.id} coordinates={w.coords}>
                    <g transform={`scale(${cs})`}>
                      <MapPin id={w.id} color={CRU_META[w.cru].color}
                        hovered={hoveredId === w.id} onHover={onHover}
                        onClick={drillToWineCru} />
                    </g>
                  </Marker>
                );
              })}
            </motion.g>
          </AnimatePresence>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

// ── Drill-down 카드 컴포넌트 ──────────────────────────────────────────────────

function CoteCard({ data, onClick, colorFilter }: {
  data: CoteData; onClick: () => void; colorFilter: ColorFilter;
}) {
  const wines = applyColor(winesByCote[data.id] ?? [], colorFilter);
  const communes = communesAtCote(data.id);
  return (
    <button onClick={onClick} style={{
      padding: '14px 16px', textAlign: 'left' as const, cursor: 'pointer',
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 12, color: 'var(--color-text-primary)',
      transition: 'all 200ms', fontFamily: 'inherit', display: 'block', width: '100%',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-deep)'; e.currentTarget.style.borderColor = 'var(--color-gold-tint-med)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-bg-surface)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 18, fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 600, color: 'var(--color-text-primary)' }}>{data.nameKo}</span>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic' as const }}>{data.id}</span>
        <span style={{ marginLeft: 'auto', fontSize: 10.5, color: GOLD, fontWeight: 700 }}>
          {wines.length}병 · 마을 {communes.length}개
        </span>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{data.character}</div>
      <div style={{ marginTop: 8, fontSize: 10, color: 'var(--color-text-muted)' }}>› 마을 보기</div>
    </button>
  );
}

function CommuneCard({ data, onClick, colorFilter, active }: {
  data: CommuneData; onClick: () => void; colorFilter: ColorFilter; active: boolean;
}) {
  const wines = applyColor(winesByCommune[data.id] ?? [], colorFilter);
  const cruCounts: Partial<Record<Cru, number>> = {};
  wines.forEach(w => { cruCounts[w.cru] = (cruCounts[w.cru] ?? 0) + 1; });
  return (
    <button onClick={onClick} style={{
      padding: '14px 16px', textAlign: 'left' as const, cursor: 'pointer',
      background: active ? 'var(--color-gold-tint-faint)' : 'var(--color-bg-surface)',
      border: `1px solid ${active ? 'var(--color-gold-tint-med)' : 'var(--color-border)'}`,
      borderRadius: 12, color: 'var(--color-text-primary)',
      transition: 'all 200ms', fontFamily: 'inherit', display: 'block', width: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16, fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 600, color: 'var(--color-text-primary)' }}>{data.nameKo}</span>
        {data.hasGrandCru && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 9999, fontWeight: 800, background: CRU_META['Grand Cru'].bg, border: `1px solid ${CRU_META['Grand Cru'].border}`, color: CRU_META['Grand Cru'].color }}>GC</span>}
        <span style={{ fontSize: 10.5, color: 'var(--color-text-muted)', fontStyle: 'italic' as const }}>{data.name}</span>
        <span style={{ marginLeft: 'auto', fontSize: 10.5, color: GOLD, fontWeight: 700 }}>{wines.length}병</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.45, marginBottom: 6 }}>{data.character}</div>
      {data.notableNote && (
        <div style={{ fontSize: 10.5, color: GOLD, fontStyle: 'italic' as const, marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span aria-hidden style={{ display: 'inline-flex' }}>
            <StarFilledIcon size={11} filled />
          </span>
          {data.notableNote}
        </div>
      )}
      {wines.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginTop: 4 }}>
          {CRU_ORDER.map(c => {
            const n = cruCounts[c] ?? 0;
            if (n === 0) return null;
            return (
              <span key={c} style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 9999, fontWeight: 700,
                background: CRU_META[c].bg, border: `1px solid ${CRU_META[c].border}`, color: CRU_META[c].color,
              }}>
                {CRU_META[c].chip} {n}
              </span>
            );
          })}
        </div>
      )}
    </button>
  );
}

// ── Breadcrumb / Color toggle ────────────────────────────────────────────────

function buildCrumbs(drill: DrillLevel, onDrill: (d: DrillLevel) => void) {
  type Crumb = { label: string; click?: () => void };
  const crumbs: Crumb[] = [];
  crumbs.push({ label: '부르고뉴', click: () => onDrill({ kind: 'overview' }) });
  if (drill.kind !== 'overview') {
    const cote = COTES.find(c => c.id === drill.coteId);
    if (cote) crumbs.push({ label: cote.nameKo, click: () => onDrill({ kind: 'cote', coteId: drill.coteId }) });
  }
  if (drill.kind === 'commune' || drill.kind === 'cru') {
    const cm = COMMUNES.find(c => c.id === drill.communeId);
    if (cm) crumbs.push({
      label: cm.nameKo,
      click: drill.kind === 'cru'
        ? () => onDrill({ kind: 'commune', coteId: drill.coteId, communeId: drill.communeId })
        : undefined,
    });
  }
  if (drill.kind === 'cru') {
    crumbs.push({ label: CRU_META[drill.cru].ko });
  }
  return crumbs;
}

function Breadcrumb({ drill, onDrill }: {
  drill: DrillLevel; onDrill: (d: DrillLevel) => void;
}) {
  const crumbs = buildCrumbs(drill, onDrill);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' as const,
      fontSize: 11.5, letterSpacing: '0.02em',
    }}>
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {i > 0 && <span style={{ color: 'var(--color-text-disabled)', fontSize: 11 }}>›</span>}
            {c.click && !last ? (
              <button
                onClick={c.click}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-secondary)', fontSize: 'inherit', fontFamily: 'inherit',
                  padding: 0, fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              >
                {c.label}
              </button>
            ) : (
              <span style={{ color: last ? GOLD : 'var(--color-text-secondary)', fontWeight: last ? 700 : 500 }}>{c.label}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

// 모바일 시트 상단 chip 형태 — 알약 버튼으로 명확한 탭 가능 표시. 가로 스크롤 지원.
function MobileBreadcrumbChips({ drill, onDrill }: {
  drill: DrillLevel; onDrill: (d: DrillLevel) => void;
}) {
  const crumbs = buildCrumbs(drill, onDrill);
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        overflowX: 'auto', overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 2, // 가로 스크롤 시 클리핑 방지
      }}
    >
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        const clickable = !!c.click && !last;
        if (last) {
          return (
            <span key={i} style={{
              flexShrink: 0,
              padding: '6px 12px',
              background: 'var(--color-gold-tint-soft)',
              border: '1px solid var(--color-gold-tint-strong)',
              borderRadius: 9999,
              color: GOLD,
              fontSize: 12.5, fontWeight: 700,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap' as const,
            }}>
              {c.label}
            </span>
          );
        }
        return (
          <button
            key={i}
            onClick={clickable ? c.click : undefined}
            disabled={!clickable}
            style={{
              flexShrink: 0,
              padding: '6px 11px 6px 8px',
              background: 'var(--color-border-soft)',
              border: '1px solid var(--overlay-medium)',
              borderRadius: 9999,
              color: 'var(--color-text-secondary)',
              fontSize: 12.5, fontWeight: 500,
              fontFamily: 'inherit',
              cursor: clickable ? 'pointer' : 'default',
              display: 'inline-flex', alignItems: 'center', gap: 3,
              whiteSpace: 'nowrap' as const,
              transition: 'all 150ms',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span aria-hidden style={{ fontSize: 14, lineHeight: 1, color: GOLD, marginTop: -1 }}>‹</span>
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

function ColorToggle({ value, onChange, mobile }: {
  value: ColorFilter; onChange: (v: ColorFilter) => void; mobile?: boolean;
}) {
  const opts: { v: ColorFilter; label: string; icon?: ReactNode }[] = [
    { v: 'all',   label: '전체' },
    { v: 'red',   label: '레드',   icon: <WineGlassRedIcon size={12} /> },
    { v: 'white', label: '화이트', icon: <WineGlassWhiteIcon size={12} /> },
    { v: 'rosé',  label: '로제',   icon: <PinkRoseIcon size={12} /> },
  ];
  return (
    <div style={{
      display: 'flex', gap: 3,
      padding: 3, background: 'var(--overlay-soft)',
      border: '1px solid var(--color-border-soft)',
      borderRadius: 9999,
      width: '100%',
      justifyContent: 'space-between',
    }}>
      {opts.map(o => {
        const active = value === o.v;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} style={{
            padding: mobile ? '5px 10px' : '4px 8px',
            borderRadius: 9999, border: 'none', cursor: 'pointer',
            background: active ? 'var(--color-bg-surface)' : 'transparent',
            color: active ? GOLD : 'var(--color-text-muted)',
            fontSize: 11, fontWeight: active ? 700 : 500,
            letterSpacing: '0.02em',
            fontFamily: 'inherit',
            transition: 'all 150ms',
            whiteSpace: 'nowrap' as const,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            flex: '0 1 auto',
            minWidth: 0,
          }}>
            {o.icon && <span aria-hidden style={{ display: 'inline-flex' }}>{o.icon}</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Item list panel content ───────────────────────────────────────────────────

function PanelContent({ drill, colorFilter, onDrill, hoveredId, onHover }: {
  drill: DrillLevel; colorFilter: ColorFilter;
  onDrill: (d: DrillLevel) => void;
  hoveredId: string | null; onHover: (id: string | null) => void;
}) {
  const motionKey =
    drill.kind === 'overview' ? 'overview'
    : drill.kind === 'cote'    ? `cote-${drill.coteId}`
    : drill.kind === 'commune' ? `cm-${drill.communeId}`
    :                            `cru-${drill.communeId}-${drill.cru}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={motionKey}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.22 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {drill.kind === 'overview' && COTES.map(c => (
          <GuideGlow key={c.id} active={c.id === 'Côte de Nuits'}>
            <CoteCard data={c} colorFilter={colorFilter}
              onClick={() => onDrill({ kind: 'cote', coteId: c.id })} />
          </GuideGlow>
        ))}

        {drill.kind === 'cote' && communesAtCote(drill.coteId).map(c => (
          <GuideGlow key={c.id} active={drill.coteId === 'Côte de Nuits' && c.id === 'Gevrey-Chambertin'}>
            <div onMouseEnter={() => onHover(c.id)} onMouseLeave={() => onHover(null)}>
              <CommuneCard data={c} colorFilter={colorFilter}
                active={hoveredId === c.id}
                onClick={() => onDrill({ kind: 'commune', coteId: drill.coteId, communeId: c.id })} />
            </div>
          </GuideGlow>
        ))}

        {drill.kind === 'commune' && (() => {
          const allWines = applyColor(winesByCommune[drill.communeId] ?? [], colorFilter);
          const cm = COMMUNES.find(c => c.id === drill.communeId);
          if (allWines.length === 0) {
            return (
              <div style={{ padding: 20, textAlign: 'center' as const, color: 'var(--color-text-muted)', fontSize: 12 }}>
                이 마을에서 마신 와인이 없습니다 (현재 색 필터 기준).
              </div>
            );
          }
          return (
            <>
              {cm?.notableNote && (
                <div style={{
                  padding: '10px 14px', background: 'var(--color-gold-tint-faint)',
                  border: '1px solid var(--color-gold-tint-med)', borderRadius: 12,
                  fontSize: 11.5, color: GOLD, fontStyle: 'italic' as const,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span aria-hidden style={{ display: 'inline-flex', flexShrink: 0 }}>
                    <StarFilledIcon size={11} filled />
                  </span>
                  {cm.notableNote}
                </div>
              )}
              {CRU_ORDER.map(cru => {
                const n = allWines.filter(w => w.cru === cru).length;
                if (n === 0) return null;
                const showGuide = drill.kind === 'commune' && drill.communeId === 'Gevrey-Chambertin' && cru === '1er Cru';
                return (
                  <GuideGlow key={cru} active={showGuide}>
                    <button
                      onClick={() => onDrill({ kind: 'cru', coteId: drill.coteId, communeId: drill.communeId, cru })}
                      style={{
                        padding: '12px 14px', textAlign: 'left' as const, cursor: 'pointer',
                        background: 'var(--color-bg-surface)',
                        border: `1px solid ${CRU_META[cru].border}`,
                        borderRadius: 12, color: 'var(--color-text-primary)',
                        transition: 'all 200ms', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      }}
                    >
                      <CruChip cru={cru} />
                      <span style={{ fontSize: 14, fontFamily: 'Georgia, serif', color: 'var(--color-text-primary)', fontWeight: 600 }}>{CRU_META[cru].ko}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: CRU_META[cru].color, fontWeight: 700 }}>{n}병 ›</span>
                    </button>
                  </GuideGlow>
                );
              })}
            </>
          );
        })()}

        {drill.kind === 'cru' && (() => {
          const wines = applyColor((winesByCommune[drill.communeId] ?? []).filter(w => w.cru === drill.cru), colorFilter);
          if (wines.length === 0) {
            return <div style={{ padding: 20, textAlign: 'center' as const, color: 'var(--color-text-muted)', fontSize: 12 }}>이 등급에서 마신 와인이 없습니다.</div>;
          }
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {wines.map(w => (
                <div key={w.id} onMouseEnter={() => onHover(w.id)} onMouseLeave={() => onHover(null)}>
                  <WineRow wine={w} />
                </div>
              ))}
            </div>
          );
        })()}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Desktop side rail (좌측 breadcrumb + 색 토글) ─────────────────────────────
function DesktopSideRail({ drill, onDrill, colorFilter, onColor, visible }: {
  drill: DrillLevel; onDrill: (d: DrillLevel) => void;
  colorFilter: ColorFilter; onColor: (cf: ColorFilter) => void;
  visible: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -24 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      className="burgundy-side-rail"
      style={{
        position: 'absolute', top: 'clamp(96px, 14vh, 160px)', left: 'clamp(16px, 3vw, 36px)',
        width: 'clamp(260px, 20vw, 300px)', zIndex: 25,
        display: 'flex', flexDirection: 'column', gap: 12,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <style jsx>{`
        .burgundy-side-rail :global(.burgundy-side-card) {
          padding: 14px 18px;
          background: #FFFFFF;
          border: 1px solid var(--color-gold-tint-strong);
          border-radius: 18px;
          box-shadow: 0 18px 48px rgba(42, 31, 18, 0.14);
        }
        .burgundy-side-rail :global(.burgundy-side-count) {
          padding: 10px 16px;
          font-size: 11px;
          color: var(--color-text-secondary);
          letter-spacing: 0.04em;
          line-height: 1.5;
          background: #FFFFFF;
          border: 1px solid var(--color-gold-tint-strong);
          border-radius: 14px;
          box-shadow: 0 14px 36px rgba(42, 31, 18, 0.12);
        }
        :root[data-theme="dark"] .burgundy-side-rail :global(.burgundy-side-card),
        :root[data-theme="dark"] .burgundy-side-rail :global(.burgundy-side-count) {
          background: var(--color-bg-surface);
          border-color: rgba(45, 21, 64, 0.9);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55);
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .burgundy-side-rail :global(.burgundy-side-card),
          :root:not([data-theme="light"]) .burgundy-side-rail :global(.burgundy-side-count) {
            background: var(--color-bg-surface);
            border-color: rgba(45, 21, 64, 0.9);
            box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55);
          }
        }
      `}</style>
      <div className="burgundy-side-card">
        <div style={{ fontSize: 9, letterSpacing: '0.32em', color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, fontWeight: 700, marginBottom: 8 }}>
          현재 위치 / Drill
        </div>
        <Breadcrumb drill={drill} onDrill={onDrill} />
      </div>
      <div className="burgundy-side-card">
        <div style={{ fontSize: 9, letterSpacing: '0.32em', color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, fontWeight: 700, marginBottom: 8 }}>
          색 필터 / Color
        </div>
        <ColorToggle value={colorFilter} onChange={onColor} />
      </div>
      <div className="burgundy-side-count">
        내가 마신 부르고뉴 <span style={{ color: GOLD, fontWeight: 700 }}>{WINES.length}병</span>
      </div>
    </motion.div>
  );
}

// ── Desktop panel ─────────────────────────────────────────────────────────────

function DesktopPanel({ drill, onDrill, colorFilter, hoveredId, onHover, visible }: {
  drill: DrillLevel; onDrill: (d: DrillLevel) => void; colorFilter: ColorFilter;
  hoveredId: string | null; onHover: (id: string | null) => void;
  visible: boolean;
}) {
  const groupLabel =
    drill.kind === 'overview' ? '꼬뜨를 선택하세요'
    : drill.kind === 'cote'    ? '마을을 선택하세요'
    : drill.kind === 'commune' ? '등급을 선택하세요'
    :                            '마신 와인';
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 24 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      className="burgundy-desktop-panel"
      style={{
        position: 'absolute', top: '8%', right: '3vw',
        width: 'clamp(300px,30vw,380px)', maxHeight: '84vh', zIndex: 20,
        borderRadius: 18,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <style jsx>{`
        .burgundy-desktop-panel {
          background: #FFFFFF;
          border: 1px solid var(--color-gold-tint-strong);
          box-shadow: 0 18px 48px rgba(42, 31, 18, 0.14);
        }
        .burgundy-desktop-panel :global(.burgundy-desktop-panel__header) {
          border-bottom: 1px solid var(--color-border);
        }
        :root[data-theme="dark"] .burgundy-desktop-panel {
          background: var(--color-bg-surface);
          border-color: var(--color-gold-tint-soft);
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.55);
        }
        :root[data-theme="dark"] .burgundy-desktop-panel :global(.burgundy-desktop-panel__header) {
          border-bottom-color: rgba(45, 21, 64, 0.9);
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .burgundy-desktop-panel {
            background: var(--color-bg-surface);
            border-color: var(--color-gold-tint-soft);
            box-shadow: 0 22px 60px rgba(0, 0, 0, 0.55);
          }
          :root:not([data-theme="light"]) .burgundy-desktop-panel :global(.burgundy-desktop-panel__header) {
            border-bottom-color: rgba(45, 21, 64, 0.9);
          }
        }
      `}</style>
      <div className="burgundy-desktop-panel__header" style={{ padding: '14px 18px 10px', flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>{groupLabel}</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 20px' }}>
        <PanelContent drill={drill} colorFilter={colorFilter}
          onDrill={onDrill} hoveredId={hoveredId} onHover={onHover} />
      </div>
    </motion.div>
  );
}

// ── Mobile sheet ──────────────────────────────────────────────────────────────

function MobileSheet({ drill, onDrill, colorFilter, onColor, hoveredId, onHover, visible }: {
  drill: DrillLevel; onDrill: (d: DrillLevel) => void;
  colorFilter: ColorFilter; onColor: (cf: ColorFilter) => void;
  hoveredId: string | null; onHover: (id: string | null) => void;
  visible: boolean;
}) {
  const [sheetH, setSheetH] = useState(0.58);
  const sheetHRef = useRef(0.58);
  const handleRef = useRef<HTMLDivElement>(null);

  const updateH = (h: number) => { sheetHRef.current = h; setSheetH(h); };

  useEffect(() => {
    const el = handleRef.current;
    if (!el) return;
    let y0 = 0, h0 = 0;
    const ph = () => el.parentElement?.offsetHeight ?? 844;
    const clamp = (v: number) => Math.min(0.88, Math.max(0.32, v));
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
      className="burgundy-mobile-sheet"
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: `${sheetH * 100}%`,
        backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.5)',
        zIndex: 30, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      <style jsx>{`
        /* 그라데이션은 surface(상단) → deepest(하단)로 elevation을 만든다.
           라이트/다크 양쪽 모드에서 동일한 패턴을 쓰기 위해 시스템 다크 오버라이드는 제거. */
        .burgundy-mobile-sheet {
          background: linear-gradient(180deg, var(--color-bg-surface) 0%, var(--color-bg-deepest) 100%);
        }
      `}</style>
      <div ref={handleRef} style={{ padding: '10px 0 6px', cursor: 'grab', display: 'flex', justifyContent: 'center', flexShrink: 0, touchAction: 'none' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--overlay-strong)' }} />
      </div>
      {/* Chip 형태 breadcrumb + 색 토글 (시트 최상단 sticky) */}
      <div style={{
        flexShrink: 0,
        padding: '4px 12px 10px',
        display: 'flex', flexDirection: 'column', gap: 8,
        borderBottom: '1px solid var(--color-border-soft)',
      }}>
        <MobileBreadcrumbChips drill={drill} onDrill={onDrill} />
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <ColorToggle value={colorFilter} onChange={onColor} mobile />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px calc(20px + env(safe-area-inset-bottom, 0px))' }}>
        <PanelContent drill={drill} colorFilter={colorFilter}
          onDrill={onDrill} hoveredId={hoveredId} onHover={onHover} />
      </div>
    </motion.div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function BurgundySection() {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [drill, setDrill] = useState<DrillLevel>({ kind: 'overview' });
  const [colorFilter, setColorFilter] = useState<ColorFilter>('all');
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
  const heading = t('burgundy.heading') || '꼬뜨에서 마을, 마을에서 등급으로 파고들기';

  return (
    <section id="burgundy" ref={sectionRef} style={{ height: '100vh', position: 'relative', overflow: 'hidden', background: 'var(--color-map-bg)' }}>
      {/* Map */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: isMobile ? '40%' : '100%' }}>
        <motion.div
          style={{ width: '100%', height: '100%' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.7 }}
        >
          <BurgundyMap drill={drill} colorFilter={colorFilter}
            hoveredId={hoveredId} onHover={setHoveredId} onDrill={setDrill} />
        </motion.div>
      </div>

      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 85% 80% at 50% 52%, transparent 50%, var(--overlay-strong) 100%)' }} />

      {/* Header */}
      <div style={{
        position: 'absolute',
        top: isMobile ? 10 : 'clamp(14px,2.5vh,28px)',
        left: '50%', transform: 'translateX(-50%)',
        textAlign: 'center', zIndex: 10, pointerEvents: 'none',
        whiteSpace: 'nowrap',
        width: isMobile ? '92vw' : 'auto',
      }}>
        <div style={{
          fontSize: isMobile ? 8 : 9,
          letterSpacing: '0.28em',
          color: 'var(--color-gold)',
          textTransform: 'uppercase',
          marginBottom: isMobile ? 3 : 6,
        }}>{sectionLabel}</div>
        <h2 style={{
          fontFamily: 'var(--font-playfair),Georgia,serif',
          fontSize: isMobile ? 18 : 'clamp(18px,3vw,32px)',
          fontWeight: 400,
          color: 'var(--color-text-primary)',
          lineHeight: 1.15,
        }}>{heading}</h2>
      </div>

      {/* Side rail (PC) */}
      {!isMobile && <DesktopSideRail drill={drill} onDrill={setDrill}
        colorFilter={colorFilter} onColor={setColorFilter} visible={visible} />}

      {/* Panels */}
      {isMobile && <MobileSheet drill={drill} onDrill={setDrill}
        colorFilter={colorFilter} onColor={setColorFilter}
        hoveredId={hoveredId} onHover={setHoveredId} visible={visible} />}
      {!isMobile && <DesktopPanel drill={drill} onDrill={setDrill} colorFilter={colorFilter}
        hoveredId={hoveredId} onHover={setHoveredId} visible={visible} />}
    </section>
  );
}
