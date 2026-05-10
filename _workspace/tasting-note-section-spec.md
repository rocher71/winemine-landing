# Tasting Note 섹션 — 구현 사양 (Claude Code 인수인계)

> **목적.** winemine 랜딩 페이지에 "테이스팅 노트 기록" 경험을 시연하는 새 섹션을 추가한다. 종이 양식 4종(White/Red/Sparkling/Blind) — 사용자 주변 와인 전문가들이 실제로 쓰던 — 을 디지털로 환생시켜, **초보자에게는 5분짜리 즐거운 게임처럼**, **전문가에게는 WSET SAT 호환 + 결함 분석 + 카우달리 측정까지 가능한 정밀 도구**처럼 보이도록 만든다.
>
> **핵심 파일 (예정).** `src/components/sections/tasting-note-section.tsx` (단일 파일, 예상 ~1100줄). 어휘 사전과 결함 카탈로그는 `src/lib/tasting-note-lexicon.ts`로 분리.
>
> **상위 컨텍스트.** `CLAUDE.md` (전체 프로젝트 컨벤션), `_workspace/burgundy-section-spec.md` (전문가 측 섹션, 페어링 모델의 원형), `_workspace/wine-discovery-section-spec.md` (초보자 측 섹션, 헤더 페어링 패턴).
>
> **참조 자료 (외부).**
> - `sample/tasting_note_1~4.png` — 와인 전문가 양식 4종 (White / Red / Sparkling / Blind)
> - `../wine/_workspace/01_sensory_research.md` — 당도·산도·바디·기포 4차원 (WSET 5단계, EU 스파클링 7단계, TA·pH 범위, 압력·제조 방식)
> - `../wine/_workspace/02_flavor_research.md` — UC Davis Aroma Wheel 12카테고리, 1·2·3차 아로마 메커니즘, 품종별 시그니처, 결함 11종, 임팩트 화합물 (Rotundone, TDN, Methoxypyrazine, Linalool, 4MMP …)
> - `../wine/_workspace/03_temporal_research.md` — 카우달리 단위, WSET 3단계 vs Caudalie 4단계, U자형/직선/S자형 숙성 곡선, Tertiary Character 어휘, Peynaud의 PAI

---

## 0. 작업 브랜치

| 항목 | 값 |
|---|---|
| 작업 브랜치 | `dev` (이 브랜치에서만 작업) |
| 머지 대상 | TBD — 사용자 확인 후 main 또는 별도 PR |
| origin 상태 | `dev` 브랜치 push 가능, main 직접 push 금지 |

---

## 1. TL;DR

- **컨셉.** "와인 전문가들이 손글씨로 채우는 그 양식, 카메라 한 번이면 디지털로 끝납니다." 라벨 카메라 → 메타 자동 채움 → 어휘 칩 → 슬라이더 → 부케 휠 → 별점의 풀 흐름을 한 화면에서 시연.
- **양식 토글 4탭.** White Wine / Red Wine / Sparkling / Blind. 각 탭은 종이 양식 4종에 1:1 대응되며, 토글 시 스마트폰 mockup이 부드럽게 morph.
- **3-페어링 헤더 완성.** 기존 두 섹션과 짝을 이루는 의문문:
  - WineDiscovery: "와인을 가볍게 즐기고 싶으신가요?" (초보자)
  - Burgundy: "와인을 깊게 파고드시나요?" (전문가)
  - **TastingNote: "그리고 그 한 잔, 어떻게 기억에 남기시겠어요?" (행동 유도)**
- **위치.** Burgundy 섹션 직후 → VineyardStrip 직전. 전문가 톤(드릴다운)을 받은 후 "그래서 어떻게 기록하느냐"로 자연 연결, VineyardStrip(앨범) 시각으로 다시 부드러워짐.
- **데이터.** 랜딩 단계이므로 실제 저장 X. 모든 입력은 데모 전용. 단, 데이터 모델은 Phase 2 앱이 그대로 받아쓸 수 있도록 견고하게 설계.
- **전문성 시그널.**
  - WSET SAT(Systematic Approach to Tasting) 5단계 강도 척도
  - EU Commission Regulation 607/2009 스파클링 7단계 당도
  - 카우달리(Caudalie) 단위 — Peynaud의 PAI(la persistance aromatique intense)
  - UC Davis Aroma Wheel 12 카테고리 → 2·3차 어휘 위계
  - 결함 11종 체크리스트 (Bouchonné·Brett·VA·Reduction·Oxidation·Lightstruck …)
  - 임팩트 화합물 툴팁 (Rotundone, TDN, Methoxypyrazine 등 한 줄 설명)
- **자동 묘사 문장.** 사용자가 슬라이더·칩을 만질 때마다 "이 와인은 ___ 한 산도와 ___ 한 바디에 ___ 향이 도드라집니다"가 실시간 재생성. 어휘 사전 조합 데모.
- **오프닝 타임라인 (Opening Timeline).** 코르크 따고 일정 시간 둔 뒤 와인이 "열리는(opens up)" 현상을 시간축으로 기록. T0 / 15분 / 30분 / 1시간 / 2시간 / 3시간 / 4시간+ 시점별로 아로마 강도·타닌 부드러움·환원취 유무·새 향 발현을 토글. 사용자가 매긴 ★ Peak 시점을 자동 추천 시간(spec §lexicon)과 비교해 "당신은 영 보르도를 평균보다 30분 빠르게 깨우는 편" 같은 통계 카피 노출. 03_temporal_research.md §2.1·§2.2 직접 인용.

---

## 2. 페이지 구조 변화

**Before (현 dev):** 8 섹션
```
1. Hero
2. WineDiscoverySection
3. BurgundySection
4. VineyardStrip
5. FeaturesSection
6. InstagramPreviewSection
7. HowItWorksSection
8. FinalCTASection
```

**After (이 작업):** 9 섹션
```
1. Hero
2. WineDiscoverySection
3. BurgundySection
4. ★ TastingNoteSection (신규, id="tasting-note")
5. VineyardStrip
6. FeaturesSection
7. InstagramPreviewSection
8. HowItWorksSection
9. FinalCTASection
```

**FloatingCTA 동작.** Burgundy와 동일하게 IntersectionObserver(threshold 0.25)로 `#tasting-note` 영역에서 자동 숨김 (모바일 하단 토글 바와 겹침 방지). 즉 `floating-cta.tsx`의 selector 배열에 `'#tasting-note'` 추가.

---

## 3. XML 스펙 본문

```xml
<project_specification>

<project_name>
TastingNote Section — Expert-Grade Tasting Capture Showcase
</project_name>

<overview>
winemine 랜딩 페이지에 추가되는 9번째(신규 4번째) 섹션. 사용자가 와인을 마시고 기록하는 전 과정을 한 화면 안에서 시연한다. 와인 전문가가 실제로 쓰던 종이 양식 4종 — White Wine Tasting Notes, Red Wine Tasting Notes, Champagne/Sparkling Tasting Notes, Blind Wine Tasting Sheet — 을 디지털로 환생시켜, 라벨 카메라 → 자동 메타 채움 → 어휘 칩 → 슬라이더 → 부케 휠 → 별점 → 자동 묘사 문장 생성의 흐름을 보여준다.

핵심 워크플로 데모는 셋:
(1) **양식 토글 탭** — White/Red/Sparkling/Blind 4종이 같은 골격을 공유하면서 각자 고유한 차원을 추가하는 모습을 시각화한다. White=AROMA·PALATE·STRUCTURE·FINISH·OVERALL·RATING, Red=+TANNIN(강도+질감), Sparkling=+BUBBLES(크기·지속·무쎄), Blind=+VISUAL(색조·농도·점도)+GUESS THE WINE+REVEAL & SCORE.
(2) **어휘 위계 비주얼라이저** — UC Davis Wine Aroma Wheel(Ann C. Noble, 1980s)의 12개 1차 카테고리 → 2·3차 어휘 위계를 클릭형 부케 휠로 표현. hover 시 임팩트 화합물 한 줄 설명이 떠 "이 흑후추 인상은 Rotundone에서 옵니다(역치 16ng/L)"처럼 깊이를 노출.
(3) **카우달리 카운트다운 + 자동 묘사** — Peynaud의 카우달리(1초=1 caudalie) 단위로 피니시 길이를 측정하는 인터랙션과, 사용자가 입력하는 모든 값에 따라 "이 와인은 ___ 한 ___" 묘사 문장이 실시간 갱신되는 데모.

CRITICAL: 이 섹션은 **데모 전용**이다. 사용자 입력은 어디에도 저장되지 않고 컴포넌트 로컬 state로만 살며, 페이지 이탈 시 사라진다. waitlist 가입 외에는 실제 데이터베이스에 쓰는 동작이 없다. 단, 데이터 모델(`TastingNote` 타입)은 Phase 2 iOS/Android 앱이 그대로 받아쓸 수 있도록 견고하게 정의한다.

CRITICAL: 모든 어휘·이론은 검증된 출처에 근거해야 한다. WSET Systematic Approach to Tasting (Level 2/3/Diploma), UC Davis Wine Aroma Wheel, EU Commission Regulation (EC) No 607/2009, Émile Peynaud의 *Le Goût du Vin*, Australian Wine Research Institute(AWRI), Master Sommeliers Grape Variety Profiles. 사내 리서치 문서 3종(`01_sensory_research.md` / `02_flavor_research.md` / `03_temporal_research.md`)은 어휘 사전의 1차 소스다.
</overview>

<scope_boundaries>
  <in_scope>
    - 4탭 양식 토글 (White / Red / Sparkling / Blind)
    - 라벨 카메라 → 메타 자동 채움 인터랙션 (애니메이션만)
    - 어휘 칩 (1차 카테고리 12 + 2·3차 약 200어휘) 토글 선택 UI
    - 슬라이더: 당도, 산도, 바디, 알코올, (Red) 타닌 강도/질감, (Sparkling) 기포 강도/지속/크기
    - 부케 휠 (UC Davis 12 카테고리) 클릭 → 2·3차 어휘 펼침
    - 카우달리 측정 카운트다운 (Tap to start / Tap to stop)
    - 결함 체크리스트 11종 (Bouchonné, Brett, VA, Reduction …)
    - 자동 묘사 문장 실시간 생성 (어휘 사전 조합)
    - 5점 별점 (와인글라스 SVG 사용 — 부르고뉴 섹션 `WineGlassRating` 재사용)
    - Blind 모드: 품종/지역/빈티지/가격 추정 → 정답 공개 시 점수
    - 한영 토글 (어휘 표시 언어 — `useLocale()` 훅 활용)
    - 임팩트 화합물 hover 툴팁 (Rotundone, TDN, Methoxypyrazine, Linalool, 4MMP, IBMP, Geraniol, Diacetyl)
    - **오프닝 타임라인 (Opening Timeline)** — 코르크 오픈 시점부터 시간축에 따라 8개 timepoint(T0 / 15m / 30m / 1h / 2h / 3h / 4h / 6h+)에 시음 인상 기록. 각 timepoint마다 아로마 강도·타닌 부드러움·환원취 유무·신규 발현 향 토글. ★ Peak marker로 사용자가 매긴 최적 시점 표시. 와인 타입별 권장 디캔팅 시간 자동 안내 (영 풀바디 레드 1–3h, 영 미디엄 30–60m, 매우 오래된 레드 즉시 음용 등)
    - 모바일 반응형 (PC: 좌 mockup + 우 부케휠+슬라이더 / 모바일: 세로 스택 + 양식 탭 sticky)
    - i18n: ko.json + en.json 동시 작성, 키 구조 동기화
  </in_scope>
  <out_of_scope>
    - 실제 사진 업로드 / 카메라 활성화 (애니메이션만, 권한 요청 없음)
    - 와인 라벨 OCR / AI 분석 백엔드 호출
    - Supabase 저장 / waitlist 외 데이터베이스 쓰기
    - 사용자 계정 / 로그인 / 프로필
    - 실제 와인 데이터베이스 검색 (Wine Searcher, Vivino API 등)
    - 빈티지 차트 / 가격 추적
    - 소셜 공유 (해당 기능은 InstagramPreviewSection이 담당)
    - 음성 입력 / TTS
    - 와인 쌍수 페어링 / 음식 매칭 추천
    - PDF/CSV 내보내기
    - WSET Level 4 Diploma의 분석적 평가 점수표(Quality Level)
  </out_of_scope>
  <future_considerations>
    - Phase 2 (앱 출시 시): 본 데모의 `TastingNote` 데이터 모델을 그대로 채택, Supabase `tasting_notes` 테이블 + RLS 정책 + 사용자별 노트 컬렉션
    - Phase 2: 라벨 OCR (Google Cloud Vision) 또는 자체 모델로 Producer/Vintage/Region 자동 추출
    - Phase 2: AI 부케 분석 (사용자 칩 선택 + 슬라이더 입력 → LLM이 자연어 시음노트 작성)
    - Phase 3: 빈티지 비교 (같은 와인의 여러 빈티지 노트 timeline 시각화)
    - Phase 3: 결함 학습 모드 (각 결함의 화학·감각 메커니즘 인터랙티브 강의)
    - Phase 3: 카우달리 베스트 50 — 사용자 셀러에서 가장 긴 피니시 와인 자동 랭킹
    - Phase 4: WSET 시험 대비 모드 (Blind 모드의 채점 기준을 WSET SAT 정답표에 맞춤)
  </future_considerations>
</scope_boundaries>

<technology_stack>
  <frontend_application>
    <framework>Next.js 15 App Router (기존 winemine 스택)</framework>
    <language>TypeScript 5.7 strict mode</language>
    <styling>Tailwind CSS v4 (globals.css에 `@theme` 토큰 등록)</styling>
    <state_management>React useState/useReducer — Context는 필요 없음 (섹션 자체가 단일 컴포넌트 트리)</state_management>
  </frontend_application>
  <libraries>
    <animation>Framer Motion v12 — `motion`, `AnimatePresence`, `useTransform`, `useMotionValue` 사용. 부케 휠 회전·morph, mockup 탭 전환, 카우달리 카운트다운 progress ring</animation>
    <icons>lucide-react — Camera, Sparkles, Wine, Target, ChevronRight, Check, AlertTriangle, RefreshCw, Eye, EyeOff, Award</icons>
    <i18n>기존 `LocaleProvider` + `useLocale()` 훅 (CLAUDE.md §i18n 시스템 참조). 신규 키는 `tastingNote.*` 네임스페이스</i18n>
  </libraries>
  <data_layer>
    <storage>없음 — 컴포넌트 로컬 state (`useState`/`useReducer`)만 사용. 페이지 이탈 시 데이터 사라짐</storage>
    <lexicon>정적 TS 파일 `src/lib/tasting-note-lexicon.ts` — 어휘 위계, 결함 카탈로그, 임팩트 화합물 사전, 슬라이더 라벨, 묘사 템플릿</lexicon>
    <note>CRITICAL: Server Action / API 호출 없음. SSR 안전 — 모든 인터랙션이 클라이언트 측. 단, 컴포넌트 자체는 `'use client'` 선언 필수 (Framer Motion + state)</note>
  </data_layer>
  <build_output>
    <build_command>npm run build (기존 winemine 빌드 그대로)</build_command>
    <bundle_impact>예상 +25KB gzipped (어휘 사전 ~12KB + 컴포넌트 ~13KB). Lighthouse 성능 영향 무시할 만한 수준</bundle_impact>
    <note>어휘 사전이 번들에 포함되므로 한·영 모두 번들에 들어간다. 200어휘 × 2언어 × 평균 12자 = 약 5KB 텍스트. 압축 후 미미</note>
  </build_output>
</technology_stack>

<prerequisites>
  <environment_setup>
    - Node.js 20.x (winemine 표준)
    - 기존 winemine 의존성 그대로 (추가 npm install 불필요)
  </environment_setup>
  <build_configuration>
    - 별도 plugin 추가 없음
    - Tailwind v4 `@theme`에 신규 색 토큰만 추가 (gold-aroma, gold-palate 등 — §10 참조)
  </build_configuration>
</prerequisites>

<environment_variables>
  <note>이 섹션은 새 환경 변수를 도입하지 않는다. 기존 winemine 환경 변수(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SLACK_WEBHOOK_URL, NEXT_PUBLIC_SITE_URL)를 그대로 사용</note>
</environment_variables>

<file_structure>
src/
├── app/
│   └── page.tsx                              # ★ TastingNoteSection import & 마운트 추가
├── components/
│   ├── sections/
│   │   └── tasting-note-section.tsx          # ★ 신규 — 이 섹션의 거의 모든 것 (~1100줄)
│   └── ui/
│       └── floating-cta.tsx                  # ★ selector 배열에 '#tasting-note' 추가
├── lib/
│   └── tasting-note-lexicon.ts               # ★ 신규 — 어휘 사전, 결함 카탈로그, 묘사 템플릿
├── messages/
│   ├── ko.json                                # ★ tastingNote.* 키 추가
│   └── en.json                                # ★ ko와 동기화하여 동일 키 추가
└── types/
    └── (별도 타입 파일 없음 — TastingNote 타입은 lexicon.ts 안에 export)
</file_structure>

<core_data_entities>

<tasting_note_entity>
**`TastingNote` — 데모 입력의 데이터 모델 (Phase 2 앱이 그대로 채택할 모델)**

```ts
type WineColor = 'white' | 'red' | 'sparkling' | 'blind';
type FormVariant = WineColor;          // 양식 탭과 1:1
type Locale = 'ko' | 'en';

