# 부르고뉴 섹션 — 구현 사양 (Claude Code 인수인계)

> **목적.** 사용자가 두 컴퓨터에서 winemine 랜딩 페이지를 번갈아 작업한다. 다른 머신의 Claude Code가 부르고뉴 드릴다운 섹션의 현재 상태·데이터 모델·UI 구조·디자인 결정·변경 이력을 한 번에 파악할 수 있도록 정리한 문서.
>
> **핵심 파일.** `src/components/sections/burgundy-section.tsx` (단일 파일, ~1080줄). 부르고뉴 섹션의 거의 모든 로직·데이터·컴포넌트가 여기 들어 있다.
>
> **상위 컨텍스트.** `CLAUDE.md` (전체 프로젝트), `_workspace/burgundy-classification-research.md` (와인 덕후 분류 체계 리서치 보고서, 이 섹션 설계의 근거), `_workspace/france-wine-research.md` (프랑스 전 산지 사내 조사).

---

## 1. TL;DR

- **컨셉.** "AI가 자동 분류한 내가 마신 부르고뉴 와인 컬렉션." 사용자가 부르고뉴 섹션에 들어오면 5개 꼬뜨 카드가 보이고, 꼬뜨를 누르면 그 안의 마을, 마을을 누르면 그 마을의 등급별 와인이 단계적으로 펼쳐지는 **풀 위계 드릴다운**.
- **분류는 보고서 §4에 없던 새 안 D (위계 드릴다운)을 채택.** 이전 4탭 평면 구조(Cru/Climat/Domaine/Vintage, 보고서 안 B)가 와인 덕후 친구로부터 "지역으로 들어가서 그 안의 등급을 본다"는 사고 흐름과 어긋난다는 피드백을 받음 → 부르고뉴 본질인 "프랑스 > 부르고뉴 > 꼬뜨 > 마을 > 등급 > 클리마/와인"을 위계 네비게이션으로 직접 표현.
- **색 토글.** 각 단계 상단에 ALL / 🍷 Red / 🥂 White / 🌸 Rosé 토글. 친구가 강조한 "마을마다 레드/화이트가 다르다"는 부르고뉴 특성을 살림.
- **막사네 로제 1병 추가.** 친구가 "부르고뉴 유일 마을명 로제 AOC"라고 강조한 Marsannay Rosé (Domaine Bart)를 데이터에 포함. 색 토글로 'Rosé' 누르면 막사네 로제만 강조.
- **UI 구조.**
  - PC: 좌측 breadcrumb+컬러 토글 사이드 레일 + 가운데 줌 가능한 부르고뉴 지도 + 우측 카드 패널
  - 모바일: 위 절반 지도 + 드래그 가능한 바텀시트 + 화면 최하단 breadcrumb+컬러 토글 바
- **인터랙션.** drill 상태 변경 시 `ZoomableGroup` 카메라가 RAF 700ms easeOutCubic으로 부드럽게 이동. 마커는 `motion.g` + `AnimatePresence` 그룹 단위 fade.

---

## 2. 핵심 결정 사항 (왜 이 모양이 됐는지)

