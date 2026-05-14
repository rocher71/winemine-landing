# winemine — Design System

> 이 문서는 winemine 키스크린 앱의 디자인 시스템을 기술한다.  
> 다크 모드(기본)와 라이트 모드 양쪽을 포함하며, 실제 구현된 토큰·컴포넌트 패턴을 진실 소스로 삼는다.  
> 토큰 정의: `styles/tokens.css` / Tailwind 확장: `src/app/globals.css`

---

## 1. 브랜드 정체성

- **서비스명**: `winemine` (소문자, 붙여쓰기 고정 — 대문자·분리 금지)
- **핵심 감성**: 프리미엄 와인 라벨의 무게감. 어두운 밤, 와인 한 잔.
- **다크 모드**: 와인 정체성의 메인 모드. 딥 퍼플-블랙 배경 + Wine Red 강조.
- **라이트 모드**: 화이트 와인 컨셉. 크림-화이트 배경 + Gold 강조 (Wine Red 배제).

---

## 2. 색상 시스템 전체

토큰은 CSS 커스텀 프로퍼티로 관리되며, `html[data-theme='light']` 셀렉터에서 라이트 값으로 덮어쓴다.  
Tailwind `@theme` 블록에는 다크 기본값만 정적 등록하고, 런타임 테마 전환은 CSS 변수가 담당한다.  
소스: `styles/tokens.css`, `src/app/globals.css`, 각 컴포넌트 인라인 스타일.

---

### 2-1. 코어 브랜드 색상 (하드코딩, 테마 무관)

아래 값들은 CSS 변수로 추상화됐지만, 실제 코드 전반에서 직접 hex로도 쓰이는 핵심 색상이다.

| 색상 | Hex | 사용 빈도 | 주요 용도 |
|------|-----|----------|---------|
| **Gold** | `#C9A84C` | 63회 — 가장 많이 쓰임 | BottomNav 활성 탭, WSETSlider 활성 도트, drag handle, 진행바, 맵 Today 도트, 외부 평점 뱃지 |
| **Wine Red** | `#8B1A2A` | 33회 | CTA 버튼, 다크 FAB, 방문 국가 fill, Bell 알림 dot, 아바타 배경 |
| **Cream** | `#F5F0E8` | 20회 | 텍스트 primary(다크), 라벨 배경, 레벨 L1 chip 배경 |
| **Deepest Dark** | `#05020A` | 17회 | themeColor 메타, 레벨 chip 텍스트 대비, 버튼 내 텍스트 배경 |
| **Wine Red Deep** | `#5b1424` | 10회 | FAB 그라데이션 끝점, bottleColor (Château Margaux) |
| **Wine Red Hover** | `#A02030` | 9회 | hover, L5 마스터 level color |

---

### 2-2. CSS 변수 토큰 — 다크 / 라이트 대조표

#### Primary

| 토큰 | 다크 | 라이트 | 용도 |
|------|------|--------|------|
| `--color-wine-red` | `#8B1A2A` | `#B89438` | CTA, 강조. 라이트는 Gold로 통합 |
| `--color-wine-red-hover` | `#A02030` | `#9D7E2E` | hover 상태 |
| `--color-gold` | `#C9A84C` | `#B89438` | 장식선, 아이콘, 성공 상태, 라이트 메인 강조 |
| `--color-cream` | `#F5F0E8` | `#2A1A14` | 역할 분기 — 다크: 밝은 텍스트 / 라이트: 다크 브라운 텍스트 |

> `--color-cream`이 텍스트 primary로 사용되는 컴포넌트 전반에서 라이트는 다크 와인 브라운(`#2A1A14`)으로 재정의돼 가독성을 확보한다.

#### 배경 레이어

| 토큰 | 다크 | 라이트 | 용도 |
|------|------|--------|------|
| `--color-bg-deepest` | `#251837` | `#FAF5EC` | 최하단 페이지 배경 |
| `--color-bg-deep` | `#2E1F3F` | `#F2EAD9` | 교차 섹션, AppHeader 배경 |
| `--color-bg-map` | `#3A2440` | `#EDE2CC` | 지도 기본 배경, input bg |
| `--color-surface` | `#3D2A4A` | `#FFFFFF` | 카드, 모달, BottomSheet 배경 |
| `--color-bg-sunken` | `rgba(0,0,0,0.28)` | `rgba(42,26,20,0.06)` | 카드 내부 잠긴 서브섹션 |

#### 텍스트

