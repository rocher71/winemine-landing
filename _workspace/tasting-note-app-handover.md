# Tasting Note — 앱 MVP 이관 핸드오버

> **이 문서의 위치.** winemine 랜딩 페이지에 이미 구현된 "테이스팅 노트" 영역을 기반으로, 실제 iOS/Android (혹은 RN/Expo) 앱 MVP를 만드는 팀을 위한 인계 문서. 랜딩 코드의 어떤 부분이 **그대로 옮길 수 있는 자산**이고, 어떤 부분이 **랜딩 전용 껍데기**이며, 앱에서 새로 만들어야 할 백엔드/저장/입력 흐름이 무엇인지 분리해 정리한다.
>
> **원본 사양 vs 본 문서.** 원래 사양은 `_workspace/tasting-note-section-spec.md` (1993줄, 데이터 모델·UX·구현 결정 전체) — 본 문서는 그 사양과 현재 구현(`feat/dev` 기준) 사이의 실제 코드 상태를 짧게 요약하고, 앱 이관 시 손에 잡히는 항목으로 정리한 것이다. 깊이가 필요하면 spec 원본을 참조한다.
>
> **버전 기준.** 브랜치 `dev`, 커밋 `7d8c4a4` 시점 (2026-05-12).

---

## 0. TL;DR — 이관 1줄 요약

> 랜딩에는 (a) 랜딩 섹션 안 **iPhone mockup 정적 디스플레이** 와 (b) `/tasting-note-playground` **완전 인터랙티브 데모** 두 가지가 있다. 데이터 모델·어휘 사전·계산 헬퍼·재사용 컴포넌트 9종은 앱이 거의 그대로 가져가 쓰면 되고, 저장·OCR·사진·셀러 동기화만 백엔드 쪽에서 새로 붙이면 된다.

---

## 1. 전체 그림

테이스팅 노트 시스템은 다음 4 레이어로 분리되어 있다.

```
┌─────────────────────────────────────────────────────────────┐
│  L1. 데이터 (lib/tasting-note-lexicon.ts, 1082줄)            │
│      - 타입, 어휘 사전, 결함·임팩트 화합물·오프닝 가이드,    │
│        묘사 템플릿, 라벨 맵, 헬퍼 함수                       │
│      → 앱에서 그대로 import 가능. 의존성 없음.               │
├─────────────────────────────────────────────────────────────┤
│  L2. 재사용 컴포넌트 (components/tasting-note/*)             │
│      - WSETSlider, AromaWheel, CaudalieMeter,                │
│        FaultChecklist, OpeningTimeline, AutoDescription,     │
│        BlindMode, TanninPanel, BubblePanel, BeginnerNote     │
│      → 앱에서 그대로 또는 RN 포팅. 입력 상태는 부모가 보유. │
├─────────────────────────────────────────────────────────────┤
│  L3. 페이지 컨테이너                                          │
│      a) src/components/sections/tasting-note-section.tsx     │
│         (2045줄) — 랜딩 안 mockup, 정적 디스플레이만         │
│      b) src/app/tasting-note-playground/page.tsx             │
│         (681줄) — 완전 인터랙티브 데모, useReducer 보유      │
│      → 앱은 (b)의 패턴을 따라 새 화면을 구성하는 게 빠름.    │
├─────────────────────────────────────────────────────────────┤
│  L4. i18n / 아이콘                                            │
│      - messages/{ko,en}.json (tastingNote.* 키)              │
│      - components/icons/wine-icons.tsx — 60+ SVG 커스텀      │
│      → 앱이 다른 i18n을 쓰면 키만 옮겨와도 됨.               │
└─────────────────────────────────────────────────────────────┘
```

**핵심 원칙 (랜딩 시점).**
- 모든 입력은 **로컬 state**만 (페이지 이탈 시 사라짐). DB/서버 호출 없음.
- waitlist 가입을 제외하면 어디에도 저장하지 않는다는 점이 의도된 사양.
- 데이터 모델(`TastingNote`)은 Phase 2 앱이 그대로 채택할 수 있도록 설계.

---

## 2. 두 진입점: Landing Mockup vs Playground

### 2.1 랜딩 안 mockup — `tasting-note-section.tsx`

- 마운트 위치: `src/app/page.tsx`의 4번째 섹션. `id="tasting-note"`로 hash 점프 가능.
- **인터랙티브 X.** 사용자는 `Mode (beginner/expert)` × `Variant (white/red/sparkling/blind)` 두 토글만 변경. 폼 안의 슬라이더·칩·별점 등은 모두 정적이다.
- 시각은 iPhone 14/15 mockup (Dynamic Island, status bar, home indicator) 안 종이 양식 4종.
- 모든 양식의 데이터는 `MOCK_WINES` (lexicon.ts) 안 4개 와인의 `presets` 필드를 그대로 렌더.
- "더 자세히 만져보고 싶다" 사용자를 위해 mockup 직후 **PlaygroundInviteCard**가 있고, 클릭 시 `/tasting-note-playground`로 이동.

