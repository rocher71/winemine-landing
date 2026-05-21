'use server';

import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { notifyNewSignup, notifyNewFeedback } from '@/lib/slack';
import { addContact, sendCouponActivatedEmail } from '@/lib/resend';
import { generateReferralCode, isValidReferralCode } from '@/lib/referral';
import { contactSchema, feedbackSchema } from '@/lib/validations';

// 서버측 재검증 — 클라이언트 Zod와 동일한 룰로 NULL byte / 제어 문자 / 형식 차단.
const schema = contactSchema;

export async function submitWaitlist(data: {
  contact: string;
  contactType: 'email' | 'phone';
  marketingAgree?: boolean;
  referredBy?: string;
}): Promise<{ success: boolean; error?: string }> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'validation' };

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  const referredBy = data.referredBy && isValidReferralCode(data.referredBy)
    ? data.referredBy
    : null;

  const { error } = await supabase.from('waitlist').insert({
    contact: parsed.data.contact.trim(),
    contact_type: parsed.data.contactType,
    ip_address: ip,
    user_agent: headersList.get('user-agent'),
    marketing_agree: data.marketingAgree ?? false,
    referral_code: generateReferralCode(),
    referred_by: referredBy,
  });

  if (error && error.code !== '23505') {
    return { success: false, error: 'server' };
  }

  const { count: rawCount } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });
  const totalCount = typeof rawCount === 'number' ? rawCount : null;

  await notifyNewSignup({
    contact: parsed.data.contact.trim(),
    contactType: parsed.data.contactType,
    marketingAgree: data.marketingAgree ?? false,
    isDuplicate: error?.code === '23505',
    totalCount,
  });

  // 신규 가입자 후처리 (중복 제외)
  if (!error) {
    if (parsed.data.contactType === 'email') {
      await addContact(parsed.data.contact.trim());
    }
    if (referredBy) {
      // atomic: 카운트 +1 + (첫 추천이면) coupon 활성화
      const { data: refResult } = await supabase
        .rpc('process_referral', { p_referral_code: referredBy })
        .maybeSingle<{
          referrer_id: string;
          referrer_contact: string;
          coupon_code: string;
          is_first_referral: boolean;
        }>();

      if (refResult?.is_first_referral && refResult.referrer_contact) {
        await sendCouponActivatedEmail({
          to: refResult.referrer_contact,
          couponCode: refResult.coupon_code,
        });
      }
    }
  }

  return { success: true };
}

export async function submitFeedback(data: {
  message: string;
  email?: string;
  category: 'feature';
}): Promise<{ success: boolean; error?: string }> {
  const parsed = feedbackSchema.safeParse({
    message: data.message,
    email: data.email ?? '',
    category: data.category,
  });
  if (!parsed.success) return { success: false, error: 'validation' };

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  const trimmedEmail = parsed.data.email?.trim() ?? '';
  const emailOrNull = trimmedEmail.length > 0 ? trimmedEmail : null;

  const { error } = await supabase.from('feedback').insert({
    message: parsed.data.message.trim(),
    email: emailOrNull,
    category: parsed.data.category,
    ip_address: ip,
    user_agent: headersList.get('user-agent'),
  });

  if (error) {
    return { success: false, error: 'server' };
  }

  await notifyNewFeedback({
    message: parsed.data.message.trim(),
    email: emailOrNull,
    category: parsed.data.category,
  });

  return { success: true };
}
