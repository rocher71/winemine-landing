'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/components/providers/locale-provider';
import { ScanPanel } from './features-section';
import { StoryCard, PhoneMockup } from './instagram-preview-section';

const TASTE_BARS = [
  { key: 'red',       pct: 62, color: '#8B1A2A' },
  { key: 'white',     pct: 18, color: '#C9A84C' },
  { key: 'rose',      pct: 12, color: '#D4859A' },
  { key: 'sparkling', pct:  6, color: '#E8DDB5' },
  { key: 'champagne', pct:  2, color: '#F0C876' },
] as const;

type TasteBarKey = typeof TASTE_BARS[number]['key'];

function StepHeader({ label, title, body }: { label?: string; title: string; body?: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 'clamp(20px, 3vh, 36px)' }}>
      {label && (
        <div style={{
          fontSize: 10,
          letterSpacing: '0.28em',
          color: '#C9A84C',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          {label}
        </div>
      )}
      <h2 style={{
        fontFamily: 'var(--font-playfair), Georgia, serif',
        fontSize: 'clamp(26px, 4.5vw, 42px)',
        fontWeight: 400,
        color: '#F5F0E8',
        lineHeight: 1.2,
        marginBottom: body ? 14 : 0,
        whiteSpace: 'pre-line',
      }}>
        {title}
      </h2>
      {body && (
        <p style={{
          fontSize: 'clamp(13px, 1.5vw, 15px)',
          color: '#9B8B7A',
          maxWidth: 520,
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          {body}
        </p>
      )}
    </div>
  );
}

function TasteBars({ tasteLabels, active }: {
  tasteLabels: Record<TasteBarKey, string>;
  active: boolean;
}) {
  return (
    <div style={{
      width: '100%', maxWidth: 360,
      display: 'flex', flexDirection: 'column', gap: 9,
    }}>
      {TASTE_BARS.map((bar, i) => (
        <div key={bar.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 64, fontSize: 12, color: '#D4C5B0',
            textAlign: 'right', flexShrink: 0, fontWeight: 500,
          }}>
            {tasteLabels[bar.key]}
          </span>
          <div style={{
            flex: 1, height: 10,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 5, overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: active ? `${bar.pct}%` : 0 }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
              style={{
                height: '100%', background: bar.color, borderRadius: 5,
                boxShadow: `0 0 10px ${bar.color}55`,
              }}
            />
          </div>
          <span style={{
            width: 32, fontSize: 11, color: '#C9A84C',
            fontWeight: 700, textAlign: 'left', flexShrink: 0,
          }}>
            {bar.pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function WineDiscoverySection() {
  const { messages } = useLocale();
  const t = messages.wineDiscovery;
  const outerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end start'],
  });

  useMotionValueEvent(scrollYProgress, 'change', v => {
    setStep(v < 0.10 ? 0 : v < 0.32 ? 1 : v < 0.58 ? 2 : v < 0.85 ? 3 : 4);
  });

  return (
    <section
      ref={outerRef}
      style={{
        height: '320vh',
        position: 'relative',
        background: '#04010A',
      }}
    >
      <div style={{
        position: 'sticky', top: 0,
        height: '100vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(80px, 12vh, 120px) 24px',
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(196,30,58,0.05) 0%, transparent 60%), #04010A',
      }}>
        {/* Top eyebrow — section label, fixed */}
        <div style={{
          position: 'absolute',
          top: 'clamp(40px, 6vh, 64px)',
          left: '50%', transform: 'translateX(-50%)',
          fontSize: 10, letterSpacing: '0.32em',
          color: '#C9A84C', textTransform: 'uppercase',
          opacity: 0.85, whiteSpace: 'nowrap',
        }}>
          {t.sectionLabel}
        </div>

        {/* Step content (swap on step change) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              width: '100%',
              maxWidth: 720,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(16px, 2.5vh, 28px)',
            }}
          >
            {step === 0 && (
              <>
                <StepHeader title={`${t.step0.title}\n${t.step0.subtitle}`} />
                <div style={{
                  width: 120, height: 168,
                  background: 'linear-gradient(160deg, rgba(245,240,232,0.32) 0%, rgba(232,221,208,0.28) 100%)',
                  borderRadius: 6,
                  filter: 'blur(2px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: 'rotate(-3deg)',
                }}>
                  <div style={{
                    position: 'absolute', top: '40%',
                    left: '20%', right: '20%', height: 1,
                    background: 'rgba(139,26,42,0.5)',
                  }} />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <StepHeader
                  label={t.step1.label}
                  title={t.step1.title}
                  body={t.step1.body}
                />
                <ScanPanel />
              </>
            )}

            {step === 2 && (
              <>
                <StepHeader
                  label={t.step2.label}
                  title={t.step2.title}
                  body={t.step2.body}
                />
                <TasteBars tasteLabels={t.step2.tasteBars} active={step === 2} />
                <div style={{
                  fontSize: 12, color: '#C9A84C',
                  fontStyle: 'italic',
                  marginTop: 4,
                  textAlign: 'center',
                  letterSpacing: '0.02em',
                }}>
                  ✦ {t.step2.insight}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <StepHeader
                  label={t.step3.label}
                  title={t.step3.title}
                  body={t.step3.body}
                />
                <PhoneMockup scale={0.62}>
                  <StoryCard animate={step === 3} />
                </PhoneMockup>
              </>
            )}

            {step === 4 && (
              <>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: '#D42040',
                  boxShadow: '0 0 32px rgba(212,32,64,0.55)',
                  marginBottom: 4,
                }} />
                <h2 style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: 'clamp(28px, 5vw, 44px)',
                  fontWeight: 400,
                  color: '#F5F0E8',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  marginBottom: 14,
                }}>
                  {t.outro.title}
                </h2>
                <p style={{
                  fontSize: 14, color: '#9B8B7A',
                  textAlign: 'center', marginBottom: 8,
                }}>
                  {t.outro.subtitle}
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Step indicator dots — bottom */}
        <div style={{
          position: 'absolute',
          bottom: 'clamp(28px, 4.5vh, 48px)',
          left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              width: i === step ? 20 : 5,
              height: 5,
              borderRadius: 3,
              background: i === step ? '#C9A84C' : 'rgba(255,255,255,0.18)',
              transition: 'all 320ms cubic-bezier(0.4,0,0.2,1)',
            }} />
          ))}
        </div>
      </div>
    </section>
  );
}
