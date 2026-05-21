# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# winemine — Claude Code Context

## 개발 명령어

```bash
npm run dev      # Turbopack 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드 (타입/빌드 오류 확인)
npm run lint     # ESLint
```

테스트 프레임워크 없음. UI 변경 후에는 `npm run build`로 타입/빌드 오류 확인.

---

## 서비스 개요

**winemine**은 와인 라벨을 촬영하면 AI가 와인을 인식하고, 마신 와인을 세계 지도 위에 지역별로 시각화해 기록하는 앱이다.

- 서비스명: **WineMine** (카멜케이스, 붙여쓰기 고정)
- 핵심 감성: 프리미엄 와인 라벨의 무게감. 어두운 밤, 와인 한 잔.
- 현재 단계: **Phase 1 — 랜딩 페이지 + Waiting List** (이 레포 전용)
- Phase 2 이후 iOS/Android 앱은 별도 레포로 생성 예정

---

## 기술 스택

| 레이어 | 선택 |
|--------|------|
| 프레임워크 | Next.js 15 App Router |
| 언어 | TypeScript 5.7 (strict mode) |
| 스타일링 | Tailwind CSS v4 |
| 세계 지도 | react-simple-maps v3 + topojson-client v3 |
| 애니메이션 | Framer Motion v12 |
| 폼 | react-hook-form v7 + zod v3 |
| 아이콘 | lucide-react |
| 데이터베이스 | Supabase PostgreSQL |
| 배포 | Vercel |

---

## 디자인 시스템

### 색상 팔레트

`globals.css`가 단일 진실 소스(single source of truth). 아래 표는 빠른 참조용이며, 변경 시 `globals.css` 라이트/다크 양쪽 블록을 반드시 동기 수정.

**Brand (mode-invariant):**
```
Wine Red (CTA):    #8B1A2A   — 버튼, 와인 국가 fill
Wine Red Hover:    #A02030
Gold (Accent):     #C9A84C   — 장식선, 아이콘, 성공 상태
Cream (Text):      #F5F0E8   — 다크 모드 제목/본문, paper 색
Error:             #EF4444
```

**Dark mode (시스템 + 수동 토글 양쪽 동일):**
```
--color-bg-deepest:  #100A1F   — 주 배경 (body, 섹션 베이스)
--color-bg-deep:     #170D2C   — 교차 섹션 배경
--color-bg-surface:  #20153A   — 카드 / 모달 / 패널 배경
--color-bg-map:      #2A1844   — input bg, map-themed UI 컨테이너
--color-map-bg:      #0d0810   — 지도 SVG 오션 베이스 (의도적으로 더 어두움)
--color-map-inactive:#2A1552   — 비활성(non-wine) 국가 fill
--color-map-stroke:  #4A2080   — 국가 경계선
--color-text-primary:    #F5F0E8
--color-text-secondary:  #D4C5B0
--color-text-muted:      #9B8B7A   — 설명, 부제
--color-text-disabled:   #4A3D56   — placeholder, footer
--color-border:          #2D1540
--color-border-active:   var(--color-wine-red)
```

**Light mode (white-wine concept):**
```
--color-bg-deepest:  #FBF7F0   — 크림 베이스
--color-bg-deep:     #F5EFE3
--color-bg-surface:  #FFFBF2
--color-bg-map:      #EAE0CC
--color-map-bg:      #F0E7D2
--color-map-inactive:#E0D2B5
--color-map-stroke:  #C9B894
--color-text-primary:    #2A1F12   — 짙은 갈색
--color-text-secondary:  #5A4830
--color-text-muted:      #8B7A60
--color-text-disabled:   #B8A88E
--color-border:          rgba(201, 168, 76, 0.30)
--color-border-active:   var(--color-gold)
```

### 다크/라이트 모드 색상 규칙 (CRITICAL)

테마 색상은 `src/app/globals.css`에 세 블록으로 정의된다:

1. **`:root`** — 라이트 모드 기본값 (mode-invariant brand 색상 포함)
2. **`@media (prefers-color-scheme: dark)`** 안의 `:root:not([data-theme="light"])` — 시스템 다크 모드
3. **`:root[data-theme="dark"]`** — 수동 다크 토글

**필수 규칙:**

