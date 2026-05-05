'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const STATS = [
  { value: 487558, suffix: '㎘', label: '2025 수입량', sub: '전년比 +5.27%', color: '#E8253E' },
  { value: 409,    suffix: 'M$', label: '수입 금액',   sub: '4.09억 달러',   color: '#C9A84C' },
  { value: 10,     suffix: '%↑', label: '화이트 성장', sub: '유일한 두 자릿수', color: '#C9A84C' },
  { value: 22.54,  suffix: '%',  label: '칠레 점유율', sub: '수입량 기준 1위', color: '#E8253E' },
];

function AnimatedNumber({ target, suffix, isDecimal }: { target: number; suffix: string; isDecimal?: boolean }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const duration = 1800;
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          setValue(target * ease);
          if (t < 1) requestAnimationFrame(tick);
          else setValue(target);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [target]);

  const display = isDecimal
    ? value.toFixed(2)
    : Math.floor(value).toLocaleString();

  return <span ref={ref}>{display}{suffix}</span>;
}

const TRENDS = [
  { icon: '⚡', title: '시장 양극화', desc: '1만원대 데일리 와인과 10만원+ 프리미엄이 동반 성장. 중간 가격대는 위축.' },
  { icon: '🥂', title: '화이트 와인 부상', desc: '전체 -7.5% 축소 속에서 화이트만 +10%. 뉴질랜드 소비뇽 블랑 견인.' },
  { icon: '📱', title: 'MZ세대 일상화', desc: '홈술·혼술·SNS 페어링 콘텐츠. 와인을 특별한 날이 아닌 일상으로.' },
  { icon: '🏪', title: '편의점 채널 폭발', desc: 'GS25·CU에서 1~2만원 데일리 와인이 주도. 두 자릿수 신장 지속.' },
];

export default function MarketStatsSection() {
  return (
    <section style={{ background: '#070210', padding: 'clamp(72px,9vw,120px) 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vw,72px)' }}
        >
          <div style={{ fontSize: 10, letterSpacing: '0.28em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 14 }}>
            Korea Wine Market 2025
          </div>
          <h2 style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(24px,3.8vw,40px)',
            fontWeight: 400, color: '#F5F0E8', lineHeight: 1.2,
          }}>
            지금 한국 와인 시장은
          </h2>
          <div style={{ width: 60, height: 2, background: '#C9A84C', margin: '18px auto 0' }} />
          <p style={{ fontSize: 'clamp(13px,1.4vw,16px)', color: '#9B8B7A', marginTop: 16, maxWidth: 480, margin: '16px auto 0', lineHeight: 1.7 }}>
            487,558㎘ — 이 수많은 와인들, 어디서 왔고 어떤 맛인지<br />
            기억하고 있나요? WineMine이 도와드립니다.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'clamp(12px,2vw,24px)',
          marginBottom: 'clamp(40px,6vw,72px)',
        }}>
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              style={{
                padding: 'clamp(18px,3vw,28px) clamp(16px,2vw,24px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.025)',
                textAlign: 'center',
                transition: 'border-color 300ms, transform 300ms',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.3)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: 'clamp(26px,4vw,40px)',
                fontWeight: 400,
                color: s.color,
                lineHeight: 1,
                marginBottom: 8,
                fontVariantNumeric: 'tabular-nums',
              }}>
                <AnimatedNumber
                  target={s.value}
                  suffix={s.suffix}
                  isDecimal={s.value !== Math.floor(s.value)}
                />
              </div>
              <div style={{ fontSize: 'clamp(12px,1.2vw,15px)', fontWeight: 600, color: '#F5F0E8', marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 'clamp(10px,1vw,12px)', color: '#9B8B7A', letterSpacing: '0.04em' }}>
                {s.sub}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trends grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 'clamp(10px,1.5vw,18px)',
        }}>
          {TRENDS.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              viewport={{ once: true }}
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
                padding: 'clamp(14px,2vw,20px)',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 12,
                transition: 'border-color 300ms',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.2)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)'; }}
            >
              <div style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#F5F0E8', marginBottom: 6 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: '#9B8B7A', lineHeight: 1.7 }}>{t.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', fontSize: 11, color: '#4A3D56', marginTop: 'clamp(24px,3vw,40px)' }}
        >
          출처: 관세청 무역통계 · 매체 보도 종합 (2025)
        </motion.p>
      </div>
    </section>
  );
}