// WSET 5단계 강도 (Sweetness/Acidity/Body/Tannin/Alcohol/Intensity 모두 공유)
type WSETScale =
  | 'low'         // Light / Low
  | 'mediumMinus' // Medium-
  | 'medium'      // Medium
  | 'mediumPlus'  // Medium+
  | 'high';       // High / Full

// EU Commission Regulation 607/2009 스파클링 당도
type SparklingDosage =
  | 'brutNature'  // < 3 g/L (도사주 무첨가)
  | 'extraBrut'   // 0–6 g/L
  | 'brut'        // < 12 g/L
  | 'extraDry'    // 12–17 g/L
  | 'sec'         // 17–32 g/L
  | 'demiSec'     // 32–50 g/L
  | 'doux';       // > 50 g/L

// Caudalie 4단계 (Peynaud)
type FinishLength =
  | 'short'    // < 3 caudalies
  | 'medium'   // 3–5
  | 'long'     // 5–10
  | 'veryLong'; // > 10

// 타닌 질감 (02_flavor_research.md §3.1 — 부드러운 → 거친 순)
type TanninTexture =
  | 'silky' | 'velvety' | 'smooth' | 'plush' | 'soft' | 'round'
  | 'fineGrained' | 'polished' | 'powdery' | 'dusty' | 'chalky'
  | 'grainy' | 'grippy' | 'firm' | 'chewy' | 'coarse' | 'rough'
  | 'harsh' | 'astringent' | 'drying' | 'aggressive';

// 기포 (Sparkling) — 03 §4.4
type BubbleSize = 'fine' | 'medium' | 'coarse';
type BubblePersistence = 'fleeting' | 'steady' | 'persistent' | 'continuous';
type MousseTexture = 'creamy' | 'silky' | 'frothy' | 'soft' | 'aggressive';

// 결함 11종 (02 §2.4)
type Fault =
  | 'corked'        // TCA — 부쇼네
  | 'brett'         // 4-EP/4-EG — 마구간·반창고
  | 'volatileAcidity' // 식초·매니큐어
  | 'reduction'     // H₂S — 썩은 달걀
  | 'oxidation'     // 멍든 사과·셰리
  | 'heat'          // Maderization
  | 'mercaptan'     // 양배추·마늘
  | 'lightstruck'   // UV 노출
  | 'geranium'      // 으깬 제라늄
  | 'mousy'         // 쥐장
  | 'cork';         // 일반 코르크 결함

interface TastingNote {
  // ───── 메타데이터 (모든 양식 공통)
  id: string;                 // uuid (앱에서는 서버 생성, 데모에서는 nanoid)
  createdAt: string;          // ISO 8601
  variant: FormVariant;       // white/red/sparkling/blind

  // ───── Step 1: 라벨 인식 결과 (데모에서는 mock)
  wineName: string;           // ex. "Domaine Leflaive Puligny-Montrachet 1er Cru Les Pucelles"
  producer: string;           // ex. "Domaine Leflaive"
  vintage: number | null;     // 1950–현재. null이면 NV
  region: string;             // ex. "Burgundy / Côte de Beaune / Puligny-Montrachet"
  appellation: string | null; // ex. "Puligny-Montrachet 1er Cru"
  grapeVarieties: string[];   // ex. ["Chardonnay 100%"]
  pricePaid: number | null;   // KRW
  drinkingPlace: string | null; // ex. "집 / 와인바 / 식당"
  servingFormat: 'bottle' | 'glass' | 'half' | 'magnum';

  // ───── Step 2: VISUAL (Blind 모드 전용 + 일반 양식에서도 옵션)
  visual: {
    hue: string;              // 12색 색조 팔레트에서 선택 (lemon, gold, amber / ruby, garnet, tawny …)
    depth: 'pale' | 'medium' | 'deep';
    clarity: 'clear' | 'hazy';
    legs: 'thin' | 'medium' | 'thick'; // 점도 — 알코올+추출물 인상
  } | null;

  // ───── Step 3: AROMA (모든 양식 공통)
  aroma: {
    intensity: WSETScale;     // light / medium- / medium / medium+ / pronounced
    primary: string[];        // 1차 향 키워드 ID (lexicon.ts에 정의된 ID 참조)
    secondary: string[];      // 2차 향 키워드 ID
    tertiary: string[];       // 3차 향 키워드 ID
    notes: string;            // 자유 텍스트
  };

  // ───── Step 4: PALATE (양식별 분기)
  palate: {
    sweetness: WSETScale;             // 모든 양식 공통
    acidity: WSETScale;               // 모든 양식 공통
    body: WSETScale;                  // 모든 양식 공통
    alcohol: WSETScale;               // 모든 양식 공통
    flavorIntensity: WSETScale;
    flavorNotes: string[];            // 키워드 ID 다중 선택
    tannin?: {                        // ⭐ Red 전용
      intensity: WSETScale;
      texture: TanninTexture;
      ripeness: 'unripe' | 'ripe' | 'overripe';
    };
    bubbles?: {                       // ⭐ Sparkling 전용
      size: BubbleSize;
      persistence: BubblePersistence;
      mousse: MousseTexture;
      pressure: number;               // bar (1–6 표기)
      method: 'traditional' | 'charmat' | 'asti' | 'ancestral' | 'unknown';
    };
    sparklingDosage?: SparklingDosage; // ⭐ Sparkling 전용 — EU 7단계
  };

  // ───── Step 5: FINISH
  finish: {
    length: FinishLength;     // Caudalie 4단계
    caudalies: number | null; // 사용자가 측정한 실제 초 수 (선택 사항)
    quality: ('clean' | 'persistent' | 'complex' | 'balanced' | 'harmonious'
            | 'mineral' | 'fresh' | 'seamless' | 'elegant' | 'short'
            | 'abrupt' | 'bitter' | 'hot' | 'hollow' | 'drying'
            | 'astringent' | 'flat' | 'watery')[];
    descriptor: string;       // 자유 텍스트
  };

  // ───── Step 6: STRUCTURE (양식 1·2 하단의 슬라이더 컴포지트)
  structure: {
    balance: number;          // 0–100
    complexity: number;       // 0–100
    typicity: number;         // 0–100 (품종·지역다움)
  };

  // ───── Step 7: FAULTS (전문가 옵션)
  faults: Fault[];

  // ───── Step 7.5: EVOLUTION — 시간축에 따른 변화 기록 (Opening up / Aeration)
  // 03_temporal_research.md §2.1 (잔 내 변화) + §2.2 (디캔팅 효과) 직접 반영
  evolution: {
    openedAt: string | null;           // ISO 8601 — 코르크 오픈 시각. null이면 미추적
    decanted: boolean;                 // 디캔팅 여부
    timepoints: EvolutionPoint[];      // 시점별 시음 인상 배열
    peakIndex: number | null;          // timepoints 배열 중 사용자가 ★ 표시한 Peak 인덱스
    notes: string;                     // 자유 텍스트 (예: "30분 시점에 환원취가 사라지고 검은체리가 폭발")
  };

  // ───── Step 8: OVERALL & RATING
  overall: {
    impression: string;       // 자유 텍스트 (자동 묘사 문장의 결과 또는 사용자 편집)
    rating: 1 | 2 | 3 | 4 | 5;
    wouldBuyAgain: boolean | null;
  };

  // ───── Step 9: BLIND 모드 전용 (variant === 'blind')
  blindGuess?: {
    grapeVariety: string | null;
    region: string | null;
    country: string | null;
    vintageGuess: number | null;
    priceRangeKRW: '~30k' | '30–60k' | '60–100k' | '100–200k' | '200k+' | null;
    score: number | null;     // 0–100 자동 채점 결과
  };
}

interface EvolutionPoint {
  // 8개 표준 timepoint 또는 사용자 임의 분 단위
  minutesAfterOpen: number;            // 0, 15, 30, 60, 120, 180, 240, 360 — 또는 사용자 입력 분
  label: string;                       // 'T0' / '15분' / '1시간' / '2시간' / '3시간' / '4시간+' / '6시간+' 등
  aromaIntensityDelta: -2 | -1 | 0 | 1 | 2;   // T0 대비 향 강도 변화 (-2 매우 닫힘 → +2 매우 열림)
  tanninSoftnessDelta: -2 | -1 | 0 | 1 | 2;   // T0 대비 타닌 부드러움 변화 (Red 전용)
  bodyDelta: -2 | -1 | 0 | 1 | 2;             // T0 대비 바디 변화
  reductionPresent: boolean;           // 이 시점에 환원취가 느껴지는가 (성냥·고무·H₂S·양배추)
  newAromasEmerged: string[];          // 이 시점에서 새로 등장한 향 키워드 ID (lexicon 참조)
  overallScore: 1 | 2 | 3 | 4 | 5;     // 이 시점의 전반 점수 (peakIndex 자동 추천에 사용)
  note: string;                        // 자유 텍스트 한 줄 (예: "검은 체리 폭발")
}
```

**필드 계약 (Phase 2 통합 시).**
- `intensity` 척도는 항상 WSET 5단계 enum. 한국어 라벨은 i18n 키 `tastingNote.scale.{value}` 참조
- `caudalies` 필드는 정수 초 단위. 측정 미실시면 null
- `faults` 배열은 비어있을 수 있음(결함 없음). **CRITICAL:** 결함은 명시적 사용자 체크가 있을 때만 기록 — 자동 추론 금지
- 모든 키워드 ID는 `tasting-note-lexicon.ts`의 enum과 일치해야 함 (Phase 2에서 카탈로그 변경 시 마이그레이션 필요)

</tasting_note_entity>

<lexicon_entity>
**`tasting-note-lexicon.ts` — 어휘 사전 / 결함 카탈로그 / 묘사 템플릿**

```ts
// 1차 카테고리 (UC Davis Wine Aroma Wheel — Ann C. Noble 1980s)
export const AROMA_CATEGORIES = [
  { id: 'fruity',        ko: '과일',       en: 'Fruity',        color: '#C9A84C', icon: '🍒' },
  { id: 'floral',        ko: '꽃',         en: 'Floral',        color: '#E8B4D2', icon: '🌹' },
  { id: 'spicy',         ko: '향신료',      en: 'Spicy',         color: '#A05A3D', icon: '🌶' },
  { id: 'herbaceous',    ko: '허브·식물',   en: 'Herbaceous',    color: '#7A8B5C', icon: '🌿' },
  { id: 'nutty',         ko: '견과',       en: 'Nutty',         color: '#8B6B47', icon: '🌰' },
  { id: 'caramelized',   ko: '캐러멜',     en: 'Caramelized',   color: '#6B4423', icon: '🍯' },
  { id: 'woody',         ko: '나무·오크',  en: 'Woody',         color: '#5C3A1E', icon: '🪵' },
  { id: 'earthy',        ko: '흙',         en: 'Earthy',        color: '#4A3D32', icon: '🍂' },
  { id: 'chemical',      ko: '화학',       en: 'Chemical',      color: '#6A5D7B', icon: '🧪' },
  { id: 'pungent',       ko: '자극',       en: 'Pungent',       color: '#8B1A2A', icon: '🔥' },
  { id: 'oxidized',      ko: '산화·셰리',  en: 'Oxidized',      color: '#7B5C3A', icon: '🥃' },
  { id: 'microbiological', ko: '미생물',   en: 'Microbiological', color: '#5C5C5C', icon: '🧬' },
] as const;

// 2·3차 어휘 (각 1차 카테고리당 약 15–25 어휘 — 총 약 200)
// 위계 예시 (fruity)
//
//   fruity
//   ├── citrus       — 레몬, 자몽, 라임, 오렌지껍질, 탄제린
//   ├── tree-fruit   — 사과, 배, 복숭아, 살구, 모과
//   ├── red-berry    — 딸기, 라즈베리, 붉은체리, 크랜베리
//   ├── black-berry  — 블랙베리, 블루베리, 블랙체리, 카시스
//   ├── tropical     — 파인애플, 망고, 리치, 패션프루트, 바나나
//   └── dried-fruit  — 건포도, 건자두, 건무화과, 대추야자
//
// 각 어휘는 다음 형태:
type LexEntry = {
  id: string;           // 'lemon' / 'cassis' / 'tar'
  category: AromaCategoryId;
  subcategory: string;  // 'citrus' / 'black-berry' / 'tar'
  ko: string;
  en: string;
  appliesTo: WineColor[]; // ['white'] | ['red'] | ['white','red'] …
  // 임팩트 화합물 (해당 어휘가 특정 화합물 마커일 때)
  impactCompound?: {
    name: string;       // 'Rotundone'
    threshold: string;  // '16 ng/L'
    note: string;       // '극히 낮은 역치 — 흑후추 인상'
    foundIn: string[];  // ['Syrah/Shiraz', 'Grüner Veltliner']
  };
};

// 결함 11종 (02_flavor_research.md §2.4)
export const FAULTS: FaultEntry[] = [
  {
    id: 'corked',
    ko: '코르크 오염 (Bouchonné)',
    en: 'Cork Taint',
    cause: 'TCA (2,4,6-Trichloroanisole)',
    threshold: '~1.5 ng/L',
    aroma: '젖은 골판지, 곰팡이, 젖은 신문지, 눅눅한 지하실. 과일 향이 죽음',
  },
  {
    id: 'brett',
    ko: '브렛 (Brettanomyces)',
    en: 'Brett',
    cause: '4-에틸페놀, 4-에틸과이아콜',
    threshold: '4-EP ~600 µg/L',
    aroma: '마구간, 말 안장, 반창고, 훈제 베이컨 — 저농도에서 복합성, 고농도에서 결함',
  },
  // … 9개 더 (Volatile Acidity, Reduction, Oxidation, Heat, Mercaptan, Lightstruck, Geranium, Mousy, Cork)
];

// 임팩트 화합물 사전 (hover 툴팁용)
export const IMPACT_COMPOUNDS: ImpactEntry[] = [
  {
    name: 'Rotundone',
    chemistry: 'Sesquiterpene',
    threshold: '16 ng/L',
    note: '극히 낮은 역치. 흑후추(Syrah/Shiraz, Duras) 또는 흰후추(Grüner Veltliner) 인상',
    primaryFor: ['black-pepper', 'white-pepper'],
  },
  {
    name: 'TDN',
    chemistry: '1,1,6-Trimethyl-1,2-dihydronaphthalene (Norisoprenoid)',
    threshold: '~20 µg/L',
    note: '카로테노이드 가수분해 산물. 숙성 리슬링의 휘발유·등유 인상',
    primaryFor: ['petrol', 'kerosene'],
  },
  {
    name: 'Methoxypyrazine (IBMP)',
    chemistry: '3-Isobutyl-2-methoxypyrazine',
    threshold: '~2 ng/L',
    note: '피망·풀·아스파라거스. Cab Sauv·SB·Cab Franc·Carmenère 마커',
    primaryFor: ['bell-pepper', 'grass', 'asparagus'],
  },
  // … Linalool, Geraniol, cis-Rose Oxide, β-Damascenone, 3MH, 4MMP, Diacetyl, DMS, Acetaldehyde
];

// 와인 타입별 권장 오픈/디캔팅 시간 — 03_temporal_research.md §2.2 직접 인용
// 사용자가 매긴 ★ Peak 시점을 이 권장 범위와 비교하여 통계 카피 생성
export const OPENING_GUIDE: OpeningGuideEntry[] = [
  {
    id: 'young-full-red',
    ko: '영(young) 풀바디 레드',
    en: 'Young Full-bodied Red',
    examples: ['Cabernet Sauvignon (Bordeaux Grand Cru)', 'Barolo', 'Brunello', '북부 론 Syrah (Hermitage·Côte-Rôtie)'],
    recommendedMinutes: { min: 60, peak: 120, max: 180 },
    rationale: '단단한 타닌 + 닫힌 과일감. 광구 디캔터에서 1~3시간 권장. 환원취가 흔한 북부 론 Syrah는 더 길게.',
  },
  {
    id: 'young-medium-red',
    ko: '영 미디엄바디 레드',
    en: 'Young Medium-bodied Red',
    examples: ['Merlot', 'Tempranillo (Crianza)', 'Chianti'],
    recommendedMinutes: { min: 30, peak: 45, max: 60 },
    rationale: '타닌이 적당히 풀려있어 30~60분이면 충분. 잔에서만 풀어줘도 OK.',
  },
  {
    id: 'young-light-red',
    ko: '영 라이트바디 레드',
    en: 'Young Light-bodied Red',
    examples: ['Pinot Noir (Burgundy Village 이하)', 'Gamay (Beaujolais)', 'Frappato'],
    recommendedMinutes: { min: 15, peak: 20, max: 30 },
    rationale: '디캔팅보다는 잔 안에서 15~30분. 과도한 산소 노출은 섬세한 향 손상.',
  },
  {
    id: 'aged-red-10-20',
    ko: '숙성 레드 (10~20년)',
    en: 'Aged Red (10-20 years)',
    examples: ['숙성 Bordeaux', '숙성 Rioja Gran Reserva', '숙성 Brunello'],
    recommendedMinutes: { min: 20, peak: 30, max: 45 },
    rationale: '침전물 제거가 주 목적. 짧게 디캔팅하거나 코르크만 빼고 잔에 따라 마시기.',
  },
  {
    id: 'very-old-red',
    ko: '매우 오래된 레드 (35년+)',
    en: 'Very Old Red (35+ years)',
    examples: ['1990 이전 Bordeaux', '1980 이전 Barolo', '빈티지 Mature Burgundy'],
    recommendedMinutes: { min: 0, peak: 5, max: 15 },
    rationale: '이미 산화 진행됨. 코르크 풀고 즉시 음용. 디캔팅하면 무너짐(falling apart) 위험.',
  },
  {
    id: 'vintage-port',
    ko: '빈티지 포트',
    en: 'Vintage Port',
    examples: ['Vintage Port', 'LBV Unfiltered'],
    recommendedMinutes: { min: 120, peak: 180, max: 240 },
    rationale: '높은 알코올+페놀로 보호받음. 2~4시간 디캔팅 가능. 침전물 제거 필수.',
  },
  {
    id: 'young-full-white',
    ko: '영 풀바디 화이트',
    en: 'Young Full-bodied White',
    examples: ['오크 숙성 Chardonnay (Napa·Burgundy Grand Cru)', 'White Hermitage'],
    recommendedMinutes: { min: 15, peak: 25, max: 45 },
    rationale: '오크 위에 묻힌 과일감을 풀어주려면 짧게 디캔팅. 너무 길면 산도 손실.',
  },
  {
    id: 'aromatic-white',
    ko: '아로마틱 화이트 / 일반 화이트',
    en: 'Aromatic / Standard White',
    examples: ['Riesling', 'Sauvignon Blanc', 'Pinot Grigio', 'Albariño'],
    recommendedMinutes: { min: 0, peak: 5, max: 15 },
    rationale: '디캔팅 비권장. 잔에 따라 즉시 음용. 산소 노출이 신선한 향을 손상.',
  },
  {
    id: 'sparkling',
    ko: '스파클링',
    en: 'Sparkling',
    examples: ['Champagne', 'Cava', 'Prosecco', 'Crémant'],
    recommendedMinutes: { min: 0, peak: 0, max: 10 },
    rationale: '디캔팅 절대 금지 — 기포·산도 손실. 잔에 따라 즉시. 단, 빈티지 샴페인은 잔에서 5~10분 풀어주면 자가분해 향이 더 펼쳐짐.',
  },
];

