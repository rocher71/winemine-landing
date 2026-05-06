---
name: wine-research-report
description: 전세계 와인 생산지 조사 보고서를 작성한다. 프랑스(보르도, 부르고뉴, 루아르, 샹파뉴, 알자스, 론, 프로방스, 랑그독 등 서브 지역 포함) 및 전세계(이탈리아, 스페인, 독일, 포르투갈, 미국, 호주, 아르헨티나, 칠레, 뉴질랜드, 남아공 등) 산지를 병렬 조사 후 통합 보고서로 합성한다. 와인 산지 조사, 와인 생산지 보고서, 와인 지역 정보, 프랑스 와인 상세 정보, 세계 와인 지도 요청 시 반드시 이 스킬을 사용할 것. 재실행, 보완, 특정 지역 추가 요청 시에도 사용.
---

# 와인 생산지 조사 보고서 오케스트레이터

**실행 모드:** 하이브리드 — 리서치 단계: 서브 에이전트 병렬, 합성 단계: 단일 에이전트

## Phase 0: 컨텍스트 확인

실행 시작 전 기존 작업물 존재 여부를 확인한다:

```
_workspace/ 존재 여부 확인:
- france-wine-research.md + world-wine-research.md 모두 존재 → 부분 재실행 가능
- 하나라도 없음 → 전체 실행
- wine-production-report.md 이미 존재 + 사용자가 "보완/추가" 요청 → 해당 에이전트만 재실행
```

사용자가 "프랑스 부분만 보완해줘"처럼 부분 요청 시:
- 해당 리서처만 재실행하여 `_workspace/`를 갱신
- 보고서 작성자를 재호출하여 최종 파일 재합성

## Phase 1: 병렬 리서치 (서브 에이전트 팬아웃)

`_workspace/` 디렉토리를 생성한 후, 두 리서처를 **동시에** 실행한다.

### 실행 지침

두 에이전트를 단일 메시지의 병렬 Agent 호출로 실행한다:

**에이전트 1 — wine-researcher-france:**
프로젝트 루트에서 `mkdir -p _workspace`를 실행한 뒤,
`.claude/agents/wine-researcher-france.md`를 읽고 지침에 따라
프랑스 전 와인 산지(보르도, 부르고뉴, 루아르, 샹파뉴, 알자스, 론, 프로방스, 랑그독 + 기타)를
상세하게 조사하여 `_workspace/france-wine-research.md`에 저장한다.

**에이전트 2 — wine-researcher-world:**
`.claude/agents/wine-researcher-world.md`를 읽고 지침에 따라
이탈리아, 스페인, 독일, 포르투갈, 미국, 호주, 아르헨티나, 칠레, 뉴질랜드, 남아공 및 기타 신흥 산지를
조사하여 `_workspace/world-wine-research.md`에 저장한다.

### 에러 핸들링

- 어느 한 에이전트가 파일 생성에 실패하면, 해당 에이전트만 단독 재실행 (1회 재시도)
- 2회 실패 시 빈 파일로 진행하고 보고서에 "해당 섹션 조사 불완전" 명시

## Phase 2: 보고서 합성 (단일 에이전트)

두 리서치 파일이 모두 생성된 후 wine-report-writer 에이전트를 실행한다.

**에이전트 — wine-report-writer:**
`.claude/agents/wine-report-writer.md`를 읽고,
`_workspace/france-wine-research.md`와 `_workspace/world-wine-research.md` 두 파일을 읽어
프로젝트 루트에 `wine-production-report.md`로 통합 보고서를 작성한다.

보고서 구조:
1. 개요 (전세계 와인 생산 현황)
2. 유럽 산지 (프랑스 가장 상세)
3. 신세계 산지
4. 품종 가이드
5. 등급 체계 비교표
6. 부록 (용어 설명)

## Phase 3: 검증 및 완료 보고

최종 보고서 파일 존재 확인 후 사용자에게 보고:
- 파일 위치: `wine-production-report.md`
- 총 단어 수 (wc -w로 측정)
- 포함된 주요 섹션 목록
- 부족하거나 보완이 필요한 섹션 있으면 명시

## 테스트 시나리오

**정상 흐름:**
1. `_workspace/` 없음 → france + world 병렬 실행 → 두 파일 생성 → 합성 → 최종 보고서

**에러 흐름:**
1. france 에이전트 파일 생성 실패 → 재시도 1회 → 성공 → 합성 진행
2. world 에이전트 파일 생성 실패 → 재시도 1회 → 실패 → france 결과만으로 부분 보고서 생성, 누락 명시

**부분 재실행:**
1. `wine-production-report.md` 존재 + "프랑스 보완 요청" → france 에이전트만 재실행 → 합성 에이전트 재실행
