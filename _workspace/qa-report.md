# QA 보고서 — winemine 랜딩 페이지

실행 일시: 2026-05-05 23:12 KST

## 파일 존재 체크

| 파일 | 상태 |
|------|------|
| src/app/layout.tsx | OK |
| src/app/globals.css | OK |
| src/app/actions.ts | OK |
| src/app/page.tsx | OK |
| src/lib/supabase-server.ts | OK |
| src/lib/validations.ts | OK |
| src/lib/utils.ts | OK |
| src/components/map/world-map.tsx | OK |
| src/components/sections/hero-section.tsx | OK |
| src/components/sections/features-section.tsx | OK |
| src/components/sections/how-it-works-section.tsx | OK |
| src/components/sections/final-cta-section.tsx | OK |
| src/components/waitlist/waitlist-modal.tsx | OK |
| src/components/waitlist/waitlist-form.tsx | OK |
| src/components/waitlist/waitlist-success.tsx | OK |
| public/world-110m.json | OK |
| .env.example | OK |
| package.json | OK |
| next.config.ts | OK (참고) |
| tsconfig.json | OK (참고) |
| postcss.config.mjs | OK (참고) |

모든 필수 파일이 존재한다.

## 보안 검증

| 항목 | 결과 | 근거 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE` 등 NEXT_PUBLIC 접두사로 service role 노출 여부 | PASS — 0건 | `grep -r "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE\|NEXT_PUBLIC_SERVICE_ROLE" src/` 결과 없음 |
| `src/app/actions.ts` `'use server'` 지시어 첫 줄 | PASS | 1행에 `'use server';` 확인 |
| 클라이언트 컴포넌트(`src/components/`)에서 `SERVICE_ROLE_KEY` 직접 사용 | PASS — 0건 | `grep -r "SERVICE_ROLE_KEY" src/components/` 결과 없음 |
| `.env.example` 의 키 명명 규칙 | PASS | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`(서버 전용), `NEXT_PUBLIC_SITE_URL` |
| Supabase client 생성 위치 | PASS | `actions.ts` 내부 (서버 전용)에서만 `SUPABASE_SERVICE_ROLE_KEY` 참조 |

서비스 키 노출 가능성 없음. 보안 측면 이슈 없음.

## 코드 정합성

| 항목 | 결과 | 근거 |
|------|------|------|
| `WorldMap` dynamic import (`ssr: false`) | PASS | `hero-section.tsx:7-12` 에 `dynamic(() => import('@/components/map/world-map'), { ssr: false, loading: ... })` |
| `WaitlistModal`에 `AnimatePresence` 사용 | PASS | `waitlist-modal.tsx:4` import, `:38` 및 `:145`에서 wrap |
| `page.tsx` `'use client'` + `modalOpen` state | PASS | 1행 `'use client'`, `useState` 임포트, `const [modalOpen, setModalOpen] = useState(false)` |
| `WaitlistForm` 가 `submitWaitlist` import 및 호출 | PASS | `waitlist-form.tsx:7` import, `:43` `await submitWaitlist({ contact, contactType })` |
| `WorldMap` `'use client'` 지시어 | PASS | 1행 `'use client'` |
| `WorldMap` `WINE_REGIONS` 상수 정의 | PASS | `world-map.tsx:8-19`에 10개 와인 국가 정의 (FRA, ITA, ESP, USA, DEU, ARG, CHL, PRT, AUT, NZL) |
| `HeroSection` `onOpenModal` prop 시그니처 | PASS | `interface HeroSectionProps { onOpenModal: () => void; }` |
| `page.tsx` 모든 섹션 import | PASS | Hero / Features / HowItWorks / FinalCTA / WaitlistModal 모두 import 및 렌더 |
| 색상 스펙 spot-check | PASS | `#8B1A2A` (waitlist-form 활성 탭 / hero CTA), `#05020A` (hero 배경) 등 사용 확인 |
| 모든 섹션 클라이언트 디렉티브 | PASS | features / how-it-works / final-cta 모두 `'use client'` (framer-motion 사용) |

## TypeScript 검사

상태: PASS

`npx tsc --noEmit` (Node 16 환경에서도 정상 동작) 종료 코드 0, 출력 없음. 타입 에러 없음.

## 빌드 검사

상태: FAIL — 단, 환경 문제이며 코드 결함 아님

세부 내역:
1. **Node 16 (시스템 기본):** `next build` 즉시 거부 — `Next.js requires Node ^18.18.0 || ^19.8.0 || >= 20.0.0`. 실제 빌드 단계 진입하지 않음.
2. **Node 18.18.2 (nvm):** 빌드 중 `Cannot find module '../lightningcss.darwin-x64.node'` 에러로 실패. `lightningcss`의 네이티브 바이너리가 누락됨.
3. **Node 25.9.0 (nvm):** 빌드 중 `Cannot find native binding` (at `@tailwindcss/oxide/index.js:559`) 에러로 실패. tailwindcss-oxide 네이티브 바이너리가 누락됨.

원인: `node_modules`가 Node 16 (그리고 잘못된 아키텍처)로 설치되어 있어 `lightningcss`와 `@tailwindcss/oxide`의 플랫폼별 optional native 패키지(`lightningcss-darwin-arm64`, `@tailwindcss/oxide-darwin-arm64` 등)가 빠져 있음. 이는 npm optional-deps 버그(npm/cli#4828)로 알려진 문제로, **순수 환경/설치 이슈**이며 소스 코드 문제는 아니다.

권장 재현 절차 (오케스트레이터/개발자):
```
nvm use 20            # 또는 18.18+
rm -rf node_modules package-lock.json
npm install
npm run build
```

호스트 정보: macOS arm64, 시스템 node `v16.20.1`.

## 발견된 이슈

### 치명적 (즉시 수정 필요)
없음. 코드 차원에서는 빌드 차단 결함이 발견되지 않았다.

### 경고 (권고 검토)
1. **빌드 환경 비호환** — 현재 `node_modules`/lockfile 상태로는 `npm run build`가 통과하지 않는다. CI/배포 전에 Node 18+ 환경에서 의존성을 재설치(`rm -rf node_modules package-lock.json && npm i`)해야 한다. `package.json`에 `"engines": { "node": ">=18.18" }` 명시를 권장한다.
2. **`@types/topojson-client` 사용처 부재** — `world-map.tsx`에서 topojson-client를 import 하지 않는 듯 하나 의존성에 포함됨. 실제 미사용이면 제거를 검토 (번들러는 건드리지 않으므로 우선순위 낮음).

### 정보
1. `actions.ts`의 중복 키 처리: `error.code === '23505'` (unique violation)을 `success: true`로 처리해 사용자 경험을 개선했고 보안상 문제 없음.
2. `submitWaitlist`가 `x-forwarded-for`와 `user-agent`를 수집하므로 개인정보 처리방침/배너 측면을 추후 고려.
3. 빌드 검사 미통과로 런타임 페이지/번들 사이즈/RSC 경계 자동 검증은 보고에서 제외했다 (TypeScript + 정합성 grep으로 보완).

## 종합 평가

WARN — 코드는 통과(타입 OK, 보안 OK, 정합성 OK), 단 빌드는 환경 의존성 재설치 필요

소스 코드 차원에서 치명적 결함은 없으나, 현재 머신의 `node_modules` 상태(Node 16에서 설치 + 일부 native optional package 누락)로 인해 `next build`가 실패한다. 이는 코드가 아닌 환경 문제이며, Node 18+에서 의존성을 깨끗하게 재설치하면 해소될 가능성이 매우 높다. 빌드 재검증을 거친 후 배포 진행을 권고한다.
