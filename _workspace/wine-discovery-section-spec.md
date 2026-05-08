# Wine Discovery 섹션 — 구현 사양 (Claude Code 인수인계)

> **목적.** 다른 머신/세션의 Claude Code가 이 작업의 현재 상태·결정 근거·재사용 패턴·미완 항목을 한 번에 파악하도록 정리한 문서.
>
> **핵심 파일.** `src/components/sections/wine-discovery-section.tsx` (약 230줄, 단일 파일).
>
> **상위 컨텍스트.** `CLAUDE.md` (전체 프로젝트), `_workspace/burgundy-section-spec.md` (전문가 측 섹션, 이 작업과 짝).

---

## 1. TL;DR

- **컨셉.** "와인이 처음인 사람도 한 페이지 안에서 부드럽게 이해할 수 있도록" 정보 밀도 낮은 France 드릴다운 자리를 **3단계 스크롤 스토리텔링 + outro**로 교체. 마지막 단계가 자연스럽게 다음 부르고뉴 섹션(전문가 측)으로 시선을 넘긴다.
- **페어링.** 두 섹션 헤더를 의문문 형식으로 짝지음 — Wine Discovery "와인을 가볍게 즐기고 싶으신가요?" ↔ Burgundy "와인을 깊게 파고드시나요?". 사용자에게 명시 토글을 강요하지 않으면서 톤만 분리.
- **핵심 플로우.** Step 0(라벨 도입) → Step 1(스캔) → **Step 2(스캔한 산지에서 비슷한 입문 와인이 지도 위로 sequential 등장 + 줌아웃)** → outro(부르고뉴 전환).
- **재사용 우선.** ScanPanel은 named export로 가져다 씀. Step 2의 RecommendationMap은 react-simple-maps + Framer motion useTransform으로 새로 작성 (Burgundy 핀 디자인 차용, 단 골드 색상).
- **Recap 분리.** 이전 step 3(PhoneMockup Recap 공유)는 별도 섹션으로 옮겨 `InstagramPreviewSection`을 Features 직후에 다시 마운트.
- **부르고뉴와의 연결.** 마지막 step의 outro 카피("이미 깊게 빠지셨나요?") + 빨간 점이 다음 섹션 톤을 미리 노출하는 시각적 hint.

---

## 2. 브랜치·머지 상태 (2026-05-08 기준)

| 항목 | 값 |
|---|---|
| 작업 브랜치 | `feat/wine-discovery-section` |
| 머지 상태 | **main에 미반영** (PR 미생성) |
| origin push | 완료 |
| PR URL | https://github.com/rocher71/winemine-landing/pull/new/feat/wine-discovery-section |

**브랜치 커밋 4개 (최근 → 과거):**
```
9008a15 feat: 초보자/전문가 분기 헤더 추가 — 두 섹션을 짝지어 프레이밍
c9a542e refactor: MarketStatsSection 마운트 제거 — 흐름 부정합
ebad6e4 refactor: 랜딩 페이지 중복 콘텐츠 정리 — 라벨/Recap 데모 일원화
dc4accf feat: 초보자 친화 Wine Discovery 섹션 추가 — France 자리 교체
```

---

## 3. 페이지 구조 변화

**Before (main):** 9 섹션 — Hero → France → Burgundy → VineyardStrip → Features(3 패널) → MarketStats → HowItWorks → InstagramPreview → FinalCTA

**After (this branch, 추천 플로우 도입):** 8 섹션
```
1. Hero
2. WineDiscoverySection  ← 3 step + outro (도입 → 스캔 → 추천 지도 → outro)
3. BurgundySection
4. VineyardStrip
5. FeaturesSection (단일 패널 GlassCardStack)
6. InstagramPreviewSection ← Recap 공유 (다시 마운트)
7. HowItWorksSection
8. FinalCTASection
```

**파일 상태:**
| 파일 | 상태 |
|---|---|
| `france-wine-section.tsx` | 미마운트 (롤백 대비 보존) |
| `instagram-preview-section.tsx` | **Features 직후 재마운트**. PhoneMockup·StoryCard 그대로 사용 |
| `market-stats-section.tsx` | 미마운트 (롤백 대비 보존) |
| `france-wine-detail-section.tsx` | 미마운트 (이전부터) |

---

