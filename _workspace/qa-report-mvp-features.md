# QA Report — MVP Features Landing Expansion (2026-05-14)

브랜치: `feat/landing-mvp-features`
검증 대상: 신규 5개 섹션 + How It Works 4→6단계 확장 + i18n + page.tsx 14-section 마운트

---

## 결과 요약

- ✅ **빌드**: 통과 (`next build` exit 0, Static 8/8 생성, `/` 196 kB / First Load 386 kB)
- ✅ **TypeScript**: `npx tsc --noEmit` exit 0 (에러 0)
- ✅ **Lint**: 빌드 단계의 inline `Linting and checking validity of types` 통과. `next lint`는 ESLint config가 미생성 상태(repo에 `.eslintrc*` / `eslint.config.*` 없음)로 대화형 초기화 프롬프트만 띄움 — 빌드 lint 통과로 갈음 가능
- ✅ **i18n 동기화**: ko/en 각 825 키, 차이 0건. 5개 신규 최상위 키(`cellar`, `priceIntelligence`, `favoritesAlert`, `communityTonight`, `levelBadge`) 양쪽 모두 존재. `howItWorks.steps`도 ko/en 각각 6 원소
- ✅ **보안**: 신규 5개 섹션·page.tsx에서 `SUPABASE_SERVICE_ROLE_KEY` / `SLACK_WEBHOOK_URL` 등 서버 전용 env 참조 0건. 모든 신규 섹션이 `'use client'` 컴포넌트로 작성됨(recharts·useState·motion 요구 충족)
- ⚠️ **디자인 시스템**: 팔레트 핵심 색상 모두 사용. 신규 도입 색상 3개(`#5B4880`, `#A05D2A`, `#B08D57`)는 1회 사용. 모두 기존 톤(보라/구릿빛/금색) 범위 내 변주로 글로벌 영향 없음 (상세는 아래)
- ✅ **마운트 순서**: spec과 정확히 일치 (1 Hero → 2 WineDiscovery → 3 Burgundy → 4 Cellar → 5 TastingNote → 6 PriceIntelligence → 7 FavoritesAlert → 8 VineyardStrip → 9 Features → 10 CommunityTonight → 11 LevelBadge → 12 InstagramPreview → 13 HowItWorks → 14 FinalCTA). 렌더된 HTML에서 `<section>` 14개 카운트 확인
- ✅ **Dev 서버**: `http://localhost:3010/` HTTP 200, 220 KB HTML. 신규 섹션 5개 헤딩 텍스트 모두 마크업 안에 포함. How It Works `01`~`06` 6단계 모두 렌더. recharts SVG 3개 노드 렌더. dev 로그 error/warn 0건

---

## 상세

### 빌드 (`npm run build`)

```
✓ Compiled successfully in 7.4s
✓ Generating static pages (8/8)
Route (app)                                 Size  First Load JS
┌ ƒ /                                     196 kB         386 kB
├ ƒ /_not-found                            996 B         103 kB
├ ○ /icon.png                                0 B            0 B
├ ○ /opengraph-image.png                     0 B            0 B
├ ƒ /tasting-note-playground             14.8 kB         205 kB
└ ○ /twitter-image.png                       0 B            0 B
+ First Load JS shared by all             102 kB
ƒ Middleware                             34.4 kB
```

타입 체크/lint inline 통과. recharts 추가에도 First Load JS 386 KB로 합리적인 범위.

### TypeScript (`npx tsc --noEmit`)

에러 0건, 출력 없음.

### Lint

- 레포에 ESLint config 파일(`.eslintrc*`, `eslint.config.*`) 미존재
- `npm run lint` → 대화형 초기화 프롬프트(Strict/Base 선택)로 진입 → 비대화 환경에서는 실행 불가
- 단, `next build`의 `Linting and checking validity of types ...` 단계가 0 에러로 통과했으므로 inline lint는 통과로 간주
- 후속 권장: `eslint.config.mjs` 명시 생성 후 CI에서 `npm run lint` 자동화

### i18n (`src/messages/ko.json` ↔ `src/messages/en.json`)

| 항목 | 결과 |
|------|------|
| ko 총 키 (경로/배열 인덱스 포함) | 825 |
| en 총 키 | 825 |
| ko에만 있는 키 | 0 |
| en에만 있는 키 | 0 |
| `cellar` top-level 존재 (ko/en) | ✅ / ✅ |
| `priceIntelligence` top-level 존재 (ko/en) | ✅ / ✅ |
| `favoritesAlert` top-level 존재 (ko/en) | ✅ / ✅ |
| `communityTonight` top-level 존재 (ko/en) | ✅ / ✅ |
| `levelBadge` top-level 존재 (ko/en) | ✅ / ✅ |
| `howItWorks.steps` 원소 수 | ko=6, en=6 |

