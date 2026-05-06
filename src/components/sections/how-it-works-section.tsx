'use client';

import { motion } from 'framer-motion';

const STEPS = [
  {
    num: '01',
    title: '라벨을 찍는다',
    body: '레스토랑, 와인 바, 집. 언제 어디서든 마시는 와인 라벨을 카메라로 찍는다.',
    detail: '2초 안에 인식',
  },
  {
    num: '02',
    title: '지도에 새겨진다',
    body: '원산지가 자동으로 파악되어 세계 지도 위에 기록된다. 마실수록 지도가 물든다.',
    detail: '프랑스 → 보르도 → 포므롤',
  },
  {
    num: '03',
    title: '지역을 파고든다',
    body: '국가를 탭하면 세부 지역으로 확대된다. 내가 탐험한 아펠라시옹이 한눈에 보인다.',
    detail: '드릴다운 지도 탐색',
  },
  {
    num: '04',
    title: '한 컷에 담는다',
    body: '내 와인 여정을 아름다운 Recap 이미지로 저장한다. 탭 한 번이면 공유 완료.',
    detail: 'Recap 이미지 생성',
  },
];

export default function HowItWorksSection() {
  return (
    <section style={{ background: 'var(--color-parchment)', padding: 'clamp(48px,8vw,80px) 24px' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          style={{ marginBottom: 'clamp(40px,6vw,64px)' }}
        >
          <p style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-action)',
            marginBottom: 12,
          }}>
            How It Works
          </p>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 600,
            color: 'var(--color-ink)',
            letterSpacing: '-0.374px',
            lineHeight: 1.1,
          }}>
            이렇게 사용해요
          </h2>
        </motion.div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true, margin: '-40px' }}
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr',
                gap: 'clamp(16px,3vw,28px)',
                alignItems: 'start',
                padding: 'clamp(24px,4vw,32px) 0',
                borderBottom: i < STEPS.length - 1 ? '1px solid var(--color-hairline)' : 'none',
              }}
            >
              {/* Step number */}
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-action)',
                letterSpacing: '0.08em',
                paddingTop: 4,
              }}>
                {step.num}
              </div>

              {/* Content */}
              <div>
                <h3 style={{
                  fontSize: 'clamp(17px, 2vw, 21px)',
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  letterSpacing: '-0.374px',
                  lineHeight: 1.19,
                  marginBottom: 10,
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: 17,
                  color: 'var(--color-ink-muted)',
                  lineHeight: 1.47,
                  letterSpacing: '-0.374px',
                  marginBottom: 14,
                  maxWidth: 600,
                }}>
                  {step.body}
                </p>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 14px',
                  borderRadius: 9999,
                  background: 'rgba(139,26,42,0.06)',
                  border: '1px solid rgba(139,26,42,0.15)',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--color-action)',
                  letterSpacing: '-0.12px',
                }}>
                  {step.detail}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
