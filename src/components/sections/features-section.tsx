'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/components/providers/locale-provider';
import {
  CountryFlag,
  StarFilledIcon,
  GrapeIcon,
  CalendarIcon,
  StarBurstIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  type CountryFlagProps,
} from '@/components/icons/wine-icons';

// ── Panel 1: GlassCardStack — 3 stacked glass wine cards ──────────────────
const REGIONS: { code: CountryFlagProps['code']; country: string; wines: number; bar: number; color: string }[] = [
  { code: 'FR', country: '프랑스', wines: 28, bar: 95, color: '#C41E3A' },
  { code: 'IT', country: '이탈리아', wines: 21, bar: 74, color: '#C41E3A' },
  { code: 'CL', country: '칠레', wines: 18, bar: 62, color: '#C41E3A' },
  { code: 'NZ', country: '뉴질랜드', wines: 14, bar: 48, color: '#C41E3A' },
  { code: 'ES', country: '스페인', wines: 11, bar: 38, color: '#C41E3A' },
  { code: 'AR', country: '아르헨티나', wines: 9, bar: 30, color: '#C41E3A' },
];

type GlassWine = {
  id: string; initials: string; region: string; vintage: string;
  appellation: string; grade: string; name: string; note: string;
  grapes: string; date: string; occasion: string; rating: number; color: string;
};

const GLASS_WINES: GlassWine[] = [
  { id: 'm',  initials: 'CM', region: 'BORDEAUX', vintage: '2015', appellation: 'Médoc',         grade: 'Premier Grand Cru', name: 'Château Margaux',     note: '잘 익은 카시스, 시가박스, 제비꽃. 우아한 탄닌이 한참 머무름.',  grapes: 'Cabernet Sauvignon · Merlot', date: '2026.04.18', occasion: '결혼기념일',  rating: 4.8, color: '#C41E3A' },
  { id: 'p',  initials: 'CP', region: 'POMEROL',  vintage: '2018', appellation: 'Pomerol',        grade: 'Grand Cru',         name: 'Château Pétrus',      note: '체리, 트러플, 벨벳. 실키한 질감과 무한한 여운.',              grapes: 'Merlot',                      date: '2026.02.14', occasion: '발렌타인데이', rating: 5.0, color: '#C41E3A' },
  { id: 'mp', initials: 'MP', region: 'BOURGOGNE', vintage: '2021', appellation: 'Côte de Beaune', grade: '1er Cru',           name: 'Meursault Perrières', note: '헤이즐넛, 버터, 순수한 미네랄. 우아함의 극치.',               grapes: 'Chardonnay',                  date: '2026.01.12', occasion: '지인 모임', rating: 4.9, color: 'var(--color-gold)' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = n <= Math.round(rating);
        return (
          <span key={n} aria-hidden style={{ display: 'inline-flex', color: filled ? 'var(--color-gold)' : 'var(--color-border)' }}>
            <StarFilledIcon size={12} filled={filled} />
          </span>
        );
      })}
      <span style={{ fontSize: 11, color: 'var(--color-gold)', fontWeight: 700, marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </div>
  );
}