| 토큰 | 다크 | 라이트 | 용도 |
|------|------|--------|------|
| `--color-text-primary` | `#F8F4ED` | `#2A1A14` | 주요 본문 |
| `--color-text-secondary` | `#EBE0CB` | `#5A463C` | 보조 텍스트 |
| `--color-text-muted` | `#CABDA8` | `#8B7766` | 설명, 메타 |
| `--color-text-disabled` | `#7E6E8E` | `#C0B0A0` | 비활성 |

#### 보더

| 토큰 | 다크 | 라이트 | 용도 |
|------|------|--------|------|
| `--color-border` / `--color-border-default` | `#5A3D6A` | `#E0D2BC` | 기본 구분선 |
| `--color-border-active` | `#A02030` | `#B89438` | 포커스·활성 보더 (라이트: Gold) |

#### Semantic

| 토큰 | 다크 | 라이트 | 용도 |
|------|------|--------|------|
| `--color-error` | `#EF4444` | `#C92020` | 에러, 경고 |
| `--color-success` (Tailwind only) | `#22C55E` | — | 성공 상태 |

#### 그라데이션 & 특수 효과 토큰

| 토큰 | 다크 | 라이트 |
|------|------|--------|
| `--gradient-page-bg` | `linear-gradient(135deg, #251837 0%, #2E1F3F 100%)` | `linear-gradient(135deg, #FAF5EC 0%, #F2EAD9 100%)` |
| `--gradient-bottom-nav` | `linear-gradient(to top, #251837 70%, rgba(37,24,55,0))` | `linear-gradient(to top, #FAF5EC 70%, rgba(250,245,236,0))` |
| `--gradient-fab` | `linear-gradient(135deg, #8B1A2A, #5b1424)` | `linear-gradient(135deg, #C9A84C, #A07F2E)` |
| `--shadow-fab` | `0 6px 20px rgba(139,26,42,0.45), inset 0 1px 0 rgba(255,255,255,0.12)` | `0 6px 20px rgba(184,148,56,0.32), inset 0 1px 0 rgba(255,255,255,0.18)` |

#### 지도

| 토큰 | 다크 | 라이트 |
|------|------|--------|
| `--color-map-country` | `#3A2440` | `#C8B8D8` — 더스티 라벤더 |
| `--color-map-ocean` | `transparent` | `transparent` |
| `--color-bottle-shelf` | `#1a0a1e` | `#FFFFFF` |

#### Glass 오버레이 (지도 위 칩·줌·통계 패널)

| 토큰 | 다크 | 라이트 |
|------|------|--------|
| `--color-glass-bg` | `rgba(10,5,15,0.72)` | `rgba(255,255,255,0.85)` |
| `--color-glass-bg-strong` | `rgba(15,7,24,0.92)` | `rgba(255,255,255,0.95)` |
| `--color-glass-border` | `rgba(255,255,255,0.15)` | `rgba(42,26,20,0.12)` |

---

### 2-3. 레벨 시스템 색상

소스: `src/lib/mock/levels.ts`, `src/components/shared/level-pill.tsx`, `src/components/nav/app-header.tsx`

| 레벨 | 이름 | XP 범위 | `level.color` | LevelPill bg | LevelPill text |
|------|------|---------|--------------|-------------|----------------|
| L1 Novice 입문자 | `#9B8B7A` | 0–99 | `#9B8B7A` | `#F5F0E8` Cream | `#05020A` |
| L2 Enthusiast 애호가 | `#C9A84C` | 100–499 | `#C9A84C` Gold | `#D4B85C` Gold Soft | `#05020A` |
| L3 Connoisseur 감식가 | `#C9A84C` | 500–1499 | `#C9A84C` Gold | `#C9A84C` Gold | `#05020A` |
| L4 Sommelier 소믈리에 | `#8B1A2A` | 1500–3999 | `#8B1A2A` Wine Red | `#8B1A2A` | `#F5F0E8` |
| L5 Master 마스터 | `#A02030` | 4000+ | `#A02030` | `linear-gradient(135deg, #C9A84C, #F5F0E8)` | `#05020A` |

**AppHeader LevelChip 색상** (레벨별 아바타 원형):

```
L1: #a87341   L2: #b8b8c0   L3: #C9A84C   L4: #C9A84C   L5: #8B1A2A
```

**커뮤니티 아바타 그라데이션** (`comm-user-avatar.tsx`):

