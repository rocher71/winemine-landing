declare global {
  interface Window {
    fbq?: (
      type: 'track' | 'trackCustom',
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export {};