랜딩 mockup에서 그대로 옮길 수 있는 시각 자산:
- **PhoneFrame** (sec-tn:591-739) — iPhone 베젤·Dynamic Island·signal/battery glyph
- **PaperHeader / PaperSection / MetaRow** — 종이 양식의 인쇄체 톤 (lex 분리)
- **CheckMark, WineGlassMark, ColorSwatch, Pill, GuessRow** — 작은 SVG 유틸

### 2.2 풀 인터랙티브 데모 — `tasting-note-playground/page.tsx`

- 별도 라우트 `/tasting-note-playground`. 랜딩과 분리된 페이지.
- **useReducer로 모든 입력 보유.** State 모양은 §3.1 참조.
- Beginner 모드: `BeginnerNote` 컴포넌트 하나로 끝. Blind 양식 비활성, white로 fallback.
- Expert 모드 (White/Red/Sparkling): Step 1~7 세로 흐름.
  1. Capture (Camera + 메타 카드) — 정적 mock 메타
  2. Aroma (`WSETSlider` + `AromaWheel`)
  3. Palate (`WSETSlider` 4 + variant별 `TanninPanel` 또는 `BubblePanel`)
  4. Finish (`CaudalieMeter`)
  5. Faults (`FaultChecklist`)
  6. Evolution (`OpeningTimeline`)
  7. Rating (별점 + `AutoDescription`)
- Expert 모드 (Blind): `BlindMode` 컴포넌트 하나.

**앱 이관 시 참고할 곳:** Playground의 reducer + 컴포넌트 조합이 그대로 앱 입력 화면의 베이스가 된다.

---

## 3. 데이터 모델

전체 타입은 `src/lib/tasting-note-lexicon.ts` 하나에 모여 있다. 앱은 이 파일을 그대로 의존성 없이 옮길 수 있다 (React/Framer Motion 의존 없음).

### 3.1 Playground 내부 State (현재 구현)

```ts
interface State {
  variant: FormVariant; // 'white'|'red'|'sparkling'|'blind'
  meta: {
    vintage: number | null;
    producer: string;
    region: string;
    wineName: string;
    grapeVarieties: string[];
  };
  aromaIntensity: WSETScale;
  aromaSelected: string[]; // lexicon entry IDs
  sweetness: WSETScale;
  acidity: WSETScale;
  body: WSETScale;
  alcohol: WSETScale;
  tannin: { intensity: WSETScale; texture: TanninTexture; ripeness: 'ripe'|'unripe'|'overripe' };
  bubbles: { size: BubbleSize; persistence: BubblePersistence; mousse: MousseTexture; pressure: number; method: SparklingMethod };
  dosage: SparklingDosage;
  caudalies: number;
  faults: Fault[];
  evolution: {
    openedAt: string | null;   // ISO 8601
    decanted: boolean;
    timepoints: EvolutionPoint[];
    peakIndex: number | null;
  };
  rating: number; // 0–5
}
```

해당 reducer 액션은 `playground/page.tsx:102–141` 참조.

### 3.2 영구 저장용 정식 모델 — `TastingNote`

`lib/tasting-note-lexicon.ts:622-701`. **이 모델이 Phase 2 앱이 그대로 채택할 스키마다.**

Playground state는 일부만 채우지만, 모델은 다음을 더 포함:
- `id, createdAt, appellation, pricePaid, drinkingPlace, servingFormat`
- `visual: { hue, depth, clarity, legs } | null` (Blind 양식 필수)
- `aroma.notes` (자유 텍스트)
- `palate.flavorIntensity, palate.flavorNotes[]`
- `finish.quality: FinishQuality[]`, `finish.descriptor`
- `structure: { balance, complexity, typicity }` — 0~100
- `evolution.notes` (자유 텍스트)
- `overall: { impression, rating (1-5), wouldBuyAgain }`
- `blindGuess: { grapeVariety, region, country, vintageGuess, priceRangeKRW, score }`

### 3.3 보조 타입

