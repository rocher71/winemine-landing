import * as amplitude from '@amplitude/unified';

export function track(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  amplitude.track(eventName, properties);
}
