import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM     = 'WineMine <wine@winemine.site>';
const REPLY_TO = 'wine@winemine.site';

export async function addContact(email: string): Promise<void> {
  try {
    await resend.contacts.create({ email });
  } catch {
    // Resend 실패가 waitlist 가입 흐름을 막지 않도록 silent fail
  }
}

/**
 * 추천인의 첫 추천이 발생했을 때 호출.
 * Resend 대시보드 템플릿(RESEND_TEMPLATE_ID_COUPON_ACTIVATED) 사용.
 * 템플릿 변수: {{COUPON_CODE}}
 */
export async function sendCouponActivatedEmail({
  to,
  couponCode,
}: {
  to: string;
  couponCode: string;
}): Promise<void> {
  const templateId = process.env.RESEND_TEMPLATE_ID_COUPON_ACTIVATED;
  if (!templateId) return; // 환경변수 미설정 시 silent skip

  try {
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to,
      subject: '🎉 친구가 합류했어요 — 6개월 Premium 쿠폰이 활성화되었습니다',
      // @ts-expect-error Resend SDK 타입에는 template_id 미정의이지만 런타임은 지원
      template_id: templateId,
      variables: { COUPON_CODE: couponCode },
    });
  } catch {
    // 메일 실패가 referral 처리 자체를 막지 않도록 silent fail
  }
}