- 색상 변경 시 **항상 light/dark 블록을 각각 별도로 수정**한다. 한쪽만 바꾸면 회귀가 발생한다.
- `--color-text-primary` 같은 의미적 토큰을 쓰고, 다크 모드 전용 하드코딩 HEX(예: `#F5F0E8`, `rgba(255,255,255,0.X)`)는 컴포넌트에서 절대 직접 쓰지 않는다.
- 다크 모드 전용 패치를 만들 땐 `@media (prefers-color-scheme: dark)`와 `:root[data-theme="dark"]` 블록 **양쪽에 똑같이 값을 넣는다** (한쪽만 빠지면 토글이 비정상 동작).
- 지도 색상은 `--color-map-bg` / `--color-map-inactive` / `--color-map-stroke` 세 토큰을 사용한다. 변경 시 두 모드의 contrast(국가 fill vs 배경)가 모두 보이는지 검증.
- 와인 국가 fill처럼 두 모드에서 동일하게 칠하고 싶은 색은 컴포넌트 내부에 HEX로 고정(예: `world-map.tsx`의 `WINE_REGIONS`)하되, 두 배경(다크 `#0d0810` + 라이트 `#F0E7D2`) 양쪽에서 가독성 확인.

**금지 사항:**

- `rgba(255,255,255,0.X)` / `rgba(0,0,0,0.X)` 같은 흰/검 직접 사용 금지 → `var(--overlay-soft/medium/strong)` 사용
- 컴포넌트 안에 모드 분기(`useTheme()`로 색상 분기) 금지 → CSS 변수로만 처리

### 타이포그래피
- **Playfair Display** (serif) — 로고, 섹션 제목, 모달 제목
- **Inter** (sans-serif) — 본문, 버튼, 입력 필드, 캡션
- **Noto Sans KR** — 한국어 본문 fallback (globals.css 폰트 스택)

### 로고 규칙
- 항상 **카멜케이스 `WineMine`** 으로 표기 (전부 소문자/전부 대문자/공백·하이픈 분리 금지)
- Playfair Display 폰트, letter-spacing: -0.02em

---

## 데이터베이스 스키마

### `waitlist` 테이블 (Supabase)
```sql
CREATE TABLE waitlist (
  id              UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  contact         VARCHAR(255) NOT NULL,
  contact_type    VARCHAR(10)  NOT NULL CHECK (contact_type IN ('email', 'phone')),
  created_at      TIMESTAMPTZ  DEFAULT now() NOT NULL,
  ip_address      VARCHAR(50),
  user_agent      TEXT,
  marketing_agree BOOLEAN      DEFAULT false,
  CONSTRAINT waitlist_contact_unique UNIQUE (contact)
);
```

RLS 활성화, public SELECT 정책 없음. 중복 insert 시 `23505` 에러를 success로 처리 (actions.ts).

---

## 환경 변수

```
NEXT_PUBLIC_SUPABASE_URL         # Supabase 프로젝트 URL
SUPABASE_SERVICE_ROLE_KEY        # 서버 전용 (절대 NEXT_PUBLIC_ 접두사 금지)
NEXT_PUBLIC_SITE_URL             # 배포 URL (OG 태그용, optional)
SLACK_WEBHOOK_URL                # 서버 전용. waitlist 신규/중복 등록 시 Slack 채널 알림 (optional, 미설정 시 silent skip)
SLACK_FEEDBACK_WEBHOOK_URL       # 서버 전용. feedback 등록 시 별도 채널(예: #winemine-feedback) 알림 (optional, 미설정 시 silent skip — waitlist 채널로 fallback 안 함)
```

**CRITICAL:** `SUPABASE_SERVICE_ROLE_KEY`, `SLACK_WEBHOOK_URL`, `SLACK_FEEDBACK_WEBHOOK_URL`은 Server Action에서만 사용. 클라이언트 번들에 절대 포함 금지.

---

## i18n 시스템

`Accept-Language` 헤더를 파싱해 `NEXT_LOCALE` 쿠키(1년)로 언어를 결정한다. 지원 언어: `ko` (기본), `en`.

