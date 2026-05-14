'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useLocale } from '@/components/providers/locale-provider';

// 단순화된 남한 본토 SVG path (viewBox 0 0 200 280)
const KR_MAINLAND_PATH =
  'M 70 50 Q 100 44 130 48 Q 148 52 158 64 Q 168 80 168 100 Q 168 122 160 142 Q 156 162 154 178 Q 150 198 138 212 Q 122 226 102 230 Q 84 230 70 220 Q 56 208 50 192 Q 42 172 46 152 Q 40 132 46 112 Q 50 90 58 72 Q 62 60 70 50 Z';
// 제주도 ellipse 좌표
const JEJU = { cx: 78, cy: 258, rx: 14, ry: 7 };

// 좌표는 viewBox 0 0 200 280 기준 — 도시별 라벨 오프셋 포함
type RegionDot = { x: number; y: number; key: string; labelX: number; labelY: number; anchor: 'start' | 'end' | 'middle' };
const REGION_DOTS: RegionDot[] = [
  { x: 90,  y: 78,  key: 'seoul',   labelX: 78,  labelY: 72,  anchor: 'end'    }, // 서울 (북서)
  { x: 135, y: 88,  key: 'gangwon', labelX: 148, labelY: 84,  anchor: 'start'  }, // 강원 (북동)
  { x: 140, y: 188, key: 'busan',   labelX: 153, labelY: 192, anchor: 'start'  }, // 부산 (남동)
  { x: 92,  y: 208, key: 'yeosu',   labelX: 80,  labelY: 215, anchor: 'end'    }, // 여수 (남서)
  { x: 78,  y: 258, key: 'jeju',    labelX: 78,  labelY: 274, anchor: 'middle' }, // 제주 (섬)
];

type FeedItem = { name: string; level: string; wine: string; place: string; time: string; mood: string };

function FeedCard({ item, index }: { item: FeedItem; index: number }) {
  // 닉네임 첫 글자로 아바타 색상 결정
  const palette = ['#8B1A2A', '#C9A84C', '#5B4880', '#A05D2A'];
  const bg = palette[index % palette.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay: index * 0.12 }}
      viewport={{ once: true, margin: '-40px' }}
      style={{
        display: 'flex',
        gap: 14,
        padding: 16,
        background: 'rgba(15,7,24,0.72)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
      }}
    >
      {/* avatar */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: bg,
          color: '#F5F0E8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 14,
          flexShrink: 0,
        }}
        aria-hidden
      >
        {item.name.slice(0, 1)}
      </div>
      {/* content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
          <span style={{ fontSize: 13, color: '#F5F0E8', fontWeight: 600 }}>{item.name}</span>
          <span
            style={{
              fontSize: 9,
              padding: '2px 6px',
              borderRadius: 4,
              background: 'rgba(201,168,76,0.14)',
              color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.35)',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            {item.level}
          </span>
          <span style={{ fontSize: 11, color: '#6A5E4A', marginLeft: 'auto' }}>{item.time}</span>
        </div>
        <div style={{ fontSize: 13, color: '#D4C5B0', marginBottom: 4 }}>
          {item.wine}
          <span style={{ color: '#6A5E4A' }}> · {item.place}</span>
        </div>
        <div style={{ fontSize: 12, color: '#9B8B7A', fontStyle: 'italic', lineHeight: 1.5 }}>
          &ldquo;{item.mood}&rdquo;
        </div>
      </div>
    </motion.div>
  );
}

export default function CommunityTonightSection() {
  const shouldReduceMotion = useReducedMotion();
  const { messages } = useLocale();
  const ct = messages.communityTonight;
  const regions: string[] = (ct?.regions as string[]) ?? [];
  const feed: FeedItem[] = (ct?.feedItems as FeedItem[]) ?? [];

  return (
    <section
      style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(196,30,58,0.08) 0%, transparent 58%), #05020A',
        padding: 'clamp(80px,10vw,112px) 24px',
      }}
    >
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vw,64px)' }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.28em',
              color: '#C9A84C',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            {ct?.sectionLabel}
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(26px,4vw,40px)',
              fontWeight: 400,
              color: '#F5F0E8',
              maxWidth: 720,
              margin: '0 auto',
              lineHeight: 1.25,
            }}
          >
            {ct?.heading}
          </h2>
          <div style={{ width: 60, height: 2, background: '#C9A84C', margin: '20px auto 18px' }} />
          <p style={{ fontSize: 15, color: '#9B8B7A', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            {ct?.subheading}
          </p>
        </motion.div>

        {/* Grid: map + feed */}
        <div
          className="community-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
            gap: 28,
            alignItems: 'start',
          }}
        >
          {/* Map */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-40px' }}
            style={{
              background: '#1A0A1E',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 16,
              padding: 24,
              position: 'relative',
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              {ct?.mapLabel}
            </div>

            <div style={{ width: '100%', position: 'relative' }}>
              <svg viewBox="0 0 200 290" width="100%" style={{ display: 'block', maxHeight: 380 }} aria-hidden>
                {/* 본토 */}
                <path d={KR_MAINLAND_PATH} fill="#2D1540" stroke="rgba(201,168,76,0.22)" strokeWidth={1.4} />
                {/* 제주도 */}
                <ellipse cx={JEJU.cx} cy={JEJU.cy} rx={JEJU.rx} ry={JEJU.ry} fill="#2D1540" stroke="rgba(201,168,76,0.22)" strokeWidth={1.2} />

                {REGION_DOTS.map((d, i) => (
                  <g key={d.key}>
                    {/* pulse ring */}
                    <motion.circle
                      cx={d.x}
                      cy={d.y}
                      r={7}
                      fill="#C9A84C"
                      opacity={0.35}
                      animate={shouldReduceMotion ? undefined : { r: [7, 16, 7], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                    />
                    {/* center dot */}
                    <circle cx={d.x} cy={d.y} r={5.5} fill="#C9A84C" stroke="#0F0718" strokeWidth={1.2} />
                    {/* inline label */}
                    <text
                      x={d.labelX}
                      y={d.labelY}
                      fill="#F5F0E8"
                      fontSize="13"
                      fontWeight={600}
                      textAnchor={d.anchor}
                      style={{ paintOrder: 'stroke', stroke: '#05020A', strokeWidth: 3, strokeLinejoin: 'round' }}
                    >
                      {regions[i] ?? d.key}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </motion.div>

          {/* Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
            {feed.map((f, i) => (
              <FeedCard key={i} item={f} index={i} />
            ))}
          </div>
        </div>

        {/* Outro + bullets */}
        <motion.p
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          style={{
            textAlign: 'center',
            fontSize: 14,
            color: '#9B8B7A',
            lineHeight: 1.7,
            maxWidth: 640,
            margin: '40px auto 32px',
          }}
        >
          {ct?.outro}
        </motion.p>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          viewport={{ once: true }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {(ct?.bullets ?? []).map((b, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '8px 12px' }}>
              <div style={{ fontSize: 14, color: '#F5F0E8', fontWeight: 600, marginBottom: 6 }}>{b.title}</div>
              <div style={{ fontSize: 12, color: '#9B8B7A', lineHeight: 1.6 }}>{b.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        @media (max-width: 880px) {
          .community-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
