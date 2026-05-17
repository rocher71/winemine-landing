# GA·Meta Pixel — 광고 캠페인 직전 보완 핸드오버

> **이 문서의 위치.** 2026-05-17, Meta Reels/Stories 광고 캠페인(₩5,000/일 × 7일, KR 입문자 타겟) publish 직전에 발견된 **GA·Meta Pixel 측정 구멍**을 정리한 인계 문서. 광고가 "그냥 트래픽"이 아니라 **Waitlist 가입까지 잡혀야** ROI 측정·Meta 알고리즘 최적화·리타겟팅 모수 확보가 모두 동작한다.
>
> **현재 상태 기준.** 랜딩 페이지에 GA4(`G-7V8ZDT0TYX`) + Meta Pixel + Amplitude 세 트래커가 병렬로 깔려있고, 커스텀 이벤트 7종이 발화 중. 단, **Meta Pixel은 PageView만 잡고 있어 Lead/Conversion 추적이 완전히 비어있다**.
>
> **우선순위.** ① Meta Pixel `Lead` 이벤트 추가 → ② GA4 `waitlist_success` Key Event 마킹 → ③ 폼 에러 이벤트 추가 → 그 외는 광고 운영 중 보강.

---

## 0. TL;DR — 한 줄 요약

> **`waitlist-form.tsx:73` 의 success 분기에 `fbq('track', 'Lead', {...})` 한 줄 추가 + GA4 Admin에서 `waitlist_success` 를 Key Event로 마킹.** 이 둘만 해도 광고 캠페인 ROI는 보장된다. 나머지는 7일 운영 중 보강해도 늦지 않다.

---

## 1. 현재 측정 인프라 스냅샷

### 1.1 설치된 트래커 3개

| 트래커 | 파일 | 상태 |
|---|---|---|
| GA4 (`G-7V8ZDT0TYX`) | `src/app/layout.tsx:13`, `src/lib/analytics.ts` | ✓ 정상 |
| Meta Pixel | `src/app/layout.tsx:96-111` (env `NEXT_PUBLIC_META_PIXEL_ID` 있을 때만) | ⚠ PageView만 |
| Amplitude | `src/lib/amplitude.ts` + CTA/Form 호출부 | 병렬 송신 중 (광고 운영 중에는 무시 가능) |

### 1.2 발화 중인 GA 이벤트 7종

| 이벤트 | 발화 위치 | 핵심 파라미터 |
|---|---|---|
| `app_download_click` | `store-buttons.tsx:61`, `floating-cta.tsx:80` | store, location, button_id |
| `waitlist_cta_click` | `tasting-note-section.tsx:193` | location, button_id |
| `waitlist_submit` | `waitlist-form.tsx:64` | contact_type, marketing_agree |
| `waitlist_success` | `waitlist-form.tsx:73` | contact_type |
| `waitlist_modal_close` | `waitlist-modal.tsx:113` | stage, button_id |
| `waitlist_success_close` | `waitlist-success.tsx:38` | button_id |

**잘 된 부분.** `submit`과 `success`를 분리한 점, `contact_type`/`marketing_agree` 같은 세분화 파라미터, modal close 추적까지 잘 짜였음. GA 쪽 이벤트 설계는 90점.

---

## 2. 🚨 P0 — Meta Pixel `Lead` 이벤트 추가 (필수)

### 2.1 왜 치명적인가

광고 캠페인 목표가 `Get more website visitors` (Traffic) 이지만 **진짜 KPI는 Waitlist 가입**. Meta Pixel이 가입 이벤트(`Lead`)를 못 잡으면:

1. Meta 알고리즘이 **"클릭 잘 누르는 사람"** 만 학습 → CAC 2-3배 ↑
2. Conversions 캠페인으로 갈아탈 수 없음 (50 conversions/7days 학습 통과 불가)
3. Lead 모수 = 0 → 리타겟팅 광고 못 만듦
4. Meta Ads Manager의 ROAS 리포트가 무용지물

### 2.2 추가 위치 — `waitlist-form.tsx:73` 근처

GA `waitlist_success` 발화 직후, 동일한 분기 안에 fbq 호출 추가:

```typescript
// src/components/.../waitlist-form.tsx

// 기존 GA 이벤트
trackEvent('waitlist_success', { contact_type });

// 추가할 Meta Pixel Lead 이벤트
if (typeof window !== 'undefined' && (window as any).fbq) {
  (window as any).fbq('track', 'Lead', {
    content_name: 'waitlist',
    content_category: contact_type, // 'email' | 'phone'
  });
}
```