### 동작 흐름
1. **`middleware.ts`** — 모든 요청에서 쿠키 확인 → 없으면 헤더 파싱 → 쿠키 세팅
2. **`lib/i18n.ts`** — `getLocale()` / `getMessages()` — layout에서 서버 사이드 호출
3. **`LocaleProvider`** — locale + messages를 Context로 클라이언트에 공급
4. **`useLocale()`** — 클라이언트 컴포넌트에서 `t('key.path')` 로 번역 문자열 접근

### 컴포넌트에서 번역 사용법
```tsx
import { useLocale } from '@/components/providers/locale-provider';

const { t, messages } = useLocale();

// 문자열 키 접근
t('hero.tagline')                    // → "Your wine journey, mapped."

// 배열/객체가 필요하면 messages 직접 사용
messages.howItWorks.steps.map(...)
```

### 번역 파일 규칙
- `src/messages/ko.json` — 기준 파일, 타입 소스 (`typeof koJson`)
- `src/messages/en.json` — 키 구조를 ko.json과 **반드시 동기화**
- 커밋 전 양쪽 파일의 키 구조 일치 여부 확인

---

## 보안 규칙

- Supabase 접근은 **Server Action만** 사용 (클라이언트 직접 접근 없음)
- 이메일/전화번호는 클라이언트(Zod) + 서버(Server Action) **양쪽 모두** 검증
- `waitlist` 테이블 RLS 활성화, public SELECT 정책 없음
- 전화번호: 한국 형식만 허용 `/^010[-\s]?\d{4}[-\s]?\d{4}$/`

---

## 지도 구현 주의사항

- `react-simple-maps`는 브라우저 API 사용 → **SSR 불가**
- dynamic import는 `world-map.tsx`가 아니라 **`hero-section.tsx`에서** 처리:
  ```ts
  dynamic(() => import('@/components/map/world-map'), { ssr: false })
  ```
- 국가 식별: `geo.id`를 3자리 숫자 문자열로 패딩 (`String(geo.id).padStart(3, '0')`) — `ISO_A3`/`ADM0_A3` 아님
- 지도는 960×500 SVG 두 장을 가로로 이어 붙여 `mapSlideLeft` 애니메이션으로 무한 스크롤 (`globals.css` 정의)
- 지도 데이터: `public/world-110m.json` (기본), `world-50m.json`, `france-departments.json`

---

## 파일 구조

