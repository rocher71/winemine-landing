# winemine — Product Plan

> **한 줄 소개.** 와인 라벨을 촬영하면 AI가 와인을 인식하고, 마신 와인을 세계 지도 위에 지역별로 시각화해 기록하는 모바일 서비스.
>
> **현재 단계.** Phase 1 — 랜딩 페이지 + Waiting List 운영 중. iOS/Android 앱은 Phase 2에서 별도 레포로 개발.

---

## 1. 비전 (Vision)

> **"Your wine journey, mapped."**
>
> 마신 모든 와인이 지도 위에 자국을 남긴다. 와인이라는 취미를 **수집하고, 회고하고, 공유**하는 가장 아름다운 방식이 된다.

winemine은 와인을 "마시는 행위"에서 끝나지 않게 한다. 한 병의 와인은 산지의 기억이고, 그 기억이 모이면 한 사람의 **취향 지도**가 된다. 우리는 그 지도를 그려주는 도구를 만든다.

---

## 2. 문제 (Problem)

### 2-1. 와인 입문자
- **"마셔봤는데, 뭐였는지 기억이 안 난다."** — 라벨이 외국어이고, 산지·등급 체계가 복잡해 진입장벽이 높다.
- **"다음에 뭘 마셔야 할지 모르겠다."** — 마트의 수백 병 중 내 취향에 맞는 한 병을 고르기 어렵다.
- **"기록 앱은 너무 전문가용이다."** — Vivino/CellarTracker는 평점·테이스팅 노트 위주로, 입문자에겐 부담스럽다.

### 2-2. 와인 애호가
- **"내가 마신 와인이 시각적으로 한눈에 안 보인다."** — 리스트는 있어도 "내 와인 여정"이라는 정체성을 느끼기 어렵다.
- **"SNS에 올릴 만한 자료가 없다."** — 라벨 사진은 단조롭다. Spotify Wrapped 같은 회고 콘텐츠가 와인에는 없다.
- **"부르고뉴 마을·끌리마 단위까지 기록할 수 있는 도구가 없다."** — 일반 와인 앱은 국가/지역까지만 분류한다.

---

## 3. 타겟 사용자 (Target)

### Primary
1. **와인을 좋아하기 시작한 2030 (입문~중급)** — 1년에 30~80병, 와인 바·홈와인 경험, 인스타그램 활발
2. **취향 큐레이션을 좋아하는 컬렉터** — Spotify Wrapped, Letterboxd, Goodreads류에 익숙한 사용자

### Secondary
3. **와인 덕후 (전문가)** — WSET 자격증, 소믈리에 준비, 부르고뉴 끌리마까지 구분하는 사용자
4. **선물용으로 와인을 자주 구매하는 사람** — "그때 그 와인 뭐였지?"를 자주 검색

### Persona
- **이름.** 김유진, 29세, 서울 거주, 마케터
- **습관.** 주 1~2회 와인 바·홈와인, 좋아하는 와인은 인스타 스토리에 라벨 사진 업로드
- **불편.** 사진은 쌓이는데 어떤 와인이었는지 기억 안 남. 라벨이 프랑스어라 검색도 어려움
- **기대.** 사진만 찍으면 자동으로 정리되고, 연말에 Spotify Wrapped처럼 회고를 받고 싶음

---

## 4. 핵심 가치 제안 (Value Proposition)

| 가치 | 사용자 경험 |
|------|------------|
| **Zero-effort logging** | 라벨 사진 1장 = 와인 1개 기록. 수동 입력 없음 |
| **Map as memory** | 리스트가 아닌 지도. "어디서 온 와인이었는지" 가 직관적으로 보임 |
| **Drill-down by region** | 국가 → 지역 → 마을 → 단일 와인까지 위계적 탐색 (부르고뉴 끌리마 수준 지원) |
| **Shareable Recap** | 인스타 스토리에 그대로 올릴 수 있는 연말/월간/주간 회고 카드 자동 생성 |
| **Beginner-friendly + Expert-deep** | 한 앱에서 입문자 추천부터 전문가 위계 분류까지 모두 지원 |

---

## 5. 핵심 기능 (Core Features)