> **이벤트명은 반드시 `Lead`** (Meta standard event). `Subscribe`·`CompleteRegistration` 도 가능하나, Waitlist 단계에서는 `Lead` 가 가장 표준. 나중에 베타 초대장 발송→실제 가입 단계가 생기면 그때 `CompleteRegistration` 으로 분리.

### 2.3 TypeScript 타입 추가 (선택)

`as any` 가 거슬리면 `src/types/global.d.ts` (또는 layout.tsx 상단)에:

```typescript
declare global {
  interface Window {
    fbq?: (
      type: 'track' | 'trackCustom',
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}
export {};
```

### 2.4 발화 검증 (배포 후 5분 작업)

1. **Meta Events Manager** → Pixel `winemine (2535368716913166)` → Test Events 탭
2. Test Browser Events에 LP URL 입력 → 새 탭에서 Waitlist 가입 1회
3. Test Events 패널에 `PageView` + `Lead` 두 줄 떠야 정상
4. 안 뜨면: 브라우저 콘솔에서 `window.fbq` 가 function 인지 확인

---

## 3. 🔥 P0 — GA4 Key Event 마킹 (필수)

### 3.1 왜 필요한가

`waitlist_success` 이벤트가 발화되어도, **GA4 Admin에서 Key Event(전환)로 마킹 안 하면** 그냥 평범한 이벤트로만 잡힘:
- Acquisition 리포트의 "Conversions" 컬럼이 0
- 광고 캠페인별 ROAS 비교 불가
- Google Ads 연동 시 conversion import 불가

### 3.2 설정 (3분)

1. GA4 → **Admin** → **Events**
2. `waitlist_success` 행 우측 토글 **"Mark as key event"** ON
3. 동일하게 `app_download_click` 도 ON (앱 출시 후 측정용)
4. 처음 발화 후 **24-48시간** 지나야 Acquisition 리포트에 반영
5. → **광고 publish 24시간 전에 미리 켜둘 것**

### 3.3 한 번 더 확인할 것

- GA4 → Admin → Data Streams → Web → **Enhanced measurement** 다 ON (Page views, Scrolls, Outbound clicks, Site search, Form interactions, Video engagement, File downloads)
- GA4 → Admin → Property Settings → **Reporting time zone: Asia/Seoul** 확인

---

## 4. ⚠️ P1 — 폼 에러 이벤트 추가 (강력 권장)

### 4.1 왜 필요한가

광고 7일 돌렸는데 **가입자가 적게 나오는 경우** 의 진단:
- **폼이 망가진 건지** (validation 통과 못함, 서버 500 등)
- **사람이 안 들어온 건지** (광고 CPM 비쌈, CTR 낮음)

이 두 가지를 구분하려면 **폼 에러 이벤트가 있어야 함**. 지금은 success만 잡혀서 "안 들어옴"과 "들어왔는데 폼이 막힘"이 구분 안 됨.

### 4.2 추가 위치 — `waitlist-form.tsx`

#### (a) Validation 실패 분기

폼 검증 실패 시 (이메일 포맷 오류, 전화번호 형식, 필수값 누락 등):

```typescript
// src/components/.../waitlist-form.tsx (제출 핸들러 안)

if (!isValid) {
  trackEvent('waitlist_validation_error', {
    field: failedField,          // 'email' | 'phone' | 'agreement'
    reason: failedReason,        // 'invalid_format' | 'required' | 'too_short'
    contact_type,
  });
  return;
}
```

#### (b) 서버 응답 실패 분기

`waitlist-form.tsx:64` ~ `:73` 사이 try/catch 또는 response 분기에:

```typescript
try {
  const response = await fetch('/api/waitlist', { ... });
  if (!response.ok) {
    trackEvent('waitlist_error', {
      contact_type,
      error_code: response.status,
      error_type: 'server_response',
    });
    return;
  }
  // success 분기 (기존 코드)
  trackEvent('waitlist_success', { contact_type });
  (window as any).fbq?.('track', 'Lead', { ... });
} catch (e: any) {
  trackEvent('waitlist_error', {
    contact_type,
    error_code: 'network',
    error_type: 'fetch_failed',
    message: e?.message?.slice(0, 100),
  });
}
```

### 4.3 GA4 funnel 리포트 활용

`waitlist_cta_click → waitlist_submit → waitlist_success` funnel 에 **에러 이벤트가 끼면** 어디서 drop-off 되는지 보임:

