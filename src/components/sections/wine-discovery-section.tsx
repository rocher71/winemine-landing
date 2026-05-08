'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, useTransform, AnimatePresence, MotionValue } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { useLocale } from '@/components/providers/locale-provider';
import { ScanPanel } from './features-section';
import { RECOMMENDED_WINES, STARTING_WINE, formatKrw } from '@/lib/recommended-wines';

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
          whiteSpace: 'pre-line',
        }}>
          {body}
        </p>
      )}
    </div>
  );
}

// ── RecommendationMap: sequential pin reveal + zoom-out ───────────────────
const MAP_W = 720;
const MAP_H = 380;
const PIN_REVEAL_START = 0.18;
const PIN_REVEAL_END = 0.78;
const PER_PIN = (PIN_REVEAL_END - PIN_REVEAL_START) / RECOMMENDED_WINES.length;

function PinDot({
  initials,
  highlighted,
  progress,
  startThresh,
}: {
  initials: string;
  highlighted: boolean;
  progress: MotionValue<number>;
  startThresh: number;
}) {
  const opacity = useTransform(progress, [startThresh, startThresh + 0.04], [0, 1]);
  const scale = useTransform(progress, [startThresh, startThresh + 0.06, startThresh + 0.10], [0.4, 1.25, 1]);
  const fill = highlighted ? '#D42040' : '#C9A84C';
  const stroke = highlighted ? '#FCE4EA' : '#04010A';
  const r = highlighted ? 7 : 6;
  return (
    <motion.g style={{ opacity, scale }}>
      {/* halo */}
      <motion.circle
        cx={0} cy={0} r={r * 1.9}
        fill={fill}
        opacity={0.2}
        animate={highlighted ? { r: [r * 1.6, r * 2.4, r * 1.6] } : undefined}
        transition={highlighted ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
      />
      <circle cx={0} cy={0} r={r} fill={fill} stroke={stroke} strokeWidth={1.2} />
      <text
        textAnchor="middle"
        y={2.6}
        style={{
          fontSize: 6.5,
          fontWeight: 800,
          fill: '#04010A',
          letterSpacing: '0.04em',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {initials}
      </text>
    </motion.g>
  );
}

function RecommendationMap({ progress }: { progress: MotionValue<number> }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Map scale: zoom out as progress increases (1.0 → 1.18)
  const mapScale = useTransform(progress, [0, 0.15, 1], [1.05, 1.05, 1.18]);
  // Map fade in
  const mapOpacity = useTransform(progress, [0, 0.10], [0, 1]);

  if (!mounted) {
    return <div style={{ width: '100%', maxWidth: MAP_W, aspectRatio: `${MAP_W} / ${MAP_H}` }} />;
  }

  return (
    <motion.div
      style={{
        width: '100%',
        maxWidth: MAP_W,
        aspectRatio: `${MAP_W} / ${MAP_H}`,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 14,
        border: '1px solid rgba(201,168,76,0.18)',
        background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(196,30,58,0.08) 0%, transparent 65%), #08051A',
        boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(196,30,58,0.06)',
        opacity: mapOpacity,
      }}
    >
      <motion.div style={{ width: '100%', height: '100%', scale: mapScale, transformOrigin: '50% 55%' }}>
        <ComposableMap
          projection="geoEquirectangular"
          projectionConfig={{ scale: 130, center: [10, 25] }}
          width={MAP_W}
          height={MAP_H}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <Geographies geography="/world-110m.json">
            {({ geographies }) =>
              geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill: '#1A0A2E', stroke: '#2A0C58', strokeWidth: 0.4, outline: 'none' },
                    hover:   { fill: '#1A0A2E', stroke: '#2A0C58', strokeWidth: 0.4, outline: 'none' },
                    pressed: { fill: '#1A0A2E', stroke: '#2A0C58', strokeWidth: 0.4, outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Starting wine (always visible once map fades in) */}
          <Marker coordinates={STARTING_WINE.coords}>
            <PinDot
              initials={STARTING_WINE.initials}
              highlighted
              progress={progress}
              startThresh={0.06}
            />
          </Marker>

          {/* Recommended wines — sequential reveal */}
          {RECOMMENDED_WINES.map((w, i) => (
            <Marker key={w.id} coordinates={w.coords}>
              <PinDot
                initials={w.initials}
                highlighted={false}
                progress={progress}
                startThresh={PIN_REVEAL_START + i * PER_PIN}
              />
            </Marker>
          ))}
        </ComposableMap>
      </motion.div>

      {/* Connection arcs (decorative, subtle) */}
    </motion.div>
  );
}

function StartHintPill({ progress, text }: { progress: MotionValue<number>; text: string }) {
  const opacity = useTransform(progress, [0.08, 0.16, 0.28, 0.36], [0, 1, 1, 0]);
  return (
    <motion.div
      style={{
        opacity,
        position: 'absolute',
        top: 'clamp(96px, 14vh, 140px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(212,32,64,0.14)',
        border: '1px solid rgba(212,32,64,0.36)',
        color: '#F5F0E8',
        padding: '8px 16px',
        borderRadius: 999,
        fontSize: 12,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 6,
        pointerEvents: 'none',
      }}
    >
      {text}
    </motion.div>
  );
}

function RecommendationCard({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.78, 0.88], [0, 1]);
  const y = useTransform(progress, [0.78, 0.92], [24, 0]);
  // Pick a representative recommendation (Chianti Classico — Italy entry-level)
  const wine = RECOMMENDED_WINES[1];
  return (
    <motion.div
      style={{
        opacity,
        y,
        position: 'absolute',
        bottom: 'clamp(28px, 5vh, 56px)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'rgba(12,4,24,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(201,168,76,0.32)',
        borderRadius: 14,
        padding: '12px 18px 12px 14px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        pointerEvents: 'none',
        zIndex: 7,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: '#C9A84C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          fontWeight: 800,
          color: '#04010A',
          letterSpacing: '0.04em',
          flexShrink: 0,
        }}
      >
        {wine.initials}
      </div>
      <div>
        <div style={{
          fontSize: 9,
          letterSpacing: '0.14em',
          color: '#C9A84C',
          textTransform: 'uppercase',
          marginBottom: 3,
        }}>
          {wine.country} · {wine.region}
        </div>
        <div style={{
          fontFamily: 'Georgia, serif',
          fontSize: 15,
          color: '#F5F0E8',
          marginBottom: 3,
        }}>
          {wine.name}
        </div>
        <div style={{
          fontSize: 11,
          color: '#9B8B7A',
        }}>
          {wine.styleHint} · <span style={{ color: '#C9A84C', fontWeight: 700 }}>{formatKrw(wine.priceKrw)}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────
export default function WineDiscoverySection() {
  const { messages } = useLocale();
  const t = messages.wineDiscovery;
  const outerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end start'],
  });

  // Step thresholds for the 3-step + outro flow
  // 0 (intro) | 1 (scan) | 2 (recommend, longest) | 3 (outro)
  useMotionValueEvent(scrollYProgress, 'change', v => {
    setStep(v < 0.10 ? 0 : v < 0.28 ? 1 : v < 0.85 ? 2 : 3);
  });

  // Sub-progress 0..1 within step 2 region
  const recProgress = useTransform(scrollYProgress, [0.28, 0.85], [0, 1], { clamp: true });

  return (
    <section
      ref={outerRef}
      style={{
        height: '380vh',
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
        {/* Top header — section label + framing question, fixed */}
        <div style={{
          position: 'absolute',
          top: 'clamp(28px, 4vh, 52px)',
          left: '50%', transform: 'translateX(-50%)',
          textAlign: 'center', whiteSpace: 'nowrap',
          zIndex: 5,
        }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.32em',
            color: '#C9A84C', textTransform: 'uppercase',
            opacity: 0.8, marginBottom: 8,
          }}>
            {t.sectionLabel}
          </div>
          <h3 style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(15px, 2.2vw, 20px)',
            fontWeight: 400,
            color: '#F5F0E8',
            lineHeight: 1.3,
            margin: 0,
          }}>
            {t.topQuestion}
          </h3>
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
              maxWidth: 760,
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
                <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <RecommendationMap progress={recProgress} />
                  <RecommendationCard progress={recProgress} />
                </div>
                <div style={{
                  fontSize: 11,
                  color: '#6A5E4A',
                  fontStyle: 'italic',
                  letterSpacing: '0.04em',
                  marginTop: 4,
                }}>
                  ✦ {t.step2.footnote}
                </div>
              </>
            )}

            {step === 3 && (
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

        {/* Floating start hint — only visible in step 2 early phase */}
        {step === 2 && <StartHintPill progress={recProgress} text={t.step2.startHint} />}

        {/* Step indicator dots — left center, vertical (4 dots: 0,1,2,outro) */}
        <div style={{
          position: 'absolute',
          left: 'clamp(16px, 3vw, 32px)',
          top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
        }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 5,
              height: i === step ? 20 : 5,
              borderRadius: 3,
              background: i === step ? '#C9A84C' : 'rgba(255,255,255,0.18)',
              transition: 'all 320ms cubic-bezier(0.4,0,0.2,1)',
            }} />
          ))}
        </div>

        {/* Scroll hint — bottom center, until outro */}
        <AnimatePresence>
          {step < 3 && (
            <motion.div
              key="scroll-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: step === 0 ? 0.6 : 0 }}
              style={{
                position: 'absolute',
                bottom: 'clamp(28px, 4.5vh, 48px)',
                left: '50%', transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                pointerEvents: 'none',
              }}
            >
              <span style={{
                fontSize: 11, color: 'rgba(255,255,255,0.55)',
                letterSpacing: '0.06em', whiteSpace: 'nowrap',
              }}>
                스크롤 해보세요
              </span>
              <span style={{
                fontSize: 9, color: 'rgba(255,255,255,0.28)',
                letterSpacing: '0.14em', textTransform: 'uppercase' as const,
              }}>
                scroll down
              </span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ marginTop: 4 }}
              >
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                  <path d="M1 1.5L8 8.5L15 1.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
