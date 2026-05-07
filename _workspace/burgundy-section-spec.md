# 부르고뉴 섹션 — 구현 사양 (Claude Code 인수인계)

> **목적.** 사용자가 두 컴퓨터에서 winemine 랜딩 페이지를 번갈아 작업한다. 다른 머신의 Claude Code가 부르고뉴 드릴다운 섹션의 현재 상태·데이터 모델·UI 구조·디자인 결정·변경 이력을 한 번에 파악할 수 있도록 정리한 문서.
>
> **핵심 파일.** `src/components/sections/burgundy-section.tsx` (단일 파일, ~1100줄). 부르고뉴 섹션의 거의 모든 로직·데이터·컴포넌트가 여기 들어 있다.
>
> **상위 컨텍스트.** `CLAUDE.md` (전체 프로젝트), `_workspace/burgundy-classification-research.md` (와인 덕후 분류 체계 리서치 보고서, 이 섹션 설계의 근거), `_workspace/france-wine-research.md` (프랑스 전 산지 사내 조사).

---

## 1. TL;DR

- **컨셉.** "AI가 자동 분류한 내가 마신 부르고뉴 와인 컬렉션." 사용자가 와인을 마시면 라벨 사진에서 AI가 인식해 **등급 / 클리마 / 도멘 / 빈티지** 4축으로 자동 분류한다는 시뮬레이션 데모.
- **분류 축은 보고서 §4 의 '안 B(축 재설계)'를 채택.** 이유: "상세지역/생산자/밭"이라는 평면 구조가 와인 덕후 시각에서 어색하다는 피드백 → 부르고뉴 본질인 4축 위계로 재배치.
- **UI 구조 (4탭 풀스크린 섹션).**
  - PC: 좌측 세로 탭 + 가운데 줌 가능한 부르고뉴 지도 + 우측 카드 패널
  - 모바일: 위 절반 지도 + 드래그 가능한 바텀시트 + 화면 최하단 가로 탭 바
- **마커 통일.** 모든 탭에서 `MapPin` 컴포넌트 단일 사용 (작은 동그라미). 색·외곽 링·count 배지로만 의미 구분. 마커 안 텍스트 일체 없음 — 정보는 카드에 집중.
- **인터랙션.** 필터 변경 시 `ZoomableGroup` 카메라(zoom·center)가 RAF 700ms easeOutCubic으로 부드럽게 이동. 마커는 `motion.g` + `AnimatePresence` 그룹 단위 fade.

---

## 2. 핵심 결정 사항 (왜 이 모양이 됐는지)

| 결정 | 근거 |
|---|---|
| **4탭 (Cru / Climat / Domaine / Millésime)** | 보고서 §3 활용 빈도 1·2·3·4위 그대로. "꼬뜨"와 "마을"은 컬렉션 분류용으로는 약함 |
| **마커 모양 통일 (단일 동그라미)** | 사용자 피드백: 탭마다 모양이 4종(점/별/이니셜 동그라미/다이아몬드)이라 산만, 특히 모바일에서 조잡 |
| **마커 안 텍스트 제거** | 모바일은 hover 없음 → 정보는 카드에 둬야 함. 마커는 위치 인디케이터 |
| **필터 탭을 패널/시트 밖으로 분리** | 모바일에서 시트가 닫혔을 때도 탭이 보여야 nudging 가능 |
| **PC 탭은 좌측 세로 스택** | 헤더(가운데) + 카드(우측) 사이 좌측 빈 공간 활용 + 탭이 항상 시야 |
| **모바일 탭은 화면 최하단 고정** | 손가락 닿기 좋은 hot zone. z-index 시트(30) 위(40) |
| **부르고뉴 섹션에서 FloatingCTA 숨김** | 모바일 하단 탭 바와 '앱 다운받기' 플로팅 CTA가 겹쳐서. IntersectionObserver(threshold 0.25)로 부르고뉴 섹션 보이면 자동 숨김 |
| **한글 표기는 한국 와인 업계 표준** | 영어식 발음(예: "게브레이") 금지 → "주브레-샹베르탱". 데이터 안 nameKo·villageKo 필드로 한글 우선 + 영문 병기 |

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

페이지 트리 (`src/app/page.tsx`):
1. HeroSection (세계 지도)
2. FranceWineSection (스크롤 기반 프랑스 드릴다운)
3. **BurgundySection** ← 이 문서 대상 (id="burgundy")
4. VineyardStrip ~ FinalCTASection
5. WaitlistModal + FloatingCTA (부르고뉴에서는 자동 숨김)

⚠️ `france-wine-detail-section.tsx`는 파일은 남아있으나 page.tsx에서 import 제거됨 (부르고뉴 섹션에 통합됨). 필요 시 다시 import 가능.

---