```
L1: linear-gradient(135deg, #555560, #2a2a35)   — 무채색 다크
L2: linear-gradient(135deg, #4a6fa5, #1a2a45)   — 스틸 블루
L3: linear-gradient(135deg, #b8b8c0, #3a3a48)   — 실버
L4: linear-gradient(135deg, #C9A84C, #0F0718)   — Gold → 딥 다크
L5: linear-gradient(135deg, #8B1A2A, #3a0810)   — Wine Red → 딥 레드
```

---

### 2-4. 뱃지 & 외부 평점 색상

**ReviewBadge 티어** (`src/components/shared/review-badge.tsx`):

| 티어 | 색상 |
|------|------|
| Bronze | `#B87333` |
| Silver | `#C0C0C0` |
| Gold | `#C9A84C` |
| Platinum | `#E5E4E2` |

**ProfileHero / UserMapHero 레벨별 아바타 그라데이션** (Badges 페이지 포함):

```
L1–L3: linear-gradient(135deg, #C9A84C 0%, #F5F0E8 100%)   — Platinum 톤
L4:    #A77044   — Warm Bronze
L5:    linear-gradient(135deg, #C9A84C 0%, #F5F0E8 100%)   — 동일 Platinum
```

---

### 2-5. 커뮤니티 포스트 타입 색상

소스: `src/components/community/post-type-badge.tsx`

| 타입 | 색상 | 용도 |
|------|------|------|
| 시음 노트 (note) | `#C9A84C` Gold | 뱃지, 칩 |
| 질문 (question) | `#a08ee0` Soft Purple | 뱃지, Bookmark 반응 아이콘 |
| 칼럼 (column) | `#F5F0E8` Cream | 뱃지 |
| 소식 (news) | `#5b9ce6` Steel Blue | 뱃지 |
| 사진 앨범 (album) | `#e8b4d2` Rose Pink | 뱃지 |

> 각 타입 칩의 배경은 `color + '1a'` (10% opacity), 테두리는 `color + '55'` (33% opacity).

---

### 2-6. 와인 병 색상 팔레트 (bottleColor)

소스: `src/lib/mock/wines.ts` — 각 와인 오브젝트의 `bottleColor` 필드.  
카드·히어로·갤러리에서 `linear-gradient(160deg, bottleColor 0%, #1a0a1e 70~80%)` 형태로 사용.

**레드 와인 계열** (딥 레드-버건디):

| 색상 | Hex | 대표 와인 |
|------|-----|---------|
| 딥 버건디 | `#5b1424` | Château Margaux 2018 |
| 딥 클라렛 | `#3f0f1f` | Pétrus 2015 |
| 다크 퍼플레드 | `#4a1226` | Romanée-Conti 2017 |
| 미드 클라렛 | `#56132a` | Opus One 2019 |
| 미드 버건디 | `#5a1429` | Sassicaia 2018 |
| 미드 로제 레드 | `#7a1f33` | Barolo Cannubi 2016, Vega Sicilia |
| 다크 로제 | `#6d1c2e` | Ornellaia 2018 |
| 라이트 버건디 | `#8d2238` | Brunello di Montalcino 2016 |
| 퍼플 다크 | `#671c2f` | Châteauneuf-du-Pape |
| 딥 플럼 | `#80213b` | Penfolds Grange 2018 |
| 미드 플럼 | `#6e1c33` | Caymus Special Selection 2020 |
| 딥 와인 | `#4a1027` | Screaming Eagle 2019 |
| 딥 루비 | `#791f2e` | Cos d'Estournel 2018 |
| 딥 레드 | `#7c1a2a` | Gevrey-Chambertin |
| 다크 레드 | `#3a1418` | Hermitage La Chapelle 2017 |
| 딥 레드 다크 | `#7d1c2b` | Ridge Monte Bello 2019 |

**화이트/로제 와인 계열** (골드-앰버):

| 색상 | Hex | 대표 와인 |
|------|-----|---------|
| 페일 골드 | `#d9c277` | Montrachet 2019 |
| 브라이트 골드 | `#e5c97a` | Puligny-Montrachet |
| 미드 골드 | `#c9b97a` | Château d'Yquem 2015 |
| 딥 골드 | `#caa84e` | Krug Grande Cuvée |
| 브론즈 골드 | `#b9923f` | Dom Pérignon 2012 |
| 라이트 골드 | `#d6c069` | Meursault Perrières |
| 앰버 골드 | `#b8983f` | Riesling Trockenbeerenauslese |
| 로제 핑크 | `#e8a5a0` | Whispering Angel Rosé |
| 미드 앰버 | `#d8b53f` | Viña Tondonia Reserva Blanco |
| 라이트 앰버 | `#e2c476` | Grüner Veltliner Smaragd |
| 페일 앰버 | `#cdba6e` | Albariño Rías Baixas |
| 골드 그린 | `#c9b86a` | Condrieu |
| 딥 앰버 | `#e1c876` | Gewürztraminer Alsace |

