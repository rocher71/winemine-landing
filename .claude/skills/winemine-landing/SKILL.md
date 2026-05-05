---
name: winemine-landing
description: "winemine 랜딩 페이지 개발 오케스트레이터. 랜딩 페이지 만들기, 개발 시작, 페이지 구현, Next.js 시작, 랜딩 개발, scaffold, 컴포넌트 구현 요청 시 반드시 이 스킬을 사용. 후속 작업: 랜딩 페이지 수정, 특정 섹션 다시 구현, 스타일 변경, QA 재실행, 빌드 오류 수정, 컴포넌트 보완 요청 시에도 이 스킬을 사용."
---

# Winemine Landing Page Orchestrator

winemine 랜딩 페이지를 단계별로 구축하는 하이브리드 오케스트레이터.
`WINEMINE_LANDING_SPEC.md`와 `CLAUDE.md`를 기준으로 에이전트 팀을 조율한다.

## 실행 모드: 하이브리드

| Phase | 모드 | 에이전트 |
|-------|------|---------|
| Phase 1: Scaffold | 서브 에이전트 | winemine-scaffold |
| Phase 2: 사용자 설정 | 중단점 (사용자 액션) | — |
| Phase 3: 컴포넌트 개발 | 에이전트 팀 | winemine-map + winemine-ui |
| Phase 4: QA | 서브 에이전트 | winemine-qa |

## 에이전트 구성