### 5-1. AI 라벨 인식 — *Scan*
- 와인 라벨을 촬영하면 AI가 자동으로 와이너리, 빈티지, 산지, 품종, 등급 추출
- 인식 실패 시 수동 검색·입력 fallback
- **MVP 우선순위:** ★★★★★

### 5-2. 세계 지도 시각화 — *Map*
- 마신 와인의 산지를 세계 지도 위에 표시
- 국가 → 지역(부르고뉴, 보르도 등) → 마을(꼬뜨드뉘, 꼬뜨드본 등) → 끌리마(부르고뉴) 위계 드릴다운
- 지역별 마신 병 수에 따른 색 농도 그라데이션
- **MVP 우선순위:** ★★★★★

### 5-3. 입문 와인 추천 — *Discover*
- 사용자가 마신 산지를 기반으로 비슷한 결의 입문 와인 추천 (1~6만원대)
- 지도 위 골드 핀으로 시각화
- **MVP 우선순위:** ★★★★☆

### 5-4. 테이스팅 노트 — *Capture*
- WSET 양식을 디지털화한 단계별 입력 (Aroma → Palate → Finish → Faults → Evolution → Rating)
- 색·당도·산도·바디·알코올·타닌을 시각적 슬라이더로 입력
- 블라인드 모드: 라벨 가리고 입력 후 정답 공개
- **MVP 우선순위:** ★★★☆☆

### 5-5. Recap 공유 — *Share*
- Spotify Wrapped / Flighty Year-in-Review 스타일의 연·월·주간 회고 카드 자동 생성
- 인스타그램 스토리 비율(9:16)에 맞춰 바로 공유 가능
- 마신 병 수·국가 수·기간·최애 산지·최애 와인 등 통계 카드
- **MVP 우선순위:** ★★★★☆

### 5-6. 부르고뉴 전문 모드 — *Pro*
- 꼬뜨 → 마을 → 등급(Grand Cru / Premier Cru / Village) → 단일 끌리마까지 위계 분류
- 색별 필터 (Red / White / Rosé)
- 와인 덕후·소믈리에 준비자 대상
- **MVP 우선순위:** ★★★☆☆ (Phase 2)

---

## 6. 사용자 여정 (User Journey)

### 6-1. 첫 사용 (Onboarding)
```
1. 앱 다운로드 → 회원가입 (Apple/Google 소셜)
2. "지난주에 마신 와인 있나요?" → 라벨 사진 촬영
3. AI 인식 결과 확인 → 지도에 첫 핀이 꽂힘
4. "축하해요. 첫 와인이 기록됐어요." → 메인 지도 진입
```

### 6-2. 일상 사용 (Daily Loop)
```
와인 바에서 와인 주문
  → 라벨 촬영
  → 자동 기록 (15초 이내 완료)
  → (선택) 테이스팅 노트 추가
  → 지도가 한 칸 더 물든다
```

### 6-3. 회고 & 공유 (Retention Loop)
```
매주 일요일 / 매월 1일 / 매년 12월 31일
  → "이번 주/달/해의 winemine Recap이 준비됐어요" 푸시
  → Recap 카드 확인 → 인스타 스토리 공유
  → 친구가 보고 "이거 뭐야?" → 신규 다운로드
```

---

## 7. 차별화 (Differentiators)

| 항목 | Vivino | CellarTracker | Delectable | **winemine** |
|------|--------|---------------|------------|--------------|
| AI 라벨 인식 | ✅ | ❌ | ✅ | ✅ |
| 평점/리뷰 중심 | ✅ | ✅ | ✅ | ❌ (취향 중심) |
| **세계 지도 시각화** | ❌ | ❌ | ❌ | ✅ |
| **드릴다운 (마을·끌리마)** | ❌ | 일부 | ❌ | ✅ |
| **Recap / 회고 공유 카드** | ❌ | ❌ | ❌ | ✅ |
| **입문 와인 큐레이션** | 평점 기반 | ❌ | ❌ | 산지 기반 |
| 프리미엄 디자인 (다크 톤) | ❌ | ❌ | 일부 | ✅ |
| 한국어 / 한국 시장 fit | 일부 | ❌ | ❌ | ✅ |

