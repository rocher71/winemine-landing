# Resend 운영 가이드

WineMine은 Resend를 통해 waitlist 사전 신청자에게 트랜잭셔널 메일(쿠폰 활성화)과 마케팅 메일(설문·추천)을 발송한다. 이 문서는 다음 세션이 빠르게 컨텍스트를 잡고 안전하게 메일을 발송할 수 있도록 정리한 운영 매뉴얼이다.

---

## 0. 가장 먼저 — 안전 규칙

**실제 사용자 주소로 메일이 나가는 명령은 사용자가 "보내달라"고 명시했더라도 반드시 한 번 더 확인 질문 후 실행한다.**

- 적용: `--send`, `--to <실사용자이메일>`, `resend.broadcasts.send()`, `resend.batch.send()`, `resend.emails.send()` 직접 호출
- 예외 (확인 없이 즉시 OK): `--test 본인메일@gmail.com` 같이 발신자 본인에게만 가는 테스트, 인자 없는 dry-run
- 확인 시 명시해야 할 항목: **From 주소, 수신자 수/대표 주소, subject, 템플릿 ID**

근거 메모리: `~/.claude/projects/-Users-yejinkim-dev-winemine/memory/feedback-resend-confirm-before-send.md`

---

## 1. 플랜 & 한도 (가장 자주 부딪치는 함정)

Resend는 **트랜잭셔널 라인**과 **마케팅 라인**이 별도 메터링이다. 단위 자체가 다르므로 헷갈리지 말 것.

| 라인 | 무료 한도 | 단위 | 사용 API |
|---|---|---|---|
| **Transactional** | **3,000/월, 100/일** | 발송 건수 | `resend.emails.send()`, `resend.batch.send()` |
| **Marketing / Broadcasts** | **연락처 1,000명** | audience contact 수 | `resend.broadcasts.create()` + `send()` |

### 실전 의미

- `scripts/send-survey-emails.ts --send`로 60명 한 번에 보내면 **transactional 라인의 일일 100건 한도**가 깎인다 (60건 차감)
- 같은 날 추가로 `--to <email>`로 40건 더 보내면 100% 도달 → 그날 더 보낼 수 없음
- **카운터 리셋:** 자정 UTC = 한국 시간 오전 9시
- 마케팅 라인의 1,000 contact 한도는 별도. 현재 waitlist 60명 수준이라 여유 충분
- **공식 문서가 "broadcast는 100/일에 안 걸린다"고 명시적으로 적은 문장은 없음.** "Marketing은 contact 단위" 분리 모델에서 추론. 실전 검증이 필요하면 본인만 들어간 1명 audience에 broadcast 한 통 발사해보면 5분 안에 확인 가능.

### 100/일 한도 회피 옵션

1. **자정 UTC 대기** (한국 9시) — 가장 단순
2. **Resend Pro 플랜 업그레이드** — 월 $20, 50,000/월, 일일 한도 제거
3. **Broadcast로 전환** — 위 검증 거친 뒤 사용

---

## 2. 발신 도메인 & 주소

| 항목 | 값 |
|---|---|
| Verified 도메인 | `winemine.site` (Tokyo region, Resend 대시보드 Verified) |
| 표준 From | `WineMine <wine@winemine.site>` |
| Reply-To | `wine@winemine.site` → Gmail 포워딩 (ImprovMX 경유) |

**주의:** From 주소를 `hello@winemine.site` 같은 미설정 alias로 바꾸면 Resend가 reject하거나 deliverability가 깎인다. 코드에서 From은 상수로 고정해 두는 게 안전.

---

## 3. 환경변수 (`.env.local`)

```
RESEND_API_KEY=re_...
RESEND_TEMPLATE_ID_REFERRAL=...       # 추천 메일 (per-user 변수)
RESEND_TEMPLATE_ID_SURVEY=...         # 설문 메일 (고정 URL)
RESEND_TEMPLATE_ID_COUPON_ACTIVATED=... # 추천인 첫 가입 발생 시 자동 발송
```

`.env.local`에 들어있는 실제 ID 값은 보안상 이 문서에 적지 않는다. `.env.local` 직접 확인.

---

## 4. 발송 경로 매트릭스

### (a) 단일 트랜잭셔널 — `resend.emails.send()`

`src/lib/resend.ts:sendCouponActivatedEmail()` 참고. 추천인의 첫 가입자가 들어올 때 자동 호출.

**현대 SDK 형식 (권장):**
```ts
await resend.emails.send({
  from: 'WineMine <wine@winemine.site>',
  replyTo: 'wine@winemine.site',
  to: targetEmail,
  subject: '...',
  template: { id: templateId, variables: { KEY: value } },
});
```

**레거시 형식 (기존 `sendCouponActivatedEmail`에 남아있음):**
```ts
// @ts-expect-error
template_id: templateId,
variables: { ... },
```
→ 런타임은 동작하지만 새 코드에서는 `template: { id, variables }` 쓸 것. SDK 6.x 타입에 정식 등재됨.

