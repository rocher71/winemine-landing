'use client';

import { useEffect } from 'react';
import * as amplitude from '@amplitude/unified';

let initialized = false;

export function AmplitudeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    amplitude.initAll('9825dc40dbb389f7770795e6cd3f409', {
      analytics: { autocapture: true },
      sessionReplay: { sampleRate: 1 },
    });
  }, []);

  return <>{children}</>;
}