**핵심 차별점.** 평점·리뷰 앱이 아니라 **"내 와인 여정의 시각적 기록 + 회고 공유"** 앱.
경쟁자는 Vivino가 아니라 **Spotify Wrapped, Letterboxd, Flighty**다.

---

## 8. 디자인 방향성

> **상세는 `design.md` 참조.**

- **무드.** "어두운 밤, 와인 한 잔. 프리미엄 와인 라벨의 무게감"
- **색상.** Deepest Dark `#05020A` 배경 + Wine Red `#8B1A2A` + Gold `#C9A84C` + Cream `#F5F0E8`
- **타이포.** Playfair Display (serif, 제목) + Inter / Noto Sans KR (본문)
- **시각 자산.** 세계 지도 무한 슬라이드, 글래스 카드 적층, 골드 글로우
- **금기.** 라이트 모드, 파스텔 컬러, 이모지, 일러스트, 네온 그라데이션

---

## 9. 기술 스택 (Tech Stack)

### Phase 1 — 랜딩 페이지 (현재)
| 레이어 | 선택 |
|--------|------|
| Framework | Next.js 15 App Router |
| Language | TypeScript 5.7 (strict) |
| Styling | Tailwind CSS v4 |
| Map | react-simple-maps + topojson-client |
| Animation | Framer Motion v12 |
| Form | react-hook-form + zod |
| Database | Supabase PostgreSQL (waitlist 테이블) |
| Deploy | Vercel |
| Analytics | Google Analytics (G-7V8ZDT0TYX) |
| Notification | Slack Webhook (신규 waitlist 알림) |

### Phase 2 — 모바일 앱 (예정)
| 레이어 | 후보 |
|--------|------|
| Framework | React Native (Expo) 또는 Native (Swift / Kotlin) |
| AI 라벨 인식 | OpenAI Vision API 또는 Google Vision + 와이너리 DB 매핑 |
| Backend | Supabase (Auth, Postgres, Storage) + Edge Functions |
| 와인 DB | 자체 큐레이션 + Wine-Searcher / Vivino API 보조 |
| Image | Supabase Storage + Cloudflare Images |
| Push | Expo Push / APNs / FCM |
| Recap 생성 | Server-side 이미지 합성 (satori 등) |

---

## 10. 단계별 로드맵 (Roadmap)

### Phase 1 — Pre-Launch (현재, ~2026 Q2)
- ✅ 랜딩 페이지 구축 (Hero / Discovery / Burgundy / Vineyard / Features / Recap Preview / How / CTA)
- ✅ Waiting List 시스템 (Supabase + Slack 알림)
- ✅ i18n (ko/en) 자동 분기
- ⬜ 100명 → 1,000명 waitlist 확보
- ⬜ 인스타그램·트위터 운영, 한국 와인 커뮤니티 시드 마케팅

### Phase 2 — MVP App (2026 Q3~Q4)
- ⬜ iOS 앱 출시 (TestFlight 베타 → 정식)
- ⬜ AI 라벨 인식 (한국 유통 와인 5,000종 우선)
- ⬜ 지도 시각화 (국가·지역까지)
- ⬜ Recap 카드 (월간/연간)
- ⬜ 입문 와인 추천 (큐레이터 mock → AI 기반 전환)

### Phase 3 — Growth (2027 H1)
- ⬜ Android 출시
- ⬜ 마을·끌리마 드릴다운 (부르고뉴 전체, 보르도 그랑크뤼)
- ⬜ 테이스팅 노트 (WSET 디지털화)
- ⬜ 친구 팔로우 / 공유 피드
- ⬜ 한국 와인 수입사 파트너십 (PB 와인 큐레이션)

### Phase 4 — Expand (2027 H2~)
- ⬜ 일본·동남아 진출 (영어 + 일본어)
- ⬜ 와인 구매 연동 (제휴 매장)
- ⬜ 유료 구독 (Pro 모드 — 무제한 기록, 고급 통계, 전문가 노트)

---

## 11. 비즈니스 모델 (Business Model)

### 단기 (Phase 2~3)
- **무료** — 모든 핵심 기능 무료. 사용자 베이스 확보 우선
- **수익 모델 없음** — 광고 X, 데이터 판매 X