interface OpeningGuideEntry {
  id: string;
  ko: string;
  en: string;
  examples: string[];
  recommendedMinutes: { min: number; peak: number; max: number };
  rationale: string;
}

// 표준 8 timepoint — Opening Timeline 컴포넌트의 기본 분기점
export const TIMEPOINT_PRESETS = [
  { minutes: 0,   label: 'T0' },         // 코르크 오픈 직후
  { minutes: 15,  label: '15분' },
  { minutes: 30,  label: '30분' },
  { minutes: 60,  label: '1시간' },
  { minutes: 120, label: '2시간' },
  { minutes: 180, label: '3시간' },
  { minutes: 240, label: '4시간' },
  { minutes: 360, label: '6시간+' },
] as const;

// 묘사 템플릿 (자동 문장 생성용)
export const DESCRIPTION_TEMPLATES = {
  ko: {
    intro: ['{vintage}년 {region} {producer}의 {wineName}.', '{wineName} ({vintage}). {region}.'],
    aroma: ['{intensity}한 향에 {primary} 노트가 도드라지고, {secondary}가 뒤를 받칩니다.'],
    palate: ['입안에서는 {body} 바디에 {acidity}한 산도, {sweetness} 단맛이 어우러집니다.'],
    redTannin: ['타닌은 {tannin}하게 짜여 {tanninTexture} 인상을 남깁니다.'],
    sparkling: ['{bubbleSize} 기포가 {persistence}하게 올라오며 {mousse} 무쎄를 만듭니다.'],
    finish: ['{caudalies} 카우달리({finishLength})의 피니시. {finishQuality}한 마무리.'],
  },
  en: { /* same shape */ },
} as const;
```

</lexicon_entity>

</core_data_entities>

<authentication>
  <note>이 섹션은 인증을 사용하지 않는다. 데모 전용이며 어떤 데이터도 서버에 쓰지 않는다.</note>
</authentication>

<route_definitions>
  <note>별도 라우트를 추가하지 않는다. 기존 `/` 랜딩 페이지의 한 섹션으로만 마운트된다. URL fragment `#tasting-note`로 직접 점프 가능 (기존 부르고뉴 `#burgundy` 패턴과 동일).</note>
</route_definitions>

<component_hierarchy>

```xml
<TastingNoteSection> <!-- default export, 'use client', state hub -->
  <SectionHeader>
    <eyebrow text="기록" />                    <!-- gold accent -->
    <heading text="그리고 그 한 잔, 어떻게 기억에 남기시겠어요?" /> <!-- 페어링 의문문 -->
    <description text="와인 전문가들이 손글씨로 채우는 그 양식, 카메라 한 번이면 디지털로 끝납니다." />
  </SectionHeader>

  <FormTabBar> <!-- White / Red / Sparkling / Blind. sticky on mobile -->
    <Tab variant="white"    icon="🥂" />
    <Tab variant="red"      icon="🍷" />
    <Tab variant="sparkling" icon="✨" />
    <Tab variant="blind"    icon="🎯" />
  </FormTabBar>

  <DesktopLayout> <!-- ≥1024px -->
    <LeftCanvas> <!-- 40% width, sticky 80px from top -->
      <PhoneMockup>
        <AnimatePresence mode="wait" key={variant}>
          <FormPaperRender variant={variant}>
            <!-- 4종 양식의 종이 느낌 가짜 렌더 — 메타 채워지는 시퀀스 애니메이션 -->
            <MetadataBlock />        <!-- DATE, NAME, PRODUCER, VINTAGE, REGION, GRAPE, PRICE, BOTTLE -->
            <AromaBlock />           <!-- 5–6개 카테고리 체크박스 (양식 종류에 따라 변형) -->
            <PalateBlock />          <!-- WSET 슬라이더 4–5개 (variant에 따라 추가) -->
            <StructureBars />        <!-- 4 슬라이더 -->
            <FinishBlock />
            <OverallBlock />
            <RatingStars />
          </FormPaperRender>
        </AnimatePresence>
      </PhoneMockup>
      <CameraOverlay />              <!-- 사용자 hover/tap 시 라벨 카메라 시뮬레이션 -->
    </LeftCanvas>

    <RightCanvas> <!-- 60% width, scroll 동기 -->
      <Step1 id="capture">
        <CameraDemo />               <!-- "라벨을 비추세요" — 가짜 OCR 결과 채워지기 -->
        <MetadataReveal />           <!-- Producer/Vintage/Region이 한 글자씩 fade-in -->
      </Step1>

      <Step2 id="aroma" title="아로마 — UC Davis Wheel">
        <AromaWheel>
          <CenterDot />              <!-- 와인 잔 SVG 중앙 -->
          <CategoryRing>
            <!-- 12 카테고리 wedge, 각 wedge hover/click 시 -->
            {AROMA_CATEGORIES.map((cat, i) => (
              <CategoryWedge id={cat.id} angle={i * 30} color={cat.color} />
            ))}
          </CategoryRing>
          <SubcategoryPanel />       <!-- 선택된 카테고리의 2·3차 어휘 칩 -->
          <ImpactCompoundTooltip />  <!-- 어휘 hover 시 화합물 한 줄 -->
        </AromaWheel>
        <LangToggle ko/en />
      </Step2>

      <Step3 id="palate" title="미각 — WSET 5단계">
        <SliderRow label="당도"   scale={WSETScale} />
        <SliderRow label="산도"   scale={WSETScale} />
        <SliderRow label="바디"   scale={WSETScale} />
        <SliderRow label="알코올" scale={WSETScale} />
        {variant === 'red' && <TanninPanel />}
        {variant === 'sparkling' && <BubblePanel />}
        {variant === 'sparkling' && <DosageSelect />}
      </Step3>

      <Step4 id="finish" title="피니시 — Caudalie">
        <CaudalieMeter>            <!-- Tap to start / 1초마다 카운트, Tap to stop -->
          <ProgressRing />
          <NumberDisplay />        <!-- ex. "8 caudalies" -->
          <CategoryLabel />        <!-- "Long category — Bordeaux Grand Cru 평균" -->
        </CaudalieMeter>
        <QualityChips />           <!-- clean·persistent·complex·balanced …·hot·hollow -->
      </Step4>

      <Step5 id="faults" title="결함 점검" collapsible>
        <FaultChecklist>            <!-- 11종, 클릭하면 화합물·향·메커니즘 펼침 -->
          <FaultItem id="corked" />
          <!-- … -->
        </FaultChecklist>
      </Step5>

      <Step5_5 id="opening-timeline" title="오프닝 타임라인 · Opening Timeline" collapsible>
        <OpeningTimeline>           <!-- 가로 타임라인 8 timepoints + 라이브 타이머 -->
          <DecantToggle />          <!-- 디캔팅 사용 여부 -->
          <OpenedAtPicker />        <!-- 코르크 오픈 시각 (now / 직접 입력) -->
          <LiveTimerChip />         <!-- T+0:42:15 같은 라이브 표시 (옵션) -->
          <TimelineTrack>           <!-- 가로 막대 8 dot -->
            {TIMEPOINT_PRESETS.map(tp => (
              <TimepointDot
                minutes={tp.minutes}
                label={tp.label}
                state="empty | recording | filled | peak"
              />
            ))}
            <CustomTimepointAdder /> <!-- 사용자 임의 분 추가 -->
          </TimelineTrack>
          <ActiveTimepointPanel>     <!-- 선택된 timepoint의 입력 폼 -->
            <DeltaSlider dim="aromaIntensity" range={-2..+2} />
            <DeltaSlider dim="tanninSoftness" range={-2..+2} variant="red-only" />
            <DeltaSlider dim="body"           range={-2..+2} />
            <ReductionToggle />     <!-- 환원취 유무 + hover 시 향 예시 안내 -->
            <NewAromasMultiSelect /> <!-- 부케 휠 어휘에서 새로 등장한 향 다중 선택 -->
            <ScoreStars />          <!-- 1-5 -->
            <NoteInput />           <!-- 한 줄 -->
            <PeakStarToggle />      <!-- ★ 이 시점이 정점 -->
          </ActiveTimepointPanel>
          <RecommendationCard>      <!-- OPENING_GUIDE 매칭 카드 -->
            <!-- "당신의 와인 타입은 '영 풀바디 레드' — 권장 1~3시간, 평균 Peak 2시간" -->
            <!-- 사용자 Peak 기록과 비교: "당신은 평균보다 30분 빠르게 깨우는 편" -->
          </RecommendationCard>
          <EvolutionChart>          <!-- 라인 차트 — timepoint × 점수 -->
          </EvolutionChart>
        </OpeningTimeline>
      </Step5_5>

      <Step6 id="rating">
        <AutoDescription />         <!-- 자동 묘사 문장 (입력에 따라 실시간 갱신) -->
        <RatingStars />             <!-- 5점, WineGlass SVG (부르고뉴 재사용) -->
        <SaveCTA />                 <!-- "이 노트, 앱에서 진짜로 저장해 보기" → onOpenModal -->
      </Step6>

      {variant === 'blind' && (
        <Step7Blind>
          <GuessForm />             <!-- 품종/지역/빈티지/가격 추정 -->
          <RevealButton />          <!-- 클릭 시 정답 + 점수 -->
          <ScoreCard />
        </Step7Blind>
      )}
    </RightCanvas>
  </DesktopLayout>

  <MobileLayout> <!-- <1024px -->
    <FormTabBar sticky />          <!-- 화면 상단 고정 -->
    <PhoneMockup compact />        <!-- 위, 50vh -->
    <ScrollSteps>                  <!-- 아래, 세로로 step 1~6 (Blind는 7) -->
      <!-- 동일 컴포넌트들, 세로 stack -->
    </ScrollSteps>
  </MobileLayout>

  <SectionFooter>
    <OutroCopy>당신의 셀러에 50병이 쌓인 어느 날, 우리는 그 50병을 한 줄로 정리해 드립니다.</OutroCopy>
    <SecondaryCTA onClick={onOpenModal}>웨이팅 리스트에 등록</SecondaryCTA>
  </SectionFooter>
</TastingNoteSection>
```

**Provider/Context.** 신규 Context 없음. 기존 `LocaleProvider` (`useLocale()`) 만 사용. 모든 state는 `TastingNoteSection` 자체의 useReducer.

</component_hierarchy>

<pages_and_interfaces>

<section_layout>
**위치 & 그리드.**
- 페이지 안 9번째 섹션 중 4번째 (Burgundy 직후, VineyardStrip 직전)
- 컨테이너: `max-w-6xl mx-auto px-6` (기존 섹션 표준)
- 세로 패딩: `py-24 lg:py-32`
- ID: `id="tasting-note"` (FloatingCTA selector + URL hash 점프용)
- 배경: `bg-[#0A050F]` (Deep Dark — Hero·Burgundy 사이 톤과 일치)
- 상단 구분선: 12px 골드 hairline (`border-t border-[#C9A84C]/12`)
</section_layout>

<section_header>
**구조 (모든 화면).**
- Eyebrow text: `tastingNote.eyebrow` = "기록 / Capture"
  - 폰트: Inter, 12px, letter-spacing: 0.18em, uppercase
  - 색상: `#C9A84C` (Gold)
  - 좌우 hairline 8px
- Heading: `tastingNote.heading` = "그리고 그 한 잔, 어떻게 기억에 남기시겠어요?"
  - 폰트: Playfair Display, `clamp(28px, 5vw, 48px)`
  - 색상: `#F5F0E8` (Cream)
  - 한 줄, max-width 720px (모바일 자동 줄바꿈)
- Subhead: `tastingNote.subhead` = "와인 전문가들이 손글씨로 채우는 그 양식, 카메라 한 번이면 디지털로 끝납니다."
  - 폰트: Inter, 16px, line-height 1.6
  - 색상: `#9B8B7A` (Muted)
- 헤더 등장 애니메이션: scroll-triggered, 600ms easeOut, y: 24 → 0, opacity: 0 → 1
</section_header>

<form_tab_bar>
**4-탭 토글.**
- 탭 4개: White / Red / Sparkling / Blind
- 각 탭 폭: 동일 grid 1fr × 4
- 높이: 56px (PC) / 64px (모바일, sticky)
- 활성 탭: 배경 `rgba(139,26,42,0.18)` + 하단 2px gold underline + 텍스트 `#F5F0E8`
- 비활성 탭: 텍스트 `#9B8B7A`, hover 시 `#D4C5B0`
- 모바일에서는 화면 상단 sticky (top: 0, z-index: 30, backdrop-blur)
- 탭 전환 시 mockup의 양식이 morph (Framer Motion `layout` + `AnimatePresence mode="wait"`, 400ms easeInOut)
- 각 탭 아이콘: 🥂 / 🍷 / ✨ / 🎯 (이모지로 가벼운 분위기 + 와인 색 직관)
- 키보드: ←/→로 탭 이동, Enter로 활성화 (`role="tablist"`, `role="tab"`, `aria-selected`)
</form_tab_bar>

<phone_mockup>
**스마트폰 mockup — 좌측 캔버스 (PC) / 상단 (모바일).**
- 외곽 폭: 320px (PC) / 75vw max 360px (모바일)
- 베젤: 8px, 색상 `#1A0A1E`, border-radius: 36px
- 화면 영역 안: 4종 양식의 종이 느낌 가짜 렌더
- 종이 배경: `#F5F0E8` (Cream — 종이 양식의 느낌)
- 종이 위 텍스트: `#1A0A1E` (어두운 보라 — 검정 대신 따뜻한 잉크 톤)
- 종이 양식 4종 (각 mockup 안):
  - **White:** 헤더 "WHITE WINE TASTING NOTES" + Bordeaux 와인글라스 SVG / AROMA 5섹션 (시트러스, 핵과, 트로피컬, 꽃, 향신료) / PALATE 슬라이더 5개 / FINISH 박스 / RATING 별 5개
  - **Red:** "RED WINE TASTING NOTES" + Burgundy 글라스 / AROMA 6섹션 (붉은과일, 검은과일, 향신료, 가죽, 흙, 오크) / + TANNIN 강도+질감 슬라이더 / 나머지 White 동일
  - **Sparkling:** "CHAMPAGNE TASTING NOTES" + Flute 글라스 / + BUBBLES 섹션 (크기·지속·무쎄) / DOSAGE 7단계 / 나머지 동일
  - **Blind:** "BLIND WINE TASTING SHEET" + ? 마크 글라스 / + VISUAL 섹션 (색조 12 swatch + 농도 + 점도) / + GUESS THE WINE 폼 (품종/지역/빈티지/가격) / REVEAL & SCORE 버튼
- 종이 양식 위 인터랙션:
  - 1.5초마다 다음 필드가 fade-in (자동 데모 모드)
  - 사용자가 hover 시 자동 데모 일시정지, 직접 스크롤 가능
  - 양식의 빈 칸은 처음에 회색 placeholder, 채워지면 잉크 펜으로 적힌 듯 색이 진해짐 (transition 300ms)
- 모바일: mockup 위에 "← 탭하여 양식 전환" 힌트 칩 (3초 후 자동 사라짐)
</phone_mockup>

<aroma_wheel>
**부케 휠 — Step 2 우측 캔버스의 시그니처 인터랙션.**