| 결정 | 근거 |
|---|---|
| **풀 위계 드릴다운 (꼬뜨→마을→등급→와인)** | 친구 피드백: "지역으로 들어가면 그 안에서 그랑크뤼... 클릭하면 해당 와인들이 보여야 한다." 이전 4탭 평면 구조가 와인 덕후의 사고 흐름과 어긋남 |
| **색 토글 (ALL/Red/White/Rosé)** | 부르고뉴는 마을 단위로 레드/화이트가 자동 결정되는 경향(Meursault=화이트, Pommard=레드)이 있고, 같은 마을이 두 색 모두 가지는 경우(Chassagne-Montrachet)도 있음. 토글로 색 축 추가 |
| **막사네 로제 1병만 추가 (가성비 라인업 보강은 별도 작업)** | 친구가 가장 강하게 강조한 포인트만 우선 반영. 그 외 가성비 와인(Saint-Aubin·Mercurey·Pouilly-Fuissé 등) 보강은 다음 작업 |
| **breadcrumb 위치** | PC=좌측 사이드 레일, 모바일=화면 최하단 고정 바. 항상 시야 안 + 한 단계씩 되감기 가능 |
| **마커 모양 통일 + 마을 클릭 라벨** | 모든 와인 마커는 동일한 동그라미. cote 레벨에서만 추가로 마을명 골드 라벨이 노출되며 클릭 시 마을 진입 |
| **부르고뉴 섹션에서 FloatingCTA 숨김** | 모바일 하단 breadcrumb 바와 '앱 다운받기' 플로팅 CTA가 겹쳐서. IntersectionObserver(threshold 0.25)로 부르고뉴 섹션 보이면 자동 숨김 |
| **한글 표기는 한국 와인 업계 표준** | 영어식 발음 금지 → "주브레-샹베르탱". 데이터 안 nameKo·villageKo·notableNote 모두 한글 우선 |

---

## 3. 코드 위치

```
src/
├── app/
│   └── page.tsx                        # 부르고뉴 섹션 import & 마운트
├── components/
│   ├── sections/
│   │   └── burgundy-section.tsx       # ★ 이 섹션의 거의 모든 것
│   └── ui/
│       └── floating-cta.tsx           # 부르고뉴 섹션에서 자동 숨김 처리
├── messages/
│   ├── ko.json                         # burgundy.sectionLabel / burgundy.heading
│   └── en.json                         # 위 키 동기화
public/
└── france-departments.json             # 프랑스 데파르트망 GeoJSON
```

페이지 트리 (`src/app/page.tsx`): HeroSection → WineDiscoverySection → **BurgundySection** (id="burgundy") → 이후 섹션들. FloatingCTA는 `#burgundy` 영역에서 자동 숨김.

---

## 4. 데이터 모델 (`burgundy-section.tsx` 상단)

### 4.1 타입 (line 12~80)
```ts
type Cru = 'Grand Cru' | '1er Cru' | 'Village' | 'Régional';
type ProducerType = 'Domaine' | 'Maison' | 'Négociant-Éleveur';
type WineType = 'red' | 'white' | 'rosé';   // 신규 — 색 토글 축
type Cote = 'Côte de Nuits' | 'Côte de Beaune' | 'Chablis' | 'Côte Chalonnaise' | 'Mâconnais';
type ColorFilter = 'all' | WineType;

// 위계 드릴다운 상태 — 4단계
type DrillLevel =
  | { kind: 'overview' }                                  // Level 0: 부르고뉴 전체
  | { kind: 'cote'; coteId: Cote }                        // Level 1: 꼬뜨 선택
  | { kind: 'commune'; coteId: Cote; communeId: string }  // Level 2: 마을 선택
  | { kind: 'cru'; coteId: Cote; communeId: string; cru: Cru }; // Level 3: 등급까지

type ProducerData      // 도멘 메타 (그대로)
type VineyardData      // 클리마 메타 (현재 직접 사용 X — 데이터만 보존)
type Wine              // wineType: WineType 필드 추가
type CoteData          // 신규 — 꼬뜨 메타
type CommuneData       // 신규 — 마을 메타. id는 Wine.village와 매칭
```