| 타입 | 값 | 용도 |
|---|---|---|
| `WSETScale` | `'low'\|'mediumMinus'\|'medium'\|'mediumPlus'\|'high'` | 모든 강도 차원 (당도·산도·바디·알코올·타닌·향 강도·풍미) |
| `FinishLength` | `'short'\|'medium'\|'long'\|'veryLong'` | Caudalie 4단계 (Peynaud) |
| `SparklingDosage` | 7단계 (`brutNature`~`doux`) | EU 607/2009 |
| `BubbleSize` | `'fine'\|'medium'\|'coarse'` | |
| `BubblePersistence` | `'fleeting'\|'steady'\|'persistent'\|'continuous'` | |
| `MousseTexture` | `'creamy'\|'silky'\|'frothy'\|'soft'\|'aggressive'` | |
| `SparklingMethod` | `'traditional'\|'charmat'\|'asti'\|'ancestral'\|'unknown'` | |
| `TanninTexture` | 21종 (silky → aggressive) | 부드러운→거친 그라데이션 |
| `Fault` | 11종 ID | `corked, brett, volatileAcidity, reduction, oxidation, heat, mercaptan, lightstruck, geranium, mousy, cork` |
| `FinishQuality` | 18종 (`clean, persistent, complex, ...`) | 피니시 인상 어휘 |
| `Delta` | `-2\|-1\|0\|1\|2` | Evolution 시점간 변화량 |
| `EvolutionPoint` | 시점별 입력 객체 | §3.4 참조 |

### 3.4 EvolutionPoint (오프닝 타임라인 단일 시점)

```ts
interface EvolutionPoint {
  minutesAfterOpen: number;       // 0, 15, 30, 60, 120, 180, 240, 360 또는 사용자 임의
  label: string;                  // 'T0', '15분', '1시간', ...
  aromaIntensityDelta: Delta;     // T0 대비 향 강도 변화
  tanninSoftnessDelta: Delta;     // T0 대비 타닌 부드러움 (Red만 의미)
  bodyDelta: Delta;               // T0 대비 바디
  reductionPresent: boolean;      // 환원취 유무
  newAromasEmerged: string[];     // 이 시점에서 새로 등장한 어휘 ID
  overallScore: 1|2|3|4|5;        // 이 시점 전반 점수
  note: string;                   // 자유 텍스트 한 줄
}
```

`evolution.peakIndex`는 `timepoints[]` 배열의 인덱스. 한 번에 하나만 ★ Peak.

---

## 4. 어휘 사전 (lexicon)

`lib/tasting-note-lexicon.ts` 한 파일에 전부 들어있다. 앱 이관 시 그대로 복사해서 쓰면 된다.

### 4.1 AROMA_CATEGORIES — UC Davis Wine Aroma Wheel 12 카테고리

| id | ko | en | color (hex) | icon key |
|---|---|---|---|---|
| `fruity` | 과일 | Fruity | `#C9A84C` | cherry |
| `floral` | 꽃 | Floral | `#E8B4D2` | rose |
| `spicy` | 향신료 | Spicy | `#A05A3D` | chili |
| `herbaceous` | 허브·식물 | Herbaceous | `#7A8B5C` | herb |
| `nutty` | 견과 | Nutty | `#8B6B47` | chestnut |
| `caramelized` | 캐러멜 | Caramelized | `#6B4423` | honey |
| `woody` | 나무·오크 | Woody | `#5C3A1E` | wood |
| `earthy` | 흙 | Earthy | `#4A3D32` | leaf |
| `chemical` | 화학 | Chemical | `#6A5D7B` | testTube |
| `pungent` | 자극 | Pungent | `#8B1A2A` | flame |
| `oxidized` | 산화·셰리 | Oxidized | `#7B5C3A` | whisky |
| `microbiological` | 미생물 | Microbiological | `#5C5C5C` | dna |

이 12 wedge가 `AromaWheel` SVG의 외곽 링을 채운다. 색상은 디자인 토큰이 아니라 어휘 데이터 자체에 포함되어 있다.

### 4.2 AROMA_LEXICON — 약 100개 2·3차 어휘

```ts
interface LexEntry {
  id: string;                     // 'lemon', 'cassis', 'tar', 'rotundone'
  category: AromaCategoryId;
  subcategory: string;            // 'citrus', 'black-berry', 'tar', ...
  ko: string;
  en: string;
  appliesTo: WineColor[];         // ['white','sparkling','blind'] 등
  impactCompound?: string;        // IMPACT_COMPOUNDS의 id 키
}
```

서브카테고리 예시 (fruity 안): `citrus, tree-fruit, red-berry, black-berry, tropical, dried-fruit`.

`appliesTo` 필터로 양식별 어휘 표시를 결정. 예: `lemon`은 `['white','sparkling','blind']`, `cassis`는 `['red','blind']`.

`LEX_BY_ID` (id → LexEntry) 인덱스가 미리 만들어져 있다 (`lexicon.ts:1068`).

### 4.3 IMPACT_COMPOUNDS — 임팩트 화합물 12종

`Rotundone, TDN, Methoxypyrazine (IBMP), Linalool, Geraniol, cis-Rose Oxide, β-Damascenone, 3MH, 4MMP, Isoamyl Acetate, Diacetyl, Acetaldehyde`.