## 4. 데이터 모델 (`burgundy-section.tsx` 상단)

### 4.1 타입 (line 14~50)
```ts
type FilterKey = 'cru' | 'vineyard' | 'producer' | 'vintage';
type Cru = 'Grand Cru' | '1er Cru' | 'Village' | 'Régional';
type ProducerType = 'Domaine' | 'Maison' | 'Négociant-Éleveur';

type SubRegionData    // (정의는 남아있으나 실제로는 미사용 — 제거 가능)
type ProducerData = { id, name, nameKo, initials, coords, village, blurb, type };
type VineyardData = { id, name, nameKo, coords, classification, subregion, area, isMonopole? };
type Wine = {
  id, name, nameKo, vintage, producerId, vineyardId?,
  subregionId, village, villageKo, cru,
  date, occasion?, note, coords,        // 표시용
  color, label, rating, appellation,    // 와인병 SVG 라벨용
};
```

### 4.2 정적 데이터
| 상수 | 개수 | 용도 |
|---|---|---|
| `PRODUCERS` | **12** (도멘 10 + 메종 1 + 네고시앙-엘레뵈르 1) | 도멘 탭 카드·마커 |
| `VINEYARDS` | **13** (Grand Cru 9 + 1er Cru 4) — 로마네-콩티·라 타슈는 isMonopole | 클리마 탭 카드·마커 |
| `WINES` | **16병** (GC 9 + 1er Cru 5 + Village 1 + Régional 1) | 모든 탭의 와인 미니 카드 |
| `CRU_META` | 4 | 등급별 색·칩 텍스트(GC/1er/V/R)·배경·외곽선 |
| `VINTAGE_RATINGS` | 8 (2015~2022) | red/white 별점·평가 코멘트·Landmark 플래그 |
| `AMBIENT_LABELS` | 8 | 지도 배경 마을·꼬뜨 압인 (Côte de Nuits, Gevrey 등) |

### 4.3 그룹핑 헬퍼 (자동 생성)
```ts
winesByCru:      Record<Cru, Wine[]>      // GC 9, 1er 5, Village 1, Régional 1
winesByProducer: Record<string, Wine[]>   // producerId 기반
winesByVineyard: Record<string, Wine[]>   // vineyardId 기반 (vineyardId 없으면 미포함)
winesByVintage:  Record<number, Wine[]>   // 빈티지 연도 기반
VINTAGE_KEYS:    number[]                 // winesByVintage의 키 내림차순
```

### 4.4 한글 표기 규칙
**모든 마을·도멘·클리마 데이터에 `nameKo` 또는 `villageKo` 필드 포함.** 카드/마커 텍스트는 한글 우선, 영문은 작게/이탤릭 병기. 한국 와인 업계 표준 표기는 `_workspace/burgundy-classification-research.md` §7 용어집 참조. 절대 영어식 발음(예: "게브레이") 쓰지 말 것.

---

## 5. UI 컴포넌트 트리

`burgundy-section.tsx` 안에서 정의되는 컴포넌트들 (모두 같은 파일):

```
BurgundySection (default export, Main)
├── BurgundyMap                 # 지도 + ZoomableGroup + 마커
│   ├── Geographies (france-departments.json)
│   ├── AMBIENT_LABELS (8개 마을·꼬뜨 압인)
│   └── AnimatePresence
│       ├── 'cru'      → WINES.map → MapPin
│       ├── 'vineyard' → VINEYARDS.map → MapPin (ring=isMonopole)
│       ├── 'producer' → PRODUCERS.map → MapPin (count badge)
│       └── 'vintage'  → WINES.map → MapPin (ring=isLandmark)
├── DesktopFilterTabs           # PC 좌측 세로 스택 (≥768px)
├── MobileFilterTabs            # 모바일 하단 고정 가로 바 (<768px)
├── DesktopPanel                # PC 우측 카드 패널 (≥768px)
│   └── PanelContent
│       ├── 'cru'      → CRU_ORDER.map → CruGroupCard (4 그룹)
│       ├── 'vineyard' → VINEYARDS.map → VineyardCard
│       ├── 'producer' → PRODUCERS.map → ProducerCard
│       └── 'vintage'  → VINTAGE_KEYS.map → VintageGroupCard
└── MobileSheet                 # 모바일 드래그 시트 (<768px), bottomOffset=58px
    └── PanelContent (위와 동일)
```

### 카드 내부 (모든 탭 공통 와인 미니 카드)
```
WineRow
├── BottleSilhouette             # SVG 와인병 (label/vintage/appellation 박힌 라벨)
└── (우측)
    ├── CruChip + nameKo         # 등급 칩 + 한글 와인명
    ├── name (영문 이탤릭)
    ├── villageKo · vintage      # GOLD uppercase
    ├── note (2줄 클램프)
    └── WineGlassRating + date
```