```
src/
├── app/
│   ├── layout.tsx                      # 폰트, OG 메타, Google Analytics (G-7V8ZDT0TYX), LocaleProvider
│   ├── page.tsx                        # 'use client' — modalOpen state, 섹션 조합
│   ├── globals.css                     # mapSlideLeft keyframe, Noto Sans KR 폰트 스택
│   ├── actions.ts                      # Server Action: submitWaitlist()
│   └── opengraph-image.tsx             # 동적 OG 이미지 생성
├── components/
│   ├── map/world-map.tsx               # react-simple-maps ('use client', SSR 불가)
│   ├── providers/locale-provider.tsx   # LocaleProvider + useLocale() 훅
│   ├── sections/
│   │   ├── hero-section.tsx            # WorldMap dynamic import, StoreButtons
│   │   ├── wine-discovery-section.tsx  # 초보자 친화 스크롤 스토리텔링 (ScanPanel부터 시작), RecommendationMap 포함 — 상세 사양은 _workspace/wine-discovery-section-spec.md
│   │   ├── burgundy-section.tsx        # 부르고뉴 위계 드릴다운 (꼬뜨→마을→등급→와인) + 색 토글(Red/White/Rosé) + 지도 dot 클릭 드릴인 + dept 행정구역명 라벨 — 상세 사양은 _workspace/burgundy-section-spec.md
│   │   ├── tasting-note-section.tsx    # 테이스팅 노트 데모 (입문자/전문가 모드, 부케 휠·WSET 슬라이더·카우달리·결함·오프닝 타임라인) — 상세 사양은 _workspace/tasting-note-section-spec.md
│   │   ├── cellar-section.tsx          # 셀러 관리 — 보유 와인 카드 + 음용 적기 타임라인 + DrinkWindowBadge + 알림 토글
│   │   ├── price-intelligence-section.tsx # 가격 추이 (recharts LineChart) + 매장별 비교 + 외부 평점(Vivino/WS/CT)
│   │   ├── favorites-alert-section.tsx # 즐겨찾기 → 가격 등록 → 푸시 알림 → 차트 4스텝 플로우 + PushBanner 데모
│   │   ├── community-tonight-section.tsx # "오늘 밤 마시는 사람들" 미니 한국 지도 + 실시간 활동 피드 카드
│   │   ├── level-badge-section.tsx     # 레벨/뱃지 게이미피케이션 — LevelProgressBar + 5단계 레벨 카탈로그 + 뱃지 진열장
│   │   ├── features-section.tsx        # 와인 카드 쇼케이스 (단일 GlassCardStack 패널) + ScanPanel named export (wine-discovery에서 사용)
│   │   ├── how-it-works-section.tsx    # 사용 흐름 6단계 (촬영 → AI 분석 → 셀러 등록 → 취향 파고들기 → 즐겨찾기 알림 → Recap)
│   │   ├── final-cta-section.tsx       # 최종 CTA
│   │   ├── instagram-preview-section.tsx # Features 직후 마운트 — Recap 공유. PhoneMockup·StoryCard·StoryWorldMap 정의처. winemine 로고 + 풀-블리드 세계지도 적용
│   │   ├── vineyard-strip.tsx          # 미마운트 (롤백 대비 보존)
│   │   ├── france-wine-section.tsx     # 미마운트 (롤백 대비 보존)
│   │   ├── market-stats-section.tsx    # 미마운트 (롤백 대비 보존)
│   │   └── france-wine-detail-section.tsx # 미마운트 (이전부터)
│   ├── tasting-note/                   # tasting-note-section.tsx에서 사용하는 인터랙티브 컴포넌트들
│   │   ├── aroma-wheel.tsx             # UC Davis 12-카테고리 부케 휠
│   │   ├── wset-slider.tsx             # WSET 5단계 슬라이더 (당도·산도·바디·타닌 등)
│   │   ├── caudalie-meter.tsx          # 피니시 측정기 (1초 = 1 카우달리)
│   │   ├── fault-checklist.tsx         # 11종 결함 체크리스트
│   │   ├── opening-timeline.tsx        # 디캔팅 타임라인 + 권장 비교
│   │   ├── blind-mode.tsx              # 블라인드 모드 (품종·지역·빈티지·가격 추정 → 점수)
│   │   ├── beginner-note.tsx           # 5분 입문자 모드
│   │   ├── auto-description.tsx        # 슬라이더 값으로 자동 시음 노트 생성
│   │   └── tannin-bubble-panels.tsx    # 타닌·기포 보조 패널
│   ├── wine-bottles/
│   │   └── wine-bottle.tsx             # 재사용 SVG 와인병 컴포넌트 (burgundy·wine-discovery 공용)
│   ├── icons/
│   │   └── wine-icons.tsx              # 전용 SVG 아이콘 (lucide-react 보완)
│   ├── ui/
│   │   ├── floating-cta.tsx            # 스크롤 감지 고정 CTA 버튼 (GA 클릭 트래킹)
│   │   └── store-buttons.tsx           # App Store / Google Play 버튼 (GA 클릭 트래킹)
│   └── waitlist/
│       ├── waitlist-modal.tsx          # 모달 컨테이너
│       ├── waitlist-form.tsx           # react-hook-form + zod + marketing_agree
│       └── waitlist-success.tsx        # 제출 완료 화면
├── lib/
│   ├── i18n.ts                         # getLocale(), getMessages(), Locale/Messages 타입
│   ├── supabase-server.ts              # service role 클라이언트 (서버 전용)
│   ├── slack.ts                        # SLACK_WEBHOOK_URL로 waitlist 등록 알림 (서버 전용)
│   ├── validations.ts                  # Zod 스키마 (클라이언트 재사용)
│   ├── utils.ts                        # cn() 헬퍼
│   ├── analytics.ts                    # trackEvent() — window.gtag 래퍼 (CTA 클릭 추적용)
│   ├── recommended-wines.ts            # Wine Discovery Step 2 입문용 추천 와인 mock + STARTING_WINE
│   └── tasting-note-lexicon.ts         # UC Davis 아로마 휠 · WSET 디스크립터 · 결함 카탈로그 어휘 데이터
├── messages/
│   ├── ko.json                         # 기준 번역 파일 (타입 소스)
│   └── en.json                         # 영어 번역 (ko.json과 키 구조 동기화)
├── middleware.ts                       # Accept-Language → NEXT_LOCALE 쿠키 설정
└── types/
    └── react-simple-maps.d.ts         # 타입 선언
public/
├── world-110m.json                     # 세계 지도 기본 데이터
├── world-50m.json                      # 세계 지도 고해상도 데이터
└── france-departments.json            # 프랑스 데파르트망 데이터
```