각 entry는 `chemistry, threshold, note, primaryFor (lex id 배열), foundIn (품종 배열)`을 갖는다. AromaWheel의 어휘 칩 hover 시 한 줄 설명 노출용. `IMPACT_BY_ID` 인덱스 제공.

### 4.4 FAULTS — 결함 11종

```ts
interface FaultEntry { id: Fault; ko; en; cause; threshold; aroma; }
```

`FAULTS` 배열 11 entry. UI에서는 각 카드의 `cause / threshold / aroma`가 3줄로 표시되고, **체크는 사용자 명시적 클릭에만**. 자동 추론 금지 — UX 정책.

### 4.5 OPENING_GUIDE — 와인 타입별 권장 디캔팅 시간

9 카테고리: `young-full-red, young-medium-red, young-light-red, aged-red-10-20, very-old-red, vintage-port, young-full-white, aromatic-white, sparkling`. 각 entry는 `recommendedMinutes: { min, peak, max }`와 `rationale`을 갖는다.

`matchOpeningGuide(meta)` 함수 (`lexicon.ts:993`)가 와인 메타(variant·vintage·grape·region)에서 카테고리 추정. 우선순위: variant=sparkling > region=port > age >= 35 > age 10-20 + Cab/Tempranillo... > grape 매칭. **이 함수는 앱에서도 그대로 활용 가능**.

### 4.6 MOCK_WINES — 데모 와인 4종

랜딩 mockup이 보여줄 "이미 채워진 노트" 4종:

| variant | wine | producer | vintage | 가격 (KRW) | guideId |
|---|---|---|---|---|---|
| white | Puligny-Montrachet 1er Cru Les Pucelles | Domaine Leflaive | 2018 | 380,000 | young-full-white |
| red | Pommard 1er Cru Les Rugiens | Domaine de Courcel | 2017 | 280,000 | young-full-red |
| sparkling | Grande Cuvée 171ème Édition NV | Krug | NV | 450,000 | sparkling |
| blind | Pichon Baron 2eme Cru Classé | Château Pichon Longueville Baron | 2015 | 280,000 | young-full-red |

각 와인은 `presets` 안에 (aroma 강도+선택 어휘 ID 배열, palate 5차원, 타닌/기포/도사주, finish caudalie+quality, rating)을 미리 채워둔 정적 데이터.

**앱 이관 시:** 이 데이터는 데모 전용. 실제 앱에서는 사용자별 노트 컬렉션이 Supabase의 `tasting_notes` 테이블로 들어간다. `MockWine` 타입 자체는 데모 UI 외엔 안 쓰임.

### 4.7 DESCRIPTION_TEMPLATES — 자동 묘사 템플릿

`ko / en` 두 버전. `intro, introNV, aroma, palate, redTannin, sparkling, finish, finishNoCaudalie, evolution, rating, placeholder` 키로 구성. Placeholder는 `{vintage}, {region}, {producer}, {wineName}, {intensity}, {primary}, {secondary}, {body}, {acidity}, {sweetness}, {tannin*}, {bubble*}, {caudalies}, {finishLength}, {finishQuality}, {peakLabel}, {firstChange}, {newAromas}, {rating}`.

조립 로직은 `AutoDescription` 컴포넌트 안 `buildSentence()` 함수 (`auto-description.tsx:125`).

### 4.8 라벨 맵

| 상수 | 키 | 값 |
|---|---|---|
| `WSET_LABELS_KO / WSET_LABELS_EN` | WSETScale → 표시명 | "낮음/중간−/..." |
| `SWEETNESS_LABELS, ACIDITY_LABELS, BODY_LABELS, ALCOHOL_LABELS, TANNIN_INTENSITY_LABELS` | WSETScale → { ko, en } | "본 드라이 (Bone Dry)" 등 |
| `TANNIN_TEXTURE_LABELS` | TanninTexture (21) → { ko, en } | |
| `TANNIN_TEXTURE_GROUP_LABELS` | soft/fine/grippy/harsh | 그룹 헤더 |
| `FINISH_LENGTH_LABELS` | FinishLength → { ko, en, range } | "< 3 caudalies" 등 |
| `DOSAGE_LABELS` | SparklingDosage → { ko, en, range } | "< 12 g/L" 등 |
| `SPARKLING_METHOD_LABELS` | SparklingMethod → { ko, en, note } | 한 줄 설명 포함 |

### 4.9 헬퍼 함수

- `matchOpeningGuide(meta)` — 와인 메타 → OpeningGuideEntry
- `caudalieComparison(c, locale)` — 카우달리 → 비교 한 줄 ("Bordeaux Grand Cru Classé 수준")
- `caudalieCategory(c)` — 초 → FinishLength (`<3 short / 3–5 medium / 5–10 long / 10+ veryLong`)
- `LEX_BY_ID` / `IMPACT_BY_ID` — 인덱스 객체