ko/en 키 구조 100% 일치.

### 보안

| 검사 항목 | 결과 |
|----------|------|
| `src/components/sections/*.tsx`에 `process.env.SUPABASE_SERVICE_ROLE_KEY` 참조 | 0건 |
| `src/components/sections/*.tsx`에 `process.env.SLACK_WEBHOOK_URL` 참조 | 0건 |
| `src/components/sections/*.tsx`에 `process.env` 사용 | 0건 |
| 5개 신규 섹션 `'use client'` 선언 | 5/5 (cellar, price-intelligence, favorites-alert, community-tonight, level-badge) |
| `src/app/page.tsx`에 server-only env 참조 | 0건 |

recharts는 브라우저 전용 라이브러리이므로 `'use client'`가 필수이며 `price-intelligence-section.tsx` 첫 줄에 정확히 선언됨. 직접 클라이언트에서 Supabase/Slack 접근 없음.

### 신규 섹션별 디자인 시스템 검토

5개 섹션에서 사용된 hex 색상 합집합 (17개):
```
#05020A #0A050F #0F0718 #1A0A1E #2D1540
#5B4880 #6A5E4A #8B1A2A #9B8B7A #A05D2A
#B08D57 #C41E3A #C9A84C #D4C5B0 #E06070
#E8C97A #F5F0E8
```

기존 코드베이스 사용 횟수(`*.tsx`/`*.ts`/`*.css` 기준):

| 색상 | 용도 | 기존 사용 횟수 | 비고 |
|------|------|--------------|------|
| `#C41E3A` | Wine red 변주 (pulse/그라데이션) | 19 | 기존 burgundy/wine-discovery/france-wine 등에서도 사용 (정착) |
| `#6A5E4A` | 깊은 muted(라벨 보조) | 17 | features/instagram/how-it-works 등에서 사용 (정착) |
| `#E06070` | Peak 상태 강조 텍스트 | 3 | tasting-note 계열에서 선행 사용 |
| `#E8C97A` | Gold 그라데이션 끝점 | 2 | level-badge 외 1곳 |
| `#5B4880` | 커뮤니티 아바타 보라 | 1 (신규) | community-tonight 단일 점유, `#2D1540`(border) 톤 변형 |
| `#A05D2A` | 커뮤니티 아바타 구릿빛 | 1 (신규) | community-tonight 단일 점유 |
| `#B08D57` | Level XP 게이지 그라데이션 시작점 | 1 (신규) | level-badge 단일 점유, `#C9A84C` Gold 어두운 변형 |

코어 팔레트(Wine Red `#8B1A2A`, Gold `#C9A84C`, Cream `#F5F0E8`, Secondary Text `#D4C5B0`, Muted `#9B8B7A`, Deepest Dark `#05020A`, Deep Dark `#0A050F`, Map Dark `#1A0A1E`, Surface `#0F0718`, Border `#2D1540`)는 모든 섹션이 일관 사용.

신규 1회 색상 3종은 모두 인접 톤(보라/금색/구릿빛 어두운 변주)에서 파생되어 시각적 단절은 없으나, **디자인 시스템 토큰화 단계에서 표준 변종으로 등록할지 또는 기존 토큰으로 치환할지 정리 권장**.

폰트 패밀리:
- 5개 신규 섹션 모두 제목 = `var(--font-playfair), Georgia, serif`
- 본문은 body 전역(Inter) 상속, 별도 지정 없음 (정상)

#### 섹션별 메모

- **cellar-section**: 음용 적기 timeline + MiniBottle SVG 자체 구현. `STATUS_COLOR` map 4종(`ready`/`hold`/`peak`/`past`) 모두 팔레트 또는 인접 변주 사용. `useState` 토글 alert는 클라이언트 전용.
- **price-intelligence-section**: recharts `<LineChart>` 사용으로 `'use client'` 필수 만족. 차트 색상이 Gold(`#C9A84C`) 단색 라인 + grid `rgba(201,168,76,0.10)`으로 톤 안 흩어짐. mock 12개월 price 배열만 사용 (외부 호출 없음).
- **favorites-alert-section**: recharts 미사용. SVG sparkline 직접 그림. 4-step flow의 step 3에서만 PushBanner를 강조 처리. `AlertToggleRow` toggle 상호작용 OK.
- **community-tonight-section**: 한국 지도 mock SVG path + 4 dot pulse 애니메이션. `motion.circle`의 `r`/`opacity` 키프레임 애니메이션 사용. 아바타 palette 4종 중 2종이 신규 색상(`#5B4880`, `#A05D2A`).
- **level-badge-section**: XP 게이지 `linear-gradient(90deg, #B08D57 0%, #C9A84C 50%, #E8C97A 100%)` — Gold의 명도 변주로 표현. Badge 그리드 3xN, 잠금 뱃지에 `🔒` 오버레이. `progress = 1240/2000`로 하드코딩된 상태(데모 정상).