### 부가 배지·칩 컴포넌트
- `CruChip` — GC/1er/V/R 작은 칩 (등급별 색)
- `MonopoleBadge` — 클리마 카드 골드 "Monopole" 배지
- `ProducerTypeBadge` — 도멘 카드 "도멘"/"메종"/"네고시앙-엘레뵈르"
- `CollectedBadge` — "AI 분류 · N병"
- `CountBadge` — 마커 옆 빨간 N 배지 (도멘·클리마 탭)

---

## 6. 인터랙션 사양

### 6.1 카메라 트랜지션
필터 변경 시 `ZoomableGroup`의 zoom·center를 RAF 700ms easeOutCubic으로 보간 (동일 파일 `useEffect` 안). `filterZoomEvent={() => false}`로 사용자 휠/드래그 차단 (controlled-only).

```ts
const CAMERA = {
  cru:      { zoom: 1.0, center: [4.50, 47.00] }, // 부르고뉴 + 샤블리 와이드
  vineyard: { zoom: 3.4, center: [4.92, 47.10] }, // 클리마 단위 줌인
  producer: { zoom: 2.6, center: [4.88, 47.10] }, // 코트 도르 클로즈업
  vintage:  { zoom: 1.0, center: [4.50, 47.00] }, // cru와 동일 와이드
};
```

### 6.2 Counter-scale
줌인 시 마커 너무 작아지지 않게 `1 / pow(zoom, 0.65)` 적용. 마커뿐 아니라 앰비언트 라벨, Geography stroke에도 동일 cs 곱.

### 6.3 마커 hover/touch
- 데스크톱: `onMouseEnter`/`onMouseLeave` → hoveredId state
- 모바일: `onTouchStart` 추가로 터치 시 hovered 활성화
- hover 시: 펄싱 링 + 카드 active state 동기화 (해당 와인이 속한 그룹 카드 강조)

### 6.4 모바일 시트
- `MobileSheet`에 드래그 핸들 (`handleRef`). `sheetH` 0.30~0.86 클램프
- `bottomOffset={MOBILE_TAB_BAR_HEIGHT}` (58px) — 시트는 탭 바 위에서 시작
- `MOBILE_TAB_BAR_HEIGHT` 상수 변경 시 시트 위치도 자동 따라감

### 6.5 FloatingCTA 자동 숨김
`src/components/ui/floating-cta.tsx` 안에서 `document.getElementById('burgundy')` IntersectionObserver(threshold 0.25)로 감지 → `hideOnSection` state. 부르고뉴 섹션 외곽에 `id="burgundy"` 부여돼있어야 작동.

---

## 7. 디자인 토큰 (이 섹션 한정)

```ts
const GOLD = '#f0c876';                // 활성 탭, 도멘 마커, 액센트
const BURGUNDY_DEPTS = {21,71,89,58,01,70,39}; // 지도 지역 fill
// 등급 색 — CRU_META에 정의
Grand Cru: #E0B560 (빨강 계열), 1er Cru: #C8965C, Village: #9B8B7A, Régional: #4A3D56
// 빈티지 색 — vintageColor() 함수
★5: #E0B560 골드, ★4.5: #C8965C, ★4: #A57848, ★3: #7A6E5A, ★2이하: #4A3D56
```

폰트:
- 제목·서체용: `Cormorant Garamond, Georgia, serif`
- 본문·UI: Inter (var(--font-inter))
- 한글: Noto Sans KR (자동 fallback)
- 빈티지 연도: Georgia serif 22px (큰 글자)

---

## 8. 변경 이력 (최근 → 과거, 커밋 hash 기준)

| Hash | 한 줄 |
|---|---|
| `6dd8781` | fix: 부르고뉴 섹션에서 플로팅 CTA 숨김 (모바일 하단 탭 바와 겹침 방지) |
| `dfa2569` | feat: 필터 탭을 패널/시트 밖으로 분리 (PC 좌측 세로 / 모바일 하단 고정) |
| `5aac485` | style: 지도 핀 모양 통일 + 앰비언트 마을 라벨 |
| `28f446f` | feat: 빈티지 탭 추가 (B안 4축 분류 완성) |
| `ea64290` | feat: 분류 축을 와인 덕후 표준(등급·도멘·클리마)으로 재설계 |
| `a399a93` | docs: 부르고뉴 분류 체계 보고서 + 한글 표기 표준화 |
| `58d8e0c` | feat: 지도 zoom 트랜지션 + 필터 탭 잘림 해소 |
| `f579507` | feat: 'AI 자동 분류 와인 컬렉션' 컨셉으로 전환 (france-wine-detail-section 통합) |
| `d0c1cb8` | feat: 부르고뉴 드릴다운 섹션 추가 — 상세지역·생산자·밭 3필터 (초기 구현, 이후 폐기) |