**중요:** `template`을 쓸 때는 `reply_to` (snake_case) 가 아닌 **`replyTo` (camelCase)** 만 받음. 타입 에러 발생 시 확인 포인트.

### (b) 배치 트랜잭셔널 — `resend.batch.send()`

`scripts/send-survey-emails.ts`, `scripts/send-referral-emails.ts` 참고. 100건씩 묶어 배치 한 번에 발송, 배치 간 1초 sleep.

```ts
const emails = chunk.map(c => ({
  from, replyTo, to: c.contact, subject,
  template: { id: TEMPLATE_ID, variables: { SURVEY_URL } },
}));
const { error } = await resend.batch.send(emails);
```

→ 마스 발송 + 템플릿을 동시에 만족하는 **현재 표준 경로**.

### (c) Broadcast — `resend.broadcasts.create()` + `send()`

**중요한 제약 (자주 오해):**
- Broadcast API는 **`template_id`를 받지 않는다.** `html` / `text` / `react` 만 받음
- 즉 대시보드에 만든 템플릿을 broadcast로 직접 보낼 수 없다
- 마스 발송 + 템플릿을 동시에 원하면 → **broadcast가 아닌 batch.send 경로** 선택

**Broadcast가 어울리는 케이스:**
- 100/일 transactional 한도를 초과해야 할 때 (위 한도 섹션 참고)
- 대시보드 UI에서 직접 발송 (코드 불필요)
- audience 관리(가입/탈퇴, 세그먼트) 기능을 활용할 때

**필요한 사전 작업:**
1. Audience 생성 (`resend.audiences.create()` 또는 대시보드)
2. Contacts 추가 (`resend.contacts.create({ email, audienceId })`)
3. Broadcast 생성 — HTML 직접 박아넣기
4. `resend.broadcasts.send(broadcastId)`

`src/lib/resend.ts:addContact()`가 `contacts.create({ email })`로 호출되어 있는데 **audienceId가 빠져 있다.** 현재 운영에서는 silent fail로 무시되고 있음. broadcast를 본격적으로 쓰려면 audience 설정 + audienceId env 추가 필요.

---

## 5. 로컬 HTML vs 대시보드 템플릿 (Source of Truth)

`src/emails/*.html` 파일은 **Resend 대시보드 템플릿의 as-built 백업본**이다. 발송 시 실제 사용되는 본문은:

- **`batch.send` + `template: { id }`** 경로 → **Resend 대시보드 템플릿이 진실의 원천**
- **Broadcast 경로** → 대시보드에 직접 박은 HTML이 진실의 원천

**HTML 파일 수정 시 주의:**
- 로컬 HTML만 수정해도 발송 내용은 안 바뀜
- 대시보드 템플릿을 수동으로 업데이트하고 **Publish** 까지 눌러야 반영됨 (Draft 상태로 두면 발송 시 에러)
- 변수 placeholder 패턴: `{{VARIABLE_NAME}}` (Handlebars 스타일)
- 수신 거부 링크: `{{{RESEND_UNSUBSCRIBE_URL}}}` ← **3중 중괄호** (HTML escape 방지). Resend가 자동 치환.

### 현재 템플릿 → 변수 → 로컬 백업 매핑

| 템플릿 | 변수 | 로컬 백업 |
|---|---|---|
| RESEND_TEMPLATE_ID_REFERRAL | `{{REFERRAL_URL}}`, `{{COUPON_CODE}}` | `src/emails/referral.html` |
| RESEND_TEMPLATE_ID_SURVEY | `{{SURVEY_URL}}` | `src/emails/feature-survey.html` |
| RESEND_TEMPLATE_ID_COUPON_ACTIVATED | `{{COUPON_CODE}}` | `src/emails/coupon-activated.html` |

---

## 6. 스크립트 사용법 (`scripts/`)

### `scripts/send-survey-emails.ts`

```bash
# 전체 대상 미리보기 (안전, 발송 없음)
npx tsx --env-file .env.local scripts/send-survey-emails.ts

# 본인에게 [테스트] 접두 붙여 1통 발송 — 확인 질문 면제
npx tsx --env-file .env.local scripts/send-survey-emails.ts --test 본인메일@gmail.com

# 임의 1명에게 실제 발송 (접두 없음) — 확인 질문 필요
npx tsx --env-file .env.local scripts/send-survey-emails.ts --to user@example.com

# 전체 실제 발송 — 확인 질문 필요
npx tsx --env-file .env.local scripts/send-survey-emails.ts --send
```

### `scripts/send-referral-emails.ts`

- waitlist 전원에게 **개인별 추천 코드**가 박힌 메일
- `referral_code`가 없는 사용자에게는 코드를 새로 생성 후 DB 업데이트한 뒤 발송
- `--test`, `--send` 플래그 지원

### TypeScript 타입 에러 안내

`scripts/`는 `tsconfig.exclude`에 포함되어 있어 `npm run build`에서 제외된다 (커밋 `e99d189`). 실행은 `tsx`가 처리. `ws` 라이브러리 타입 충돌이 한 줄 뜨는데 런타임은 정상.