**구조.**
- SVG 폭 600px (PC) / 100% (모바일, max 400px)
- 정중앙 와인글라스 SVG (반지름 60px) — `WineGlassIcon` 재사용
- 외곽 12 wedge — UC Davis 12 카테고리. 각 wedge 30° (= 360 / 12)
- 각 wedge 채움: 카테고리 고유 색 (`AROMA_CATEGORIES[i].color`) + opacity 0.6
- wedge 외곽선: `rgba(245,240,232,0.08)` 1px
- wedge 안 텍스트: 카테고리 ko/en (회전 정렬)
- wedge 안 작은 아이콘: 이모지 (🍒 🌹 🌶 🌿 …)

**인터랙션.**
- hover: 해당 wedge opacity 0.9 + scale 1.04 + 카테고리 ko/en 툴팁
- 클릭: wedge "활성" 상태 — opacity 1 + 흰색 스트로크 2px + center에서 wedge 방향으로 expanding ray 애니메이션 (400ms)
- 활성 wedge의 2·3차 어휘 칩이 휠 하단/우측에 펼쳐짐 (PC: 우측 sliding panel / 모바일: 휠 아래 `<details>` 풍 펼침)
- 어휘 칩 hover: 임팩트 화합물 툴팁 (있을 경우) — "Rotundone (Sesquiterpene). 역치 16 ng/L. Syrah·Shiraz·Grüner Veltliner의 후추 노트"
- 어휘 칩 클릭: 선택 토글. 선택된 칩은 골드 ring + check 아이콘
- 선택된 어휘 카운트가 wedge 옆 작은 골드 배지로 표시 (예: "fruity 3")
- 다중 wedge 선택 가능 — Cmd/Ctrl+클릭

**한영 토글.**
- 휠 우상단 작은 토글 버튼 `KO / EN` (16px, gold border, 활성 측 채움)
- 사용자의 `useLocale()` 값을 초기 기본값으로 사용. 토글은 이 휠 안에서만 유효 (전역 locale은 변경 X)

**성능.**
- 12 wedge × 평균 20 어휘 = 240 칩. 어휘 칩은 활성 wedge에 한해서만 렌더링
- 휠 자체는 SVG path로 정적, transform만 변경 (GPU 가속)
</aroma_wheel>

<wset_slider>
**WSET 5단계 슬라이더 — Step 3 미각.**

**시각.**
- 5개 점 + 점 사이 선
- 점: 직경 14px, 비활성 `#4A3D56`, 활성 `#C9A84C` (Gold)
- 활성 점 발광: 골드 box-shadow, 0 0 12px `rgba(201,168,76,0.6)`
- 점 위 라벨: ko/en 둘 다 표시. ex. "Light / Low" 위에 "가벼움"
- 라벨 폰트: Inter 12px, 색 `#D4C5B0`
- 슬라이더 위: 차원 이름 (Inter 14px bold) + 단위 (Inter 12px muted, ex. "TA 6.5–9 g/L")

**인터랙션.**
- 클릭: 해당 점으로 점프 (ease 200ms)
- 드래그: 가까운 점에 snap
- 키보드: Tab으로 포커스, ←/→로 이동
- 값 변경 시 자동 묘사 문장 (Step 6)이 즉시 갱신
- 슬라이더 옆 작은 ⓘ 아이콘 hover: 차원 설명 툴팁 (예: 산도 → "WSET 5단계 + TA 5–10 g/L 일반 범위. 침샘 자극 강도로 인지")

**5단계 라벨 (각 차원별).**

| 차원 | low | medium- | medium | medium+ | high |
|---|---|---|---|---|---|
| 당도 | Bone Dry | Dry | Off-Dry | Medium | Sweet |
| 산도 | Soft | Medium- | Medium | Crisp | Racy |
| 바디 | Light | Medium- | Medium | Medium+ | Full |
| 알코올 | <11% | 11–12.5 | 12.5–13.5 | 13.5–14 | >14% |
| 타닌 강도 | Soft | Medium- | Medium | Firm | Aggressive |
</wset_slider>

<tannin_panel>
**타닌 패널 — Red 양식 전용 (Step 3 안에 포함).**

- WSET 5단계 강도 슬라이더 (위 wset_slider 사양)
- 질감 칩 (다중 선택, 그라데이션 정렬 — 부드러운 → 거친):
  - 좌측 그룹 (silky/velvety/smooth/plush/soft/round) — 골드 배경 칩
  - 중앙 (fineGrained/polished/powdery/dusty/chalky) — 베이지 배경
  - 우측 (grainy/grippy/firm/chewy) — 짙은 자주
  - 끝 (coarse/rough/harsh/astringent/drying/aggressive) — 빨강 외곽선 (강한 인상 표시)
- 성숙도 라디오 3택: Unripe (그린) / Ripe (잘 익은) / Overripe (과숙)
- 칩 hover 시 한글 + 영문 + 짧은 묘사 ("실키 — 가장 매끈하고 우아함, Pinot Noir / 숙성 Bordeaux의 시그니처")
</tannin_panel>

<bubble_panel>
**기포 패널 — Sparkling 양식 전용.**

- 기포 크기 라디오 3택: Fine (1mm 이하) / Medium / Coarse (큰)
- 지속성 슬라이더 4단계: Fleeting → Steady → Persistent → Continuous
- 무쎄 질감 칩: Creamy / Silky / Frothy / Soft / Aggressive
- 압력 슬라이더: 1–6 bar. 시각 라벨로 카테고리 표시 (1–2.5 = Pétillant, 3+ = Spumante, 5–6 = Champagne)
- 제조 방식 라디오: Méthode Traditionnelle / Charmat (Tank) / Asti / Ancestral (Pét-Nat) / Unknown
  - 각 방식 hover 시 짧은 설명 ("Méthode Traditionnelle — 병 안 2차 발효, 1.5–10년 자가분해. Champagne·Cava·Crémant·Franciacorta 표준. 미세하고 지속적인 기포 + 빵·헤이즐넛")
- EU Dosage 7단계 라디오 (가로 배치):
  - Brut Nature (<3) / Extra Brut (0–6) / Brut (<12) / Extra Dry (12–17) / Sec (17–32) / Demi-Sec (32–50) / Doux (>50)
  - 각 라디오 아래 잔당 g/L 작게 표시
</bubble_panel>

<caudalie_meter>
**카우달리 측정기 — Step 4 피니시.**

**컨셉.**
- "이 와인의 피니시가 몇 초나 갈까요? 마지막 한 모금을 삼키고 — Tap to start"
- Peynaud의 카우달리(1초 = 1 caudalie)를 인터랙티브로 학습

**시각.**
- 원형 progress ring, 직경 220px (PC) / 180px (모바일)
- 트랙: 4구간 (0–3 / 3–5 / 5–10 / 10+) — 각 구간이 다른 색
  - 0–3 (Short): `#4A3D56` (Disabled)
  - 3–5 (Medium): `#9B8B7A` (Muted)
  - 5–10 (Long): `#C9A84C` (Gold)
  - 10+ (Very Long): `#8B1A2A` (Wine Red — 최고 카테고리)
- 중앙 큰 숫자: 현재 측정 초 (ex. "8")
- 숫자 아래: 카테고리 라벨 ("Long category")
- 카테고리 아래: 비교 한 줄 ("Bordeaux Grand Cru 평균과 동일")
- 비교 한 줄은 측정 초 수에 따라 동적:
  - 1–2: "보졸레 누보, 가벼운 무스카데 수준"
  - 3–4: "영 루아르 소비뇽 블랑 평균"
  - 5–7: "잘 익은 부르고뉴 피노 누아 (10년+)"
  - 8–10: "Bordeaux Grand Cru Classé"
  - 10+: "빈티지 샴페인, 빈티지 포트, Romanée-Conti"

**인터랙션.**
- 초기 상태: "Tap to start" (큰 버튼)
- 시작 시 ring이 시계방향으로 1초당 1/30 원호 진행 (최대 30초까지 의미 있게 표시)
- 다시 클릭: 정지. 측정값 저장
- 우측에 reset 아이콘 (RefreshCw)
- 측정 도중 진동 미세 애니메이션 (`scale 1 → 1.02 → 1`, 1s 주기) — 시간 흐름 시각

**값 없이 분류만 선택 가능.**
- "측정하지 않고 직감으로 선택" 토글 → Short/Medium/Long/Very Long 4 라디오 칩으로 대체
- 둘 다 결과는 `TastingNote.finish.length`에 동일 enum으로 저장
</caudalie_meter>

<fault_checklist>
**결함 체크리스트 — Step 5 (collapsible, 기본 접힘).**

- 헤더: "결함 점검 · Fault Check" + 우측 펼침 화살표
- "전문가 모드를 켜면 11종 결함 카탈로그가 펼쳐집니다" 안내
- 펼침 시 11개 카드 grid (PC: 3열, 모바일: 1열)
- 각 카드:
  - 상단 체크박스 (24px, gold 활성 / 회색 비활성)
  - 결함 한국어 + 영문 (Inter 14px)
  - cause / threshold / aroma 3줄 (Inter 12px muted)
  - hover 시 카드 scale 1.02 + 골드 외곽선
  - 클릭: 체크 토글 (사용자가 명시적으로 표시)
- 카드 사이 12px gap
- 푸터: "결함은 명시적 사용자 체크가 있을 때만 기록됩니다 — 자동 추론 X" 안내 (privacy/integrity)
</fault_checklist>

<opening_timeline>
**오프닝 타임라인 · Opening Timeline — Step 5.5 (collapsible, 기본 접힘).**

**컨셉.**
> 코르크를 따고 일정 시간 둔 뒤 와인이 "열리는(opens up)" 현상을 시간축으로 직접 기록한다. 영 보르도 1~3시간, 영 바롤로 1~3시간, 영 라이트 피노 15~30분, 매우 오래된 레드는 즉시 음용 — 와인 타입별 권장 시간이 자동 안내되며, 사용자의 ★ Peak 기록이 누적되면 "당신은 영 보르도를 평균보다 30분 빠르게 깨우는 편" 같은 통계 카피가 나타난다. 03_temporal_research.md §2.1 (단기·잔 내 변화) + §2.2 (디캔팅 효과) 직접 인용.

**시각.**
- 펼침 헤더: "오프닝 타임라인 · Opening Timeline" (Playfair 18px) + 우측 펼침 화살표
- 헤더 아래 안내 카피: "코르크 따고 와인이 어떻게 변하는지 시간축으로 기록해보세요" (Inter 13px muted)
- 펼침 콘텐츠 폭: PC 100% (우측 캔버스 전체) / 모바일 100%

**상단 컨트롤 행.**
- 좌측: `OpenedAtPicker` — "코르크 오픈 시각" + 두 버튼 ("지금 / Now" | "직접 입력")
- 가운데: `DecantToggle` — "디캔터 사용?" Yes/No
- 우측: `LiveTimerChip` — 오픈 시각이 설정되면 자동 표시 ("T+0:42:15", 1초 단위 갱신)
  - 라이브 타이머는 0초 → 60분 사이는 분:초 표시, 그 이후는 시:분 표시
  - `prefers-reduced-motion: reduce`에서는 갱신 1분 간격으로 줄임

**Timeline Track (가로 막대).**
- 폭 100%, 높이 64px (PC) / 80px (모바일, 더 큰 tap 영역)
- 가로 라인 1px `rgba(245,240,232,0.16)`
- 8개 dot — 표준 timepoint (`TIMEPOINT_PRESETS`):
  - T0 / 15분 / 30분 / 1시간 / 2시간 / 3시간 / 4시간 / 6시간+
  - 좌→우 등간격 배치
  - dot 직경 18px, 비활성 `#4A3D56`, 입력 완료 `#C9A84C`, ★ Peak `#8B1A2A`
- 라이브 타이머 위치는 dot 사이에 `#C9A84C` 작은 caret으로 표시 (예: 42분 시점 = 30분과 1시간 사이)
- 라이브 caret hover/click 시 "현재 위치에 기록 추가" 버튼 (가장 가까운 timepoint dot에 자동 매핑 또는 임의 분 입력)
- 사용자가 임의 분 추가 가능 (`+` 아이콘) — 표준 8 외에 자유 시간 (예: 50분, 90분)
- dot 위에 `label` 텍스트 (Inter 11px, 색 `#9B8B7A` 또는 입력 시 `#D4C5B0`)
- dot 클릭: 해당 timepoint를 활성화 + 아래 `ActiveTimepointPanel` 펼침 (이전 활성 닫힘)

**Active Timepoint Panel (선택된 시점의 입력 폼).**
- 카드형 패널, padding 24px, border 1px `#C9A84C`/40, border-radius 12px
- 좌측 큰 라벨: 활성 timepoint 라벨 (Playfair 22px, 예: "T+1시간")
- 5개 입력 컴포넌트 세로 stack:

  1. **Aroma Intensity Delta** (5단계 슬라이더, -2 ~ +2)
     - 라벨: "T0 대비 향 강도"
     - 단계 라벨: "−2 매우 닫힘" / "−1 약간 닫힘" / "0 동일" / "+1 약간 열림" / "+2 매우 열림"
     - 활성점 색: -2/-1 = 짙은 자주 / 0 = 회색 / +1 = 골드 / +2 = 와인 빨강
     - 디폴트 0

  2. **Tannin Softness Delta** (Red 전용 — variant === 'red'에서만 노출)
     - 라벨: "T0 대비 타닌 부드러움"
     - 단계: "−2 더 거칠어짐" / "−1" / "0 동일" / "+1 부드러워짐" / "+2 매우 둥글어짐"
     - 사용자 의견 직접 반영: "타닌이 부드러워지고 둥글어지기도 하지만…"

  3. **Body Delta** (5단계, 모든 양식)
     - 라벨: "T0 대비 바디"
     - 단계: "−2 가벼워짐" / "−1" / "0 동일" / "+1 무거워짐" / "+2 매우 풍부해짐"

  4. **Reduction Toggle** (체크박스 + 정보 아이콘)
     - 라벨: "환원취 (Reduction) 느껴짐"
     - hover ⓘ 툴팁: "성냥·고무·H₂S(썩은 달걀)·양배추·마늘·익은 양파. 산소 노출로 사라지는 결함성 향. 영 시라·신생 와이너리·환원성 양조 와인에 흔함."
     - 체크 시 골드 ring + AlertTriangle 아이콘
     - 사용자 의견 직접 반영: "환원취 등 나쁜 향들이 날아가고…"

  5. **New Aromas Emerged** (다중 선택 칩 — 부케 휠 어휘에서 다이렉트 매핑)
     - 라벨: "이 시점에서 새로 등장한 향"
     - 부케 휠에서 미선택 어휘 중 클릭 가능 (선택된 어휘는 회색 disabled)
     - 칩 클릭 시 ✨ 스파크 애니메이션 (300ms) — "잠겨있던 좋은 향이 나타나는" 시각화
     - 사용자 의견 직접 반영: "잠겨있던 좋은 향들이 나타나면서…"

  6. **Score Stars** (1-5, WineGlassRating 재사용)
     - 라벨: "이 시점의 전반 점수"
     - 클릭으로 1~5 별

  7. **Note Input** (한 줄 textarea, max 80자)
     - placeholder: "예: 환원취 사라지고 검은 체리 폭발"

  8. **Peak Star Toggle** (큰 골드 별 버튼)
     - 라벨: "★ 이 시점이 정점"
     - 클릭 시 다른 timepoint의 Peak 자동 해제 (하나만 가능)
     - 활성화 시 Timeline Track의 해당 dot이 와인 빨강으로 변경 + 별 아이콘 추가

- 패널 우상단: 닫기 X 아이콘 (모바일에서 자주 사용)

**Recommendation Card (Active Panel 아래 또는 우측).**
- 와인 메타데이터(`producer` / `region` / `vintage` / `grape`)에서 자동 매칭
- 매칭 로직 (간단 규칙):
  - Cabernet/Syrah/Barolo + 빈티지 ≤ 5년 → `young-full-red`
  - Pinot Noir + 빈티지 ≤ 7년 → `young-light-red`
  - 빈티지 35년+ → `very-old-red`
  - 등등 (`OPENING_GUIDE` 9 카테고리)
- 카드 내용 (예시):
  ```
  ✦ 와인 타입: 영(young) 풀바디 레드
  ✦ 권장 디캔팅: 1시간 ~ 3시간 (평균 Peak 2시간)
  ✦ 예시 와인: Cabernet Sauvignon (Bordeaux Grand Cru), Barolo, 북부 론 Syrah
  ✦ 메커니즘: 단단한 타닌 + 닫힌 과일감. 광구 디캔터에서 1~3시간 권장.
  ```
- 사용자가 ★ Peak를 매기면 카드 하단에 비교 카피 추가:
  - "당신은 평균보다 30분 빠르게 깨우는 편" (Peak < 권장 peak)
  - "당신은 권장 시간과 정확히 일치합니다" (Peak ≈ 권장 peak ±15분)
  - "당신은 평균보다 1시간 늦게 깨우는 편" (Peak > 권장 peak)

**Evolution Chart (Recommendation 아래 또는 옆).**
- 가로 라인 차트 — x축 timepoint, y축 overallScore (1-5)
- 사용자가 입력한 timepoint 점들을 line으로 연결
- ★ Peak 위치에 큰 골드 별 마커
- 환원취 체크된 timepoint는 점 색을 회색 + 작은 ⚠ 아이콘
- 차트 폭: PC 480px / 모바일 100%
- 차트 라이브러리 미사용 — 단순 SVG path (8 점, 직선 연결, ~60줄 코드)