**기준 블렌드 포인트** (그라데이션 끝):

| 용도 | 색상 | 적용처 |
|------|------|--------|
| 병 히어로 하단 (대부분) | `#1a0a1e` | 카드·노트·갤러리 병 그라데이션 |
| 캡처 씬 하단 | `#1a0a0e` | `/capture` 라벨 스캔 배경 |
| 더 어두운 끝 | `#0e0608` | 캡처 라벨 아트 cap 아래 |

---

### 2-7. 컴포넌트별 하드코딩 색상 레퍼런스

#### 다크 딥 배경 계열 (SVG·그라데이션 안에서 자주 쓰임)

| Hex | 용도 |
|-----|------|
| `#1A0A1E` | `--color-bottle-shelf` alias, 맵 배경, 커뮤니티 Tonight 맵 도트 글로우 중심 |
| `#0F0718` | DeviceFrame inner 배경 (Tailwind theme 등록), L4 아바타 그라데이션 끝 |
| `#1B1126` | 온보딩 씬 일부 딥 배경 |
| `#2D1540` | Recap 모달 그라데이션 시작점, Tonight 맵 국경선 |

#### 커뮤니티 Tonight 지도 SVG

```
배경 그라데이션: #2a141c → #0a050f
국경선: #2D1540
지역 도트: #C9A84C (Gold, opacity 0.18 글로우 + 100% 핵심)
지역명 텍스트: #9B8B7A
도트 중심 텍스트: #05020A / #F5F0E8
```

#### Recap 모달 (`recap-modal.tsx`)

```
배경: linear-gradient(160deg, #2D1540 0%, #5b1424 40%, #8B1A2A 75%, #1A0A1E 100%)
해치 패턴: rgba(245,240,232,0.6) @ 45deg
오버레이: linear-gradient(180deg, rgba(15,7,24,0.6), rgba(45,21,64,0.2))
```

#### 셀러 상세 드링킹 윈도우 바 (`cellar/[id]/page.tsx`)

```
linear-gradient(90deg,
  rgba(155,139,122,0.3) 0%,
  var(--color-gold) 45%,
  var(--color-wine-red) 50%,
  var(--color-gold) 55%,
  rgba(155,139,122,0.3) 100%
)
```

#### 전문가 노트 Blind Mode 배경

```
linear-gradient(180deg, #5A1A24 0%, #2D0D12 100%)
```

---

### 2-8. Shadow 레퍼런스 (자주 쓰이는 값)

| 용도 | 값 |
|------|---|
| Modal | `0 25px 80px rgba(0,0,0,0.8)` |
| BottomSheet | `0 -10px 30px rgba(0,0,0,0.5)` |
| 카드 호버 / 포커스 | `0 8px 22px rgba(0,0,0,0.5~0.6)` |
| Gold 글로우 (활성 슬라이더) | `0 0 12px rgba(201,168,76,0.5)` |
| Gold 글로우 (진행바) | `0 0 12px rgba(201,168,76,0.5)` |
| Gold 글로우 (약한) | `0 0 24px rgba(201,168,76,0.10)` |
| Wine Red 글로우 (카드) | `0 4px 12px rgba(139,26,42,0.35)` |
| Wine Red 링 (포커스) | `0 0 0 1px rgba(139,26,42,0.4)` |
| 데스크톱 사이드 패널 | `0 24px 64px rgba(0,0,0,0.5)` |
| 사이드 패널 + inset | `0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)` |
| FAB (다크) | `0 6px 20px rgba(139,26,42,0.45), inset 0 1px 0 rgba(255,255,255,0.12)` |
| FAB (라이트) | `0 6px 20px rgba(184,148,56,0.32), inset 0 1px 0 rgba(255,255,255,0.18)` |

---

### 2-9. Gold rgba 알파 팔레트

Gold(`#C9A84C` = `rgb(201,168,76)`)는 알파 변형으로 다양하게 쓰인다.

