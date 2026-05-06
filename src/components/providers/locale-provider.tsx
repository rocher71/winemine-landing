'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Locale, Messages } from '@/lib/i18n';

interface LocaleCtx {
  locale: Locale;
  messages: Messages;
  t: (key: string) => string;
}

const Ctx = createContext<LocaleCtx | null>(null);

function resolve(obj: unknown, path: string): string {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return '';
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : '';
}

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  const t = (key: string) => resolve(messages, key);
  return <Ctx.Provider value={{ locale, messages, t }}>{children}</Ctx.Provider>;
}

export function useLocale(): LocaleCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
