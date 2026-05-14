# winemine

> 와인 라벨을 찍으면, 세계가 물든다.

와인 라벨을 촬영하면 AI가 자동으로 인식하고, 마신 와인을 세계 지도 위에 지역별로 시각화해 기록하는 앱입니다.  
이 레포는 **앱 출시 전 사전 신청자를 모으기 위한 랜딩 페이지**입니다.

---

## 목차

- [서비스 개요](#서비스-개요)
- [기술 스택](#기술-스택)
- [파일 구조](#파일-구조)
- [로컬 실행](#로컬-실행)
- [환경 변수](#환경-변수)
- [데이터베이스 설정](#데이터베이스-설정)
- [i18n](#i18n)
- [핵심 구현 노트](#핵심-구현-노트)
- [배포](#배포)

---

## 서비스 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | **winemine** (소문자, 붙여쓰기 고정) |
| 현재 단계 | Phase 1 — 랜딩 페이지 + 웨이팅 리스트 |
| 타겟 | 와인을 즐기며 기록·탐험·공유하고 싶은 사람 |
| 핵심 감성 | 프리미엄 와인 라벨의 무게감. 어두운 밤, 와인 한 잔. |

### 랜딩 페이지 섹션 구성 (현재 8 섹션)

```
Hero               — 인터랙티브 세계 지도 배경 + CTA
Wine Discovery     — 초보자 친화 스크롤 (ScanPanel + 추천 지도 + outro)
Burgundy           — 부르고뉴 위계 드릴다운 (꼬뜨→마을→등급→와인) + 색 토글 + 지도 dot 클릭
Tasting Note       — 테이스팅 노트 데모 (입문자/전문가 모드 전환)
Features           — 와인 카드 쇼케이스 (단일 패널)
Instagram Preview  — Recap 공유 기능 미리보기 (PhoneMockup + 풀-블리드 세계지도)
How It Works       — 4단계 사용 흐름
Final CTA          — 사전 신청 폼 재유도
```

> France Wine / France Wine Detail / Vineyard Strip / Market Stats 섹션은 코드는 보존되어 있지만 현재 마운트되지 않습니다 (롤백 대비).

---

## 기술 스택

| 레이어 | 선택 | 버전 |
|--------|------|------|
| 프레임워크 | Next.js App Router | 15.5 |
| 언어 | TypeScript (strict) | 5.7 |
| 스타일링 | Tailwind CSS | v4 |
| 애니메이션 | Framer Motion | v12 |
| 세계 지도 | react-simple-maps + topojson-client | v3 |
| 폼 | react-hook-form + zod | v7 / v3 |
| 아이콘 | lucide-react | — |
| 데이터베이스 | Supabase PostgreSQL | — |
| 배포 | Vercel | — |
| 번들러 | Turbopack (dev) | — |

---

## 파일 구조

```
src/
├── app/
│   ├── layout.tsx                      # 폰트(Playfair Display, Inter, Noto Sans KR), OG, GA, LocaleProvider
│   ├── page.tsx                        # 'use client' — modalOpen 상태, 섹션 조합
│   ├── globals.css                     # mapSlideLeft keyframe, 색상 변수
│   ├── actions.ts                      # Server Action: submitWaitlist()
│   └── opengraph-image.tsx             # 동적 OG 이미지 생성
├── components/
│   ├── map/
│   │   └── world-map.tsx               # react-simple-maps ('use client', SSR 불가)
│   ├── providers/
│   │   └── locale-provider.tsx         # i18n Context 공급자
│   ├── sections/                       # 마운트 순서대로 정렬
│   │   ├── hero-section.tsx            # WorldMap dynamic import, StoreButtons
│   │   ├── wine-discovery-section.tsx  # ScanPanel + RecommendationMap (초보자 흐름)
│   │   ├── burgundy-section.tsx        # 꼬뜨→마을→등급→와인 드릴다운 + 지도 dot 클릭
│   │   ├── tasting-note-section.tsx    # 테이스팅 노트 데모 (입문자/전문가 모드)
│   │   ├── features-section.tsx        # 와인 카드 쇼케이스 + ScanPanel named export
│   │   ├── instagram-preview-section.tsx # Recap 공유 미리보기
│   │   ├── how-it-works-section.tsx    # 4단계 사용 흐름
│   │   ├── final-cta-section.tsx       # 최종 CTA
│   │   ├── france-wine-section.tsx     # 미마운트 (롤백 대비 보존)
│   │   ├── france-wine-detail-section.tsx # 미마운트
│   │   ├── vineyard-strip.tsx          # 미마운트
│   │   └── market-stats-section.tsx    # 미마운트
│   ├── tasting-note/                   # tasting-note-section 전용 인터랙티브 컴포넌트
│   │   ├── aroma-wheel.tsx             # UC Davis 12-카테고리 부케 휠
│   │   ├── wset-slider.tsx             # WSET 5단계 슬라이더
│   │   ├── caudalie-meter.tsx          # 피니시 측정기
│   │   ├── fault-checklist.tsx         # 11종 결함 체크
│   │   ├── opening-timeline.tsx        # 디캔팅 타임라인
│   │   ├── blind-mode.tsx              # 블라인드 추정 + 점수
│   │   ├── beginner-note.tsx           # 5분 입문 모드
│   │   ├── auto-description.tsx        # 자동 시음 노트
│   │   └── tannin-bubble-panels.tsx
│   ├── wine-bottles/
│   │   └── wine-bottle.tsx             # 재사용 SVG 와인병 컴포넌트
│   ├── icons/
│   │   └── wine-icons.tsx              # 전용 SVG 아이콘
│   ├── ui/
│   │   ├── floating-cta.tsx            # 스크롤 감지 고정 CTA (GA 클릭 트래킹)
│   │   └── store-buttons.tsx           # App Store / Google Play 버튼 (GA 클릭 트래킹)
│   └── waitlist/
│       ├── waitlist-modal.tsx
│       ├── waitlist-form.tsx           # react-hook-form + zod, 마케팅 동의 체크박스
│       └── waitlist-success.tsx
├── lib/
│   ├── i18n.ts                         # getLocale(), getMessages() — 쿠키 기반
│   ├── supabase-server.ts              # service role 클라이언트 (서버 전용)
│   ├── slack.ts                        # waitlist 등록 Slack 알림 (서버 전용)
│   ├── validations.ts                  # Zod 스키마 (클라이언트 재사용)
│   ├── analytics.ts                    # trackEvent() — window.gtag 래퍼
│   ├── recommended-wines.ts            # Wine Discovery 추천 와인 mock + STARTING_WINE
│   ├── tasting-note-lexicon.ts         # 아로마 휠 / WSET / 결함 어휘 데이터
│   └── utils.ts                        # cn() 헬퍼
├── messages/
│   ├── ko.json                         # 한국어 (기본)
│   └── en.json                         # 영어
├── middleware.ts                       # Accept-Language → NEXT_LOCALE 쿠키 설정
└── types/
    └── react-simple-maps.d.ts
public/
├── world-110m.json                     # 지도 데이터 (110m 해상도)
├── world-50m.json                      # 지도 데이터 (50m 해상도)
└── france-departments.json            # 프랑스 데파르트망 데이터
```

---

## 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 아래 환경 변수 입력

# 3. 개발 서버 실행 (Turbopack)
npm run dev        # http://localhost:3000

# 4. 프로덕션 빌드 확인
npm run build
```

---

## 환경 변수

`.env.local` 파일에 아래 변수를 설정합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

| 변수 | 필수 | 설명 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | 서버 전용 키 — **클라이언트 번들에 절대 포함 금지** |
| `NEXT_PUBLIC_SITE_URL` | 선택 | OG 태그용 배포 URL (기본값: `https://winemine.vercel.app`) |
| `SLACK_WEBHOOK_URL` | 선택 | 서버 전용. waitlist 신규/중복 등록 시 Slack 채널 알림 (미설정 시 silent skip) |

> `SUPABASE_SERVICE_ROLE_KEY`는 `NEXT_PUBLIC_` 접두사를 붙이면 절대 안 됩니다. Server Action(`actions.ts`)에서만 사용됩니다.

---

## 데이터베이스 설정

Supabase 대시보드 → SQL Editor에서 실행:

```sql
CREATE TABLE waitlist (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  contact      VARCHAR(255) NOT NULL,
  contact_type VARCHAR(10)  NOT NULL CHECK (contact_type IN ('email', 'phone')),
  created_at   TIMESTAMPTZ  DEFAULT now() NOT NULL,
  ip_address   VARCHAR(50),
  user_agent   TEXT,
  marketing_agree BOOLEAN   DEFAULT false,
  CONSTRAINT waitlist_contact_unique UNIQUE (contact)
);

-- RLS 활성화 (public SELECT 정책 없음)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
```

### 데이터 흐름

```
사용자 입력
  └─ WaitlistForm (react-hook-form + zod 클라이언트 검증)
       └─ submitWaitlist() Server Action
            ├─ zod 서버 검증 (이메일 or 한국 전화번호)
            ├─ IP / User-Agent 수집 (x-forwarded-for)
            └─ Supabase insert (service role key)
                 └─ 중복 시 23505 에러 → success: true 반환
```

---

## i18n

브라우저의 `Accept-Language` 헤더를 기반으로 언어를 자동 감지하고, `NEXT_LOCALE` 쿠키에 저장합니다.

| 지원 언어 | 코드 | 기본값 |
|-----------|------|--------|
| 한국어 | `ko` | ✅ |
| 영어 | `en` | — |

- **미들웨어** (`middleware.ts`): 요청마다 쿠키 확인 → 없으면 헤더 파싱 → 쿠키 세팅 (1년 유효)
- **서버** (`lib/i18n.ts`): `getLocale()` / `getMessages()` — layout에서 호출
- **클라이언트** (`LocaleProvider`): Context를 통해 하위 컴포넌트에 메시지 공급
- **번역 파일**: `src/messages/ko.json` / `src/messages/en.json` — 키 구조 반드시 동기화

---

## 핵심 구현 노트

### 세계 지도 SSR 처리

`react-simple-maps`는 브라우저 API를 사용하므로 서버 렌더링 불가합니다.  
dynamic import는 `world-map.tsx`가 아닌 **`hero-section.tsx`에서** 처리합니다:

```ts
const WorldMap = dynamic(() => import('@/components/map/world-map'), { ssr: false });
```

국가 식별은 `geo.id`를 3자리 숫자 문자열로 패딩하여 사용합니다 (`ISO_A3` 코드 아님):

```ts
String(geo.id).padStart(3, '0')  // e.g. "250" for France
```

### 지도 무한 스크롤 애니메이션

960×500 SVG 두 장을 가로로 이어 붙여 `mapSlideLeft` keyframe으로 무한 스크롤합니다. (`globals.css` 정의)

### 보안

- Supabase 접근은 **Server Action에서만** — 클라이언트 직접 접근 없음
- 이메일/전화번호는 클라이언트(Zod) + 서버(Server Action) **양쪽 모두** 검증
- 전화번호는 한국 형식만 허용: `/^010[-\s]?\d{4}[-\s]?\d{4}$/`

---

## 배포

Vercel에 자동 배포됩니다. 배포 전 Vercel 대시보드에서 환경 변수를 설정하세요:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_SITE_URL
```

---

## 개발 명령어

```bash
npm run dev      # Turbopack 개발 서버
npm run build    # 프로덕션 빌드 (타입/빌드 오류 확인)
npm run lint     # ESLint
npm run start    # 프로덕션 서버 (build 후)
```

테스트 프레임워크는 없습니다. UI 변경 후에는 `npm run build`로 오류를 확인하세요.
