# winemine — Design System

> 와인 라벨을 촬영하면 AI가 인식하고, 마신 와인을 세계 지도 위에 기록하는 서비스.
> 이 문서는 winemine 전반의 디자인 방향성, 색상, 타이포그래피, 컴포넌트·인터랙션 원칙을 정리한 단일 참조 문서다.

---

## 1. 무드 & 톤

**한 줄로:** "어두운 밤, 와인 한 잔. 프리미엄 와인 라벨의 무게감."

winemine은 가벼운 SaaS 톤이 아니라, **고급 와인 셀러의 어두운 조명**을 디지털로 옮긴 인상을 추구한다.

| 키워드 | 적용 방식 |
|--------|----------|
| **Deep & Dark** | 거의 검정에 가까운 보라/자주 계열 배경(`#05020A`) — 라이트 모드 없음 |
| **Premium Wine Label** | 크림(#F5F0E8)·골드(#C9A84C)·와인 레드(#8B1A2A) 3색의 라벨 같은 조합 |
| **Cinematic** | 세계 지도 슬라이딩 배경, scan line 애니메이션, 글래스 카드 적층 |
| **Quiet Confidence** | 큰 글씨 + 충분한 여백, 장식 최소화. Playfair Display의 정제된 세리프 |
| **Earnest, not flashy** | 네온/그라데이션 남발 금지. 골드 글로우는 핵심 포인트에만 사용 |

**피해야 할 것**
- 밝은 화이트 배경, 파스텔 컬러, 코랄/민트 같은 트렌디 톤
- 과한 그라데이션, 무지개 톤, 글래스모피즘 남용
- "테크 스타트업" 느낌의 sans-serif 빅 타이포 + 컬러 일러스트

---

## 2. 색상 팔레트

CSS 변수는 `src/app/globals.css`의 `:root`에 정의되어 있다. **새 색을 추가하기 전에 기존 토큰으로 표현 가능한지 먼저 확인할 것.**

### 2-1. Brand & Accent

| 토큰 | HEX | 용도 |
|------|-----|------|
| Wine Red | `#8B1A2A` | 주요 CTA 버튼, 와인 생산 국가 fill, 활성 보더 |
| Wine Red Hover | `#A02030` | 버튼 hover 상태 |
| Gold (Accent) | `#C9A84C` | 장식선, 아이콘, 성공 상태, 글로우 효과 |

### 2-2. Background (Dark)

| 토큰 | HEX | 용도 |
|------|-----|------|
| Deepest Dark | `#05020A` | 페이지 주 배경 (body) |
| Deep Dark | `#0A050F` | 교차 섹션, 영역 구분 배경 |
| Map Dark | `#1A0A1E` | 지도 기본 국가 색, input 배경 |
| Surface | `#0F0718` | 모달, 카드 표면 |

### 2-3. Border

| 토큰 | HEX | 용도 |
|------|-----|------|
| Border | `#2D1540` | 기본 분리선, 카드 보더 |
| Border Active | `#8B1A2A` | 포커스/선택 상태 (= Wine Red) |

### 2-4. Text

| 토큰 | HEX | 용도 |
|------|-----|------|
| Primary | `#F5F0E8` | 제목, 본문 주요 텍스트 (Cream) |
| Secondary | `#D4C5B0` | 보조 본문, 부제 |
| Muted | `#9B8B7A` | 설명, 캡션 |
| Disabled | `#4A3D56` | placeholder, footer, 비활성 상태 |

### 2-5. Status

| 토큰 | HEX | 용도 |
|------|-----|------|
| Error | `#EF4444` | 폼 검증 에러, 경고 |
| Success | `#C9A84C` | 성공 상태 (Gold 재사용) |

### 2-6. 사용 가이드

- **CTA 버튼:** `bg-wine-red` + `text-cream` + hover 시 `bg-wine-red-hover`
- **Gold 사용 빈도:** 페이지당 5~7회 이하. 핵심 강조 포인트에만.
- **투명도 활용:** 카드/오버레이는 `rgba(201,168,76,0.25)` 같은 alpha 변형 사용 (e.g. `pulseGlow` keyframe)
- **그라데이션:** 사용 시 항상 dark-to-darker. 예: `linear-gradient(180deg, #0A050F 0%, #05020A 100%)`

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

- **Primary CTA:** Wine Red 배경, Cream 텍스트, `rounded-full` 또는 `rounded-xl`, padding `px-8 py-4`
- **Secondary:** 투명 배경 + Gold 보더 + Cream 텍스트
- **Floating CTA (`ui/floating-cta.tsx`):** 스크롤 감지 후 하단 우측 고정. Gold 글로우 추가
- **Store Buttons (`ui/store-buttons.tsx`):** App Store / Google Play SVG 아이콘 + dark bg

### 5-2. 카드

- 배경 `#0F0718` (Surface), 보더 `#2D1540`, `rounded-2xl`
- hover 시 보더를 `#8B1A2A`로 전환, `pulseGlow` 애니메이션
- **Glass Card Stack** (Features): 여러 카드를 약간씩 회전·offset해서 적층한 라벨 컬렉션 인상

### 5-3. 모달

- 배경 오버레이: `rgba(5, 2, 10, 0.85)` + backdrop-blur
- 모달 본체: Surface 색, `rounded-3xl`, max-width 480px
- 헤더 제목은 Playfair Display

### 5-4. 입력 필드

- 배경 `#1A0A1E` (Map Dark), 보더 `#2D1540`
- focus 시 보더 `#8B1A2A`, placeholder는 `#4A3D56`
- 에러 시 보더 `#EF4444` + 하단 에러 메시지

### 5-5. 지도 (World Map)

- 기본 국가 fill: `#1A0A1E` (Map Dark), stroke `#2D1540`
- 와인 생산국 fill: `#8B1A2A` (Wine Red)
- hover 시 fill `#A02030` + cursor pointer
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

- 대비비: 어두운 배경 위 Cream(#F5F0E8)은 WCAG AA 충족 (대비 14:1+)
- Muted(#9B8B7A)는 보조 텍스트 한정, **본문에 사용 금지**
- 포커스 링: 기본 outline 유지 또는 Wine Red 보더로 명시적 표현
- 모달은 `aria-modal`, 폼은 `aria-describedby`로 에러 메시지 연결

---

## 10. 참고 파일

| 파일 | 역할 |
|------|------|
| `src/app/globals.css` | CSS 변수, keyframes, 미디어 쿼리 |
| `src/app/layout.tsx` | 폰트 로딩 (Playfair, Inter, Noto Sans KR) |
| `CLAUDE.md` | 프로젝트 전반 가이드 (이 문서의 상위) |
| `WINEMINE_LANDING_SPEC.md` | 전체 UI/UX 스펙 |
| `_workspace/burgundy-section-spec.md` | 부르고뉴 섹션 디자인 결정 이력 |
| `_workspace/wine-discovery-section-spec.md` | Wine Discovery 인터랙션 사양 |