**자동 묘사 문장 통합.**
- 사용자가 timepoint 2개 이상 + Peak를 매기면 자동 묘사 박스 (Step 6)에 시간축 문장 1줄 추가:
  - "1시간 시점에서 환원취가 사라지고 검은 체리·바이올렛이 풀려나며, 2시간이 정점."
- 묘사 템플릿 `DESCRIPTION_TEMPLATES.{ko|en}.evolution` 추가

**모바일 반응형.**
- Timeline Track: 가로 스크롤 가능 (전체 8 dot 한 화면에 못 들어가면)
- Active Panel: 카드가 화면 폭 100% 채움
- Recommendation Card + Evolution Chart는 세로 stack (PC는 가로)
- LiveTimerChip은 화면 우상단 sticky (선택 사항)
- 큰 tap 영역 (dot 24px, +/− 슬라이더 화살표 44px)
</opening_timeline>

<auto_description>
**자동 묘사 문장 — Step 6 종합.**

**컴포넌트 위치.** Step 6 (Rating 위) — 사용자 입력의 종합 결과로 화면에 항상 가시적

**시각.**
- 골드 외곽선 box (border 1px `#C9A84C`/40, border-radius 12px, padding 24px)
- 박스 안 텍스트: Playfair Display 18px, line-height 1.7, 색 `#F5F0E8`
- 텍스트는 4–6 문장 (ko 기준), 양식 변형에 따라 다름
- 입력 변경 시 텍스트가 typewriter 효과로 갱신 (300ms로 stagger)

**예시 (Red 양식, 사용자 입력 후).**
> "2018년 Pommard, Domaine de Courcel의 Les Rugiens 1er Cru.
> 강렬한 향에 검은 체리·자두 노트가 도드라지고, 가죽·시가 박스가 뒤를 받칩니다.
> 입안에서는 풀바디에 또렷한 산도, 드라이한 단맛이 어우러지며,
> 타닌은 단단하게 짜여 fine-grained 인상을 남깁니다.
> 8 카우달리(Long)의 피니시. 깔끔하고 끈기 있는 마무리.
> 4.5/5 — Pommard Grand Cru급의 깊이를 보여줌."

**구현.**
- `useEffect`로 입력 dependency 변경 감지
- `lib/tasting-note-lexicon.ts`의 `DESCRIPTION_TEMPLATES`에서 양식별 템플릿 골라 placeholder 치환
- 한·영 동시 지원 (`useLocale()` 따라)
- 사용자가 박스 안 클릭 시 textarea로 변경 — 직접 편집 가능 (auto-save to local state)

**CTA.**
- 박스 우하단에 작은 버튼 "이 노트, 앱에서 진짜로 저장해 보기"
- 클릭 시 `onOpenModal()` 호출 — 웨이팅 리스트 모달 오픈 (기존 패턴)
</auto_description>

<blind_mode>
**Blind 모드 — variant === 'blind' 전용 Step 7.**

**위치.** Rating 다음, SectionFooter 직전

**구조.**
- 헤더: "GUESS THE WINE 🎯" (Playfair Display 24px)
- 4개 추정 폼 (모두 optional):
  - 품종 (text input, 자동완성 — 30개 주요 품종 suggestion)
  - 지역 (text input, 자동완성 — 부르고뉴/보르도/토스카나/리오하/나파 …)
  - 빈티지 (number input, 1950–2024)
  - 가격대 (라디오 5택: ~3만 / 3–6만 / 6–10만 / 10–20만 / 20만+ KRW)
- 큰 버튼 "정답 공개 (Reveal & Score)"
- 클릭 후:
  - 정답 카드 fade-in (mockup의 메타데이터 그대로)
  - 점수 카드: 각 항목 ✓/✗ + 총점 (각 항목 25점, 총 100점)
  - 점수에 따른 등급:
    - 90–100: "Master Sommelier 수준 🏆"
    - 70–89: "Advanced Sommelier 후보"
    - 50–69: "Wine Enthusiast"
    - 30–49: "탐험 단계 — 더 마셔보세요"
    - 0–29: "재미있는 발견 — 와인의 다양성을 즐기세요"
  - 점수 카드 아래 작은 안내: "이 모드는 데모용입니다. 실제 와인은 mockup의 가상 데이터입니다."

**의도.** 전문가가 "이 친구들 진짜 와인 알고 있네"라고 인정할 디테일.
</blind_mode>

<empty_states_and_loading>
- **초기 진입 (양식 변경 직후):** mockup의 종이 양식이 "비어있음" 상태로 시작. 1.5초 후 자동 데모 시퀀스 시작 (메타 → 아로마 → 미각 → 피니시 순)
- **사용자 hover/스크롤 시:** 자동 시퀀스 일시정지. 사용자 직접 컨트롤 우선
- **모바일 첫 진입:** Form Tab Bar 아래에 "← 좌우로 양식 전환" 힌트 칩 (3초 후 자동 사라짐, 한 번만 표시)
- **Loading skeleton 불필요:** 모든 데이터가 정적 (lexicon.ts) — 즉시 렌더
</empty_states_and_loading>

<keyboard_shortcuts_reference>
- `←` / `→`: Form Tab Bar에서 양식 전환
- `Tab`: 슬라이더/입력/체크박스 순회
- `Space` / `Enter`: 활성 컨트롤 토글
- `1` / `2` / `3` / `4`: White / Red / Sparkling / Blind 직접 선택 (focus가 탭바 근처일 때)
- `Esc`: 부케 휠 활성 wedge 해제 / blind 모드 정답 카드 닫기
- `?`: 키보드 단축키 도움말 모달 (옵션 — 시간 부족하면 생략)
</keyboard_shortcuts_reference>

</pages_and_interfaces>

<core_functionality>

<form_variant_switching>
- 4 탭 (White/Red/Sparkling/Blind) 중 하나만 활성
- 탭 전환 시 mockup이 morph (Framer Motion `layout` + `mode="wait"`, 400ms)
- 입력값은 양식 간 공유 가능한 부분(메타·기본 PALATE·FINISH·OVERALL)만 유지, 양식 고유 필드(타닌/기포/Visual/Blind)는 양식 진입 시 새로 시작
- localStorage / sessionStorage 미사용 — 페이지 reload 시 모든 입력 사라짐 (데모 의도)
</form_variant_switching>

<aroma_wheel_interaction>
- 12 카테고리 hover/click → 활성화
- 활성 카테고리의 2·3차 어휘 패널이 휠 옆/아래에 펼침
- 어휘 칩 클릭 → 선택 토글, `TastingNote.aroma.{primary|secondary|tertiary}` 배열에 추가/제거
- 어휘 hover → 임팩트 화합물 툴팁 (해당 어휘에 `impactCompound` 정의가 있으면)
- 다중 카테고리 동시 활성 가능 (Cmd/Ctrl+클릭) — 더블 hover 시 그룹 해제
</aroma_wheel_interaction>

<auto_description_generation>
- 입력값 (메타, 아로마 선택, 미각 슬라이더, 피니시) 변경 시 자동 묘사 문장 재생성
- `useEffect` + 디바운스 200ms (사용자 슬라이더 드래그 중 과도한 재계산 방지)
- 묘사 템플릿: `lib/tasting-note-lexicon.ts`의 `DESCRIPTION_TEMPLATES[locale][variant]`
- placeholder 치환: `{vintage}`, `{region}`, `{producer}`, `{wineName}`, `{intensity}`, `{primary}`, `{secondary}`, `{body}`, `{acidity}`, `{sweetness}`, `{tannin}`, `{tanninTexture}`, `{bubbleSize}`, `{persistence}`, `{mousse}`, `{caudalies}`, `{finishLength}`, `{finishQuality}`
- placeholder 미입력 시 fallback ("입력 전 — 슬라이더를 만져보세요")
- 자동 묘사 문장이 갱신될 때 typewriter 애니메이션 (글자당 8ms)
</auto_description_generation>

<caudalie_measurement>
- "Tap to start" 클릭 → `requestAnimationFrame` 기반 타이머 시작
- 1초마다 progress ring 1/30 원호 (최대 30초 표시, 그 이상은 카운트만 증가)
- "Tap to stop" 클릭 → 타이머 정지 + `TastingNote.finish.caudalies`에 정수 초 저장
- 동시에 카테고리 자동 분류: <3 short / 3–5 medium / 5–10 long / 10+ veryLong
- Reset 버튼: 0으로 초기화
- 측정 없이 분류만 선택 토글 → 4 라디오 (Short/Medium/Long/Very Long)
</caudalie_measurement>

<opening_timeline_tracking>
- "코르크 오픈 시각" 설정 → `evolution.openedAt` ISO 8601 저장
- 라이브 타이머는 `setInterval(1000)` — 1초마다 갱신, unmount 시 cleanup
- 각 timepoint dot 클릭 → `ActiveTimepointPanel` 펼침, 사용자 입력은 `evolution.timepoints[]` 배열에 push 또는 update (`minutesAfterOpen` 키로 유일성 보장)
- ★ Peak 토글: 한 번에 하나만 — 새 Peak 클릭 시 이전 Peak 해제. `peakIndex` 갱신
- Recommendation 매칭 로직 (`lib/tasting-note-lexicon.ts`의 `matchOpeningGuide(meta) → OpeningGuideEntry`):
  - 우선순위: 빈티지 → 품종 → 색
  - 빈티지 35년+ → very-old-red
  - 빈티지 10~20년 → aged-red-10-20
  - Cabernet/Syrah/Nebbiolo/Brunello + 빈티지 ≤ 5년 → young-full-red
  - Pinot Noir/Gamay + 빈티지 ≤ 7년 → young-light-red
  - Merlot/Tempranillo/Chianti + 빈티지 ≤ 8년 → young-medium-red
  - Port → vintage-port
  - 화이트 + 오크 → young-full-white
  - 화이트 그 외 → aromatic-white
  - Sparkling → sparkling
  - 매칭 실패 시 카드 비표시
- 사용자 Peak vs 권장 peak 비교 카피 자동 생성:
  - 차이 ≤ 15분: "권장 시간과 정확히 일치합니다"
  - −60 ≤ 차이 < −15: "평균보다 X분 빠르게 깨우는 편"
  - 차이 < −60: "꽤 일찍 깨우시네요 — 와인이 더 풀릴 여지가 있을지도"
  - 15 < 차이 ≤ 60: "평균보다 X분 늦게 깨우는 편"
  - 차이 > 60: "권장보다 길게 두시는 편 — 매우 인내심 있는 스타일"
- Evolution Chart는 SVG `<polyline points="...">` 단일 path로 그림
- 환원취 체크 시점은 다른 timepoint와 별도 시각화 (회색 + ⚠ 아이콘, 환원취 → 정상 변환 흐름이 차트에서 보이도록)
- 자동 묘사 박스에 evolution 문장 추가 (Peak 매겨졌을 때만):
  - 템플릿 ko: "{peakLabel} 시점에서 {firstChange}이(가) 사라지고 {newAromas}이(가) 풀려나며, 정점에 도달합니다."
  - placeholder: `{peakLabel}`, `{firstChange}` (환원취 토글 변화), `{newAromas}` (newAromasEmerged 첫 2개)
</opening_timeline_tracking>

<blind_mode_scoring>
- variant === 'blind'일 때만 활성
- 사용자 입력 4 항목 (품종/지역/빈티지/가격) 각 25점
- 정답 매칭 로직:
  - 품종: 정확 일치 25점, 같은 품종군(예: "Cabernet Sauvignon" vs "Cabernet") 15점, 같은 색(red/white) 5점, 그 외 0점
  - 지역: 정확 일치 25점, 같은 광역 지역(예: "Bourgogne" vs "Côte de Beaune") 15점, 같은 국가 10점, 0점
  - 빈티지: 동일 25점, ±2년 15점, ±5년 8점, 0점
  - 가격대: 동일 25점, 인접 카테고리 12점, 0점
- 총점에 따른 등급 라벨 (위 §blind_mode 참조)
- "재시도" 버튼 → 입력 초기화 + 새 mockup 와인 데이터 (3종 정답 풀에서 랜덤)
</blind_mode_scoring>

<i18n_locale_sync>
- 전역 locale: `useLocale()` (CLAUDE.md i18n 시스템 참조)
- AromaWheel 내부 ko/en 토글: 전역 locale 무시, wheel 내부 표시 언어만 전환 (사용자가 와인 어휘를 양 언어로 학습할 수 있도록)
- 기타 모든 UI 텍스트는 전역 locale 따름
- ko.json / en.json에 약 80개 신규 키 추가 (`tastingNote.*`):
  ```
  tastingNote.eyebrow
  tastingNote.heading
  tastingNote.subhead
  tastingNote.tabs.{white|red|sparkling|blind}
  tastingNote.steps.{capture|aroma|palate|finish|faults|rating|blind}
  tastingNote.scale.{low|mediumMinus|medium|mediumPlus|high}
  tastingNote.dimensions.{sweetness|acidity|body|alcohol|tannin|bubble|finish}
  tastingNote.cta.save
  tastingNote.outro
  …
  ```
</i18n_locale_sync>

</core_functionality>

<error_handling>
  <user_facing>
    <inline_messages>
      - 자동 묘사 문장에서 placeholder 미입력 시: "슬라이더를 만져보면 묘사가 시작됩니다" (회색 muted text)
      - 카우달리 측정 중복 클릭(시작 후 즉시 시작 버튼 다시 누름): 무시 (state guard)
      - Blind 모드 추정값 모두 비어있을 때 Reveal 클릭: "먼저 추정해 보세요" 안내 칩 (자동 사라짐 2초)
    </inline_messages>
    <no_toasts_needed>
      이 섹션은 외부 호출이 없어 toast 알림 불필요. waitlist 모달의 toast는 기존 패턴 (`waitlist-form.tsx`) 그대로
    </no_toasts_needed>
  </user_facing>
  <error_boundaries>
    - 섹션 전체를 React Error Boundary로 감쌀 필요는 없음 (외부 의존 없음)
    - 단, mockup의 자동 데모 타이머가 unmount 시 cleanup되어야 메모리 누수 방지 (`useEffect` cleanup 함수)
  </error_boundaries>
  <ssr_safety>
    - 컴포넌트 자체는 `'use client'` 선언
    - `window`/`document` 직접 접근 금지 — Framer Motion, useState만 사용
    - `dynamic` import 불필요 (브라우저 전용 API 미사용)
  </ssr_safety>
</error_handling>

<third_party_integrations>
  <note>이 섹션은 새 외부 통합을 도입하지 않는다. 기존 winemine 통합(Supabase, Slack Webhook, Google Analytics)은 waitlist 모달 호출 시에만 동작 (기존 패턴 그대로).</note>
  <google_analytics>
    - `lib/analytics.ts`의 `trackEvent()`로 다음 이벤트 전송:
      - `tasting_note_section_view` — 섹션 진입 (IntersectionObserver, 0.3 threshold, once)
      - `tasting_note_form_switch` — 양식 탭 전환 (label: white|red|sparkling|blind)
      - `tasting_note_aroma_wheel_engage` — 부케 휠 첫 클릭 (per session)
      - `tasting_note_caudalie_measure` — 카우달리 측정 완료 (value: 측정 초 수)
      - `tasting_note_blind_score` — Blind 모드 reveal 클릭 (value: 총점)
      - `tasting_note_save_cta` — 자동 묘사 박스 하단 저장 CTA 클릭
  </google_analytics>
</third_party_integrations>

<aesthetic_guidelines>

<design_fusion>
"종이 양식의 격조 + 디지털 인터랙션의 우월함"
- 좌측 mockup은 종이 양식의 정밀함 (Cream 배경, 어두운 잉크 톤, 와인글라스 SVG 워터마크)
- 우측 인터랙션은 디지털만의 능력 (실시간 자동 묘사, 부케 휠 회전, 카우달리 카운트다운, Blind 정답 자동 채점)
- 두 영역의 대비가 메시지를 전달: "전문가 양식의 깊이를 잃지 않으면서 디지털만의 즐거움을 더한다"
</design_fusion>

<color_palette>
**기존 winemine 토큰 그대로 사용 (CLAUDE.md §디자인 시스템).**
- Wine Red (CTA): `#8B1A2A`
- Wine Red Hover: `#A02030`
- Gold (Accent): `#C9A84C`
- Cream (Text): `#F5F0E8`
- Secondary Text: `#D4C5B0`
- Muted Text: `#9B8B7A`
- Disabled: `#4A3D56`
- Deepest Dark: `#05020A`
- Deep Dark: `#0A050F` (이 섹션 배경)
- Surface: `#0F0718`
- Border: `#2D1540`
- Border Active: `#8B1A2A`

**신규 토큰 (이 섹션에서 도입).**
- Aroma Category Colors (12개 — `lexicon.ts`의 `AROMA_CATEGORIES[i].color`):
  ```
  fruity:        #C9A84C (Gold — 과일은 가장 흔한 카테고리)
  floral:        #E8B4D2 (Pink — 꽃)
  spicy:         #A05A3D (Burnt Sienna — 향신료)
  herbaceous:    #7A8B5C (Sage — 허브·식물)
  nutty:         #8B6B47 (Walnut — 견과)
  caramelized:   #6B4423 (Caramel — 캐러멜)
  woody:         #5C3A1E (Oak — 나무·오크)
  earthy:        #4A3D32 (Forest Floor — 흙)
  chemical:      #6A5D7B (Slate — 화학)
  pungent:       #8B1A2A (Wine Red — 자극)
  oxidized:      #7B5C3A (Sherry — 산화)
  microbiological: #5C5C5C (Gray — 미생물)
  ```
