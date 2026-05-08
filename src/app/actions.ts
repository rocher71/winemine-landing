'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { headers } from 'next/headers';
import { notifyNewSignup } from '@/lib/slack';

const emailSchema = z.object({
  contactType: z.literal('email'),
  contact: z.string().email().max(255),
});

const phoneSchema = z.object({
  contactType: z.literal('phone'),
  contact: z.string().regex(/^010[-\s]?\d{4}[-\s]?\d{4}$/).max(20),
});

const schema = z.discriminatedUnion('contactType', [emailSchema, phoneSchema]);

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