### 4.2 정적 데이터
| 상수 | 개수 | 용도 |
|---|---|---|
| `COTES` | **5** (꼬뜨 드 뉘 / 본 / 샤블리 / 샬로네즈 / 마코네) | Level 0 카드, 카메라 zoom·center |
| `COMMUNES` | **12** (Marsannay·Gevrey·Morey·Chambolle·Vougeot·Vosne-Romanée·NSG·Volnay·Meursault·Puligny·Bourgogne광역·Chablis) | Level 1 카드, 마을 캐릭터, GC 보유 표시, 막사네 notableNote |
| `PRODUCERS` | **13** (Domaine 11 + Maison 1 + Négociant-Éleveur 1 — Domaine Bart 신규) | 와인 카드의 도멘 정보 (직접 표시 X) |
| `VINEYARDS` | **18** | 데이터 보존 (현재 흐름에서 직접 사용 X) |
| `WINES` | **20병** (GC 9 + 1er Cru 6 + Village 1 + 막사네 로제 1 + Régional 1 — 신규 막사네 로제) | 모든 레벨에서 카드·마커 데이터 |
| `WINE_TYPE_META` | 3 (red/white/rosé) | 색 토글 라벨·이모지 |
| `SUBREGION_TO_COTE` | 5 매핑 | wine.subregionId → Cote 변환 |
| `CRU_META` | 4 | 등급별 색·칩 텍스트(GC/1er/V/R)·배경·외곽선 |
| `AMBIENT_LABELS` | 8 | 지도 배경 마을·꼬뜨 압인 (overview·cote 레벨에서만 노출) |

### 4.3 그룹핑 헬퍼 (자동 생성)
```ts
winesByCommune: Record<string, Wine[]>     // wine.village 기반
winesByCote:    Record<Cote, Wine[]>       // SUBREGION_TO_COTE 매핑 기반
```

### 4.4 드릴다운 헬퍼 함수 (line 232~)
```ts
applyColor<T extends { wineType }>(items, cf): T[]   // colorFilter 적용
communesAtCote(cote): CommuneData[]                  // 그 꼬뜨 안의 마을들
getCameraFor(drill): { zoom, center }                // drill 레벨별 카메라
```

### 4.5 한글 표기 규칙
모든 마을·도멘·클리마 데이터에 `nameKo` / `villageKo` 필드 포함. 카드/마커 텍스트는 한글 우선, 영문은 작게 이탤릭 병기. 한국 와인 업계 표준 표기는 `_workspace/burgundy-classification-research.md` §7 용어집 참조. 영어식 발음(예: "게브레이") 금지.

---

## 5. UI 컴포넌트 트리

`burgundy-section.tsx` 안에서 정의되는 컴포넌트들 (모두 같은 파일):

```
BurgundySection (default export, Main — drill·colorFilter state 보유)
├── BurgundyMap                 # 지도 + ZoomableGroup + drill·color 기반 마커
│   ├── Geographies (france-departments.json)
│   ├── AMBIENT_LABELS          # overview·cote에서만
│   └── AnimatePresence
│       ├── 와인 마커            # drill에 따라 가시성 + colorFilter 필터
│       └── 마을 클릭 라벨       # cote 레벨에서만 (클릭 시 onDrill('commune'))
├── DesktopSideRail (PC ≥768px)
│   ├── Breadcrumb              # 부르고뉴 › 꼬뜨 › 마을 › 등급
│   └── ColorToggle             # ALL / Red / White / Rosé
├── DesktopPanel (PC)
│   └── PanelContent
│       ├── overview → CoteCard × 5
│       ├── cote     → CommuneCard × N
│       ├── commune  → 등급 그룹 버튼 + notableNote (막사네 등)
│       └── cru      → WineRow 리스트
├── MobileSheet (mobile, drag 가능)
│   └── PanelContent (위와 동일)
└── MobileBottomBar (mobile, 화면 최하단 고정)
    ├── Breadcrumb
    └── ColorToggle
```

### 5.1 와인 미니 카드 (cru 레벨에서 사용)
`WineRow` (line ~359) — `BottleSilhouette` SVG + 이름·CruChip·villageKo·vintage·note·rating·date.

### 5.2 보존된 컴포넌트
- `MapPin`, `CountBadge` (BurgundyMap 안의 마커)
- `WineGlassIcon`, `WineGlassRating` (별점)
- `BottleSilhouette` (와인병 SVG)
- `WineRow` (Level 3 와인 리스트)
- `CruChip` (등급 칩 — WineRow 안에서, 등급 그룹 버튼에서 사용)