- Form Paper Colors:
  ```
  paper-bg: #F5F0E8     (Cream — 종이 배경)
  paper-ink: #1A0A1E    (Dark Plum Ink — 잉크 톤)
  paper-line: rgba(26,10,30,0.12) (희미한 양식 줄)
  ```
</color_palette>

<typography>
- **Headers (Playfair Display):** 28–48px clamp, weight 600, letter-spacing -0.02em
- **Eyebrow & Tabs (Inter):** 12–14px, uppercase, letter-spacing 0.18em, weight 500
- **Body & Slider Labels (Inter):** 13–16px, line-height 1.6, weight 400
- **Auto Description (Playfair Display):** 18px, line-height 1.7, italic
- **Mockup Form Headers (Cormorant Garamond — Burgundy 섹션과 동일):** 16–22px, 종이 양식 느낌
- **Caudalie Number Display (Playfair Display):** 64px (PC) / 48px (모바일), weight 700
- **Korean fallback:** Noto Sans KR 자동 적용 (globals.css 폰트 스택)
</typography>

<spacing>
- 섹션 세로 패딩: `py-24 lg:py-32` (96px / 128px)
- 헤더 ↔ 탭바 gap: 48px
- 탭바 ↔ 메인 캔버스 gap: 32px
- Step 사이 gap: 64px (PC) / 48px (모바일)
- 슬라이더 사이 gap: 24px
- 어휘 칩 사이 gap: 8px
</spacing>

<borders_and_shadows>
- Phone mockup border-radius: 36px
- Aroma wheel SVG: 외곽 stroke 1px `rgba(245,240,232,0.08)`
- Slider track: 4px 두께, color `#2D1540`, active fill `#C9A84C`
- Card shadows:
  - Default: `0 4px 16px rgba(5,2,10,0.4)`
  - Hover: `0 8px 24px rgba(5,2,10,0.6) + 0 0 0 1px rgba(201,168,76,0.2)`
  - Active (selected): `0 0 0 2px #C9A84C, 0 8px 24px rgba(201,168,76,0.2)`
</borders_and_shadows>

<animations>
  <micro_interactions>
    - Tab 전환: 400ms easeInOut, mockup `AnimatePresence mode="wait"`
    - Wheel wedge hover: 200ms scale 1 → 1.04
    - Wheel wedge active: 400ms ray expand from center
    - Slider point change: 200ms ease, 활성점 글로우 펄스 1회
    - Chip selection: 150ms ring fade-in
    - Auto description typewriter: 8ms per char (chunked 3 chars 단위로 재계산)
  </micro_interactions>
  <orchestrated_entrance>
    - 섹션 진입 (IntersectionObserver 0.2 threshold):
      1. 헤더 fade+y (0–600ms)
      2. 탭바 fade+y (200–800ms, 200ms delay)
      3. 좌측 mockup fade+scale 0.95→1 (400–1000ms)
      4. 우측 캔버스 stagger children fade+y (600–1400ms, 80ms stagger)
    - 자동 데모 시퀀스 (mockup 안):
      1. 1500ms wait
      2. Producer/Vintage/Region typewriter (Step 1 표시)
      3. AROMA 칩 5개 fade-in (각 200ms stagger)
      4. PALATE 슬라이더 5개 활성점으로 이동 (각 150ms stagger)
      5. STRUCTURE 슬라이더 4개 채워짐
      6. RATING 별 5개 채워짐 (각 100ms stagger)
      7. 완료 후 1초 정지 → 다음 양식으로 자동 전환 (옵션, 사용자 hover 없을 때만)
  </orchestrated_entrance>
  <caudalie_pulse>
    - 측정 중 mockup 미세 진동: scale 1 → 1.02 → 1, 1s 주기, easeInOut
  </caudalie_pulse>
</animations>

<responsive_design>
  <breakpoints>
    - mobile: 0–639px (1열 stack, FormTabBar sticky top, 종이 mockup 중앙 정렬)
    - tablet: 640–1023px (1열 유지, 더 넓은 mockup, 부케 휠 큰 사이즈)
    - desktop: 1024–1279px (2열: 좌 40% mockup + 우 60% 인터랙션)
    - wide: 1280px+ (max-width 1280px 컨테이너, 좌 480px / 우 fluid)
  </breakpoints>
  <mobile_adaptations>
    - Form Tab Bar → 화면 상단 sticky (top: 0, z-index: 30, backdrop-blur 12px)
    - Phone mockup → 75vw, max 360px, 가운데 정렬, 자동 데모 시퀀스 그대로
    - 부케 휠 → max 320px, 어휘 칩 패널이 휠 아래로 펼침 (sliding panel 대신 collapse)
    - WSET slider 라벨 → ko/en 둘 다 표시하되 12px로 축소
    - 카우달리 미터 → 직경 180px, 카테고리 라벨 폰트 14px
    - Fault checklist → 1열 grid, 각 카드 폭 100%
    - Auto description 박스 → 폰트 16px, padding 16px
    - SectionFooter outro → 폰트 16px, line-height 1.5
  </mobile_adaptations>
  <touch_interactions>
    - 부케 휠 wedge: tap 시 활성화, 0.5초 long-press 시 어휘 패널 즉시 펼침
    - WSET slider: tap-to-select (드래그도 가능)
    - 카우달리 미터: 큰 tap 영역 (100%, 220px 직경 SVG 위)
    - 결함 카드: tap 시 체크박스 토글, 카드 hover 효과는 비활성
    - 최소 탭 타겟: 44×44px (WCAG 2.5.8)
    - FloatingCTA가 모바일에서 자동 숨김 (이 섹션에서) — 화면 하단 자유 공간 확보
  </touch_interactions>
</responsive_design>

<icons>
- lucide-react (기존 winemine 통일):
  - `Camera` — 라벨 카메라 시뮬레이션
  - `Sparkles` — Sparkling 양식 탭
  - `Wine` — 메인 와인 아이콘 (필요 시)
  - `Target` — Blind 모드 탭
  - `ChevronRight` — Step 진행
  - `Check` — 어휘 선택 확정
  - `AlertTriangle` — 결함 카탈로그 아이콘
  - `RefreshCw` — 카우달리 reset
  - `Eye` / `EyeOff` — Blind 모드 정답 공개 토글
  - `Award` — Blind 점수 등급 아이콘
- 와인글라스 SVG: 부르고뉴 섹션의 `WineGlassIcon` 재사용
- 와인병 SVG: 부르고뉴 섹션의 `BottleSilhouette` 재사용
- 별점: 부르고뉴 섹션의 `WineGlassRating` 재사용 (5점, 0.5점 단위 미지원 — 1점 단위)
- 카테고리 이모지 (어휘 칩 안): 🍒🌹🌶🌿🌰🍯🪵🍂🧪🔥🥃🧬
</icons>

<accessibility>
- Form Tab Bar: `role="tablist"` + 각 탭 `role="tab"` + `aria-selected` + `aria-controls`
- 부케 휠 wedge: `role="button"` + `aria-label="과일 카테고리"` + `tabindex="0"`
- WSET slider: `role="slider"` + `aria-valuemin/max/now` + `aria-label`
- 결함 체크박스: `role="checkbox"` + `aria-checked`
- 자동 묘사 박스: `role="region"` + `aria-live="polite"` (변경 시 스크린리더에 읽힘)
- 카우달리 측정 시작/정지 버튼: `aria-label="피니시 측정 시작/정지"`
- 모든 색 + 텍스트는 WCAG AA 콘트라스트 (4.5:1 이상) — Cream/Gold 조합 검증 완료
- 모션 줄임 (prefers-reduced-motion: reduce):
  - 자동 데모 시퀀스 비활성 (사용자 직접 진행)
  - typewriter 효과 → 즉시 표시
  - wedge ray expand → 즉시 활성화
  - 카우달리 진동 효과 비활성
</accessibility>

</aesthetic_guidelines>

<security_considerations>
  <input_validation>
    - 데모 입력은 어디에도 저장되지 않으므로 서버 측 검증 불필요
    - 자유 텍스트 영역(Auto Description textarea, Blind 추정 input)은 React 기본 escape으로 XSS 방지
    - max length: 자유 텍스트 1000자, 추정 input 100자 (클라이언트 측만)
  </input_validation>
  <client_security>
    - CRITICAL: 어휘 사전 / 임팩트 화합물 사전 / 결함 카탈로그는 정적 import — 동적 평가 (eval, Function 생성자) 절대 금지
    - 자동 묘사 문장 생성 시 placeholder 치환은 단순 문자열 replace, 템플릿 엔진 미사용
    - 외부 라이브러리 추가 없음 (XSS 노출 면 최소)
  </client_security>
  <waitlist_modal_reuse>
    - "이 노트, 앱에서 진짜로 저장해 보기" CTA → 기존 `WaitlistModal` 재사용
    - 모달 자체는 기존 보안 정책 그대로 (Server Action submitWaitlist, RLS, Zod 검증)
    - 데모 입력값을 모달로 prefill하지 않음 — 사용자가 의도적으로 다시 입력 (개인정보와 데모 데이터 혼합 방지)
  </waitlist_modal_reuse>
</security_considerations>

<advanced_functionality>

<smart_defaults>
- 양식 탭 진입 시 자동 데모 시퀀스가 메타·아로마·미각·피니시까지 모두 채움
- 사용자가 칩 하나라도 토글하면 자동 시퀀스 정지 (사용자 입력 우선)
- 자동 시퀀스의 mockup 와인 데이터 (양식별 1종 random):
  - White: Domaine Leflaive Puligny-Montrachet 1er Cru Les Pucelles 2018
  - Red: Pommard 1er Cru Les Rugiens, Domaine de Courcel 2017
  - Sparkling: Krug Grande Cuvée 171ème Édition NV
  - Blind: 위 3종 + Sancerre / Barolo / Champagne Brut Nature 등 6종 풀에서 random
- 자동 시퀀스의 슬라이더·칩 값은 mockup 와인의 실제 시음노트 패턴 (전문가 인용 가능 수준)
</smart_defaults>

<lexicon_search>
- 부케 휠 우상단 작은 검색 input ("어휘 검색 / Search …")
- 입력 시 모든 12 카테고리에서 매칭 어휘 highlight
- 매칭 어휘 클릭으로 다이렉트 선택 (휠 wedge 활성화 자동)
- ko/en 동시 매칭 (사용자가 어느 언어로 검색해도 작동)
</lexicon_search>

<impact_compound_glossary>
- 부케 휠 좌하단 작은 ⓘ 버튼 → "임팩트 화합물 사전" 모달
- 모달 내용:
  - 약 12개 화합물 카드 (Rotundone, TDN, Methoxypyrazine, Linalool, Geraniol, cis-Rose Oxide, β-Damascenone, 3MH, 4MMP, Diacetyl, DMS, Acetaldehyde)
  - 각 카드: 이름 + 화학명 + 역치 + 한 줄 설명 + 대표 품종/와인
  - 카드 클릭 시 해당 어휘들 highlight (휠로 돌아가서)
- 의도: 와인 전문가 자랑 — "이런 디테일까지 알고 있는 서비스"
</impact_compound_glossary>

<form_progress_indicator>
- 우측 캔버스 우측 가장자리에 sticky vertical progress bar (PC만)
- 각 step (Capture/Aroma/Palate/Finish/Faults/Rating + Blind) dot 표시
- 사용자가 입력한 step은 골드 채움, 미입력은 회색
- dot 클릭 시 해당 step으로 스무스 스크롤
</form_progress_indicator>

</advanced_functionality>

<final_integration_test>

<test_scenario_1>
  <description>White 양식 자동 데모 시퀀스 — 첫 진입 흐름</description>
  <steps>
    1. 페이지 로드 후 Burgundy 섹션을 지나 Tasting Note 섹션이 viewport 진입
    2. 헤더 "그리고 그 한 잔, 어떻게 기억에 남기시겠어요?" fade-in 확인 (600ms)
    3. Form Tab Bar 등장, "White" 기본 활성 확인 (탭에 골드 underline)
    4. Phone mockup 우측에 부케 휠 등장 확인 (12 wedge 모두 보임)
    5. 1.5초 후 mockup 안 메타데이터가 typewriter로 채워짐 확인 (Producer: "Domaine Leflaive", Vintage: "2018", Region: "Puligny-Montrachet 1er Cru")
    6. 메타 채움 후 AROMA 섹션의 "레몬, 라임, 흰꽃, 헤이즐넛, 부싯돌" 5 칩이 200ms stagger로 활성화 확인
    7. PALATE 슬라이더 5개가 차례로 활성점으로 이동 (당도 Dry, 산도 Crisp, 바디 Medium+, 알코올 12.5–13.5, 강도 Pronounced)
    8. RATING 5점 별이 모두 채워짐 확인
    9. 자동 묘사 박스에 "2018년 Puligny-Montrachet, Domaine Leflaive의 Les Pucelles 1er Cru. 강한 향에 레몬·라임 노트가 도드라지고…" 문장 typewriter로 표시
    10. 사용자 마우스를 mockup 위에 hover하면 자동 시퀀스 일시정지 확인
  </steps>
</test_scenario_1>

<test_scenario_2>
  <description>Red 양식 전환 + 타닌 패널 확인</description>
  <steps>
    1. White 양식 자동 데모 진행 중
    2. Form Tab Bar에서 "Red" 탭 클릭
    3. 400ms morph 애니메이션 후 mockup이 RED WINE TASTING NOTES 양식으로 전환 확인
    4. 우측 캔버스의 PALATE 섹션에 새 TanninPanel 등장 확인 (강도 슬라이더 + 질감 칩 + 성숙도 라디오)
    5. 자동 데모 시퀀스가 Pommard 1er Cru Les Rugiens 2017 데이터로 채움
    6. 타닌 강도 슬라이더가 "Firm"(medium+) 활성, 질감 칩 "fine-grained" 선택, 성숙도 "Ripe" 활성 확인
    7. 자동 묘사 박스에 "타닌은 단단하게 짜여 fine-grained 인상을 남깁니다" 문구 포함 확인
    8. 부케 휠의 활성 wedge가 "fruity" + "earthy" + "spicy" 3개 카테고리로 표시 확인
  </steps>
</test_scenario_2>

<test_scenario_3>
  <description>Sparkling 양식 — 기포 패널 + EU 도사주 7단계 + 카우달리 측정</description>
  <steps>
    1. "Sparkling" 탭 클릭, 양식 morph 후 Krug Grande Cuvée 171ème Édition 데이터 채움
    2. PALATE 섹션에 BubblePanel 등장 확인 (기포 크기·지속·무쎄·압력·제조 방식)
    3. 압력 슬라이더 5–6 bar에 활성, 라벨 "Champagne 표준" 표시 확인
    4. 제조 방식 라디오 "Méthode Traditionnelle" 활성, hover 시 설명 툴팁 표시 확인
    5. EU Dosage 7단계 라디오에서 "Brut" 활성 + 잔당 "<12 g/L" 표시 확인
    6. 사용자가 카우달리 미터의 "Tap to start" 클릭
    7. progress ring이 시계방향으로 회전하기 시작, 중앙 숫자가 "1, 2, 3 …"로 증가
    8. 12초 후 "Tap to stop" 클릭
    9. 측정 결과 "12 caudalies" + 카테고리 "Very Long" + 비교 "빈티지 샴페인, 빈티지 포트, Romanée-Conti" 표시 확인
    10. 자동 묘사 박스에 "12 카우달리(Very Long)의 피니시" 문구 포함 확인
  </steps>
</test_scenario_3>

<test_scenario_4>
  <description>Blind 모드 — 추정 + 정답 공개 + 점수</description>
  <steps>
    1. "Blind" 탭 클릭, 양식 morph 후 mockup 메타 영역이 "?"로 표시 확인 (라벨 가려짐)
    2. 자동 시퀀스가 Visual·Aroma·Palate를 채우되 와인 정체는 비공개
    3. 사용자가 GUESS THE WINE 폼에 입력:
       - 품종: "Cabernet Sauvignon"
       - 지역: "Bordeaux"
       - 빈티지: "2015"
       - 가격대: "10–20만"
    4. "Reveal & Score" 클릭
    5. 정답 카드 fade-in: "Pauillac 2eme Cru Pichon Baron 2015"
    6. 점수 카드 표시:
       - 품종: ✓ 25점 (Cabernet Sauvignon 베이스 정답)
       - 지역: ✓ 25점 (Bordeaux 정답)
       - 빈티지: ✓ 25점 (2015 정답)
       - 가격대: ✓ 25점 (10–20만 정답)
       - 총점: 100점 — "Master Sommelier 수준 🏆"
    7. "재시도" 버튼 클릭 시 새 mockup 와인 선택 + 폼 초기화 확인
    8. "이 결과 공유하기" CTA → onOpenModal → WaitlistModal 오픈 확인
  </steps>
</test_scenario_4>