---

## 5. 재사용 컴포넌트 카탈로그 (`components/tasting-note/`)

전부 `'use client'`, controlled component 패턴 (입력 state는 부모가 들고 있음). 외부 의존성: React + `@/components/icons/wine-icons` + `@/components/providers/locale-provider` + lexicon 자체.

### 5.1 `WSETSlider` (117줄)

```ts
<WSETSlider
  labelKey="tastingNote.dimensions.acidity"  // i18n key
  value={state.acidity}                      // WSETScale
  onChange={v => dispatch({ ... })}
  labels={ACIDITY_LABELS}                    // Record<WSETScale, {ko,en}>
  hint="옵션 — 한 줄 설명"
/>
```

5점 도트 슬라이더. 클릭 + 키보드 좌우 화살표 지원. 활성 점은 골드 발광.

### 5.2 `AromaWheel` (273줄)

```ts
<AromaWheel
  variant={state.variant}
  selected={state.aromaSelected}             // string[] (lex id 배열)
  onToggle={id => dispatch({ ... })}
/>
```

320×320 SVG 원형 휠 + 활성 카테고리의 어휘 칩 패널. 내부 state:
- `activeCat: AromaCategoryId | null` — 현재 펼쳐진 wedge (초기값 `'fruity'`)
- `hoveredLex: string | null` — 임팩트 화합물 툴팁용

`AROMA_LEXICON.filter(l => l.appliesTo.includes(variant))`로 양식별 어휘 자동 필터링.

### 5.3 `CaudalieMeter` (199줄)

```ts
<CaudalieMeter caudalies={state.caudalies} onChange={n => dispatch({...})} />
```

220px 원형 progress ring + 중앙 큰 숫자. `requestAnimationFrame`으로 1초당 1 카운트, 30초까지 ring 진행 (그 이후 숫자만 증가). Tap to start → Tap to stop, Reset 버튼 별도. 정지 시 `caudalieCategory()`로 분류 + `caudalieComparison()`로 비교 카피.

### 5.4 `FaultChecklist` (122줄)

```ts
<FaultChecklist selected={state.faults} onToggle={id => dispatch({...})} />
```

11 카드 grid (auto-fill, minmax 220px). 펼침/접힘 토글. 각 카드는 `cause / threshold / aroma` 3줄. 사용자 명시적 체크만 기록 — 자동 추론 금지가 푸터 카피로 명시.

### 5.5 `OpeningTimeline` (439줄, 가장 복잡)

```ts
<OpeningTimeline
  variant={state.variant}
  meta={{ vintage, grapeVarieties, region }}
  state={state.evolution}
  onOpenedAt={iso => dispatch({...})}
  onDecant={b => dispatch({...})}
  onUpsert={tp => dispatch({...})}
  onPeak={idx => dispatch({...})}
/>
```

상단 컨트롤(코르크 오픈 시각 picker + 디캔터 토글 + 라이브 타이머 chip) + 가로 8 dot timeline + 활성 timepoint 입력 카드 + Recommendation 카드 (`matchOpeningGuide` 활용) + SVG 라인 차트.

`setInterval(1000)`로 라이브 타이머 갱신 (코르크 오픈 시각 설정 시). cleanup 처리됨.

### 5.6 `AutoDescription` (228줄)

```ts
<AutoDescription
  variant meta aroma palate finish rating
  evolution={{ peak: state.evolution.timepoints[peakIndex] ?? null }}
  onCTA={openModal}    // waitlist CTA
/>
```

`useEffect` + 디바운스 200ms로 입력 변경 감지 후 `buildSentence()` 호출 → 자동 묘사 문장 생성. 골드 박스 안 Playfair italic 17px. CTA 버튼은 옵션.

### 5.7 `BlindMode` (270줄)

```ts
<BlindMode onCTA={openModal} />
```

내부 state로 4 입력 (grape/region/vintage/price) 보유. "정답 공개" 클릭 시 채점 (각 항목 25점, 총 100점) + 등급 라벨 (`rankMaster / rankAdvanced / rankEnthusiast / rankExploring / rankFinding`).

**현재 정답은 하드코드 (Pichon Baron 2015).** 앱 이관 시 정답을 prop 또는 외부 데이터로 받도록 변경 필요. `compute()` 함수 (`blind-mode.tsx:247`)도 케이스 매칭 하드코드.

### 5.8 `TanninPanel`, `BubblePanel` (257줄, 둘 한 파일)

```ts
<TanninPanel state={state.tannin} onChange={tannin => dispatch({...})} />
<BubblePanel
  bubbles={state.bubbles}
  dosage={state.dosage}
  onBubbles={...}
  onDosage={...}
/>
```

TanninPanel: WSETSlider(강도) + 21 texture 칩 4 그룹(soft/fine/grippy/harsh) + 성숙도 3택.