### 5.3 폐기된 컴포넌트 (이전 4탭 잔재 — 더 이상 코드에 없음)
- `CruGroupCard`, `VintageGroupCard`, `ProducerCard`, `VineyardCard`
- `CollectedBadge`, `MonopoleBadge`, `GrandCruLevelBadge`, `ProducerTypeBadge`
- `DesktopFilterTabs`, `MobileFilterTabs`
- `CAMERA` 상수, `FilterKey` 타입, `FILTER_LABELS`, `TAB_ORDER`
- `VINTAGE_RATINGS`, `vintageScore`, `vintageColor`, `VINTAGE_KEYS`
- `winesByCru`, `winesByProducer`, `winesByVineyard`, `winesByVintage`
- `PRODUCER_TYPE_KO`

이들은 GitHub history(이전 커밋)에서 복원 가능. 미래에 모노폴 표시·도멘 유형 배지·빈티지 별점 등이 다시 필요하면 참조.

---

## 6. 인터랙션 사양

### 6.1 카메라 트랜지션
drill 변경 시 `getCameraFor(drill)` 헬퍼가 zoom·center를 반환 → RAF 700ms easeOutCubic으로 보간.

```ts
function getCameraFor(d: DrillLevel): { zoom, center }
  overview: { zoom: 1.0, center: [4.50, 47.00] }                  // 부르고뉴 와이드
  cote:     COTES.find(c => c.id === d.coteId).{ zoom, center }   // 꼬뜨별 (4.0~5.0)
  commune:  { zoom: 6.5, center: COMMUNES.find(...).coords }      // 마을 줌인
  cru:      { zoom: 7.5, center: COMMUNES.find(...).coords }      // 등급까지 줌인
```

`filterZoomEvent={() => false}`로 사용자 휠/드래그 차단 (controlled-only).

### 6.2 Counter-scale
줌인 시 마커가 너무 작아지지 않게 `1 / pow(zoom, 0.65)` 적용. 마커뿐 아니라 앰비언트 라벨, Geography stroke에도 동일 cs 곱.

### 6.3 색 토글
`ColorFilter` state ('all' | 'red' | 'white' | 'rosé'). 변경 시:
- 지도 와인 마커 필터링 (`applyColor` 헬퍼)
- 카드 리스트 필터링
- 카드의 등급 그룹 칩 카운트 재계산

### 6.4 모바일 시트
- `MobileSheet`에 드래그 핸들. `sheetH` 0.30~0.86 클램프
- `bottomOffset={MOBILE_TAB_BAR_HEIGHT}` (64px) — 시트는 breadcrumb 바 위에서 시작

### 6.5 FloatingCTA 자동 숨김
`src/components/ui/floating-cta.tsx`의 IntersectionObserver(`#burgundy`, threshold 0.25)로 자동 숨김. 부르고뉴 섹션 외곽에 `id="burgundy"` 부여돼있어야 작동.

---

## 7. 디자인 토큰 (이 섹션 한정)

```ts
const GOLD = '#f0c876';                         // 활성 토글, 마을 라벨, 액센트
const BURGUNDY_DEPTS = {21,71,89,58,01,70,39}; // 지도 지역 fill
// 등급 색 — CRU_META에 정의 (Grand Cru 빨강, 1er Cru 골드, Village 회색, Régional 베이지)
// 색 토글 — WINE_TYPE_META: red 빨강, white 골드, rosé 핑크
const MOBILE_TAB_BAR_HEIGHT = 64;               // 모바일 하단 breadcrumb 바 높이 (시트 bottomOffset)
```

폰트:
- 제목·서체용: `Cormorant Garamond, Georgia, serif`
- 본문·UI: Inter (var(--font-inter))
- 한글: Noto Sans KR (자동 fallback)

---

## 8. 변경 이력 (최근 → 과거)