---

## 7. Suppression List

Resend가 자동 관리하는 **발송 금지 명단**. 한 번 들어가면 그 주소로 어떤 메일도 안 나간다.

**들어가는 경로 4가지:**

| 사유 | 트리거 |
|---|---|
| **Hard bounce** | 존재하지 않는 주소·도메인 |
| **Spam complaint** | 수신자가 "스팸 신고" 클릭 |
| **Unsubscribe** | 메일의 수신거부 링크 클릭 |
| **Manual** | 대시보드에서 직접 추가 |

**에러 메시지 패턴:**
> "The email was not sent because the recipient is on the suppression list."

**확인/해제 위치:** Resend 대시보드 → **Suppressions** 탭

**해제 가이드:**
- **Unsubscribe로 들어간 건 절대 임의 해제 금지** (정보통신망법 위반 가능)
- **Hard bounce 해제는 신중** — 다시 bounce 떨어지면 도메인 평판이 깎임
- **Spam complaint 해제도 위험** — 재발 시 발신 제한
- 가장 안전한 자세: 학교 메일(`.ac.kr`)이나 회사 메일이 hard bounce 됐다면 그 주소는 폐기로 간주하고 사용자에게 다른 연락 수단 요청

---

## 8. 발송 전 프리플라이트 체크리스트

마스 발송(`--send`, broadcast) 직전 반드시 확인:

1. **대상 명단 필터**
   ```sql
   SELECT contact FROM waitlist
   WHERE contact_type = 'email'
     -- 광고성 메일이면: AND marketing_agree = true
   ```
   설문은 "광고"가 아닌 "제품 개발 의견 요청"으로 해석 가능하지만, 보수적으로는 `marketing_agree=true`만 추리는 게 안전.

2. **대시보드 템플릿 상태** — Published (Draft면 발송 실패)

3. **테스트 발송 1통 먼저** — 본인 메일로 `--test` → 인박스 / 스팸함 / 다크모드 / CTA 클릭 / 수신거부 링크 치환 확인

4. **From 주소 더블체크** — 코드 상수가 `wine@winemine.site` 인지

5. **링크 URL 변수** — `{{SURVEY_URL}}`, `{{REFERRAL_URL}}` 등이 의도한 값으로 치환되는지 (테스트 메일에서 클릭으로 확인)

6. **일일 한도 여유분** — 오늘 이미 몇 건 발송했는지 Resend 대시보드 Emails 탭에서 확인. 100/일 라인에서 발송할 거면 잔여분 계산.

7. **DNS 인증** — SPF / DKIM / DMARC 모두 PASS인지 본인 Gmail로 받아 "원본 보기"에서 확인 (도메인 신뢰도 영향).

---

## 9. 자주 발생하는 에러 & 해결

| 에러 | 원인 | 해결 |
|---|---|---|
| `Daily Quota Limit` | transactional 100/일 도달 | 다음 날 9시 KST 대기 or Pro 업그레이드 or broadcast 검토 |
| `recipient is on the suppression list` | 해당 주소가 suppression 명단에 등록됨 | 대시보드 → Suppressions에서 사유 확인. 함부로 해제하지 말 것 |
| `template not found` | 템플릿 ID 오타 or Draft 상태 | env 값 재확인, 대시보드에서 Publish 클릭 |
| TS 에러: `reply_to does not exist` | `template`과 `reply_to` 함께 쓸 때 SDK 타입 충돌 | `replyTo` (camelCase)로 교체 |
| `subject already set by template` 같은 무시 가능 경고 | API 값이 템플릿 default 덮어씀 (정상 동작) | 무시 OK. 명시 subject가 우선 |
| 알림 메일 도착 순서가 뒤바뀜 (80% < 100%) | 메일은 순서 보장 안 함 + 임계점 동시 통과 시 두 알림이 거의 동시 트리거 | 정상 — 도착 순서 무시하고 카운터 수치 자체를 신뢰 |

---

## 10. 변경 이력

| 날짜 | 변경 | 사유 |
|---|---|---|
| 2026-05-21 | 초기 문서화 | 다음 세션 인수인계 — broadcast/transactional 분리, 100/일 함정, suppression list, template 형식 표준화 |

---

## 부록: 관련 파일 위치

- `src/lib/resend.ts` — Resend 클라이언트 초기화 + `sendCouponActivatedEmail()`
- `src/emails/*.html` — 로컬 백업 템플릿
- `scripts/send-survey-emails.ts` — 설문 메일 배치 발송 (template 사용)
- `scripts/send-referral-emails.ts` — 추천 메일 배치 발송 (현재는 inline HTML 사용)
- `scripts/README.md` — 스크립트 빠른 시작
- `.env.local` — API 키 + 템플릿 ID
- `~/.claude/projects/-Users-yejinkim-dev-winemine/memory/feedback-resend-confirm-before-send.md` — 발송 전 재확인 룰
