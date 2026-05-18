'use server';

import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { notifyNewSignup } from '@/lib/slack';
import { contactSchema } from '@/lib/validations';

// 서버측 재검증 — 클라이언트 Zod와 동일한 룰로 NULL byte / 제어 문자 / 형식 차단.
const schema = contactSchema;

export async function submitWaitlist(data: {
  contact: string;
  contactType: 'email' | 'phone';
  marketingAgree?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'validation' };

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  const { error } = await supabase.from('waitlist').insert({
    contact: parsed.data.contact.trim(),
    contact_type: parsed.data.contactType,
    ip_address: ip,
    user_agent: headersList.get('user-agent'),
    marketing_agree: data.marketingAgree ?? false,
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
  return { success: true };
}