| Hash | 한 줄 |
|---|---|
| _이번 작업_ | refactor: 4탭 평면 → 풀 위계 드릴다운 + 색 토글 + 막사네 로제 (와인 덕후 친구 2차 피드백 반영) |
| `09bb771` | feat: 부르고뉴 섹션 와인 덕후 업그레이드 (Tier A+B) |
| `6dd8781` | fix: 부르고뉴 섹션에서 플로팅 CTA 숨김 |
| `dfa2569` | feat: 필터 탭을 패널/시트 밖으로 분리 |
| `5aac485` | style: 지도 핀 모양 통일 + 앰비언트 마을 라벨 |
| `28f446f` | feat: 빈티지 탭 추가 (보고서 B안 4축 분류 완성) |
| `ea64290` | feat: 분류 축을 와인 덕후 표준(등급·도멘·클리마)으로 재설계 |
| `a399a93` | docs: 부르고뉴 분류 체계 보고서 + 한글 표기 표준화 |
| `f579507` | feat: 'AI 자동 분류 와인 컬렉션' 컨셉으로 전환 |
| `d0c1cb8` | feat: 부르고뉴 드릴다운 섹션 추가 — 상세지역·생산자·밭 3필터 (초기 구현, 폐기) |

---

## 9. 알려진 trade-off & dial

| 만지고 싶을 때 | 위치 |
|---|---|
| 카메라 zoom 정도 | `getCameraFor()` 함수 — overview 1.0, cote는 COTES[id].zoom (4.0~5.0), commune 6.5, cru 7.5 |
| 카메라 트랜지션 속도 | `BurgundyMap` 안 `dur = 700`(ms) |
| 마커 크기 | `MapPin` 컴포넌트 `circle r={3.2}` |
| 마커 평소 opacity | `MapPin` `fillOpacity={hovered ? 1 : 0.7}` |
| 카운터 스케일 강도 | `cs = 1 / Math.pow(view.zoom, 0.65)` — 0.65를 1.0에 가까이 하면 줌인 시 마커 더 작아짐 |
| 모바일 하단 바 높이 | `MOBILE_TAB_BAR_HEIGHT = 64` 상수 |
| 모바일 시트 클램프 | `MobileSheet` 안 `clamp(0.30 ~ 0.86)` |
| PC 사이드 레일 위치 | `DesktopSideRail` 안 `top: 'clamp(96px, 14vh, 160px)'`, `left: 'clamp(16px, 3vw, 36px)'` |
| 앰비언트 라벨 흐림 정도 | `AMBIENT_FONT[size].opacity` (lg=0.32, md=0.30, sm=0.40) |
| 마을 클릭 라벨 색·크기 | `BurgundyMap` 안 `fill: GOLD, fontSize: 5` |
| 색 토글 옵션·이모지 | `ColorToggle` 안 opts 배열 |

### 잠재적 개선 후보 (사용자가 요청 시)
- **가성비 라인업 일괄 추가** (별도 작업) — Saint-Aubin·Mercurey·Pouilly-Fuissé·Saint-Véran·Bourgogne Aligoté 등 ~10병. 데이터만 추가하면 자동으로 위계에 편입됨
- **가격 필드 도입** (`priceLevel: 1~5`) → 색 토글 외 가격대 토글 추가
- **빈티지 별점 복원** — 와인 카드에 빈티지 별점 표시. 이전 코드에서 `VINTAGE_RATINGS` + `vintageScore` + `vintageColor` 헬퍼 복원 가능 (git history 참조)
- **모노폴 배지 복원** — 클리마 정보 카드에 "Monopole" 골드 배지. 이전 `MonopoleBadge` 컴포넌트 복원 가능
- **데이터 i18n** — 와인 note·마을명 한글 등이 컴포넌트 안 정적 데이터에 박혀있음. 영어 빌드에서도 한글 그대로 나옴. 필요하면 `messages/{ko,en}.json`으로 분리
- **클러스터링** — 같은 좌표 와인이 겹쳐 보이는 경우 jitter 또는 클러스터 마커
- **모바일 마커 탭 시 시트 자동 확장**