### 핵심 데이터 흐름
1. `page.tsx` (`'use client'`) — `modalOpen` 상태 보유, 모든 섹션에 `onOpenModal` 전달
2. `StoreButtons` / `FloatingCTA` / `FinalCTASection` → `onOpenModal()` 호출
3. `WaitlistModal` → `WaitlistForm` → `submitWaitlist()` Server Action → Supabase insert

### 페이지 마운트 순서 (현재 14 섹션)
1. `HeroSection` — 세계 지도 슬라이딩 배경
2. `WineDiscoverySection` — 초보자 친화 스크롤 (ScanPanel부터 시작) + 추천 지도 + outro
3. `BurgundySection` — 부르고뉴 위계 드릴다운 (꼬뜨→마을→등급→와인) + 색 토글 (전문가)
4. `CellarSection` — 셀러 관리 (보유 와인 + 음용 적기 타임라인 + 알림 토글) ✨신규
5. `TastingNoteSection` — 테이스팅 노트 데모 (입문자/전문가 모드 전환)
6. `PriceIntelligenceSection` — 가격 추이 그래프 + 매장별 + 외부 평점 ✨신규
7. `FavoritesAlertSection` — 즐겨찾기 → 가격 알림 4스텝 플로우 ✨신규
8. `VineyardStrip` — 와인 산지 데이터 카드 (재마운트)
9. `FeaturesSection` — 와인 카드 쇼케이스 (단일 패널)
10. `CommunityTonightSection` — "오늘 밤 마시는 사람들" 실시간 커뮤니티 ✨신규
11. `LevelBadgeSection` — 레벨·뱃지 게이미피케이션 ✨신규
12. `InstagramPreviewSection` — Recap 공유 (PhoneMockup + StoryCard)
13. `HowItWorksSection` — 사용 흐름 6단계 (셀러·알림 단계 포함)
14. `FinalCTASection` — 최종 CTA

### 섹션 헤더 카피 (현재)
- Hero 태그라인: `hero.tagline` = "와인으로 물들이는 나만의 세계지도"
- Wine Discovery: `wineDiscovery.topQuestion` = "나만의 와인지도, 어떻게 시작할까요?"
- Burgundy: `burgundy.heading` = "부르고뉴 한 병의 디테일까지."
- Cellar: `cellar.heading` = "와인을 보관하고, 음용 적기를 추적하세요"
- Tasting Note: `tastingNote.heading` = "어떻게 기억에 남기시겠어요?"
- Price Intelligence: `priceIntelligence.heading` = "가격까지, 한눈에"
- Favorites Alert: `favoritesAlert.heading` = "관심 와인의 가격, 가장 먼저"
- Community Tonight: `communityTonight.heading` = "오늘 밤, 누가 어떤 와인을 마실까요?"
- Level/Badge: `levelBadge.heading` = "마실수록 성장하는 와인 라이프"

---

## 상세 스펙

전체 UI/UX 스펙, 컴포넌트 계층, 통합 테스트 시나리오, 구현 순서:
→ **`WINEMINE_LANDING_SPEC.md`** 참조

Wine Discovery 섹션(초보자 5단계 스크롤 스토리텔링·재사용 컴포넌트 계보·분기 헤더 페어링·미마운트 파일 의존 관계) 인수인계용 단일 문서:
→ **`_workspace/wine-discovery-section-spec.md`** 참조 — `feat/wine-discovery-section` 브랜치 작업 컨텍스트 (main 미반영)

부르고뉴 섹션(위계 드릴다운·색 토글·인터랙션·데이터 모델·디자인 결정·변경 이력) 인수인계용 단일 문서:
→ **`_workspace/burgundy-section-spec.md`** 참조 — 다른 머신/세션에서 컨텍스트 잡을 때 가장 먼저 읽을 것