### 중기 (Phase 3~4)
- **구독 (Pro)** — 월 4,900원 / 연 49,000원
  - 무제한 기록 (무료는 월 50병 제한)
  - 고급 통계 (취향 분석, 산지별 추천 정확도 ↑)
  - Recap 커스터마이즈 (테마, 폰트)
  - 전문가 노트·블라인드 모드
- **파트너십 커미션** — 와인 구매 연동 수수료 (3~5%)

### 장기 (Phase 4~)
- **B2B** — 와인 수입사·셀러 대상 데이터 인사이트 (익명화된 취향 트렌드)
- **오프라인** — winemine 큐레이션 와인 박스 (월간 구독)

---

## 12. 성공 지표 (KPI / North Star Metric)

### North Star
**WAU 사용자당 월 평균 기록 와인 수** — 앱이 일상에 자리잡았는지 가장 잘 보여주는 지표

### Phase 1 KPI
| 지표 | 목표 |
|------|------|
| Waitlist 가입자 | 1,000명 (출시 직전까지) |
| 랜딩 페이지 전환율 (방문 → 가입) | 8%+ |
| Bounce Rate | < 50% |
| 인스타 팔로워 | 500명 |

### Phase 2 KPI (출시 후 6개월)
| 지표 | 목표 |
|------|------|
| MAU | 10,000 |
| WAU/MAU (Stickiness) | 25%+ |
| 사용자당 월 기록 와인 | 4병+ |
| Recap 공유율 (생성 → SNS 공유) | 30%+ |
| 30일 리텐션 | 35%+ |

---

## 13. 리스크 & 가설 검증

### 핵심 가설
1. **"한국에서 와인 기록 앱 수요가 충분히 있다"** — 검증: waitlist 가입 속도
2. **"라벨 사진 1장 = 자동 기록이면 사용자가 매번 기록한다"** — 검증: Phase 2 일간 기록 빈도
3. **"Recap 공유가 자연 바이럴을 만든다"** — 검증: Recap 공유율, 공유 → 신규 가입 전환

### 주요 리스크
| 리스크 | 대응 |
|--------|------|
| AI 라벨 인식 정확도 < 80% | Phase 2 출시 전 한국 유통 와인 5,000종 우선 학습. 인식 실패 시 수동 검색 fallback |
| Vivino가 동일 기능 출시 | 디자인·한국 시장 fit·Recap 공유 카드로 차별화. 빠른 PMF 확보 우선 |
| 와인 시장 자체 성장 둔화 | 위스키·전통주로 확장 가능 (Phase 4) |
| 사용자가 "회고 카드"의 가치를 못 느낌 | Phase 1 랜딩에서 Recap Preview 섹션으로 사전 검증 |

---

## 14. 운영 원칙

- **카피 톤.** 친근하지만 가볍지 않게. 존댓말 기본. 이모지·반말 금지
- **로고 표기.** 항상 소문자 `winemine`. 분리/대문자/공백 금지
- **이미지.** 일러스트 X. 사진 + SVG 맵으로 한정
- **개인정보.** 이메일/전화번호만 수집. 마케팅 동의는 명시적 opt-in
- **보안.** Supabase Service Role Key는 서버에서만. 클라이언트 번들 금지

---

## 15. 참고 문서

| 문서 | 역할 |
|------|------|
| `CLAUDE.md` | Claude Code 개발 컨텍스트 (기술 가이드) |
| `design.md` | 디자인 시스템 (색상·타이포·무드) |
| `WINEMINE_LANDING_SPEC.md` | 랜딩 페이지 상세 UI/UX 스펙 |
| `_workspace/wine-discovery-section-spec.md` | Wine Discovery 섹션 인수인계 문서 |
| `_workspace/burgundy-section-spec.md` | Burgundy 섹션 인수인계 문서 |
| `_workspace/burgundy-classification-research.md` | 부르고뉴 분류 체계 리서치 |
| `_workspace/world-wine-research.md` | 세계 와인 산지 리서치 |
| `_workspace/france-wine-research.md` | 프랑스 와인 산지 리서치 |
| `wine-production-report.md` | 전세계 와인 생산지 종합 보고서 |
