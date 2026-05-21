# WineMine 이메일 발송 스크립트 가이드

## 사전 요건

`.env.local`에 아래 값들이 있어야 합니다:

```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=re_...
RESEND_TEMPLATE_ID_REFERRAL=...   # 추천 이메일 템플릿 ID
RESEND_TEMPLATE_ID_SURVEY=...     # 설문 이메일 템플릿 ID
```

---

## 템플릿 ID 발급 방법

1. [resend.com](https://resend.com) → **Templates** → **Create Template**
2. 이름 지정 (예: `referral`, `survey`)
3. `src/emails/referral.html` 또는 `src/emails/survey.html` 내용 붙여넣기
4. **From**, **Reply-To**, **Subject**, **Preview** 설정 (아래 표 참고)
5. Save → 템플릿 상세 페이지 URL에서 ID 복사 → `.env.local`에 추가

### 템플릿 설정값

| | 추천 이메일 | 설문 이메일 |
|--|--|--|
| From | `WineMine <wine@winemine.site>` | `WineMine <wine@winemine.site>` |
| Reply-To | `wine@winemine.site` | `wine@winemine.site` |
| Subject | `함께 와인을 좋아하는 친구가 있으신가요?` | `WineMine 출시 전, 당신의 의견을 듣고 싶어요` |
| Preview | `와인 친구들에게 공유하면, 6개월 무료 구독 쿠폰을 드립니다!` | `짧은 설문 한 잔 — 보내주신 의견이 WineMine에 반영됩니다!` |

### 템플릿 변수

| 스크립트 | 변수명 | 설명 |
|--|--|--|
| 추천 | `{{REFERRAL_URL}}` | 개인별 추천 링크 (자동 치환) |
| 추천 | `{{COUPON_CODE}}` | 추천 코드 = 쿠폰 코드 (자동 치환) |
| 설문 | `{{SURVEY_URL}}` | 구글폼 링크 (고정값) |

---

## send-referral-emails.ts

waitlist 가입자 전원에게 **개인별 추천 링크**가 담긴 이메일을 발송합니다.

```bash
# 1단계 — dry run (발송 없이 대상 목록 확인)
npx tsx --env-file .env.local scripts/send-referral-emails.ts

# 2단계 — 테스트 (내 이메일 1통만 발송)
npx tsx --env-file .env.local scripts/send-referral-emails.ts --test 내이메일@gmail.com

# 3단계 — 실제 전체 발송
npx tsx --env-file .env.local scripts/send-referral-emails.ts --send
```

---

## send-survey-emails.ts

waitlist 가입자 전원에게 **동일한 설문 링크**가 담긴 이메일을 발송합니다.

```bash
# 1단계 — dry run
npx tsx --env-file .env.local scripts/send-survey-emails.ts

# 2단계 — 테스트
npx tsx --env-file .env.local scripts/send-survey-emails.ts --test 내이메일@gmail.com

# 3단계 — 실제 전체 발송
npx tsx --env-file .env.local scripts/send-survey-emails.ts --send
```

---

## 발신/수신 이메일 정보

| 역할 | 주소 |
|------|------|
| 발신 (From) | `WineMine <wine@winemine.site>` |
| 답장 수신 (Reply-To) | `wine@winemine.site` → Gmail 포워딩 (ImprovMX) |
| Resend 도메인 | `winemine.site` (Tokyo, Verified) |

---

## 뉴스레터 발송 (동일 내용, 코드 불필요)

출시 알림 등 모든 수신자가 동일한 내용을 받는 경우:
→ **Resend 대시보드 Broadcasts** 사용 (스크립트 불필요)