function WineCardInner({ wine }: { wine: GlassWine }) {
  const { messages } = useLocale();
  const wineIdx = GLASS_WINES.findIndex(w => w.id === wine.id);
  const wineCard = messages.features?.wineCards?.[wineIdx];
  return (
    <div style={{
      background: 'rgba(12,4,24,0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid var(--color-border-soft)',
      borderRadius: 18,
      padding: '16px 18px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{
          fontSize: 7, textTransform: 'uppercase' as const, letterSpacing: '0.12em',
          color: 'var(--color-gold)', border: '1px solid rgba(201,168,76,0.25)',
          borderRadius: 4, padding: '2px 6px',
        }}>
          {wine.region}
        </span>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: wine.color + '26',
          border: `1px solid ${wine.color}4D`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: wine.color }}>
            {wine.initials}
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
          {wine.vintage}
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-border-soft)', marginBottom: 10 }} />

      {/* Wine name + grade */}
      <div style={{ fontSize: 16, fontFamily: 'Georgia, serif', color: 'var(--color-text-primary)', marginBottom: 3 }}>
        {wine.name}
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 12 }}>
        {wine.appellation} · {wine.grade}
      </div>

      {/* Tasting note label */}
      <div style={{
        fontSize: 8, textTransform: 'uppercase' as const, letterSpacing: '0.15em',
        color: 'var(--color-gold)', marginBottom: 4,
      }}>
        Tasting Note
      </div>

      {/* Note text */}
      <div style={{
        fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6,
        fontStyle: 'italic', marginBottom: 12,
      }}>
        {wineCard?.note ?? wine.note}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-border-soft)', marginBottom: 10 }} />

      {/* Meta rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span aria-hidden style={{ display: 'inline-flex', color: 'var(--color-text-muted)' }}><GrapeIcon size={11} /></span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{wine.grapes}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span aria-hidden style={{ display: 'inline-flex', color: 'var(--color-text-muted)' }}><CalendarIcon size={11} /></span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{wine.date}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span aria-hidden style={{ display: 'inline-flex', color: 'var(--color-text-muted)' }}><StarBurstIcon size={11} /></span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{wineCard?.occasion ?? wine.occasion}</span>
        </div>
      </div>

      {/* Star rating */}
      <StarRating rating={wine.rating} />
    </div>
  );
}

// Infinite carousel: [last_clone, ...all, first_clone]
const N = GLASS_WINES.length;
const CAROUSEL = [GLASS_WINES[N - 1], ...GLASS_WINES, GLASS_WINES[0]];
const CAROUSEL_START = 2; // wine[1] (2nd card) is at index 2

