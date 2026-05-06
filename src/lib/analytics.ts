declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
  }
}

type GtagEventParams = Record<string, string | number | boolean>;

export function trackEvent(name: string, params?: GtagEventParams) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, params);
}
