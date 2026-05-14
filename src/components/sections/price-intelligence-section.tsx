'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocale } from '@/components/providers/locale-provider';

// Mock 12개월 가격 추이
const PRICE_DATA = [
  { m: 'M1',  price: 890 },
  { m: 'M2',  price: 920 },
  { m: 'M3',  price: 905 },
  { m: 'M4',  price: 945 },
  { m: 'M5',  price: 1020 },
  { m: 'M6',  price: 1075 },
  { m: 'M7',  price: 1060 },
  { m: 'M8',  price: 1110 },
  { m: 'M9',  price: 1155 },
  { m: 'M10', price: 1190 },
  { m: 'M11', price: 1215 },
  { m: 'M12', price: 1240 },
];

type TooltipPayload = { value: number; payload: { m: string } }[];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  return (
    <div
      style={{
        background: '#0F0718',
        border: '1px solid rgba(201,168,76,0.45)',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12,
        color: '#F5F0E8',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
      }}
    >
      <div style={{ color: '#9B8B7A', fontSize: 10, marginBottom: 2, letterSpacing: '0.08em' }}>{p.payload.m}</div>
      <div style={{ color: '#C9A84C', fontWeight: 600 }}>₩{(p.value * 1000).toLocaleString()}</div>
    </div>
  );
}

type ExternalRatingItem = { label: string; value: string; suffix: string };

function RatingPill({ label, value, suffix }: ExternalRatingItem) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10,
      }}
    >
      <span style={{ fontSize: 12, color: '#9B8B7A' }}>{label}</span>
      <span style={{ fontSize: 13, color: '#F5F0E8', fontWeight: 600 }}>
        {value}
        <span style={{ color: '#C9A84C', marginLeft: 4, fontSize: 11 }}>{suffix}</span>
      </span>
    </div>
  );
}

export default function PriceIntelligenceSection() {
  const shouldReduceMotion = useReducedMotion();
  const { messages } = useLocale();
  const pi = messages.priceIntelligence;

  const ratings: ExternalRatingItem[] = [
    { label: pi?.externalRatings?.vivino ?? 'Vivino', value: '4.5', suffix: '/ 5 ★' },
    { label: pi?.externalRatings?.wineSearcher ?? 'Wine Searcher', value: '92', suffix: '/ 100' },
    { label: pi?.externalRatings?.cellarTracker ?? 'CellarTracker', value: '91', suffix: '/ 100' },
  ];

  return (
    <section
      style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 58%), #05020A',
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
            {pi?.sectionLabel}
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(26px,4vw,40px)',
              fontWeight: 400,
              color: '#F5F0E8',
              lineHeight: 1.25,
            }}
          >
            {pi?.heading}
          </h2>
          <div style={{ width: 60, height: 2, background: '#C9A84C', margin: '20px auto 18px' }} />
          <p style={{ fontSize: 15, color: '#9B8B7A', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            {pi?.subheading}
          </p>
        </motion.div>

        {/* Grid: chart 2/3 + right column 1/3 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: 20,
          }}
          className="price-intel-grid"
        >
          {/* Chart card */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-40px' }}
            style={{
              background: '#1A0A1E',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 16,
              padding: 'clamp(20px, 3vw, 32px)',
              minWidth: 0,
            }}
          >
            <div style={{ marginBottom: 4 }}>
              <div
                style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: 18,
                  color: '#F5F0E8',
                  marginBottom: 6,
                }}
              >
                {pi?.wineLabel}
              </div>
              <div style={{ fontSize: 14, color: '#C9A84C', fontWeight: 600 }}>{pi?.priceRange}</div>
              <div style={{ fontSize: 11, color: '#6A5E4A', marginTop: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {pi?.chartLabel}
              </div>
            </div>

            <div style={{ width: '100%', height: 260, marginTop: 16 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PRICE_DATA} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(201,168,76,0.10)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="m"
                    stroke="#6A5E4A"
                    tick={{ fontSize: 10, fill: '#6A5E4A' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#6A5E4A"
                    tick={{ fontSize: 10, fill: '#6A5E4A' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    tickLine={false}
                    tickFormatter={(v: number) => `${v}k`}
                    width={42}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(201,168,76,0.3)', strokeWidth: 1 }} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#C9A84C"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#C9A84C', stroke: '#0F0718', strokeWidth: 1.5 }}
                    activeDot={{ r: 5, fill: '#C9A84C', stroke: '#F5F0E8', strokeWidth: 1.5 }}
                    isAnimationActive={!shouldReduceMotion}
                    animationDuration={900}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
            {/* External Ratings */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true, margin: '-40px' }}
              style={{
                background: '#1A0A1E',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                {pi?.externalRatings?.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ratings.map(r => (
                  <RatingPill key={r.label} {...r} />
                ))}
              </div>
            </motion.div>

            {/* Store rows */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              viewport={{ once: true, margin: '-40px' }}
              style={{
                background: '#1A0A1E',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                {pi?.stores?.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(pi?.storeRows ?? []).map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: i < (pi?.storeRows?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <span style={{ fontSize: 12, color: '#F5F0E8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.name}
                      </span>
                      <span style={{ fontSize: 10, color: '#6A5E4A' }}>
                        {pi?.stores?.updated} · {row.updated}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, color: '#C9A84C', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 8 }}>
                      {row.price}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* XP hint */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          viewport={{ once: true }}
          style={{
            marginTop: 24,
            padding: '14px 22px',
            border: '1px solid rgba(201,168,76,0.45)',
            background: 'rgba(201,168,76,0.05)',
            borderRadius: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            color: '#C9A84C',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.02em',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
          className="price-xp-hint"
        >
          <span aria-hidden style={{ fontSize: 16 }}>✨</span>
          {pi?.xpHint}
        </motion.div>
      </div>

      <style jsx>{`
        @media (max-width: 880px) {
          .price-intel-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .price-xp-hint {
          display: flex !important;
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
        }
      `}</style>
    </section>
  );
}
