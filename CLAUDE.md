# winemine — Claude Code Context

## 서비스 개요

**winemine**은 와인 라벨을 촬영하면 AI가 와인을 인식하고, 마신 와인을 세계 지도 위에 지역별로 시각화해 기록하는 앱이다.

- 서비스명: **winemine** (소문자, 붙여쓰기 고정)
- 타겟: 와인을 즐기는 사람 — 기록하고, 탐험하고, 공유하고 싶은 사람
- 핵심 감성: 프리미엄 와인 라벨의 무게감. 어두운 밤, 와인 한 잔.

---

## 핵심 기능 (풀 앱 비전)

### 1. 와인 라벨 스캔 & 인식
- 카메라로 와인 라벨 촬영 → AI가 품종, 빈티지, 생산자, 원산지 자동 인식
- 인식 후 지역 확인 → 저장

### 2. 세계 지도 기반 기록
- 마신 와인을 세계 지도 위에 지역별 opacity로 시각화
- 많이 마신 지역일수록 색이 진해짐 (투명도 누적)
- 지역 드릴다운: 국가 탭 → 세부 지역 확대
  - 예: 프랑스 → 보르도 / 뫼르소 / 샹파뉴 등
  - 세부 지역이 있는 와인은 해당 지역도 opacity 차등 표시

### 3. Recap 공유 (핵심 차별점)
- Flighty / YouTube Music Recap 스타일
- 언제든 내 와인 여정을 인스타그램 스토리 비율(9:16)로 이미지 생성
- 공유하기 좋은 시각적 요약 — 지도 + 통계 + 하이라이트

### 4. 와인 상세 정보
- 라벨 인식 후 와인 상세 정보 제공 (생산자, 품종, 테이스팅 노트 등)
- 타인 리뷰 표시 여부는 미결 (검토 중)

---

## 현재 개발 단계

**Phase 1 (현재): 랜딩 페이지 + Waiting List**

앱 출시 전 사전 신청자를 모으기 위한 랜딩 페이지. 풀 스펙: `WINEMINE_LANDING_SPEC.md`

- Next.js 15 App Router + TypeScript
- 인터랙티브 세계 지도 배경 (react-simple-maps, demo 데이터)
- "앱 다운받기" CTA → 팝업 → 이메일/전화번호 수집
- Supabase PostgreSQL (`waitlist` 테이블)에 연락처 저장
- Vercel 배포

**Phase 2 이후: 풀 앱 개발**
- iOS/Android 앱은 **별도 레포**로 생성 예정
- 이 레포는 랜딩 페이지 전용 (향후 Turborepo 모노레포 통합 가능)

---

## 기술 스택 (랜딩 페이지)

| 레이어 | 선택 |
|--------|------|
| 프레임워크 | Next.js 15 App Router |
| 언어 | TypeScript 5.7 (strict mode) |
| 스타일링 | Tailwind CSS v4 + shadcn/ui |
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

### 로고 규칙
- 항상 **소문자 `winemine`** 으로 표기 (대문자/분리 금지)
- Playfair Display 폰트, letter-spacing: -0.02em

---

## 데이터베이스 스키마

### `waitlist` 테이블 (Supabase)
```sql
CREATE TABLE waitlist (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  contact      VARCHAR(255) NOT NULL,
  contact_type VARCHAR(10)  NOT NULL CHECK (contact_type IN ('email', 'phone')),
  created_at   TIMESTAMPTZ  DEFAULT now() NOT NULL,
  ip_address   VARCHAR(50),
  user_agent   TEXT,
  CONSTRAINT waitlist_contact_unique UNIQUE (contact)
);
```

---

## 환경 변수

```
NEXT_PUBLIC_SUPABASE_URL      # Supabase 프로젝트 URL
SUPABASE_SERVICE_ROLE_KEY     # 서버 전용 (절대 NEXT_PUBLIC_ 접두사 금지)
NEXT_PUBLIC_SITE_URL          # 배포 URL (OG 태그용, optional)
```

**CRITICAL:** `SUPABASE_SERVICE_ROLE_KEY`는 Server Action에서만 사용. 클라이언트 번들에 절대 포함 금지.

---

## 보안 규칙

- Supabase 접근은 **Server Action만** 사용 (클라이언트 직접 접근 없음)
- 이메일/전화번호는 클라이언트(Zod) + 서버(Server Action) **양쪽 모두** 검증
- `waitlist` 테이블 RLS 활성화, public SELECT 정책 없음
- 전화번호: 한국 형식만 허용 `/^010[-\s]?\d{4}[-\s]?\d{4}$/`

---

## 지도 구현 주의사항

- `react-simple-maps`는 브라우저 API 사용 → **SSR 불가**
- 반드시 `dynamic(() => import('...'), { ssr: false })` 사용
- 지도 데이터: `public/world-110m.json` (world-atlas@2 패키지에서 다운로드)
- 국가 식별: `properties.ISO_A3` 또는 `properties.ADM0_A3` (버전에 따라 확인)
- Demo 와인 데이터: `{ FRA: 0.85, ITA: 0.70, ESP: 0.45, USA: 0.60, DEU: 0.30, ARG: 0.50, CHL: 0.40, PRT: 0.55, AUT: 0.25, NZL: 0.35 }`

---

## 파일 구조

```
src/
├── app/
│   ├── layout.tsx          # 폰트, 메타 태그, OG, security headers
│   ├── page.tsx            # 랜딩 페이지 (섹션 조합 + modalOpen state)
│   ├── globals.css
│   └── actions.ts          # Server Action: submitWaitlist()
├── components/
│   ├── sections/           # hero, features, how-it-works, final-cta
│   ├── map/world-map.tsx   # react-simple-maps (client only)
│   └── waitlist/           # modal, form, success
└── lib/
    ├── supabase-server.ts  # service role 클라이언트
    ├── validations.ts      # Zod 스키마
    └── utils.ts            # cn() 헬퍼
public/
└── world-110m.json
```

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

**목표:** 변경사항을 git commit하고 GitHub에 push한다.

**트리거:** "커밋해줘", "푸시해줘", "commit", "push", "저장해줘", "깃에 올려줘" 등 요청 시 `commit-push` 스킬을 사용하라.
