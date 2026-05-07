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

- 서비스명: **winemine** (소문자, 붙여쓰기 고정)
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
```
Wine Red (CTA):    #8B1A2A   — 버튼, 와인 국가 fill
Wine Red Hover:    #A02030
Gold (Accent):     #C9A84C   — 장식선, 아이콘, 성공 상태
Cream (Text):      #F5F0E8   — 제목, 주요 텍스트
Secondary Text:    #D4C5B0
Muted Text:        #9B8B7A   — 설명, 부제
Disabled:          #4A3D56   — placeholder, footer
Deepest Dark:      #05020A   — 주 배경
Deep Dark:         #0A050F   — 교차 섹션 배경
Map Dark:          #1A0A1E   — 지도 기본 국가, input bg
Surface:           #0F0718   — 모달 배경
Border:            #2D1540
Border Active:     #8B1A2A
Error:             #EF4444
```

### 타이포그래피
- **Playfair Display** (serif) — 로고, 섹션 제목, 모달 제목
- **Inter** (sans-serif) — 본문, 버튼, 입력 필드, 캡션
- **Noto Sans KR** — 한국어 본문 fallback (globals.css 폰트 스택)

### 로고 규칙
- 항상 **소문자 `winemine`** 으로 표기 (대문자/분리 금지)
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
NEXT_PUBLIC_SUPABASE_URL      # Supabase 프로젝트 URL
SUPABASE_SERVICE_ROLE_KEY     # 서버 전용 (절대 NEXT_PUBLIC_ 접두사 금지)
NEXT_PUBLIC_SITE_URL          # 배포 URL (OG 태그용, optional)
```

**CRITICAL:** `SUPABASE_SERVICE_ROLE_KEY`는 Server Action에서만 사용. 클라이언트 번들에 절대 포함 금지.

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
│   │   ├── france-wine-section.tsx     # 스크롤 기반 프랑스 드릴다운
│   │   ├── france-wine-detail-section.tsx # 정적 지도 + 와인 카드 컬렉션
│   │   ├── vineyard-strip.tsx          # 와인 산지 사진 스트립
│   │   ├── features-section.tsx        # 핵심 기능 소개 (onScrollToPreview prop)
│   │   ├── market-stats-section.tsx    # 한국 와인 시장 통계
│   │   ├── how-it-works-section.tsx    # 사용 흐름 4단계
│   │   ├── instagram-preview-section.tsx # Recap 공유 미리보기 (id="instagram-preview")
│   │   └── final-cta-section.tsx       # 최종 CTA
│   ├── ui/
│   │   ├── floating-cta.tsx            # 스크롤 감지 고정 CTA 버튼
│   │   └── store-buttons.tsx           # App Store / Google Play 버튼
│   └── waitlist/
│       ├── waitlist-modal.tsx          # 모달 컨테이너
│       ├── waitlist-form.tsx           # react-hook-form + zod + marketing_agree
│       └── waitlist-success.tsx        # 제출 완료 화면
├── lib/
│   ├── i18n.ts                         # getLocale(), getMessages(), Locale/Messages 타입
│   ├── supabase-server.ts             # service role 클라이언트 (서버 전용)
│   ├── validations.ts                 # Zod 스키마 (클라이언트 재사용)
│   ├── utils.ts                       # cn() 헬퍼
│   └── analytics.ts                   # trackEvent() — window.gtag 래퍼
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

---

## 상세 스펙

전체 UI/UX 스펙, 컴포넌트 계층, 통합 테스트 시나리오, 구현 순서:
→ **`WINEMINE_LANDING_SPEC.md`** 참조

---

## 하네스: winemine-landing

**목표:** winemine 랜딩 페이지를 scaffold → 컴포넌트 개발 → QA 순으로 자동 구축

**트리거:** 랜딩 페이지 개발, 구현, scaffold, 컴포넌트 수정, 섹션 다시 구현, QA 재실행 등 개발 관련 요청 시 `winemine-landing` 스킬을 사용하라.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-05 | 초기 구성 | 전체 | winemine 랜딩 페이지 개발 시작 |
| 2026-05-06 | commit-push 스킬 추가 | .claude/skills/commit-push | GitHub 연동 워크플로우 |

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