BubblePanel: 기포 크기 라디오 + 지속성 4단계 + 무쎄 칩 + 압력 슬라이더 1-6 bar + 제조 방식 5택 + EU 도사주 7택.

### 5.9 `BeginnerNote` (699줄)

```ts
<BeginnerNote variant={effectiveVariant} wineName producer />
```

WSET 5단계 → 3단계 (low/mid/high), 어휘 200개 → 8 큰 카테고리(berry, citrus, stoneFruit, floral, spice, sweet, earth, yeast), 카우달리/결함/자동묘사 X. 입문자가 5분 안에 끝낼 수 있는 단순화 모드.

내부 state로 모든 입력 자체 보유 — 부모와 단방향. 앱에서 입문 화면 만들 때 그대로 또는 거의 그대로 쓸 수 있음.

---

## 6. 디자인 토큰 (테이스팅 노트 영역에서 쓰이는 색)

| 토큰 | hex | 용도 |
|---|---|---|
| Gold | `#C9A84C` | 강조, 활성 점, 골드 외곽선, "기록" eyebrow |
| Wine Red | `#8B1A2A` | 활성 wedge·CTA, Wine Red 와인글라스, Pichon Baron 정답 카드 |
| Wine Red Light | `#A02030` | hover, expert 모드 강조 |
| Cream | `#F5F0E8` | 종이 양식 배경, 본문 텍스트(어두운 배경) |
| Paper Ink | `#1A0A1E` | 종이 양식 위 텍스트(잉크) |
| Paper Ink Dim | `rgba(26,10,30,0.42)` | 종이 양식 보조 텍스트 |
| Paper Line | `rgba(26,10,30,0.10)` | 종이 양식 구분선 |
| Deep Dark | `#0A050F` | 섹션 배경 (랜딩) |
| Deepest Dark | `#05020A` | playground 페이지 배경 |
| Surface | `rgba(15,7,24,0.6)` | 카드 배경(어두운 배경 위) |
| Border | `#2D1540` | 어두운 배경 위 1px 보더 |
| Muted Text | `#9B8B7A` | 보조 텍스트 |
| Secondary Text | `#D4C5B0` | 본문(어두운 배경) |

폰트:
- **Playfair Display** (serif) — 와인 이름, 섹션 제목, 자동 묘사 박스
- **Inter** (sans-serif) — 본문, 칩, 슬라이더 라벨
- **Noto Sans KR** — 한국어 fallback (globals.css 스택)

---

## 7. i18n

`tastingNote.*` 네임스페이스. 키 구조는 `src/messages/ko.json:47` ~ 양쪽 파일(en/ko) 동기화 필수.

대표 키 그룹:
- `tastingNote.eyebrow / heading / subhead` — 섹션 헤더
- `tastingNote.tabs.{white,red,sparkling,blind}` — 양식 탭
- `tastingNote.steps.{capture,aroma,palate,finish,faults,evolution,rating,blind}` — 단계명
- `tastingNote.scale.{low,mediumMinus,medium,mediumPlus,high}` — WSET 라벨
- `tastingNote.dimensions.*` — 차원명
- `tastingNote.aroma.*` — 부케 휠 카피
- `tastingNote.caudalie.*` — Caudalie 측정기 카피
- `tastingNote.faults.{title,intro,footnote}` — 결함 체크리스트
- `tastingNote.evolution.*` — 오프닝 타임라인 (가장 많은 키)
- `tastingNote.beginner.*` — 입문자 모드 카피
- `tastingNote.blind.*` — Blind 모드 카피
- `tastingNote.mockup.*` — 랜딩 mockup 안 카피 (앱에선 거의 안 씀)
- `tastingNote.playground.*` — playground 페이지 카피
- `tastingNote.autoDescription.{title,placeholder,saveCta}` — 자동 묘사

**앱 이관 시 주의.** 위 키 중 `mockup.*`은 랜딩 mockup 전용 (종이 양식 라벨 등). 실제 앱 화면은 `playground.*, evolution.*, beginner.*, blind.*, dimensions.*, scale.*, caudalie.*, faults.*`만 가져가면 됨.

---

## 8. 아이콘 시스템 (`components/icons/wine-icons.tsx`)

60+ 커스텀 SVG 아이콘. `lucide-react`가 표현하지 못하는 와인 도메인 전용 그림이 많아 직접 그렸다. 모두 `IconProps = { size?: number; color?: string; className?: string; 'aria-hidden'?: boolean }`를 받음.