| 알파 | 값 | 주요 용도 |
|------|-----|---------|
| 0.05 | `rgba(201,168,76,0.05)` | 매우 약한 Gold 틴트 배경 |
| 0.06 | `rgba(201,168,76,0.06)` | 라이트모드 sunken bg |
| 0.08 | `rgba(201,168,76,0.08)` | 카드 테두리 미세 틴트 |
| 0.10 | `rgba(201,168,76,0.10)` | AutoDescription 배경 시작점 |
| 0.12 | `rgba(201,168,76,0.12)` | 구분선·보더 |
| 0.13 | `rgba(201,168,76,0.13)` | 칩 hover 배경 |
| 0.15 | `rgba(201,168,76,0.15)` | Story 이미지 라디얼 틴트 |
| 0.18 | `rgba(201,168,76,0.18)` | WSETSlider 활성 도트 글로우 링, Tonight 도트 글로우 |
| 0.30 | `rgba(201,168,76,0.30)` | 중간 강도 골드 배경 |
| 0.33 | `rgba(201,168,76,0.33)` | 칩 강조 배경 |
| 0.35 | `rgba(201,168,76,0.35)` | 활성 필터 칩 배경 |
| 0.40 | `rgba(201,168,76,0.40)` | 진한 Gold 오버레이 |

**Wine Red rgba 알파 팔레트** (`rgb(139,26,42)`):

| 알파 | 주요 용도 |
|------|---------|
| 0.08 | 미세 배경 틴트 |
| 0.18 | FirstTimeGreeting 배경, 온보딩 radial |
| 0.25 | 중간 강도 |
| 0.33–0.35 | 커뮤니티 Today's Pick 배경 |
| 0.40–0.45 | DraftNoteResume 배경, push banner 그라데이션 |
| 0.7–0.8 | MapLegend 끝 stop |
| 1.0 | `rgba(139,26,42,1)` = solid |

---

## 3. 타이포그래피

### 폰트 패밀리

| 변수 | 폰트 | 로드 방식 | 용도 |
|------|------|----------|------|
| `var(--font-playfair)` | Playfair Display (Serif) | next/font Google | 로고, 제목, 모달 타이틀, 카드 제목, 빈 상태 |
| `var(--font-inter)` | Inter (Sans-Serif) | next/font Google | 본문, 버튼, 라벨, 메타 |
| Spoqa Han Sans Neo | Sans-Serif | jsDelivr CDN | 한글 본문 fallback (Inter가 Latin 커버 후 한글에만 동작) |

### 텍스트 스케일 (CSS 유틸 클래스)

| 클래스 | Font | Size | Weight | Color 토큰 | 용도 |
|--------|------|------|--------|-----------|------|
| `.wm-page-title` | Playfair | 24px | 400 | `--color-cream` | 페이지 대제목 |
| `.wm-card-title` | Playfair | 16px | 400 | `--color-cream` | 카드 제목 (1줄 truncate) |
| `.wm-back-title` | Inter | 16px | 600 | `--color-cream` | BackHeader 페이지명 |
| `.wm-modal-title` | Playfair | 22px | 400 | `--color-cream` | 모달 타이틀 |
| `.wm-modal-desc` | Inter | 14px | 400 | `--color-text-secondary` | 모달 설명 |
| `.wm-empty-title` | Playfair | 22px | 400 | `--color-cream` | 빈 상태 타이틀 |
| `.wm-empty-desc` | Inter | 14px | 400 | `--color-text-muted` | 빈 상태 설명 (max 280px) |
| `.wm-section-title` | Inter | 14px | 500 | `--color-text-muted` | 섹션 레이블 (uppercase, 0.04em) |
| `.wm-section-link` | Inter | 12px | 500 | `--color-gold` | 섹션 "더보기" 링크 |
| `.wm-card-meta` | Inter | 12px | 400 | `--color-text-muted` | 카드 메타 정보 |
| `.wm-card-body` | Inter | 13px | 400 | `--color-text-secondary` | 카드 본문 |
| `.wm-level-name` | Inter | 13px | 600 | `--color-cream` | 레벨 이름 |
| `.wm-glossary-term` | Playfair | 16px | 400 | `--color-cream` | 용어 사전 단어 |
| `.wm-glossary-def` | Inter | 13px | 400 | `--color-text-secondary` | 용어 사전 정의 |

### 로고 워드마크

```
fontFamily: Playfair Display
fontSize: 18px
letterSpacing: -0.01em
fontWeight: 500
color: var(--color-cream)
separator "·": color #C9A84C (Gold, 고정)
```

---

## 4. 스페이싱 & 레이아웃