---

## 10. 환경 셋업 (인수인계 머신용)

```bash
# 1. 의존성
npm install

# 2. .env.local — .env.example 기반
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...   # 서버 전용
NEXT_PUBLIC_SITE_URL=https://winemine.com

# 3. 개발 서버
npm run dev   # http://localhost:3000

# 4. 타입 검증 (필수 — 변경 후)
npx tsc --noEmit

# 5. i18n 키 동기화 검증
node -e "
const ko=require('./src/messages/ko.json'),en=require('./src/messages/en.json');
function f(o,p=''){const r={};for(const k in o){const n=p?p+'.'+k:k;
o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k])?Object.assign(r,f(o[k],n)):r[n]=true}return r}
const a=f(ko),b=f(en);
console.log('only ko:',Object.keys(a).filter(k=>!b[k]));
console.log('only en:',Object.keys(b).filter(k=>!a[k]));
"
```

> **주의: `npm run build` 환경 이슈.** 현재 머신에서 `next build`가 manifest 파일(`server-reference-manifest.json` / `_buildManifest.js.tmp`) 누락 ENOENT 에러를 일으킨다. **이전 main 브랜치에서도 동일 발생** — 코드 변경과 무관한 Next.js 15.5.15 + Node 20 + macOS 환경 버그로 추정. 검증은 `npx tsc --noEmit`(타입 통과 확인) + `npm run dev`(컴파일 성공 확인 — `✓ Compiled / in N s` 출력)로 대체.

git origin: `https://github.com/rocher71/winemine-landing.git` (main 브랜치)

---

## 11. 사용자 톤 메모 (협업 가이드)

- **언어.** 한국어 기반. 코드/와인 용어는 영문 병기 OK
- **요청 패턴.** "여기까지 커밋 푸시해줘"가 자주 나옴 → `commit-push` 스킬 활용
- **검증 우선.** 큰 UI 변경 후엔 타입 체크 + dev 서버 확인하는 루틴 정착됨
- **디자인 톤.** 어두운 배경 + 골드 액센트 + 와인 빨강. 과한 장식·이모지 지양 (단 색 토글의 🍷🥂🌸 이모지는 의도적 — 와인 색 시각 구분)
- **와인 도메인 신중성.** 사용자 와인 덕후 지인 피드백을 매우 진지하게 받아들임. 한글 표기·용어 어색하면 즉시 지적 → 한국 와인 업계 표준 따를 것. 친구 발언 정/오답 판정 시 `_workspace/burgundy-classification-research.md`와 `france-wine-research.md` 자료 인용
- **i18n 체크.** `src/messages/{ko,en}.json` 키 구조는 항상 동기화. `commit-push` 스킬에 자동 체크 포함

---

## 12. 자주 참조하는 외부 문서

- `_workspace/burgundy-classification-research.md` — 4탭 → 위계 드릴다운 설계 근거. §7에 한글-프랑스어 용어집 100여 항목
- `_workspace/france-wine-research.md` — 부르고뉴 섹션의 데이터 출처 (마을·도멘·클리마 라인업, 막사네 로제 정보 §158)
- `_workspace/wine-production-report.md` / `wine-production-report-summary.md` — 전세계 와인 산지 종합 (이 섹션 외 활용)
- `WINEMINE_LANDING_SPEC.md` — 전체 랜딩 페이지 스펙 (부르고뉴 섹션은 후기에 추가됨, 일부 갱신 안 됐을 수 있음)
- `CLAUDE.md` — 프로젝트 전체 컨벤션·기술 스택·디자인 시스템

---

**문서 마지막 업데이트.** 2026-05-08 (위계 드릴다운 + 색 토글 + 막사네 로제 반영).