테이스팅 노트 영역에서 쓰이는 주요 아이콘:
- **와인 잔/병:** WineGlassRedIcon, WineGlassWhiteIcon, ChampagneFluteIcon, GrapeIcon, ToastingFlutesIcon
- **아로마 휠 카테고리:** CherryIconSimple, RoseIcon, ChiliIcon, HerbIcon, ChestnutIcon, HoneyJarIcon, WoodIcon, LeafIcon, TestTubeIcon, FlameIcon, WhiskyGlassIcon, DnaIcon
- **입문자 카드:** StrawberryIcon, LemonIcon, PeachIcon, BreadIcon, NutIcon, SproutIcon, PinkRoseIcon
- **표정 (입문자 모드 첫 인상):** StarEyesFaceIcon, SmileFaceIcon, ThinkingFaceIcon
- **타이머/측정:** StopwatchIcon, ClockIcon, HourglassIcon, RefreshIcon
- **상태/표시:** CheckIcon, CrossIcon, ArrowRightIcon, ArrowLeftIcon, ArrowUpIcon, ArrowDownIcon, StarFilledIcon, StarBurstIcon, SparkleIcon, SparkleSmallIcon, WarningTriangleIcon, TrophyIcon, TargetIcon, EyeIcon, LightbulbIcon, GraduationCapIcon, CheckboxEmptyIcon, CheckboxCheckedIcon, BoltIcon, FerrisWheelIcon

RN으로 포팅 시 `react-native-svg`로 거의 1:1 옮길 수 있는 단순 path들.

---

## 9. 앱 MVP 이관 가이드

### 9.1 그대로 옮길 것 (의존성 최소, 비주얼/플랫폼 비종속)

| 자산 | 위치 | RN 이관 난이도 |
|---|---|---|
| 타입 + 어휘 사전 + 헬퍼 | `lib/tasting-note-lexicon.ts` (1082줄) | ★ (Pure TS, 그대로) |
| AROMA_CATEGORIES, AROMA_LEXICON, FAULTS, IMPACT_COMPOUNDS, OPENING_GUIDE, DESCRIPTION_TEMPLATES, MOCK_WINES, 모든 라벨 맵 | 동상 | ★ |
| `matchOpeningGuide(), caudalieComparison(), caudalieCategory()` | 동상 | ★ |
| 자동 묘사 문장 생성 (`buildSentence()`) | `components/tasting-note/auto-description.tsx:125` | ★ (UI 분리 후 함수만) |
| Blind 채점 (`compute()`, `rankLabel()`) | `components/tasting-note/blind-mode.tsx:247-271` | ★ (정답 prop으로 바꾸기만 하면) |
| SVG 아이콘 60+ | `components/icons/wine-icons.tsx` | ★★ (RN은 `react-native-svg` 포팅 필요) |

### 9.2 로직 옮기고 UI 다시 짤 것

| 자산 | RN 이관 시 고려 |
|---|---|
| `WSETSlider` | 5도트 스냅 슬라이더 — RN Gesture Handler로 다시 작성 (또는 단순 5택 칩) |
| `AromaWheel` | 320 SVG 휠 — `react-native-svg` 가능. 큰 손가락 tap 영역 고려해 휠 자체 크게. |
| `CaudalieMeter` | RAF 대신 `setInterval` (RN 호환). progress ring은 `react-native-svg-charts`도 가능 |
| `OpeningTimeline` | 가장 큰 변경 필요. 라이브 타이머는 BG에서도 돌아야 하므로 push notification 연동 검토 |
| `FaultChecklist` | 그리드 → RN FlatList numColumns=2 |
| `BlindMode` | 정답 데이터 외부 주입형으로 변경. 채점 함수만 lib로 분리 |
| `TanninPanel / BubblePanel` | 칩 그리드, 라디오 — 단순 |
| `BeginnerNote` | 거의 그대로 — 단순 토글 + 칩 |
| `AutoDescription` | 골드 박스 + 타이프라이터 → RN Animated.View |

### 9.3 새로 만들 것 (랜딩에 없음)

1. **사진/OCR 파이프라인.** 라벨 사진 → Google Cloud Vision (또는 자체 모델) → wine name/producer/vintage 자동 추출. 현재는 mock 메타.
2. **데이터베이스 저장.** Supabase에 `tasting_notes` 테이블 + RLS + 사용자별 컬렉션. 모델은 `TastingNote` 그대로 사용 (§3.2).
3. **사용자 인증.** waitlist 사용자 → 정식 계정 전환 흐름.
4. **셀러 동기화.** 마신 와인 누적 → 셀러/지도(랜딩의 Hero 세계지도와 연동) 시각화.
5. **AI 부케 분석.** 사용자가 슬라이더+칩 선택 → LLM이 자연어 시음노트 작성 (현재 `AutoDescription`은 템플릿 치환).
6. **빈티지 비교.** 같은 와인의 여러 빈티지 노트 timeline.
7. **알림.** 코르크 오픈 후 권장 디캔팅 시간에 푸시 ("이제 마실 시간!").
8. **시간 추적 백그라운드.** OpeningTimeline의 라이브 타이머는 앱이 백그라운드여도 유지되어야 함.