### 기기 프레임 (DeviceFrame)

| 항목 | 값 |
|------|---|
| 외경 (데스크톱) | 414 × 868px |
| 내경 (콘텐츠 영역) | 390 × 844px |
| 외경 border-radius | 50px |
| 내경 border-radius | 38px |
| StatusBar 높이 | 54px |
| `.wm-route-outlet` inset | top 54px (StatusBar 아래) |

### 공통 패딩

| 패턴 | 값 |
|------|---|
| `.wm-content-pad` | `16px 20px` |
| BottomNav 패딩 | `8px 12px 28px` (Safe Area 포함) |
| BottomNav spacer | `height: 84px` (모바일 fixed 보정) |
| `.wm-scroll-area` padding-bottom | `96px` (BottomNav 83px + 여유 13px) |
| AppHeader 패딩 | `12px 20px 14px` |
| BackHeader 높이 | `56px`, padding `0 16px` |

### 반응형 분기

| 브레이크포인트 | 동작 |
|--------------|------|
| `< 768px` | DeviceFrame 투명, 콘텐츠 풀스크린, StatusBar·Island·Indicator 숨김, BottomNav position:fixed |
| `≥ 768px` | DeviceFrame 목업 프레임, StatusBar·Island·Indicator 노출, BottomNav position:absolute |
| `≥ 1024px` | DemoControls (좌측 패널, width 320px) 노출 |
| `≥ 1280px` | FeatureFlagPanel (우측 패널, width 320px) 노출 |

### z-index 레이어

| 값 | 요소 |
|----|------|
| 20 | StatusBar |
| 25 | BottomNav |
| 30 | 사이드 패널 (DemoControls, FeatureFlagPanel) |
| 40 | BottomSheet backdrop |
| 41 | BottomSheet sheet |
| 50 | Modal |

---

## 5. 컴포넌트 패턴

### 5-1. PrimaryButton

4가지 variant, 3가지 size. 모두 `border-radius: 12px`, `font-weight: 600`.

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| `primary` | `--color-wine-red` | `--color-cream` | 1px `--color-wine-red` |
| `secondary` | transparent | `--color-cream` | 1px `--color-border-default` |
| `ghost` | transparent | `--color-text-secondary` | transparent |
| `danger` | transparent | `--color-error` | 1px `--color-error` |
| disabled | `--color-text-disabled` | `--color-text-muted` | transparent |

| Size | Height | Padding | Font |
|------|--------|---------|------|
| `sm` | 32px | `6px 12px` | 13px |
| `md` | 40px | `10px 16px` | 14px |
| `lg` | 48px | `14px 20px` | 15px |

### 5-2. BottomNav

- 높이: `padding 8px 12px 28px`
- 배경: `var(--gradient-bottom-nav)` (fade)
- 구분선: `0.5px solid var(--color-border-default)`
- 탭 아이콘: 22px monoline SVG, `strokeWidth: 1.6`
- 탭 레이블: 10px Inter, 활성 600 / 비활성 400
- 활성 색: **`#C9A84C` (Gold 고정)** — 테마에 관계없이 Gold
- 비활성 색: `var(--color-text-muted)`

**중앙 FAB (카메라)**:
- 52 × 52px, `border-radius: 999`
- 다크: `var(--gradient-fab)` (Wine Red), 라이트: `var(--gradient-fab)` (Gold)
- 테두리: `1px solid var(--color-gold)`
- 그림자: `var(--shadow-fab)`
- `marginTop: -24px` (상단 돌출)

### 5-3. AppHeader

- 패딩: `12px 20px 14px`
- 배경: `var(--color-bg-deep)`
- 구분선: `0.5px solid var(--color-border-default)`
- 좌측: WMLogoMark (26px 와인잔 SVG) + 워드마크 18px
- 우측: Bell 버튼 36px + LevelChip(heavy) 또는 아바타 원형 36px

**LevelChip**: height 32px, `background: --color-surface`, `border: 1px solid --color-border-default`, `border-radius: 999`.

**Bell 알림 뱃지**: Wine Red 원형 (`#8B1A2A` fill), 벨 SVG 우상단 `cx=18 cy=6 r=2.5`.

### 5-4. BackHeader

- 높이: 56px, padding `0 16px`
- 좌측: ChevronLeft 24px + 페이지 타이틀 (`.wm-back-title`)
- 우측: 컨텍스트 액션 슬롯 (Share2, MoreHorizontal 등)

### 5-5. BottomSheet

