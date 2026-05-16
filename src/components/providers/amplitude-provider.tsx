'use client';

import { useEffect } from 'react';
import * as amplitude from '@amplitude/unified';

let initialized = false;

export function AmplitudeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (initialized) return;
    const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    if (!apiKey) return;
    initialized = true;
    amplitude.initAll(apiKey, {
      analytics: { autocapture: true },
      sessionReplay: { sampleRate: 1 },
    });
  }, []);

  return <>{children}</>;
}