<test_scenario_5>
  <description>부케 휠 인터랙션 + 임팩트 화합물 툴팁</description>
  <steps>
    1. 어떤 양식이든 활성 상태에서 우측 캔버스의 부케 휠로 스크롤
    2. "spicy" wedge에 hover — opacity 0.9 + scale 1.04 + ko/en 툴팁 ("향신료 / Spicy") 표시 확인
    3. "spicy" wedge 클릭 — wedge 활성화 (opacity 1, 흰 stroke 2px) + 우측 패널에 2·3차 어휘 칩 펼침 ("흑후추, 흰후추, 정향, 시나몬, 팔각, 감초, 바닐라, 너트맥")
    4. "흑후추" 칩에 hover — 임팩트 화합물 툴팁 표시 확인:
       - "Rotundone (Sesquiterpene)"
       - "역치 16 ng/L — 극히 낮음"
       - "Syrah / Shiraz / Grüner Veltliner / Duras"
    5. "흑후추" 칩 클릭 — 골드 ring + check 아이콘 + wedge 옆 카운트 배지 "spicy 1" 표시 확인
    6. 자동 묘사 박스에 "흑후추 노트가 도드라지고" 문구 추가 확인
    7. 부케 휠 좌하단 ⓘ 버튼 클릭 — "임팩트 화합물 사전" 모달 오픈, 12개 화합물 카드 grid 확인
    8. 모달 안 "TDN" 카드 클릭 → 모달 닫힘 + "petrol" 어휘 highlight + 휠의 "chemical" wedge 자동 활성화 확인
  </steps>
</test_scenario_5>

<test_scenario_6>
  <description>결함 체크리스트 — 11종 + 명시적 사용자 체크 보장</description>
  <steps>
    1. Step 5 "결함 점검" 헤더 클릭 → 패널 펼침 (300ms ease)
    2. 11개 카드 (PC: 3열 grid, 모바일: 1열) 표시 확인
    3. "코르크 오염 (Bouchonné)" 카드 hover → scale 1.02 + 골드 외곽선
    4. 카드 클릭 → 체크박스 활성 (gold check) + `TastingNote.faults` 배열에 "corked" 추가 확인
    5. 자동 묘사 박스에 "코르크 오염이 의심됨" 안내 추가 확인 (단, 별점은 자동 하향 X — 사용자 결정 존중)
    6. 푸터 안내 "결함은 명시적 사용자 체크가 있을 때만 기록됩니다" 표시 확인
    7. 다른 카드(예: "브렛") 클릭 → 다중 선택 가능 확인 (배열에 'brett' 추가)
    8. 체크된 카드 다시 클릭 → 해제, 배열에서 제거 확인
  </steps>
</test_scenario_6>

<test_scenario_7>
  <description>모바일 반응형 — Form Tab Bar sticky + mockup compact</description>
  <steps>
    1. 모바일 viewport (375 × 812) 에뮬레이션
    2. Tasting Note 섹션 진입 시 Form Tab Bar가 화면 상단 sticky로 고정 확인
    3. 스크롤 진행해도 탭 바가 계속 보이며 backdrop-blur 효과 확인
    4. Phone mockup이 75vw, max 360px로 가운데 정렬 확인
    5. 부케 휠이 max 320px로 축소, 어휘 패널이 휠 아래 collapse로 펼침 확인
    6. 카우달리 미터가 직경 180px로 축소, 큰 tap 영역 유지 확인
    7. 결함 카드가 1열 grid로 스택 확인
    8. FloatingCTA가 자동 숨김 — "#tasting-note" 영역 전체에서 비활성 확인
    9. mockup 위에 "← 좌우로 양식 전환" 힌트 칩이 3초간 표시되었다가 사라짐 확인
    10. 양식 탭 swipe로 전환 가능 (가로 스와이프 → 다음 탭) — 옵션, 시간 부족하면 생략
  </steps>
</test_scenario_7>

<test_scenario_8>
  <description>i18n — 한영 전환 + Aroma Wheel 내부 토글</description>
  <steps>
    1. URL/Cookie 로 locale을 "en"으로 설정 후 페이지 로드
    2. Tasting Note 헤더 "And how will you remember that one glass?" 표시 확인
    3. 양식 탭 "White / Red / Sparkling / Blind" 표시 확인
    4. 자동 묘사 박스의 문장이 영문 템플릿으로 생성 확인 ("2018 Puligny-Montrachet, Domaine Leflaive's Les Pucelles 1er Cru. Pronounced nose with lemon …")
    5. 부케 휠 안 카테고리 라벨 "Fruity / Floral / Spicy …" 영문 표시 확인
    6. 휠 우상단 KO/EN 토글에서 "KO" 클릭 → 휠 안 어휘만 한글로 전환, 나머지 UI는 영문 유지 확인
    7. 다시 KO 전역 locale로 변경 후 페이지 새로고침
    8. 모든 텍스트 한국어 표시, 휠 내부도 한국어 (전역 locale 따라) 확인
    9. ko.json과 en.json 키 구조 동기화 검증 (CLAUDE.md i18n 검증 스크립트 사용)
  </steps>
</test_scenario_8>

<test_scenario_9>
  <description>웨이팅 리스트 모달 연결</description>
  <steps>
    1. 양식 어디든 자동 묘사 박스에 콘텐츠가 채워진 상태
    2. 박스 우하단 "이 노트, 앱에서 진짜로 저장해 보기" 버튼 클릭
    3. 기존 `WaitlistModal`이 오픈 확인 (애니메이션, 폼, 마케팅 동의 체크박스 모두 작동)
    4. 모달 내 데모 입력값이 prefill되지 **않음** 확인 (개인정보·데모 데이터 분리 보장)
    5. 모달에서 이메일 입력 후 제출 → 기존 Server Action `submitWaitlist()` 호출, 성공 화면 확인
    6. 모달 닫은 후 Tasting Note 섹션의 데모 입력값이 유지되어 있는지 확인 (state 보존)
    7. SectionFooter의 "웨이팅 리스트에 등록" CTA도 동일하게 모달 오픈 확인
  </steps>
</test_scenario_9>

<test_scenario_11>
  <description>오프닝 타임라인 — 영 보르도 시나리오 (Opening up 풀 흐름)</description>
  <steps>
    1. Red 양식 활성, mockup 와인 데이터 "Pichon Baron 2018" (영 풀바디 레드) 채워진 상태
    2. Step 5.5 "오프닝 타임라인 · Opening Timeline" 헤더 클릭 → 패널 펼침 (300ms)
    3. Recommendation Card 자동 표시 확인:
       - "와인 타입: 영(young) 풀바디 레드"
       - "권장 디캔팅: 1시간 ~ 3시간 (평균 Peak 2시간)"
    4. "코르크 오픈 시각 — 지금" 버튼 클릭 → `openedAt`이 현재 시각 ISO 8601로 저장
    5. LiveTimerChip이 "T+0:00:01" 시작, 1초마다 증가 확인
    6. Timeline Track의 "T0" dot 클릭 → ActiveTimepointPanel 펼침
       - aromaIntensityDelta = 0 (T0 기준), reductionPresent = true 체크 (성냥 향), score = 2
       - "환원취 진행 중" 한 줄 메모 입력
    7. "30분" dot 클릭 → 패널 갱신
       - aromaIntensityDelta = +1, reductionPresent = false (사라짐), tanninSoftnessDelta = +1, score = 4
       - newAromasEmerged: [black-cherry, violet] 다중 선택 → 칩 클릭 시 ✨ 스파크 애니메이션 확인
    8. "2시간" dot 클릭 → 패널 갱신
       - aromaIntensityDelta = +2, tanninSoftnessDelta = +2, bodyDelta = +1, score = 5
       - "정점 도달" 메모, ★ Peak Star Toggle 활성화
    9. Timeline Track의 "2시간" dot이 와인 빨강으로 변경 + 별 아이콘 추가 확인
    10. Recommendation Card 하단에 비교 카피 표시 확인:
        - "권장 시간과 정확히 일치합니다" (Peak 120분 = 권장 peak 120분)
    11. Evolution Chart에 3 점이 line으로 연결되어 우상향 곡선 표시 확인 (T0=2 → 30m=4 → 2h=5)
    12. 자동 묘사 박스 (Step 6)에 evolution 문장 추가 확인:
        - "2시간 시점에서 환원취가 사라지고 검은 체리·바이올렛이 풀려나며, 정점에 도달합니다."
    13. unmount(다른 페이지 이동 시뮬레이션) → 라이브 타이머 setInterval cleanup 확인 (DevTools Performance 메모리 누수 없음)
  </steps>
</test_scenario_11>

<test_scenario_12>
  <description>오프닝 타임라인 — 매우 오래된 레드 (즉시 음용 권장 시나리오)</description>
  <steps>
    1. Red 양식 + 1985년 빈티지 Bordeaux로 mockup 데이터 변경
    2. Recommendation Card 표시 확인:
       - "와인 타입: 매우 오래된 레드 (35년+)"
       - "권장 디캔팅: 0분 ~ 15분 (평균 Peak 5분)"
       - "메커니즘: 이미 산화 진행됨. 코르크 풀고 즉시 음용. 디캔팅하면 무너짐(falling apart) 위험."
    3. DecantToggle "Yes" → 사용자에게 경고 안내 표시 (선택 사항: 노출 또는 silent)
    4. T0 시점 score = 5, 30분 시점 score = 3, 1시간 시점 score = 2 입력 (시간 지날수록 무너짐)
    5. T0에 ★ Peak 매김
    6. Evolution Chart가 우하향 곡선 표시 확인
    7. 비교 카피 "권장 시간과 정확히 일치합니다" 표시
  </steps>
</test_scenario_12>

<test_scenario_13>
  <description>스파클링 — 디캔팅 절대 금지 안내</description>
  <steps>
    1. Sparkling 양식 + Champagne 데이터
    2. Recommendation Card 표시 확인:
       - "디캔팅 절대 금지 — 기포·산도 손실"
       - "권장: 즉시 음용, 빈티지는 잔에서 5~10분"
    3. DecantToggle "Yes" 클릭 시 시각적 경고 (border-color 빨강 또는 ⚠ 아이콘) 표시 — 단, 사용자 선택 자체는 차단하지 않음 (자유 의지 존중)
  </steps>
</test_scenario_13>

<test_scenario_10>
  <description>FloatingCTA 자동 숨김 + 다른 섹션 복귀</description>
  <steps>
    1. 페이지 상단(Hero)에서 FloatingCTA 표시 확인
    2. Burgundy 섹션 진입 → FloatingCTA 자동 숨김 (기존 동작)
    3. Tasting Note 섹션 진입 → FloatingCTA 계속 숨김 확인 (selector 배열에 '#tasting-note' 추가됨)
    4. Tasting Note 섹션 통과 후 VineyardStrip 진입 → FloatingCTA 다시 표시 확인
    5. selector 배열 검증: `floating-cta.tsx`의 IntersectionObserver가 ['#burgundy', '#tasting-note'] 둘 다 추적
  </steps>
</test_scenario_10>

</final_integration_test>

<success_criteria>
  <functionality>
    - 4종 양식 (White/Red/Sparkling/Blind) 모두 정상 토글 + morph 애니메이션 작동
    - 자동 데모 시퀀스가 양식별 mockup 와인 데이터로 정확하게 채움
    - 부케 휠 12 카테고리 + 약 200 어휘 정상 펼침/선택
    - WSET 5단계 슬라이더 5종 (당도/산도/바디/알코올/강도) + Red 타닌 + Sparkling 기포 모두 작동
    - 카우달리 카운트다운 정확 측정 (1초 = 1 caudalie, 카테고리 자동 분류)
    - 자동 묘사 문장이 입력 변경 시 200ms 디바운스 후 정확히 갱신
    - 결함 체크리스트 11종 다중 선택 가능, 명시적 체크만 기록
    - Blind 모드 4 항목 채점이 정답 매칭 로직대로 작동 (총점 0–100)
    - 임팩트 화합물 툴팁 12종 정상 표시
    - 한·영 동시 지원 (전역 locale + 휠 내부 토글 분리)
    - 모바일/태블릿/데스크톱 3 breakpoint 모두 정상 레이아웃
    - 웨이팅 리스트 모달 연결 (기존 패턴 그대로)
  </functionality>
  <user_experience>
    - 첫 진입 후 5초 안에 mockup 자동 데모 시퀀스가 흥미로운 콘텐츠로 채움
    - 사용자 hover/tap 시 자동 시퀀스 즉시 일시정지 (사용자 입력 우선)
    - 모든 인터랙션 200ms 이내 응답 (슬라이더, 칩 토글, 탭 전환)
    - 부케 휠 클릭 시 어휘 패널이 400ms 안에 펼쳐짐
    - 카우달리 측정의 progress ring이 60fps로 부드럽게 회전
    - 자동 묘사 typewriter 효과가 자연스럽게 진행 (글자당 8ms, chunked)
    - 모바일에서 sticky 탭 바가 스크롤 진행 중에도 항상 가시적
    - WCAG AA 콘트라스트 (4.5:1+) 모든 텍스트 검증
    - 모션 줄임 모드(prefers-reduced-motion)에서 자동 시퀀스·typewriter 비활성, 즉시 표시
    - 키보드 내비게이션 모든 인터랙션 가능 (Tab, ←/→, Enter, Esc)
  </user_experience>
  <technical_quality>
    - TypeScript strict 모드 통과 (`npx tsc --noEmit`)
    - ESLint 경고 0건 (`npm run lint`)
    - 빌드 성공 (`npm run build`) — 단, CLAUDE.md §10에 명시된 환경 이슈가 있으면 dev 서버 컴파일 + tsc로 대체 검증
    - 컴포넌트 단일 파일 ≤ 1100줄 (가독성 한계). 초과 시 lexicon 분리 (이미 분리)
    - 어휘 사전 정적 import — 동적 평가 없음 (XSS 노출 면 0)
    - SSR 안전 (window/document 직접 접근 없음)
    - i18n 키 동기화 (ko.json ↔ en.json) — 커밋 전 `commit-push` 스킬 자동 검증
    - 메모리 누수 없음 — 모든 useEffect cleanup 함수 등록 (타이머, IntersectionObserver, 자동 시퀀스)
    - 번들 크기 영향 +30KB gzipped 이내
  </technical_quality>
  <visual_design>
    - 기존 winemine 색 팔레트 100% 준수 (Wine Red, Gold, Cream, Deep Dark 등)
    - 신규 토큰(Aroma Category Colors 12, Form Paper Colors 3)이 winemine 톤과 조화
    - Playfair Display + Inter + Cormorant Garamond 일관성 (Burgundy 섹션과 동일)
    - 종이 양식의 격조 + 디지털 인터랙션의 우월함 메시지 시각적 전달
    - 한국어/영어 텍스트가 동일한 시각 hierarchy 유지
    - 부케 휠이 UC Davis Aroma Wheel을 연상시키되 winemine 다크 테마에 자연스럽게 녹아듦
    - 카우달리 미터가 시계·timer가 아니라 와인 잔의 흔적처럼 느껴지도록 (골드 + 와인 빨강 그라데이션)
  </visual_design>
  <wine_authority>
    - WSET SAT (Level 2/3/Diploma) 5단계 강도 척도 정확 사용
    - EU Commission Regulation (EC) No 607/2009 스파클링 7단계 당도 정확 표기
    - 카우달리 단위 + Peynaud의 PAI 개념 정확 인용
    - UC Davis Wine Aroma Wheel 12 카테고리 1:1 대응
    - 임팩트 화합물 12종 화학명·역치·대표 와인 정확
    - 결함 11종 cause·threshold·aroma 정확 (AWRI 기준)
    - 한국 와인 매체(미슐랭 가이드 코리아, 와인21닷컴, 소믈리에타임즈) 통용 표기 준수 — "부쇼네", "브렛", "휘발산", "환원취" 등
    - "와인 전문가가 봐도 이 친구들 진짜 와인 알고 있네" 인정 수준
  </wine_authority>
  <build>
    - dev 브랜치에서만 작업 — main 직접 push 금지
    - 커밋 메시지는 한국어 + commit-push 스킬 표준 (`feat(tasting-note): …`)
    - 변경 파일 ≤ 6개 (page.tsx, tasting-note-section.tsx, tasting-note-lexicon.ts, floating-cta.tsx, ko.json, en.json)
    - Vercel 배포 대비 — 환경 변수 변경 없음, 빌드 시 추가 step 없음
  </build>
</success_criteria>

<build_output>
  <build_command>npm run build (winemine 표준)</build_command>
  <bundle_changes>
    - +1 파일: `src/components/sections/tasting-note-section.tsx` (~1100줄 / ~13KB gzipped)
    - +1 파일: `src/lib/tasting-note-lexicon.ts` (~12KB gzipped, 어휘 200 + 결함 11 + 화합물 12 + 템플릿)
    - 수정: `src/app/page.tsx` (1줄 import + 1줄 마운트)
    - 수정: `src/components/ui/floating-cta.tsx` (selector 배열에 '#tasting-note' 추가)
    - 수정: `src/messages/ko.json`, `src/messages/en.json` (각 ~80 신규 키)
  </bundle_changes>
  <deployment_notes>
    - Vercel preview 배포 자동 (dev 브랜치 push 시)
    - 본 PR 머지는 사용자 검토 후 결정 (main에 직접 머지 금지)
    - dev 브랜치 → 별도 PR 생성 권장
  </deployment_notes>