function GlassCardStack() {
  const { messages } = useLocale();
  const [isMobile, setIsMobile] = useState(false);

  // Mobile infinite carousel state
  const [carouselIdx, setCarouselIdx] = useState(CAROUSEL_START);
  const [dragDx, setDragDx] = useState(0);
  const [withAnim, setWithAnim] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(280);
  const startXRef = useRef(0);
  const jumpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Desktop state
  const [activeIdx, setActiveIdx] = useState(0);
  const [hasClicked, setHasClicked] = useState(false);

  // Mobile: swipe hint 숨김 여부
  const [hasSwiped, setHasSwiped] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current) setContainerW(containerRef.current.offsetWidth);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [isMobile]);

  useEffect(() => {
    return () => { if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current); };
  }, []);

  // Carousel geometry
  const CARD_RATIO = 0.78;
  const GAP = 12;
  const cardW = containerW * CARD_RATIO;
  const STEP = cardW + GAP;
  const centerX = (containerW - cardW) / 2;

  const getX = (i: number) => centerX + (i - carouselIdx) * STEP + dragDx;

  // Active wine index (0–2) derived from carousel position
  const activeWineIdx = ((carouselIdx - 1) % N + N) % N;

  const navigateTo = (nextIdx: number) => {
    setWithAnim(true);
    setCarouselIdx(nextIdx);
    setDragDx(0);
    // Silently jump away from clone positions after animation
    if (nextIdx === 0 || nextIdx === CAROUSEL.length - 1) {
      if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current);
      jumpTimerRef.current = setTimeout(() => {
        setWithAnim(false);
        // 0 -> real last (index N), last -> real first (index 1)
        setCarouselIdx(nextIdx === 0 ? N : 1);
      }, 380);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setWithAnim(false);
    if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setDragDx(e.touches[0].clientX - startXRef.current);
  };

  const handleTouchEnd = () => {
    if (dragDx < -50) {
      navigateTo(carouselIdx + 1);
      setHasSwiped(true);
    } else if (dragDx > 50) {
      navigateTo(carouselIdx - 1);
      setHasSwiped(true);
    } else {
      setWithAnim(true);
      setDragDx(0);
    }
  };

  const cardOffsets = [
    { x: 14, y: -10, scale: 0.91, opacity: 0.28, zIndex: 1 },
    { x: 7,  y: -5,  scale: 0.955, opacity: 0.55, zIndex: 2 },
    { x: 0,  y: 0,   scale: 1,    opacity: 1,    zIndex: 3 },
  ];

  const Dots = ({ active, onDotClick }: { active: number; onDotClick: (i: number) => void }) => (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {GLASS_WINES.map((_, i) => (
        <div
          key={i}
          style={{
            width: i === active ? 16 : 6,
            height: 6,
            borderRadius: 3,
            background: i === active ? 'var(--color-gold)' : 'var(--overlay-medium)',
            transition: 'all 300ms ease',
            cursor: 'pointer',
          }}
          onClick={() => onDotClick(i)}
        />
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {/* Infinite peek carousel */}
        <div
          ref={containerRef}
          style={{ width: '100%', overflow: 'hidden', position: 'relative', height: 330, touchAction: 'pan-y' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {CAROUSEL.map((wine, i) => {
            const isCenter = i === carouselIdx;
            const x = getX(i);
            return (
              <div
                key={`${wine.id}-${i}`}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: cardW,
                  transform: `translateX(${x}px) scale(${isCenter ? 1 : 0.95})`,
                  transition: withAnim && dragDx === 0
                    ? 'transform 360ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 360ms'
                    : 'none',
                  opacity: isCenter ? 1 : 0.4,
                  willChange: 'transform',
                }}
              >
                <WineCardInner wine={wine} />
              </div>
            );
          })}
        </div>

        <Dots active={activeWineIdx} onDotClick={(i) => navigateTo(1 + i)} />

        <AnimatePresence>
          {!hasSwiped && (
            <motion.div
              key="swipe-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, pointerEvents: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <motion.span
                  animate={{ x: [-4, 0, -4] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ display: 'inline-flex', color: 'var(--overlay-strong)' }}
                  aria-hidden
                >
                  <ArrowLeftIcon size={14} />
                </motion.span>
                <span style={{ fontSize: 11, color: 'var(--overlay-strong)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  좌우로 스와이프 해보세요
                </span>
                <motion.span
                  animate={{ x: [4, 0, 4] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ display: 'inline-flex', color: 'var(--overlay-strong)' }}
                  aria-hidden
                >
                  <ArrowRightIcon size={14} />
                </motion.span>
              </div>
              <span style={{ fontSize: 9, color: 'var(--overlay-strong)', letterSpacing: '0.14em', textTransform: 'uppercase' as const }}>
                swipe left / right
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const wine = GLASS_WINES[activeIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Card stack container */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 300, height: 340 }}>
        {/* Back 2 cards (static offset cards for depth) */}
        {[0, 1].map(idx => {
          const offset = cardOffsets[idx];
          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                transform: `translateX(${offset.x}px) translateY(${offset.y}px) scale(${offset.scale})`,
                opacity: offset.opacity,
                zIndex: offset.zIndex,
                background: 'rgba(12,4,24,0.88)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--color-border-soft)',
                borderRadius: 18,
                height: 310,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            />
          );
        })}

        {/* Front card — clickable, animated */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            zIndex: cardOffsets[2].zIndex,
            transform: `translateX(${cardOffsets[2].x}px) translateY(${cardOffsets[2].y}px) scale(${cardOffsets[2].scale})`,
            cursor: 'pointer',
          }}
          onClick={() => { setActiveIdx(prev => (prev + 1) % N); setHasClicked(true); }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
            >
              <WineCardInner wine={wine} />
            </motion.div>
          </AnimatePresence>

          {/* Tap ripple + 탭 해보세요 — ripple 바로 위에 텍스트 */}
          <AnimatePresence>
            {!hasClicked && (
              <motion.div
                key="tap-ripple"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                style={{
                  position: 'absolute', bottom: 16, right: 16,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  pointerEvents: 'none',
                }}
              >
                <span style={{ fontSize: 10, color: 'var(--overlay-strong)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  탭 해보세요
                </span>
                <div style={{ position: 'relative', width: 38, height: 38 }}>
                  <motion.div
                    animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
                    transition={{ duration: 1.3, repeat: Infinity, ease: 'easeOut' }}
                    style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--overlay-strong)' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'var(--overlay-medium)',
                    border: '1.5px solid var(--overlay-strong)',
                  }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Dots active={activeIdx} onDotClick={setActiveIdx} />

    </div>
  );
}

// ── Panel 2: Label scan demo ───────────────────────────────────────────────
const FLAG_TAG = '__FLAG_FR__'; // 표시 시 CountryFlag(FR) + 'France'로 렌더
const WINE_TAGS = ['Château Margaux', '2019', 'Médoc AOC', 'Premier Grand Cru Classé', 'Cabernet Sauvignon', FLAG_TAG];

export function ScanPanel() {
  const [step, setStep] = useState(0);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const cycle = setInterval(() => {
      setScanning(true);
      setStep(0);
      let s = 0;
      const reveal = setInterval(() => {
        s += 1;
        setStep(s);
        if (s >= WINE_TAGS.length) {
          clearInterval(reveal);
          setTimeout(() => setScanning(false), 1200);
        }
      }, 350);
    }, 4500);
    // start immediately
    setScanning(true);
    let s = 0;
    const reveal = setInterval(() => {
      s += 1;
      setStep(s);
      if (s >= WINE_TAGS.length) clearInterval(reveal);
    }, 350);
    return () => clearInterval(cycle);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Wine label card — mode-invariant cream paper with dark ink, matching the
          physical wine-label feel in both themes. Previously used --color-text-primary
          for the gradient base which flipped to dark brown in light mode and read as
          a muddy panel; the paper token (#F5F0E8) keeps it consistent. */}
      <div style={{
        width: 160, height: 220,
        background: 'linear-gradient(160deg, var(--color-paper) 0%, #E8DDD0 100%)',
        borderRadius: 8,
        padding: '12px 16px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        flexShrink: 0,
      }}>
        {/* Label content */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.15em', color: '#6B3040', fontWeight: 700, textTransform: 'uppercase' }}>
            Grand Cru Classé
          </div>
          <div style={{ fontSize: 15, fontFamily: 'Georgia, serif', color: '#1A0810', fontWeight: 700, marginTop: 6, lineHeight: 1.2 }}>
            Château<br />Margaux
          </div>
          <div style={{ width: 56, height: 1, background: 'var(--color-wine-red)', margin: '8px auto' }} />
          <div style={{ fontSize: 22, color: 'var(--color-wine-red)', fontFamily: 'Georgia, serif', fontWeight: 700 }}>
            2019
          </div>
          <div style={{ fontSize: 8, color: '#6B3040', marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Margaux · Bordeaux
          </div>
          <div style={{
            width: 48, height: 56, margin: '10px auto 0',
            background: 'linear-gradient(135deg, var(--color-wine-red) 0%, #C41E3A 50%, var(--color-wine-red) 100%)',
            borderRadius: '50% 50% 40% 40%',
            opacity: 0.13,
          }} />
        </div>

        {/* Scan line */}
        {scanning && (
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent 0%, var(--color-gold) 30%, #FFF 50%, var(--color-gold) 70%, transparent 100%)',
            animation: 'scanLine 1.8s ease-in-out',
            animationFillMode: 'forwards',
            boxShadow: '0 0 8px rgba(201,168,76,0.8)',
          }} />
        )}
      </div>

      {/* Revealed wine info tags — all rendered, opacity-only reveal to prevent layout shift */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', alignItems: 'flex-start', alignContent: 'flex-start' }}>
        {WINE_TAGS.map((tag, i) => {
          const isWineName = tag === 'Château Margaux';
          const isFlag = tag === FLAG_TAG;
          const isClassification = tag === 'Premier Grand Cru Classé';
          return (
          <span
            key={tag}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              background: isWineName ? 'rgba(196,30,58,0.2)' : isClassification ? 'rgba(201,168,76,0.18)' : isFlag ? 'rgba(201,168,76,0.15)' : 'var(--color-border-soft)',
              border: `1px solid ${isWineName ? 'rgba(196,30,58,0.4)' : isClassification ? 'rgba(201,168,76,0.5)' : isFlag ? 'rgba(201,168,76,0.3)' : 'var(--overlay-medium)'}`,
              color: isWineName ? '#E06070' : isClassification ? 'var(--color-gold)' : isFlag ? 'var(--color-gold)' : 'var(--color-text-secondary)',
              fontSize: isClassification ? 11 : 12,
              fontWeight: isClassification ? 600 : 500,
              letterSpacing: isClassification ? '0.02em' : undefined,
              opacity: i < step ? 1 : 0,
              transition: 'opacity 0.3s ease',
              display: isFlag ? 'inline-flex' : undefined,
              alignItems: isFlag ? 'center' : undefined,
              gap: isFlag ? 6 : undefined,
            }}
          >
            {isFlag ? (
              <>
                <CountryFlag code="FR" size={12} />
                <span>France</span>
              </>
            ) : tag}
          </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
const PANELS = [
  {
    num: '01',
    title: '한 잔 한 잔, 다 다르게',
    sub: '와인 한 병의 디테일까지\n오롯이 기억됩니다',
    content: 'region',
  },
];

export default function FeaturesSection() {
  const shouldReduceMotion = useReducedMotion();
  const { messages } = useLocale();
  const [activePanel, setActivePanel] = useState<number | null>(null);

  return (
    <section
      style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(196,30,58,0.08) 0%, transparent 58%), var(--color-bg-deepest)', padding: 'clamp(80px,10vw,120px) 24px', overflow: 'hidden' }}
    >
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(28px,4vw,40px)',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
            }}
          >
            {messages.features?.sectionHeading ?? 'WineMine이 특별한 이유'}
          </h2>
          <div style={{ width: 60, height: 2, background: 'var(--color-gold)', margin: '20px auto 0' }} />
        </motion.div>

        {/* 3 Panels */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 2,
          }}
        >
          {PANELS.map((panel, i) => {
            const panelMsg = messages.features?.panels?.[i];
            return (
            <motion.div
              key={panel.num}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              viewport={{ once: true }}
              onMouseEnter={() => setActivePanel(i)}
              onMouseLeave={() => setActivePanel(null)}
              style={{
                position: 'relative',
                background: activePanel === i ? 'rgba(196,30,58,0.04)' : 'var(--overlay-soft)',
                border: `1px solid ${activePanel === i ? 'rgba(196,30,58,0.2)' : 'var(--color-border-soft)'}`,
                borderRadius: 16,
                padding: '40px 32px',
                transition: 'background 350ms ease, border-color 350ms ease',
                cursor: 'default',
                overflow: 'hidden',
              }}
            >
              {/* Decorative number */}
              <div
                style={{
                  position: 'absolute',
                  top: -10,
                  right: 24,
                  fontFamily: 'Georgia, serif',
                  fontSize: 96,
                  fontWeight: 400,
                  color: activePanel === i ? 'rgba(196,30,58,0.08)' : 'var(--overlay-soft)',
                  lineHeight: 1,
                  transition: 'color 350ms ease',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              >
                {panel.num}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: 22,
                  fontWeight: 400,
                  color: 'var(--color-text-primary)',
                  marginBottom: 10,
                  position: 'relative',
                }}
              >
                {panelMsg?.title ?? panel.title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                  marginBottom: 32,
                  position: 'relative',
                }}
              >
                {panelMsg?.sub ?? panel.sub}
              </p>

              {/* Interactive content */}
              <div style={{ position: 'relative' }}>
                <GlassCardStack />
              </div>
            </motion.div>
          ); })}
        </div>
      </div>
    </section>
  );
}
