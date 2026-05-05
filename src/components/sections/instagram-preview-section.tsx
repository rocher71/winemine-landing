'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// ── Story card content (example user data) ─────────────────────────────────
const STORY_COUNTRIES = [
  { flag: '🇫🇷', name: 'France',    wines: 28, pct: 92 },
  { flag: '🇮🇹', name: 'Italy',     wines: 21, pct: 70 },
  { flag: '🇨🇱', name: 'Chile',     wines: 18, pct: 58 },
  { flag: '🇳🇿', name: 'New Zealand', wines: 14, pct: 44 },
  { flag: '🇪🇸', name: 'Spain',     wines: 11, pct: 34 },
];

// Which cells in the 7×5 mini-map grid are "lit" (wine regions)
const LIT_CELLS = new Set([2, 3, 8, 9, 12, 14, 18, 19, 20, 22, 24, 26, 27, 30, 32]);

// ── Story Card (9:16 ratio) ────────────────────────────────────────────────
function StoryCard({ animate }: { animate: boolean }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(170deg, #060115 0%, #120828 40%, #060115 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px 16px',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background grain texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />

      {/* Top: logo + progress bar (Instagram-style) */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          height: 2, background: 'rgba(255,255,255,0.15)', borderRadius: 1, marginBottom: 10
        }}>
          <div style={{
            height: '100%', width: animate ? '65%' : '0%',
            background: '#F5F0E8', borderRadius: 1,
            transition: 'width 1.2s ease 0.4s',
          }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B1A2A, #C9A84C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#F5F0E8',
            flexShrink: 0,
          }}>W</div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#F5F0E8' }}>winemine</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>지금</span>
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{
          fontSize: 9, letterSpacing: '0.25em', color: '#C9A84C',
          textTransform: 'uppercase', marginBottom: 4,
        }}>
          My Wine Journey
        </div>
        <div style={{
          fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400,
          color: '#F5F0E8', lineHeight: 1.1, letterSpacing: '-0.01em',
        }}>
          2025<br />Recap
        </div>
        <div style={{ width: 30, height: 1, background: '#C9A84C', margin: '8px auto 0' }} />
      </div>

      {/* Mini world map grid */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 2.5,
          padding: '8px 4px',
          background: 'rgba(255,255,255,0.025)',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              style={{
                aspectRatio: '1',
                borderRadius: 2,
                background: LIT_CELLS.has(i)
                  ? `rgba(196,30,58,${0.45 + (i % 3) * 0.18})`
                  : 'rgba(30,8,53,0.8)',
                transition: animate ? `background 600ms ease ${i * 15}ms` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 8, padding: '10px 8px', marginBottom: 14,
      }}>
        {[['82', '병'], ['15', '국가'], ['7', '개월']].map(([n, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#F5F0E8', lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 9, color: '#9B8B7A', marginTop: 3, letterSpacing: '0.05em' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Country breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {STORY_COUNTRIES.map((c, i) => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>{c.flag}</span>
            <div style={{ flex: 1 }}>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: animate ? `${c.pct}%` : '0%',
                  background: `linear-gradient(90deg, rgba(196,30,58,0.7), rgba(196,30,58,0.9))`,
                  borderRadius: 2,
                  transition: `width 900ms cubic-bezier(0.4,0,0.2,1) ${300 + i * 80}ms`,
                }} />
              </div>
            </div>
            <span style={{ fontSize: 10, color: '#C9A84C', flexShrink: 0, minWidth: 20, textAlign: 'right' }}>
              {c.wines}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 14, paddingTop: 10,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: 'linear-gradient(135deg, #8B1A2A, #C9A84C)',
        }} />
        <span style={{
          fontFamily: 'Georgia, serif', fontSize: 11,
          color: '#C9A84C', letterSpacing: '0.08em',
        }}>WineMine</span>
        <span style={{ fontSize: 9, color: '#4A3D56', marginLeft: 4 }}>winemine.com</span>
      </div>
    </div>
  );
}

// ── Phone frame wrapper ────────────────────────────────────────────────────
function PhoneMockup({ children, scale = 1 }: { children: React.ReactNode; scale?: number }) {
  return (
    <div style={{
      width: 240 * scale,
      height: 520 * scale,
      background: '#0C0C0C',
      borderRadius: 40 * scale,
      padding: 8 * scale,
      boxShadow: `0 0 0 ${2 * scale}px #2A2A2A, 0 0 0 ${3 * scale}px #111, 0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(196,30,58,0.06)`,
      position: 'relative',
      flexShrink: 0,
    }}>
      {/* Notch */}
      <div style={{
        position: 'absolute',
        top: 12 * scale, left: '50%',
        transform: 'translateX(-50%)',
        width: 80 * scale, height: 22 * scale,
        background: '#0C0C0C',
        borderRadius: 12 * scale,
        zIndex: 10,
      }} />
      {/* Screen */}
      <div style={{
        width: '100%', height: '100%',
        borderRadius: 32 * scale,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {children}
      </div>
    </div>
  );
}

// ── Main section ───────────────────────────────────────────────────────────
export default function InstagramPreviewSection({ id }: { id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.25 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      style={{ background: '#0A050F', padding: 'clamp(80px,10vw,120px) 24px', overflow: 'hidden' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 16 }}>
            Share Your Journey
          </div>
          <h2 style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, color: '#F5F0E8', lineHeight: 1.2,
          }}>
            내 와인 지도를<br />인스타에 올리다
          </h2>
          <div style={{ width: 60, height: 2, background: '#C9A84C', margin: '20px auto 16px' }} />
          <p style={{ fontSize: 15, color: '#9B8B7A', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            기록이 쌓이면 자동으로 만들어지는 나만의 Recap.<br />
            스토리 비율 그대로, 탭 한 번이면 공유 끝.
          </p>
        </motion.div>

        {/* Content: phone mockup + feature list */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(32px, 6vw, 80px)',
          flexWrap: 'wrap',
        }}>
          {/* Phone */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: -40, rotate: -3 }}
            whileInView={{ opacity: 1, x: 0, rotate: -3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            viewport={{ once: true }}
            style={{ transform: 'rotate(-3deg)' }}
          >
            <PhoneMockup>
              <StoryCard animate={inView} />
            </PhoneMockup>
          </motion.div>

          {/* Feature list */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            viewport={{ once: true }}
            style={{ maxWidth: 380 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {[
                {
                  num: '1',
                  title: '자동 생성',
                  desc: '와인을 기록할 때마다 Recap이 업데이트된다. 따로 편집할 필요 없다.',
                },
                {
                  num: '2',
                  title: '9:16 비율 최적화',
                  desc: '인스타그램 스토리에 딱 맞는 비율로 바로 저장된다.',
                },
                {
                  num: '3',
                  title: '지역별 시각화',
                  desc: '내가 마신 와인의 원산지가 지도 위에 그대로 담긴다. 한눈에 내 취향이 보인다.',
                },
              ].map((item) => (
                <div key={item.num} style={{ display: 'flex', gap: 20 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(196,30,58,0.15)',
                    border: '1px solid rgba(196,30,58,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#E06070',
                    flexShrink: 0, marginTop: 2,
                  }}>
                    {item.num}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 16, fontWeight: 600, color: '#F5F0E8', marginBottom: 6,
                    }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 14, color: '#9B8B7A', lineHeight: 1.7 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
