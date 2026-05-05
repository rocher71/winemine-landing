'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { headers } from 'next/headers';

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
  });

  if (error?.code === '23505') return { success: true };
  if (error) return { success: false, error: 'server' };
  return { success: true };
}
