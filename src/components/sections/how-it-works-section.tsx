'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  {
    num: '01',
    title: '라벨을 찍는다',
    body: '레스토랑, 와인 바, 집. 언제 어디서든 마시는 와인 라벨을 카메라로 찍는다.',
    detail: '2초 안에 인식',
    icon: '📸',
    color: '#C41E3A',
  },
  {
    num: '02',
    title: '지도에 새겨진다',
    body: '원산지가 자동으로 파악되어 세계 지도 위에 기록된다. 마실수록 지도가 물든다.',
    detail: '프랑스 → 보르도 → 포므롤',
    icon: '🗺',
    color: '#8B5CF6',
  },
  {
    num: '03',
    title: '지역을 파고든다',
    body: '국가를 탭하면 세부 지역으로 확대된다. 내가 탐험한 아펠라시옹이 한눈에 보인다.',
    detail: '드릴다운 지도 탐색',
    icon: '🔍',
    color: '#C9A84C',
  },
  {
    num: '04',
    title: '한 컷에 담는다',
    body: '내 와인 지도를 인스타그램 스토리 비율로 저장한다. 탭 한 번이면 공유 완료.',
    detail: '9:16 Recap 생성',
    icon: '✦',
    color: '#E8C97A',
  },
];

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={ref}
      style={{ background: '#0A050F', padding: 'clamp(80px,10vw,120px) 24px' }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <div style={{ fontSize: 10, letterSpacing: '0.28em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: 14 }}>
            How It Works
          </div>
          <h2 style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(26px,4vw,40px)',
            fontWeight: 400,
            color: '#F5F0E8',
          }}>
            이렇게 사용해요
          </h2>
          <div style={{ width: 60, height: 2, background: '#C9A84C', margin: '20px auto 0' }} />
        </motion.div>

        {/* Steps — alternating left/right on desktop, single column on mobile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: i % 2 === 0 ? -48 : 48 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true, margin: '-60px' }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'clamp(20px, 4vw, 48px)',
                padding: 'clamp(28px, 5vw, 48px) 0',
                borderBottom: i < STEPS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              {/* Number column */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
                width: 'clamp(50px, 8vw, 80px)',
              }}>
                <div style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(40px, 6vw, 72px)',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.04)',
                  lineHeight: 1,
                  userSelect: 'none',
                }}>
                  {step.num}
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingTop: 6 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: `${step.color}18`,
                  border: `1px solid ${step.color}40`,
                  fontSize: 18,
                  marginBottom: 14,
                }}>
                  {step.icon}
                </div>

                <h3 style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: 'clamp(18px, 2.8vw, 26px)',
                  fontWeight: 400,
                  color: '#F5F0E8',
                  marginBottom: 10,
                  lineHeight: 1.2,
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: 'clamp(13px, 1.4vw, 15px)',
                  color: '#9B8B7A',
                  lineHeight: 1.75,
                  maxWidth: 480,
                  marginBottom: 14,
                }}>
                  {step.body}
                </p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 14px',
                  borderRadius: 20,
                  background: `${step.color}12`,
                  border: `1px solid ${step.color}30`,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: step.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: step.color, fontWeight: 600, letterSpacing: '0.03em' }}>
                    {step.detail}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
