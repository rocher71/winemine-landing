import { cookies } from 'next/headers';
import type koJson from '@/messages/ko.json';

export type Locale = 'ko' | 'en';
export type Messages = typeof koJson;

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const val = store.get('NEXT_LOCALE')?.value;
  return val === 'en' ? 'en' : 'ko';
}

export async function getMessages(locale: Locale): Promise<Messages> {
  if (locale === 'en') {
    const mod = await import('@/messages/en.json');
    return mod.default as Messages;
  }
  const mod = await import('@/messages/ko.json');
  return mod.default;
}