부르고뉴 분류 체계의 근거가 되는 와인 덕후 관점 리서치 + 한글-프랑스어 용어집:
→ **`_workspace/burgundy-classification-research.md`** 참조

테이스팅 노트 섹션(입문자/전문가 모드·부케 휠·WSET 슬라이더·카우달리·결함·오프닝 타임라인) 인수인계용 단일 문서:
→ **`_workspace/tasting-note-section-spec.md`** 참조

서비스 전반의 디자인 시스템(무드·색상·타이포·인터랙션 원칙) 단일 참조:
→ **`design.md`** 참조

서비스의 비전·타겟·로드맵·기능 요건 등 제품 기획 문서:
→ **`PRODUCT_PLAN.md`** 참조

---

## 하네스: winemine-landing

**목표:** winemine 랜딩 페이지를 scaffold → 컴포넌트 개발 → QA 순으로 자동 구축

**트리거:** 랜딩 페이지 개발, 구현, scaffold, 컴포넌트 수정, 섹션 다시 구현, QA 재실행 등 개발 관련 요청 시 `winemine-landing` 스킬을 사용하라.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-05 | 초기 구성 | 전체 | winemine 랜딩 페이지 개발 시작 |
| 2026-05-06 | commit-push 스킬 추가 | .claude/skills/commit-push | GitHub 연동 워크플로우 |
| 2026-05-08 | Wine Discovery 섹션 + 페이지 슬림화 | sections | 초보자/전문가 페어링, France·MarketStats·VineyardStrip 마운트 제거 (main 반영 완료) |
| 2026-05-11 | TastingNoteSection 마운트, Bottle 컴포넌트 통합, 부르고뉴 dot 클릭 드릴인, CTA GA 트래킹 | sections·components·analytics | 페이지 8 섹션 구조 재정렬, 와인병 SVG 재사용화, 분석 보강 |
| 2026-05-14 | MVP 핵심 기능 5개 섹션 추가 + How It Works 6단계 확장 | Cellar/PriceIntelligence/FavoritesAlert/CommunityTonight/LevelBadge 신규, HowItWorks 확장, recharts 도입 | 본격 대중 홍보 전 셀러·가격·즐겨찾기 알림·커뮤니티·게이미피케이션 가치 노출 |

---

## 하네스: commit-push

**목표:** 변경사항을 git commit하고 GitHub에 push한다. 커밋 전 i18n 동기화 체크 포함.

**트리거:** "커밋해줘", "푸시해줘", "commit", "push", "저장해줘", "깃에 올려줘" 등 요청 시 `commit-push` 스킬을 사용하라.

**i18n 체크:** 커밋 전 `src/messages/ko.json`과 `src/messages/en.json`의 키 구조가 일치하는지 확인. 불일치 시 양쪽 번역 파일을 먼저 최신화한 뒤 커밋.

---

## 하네스: wine-research-report

**목표:** 전세계 와인 생산지를 병렬 조사하여 통합 보고서(`wine-production-report.md`)를 생성한다.

**트리거:** 와인 산지 조사, 와인 생산지 보고서, 프랑스 와인 상세 정보, 세계 와인 지도, 와인 지역 정보 요청 시 `wine-research-report` 스킬을 사용하라.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-06 | 초기 구성 | 전체 | 와인 산지 조사 보고서 하네스 신규 구축 |

---

## 하네스: new-worktree

**목표:** 본체 세션을 건드리지 않고, 깨끗한 새 git worktree에 의존성·.env까지 자동 세팅한 뒤 사용자가 지정한 작업을 그 안에서 실행한다.

**트리거:** "새 worktree에서 …", "worktree에서 작업해줘", "워크트리 만들어서 …", "격리해서 작업해줘", "새 브랜치 worktree로 …" 요청 시 `new-worktree` 스킬을 사용하라.

**자동 처리:** worktree 생성 → `npm install` → `.env.local`·`.env*` 본체에서 자동 복사 → 사용자 요청 작업(A) 실행. 커밋은 만들지 않음 (필요 시 commit-push 스킬 별도 호출).

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-11 | 초기 구성 | 전체 | 병렬 worktree 작업 자동화 |