---

## 9. 알려진 trade-off & dial

| 만지고 싶을 때 | 위치 |
|---|---|
| 카메라 zoom 정도 | `CAMERA` 상수 — `cru` 1.0, `vineyard` 3.4, `producer` 2.6, `vintage` 1.0 |
| 카메라 트랜지션 속도 | `useEffect` 안 `dur = 700`(ms) |
| 마커 크기 | `MapPin` 컴포넌트 `circle r={3.2}` |
| 마커 평소 opacity | `MapPin` `fillOpacity={hovered ? 1 : 0.7}` |
| 카운터 스케일 강도 | `cs = 1 / Math.pow(view.zoom, 0.65)` — 0.65를 1.0에 가까이 하면 줌인 시 마커 더 작아짐 |
| 모바일 탭 바 높이 | `MOBILE_TAB_BAR_HEIGHT = 58` 상수 |
| 모바일 시트 클램프 | `MobileSheet` 안 `clamp(0.30 ~ 0.86)` |
| PC 좌측 탭 위치 | `DesktopFilterTabs` 안 `top: 'clamp(96px, 14vh, 160px)'`, `left: 'clamp(16px, 3vw, 36px)'` |
| 앰비언트 라벨 흐림 정도 | `AMBIENT_FONT[size].opacity` (lg=0.32, md=0.30, sm=0.40) |
| 빈티지 별점 색상 매핑 | `vintageColor(year)` 함수 |
| 빈티지 차트 자체 | `VINTAGE_RATINGS` 상수 (보고서 §1-7 기반) |

### 잠재적 개선 후보 (사용자가 요청 시)
- **데이터 i18n.** 현재 와인 note·마을명 한글 등이 컴포넌트 안 정적 데이터에 박혀있음. 영어 빌드에서도 한글 그대로 나옴. 필요하면 `messages/{ko,en}.json`으로 빼서 다국어 처리 가능
- **Village/Régional 데이터 부족.** 각 1병만 있어 데모성. 확장 시 와인 추가 + Pommard·Bourgogne Aligoté 등의 도멘 추가
- **클러스터링.** 같은 좌표 와인이 겹쳐 보이는 경우 jitter 또는 클러스터 마커. 현재는 데이터에서 좌표를 약간씩 다르게 줘서 회피 (예: w10/w11 perrieres 좌표 미세 차이)
- **빈티지 탭 타임라인 뷰.** 보고서 §4-B에 "(지도 대신 타임라인 뷰?)" 옵션 있음. 현재는 지도 유지 (사용자 선택). 변경 시 카메라·마커 분기 추가 필요
- **모바일 마커 탭 시 시트 자동 확장.** 현재는 hoveredId만 set, 시트는 그대로. 향후 sheetH를 0.6 정도로 자동 올리는 인터랙션 가능

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

# 4. 빌드 검증 (필수 — 변경 후)
npm run build

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

git origin: `https://github.com/rocher71/winemine-landing.git` (main 브랜치)

---

## 11. 사용자 톤 메모 (협업 가이드)

- **언어.** 한국어 기반. 코드/와인 용어는 영문 병기 OK
- **요청 패턴.** "여기까지 커밋 푸시해줘"가 자주 나옴 → `commit-push` 스킬 활용
- **검증 우선.** 큰 UI 변경 후엔 빌드 + i18n 동기화 확인하는 루틴 정착됨
- **디자인 톤.** 어두운 배경 + 골드 액센트 + 와인 빨강. 과한 장식·이모지 지양
- **와인 도메인 신중성.** 사용자 와인 덕후 지인 피드백을 매우 진지하게 받아들임. 한글 표기·용어 어색하면 즉시 지적 → 한국 와인 업계 표준 따를 것
- **i18n 체크.** `src/messages/{ko,en}.json` 키 구조는 항상 동기화. `commit-push` 스킬에 자동 체크 포함

---

## 12. 자주 참조하는 외부 문서

- `_workspace/burgundy-classification-research.md` — 4탭 설계 근거. §7에 한글-프랑스어 용어집 100여 항목
- `_workspace/france-wine-research.md` — 부르고뉴 섹션의 데이터 출처 (마을·도멘·클리마 라인업)
- `_workspace/wine-production-report.md` / `wine-production-report-summary.md` — 전세계 와인 산지 종합 (이 섹션 외 활용)
- `WINEMINE_LANDING_SPEC.md` — 전체 랜딩 페이지 스펙 (부르고뉴 섹션은 후기에 추가됨, 일부 갱신 안 됐을 수 있음)
- `CLAUDE.md` — 프로젝트 전체 컨벤션·기술 스택·디자인 시스템

---

**문서 마지막 업데이트.** 2026-05-08 (커밋 `6dd8781` 시점)
