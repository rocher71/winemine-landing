# UI Engineer — Completed Files

Owner: ui-engineer
Tasks completed: #3, #4, #5, #6, #7, #8

## Files created

- `src/components/waitlist/waitlist-form.tsx` — react-hook-form + zod, email/phone tab toggle. Calls `submitWaitlist({ contact, contactType })` directly (does NOT rely on hidden input for contactType, per spec note).
- `src/components/waitlist/waitlist-success.tsx` — CheckCircle2 + framer-motion scale-in animation, "닫기" button.
- `src/components/waitlist/waitlist-modal.tsx` — AnimatePresence backdrop + dialog, Escape key close, body scroll lock, focus on first interactive on mount delegated to native form, success state reset 300ms after close.
- `src/components/sections/features-section.tsx` — 3 feature cards (Globe2 / Camera / Share2), `whileInView` stagger 0.15s, `useReducedMotion` respected.
- `src/components/sections/how-it-works-section.tsx` — 3 numbered steps (01/02/03), Playfair Display 64px numbers in `#2D1540`.
- `src/components/sections/final-cta-section.tsx` — 두 번째 CTA + Footer (`© 2025 winemine`).
- `src/app/page.tsx` — Composes Hero + Features + HowItWorks + FinalCTA + WaitlistModal, owns `modalOpen` useState, passes `openModal` to Hero and FinalCTA.

## Notes

- HeroSection from map-engineer already uses interface `{ onOpenModal: () => void }`, so no contract negotiation was needed.
- All components use inline-style theme palette (no Tailwind for colors) consistent with HeroSection's pattern.
- `prefers-reduced-motion` honored across all animated sections via `useReducedMotion()`.
- Form submission constructs `{ contact: data.contact, contactType }` payload explicitly because the server action signature accepts that shape directly (not the discriminated-union form data).