| 에이전트 | 타입 | 역할 | 출력 파일 |
|---------|------|------|---------|
| winemine-scaffold | 커스텀 | 프로젝트 기반 구축 | package.json, layout.tsx, actions.ts, lib/*, globals.css, world-110m.json |
| winemine-map | 커스텀 | 세계 지도 + Hero 섹션 | map/world-map.tsx, sections/hero-section.tsx |
| winemine-ui | 커스텀 | Waitlist 모달 + 모든 섹션 + page.tsx | waitlist/*, sections/features,how-it-works,final-cta, page.tsx |
| winemine-qa | 커스텀 | 품질 검증 | _workspace/qa-report.md |

---

## 워크플로우

### Phase 0: 컨텍스트 확인

`_workspace/` 디렉토리와 `package.json` 존재 여부를 확인하여 실행 모드를 결정한다.

**실행 모드 분기:**

- **`package.json` 없음** → 초기 실행. Phase 1(Scaffold)부터 시작
- **`package.json` 있음 + 사용자가 특정 부분 수정 요청** → 부분 재실행
  - "지도 다시 구현해줘" → Phase 3에서 winemine-map 에이전트만 재실행
  - "QA 다시 해줘" → Phase 4만 재실행
  - "스타일 수정해줘" → 해당 컴포넌트 담당 에이전트만 재실행
- **`package.json` 있음 + 새 전체 실행 요청** → 기존 `_workspace/`를 `_workspace_{timestamp}/`로 이동 후 초기 실행

```bash
# 확인 명령어
ls /Users/yejinkim/Documents/git/winemine/package.json 2>/dev/null && echo "EXISTS" || echo "NOT_FOUND"
ls /Users/yejinkim/Documents/git/winemine/_workspace 2>/dev/null && echo "EXISTS" || echo "NOT_FOUND"
```

### Phase 1: Scaffold (서브 에이전트)

**실행 모드:** 서브 에이전트

`winemine-scaffold` 에이전트를 호출하여 프로젝트 기반을 구축한다.

```
Agent(
  subagent_type: "winemine-scaffold",
  model: "opus",
  prompt: """
  winemine 랜딩 페이지 프로젝트 기반을 구축하라.
  
  작업 디렉토리: /Users/yejinkim/Documents/git/winemine
  
  에이전트 정의 파일을 읽고 지시에 따라 실행하라:
  .claude/agents/winemine-scaffold.md
  
  스펙 참조: WINEMINE_LANDING_SPEC.md
  
  완료 후 생성된 파일 목록을 보고하라.
  CRITICAL: SUPABASE_SERVICE_ROLE_KEY를 절대 NEXT_PUBLIC_ 접두사로 사용하지 말 것.
  """
)
```

scaffold 완료 후 사용자에게 다음을 안내한다:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 프로젝트 기반 구축 완료!

다음 단계로 진행하려면 Supabase 설정이 필요합니다:

1. Supabase 대시보드(https://supabase.com)에서 새 프로젝트 생성

2. SQL Editor에서 다음 SQL 실행:
   CREATE TABLE waitlist (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     contact VARCHAR(255) NOT NULL,
     contact_type VARCHAR(10) NOT NULL CHECK (contact_type IN ('email', 'phone')),
     created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
     ip_address VARCHAR(50),
     user_agent TEXT,
     CONSTRAINT waitlist_contact_unique UNIQUE (contact)
   );
   CREATE INDEX waitlist_created_at_idx ON waitlist (created_at DESC);
   CREATE INDEX waitlist_contact_type_idx ON waitlist (contact_type);
   ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

3. Settings → API에서 URL과 service_role key 복사

4. 프로젝트 루트에 .env.local 파일 생성:
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

5. 완료되면 "계속" 또는 "다음 단계" 라고 입력해주세요.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**→ 사용자 확인 대기. "계속", "다음", "done", "완료" 등의 신호 후 Phase 3 진행.**

### Phase 2: 사용자 설정 (중단점)

사용자가 Supabase 설정을 완료할 때까지 대기한다.
사용자가 확인 신호를 보내면 `.env.local` 파일 존재 여부를 확인하고 Phase 3로 진행한다.

```bash
ls /Users/yejinkim/Documents/git/winemine/.env.local 2>/dev/null && echo "EXISTS" || echo "NOT_FOUND"
```

`.env.local`이 없으면 사용자에게 다시 안내.

### Phase 3: 컴포넌트 개발 (에이전트 팀)

**실행 모드:** 에이전트 팀

`_workspace/` 디렉토리를 생성하고 팀을 구성한다.

```bash
mkdir -p /Users/yejinkim/Documents/git/winemine/_workspace
```

**팀 구성:**

```
TeamCreate(
  team_name: "winemine-component-team",
  members: [
    {
      name: "winemine-map",
      agent_type: "winemine-map",
      model: "opus",
      prompt: """
      winemine 랜딩 페이지의 세계 지도 컴포넌트와 Hero 섹션을 구현하라.
      
      에이전트 정의: .claude/agents/winemine-map.md 를 읽고 지시에 따라 실행
      스펙 참조: WINEMINE_LANDING_SPEC.md
      작업 디렉토리: /Users/yejinkim/Documents/git/winemine
      
      구현 완료 후:
      1. ui-engineer에게 HeroSection props 인터페이스를 SendMessage로 공유
      2. _workspace/map-done.md 에 완료 상태와 생성 파일 목록 저장
      3. 오케스트레이터에게 완료 알림
      """
    },
    {
      name: "winemine-ui",
      agent_type: "winemine-ui",
      model: "opus",
      prompt: """
      winemine 랜딩 페이지의 Waitlist 모달 시스템과 모든 섹션, page.tsx를 구현하라.
      
      에이전트 정의: .claude/agents/winemine-ui.md 를 읽고 지시에 따라 실행
      스펙 참조: WINEMINE_LANDING_SPEC.md
      작업 디렉토리: /Users/yejinkim/Documents/git/winemine
      
      시작 시:
      1. winemine-map으로부터 HeroSection props 인터페이스 메시지를 기다린다
         (또는 기다리지 않고 onOpenModal: () => void 인터페이스를 자체 정의해도 됨)
      
      구현 완료 후:
      1. _workspace/ui-done.md 에 완료 상태와 생성 파일 목록 저장
      2. 오케스트레이터에게 완료 알림
      
      CRITICAL: @hookform/resolvers 패키지가 필요하면 npm install @hookform/resolvers 먼저 실행
      """
    }
  ]
)
```

**작업 등록:**

```
TaskCreate(tasks: [
  { title: "WorldMap 컴포넌트 구현", description: "react-simple-maps + topojson, stagger 애니메이션, hover 툴팁", assignee: "winemine-map" },
  { title: "HeroSection 구현", description: "지도 배경 + 로고 오버레이 + CTA 버튼, dynamic import ssr:false", assignee: "winemine-map", depends_on: ["WorldMap 컴포넌트 구현"] },
  { title: "WaitlistForm + WaitlistSuccess 구현", description: "react-hook-form, zod, 이메일/전화 탭", assignee: "winemine-ui" },
  { title: "WaitlistModal 구현", description: "AnimatePresence, focus trap, Escape 키, body overflow", assignee: "winemine-ui", depends_on: ["WaitlistForm + WaitlistSuccess 구현"] },
  { title: "FeaturesSection 구현", description: "3 cards, whileInView stagger, Globe2/Camera/Share2 아이콘", assignee: "winemine-ui" },
  { title: "HowItWorksSection 구현", description: "3 steps, 번호 장식, whileInView", assignee: "winemine-ui" },
  { title: "FinalCTASection + Footer 구현", description: "두 번째 CTA, onOpenModal prop, Footer 저작권", assignee: "winemine-ui" },
  { title: "page.tsx 구현", description: "모든 섹션 조합, modalOpen useState, openModal/closeModal 함수", assignee: "winemine-ui", depends_on: ["WaitlistModal 구현", "FeaturesSection 구현", "HowItWorksSection 구현", "FinalCTASection + Footer 구현"] }
])
```

**리더 모니터링:**
- 팀원이 유휴 상태가 되면 자동 알림 수신
- `TaskGet`으로 전체 진행률 확인
- 팀원이 막히면 `SendMessage`로 지시

**두 팀원 모두 완료 확인 후** Phase 4로 진행:

```
TeamDelete(team_name: "winemine-component-team")
```

### Phase 4: QA (서브 에이전트)

**실행 모드:** 서브 에이전트

```
Agent(
  subagent_type: "winemine-qa",
  model: "opus",
  prompt: """
  winemine 랜딩 페이지 전체 구현물을 QA 검증하라.
  
  에이전트 정의: .claude/agents/winemine-qa.md 를 읽고 체크리스트대로 실행
  작업 디렉토리: /Users/yejinkim/Documents/git/winemine
  
  결과를 _workspace/qa-report.md 에 저장하고 종합 평가를 보고하라.
  치명적 보안 이슈 발견 시 즉시 명시할 것.
  """
)
```

### Phase 5: 완료 및 보고

1. `_workspace/qa-report.md` 읽기
2. 사용자에게 최종 결과 요약 보고:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🍷 winemine 랜딩 페이지 개발 완료!

## 구현된 파일
- src/app/layout.tsx (폰트, 메타 태그)
- src/app/globals.css (색상 시스템)
- src/app/actions.ts (Server Action)
- src/components/map/world-map.tsx
- src/components/sections/ (4개 섹션)
- src/components/waitlist/ (모달/폼/성공)
- src/app/page.tsx

## QA 결과
{qa-report 요약}

## 다음 단계
1. npm run dev 로 로컬 확인
2. 브라우저에서 http://localhost:3000 확인
3. Vercel 배포: vercel --prod
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 데이터 흐름

```
[오케스트레이터]
  │
  ├─ Phase 1: Agent(winemine-scaffold) → 기반 파일 생성
  │
  ├─ Phase 2: 사용자 Supabase 설정 (중단점)
  │
  ├─ Phase 3: TeamCreate(winemine-map + winemine-ui)
  │   ├─ winemine-map: world-map.tsx, hero-section.tsx
  │   │   └─ SendMessage(to: "winemine-ui", HeroSection props)
  │   └─ winemine-ui: waitlist/*, sections/*, page.tsx
  │       └─ 모든 파일을 src/ 에 직접 기록
  │
  ├─ Phase 4: Agent(winemine-qa) → _workspace/qa-report.md
  │
  └─ Phase 5: 완료 보고
```

---

## 에러 핸들링

| 상황 | 전략 |
|------|------|
| scaffold 에이전트 실패 | 오류 내용 확인 후 특정 단계만 재실행 |
| `npm install` 실패 | scaffold 에이전트에게 `npm install --legacy-peer-deps` 시도 지시 |
| map 에이전트 실패/중단 | SendMessage로 상태 확인, 필요 시 서브 에이전트로 재실행 |
| ui 에이전트 실패/중단 | 완료된 컴포넌트 목록 확인, 미완료 컴포넌트만 재실행 |
| QA에서 치명적 이슈 발견 | 이슈 내용을 사용자에게 보고 후 수정 방향 논의 |
| `.env.local` 없이 Phase 3 요청 | Supabase 설정 먼저 완료 안내 |
| `@hookform/resolvers` 누락 | ui 에이전트 시작 전 `npm install @hookform/resolvers` 자동 실행 |

---

## 테스트 시나리오

### 정상 흐름
1. 오케스트레이터가 Phase 0에서 `package.json` 미존재 확인 → 초기 실행 결정
2. Phase 1: scaffold 에이전트가 패키지, 설정 파일, lib 파일, actions.ts, layout.tsx, globals.css, world-110m.json 생성
3. 사용자에게 Supabase 설정 안내 → 사용자가 ".env.local 설정 완료" 확인
4. Phase 3: winemine-map이 WorldMap + HeroSection 구현, winemine-ui가 Waitlist 모달 + 섹션들 + page.tsx 구현
5. Phase 4: QA 에이전트가 모든 체크리스트 통과, "✅ 배포 준비 완료" 평가
6. Phase 5: 사용자에게 완료 보고 및 `npm run dev` 안내

### 에러 흐름
1. Phase 3에서 winemine-ui가 `@hookform/resolvers` 없어서 중단
2. 오케스트레이터가 유휴 알림 수신
3. `npm install @hookform/resolvers` 실행 지시 후 winemine-ui 재시작
4. 재시작 후 정상 완료, Phase 4로 진행

---

## 부분 재실행 가이드

Phase 0에서 `package.json` 존재 확인 시 다음 패턴으로 처리:

| 사용자 요청 | 재실행 대상 | 방법 |
|-----------|-----------|------|
| "지도 다시 구현해줘" | winemine-map | Phase 3에서 map 에이전트만 서브 에이전트로 실행 |
| "모달 스타일 수정해줘" | winemine-ui (modal만) | Phase 3에서 ui 에이전트에게 modal만 수정 지시 |
| "QA 다시 해줘" | winemine-qa | Phase 4만 실행 |
| "섹션 전체 다시 구현" | winemine-map + winemine-ui | Phase 3 전체 재실행 (팀 모드) |