## 4. 핵심 결정 사항

| 결정 | 근거 |
|---|---|
| **배치: France 자리 교체** | France 드릴다운은 지역명+병 수만 보여줘 정보 밀도 낮음. 부르고뉴 앞에 또 다른 정적 지도가 잉여. 사용자 답변(`/loop` ExitPlanMode 시 채택) |
| **방식: 스크롤 스토리텔링** | 명시 토글("초보자/전문가") 강요 X. 스크롤 진행에 따라 자연스럽게 깊어짐. 사용자 답변 |
| **헤더 페어링 (의문문)** | 가볍게 ↔ 깊게 — 동일 형식. 두 섹션이 한 톤의 다른 면이라는 인상 |
| **5 viewport (320vh)** | Step 0 인트로 + Step 1~3 데모 + Step 4 outro. 인트로/아웃트로 호흡 위해 5단계. 모바일에서 길게 느껴지면 280vh로 축소 가능 |
| **Step 2 시각: 5색 stack bar + insight 카피** | 도넛은 5종 비율만. 사용자는 "5종 + 컨트리 선호" 두 차원이 필요 → 막대 + insight 텍스트로 표현. 미니 월드맵은 step 3의 StoryCard 안에 이미 있어 step 2에서는 생략 |
| **재사용 컴포넌트 named export** | `_shared/`로 추출하지 않고 직접 import. 오버엔지니어링 회피. 3번째 사용처 생기면 그때 추출 |

---

## 5. 코드 위치

```
src/
├── app/
│   └── page.tsx                              # 7 섹션 마운트
├── components/sections/
│   ├── wine-discovery-section.tsx           # ★ 신규 — 이 문서 대상
│   ├── features-section.tsx                 # ScanPanel named export 추가, Panel 02·03 제거
│   └── instagram-preview-section.tsx        # StoryCard·PhoneMockup·StoryWorldMap named export 추가 (마운트 X)
├── messages/
│   ├── ko.json                               # wineDiscovery.* 추가, burgundy.heading 교체, features.* 트림
│   └── en.json                               # 동기화
└── _workspace/
    ├── wine-discovery-section-spec.md       # 이 문서
    └── burgundy-section-spec.md             # 짝 — 부르고뉴 측 인수인계
```

---

## 6. 단계 구조 (`wine-discovery-section.tsx`)

```ts
// 3 step + outro
useMotionValueEvent(scrollYProgress, 'change', v => {
  setStep(v < 0.10 ? 0 : v < 0.28 ? 1 : v < 0.85 ? 2 : 3);
});

// Step 2 sub-progress (0..1) — RecommendationMap 핀 sequential 등장 + 줌아웃
const recProgress = useTransform(scrollYProgress, [0.28, 0.85], [0, 1], { clamp: true });
```

| Step | 헤드라인 (ko) | 시각 자료 | 출처 |
|---|---|---|---|
| 0 intro | "와인 한 병이, / 처음에는 그냥 라벨일 뿐" | 정적 블러 라벨 카드 (rotate -3deg) | 인라인 |
| 1 스캔 | "찍기만 하면 / 나머지는 우리가" | 라벨 + 스캔 라인 + 6 태그 reveal | **`ScanPanel`** (`features-section.tsx`) |
| 2 추천 | "기록이 쌓일수록 / 취향에 딱 맞는 한 병" | RecommendationMap (시작 핀 + 추천 핀 sequential 등장 + 지도 줌아웃 1.05→1.18) + 추천 카드 슬라이드 인 + StartHintPill | **신규 `RecommendationMap`·`RecommendationCard`·`StartHintPill`** (이 파일 안) |
| 3 outro | "이미 깊게 빠지셨나요?" + 빨간 점 + 화살표 | 인라인 | 인라인 |

