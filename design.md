# winemine — Design System

> 와인 라벨을 촬영하면 AI가 인식하고, 마신 와인을 세계 지도 위에 기록하는 서비스.
> 이 문서는 winemine 전반의 디자인 방향성, 색상, 타이포그래피, 컴포넌트·인터랙션 원칙을 정리한 단일 참조 문서다.

---

## 1. 무드 & 톤

**한 줄로:** "어두운 밤, 와인 한 잔. 프리미엄 와인 라벨의 무게감."

winemine은 가벼운 SaaS 톤이 아니라, **고급 와인 셀러의 어두운 조명**을 디지털로 옮긴 인상을 추구한다.

| 키워드 | 적용 방식 |
|--------|----------|
| **Dual Mode** | **다크 = 와인 셀러 컨셉(보라/와인-레드)**, **라이트 = 화이트 와인 컨셉(크림/골드)** — 두 모드 자동 + 수동 토글 지원 |
| **Premium Wine Label** | 크림(#F5F0E8)·골드(#C9A84C)·와인 레드(#8B1A2A) 3색의 라벨 같은 조합 |
| **Cinematic** | 세계 지도 슬라이딩 배경, scan line 애니메이션, 글래스 카드 적층 |
| **Quiet Confidence** | 큰 글씨 + 충분한 여백, 장식 최소화. Playfair Display의 정제된 세리프 |
| **Earnest, not flashy** | 네온/그라데이션 남발 금지. 액센트 글로우는 핵심 포인트에만 사용 |

### 1-1. 모드별 인상 차이

- **다크 모드 (기본):** 와인 셀러의 어두운 조명. Deep wine-purple 배경(#100A1F) + wine-red 액센트(#8B1A2A). "한 잔의 무게감".
- **라이트 모드 (white-wine 컨셉):** 햇살에 비친 크림 페이퍼. Cream 배경(#FBF7F0) + gold 액센트(#C9A84C). "화이트 와인의 가벼움과 우아함".

두 모드 모두 와인 라벨 미감을 유지하되, 배경/액센트 컬러로 다른 시간대를 표현한다.

**피해야 할 것**
- 밝은 화이트 배경, 파스텔 컬러, 코랄/민트 같은 트렌디 톤
- 과한 그라데이션, 무지개 톤, 글래스모피즘 남용
- "테크 스타트업" 느낌의 sans-serif 빅 타이포 + 컬러 일러스트

---

## 2. 색상 팔레트

CSS 변수는 `src/app/globals.css`에 3블록으로 정의되어 있다:

1. **`:root`** — 라이트 모드 기본값 (mode-invariant brand 색상 포함)
2. **`@media (prefers-color-scheme: dark) :root:not([data-theme="light"])`** — 시스템 다크 모드
3. **`:root[data-theme="dark"]`** — 수동 다크 토글 (`ThemeProvider`가 localStorage 기반으로 세팅)

**globals.css가 single source of truth.** 색상 변경 시 라이트/다크 두 블록을 반드시 동기 수정. 컴포넌트에는 `var(--color-*)` 토큰만 사용하고 하드코딩 HEX는 금지.

### 2-1. Brand & Accent (mode-invariant)

| 토큰 | HEX | 용도 |
|------|-----|------|
| Wine Red | `#8B1A2A` | 다크 모드 CTA, 페이퍼 mockup의 와인-레드 액센트 |
| Wine Red Hover | `#A02030` | 다크 모드 CTA hover |
| Gold | `#C9A84C` | 라이트 모드 CTA, 장식선, 아이콘 (mode-invariant brand) |
| Gold Soft | `#B08D57` | 라이트 모드 CTA hover |
| Gold Bright | `#E8C97A` | 강조 골드 (sparkling 와인 색 등) |
| Cream | `#F5F0E8` | 라벨 페이퍼 색, paper mockup 배경 (mode-invariant) |
| Error | `#EF4444` | 폼 검증 에러 |

### 2-2. Dark Mode (와인 셀러 컨셉)

**Background:**

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-bg-deepest` | `#100A1F` | 페이지 주 배경 (body) |
| `--color-bg-deep` | `#170D2C` | 교차 섹션 배경 |
| `--color-bg-surface` | `#2D1A4A` | 카드/모달/패널 (ΔL\* ≈ 13 elevation) |
| `--color-bg-map` | `#2A1844` | input 배경, map-themed 컨테이너 |

**Map-specific (별도 토큰 — 의도적으로 더 어두움):**

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-map-bg` | `#0d0810` | 세계지도 SVG 오션 베이스 |
| `--color-map-inactive` | `#2A1552` | 비활성(non-wine) 국가 fill |
| `--color-map-stroke` | `#4A2080` | 국가 경계선 |

**Text:**

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-text-primary` | `#F5F0E8` | 제목, 본문 주요 텍스트 (Cream) |
| `--color-text-secondary` | `#D4C5B0` | 보조 본문, 부제 |
| `--color-text-muted` | `#9B8B7A` | 설명, 캡션 |
| `--color-text-disabled` | `#4A3D56` | placeholder, footer, 비활성 |

**Border:**

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-border` | `#2D1540` | 기본 분리선, 카드 보더 |
| `--color-border-soft` | `rgba(255,255,255,0.06)` | 미세 분리선 |
| `--color-border-active` | `var(--color-wine-red)` | 포커스/선택 |

### 2-3. Light Mode (화이트 와인 컨셉)

**Background:**

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-bg-deepest` | `#FBF7F0` | 페이지 주 배경 (cream) |
| `--color-bg-deep` | `#F5EFE3` | 교차 섹션 배경 |
| `--color-bg-surface` | `#FFFBF2` | 카드/모달/패널 (살짝 더 밝게) |
| `--color-bg-map` | `#EAE0CC` | input 배경 |

**Map-specific:**

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-map-bg` | `#F0E7D2` | 세계지도 SVG 베이스 (cream) |
| `--color-map-inactive` | `#E0D2B5` | 비활성 국가 fill |
| `--color-map-stroke` | `#C9B894` | 국가 경계선 (medium tan) |

**Text:**

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-text-primary` | `#2A1F12` | 제목, 본문 주요 텍스트 (짙은 갈색) |
| `--color-text-secondary` | `#5A4830` | 보조 본문, 부제 |
| `--color-text-muted` | `#8B7A60` | 설명, 캡션 |
| `--color-text-disabled` | `#B8A88E` | placeholder, footer |

**Border:**

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-border` | `rgba(201,168,76,0.30)` | 골드 30% alpha — cream 배경 위 부드러운 분리선 |
| `--color-border-soft` | `rgba(42,31,18,0.10)` | 미세 분리선 |
| `--color-border-active` | `var(--color-gold)` | 포커스/선택 |

### 2-4. Mode-aware Accent (라이트=골드 / 다크=와인-레드 자동 전환)

CTA, 활성 버튼, 지도 와인 국가 fill 등은 모드에 따라 액센트 색이 자동 전환된다.

| 토큰 | 라이트 | 다크 | 용도 |
|------|--------|------|------|
| `--color-accent` | `#C9A84C` (gold) | `#8B1A2A` (wine-red) | CTA bg, 활성 버튼 bg, 강조 텍스트 |
| `--color-accent-hover` | `#B08D57` | `#A02030` | hover 변형 |
| `--color-accent-shadow-soft` | `rgba(201,168,76,0.45)` | `rgba(139,26,42,0.45)` | 그림자 (기본) |
| `--color-accent-shadow-strong` | `rgba(201,168,76,0.60)` | `rgba(139,26,42,0.60)` | 그림자 (hover) |
| `--color-accent-tint` | `rgba(201,168,76,0.12)` | `rgba(139,26,42,0.12)` | 카드 bg 미묘한 tint |
| `--color-map-wine-fill` | `#C9A84C` (gold) | `#C41E3A` (wine-red) | 지도 와인 생산국 fill |

### 2-5. Gold Tint (mode-aware 알파 변형)

| 토큰 | 라이트 (높은 alpha) | 다크 (낮은 alpha) | 용도 |
|------|---------------------|-------------------|------|
| `--color-gold-tint-faint` | `rgba(201,168,76,0.18)` | `rgba(240,200,118,0.10)` | 매우 옅은 골드 워시 |
| `--color-gold-tint-soft` | `rgba(201,168,76,0.28)` | `rgba(240,200,118,0.18)` | 칩/뱃지 배경 |
| `--color-gold-tint-med` | `rgba(201,168,76,0.45)` | `rgba(240,200,118,0.30)` | 중간 강조 |
| `--color-gold-tint-strong` | `rgba(201,168,76,0.65)` | `rgba(240,200,118,0.55)` | 강한 강조 |

라이트 모드는 cream 배경 위에서 골드 톤이 묻히지 않도록 alpha를 더 높게 설정.

### 2-6. Overlay (모드에 맞춘 흰/검 직접 대체)

| 토큰 | 라이트 | 다크 | 용도 |
|------|--------|------|------|
| `--overlay-soft` | `rgba(42,31,18,0.04)` | `rgba(255,255,255,0.04)` | 매우 옅은 오버레이 |
| `--overlay-medium` | `rgba(42,31,18,0.08)` | `rgba(255,255,255,0.08)` | 중간 오버레이 |
| `--overlay-strong` | `rgba(42,31,18,0.16)` | `rgba(255,255,255,0.16)` | 강한 오버레이 |

`rgba(255,255,255,X)` / `rgba(0,0,0,X)` 직접 사용 금지 — 항상 위 토큰을 쓴다.

### 2-7. 페이퍼 (mode-invariant)

테이스팅 노트 mockup 종이는 모드 무관 cream paper.

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-paper` | `#F5F0E8` | 종이 mockup 배경 (두 모드 동일) |
| `--color-ink` | `#1A0A1E` | 종이 위 잉크 색 |
| `--color-ink-dim` | `rgba(26,10,30,0.42)` | 흐린 잉크 (보조 정보) |
| `--color-ink-very-dim` | `rgba(26,10,30,0.18)` | 매우 흐린 잉크 |
| `--color-ink-line` | `rgba(26,10,30,0.10)` | 종이 분리선 |

### 2-8. 사용 가이드

**필수 규칙:**
- 색상 변경 시 **항상 light/dark 블록을 각각 별도로 수정**한다. 한쪽만 바꾸면 회귀 발생.
- 컴포넌트에는 `var(--color-*)` 토큰만 사용. 하드코딩 HEX는 도메인 의미가 있는 경우에만 (예: 와인병 SVG foil 색).
- 다크 모드 전용 패치는 `@media (prefers-color-scheme: dark)`와 `:root[data-theme="dark"]` **양쪽에 똑같이** 넣는다.

**CTA / 액센트:**
- 페이지-레벨 CTA(FloatingCTA, StoreButtons 등): `var(--color-accent)` + `var(--color-accent-hover)` — 모드에 따라 자동 전환
- 페이퍼 mockup 내부 액센트: `var(--color-accent)` — cream 종이 위 mode-aware
- 와인 생산국 fill (지도): `var(--color-map-wine-fill)` — 라이트=골드, 다크=와인-레드

**모드 차별화 (입문가/전문가 mockup):**
- 색상으로는 모드 차이가 옅으므로 **구조 + 헤더 뱃지로 차별화**:
  - BeginnerMockup PaperHeader: `SproutIcon` + "입문자용" (GOLD 모드 고정)
  - ExpertMockup PaperHeader: `GraduationCapIcon` + "전문가용" + 프랑스어 부제 (wine-red-hover 모드 고정)
- 컨트롤 구조도 다름: 입문가=`ThreeWayRow` 큰 버튼 / 전문가=`PalateRow` WSET 5-step dot

**금지 사항:**
- `rgba(255,255,255,X)` / `rgba(0,0,0,X)` 직접 사용 → `var(--overlay-*)` 사용
- 컴포넌트 안에서 `useTheme()`로 색상 분기 → CSS 변수로만 처리
- 다크 전용 HEX(`#F5F0E8`, `#0F0718` 등)를 컴포넌트에 하드코딩

---

## 3. 타이포그래피

### 3-1. 폰트 패밀리

| 폰트 | 역할 | 적용 |
|------|------|------|
| **Playfair Display** (serif) | 로고, 섹션 제목, 모달 제목 | `next/font/google` — weight 400, 700 |
| **Inter** (sans-serif) | 본문, 버튼, 입력, 캡션 | `next/font/google` — variable font |
| **Noto Sans KR** | 한국어 본문 fallback | Google Fonts CDN — weight 400, 500, 700, 900 |

폰트 스택 (`globals.css`):
```css
font-family: var(--font-inter), 'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```
브라우저가 글리프 단위로 선택 — 영문은 Inter, 한글은 Noto Sans KR이 자동 적용된다.

### 3-2. 스케일

| 역할 | 크기 (mobile → desktop) | 폰트 | weight |
|------|------------------------|------|--------|
| Hero Headline | `text-5xl` → `text-7xl` | Playfair | 700 |
| Section Title | `text-3xl` → `text-5xl` | Playfair | 700 |
| Subtitle | `text-xl` → `text-2xl` | Inter | 500 |
| Body | `text-base` → `text-lg` | Inter / Noto | 400 |
| Caption | `text-sm` | Inter | 400 |
| Button | `text-base` | Inter | 600 |

### 3-3. 규칙

- **letter-spacing:** Playfair 제목은 `-0.02em`(타이트하게). Inter 본문은 기본값
- **line-height:** 본문 1.6, 제목 1.1~1.2
- **word-break:** `keep-all` (한글 어절 단위로 줄바꿈 — `globals.css` body)
- **로고 표기:** 항상 소문자 `winemine`, 분리/대문자/공백 금지 (예: ❌ Wine Mine, ❌ WineMine)

---

## 4. 레이아웃 & 스페이싱

- **컨테이너 max-width:** `max-w-6xl` (≈ 1152px) 또는 `max-w-7xl` (≈ 1280px)
- **섹션 vertical padding:** `py-20` ~ `py-32` (mobile은 `py-16`)
- **horizontal padding:** `px-4 md:px-8`
- **그리드:** stats 같은 4열 레이아웃은 2열↔4열만 사용. **3열 금지** (`globals.css` `.stats-4col` 참조)
- **모바일 우선:** 모든 섹션은 sm(640px) → md(768px) → lg(1024px) 순으로 반응형

---

## 5. 컴포넌트 패턴

### 5-1. 버튼

- **Primary CTA:** `var(--color-accent)` 배경 + `var(--color-text-primary)` 텍스트 (라이트=다크 브라운, 다크=크림). hover 시 `var(--color-accent-hover)`
- **Secondary:** 투명 배경 + `var(--color-border-active)` 보더 + `var(--color-text-primary)` 텍스트
- **Floating CTA (`ui/floating-cta.tsx`):** 스크롤 감지 후 하단 우측 고정. `var(--color-accent-shadow-soft/strong)` 그림자
- **Store Buttons (`ui/store-buttons.tsx`):** App Store / Google Play SVG 아이콘. 라이트=골드 pill (`--color-gold`) / 다크=glass overlay (`rgba(255,255,255,0.10)`). `--btn-store-*` 토큰 mode-aware

### 5-2. 카드

- 배경 `var(--color-bg-surface)`, 보더 `var(--color-border)`, `rounded-2xl`
- hover 시 보더를 `var(--color-border-active)`(= accent)로 전환, `pulseGlow` 애니메이션
- **Glass Card Stack** (Features): 여러 카드를 약간씩 회전·offset해서 적층한 라벨 컬렉션 인상

### 5-3. 모달

- 배경 오버레이: `var(--color-modal-backdrop)` (라이트=`rgba(42,31,18,0.55)`, 다크=`rgba(5,2,8,0.85)`) + backdrop-blur
- 모달 본체: `var(--color-bg-surface)`, `rounded-3xl`, max-width 480px
- 헤더 제목은 Playfair Display

### 5-4. 입력 필드

- 배경 `var(--color-bg-map)` 또는 `var(--color-bg-input)`, 보더 `var(--color-border)`
- focus 시 보더 `var(--color-border-active)`, placeholder는 `var(--color-text-disabled)`
- 에러 시 보더 `var(--color-error)` + 하단 에러 메시지

### 5-5. 지도 (World Map)

세 가지 모드-aware 토큰으로 처리:
- 기본 국가 fill: `var(--color-map-inactive)` (라이트=`#E0D2B5` 베이지, 다크=`#2A1552` 보라)
- stroke: `var(--color-map-stroke)` (라이트=`#C9B894`, 다크=`#4A2080`)
- 와인 생산국 fill: `var(--color-map-wine-fill)` (라이트=`#C9A84C` 골드, 다크=`#C41E3A` 와인-레드)
- 와인 국가별 opacity는 `WINE_REGIONS`에 정의 (France 1.0 → South Africa 0.50)
- SVG 오션 베이스: `var(--color-map-bg)` (라이트=`#F0E7D2` cream, 다크=`#0d0810` 거의 검정 — 의도적으로 페이지보다 어둡게)
- 960×500 SVG 두 장을 가로 연결해 `mapSlideLeft` 애니메이션으로 무한 슬라이드

---

## 6. 애니메이션 원칙

### 6-1. 정의된 keyframes (`globals.css`)

| 이름 | 용도 |
|------|------|
| `mapSlideLeft` | Hero 배경 지도 무한 슬라이드 (desktop 100s, mobile 130s) |
| `scanLine` | Wine Discovery 스캔 라인 — 라벨 인식 인상 |
| `fadeInTag` | 인식된 와인 태그 등장 |
| `pulseGlow` | 골드 발광 (CTA, 카드 hover) |
| `storyShimmer` | Story 카드 텍스트 shimmer |
| `barFill` | 통계 막대 채워지기 |

### 6-2. 가이드

- **Framer Motion** v12 사용. 페이지 진입 시 stagger fade-up 패턴이 기본
- **easing:** `easeOut` 또는 cubic-bezier(0.16, 1, 0.3, 1) (부드러운 감속)
- **duration:** 짧은 인터랙션 150~250ms, 섹션 진입 600~800ms
- **scroll-triggered:** `whileInView` + `viewport: { once: true, margin: '-80px' }`
- **터치 디바이스:** `@media (hover: none)`에서 hover transform/shadow 자동 제거

---

## 7. 아이콘 & 일러스트

- **아이콘 라이브러리:** `lucide-react` 만 사용. 다른 아이콘셋 추가 금지
- **크기:** 본문 `w-4 h-4`, 카드 `w-6 h-6`, 강조 `w-8 h-8`
- **색상:** 기본 Cream(`#F5F0E8`), 강조 Gold(`#C9A84C`)
- **일러스트레이션:** 사용하지 않는다. 사진(`vineyard-strip` 포도밭 이미지)과 SVG 맵으로 시각 자산을 한정한다

---

## 8. 보이스 & 카피톤

(디자인의 일부) — 카피는 디자인의 무드를 결정한다.

- **분기 헤더 페어링 (v9008a15):**
  - 초보자: "와인을 가볍게 즐기고 싶으신가요?" (Wine Discovery)
  - 전문가: "와인을 깊게 파고드시나요?" (Burgundy)
- **친근하지만 가볍지 않게:** 반말/이모지 금지. 존댓말 기본
- **영문 헤드라인:** "Your wine journey, mapped." 처럼 짧고 시적

---

## 9. 접근성

**대비비 (WCAG AA 기준 4.5:1 이상):**
- 다크 모드: Cream(`#F5F0E8`) on `#100A1F` ≈ **17.0:1 (AAA)**
- 라이트 모드: 다크 브라운(`#2A1F12`) on `#FBF7F0` ≈ **15.8:1 (AAA)**
- Gold 액센트(`#C9A84C`) on `#100A1F` ≈ 7.9:1, on `#FBF7F0` ≈ 2.5:1 — **라이트 모드에서 골드는 본문 색으로 사용 금지**, 텍스트는 `--color-text-primary` 사용
- Muted (다크 `#9B8B7A` / 라이트 `#8B7A60`)는 보조 텍스트 한정, **본문에 사용 금지**

**모드 토글:**
- `ThemeProvider` + `ThemeToggle` (footer 위) — `localStorage('winemine.theme')` 기반
- 기본은 시스템 prefers-color-scheme. 사용자가 한 번 토글하면 명시적으로 저장
- `layout.tsx`에 flash-prevention 인라인 스크립트 추가 (FOUC 방지)

**기타:**
- 포커스 링: 기본 outline 유지 또는 `var(--color-border-active)` 보더로 명시적 표현
- 모달은 `aria-modal`, 폼은 `aria-describedby`로 에러 메시지 연결
- 자동/수동 다크 두 블록(@media + [data-theme="dark"])은 globals.css에서 반드시 동기 유지

---

## 10. 참고 파일

| 파일 | 역할 |
|------|------|
| `src/app/globals.css` | CSS 변수 (3블록), keyframes, 미디어 쿼리 |
| `src/app/layout.tsx` | 폰트 로딩 + `ThemeProvider` + FOUC 방지 스크립트 |
| `src/components/providers/theme-provider.tsx` | 라이트/다크 토글 + localStorage 영속화 |
| `src/components/ui/theme-toggle.tsx` | footer 위 토글 버튼 |
| `CLAUDE.md` | 프로젝트 전반 가이드 (라이트/다크 색상 규칙 포함) |
| `WINEMINE_LANDING_SPEC.md` | 전체 UI/UX 스펙 |
| `_workspace/burgundy-section-spec.md` | 부르고뉴 섹션 디자인 결정 이력 |
| `_workspace/wine-discovery-section-spec.md` | Wine Discovery 인터랙션 사양 |
| `_workspace/theme-light-dark-done.md` | 라이트/다크 모드 도입 작업 이력 |