### 9.4 권장 작업 순서

1. **lib 복사.** `tasting-note-lexicon.ts` 그대로 → 앱 레포 `src/lib/`.
2. **아이콘 포팅.** `wine-icons.tsx`의 SVG들을 `react-native-svg` 컴포넌트로 옮김 (또는 SVG → React Native SVG 자동 변환 도구 사용).
3. **TastingNote 백엔드.** Supabase `tasting_notes` 테이블 생성 (`TastingNote` 인터페이스 1:1). RLS: 본인 row만 read/write.
4. **하나의 양식부터.** Red 양식 expert 모드 한 화면을 먼저 끝까지. Playground의 Step 1~7 구조를 그대로 따르되 RN 네이티브 컴포넌트로.
5. **나머지 양식.** White/Sparkling은 Red의 변형 — 타닌 패널을 빼고 기포 패널/도사주를 넣는 식.
6. **Beginner mode.** `BeginnerNote` 그대로 RN 포팅 (가장 단순).
7. **Blind mode 마지막.** 정답 데이터 소스 결정 후 (curator 등록 + 사용자 도전?) 추가.

---

## 10. 알려진 한계 / 디버깅 노트

- **MOCK_WINES.blind의 정답이 BlindMode 컴포넌트 내부와 따로 하드코드.** 둘이 일치하긴 하지만, 한쪽만 바꾸면 깨짐. 앱에선 외부 데이터 일원화.
- **AromaWheel은 `activeCat` 초기값 `'fruity'`로 자동 펼침.** UX 의도지만 첫 진입 후 "내가 안 눌렀는데 펼쳐져 있다" 혼란 가능.
- **CaudalieMeter는 30초까지만 ring이 진행.** 그 이상은 카운트만 증가. 디자인 결정 (피니시 30초+는 극단치).
- **OpeningTimeline의 라이브 타이머는 페이지 리프레시 시 사라짐.** localStorage 미사용 — 데모 의도. 앱에선 백엔드 저장.
- **AutoDescription은 placeholder가 비어있어도 일단 노출 (`minHeight: 80`).** 첫 진입 시 짧은 placeholder 문장만 보임.
- **`tastingNote.mockup.*` i18n 키는 랜딩 mockup 전용** — 앱이 이걸 import 하면 안 됨. `playground.*`을 베이스로 사용.
- **랜딩의 sec-tn.tsx는 2045줄 단일 파일.** 이건 랜딩 전시용이므로 굳이 분리 안 함. 앱은 처음부터 컴포넌트 단위 분리 권장.

---

## 11. 참고 자료 / 외부 출처

코드 안에 인용된 출처 (앱 화면에 표시되는 학술 용어들이 근거 있는 것임을 사용자에게 보일 때 유용):

- **WSET Systematic Approach to Tasting (Level 2/3/Diploma)** — 5단계 강도 척도
- **EU Commission Regulation (EC) No 607/2009** — 스파클링 도사주 7단계
- **UC Davis Wine Aroma Wheel (Ann C. Noble, 1980s)** — 12 카테고리 + 위계
- **Émile Peynaud, *Le Goût du Vin*** — 카우달리 단위, PAI(la persistance aromatique intense)
- **Australian Wine Research Institute (AWRI)** — 결함 화합물 역치
- **Master Sommeliers Grape Variety Profiles**

사내 리서치 (`../wine/_workspace/`):
- `01_sensory_research.md` — 당도·산도·바디·기포 4차원
- `02_flavor_research.md` — Aroma Wheel + 결함 + 임팩트 화합물
- `03_temporal_research.md` — 카우달리 + 잔내 변화 + 디캔팅

원본 종이 양식 4종 (랜딩 mockup의 디자인 원형):
- `sample/tasting_note_1~4.png` — White / Red / Sparkling / Blind

---

## 12. 관련 문서

- `_workspace/tasting-note-section-spec.md` — 원래 XML 사양 (1993줄). UX 결정·인터랙션 디테일·접근성·키보드 단축키 등 깊이 필요할 때.
- `_workspace/wine-discovery-section-spec.md` — 초보자 측 섹션 (페어링 헤더의 한 쪽).
- `_workspace/burgundy-section-spec.md` — 전문가 측 섹션 (페어링 헤더의 다른 쪽).
- `WINEMINE_LANDING_SPEC.md` — 전체 랜딩 페이지 사양.
- `PRODUCT_PLAN.md` — 서비스 비전·타겟·로드맵.
- `design.md` — 디자인 시스템 단일 참조.
- `CLAUDE.md` — 프로젝트 컨벤션, 환경 변수, 보안 규칙.