- `background: var(--color-surface)`
- `borderTopLeftRadius: 24px`, `borderTopRightRadius: 24px`
- `padding: 12px 16px 24px`
- Drag handle: 36×4px, `background: var(--color-gold)`, `border-radius: 2px`
- `boxShadow: 0 -10px 30px rgba(0,0,0,0.5)`
- Backdrop: `rgba(0,0,0,0.6)`

### 5-6. Modal

- `background: var(--color-surface)`
- `border-radius: 16px`, `padding: 24px`
- `border: 1px solid var(--color-border-default)`
- `boxShadow: 0 25px 80px rgba(0,0,0,0.8)`
- `maxWidth: 320px`
- Backdrop: `rgba(0,0,0,0.7)`
- 닫기 버튼: X 20px, `color: --color-text-muted`

### 5-7. EmptyState

- illustration: `color: --color-gold`, `opacity: 0.7`
- 타이틀: `.wm-empty-title` (Playfair 22px)
- 설명: `.wm-empty-desc` (Inter 14px, max-width 280px)

### 5-8. LevelPill (인라인 레벨 뱃지)

| Level | Background | Text |
|-------|-----------|------|
| L1 Cream | `#F5F0E8` | `#05020A` |
| L2 Silver | `#D4B85C` | `#05020A` |
| L3 Gold | `#C9A84C` | `#05020A` |
| L4 Wine Red | `#8B1A2A` | `#F5F0E8` |
| L5 Platinum | `linear-gradient(135deg, #C9A84C, #F5F0E8)` | `#05020A` |

- size `sm`: `2px 8px`, 10px / size `md`: `4px 10px`, 11px
- `border-radius: 12px`, `font-weight: 600`

### 5-9. LevelProgressBar

- 게이지 높이: 6px, `background: --color-border-default`, `border-radius: 3px`
- 채움: `linear-gradient(90deg, --color-gold, --color-cream)`, `boxShadow: 0 0 12px rgba(201,168,76,0.5)`
- 레벨 원형 뱃지: 24×24px, `border-radius: 12px`, 해당 레벨 color

### 5-10. ToggleRow (설정 항목)

- `background: var(--color-surface)`, `border: 1px solid --color-border-default`
- `border-radius: 12px`, `padding: 14px 16px`
- 레이블: Inter 14px, `color: --color-cream`
- 설명: Inter 11px, `color: --color-text-muted`
- 토글: 44×26px, 활성 `--color-gold` / 비활성 `--color-border-default`
- Thumb: 20×20px, `background: --color-cream`

### 5-11. WSETSlider (테이스팅 노트)

- 5단계: `low / mediumMinus / medium / mediumPlus / high`
- 활성 도트: Gold 채움 + `box-shadow: 0 0 0 4px rgba(201,168,76,0.18), 0 0 12px rgba(201,168,76,0.45)`
- 현재 도트: 18px, 나머지: 12px
- 연결선: 2px, 활성 Gold / 비활성 `--color-border`
- 현재 값 라벨: 12px Gold 오른쪽 정렬

### 5-12. 카드 패턴

| 속성 | 값 |
|------|---|
| background | `var(--color-surface)` |
| border | `1px solid var(--color-border-default)` |
| border-radius | 12~16px (컨텍스트별) |
| 내부 잠긴 영역 | `background: var(--color-bg-sunken)` |
| 카드 제목 | `.wm-card-title` (Playfair 16px, 1줄 truncate) |
| 카드 메타 | `.wm-card-meta` (Inter 12px muted) |

---

## 6. 아이콘 시스템

**lucide-react**를 단일 아이콘 소스로 사용. **Emoji 사용 절대 금지.**

| 의미 | 아이콘 |
|------|--------|
| 별점 | `Star` (fill로 채움 상태 표현) |
| 와인 | `Wine` / `WineOff` |
| 카메라 | `Camera` |
| 체크 | `Check` |
| 경고 | `AlertTriangle` |
| 뒤로 | `ChevronLeft` |
| 닫기 | `X` |
| 베리 아로마 | `Cherry` |
| 시트러스 | `Citrus` |
| 핵과류 | `Apple` |
| 꽃 | `Flower2` |
| 향신료 | `Flame` |
| 꿀/캐러멜 | `Candy` |
| 흙/허브 | `Sprout` |
| 빵/이스트 | `Wheat` |
| 인상 - 좋음 | `Sparkles` |
| 인상 - 보통 | `Smile` |
| 인상 - 모름 | `HelpCircle` |