```
waitlist_cta_click       1000
  → waitlist_submit       420  (모달까지 진입한 비율 42%)
  → waitlist_validation_error  80
  → waitlist_error             15
  → waitlist_success           325  (실제 가입 32.5%)
```

이 리포트는 광고 카피·랜딩 카피·폼 UX 어디를 고쳐야 할지 알려줌.

---

## 5. ⚠️ P1 — UTM 도달 확인 (광고 라이브 후 즉시)

### 5.1 광고 URL UTM 구조

```
https://winemine.vercel.app/
  ?utm_source=meta
  &utm_medium=reels         (또는 cpc)
  &utm_campaign=launch_2026q2_ko
  &utm_content=vid01_hero_map  (영상별로 분리)
```

> 62번 계획서 line 695 의 UTM 매핑표 참고. 영상 6개 각각 다른 `utm_content` 부여.

### 5.2 GA에 UTM 도달하는지 검증

광고 라이브 30분 후:

1. GA4 → **Reports** → **Realtime**
2. "Traffic source" 또는 "First user source / medium" 카드 확인
3. `meta / reels` 또는 `meta / cpc` 행이 보여야 함
4. 더 자세히: **Reports** → **Acquisition** → **Traffic acquisition**
   - Campaign 차원 추가 → `launch_2026q2_ko` 보여야 함
   - Content 차원 추가 → `vid01_hero_map` 등 영상별 분리 보여야 함

### 5.3 안 보일 때 진단

- 광고 URL의 UTM 파라미터 인코딩이 깨졌는지 (Meta UI에서 자동 인코딩 함정 있음)
- GA 스크립트가 `afterInteractive` 로 로드되는 사이에 referrer 가 유실됐는지
- AdBlock 환경에서 테스트 중인지 (시크릿 창 + AdBlock off 로 재검증)

---

## 6. 📋 광고 Publish 전 최종 체크리스트

**상위 2개는 반드시. 나머지는 운영 중 보강 가능.**

```
필수 (Publish 전):
□ waitlist-form.tsx:73 에 fbq('track', 'Lead', { content_category: contact_type }) 추가
□ GA4 Admin → Events → waitlist_success → Mark as key event ON
□ Meta Events Manager → Test Events 로 Lead 발화 실측 (브라우저 1회 가입 테스트)
□ GA4 Realtime 에서 waitlist_success 실측 (동일 가입 테스트)

권장 (Publish 후 24h 내):
□ waitlist_validation_error, waitlist_error 이벤트 추가 (Section 4)
□ UTM 도달 확인 (Section 5)
□ GA4 Enhanced measurement 전부 ON

선택 (1주일 운영 후 보강):
□ hero-section.tsx, final-cta-section.tsx 의 CTA 클릭에 waitlist_cta_click 추가
□ 스크롤 도달률 50%/75%/100% 이벤트 (GA Enhanced measurement 로 자동)
□ Burgundy 드릴다운, Wine Discovery 단계 진행, 다크/라이트 토글, 로케일 스위치 측정
□ Amplitude 정리 결정 (계속 유지 vs 제거)
```

---

## 7. 향후 — 베타 출시 시점에 다시 손볼 곳

지금은 광고 → Waitlist 가입 ROI 측정이 우선이라 미뤄도 되는 항목:

1. **베타 초대장 발송 → 앱 다운로드 → 첫 사용** funnel 이벤트 추가
   - Meta Pixel `CompleteRegistration` 발화 시점 분리
2. **인앱 행동 측정 도구 결정** — Amplitude 재도입 or PostHog 마이그레이션
3. **AB 테스트 인프라** — 랜딩 카피 v1/v2, CTA 색상, hero 영상 등
4. **Server-side tracking 도입** — Meta CAPI (iOS 14.5+ tracking 제한 우회)
5. **GA4 → BigQuery export** — 무료 plan에서도 가능, raw event 보존

---

## 8. 참고 링크

- Meta Pixel Standard Events 목록: https://www.facebook.com/business/help/402791146561655
- GA4 Key Events 가이드: https://support.google.com/analytics/answer/12844695
- 62번 계획서 UTM 매핑표: `_workspace/62_micro_budget_action_plan.md` line 695-720
- 광고 캠페인 셋업 결정: 2026-05-17 대화 (Stories+Reels only, 9:16 mp4, ₩5,000/일 × 7일)

---

**작성:** 2026-05-17, 광고 publish 직전 진단 결과
**다음 단계:** Section 2 + Section 3 작업 후 Section 6 체크리스트 따라 publish