</build_output>

<key_implementation_notes>

<critical_paths>
1. **CRITICAL: 데이터 모델 우선 확정** — `lib/tasting-note-lexicon.ts`의 `TastingNote` 타입과 enum이 컴포넌트보다 먼저 작성되어야 한다. Phase 2 앱이 그대로 받아쓸 수 있는 모델이므로 이름·필드·enum 신중히 결정. 후일 변경 시 마이그레이션 비용 발생.
2. **CRITICAL: 어휘 사전 정적 import** — 동적 import / eval / Function 생성자 사용 금지. XSS 면 노출. `lexicon.ts`에서 `export const ARO MA_CATEGORIES = [...] as const`로 freezing.
3. **CRITICAL: 데모 입력은 컴포넌트 로컬에서만 살아야 함** — localStorage / sessionStorage / cookie 미사용. 페이지 reload 시 초기 상태로 복귀. 사용자 데이터 사고 방지.
4. **CRITICAL: 자동 시퀀스 cleanup** — 모든 setTimeout / setInterval / requestAnimationFrame은 `useEffect` cleanup 함수에서 해제. 컴포넌트 unmount(다른 페이지 이동) 시 메모리 누수 방지.
5. **CRITICAL: i18n 키 동기화** — `ko.json` 기준으로 `en.json`을 미러링. 키 추가/수정 시 양쪽 동시 업데이트. 커밋 전 `commit-push` 스킬의 자동 검증 통과 필수.
6. **CRITICAL: WSET / Caudalie / EU Dosage 어휘 정확성** — 와인 전문가 지인이 검증할 가능성 높음. 잘못된 표기·범위는 신뢰 손상. 사내 리서치 문서 3종 직접 인용 (보지 않고 짐작 금지).
7. **CRITICAL: 오프닝 타임라인 라이브 타이머 cleanup** — `setInterval(1000)`이 컴포넌트 unmount 시 반드시 해제되어야 함. `useEffect` cleanup 함수에서 `clearInterval` 호출 누락 시 메모리 누수 + 백그라운드 페이지에서도 타이머 동작. CLAUDE.md 표준에 따라 모든 타이머는 `useEffect` 내부에서 시작·정지.
8. **CRITICAL: OPENING_GUIDE 메커니즘 카피 정확성** — "매우 오래된 레드는 즉시 음용", "스파클링은 디캔팅 금지" 같은 카피는 오답이 인격적 신뢰까지 깎음. 03_temporal_research.md §2.2의 디캔팅 시간 표를 그대로 인용 (창의적 해석 금지).
</critical_paths>

<recommended_implementation_order>
1. **Day 1: 어휘 사전 + 타입 모델**
   1.1. `lib/tasting-note-lexicon.ts` 신규 — `TastingNote` 타입, 12 AROMA_CATEGORIES, 약 200 어휘, 11 FAULTS, 12 IMPACT_COMPOUNDS, DESCRIPTION_TEMPLATES (ko/en)
   1.2. 어휘 사전 데이터 채우기 — 사내 리서치 02·03 문서를 직접 인용하여 ID·ko·en·appliesTo·impactCompound 채움
   1.3. `npx tsc --noEmit` 통과 확인

2. **Day 1: 페이지 마운트 + 빈 섹션 골격**
   2.1. `tasting-note-section.tsx` 신규 — `'use client'` + 헤더 + Form Tab Bar + 빈 컨텐츠 영역
   2.2. `page.tsx`에 import + 마운트 추가 (BurgundySection 직후)
   2.3. `floating-cta.tsx` selector 배열에 '#tasting-note' 추가
   2.4. dev 서버에서 헤더+탭 바 표시 확인

3. **Day 2: Phone Mockup + 4종 양식 골격**
   3.1. `PhoneMockup` 컴포넌트 — 베젤 + 종이 배경
   3.2. `FormPaperRender` 컴포넌트 — variant prop 받아 4종 양식 분기 렌더
   3.3. 양식 4종의 정적 골격 (헤더, 섹션 타이틀, 빈 슬라이더/체크박스/별점) — 데이터 채움 없음
   3.4. AnimatePresence로 양식 토글 시 morph 애니메이션 확인

4. **Day 2: WSET 슬라이더 + Tannin/Bubble 패널**
   4.1. `SliderRow` 재사용 컴포넌트 (5단계, 활성점 글로우)
   4.2. `TanninPanel` (Red 전용) — 강도 슬라이더 + 질감 칩 + 성숙도 라디오
   4.3. `BubblePanel` (Sparkling 전용) — 크기/지속/무쎄/압력/제조 + Dosage 7단계
   4.4. 슬라이더 값 변경 시 mockup 동기화 (state lift up)

5. **Day 3: 부케 휠 (시그니처 인터랙션)**
   5.1. `AromaWheel` SVG — 12 wedge 그리기 (수학: 30° per wedge, polar to cartesian)
   5.2. wedge hover/click 활성화 + ray expand 애니메이션
   5.3. 활성 wedge의 2·3차 어휘 패널 (PC: 우측 sliding, 모바일: 아래 collapse)
   5.4. 어휘 칩 hover 시 임팩트 화합물 툴팁
   5.5. 한·영 토글 (휠 내부)
   5.6. 카운트 배지 (선택된 어휘 수)

6. **Day 3: 카우달리 미터 + 결함 체크리스트**
   6.1. `CaudalieMeter` — progress ring SVG + 카운트다운 로직 (RAF)
   6.2. 카테고리 자동 분류 + 비교 한 줄 (5단계 비교 텍스트)
   6.3. `FaultChecklist` — 11 카드, 펼침/접힘, 명시적 체크
   6.4. 미세 진동 애니메이션 (측정 중)

6.5. **Day 3 (저녁): 오프닝 타임라인 / Opening Timeline**
   6.5.1. `lib/tasting-note-lexicon.ts`의 `OPENING_GUIDE` 9 카테고리 + `TIMEPOINT_PRESETS` 8 dot 작성
   6.5.2. `matchOpeningGuide(meta)` 매칭 함수 작성
   6.5.3. `OpeningTimeline` 컴포넌트 — Timeline Track SVG (8 dot) + LiveTimerChip + ActiveTimepointPanel
   6.5.4. DeltaSlider (-2 ~ +2) 5단계 + ReductionToggle + NewAromasMultiSelect + PeakStarToggle
   6.5.5. RecommendationCard + 사용자 Peak vs 권장 peak 비교 카피
   6.5.6. EvolutionChart (SVG polyline)
   6.5.7. 자동 묘사 박스의 evolution 템플릿 통합
   6.5.8. setInterval cleanup 검증 (unmount 메모리 누수 0)

7. **Day 4: 자동 묘사 문장 + Blind 모드**
   7.1. `AutoDescription` — useEffect 디바운스 200ms, 템플릿 placeholder 치환, typewriter 효과
   7.2. `BlindGuessForm` — 4 항목 입력
   7.3. `BlindReveal` 로직 — 정답 매칭 (각 25점)
   7.4. `ScoreCard` — 총점 + 등급 라벨

8. **Day 4: 자동 데모 시퀀스 + Smart Defaults**
   8.1. mockup 와인 데이터 (양식별 1–6종) `lexicon.ts`에 추가
   8.2. 자동 데모 시퀀스 — 메타 → 아로마 → 미각 → 피니시 → 별점 (각 단계 stagger)
   8.3. 사용자 hover 시 일시정지, 입력 시 영구 정지
   8.4. 양식 전환 시 자동 시퀀스 재시작

9. **Day 5: i18n + 모바일 반응형**
   9.1. `messages/ko.json`에 `tastingNote.*` 약 80 키 추가
   9.2. `messages/en.json` 미러링
   9.3. 모바일 layout — Form Tab Bar sticky, mockup 75vw, 부케 휠 collapse, 카우달리 180px
   9.4. 터치 인터랙션 — long-press 부케 wedge, swipe 양식 전환 (옵션)

10. **Day 5: QA + 마무리**
    10.1. 10개 통합 테스트 시나리오 수동 실행
    10.2. WCAG AA 콘트라스트 검증 (DevTools)
    10.3. 모션 줄임 모드 테스트 (`prefers-reduced-motion: reduce`)
    10.4. dev 서버 빌드 시간 확인
    10.5. `npx tsc --noEmit` + `npm run lint` 통과
    10.6. 와인 전문가 지인에게 양식·어휘·표기 검토 요청 (옵션)

11. **Day 6: 커밋 + Push**
    11.1. `commit-push` 스킬로 한 번에 — i18n 동기화 자동 검증 포함
    11.2. dev 브랜치 push
    11.3. 본 PR 생성 (사용자 검토 후 main 머지 결정)
</recommended_implementation_order>

<lexicon_authoring_guidelines>
**어휘 사전 작성 시 직접 인용할 사내 자료.**

1. **02_flavor_research.md §1.4** — 풍미 어휘 (영어 + 한국어 매핑, 약 200 항목). Fruity/Floral/Spicy/Herbal/Vegetal/Spice/Oak/Yeasty/Mineral 등 9개 그룹. 거의 그대로 사용 가능.
2. **02_flavor_research.md §1.3** — 품종별 시그니처 풍미 (Cab Sauv, Pinot Noir, Riesling, Sauv Blanc 등 20+). mockup 와인 데이터의 어휘 선택 근거.
3. **02_flavor_research.md §2.3** — 임팩트 화합물 약 20 종. Rotundone, Methoxypyrazine, TDN, Linalool, Geraniol, cis-Rose Oxide, β-Damascenone, 3MH, 4MMP, Diacetyl, DMS 등에서 12종 선별.
4. **02_flavor_research.md §2.4** — 결함 11종 cause·threshold·aroma. 그대로 사용.
5. **01_sensory_research.md §1.5 / 2.5 / 3.4 / 4.4** — 당도/산도/바디/기포 테이스팅 어휘 (영어 + 한국어). 슬라이더 라벨 + 자동 묘사 문장 풀 어휘.
6. **03_temporal_research.md §1.3** — 피니시 질적 평가 어휘 (clean·persistent·complex·…·hot·hollow·flat). FinishQualityChips의 칩 풀.

**번역 우선순위.**
- 한국 와인 매체 통용 표기 우선: "부쇼네"(Bouchonné), "브렛"(Brett), "휘발산"(VA), "환원취"(Reduction), "산화"(Oxidation), "라이트 스트럭"(Lightstruck)
- WSET 영문 표기 그대로 유지: "Brut Nature", "Extra Brut", "Caudalie", "Méthode Traditionnelle"
- 영어식 발음 표기 금지 — 부르고뉴 섹션의 한글 표기 정책 동일 ("게브레이" X → "주브레-샹베르탱" O)
- **오프닝(Opening up) 표기.** 코르크를 따고 일정 시간 둔 뒤 와인이 "열리는" 현상의 공식 표기는 "오프닝 타임라인 · Opening Timeline". 영문 "Opening up" / "Aeration" / "Decanting effect"와 동의어로 처리.
</lexicon_authoring_guidelines>

<performance_considerations>
- 부케 휠의 어휘 칩은 활성 wedge에 한해서만 렌더링 (240 칩 × 12 카테고리 = 2880 노드 회피)
- 자동 묘사 문장의 useEffect 디바운스 200ms (드래그 중 과도한 재계산 방지)
- typewriter 효과는 글자 단위가 아닌 chunked (3자 단위) 갱신
- Phone mockup의 자동 시퀀스는 모든 setTimeout cleanup 등록
- 카우달리 progress ring은 SVG path의 stroke-dasharray만 변경 (re-render 최소)
- Framer Motion `layout` prop은 양식 morph에만 적용 (다른 곳 비활성)
- 어휘 사전의 정적 데이터는 트리쉐이킹 가능 — 미사용 어휘는 빌드에서 제거되도록 named exports
- 12 임팩트 화합물 사전 모달은 dynamic import로 분리 가능 (옵션, 초기 렌더 영향 미미)
</performance_considerations>

<testing_strategy>
- 자동화 테스트 프레임워크 미사용 (winemine 표준)
- 검증 절차:
  1. `npx tsc --noEmit` — 타입 통과
  2. `npm run lint` — ESLint
  3. `npm run dev` — 개발 서버 컴파일 성공
  4. Chrome / Safari / Firefox 3 브라우저 수동 테스트
  5. 10개 통합 테스트 시나리오 수동 실행
  6. iOS Safari 모바일 (실기기 또는 Xcode 시뮬레이터) 검증
  7. WCAG AA 콘트라스트 검증 (Chrome DevTools Lighthouse)
- i18n 키 동기화는 `commit-push` 스킬 자동 실행 (CLAUDE.md §commit-push 참조)
</testing_strategy>

<tool_usage>
- **Framer Motion useTransform** — 부케 휠 회전, mockup morph
- **Framer Motion AnimatePresence mode="wait"** — 양식 토글 시 mockup 교체
- **requestAnimationFrame** — 카우달리 미터 (1초 단위, 1/30 원호 진행)
- **IntersectionObserver** — 섹션 진입 감지 (자동 데모 시퀀스 시작) + FloatingCTA 자동 숨김
- **useReducer** — 복잡한 입력 상태 (메타·아로마·미각·피니시·결함·평가) 단일 reducer로 관리
- **lucide-react** — 모든 아이콘 (Camera, Sparkles, Wine, Target …)
- **Cormorant Garamond** — mockup의 종이 양식 헤더 (Burgundy 섹션과 동일)
- **부르고뉴 섹션 재사용 컴포넌트** — `WineGlassIcon`, `BottleSilhouette`, `WineGlassRating` (`burgundy-section.tsx` 안에 정의됨, 필요 시 export 분리)
</tool_usage>

</key_implementation_notes>

</project_specification>
```

---

## 4. 검증 — 와인 전문가가 봤을 때 인정할 디테일 체크리스트

| 디테일 | 본 spec 반영 위치 |
|---|---|
| WSET SAT 5단계 강도 척도 | `<wset_slider>`, `core_data_entities.WSETScale` |
| EU Commission Regulation 607/2009 스파클링 7단계 | `<bubble_panel>`, `core_data_entities.SparklingDosage` |
| Caudalie 단위 + Peynaud의 PAI | `<caudalie_meter>`, `core_data_entities.FinishLength` |
| UC Davis Wine Aroma Wheel 12 카테고리 | `<aroma_wheel>`, `lexicon.AROMA_CATEGORIES` |
| 1차/2차/3차 아로마 발생 메커니즘 분리 | `core_data_entities.aroma.{primary, secondary, tertiary}` |
| 임팩트 화합물 12종 (Rotundone·TDN·Methoxypyrazine·Linalool·Geraniol·cis-Rose Oxide·β-Damascenone·3MH·4MMP·Diacetyl·DMS·Acetaldehyde) | `<impact_compound_glossary>`, `lexicon.IMPACT_COMPOUNDS` |
| 결함 11종 (Bouchonné·Brett·VA·Reduction·Oxidation·Heat·Mercaptan·Lightstruck·Geranium·Mousy·Cork) | `<fault_checklist>`, `lexicon.FAULTS` |
| 타닌 질감 21종 어휘 (silky → aggressive) | `core_data_entities.TanninTexture` |
| 제조 방식 5종 (Méthode Traditionnelle·Charmat·Asti·Ancestral·Unknown) | `<bubble_panel>`, `core_data_entities.palate.bubbles.method` |
| 한국 와인 매체 통용 표기 (부쇼네·브렛·휘발산·환원취) | `<lexicon_authoring_guidelines>` |
| 와인 오픈 후 시간축 변화 추적 (Opening up / Aeration) | `<opening_timeline>`, TL;DR §1 |
| 카우달리 비교 한 줄 ("Bordeaux Grand Cru 평균") | `<caudalie_meter>` 비교 텍스트 |
| 와인 타입별 권장 디캔팅 시간 9 카테고리 + 메커니즘 | `lexicon.OPENING_GUIDE` |
| 환원취(Reduction) 시간축 추적 + 사라짐 시각화 | `<opening_timeline>`, EvolutionPoint.reductionPresent |
| 사용자 Peak vs 권장 peak 비교 통계 카피 | `<opening_timeline_tracking>` 비교 로직 |
| 사내 리서치 3종 직접 인용 | `<lexicon_authoring_guidelines>` |
| Blind 모드 4 항목 채점 + 등급 (Master Sommelier 수준 …) | `<blind_mode>`, `<blind_mode_scoring>` |

---

## 5. 다음 단계 (사용자 결정 필요)

이 spec을 바탕으로 다음 중 무엇을 할지 사용자 결정:

1. **즉시 구현 시작** — `winemine-landing` 스킬을 호출해 11일 일정대로 dev 브랜치에서 구축
2. **부분 검토** — 특정 섹션(어휘 사전 / 부케 휠 / 카우달리 등)만 먼저 깊이 검토 후 spec 수정
3. **와인 전문가 지인 검토 의뢰** — spec 일부(특히 §lexicon, §aroma_wheel, §caudalie_meter, §fault_checklist)를 출력해 검토 받기
4. **MVP 축소** — 4 양식 중 White + Red만 우선, Sparkling/Blind는 Phase 2로 미루기

---

**문서 작성.** 2026-05-09 (Tasting Note 섹션 spec 초안, dev 브랜치)
**참조.** sample/tasting_note_1~4.png, ../wine/_workspace/01·02·03_research.md
**소스 spec writer.** project-spec-writer skill (XML schema 준수)