**BottomNav 아이콘**: Lucide 대신 인라인 monoline SVG 사용 (같은 스타일 유지).  
`strokeWidth: 1.6`, `strokeLinecap: round`, `strokeLinejoin: round`

**기본 strokeWidth**: 1.75 (BackHeader ChevronLeft, Modal X)

---

## 7. 모션 & 애니메이션

**Framer Motion** 기반. `prefers-reduced-motion: reduce` 환경에서는 CSS transition을 `0.001ms`로 일괄 제거.

| 요소 | 진입 | 퇴장 | duration | easing |
|------|------|------|----------|--------|
| Modal | `scale 0.95→1, opacity 0→1` | 역방향 | 250ms | easeOut |
| Modal backdrop | `opacity 0→1` | 역방향 | 200ms | easeOut |
| BottomSheet | `translateY 100%→0` | 역방향 | 350ms | easeOut |
| BottomSheet backdrop | `opacity 0→1` | 역방향 | 200ms | easeOut |

**CSS transition 기본값**:
- Button: `background 200ms ease-out, transform 100ms ease-out`
- Toggle: `background 200ms`, thumb `left 200ms`
- WSETSlider dot: `all 160ms ease`
- LevelProgressBar: `width 400ms ease-out`

---

## 8. 포커스 & 접근성

```css
:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
  border-radius: 4px;
}
```

- 터치 디바이스(`hover: none`)에서 button hover 효과 억제
- `aria-current="page"` — BottomNav 활성 탭
- `aria-label` — 모든 아이콘 전용 버튼
- `role="dialog" aria-modal="true"` — Modal, BottomSheet
- `role="switch" aria-checked` — ToggleRow
- `role="slider"` — WSETSlider

---

## 9. 테마 전환 메커니즘

| 단계 | 방법 |
|------|------|
| 저장소 | `localStorage.getItem('winemine.theme')` → `'light'` 또는 `'dark'` |
| FOUC 방지 | `<head>` inline script — DOMContentLoaded 이전에 `html[data-theme]` 적용 |
| 런타임 전환 | `html[data-theme='light']` → CSS 변수 오버라이드 (`styles/tokens.css`) |
| 기본값 | dark |

```js
// FOUC 방지 bootstrap (layout.tsx에서 inline script로 주입)
(function(){
  try {
    var t = localStorage.getItem('winemine.theme');
    document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
```

---

## 10. 스크롤 & 오버플로

```css
::-webkit-scrollbar { display: none; }
* { scrollbar-width: none; }
```

모든 스크롤바 숨김. 가로 스크롤 캐러셀 포함.

`.wm-scroll-area`: `overflow-y: auto; -webkit-overflow-scrolling: touch; padding-bottom: 96px`

---

## 11. 데스크톱 사이드 패널

| 패널 | 클래스 | 브레이크포인트 | 위치 | 색상 |
|------|--------|--------------|------|------|
| DemoControls | `.wm-side-panel-left` | `≥ 1024px` | fixed, 좌측 | `rgba(15,7,24,0.95)`, border `--color-border-default` |
| FeatureFlagPanel | `.wm-side-panel-right` | `≥ 1280px` | fixed, 우측 | 동일 |

공통: `width 320px`, `border-radius 16px`, `padding 16px`, `boxShadow 0 24px 64px rgba(0,0,0,0.5)`.

Feature-status dropped: `opacity: 0.25; filter: grayscale(1); pointer-events: none`

---

## 12. 라우트별 네비게이션 가시성

| 라우트 prefix | BottomNav |
|--------------|-----------|
| `/` | 표시 (home 활성) |
| `/map` | 표시 (map 활성) |
| `/cellar` | 표시 (cellar 활성) |
| `/community` | 표시 (community 활성) |
| `/onboarding` | **숨김** |
| `/capture` | **숨김** |
| `/notes/new` | **숨김** |
| 그 외 | 표시 (탭 비활성) |

---

## 13. 금지 사항 체크리스트

- [ ] UI 요소에 Emoji 사용 (`🍷 🍓 ✦` 등) — variation selector U+FE0F 포함
- [ ] `winemine` 대문자 사용 또는 분리 표기
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 등 시크릿을 `NEXT_PUBLIC_` 접두사로 노출
- [ ] 테마 미적용 하드코딩 색상 (CSS 변수 대신 hex 직접 사용)
- [ ] Emoji 를 mock 데이터나 JSON 값에 포함

---

*최종 업데이트: 2026-05-14*