### 마운트 순서 (`src/app/page.tsx`)

```
1.  HeroSection              (onOpenModal)
2.  WineDiscoverySection
3.  BurgundySection
4.  CellarSection            ← NEW
5.  TastingNoteSection       (onOpenModal)
6.  PriceIntelligenceSection ← NEW
7.  FavoritesAlertSection    ← NEW
8.  VineyardStrip
9.  FeaturesSection
10. CommunityTonightSection  ← NEW
11. LevelBadgeSection        ← NEW
12. InstagramPreviewSection
13. HowItWorksSection
14. FinalCTASection          (onOpenModal)
+ WaitlistModal, FloatingCTA
```

브라우저에서 렌더된 HTML의 `<section>` 카운트: 14개 (일치).

### Dev 서버 동작 확인

- 포트 3010에서 기동 (`PORT=3010 npm run dev`)
- `GET /` → HTTP 200, 응답 220832 bytes
- 신규 5개 섹션 헤딩 키워드 grep 결과:
  - `와인을 보관하고` ✅ (cellar)
  - `가격까지, 한눈에` ✅ (priceIntelligence)
  - `관심 와인의 가격` ✅ (favoritesAlert)
  - `오늘 밤` ✅ (communityTonight)
  - `마실수록 성장하는` ✅ (levelBadge)
- How It Works 단계 번호 `01`~`06` 6개 모두 렌더
- recharts 차트 SVG 노드 3개 마크업 포함 (gridline 등)
- dev 로그(`/tmp/winemine-dev.log`)에 error/warn/fail 라인 0건

### 기존 섹션 회귀 없음

`git diff --stat HEAD` 기준 다음 파일들에 변경 없음:
- `src/components/sections/hero-section.tsx`
- `src/components/sections/burgundy-section.tsx`
- `src/components/sections/wine-discovery-section.tsx`
- `src/components/sections/features-section.tsx`
- `src/components/sections/instagram-preview-section.tsx`
- `src/components/sections/final-cta-section.tsx`
- `src/components/sections/tasting-note-section.tsx`

수정된 파일은 `how-it-works-section.tsx` (4→6단계 확장), `src/app/page.tsx` (14 섹션 마운트), `src/messages/{ko,en}.json` 으로 의도된 범위에 한정.

### 추가 메모: How It Works 6단계 아이콘

`STEP_META`에 추가된 `HourglassIcon`, `BoltIcon`은 `src/components/icons/wine-icons.tsx` 라인 515 / 649에 실제 export로 정의되어 있어 import 정합성 OK. 6개 아이콘 모두 정상 해석.

---

## 미해결 이슈 / 권장 후속 조치

1. **(낮음) ESLint 설정 부재** — `next lint`가 대화형 프롬프트만 띄움. `eslint.config.mjs`를 추가하여 CI/로컬 자동화 가능하도록 권장. 빌드의 inline lint는 이미 통과하므로 블로커 아님.
2. **(낮음) 신규 1회 사용 색상 3종(`#5B4880`, `#A05D2A`, `#B08D57`)** — 디자인 토큰 정리 시기에 (a) 팔레트 표준 변종으로 등록하거나 (b) 기존 토큰(`#2D1540` 보라, `#8B5CF6` 보라, `#C9A84C` 골드)으로 치환할지 명세화 권장.
3. **(낮음) `level-badge-section`의 진행률 하드코딩** — `progress = 1240 / 2000`. 데모 의도이며 i18n `current.level`/`current.xp` 카피와 어긋나지 않으므로 OK. 추후 props/상태화 가능.
4. **(정보) recharts ^3.8.1 도입** — First Load JS가 ~386 KB로 합리적. 단, Price Intelligence 외 다른 차트가 늘어날 경우 `dynamic(import, { ssr: false })`로 chart island 분리해 LCP 영향 최소화 검토 권장.
5. **(정보) Dev 응답 220 KB** — 14 섹션 풀-페이지 HTML 기준 합리적. 단, Recap 이미지/wine bottle SVG 다수 사용 → 추후 LCP 측정 필요 시 별도 시나리오로.

---

## 최종 평가

**✅ 머지 / 배포 준비 완료**

- 빌드·타입·i18n·보안·마운트 순서·렌더 검증 모두 통과
- 기존 섹션 회귀 없음
- 미해결 이슈 5건 모두 권장 사항 수준(블로커 없음)
- `feat/landing-mvp-features` → 메인 머지 진행 가능

(주의: 본 보고서는 검증만 수행하며 커밋은 사용자가 별도 진행)