**Step 2 데이터 (`src/lib/recommended-wines.ts`):**
- `STARTING_WINE` — 시작 와인(Margaux, 보르도). 큰 와인레드 핀, 강조 halo
- `RECOMMENDED_WINES[]` — 9개 입문용 mock (Bordeaux Sup·Chianti·Valpolicella·Rioja·Casillero·Mendoza·Cloudy Bay·Jacob's Creek·Oregon Pinot)
- 가격대: 18,000~65,000원 (톡방 발화 "10만원 언더 부르고뉴 입문" 기조)
- `coords`: `[lon, lat]` for `react-simple-maps`

---

## 7. i18n 키 구조 (변경 사항)

**`wineDiscovery.*` (3 step + outro 구조, 양쪽 동일):**
```jsonc
"wineDiscovery": {
  "sectionLabel": "Beginner's first map",        // eyebrow (이전 "Discover your taste"에서 변경)
  "topQuestion":  "와인을 가볍게 즐기고 싶으신가요?",
  "step0":  { "title", "subtitle" },
  "step1":  { "label", "title", "body" },
  "step2":  { "label", "title", "body", "startHint", "footnote" },
  "outro":  { "title", "subtitle" }
}
```

**제거된 키 (이전 5단계 잔재):**
- `step2.insight`, `step2.tasteBars` — TasteBars 컴포넌트 제거에 따른 정리
- `step3` 전체 — Recap 섹션은 별도 `instagramPreview.*`로 이동

**`burgundy.heading` 교체:**
- Before: "내가 마신 와인이 등급·클리마·도멘·빈티지로"
- After: **"와인을 깊게 파고드시나요?"**
- 근거: 등급/클리마/도멘/빈티지 디테일은 필터 탭이 이미 노출. 헤딩에서는 사용자 의도를 묻는 카피가 더 임팩트.

**`features.*` 트림:**
- 제거: `regions`, `timestamp`, `statsLabels`, `fullPreviewButton`, `panels[1]`, `panels[2]`
- 변경: `panels[0].title`/`sub` → "한 잔 한 잔, 다 다르게" / "와인 한 병의 디테일까지\n오롯이 기억됩니다"
- 유지: `wineCards`, `mobileSwipeHint`, `mobileTapHint`

**미사용 잔존 키 (마운트는 빠졌지만 컴포넌트가 아직 import):**
- `instagramPreview.*` — StoryCard가 `messages.instagramPreview.timestamp/statsLabels` 읽음. **삭제 금지**
- `franceWine.*`, `franceWineDetail.*`, `marketStats.*` — 파일 보존됐으므로 유지

---

## 8. UI 컴포넌트 트리

```
WineDiscoverySection (default export)
├── Top header (absolute, top)
│   ├── small eyebrow (sectionLabel - "Discover your taste")
│   └── h3 question (topQuestion - "와인을 가볍게 즐기고 싶으신가요?")
├── AnimatePresence (mode="wait")
│   └── motion.div key={step}
│       ├── step 0 → StepHeader + 블러 라벨 카드
│       ├── step 1 → StepHeader + ScanPanel
│       ├── step 2 → StepHeader + TasteBars + insight 카피
│       ├── step 3 → StepHeader + PhoneMockup(StoryCard, scale=0.62)
│       └── step 4 → 빨간 점 + outro 카피 (화살표 ↓는 subtitle 텍스트 안)
└── Step indicator dots (absolute, bottom — 5 dots, 활성은 width 20px 골드)
```

**내부 정의 컴포넌트:**
- `StepHeader({ label, title, body })` — 모든 step 공통 헤더 패턴 (eyebrow + h2 + body)
- `TasteBars({ tasteLabels, active })` — 5색 stack bar, active일 때 stagger 80ms width 0→target%

---

## 9. 인터랙션·디자인 토큰

| 항목 | 값 / 위치 |
|---|---|
| Sticky 높이 | `height: 320vh` outer wrapper |
| 트랜지션 | step 변경 시 fade + 16px y-shift, 500ms easeOut |
| 헤더 위치 | `top: clamp(28px, 4vh, 52px)`, 가운데 정렬 |
| Dots 위치 | `bottom: clamp(28px, 4.5vh, 48px)` |
| 배경 | `radial-gradient(...rgba(196,30,58,0.05)) + #04010A` |
| 골드 액센트 | `#C9A84C` (eyebrow, dots, insight) |
| 빨간 점 (outro) | `#D42040`, `boxShadow: 0 0 32px rgba(212,32,64,0.55)` |

**모바일 fit 검증된 viewport:**
- iPhone 14 Pro (390×844), iPhone SE (375×667) 둘 다 step 1 ScanPanel + step 3 PhoneMockup(0.62) 잘림 없음

---

## 10. 변경 이력

| Hash | 한 줄 요약 |
|---|---|
| `9008a15` | feat: 초보자/전문가 분기 헤더 추가 (Wine Discovery topQuestion + Burgundy heading 교체) |
| `c9a542e` | refactor: MarketStatsSection 마운트 제거 (흐름 부정합) |
| `ebad6e4` | refactor: 라벨/Recap 데모 일원화 — InstagramPreview 마운트 제거, features Panel 02·03 제거 |
| `dc4accf` | feat: Wine Discovery 섹션 신규 + France 마운트 교체 |

---

## 11. 알려진 trade-off & 다이얼

| 만지고 싶을 때 | 위치 |
|---|---|
| 단계별 scroll 분기점 | `useMotionValueEvent` 안의 0.10/0.32/0.58/0.85 |
| 전체 길이 | outer `height: '320vh'` (280vh로 줄여도 OK) |
| TasteBars 비율 | `TASTE_BARS` 상수 |
| Step 3 폰 크기 | `PhoneMockup scale={0.62}` |
| 헤더 카피 페어링 | `wineDiscovery.topQuestion` ↔ `burgundy.heading` (i18n) |
| Outro 빨간 점 색 | inline `#D42040` (부르고뉴 톤 미리보기) |

### 잠재적 개선 후보

- **Step 2 미니 월드맵 추가**: 현재는 TasteBars + insight 텍스트만. plan에는 mini-map 점등도 있었으나 step 3의 StoryCard에 이미 mini-map이 있어서 중복 회피 차원에서 생략. 사용자 피드백에 따라 추가 가능 (`StoryWorldMap` import 한 줄)
- **Step 0 인트로 비주얼 강화**: 현재 단순 블러 라벨 카드 1개. 와인 잔이나 그림자 추가로 분위기 강화 가능
- **데이터 i18n**: TasteBars 비율/insight 등이 정적. 사용자별 동적 데이터 연결은 앱 내부 구현이라 랜딩에서는 정적 유지
- **모바일 마지막 step 전환 감속**: 빠르게 스와이프하면 step이 점프하는 느낌. `useScroll` debouncing 도입 검토

### 후속 정리 후보 (이 브랜치에서 안 한 것)
- 미마운트 파일 일괄 삭제 (`france-wine-section`, `market-stats-section`, `france-wine-detail-section`) — 안정 후 별도 PR
- 미사용 i18n 키 정리 (`franceWine.*`, `franceWineDetail.*`, `marketStats.*`) — 위 파일 삭제와 묶어서

---

## 12. 환경 셋업 (인수인계 머신용)

```bash
# 1. 작업 브랜치 동기화
git fetch origin
git checkout feat/wine-discovery-section
git pull

# 2. Node 버전 (시스템 기본은 16, Next.js 15가 18+ 요구)
nvm use 20.20.2

# 3. 의존성 + 개발 서버
npm install
npm run dev
# ⚠ port 3000 점유 중이면 자동으로 3001/3003 등으로 fallback. 로그 확인

# 4. 빌드 검증
npm run build

# 5. i18n 키 동기화 (양쪽 일치 확인)
node -e "
const ko=require('./src/messages/ko.json'),en=require('./src/messages/en.json');
function f(o,p=''){const r={};for(const k in o){const n=p?p+'.'+k:k;
o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k])?Object.assign(r,f(o[k],n)):r[n]=true}return r}
const a=f(ko),b=f(en);
console.log('only ko:',Object.keys(a).filter(k=>!b[k]));
console.log('only en:',Object.keys(b).filter(k=>!a[k]));"
```

---

## 13. 다음 세션 결정 대기 항목

1. **PR 머지 시점** — 현재 main 미반영. PR 생성 + 리뷰/머지 결정 필요
2. **미마운트 파일 정리** — france-wine, market-stats, france-wine-detail 즉시 삭제할지 보류할지
3. **부르고뉴 진입 시점 시각 검증** — outro fade-out 직후 BurgundySection IntersectionObserver(threshold 0.1) 트리거 타이밍이 자연스러운지 직접 스크롤 검증
4. **Step 4 outro 화살표 모션** — 현재 정적 ↓. Framer motion bouncing 추가 여부

---

**문서 마지막 업데이트.** 2026-05-08 (커밋 `9008a15` 시점)
