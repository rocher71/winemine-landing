'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Wine, Globe2, FileText, Trophy, Sparkles, Gem, Lock, type LucideIcon } from 'lucide-react';
import { useLocale } from '@/components/providers/locale-provider';

type LevelTier = { tier: string; name: string; color: string; req: string };
type BadgeItem = { name: string; owned: boolean };

const BADGE_ICONS: LucideIcon[] = [Wine, Globe2, FileText, Trophy, Sparkles, Gem];

function LevelProgressBar({ level, xp, toNext, progress }: { level: string; xp: string; toNext: string; progress: number }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: 16,
        padding: 'clamp(20px, 3vw, 28px)',
        maxWidth: 640,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(18px, 2.6vw, 22px)',
            color: 'var(--color-text-primary)',
          }}
        >
          {level}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--color-gold)',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          {xp}
        </div>
      </div>

      {/* Bar */}
      <div
        style={{
          position: 'relative',
          height: 12,
          background: 'var(--color-border-soft)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${progress * 100}%` }}
          transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true, margin: '-40px' }}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            background: 'linear-gradient(90deg, #B08D57 0%, var(--color-gold) 50%, #E8C97A 100%)',
            borderRadius: 999,
            boxShadow: '0 0 16px rgba(201,168,76,0.5), inset 0 0 6px var(--overlay-medium)',
          }}
        />
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 12,
          color: 'var(--color-text-muted)',
          textAlign: 'right',
        }}
      >
        {toNext}
      </div>
    </div>
  );
}

function LevelCard({ tier, isCurrent }: { tier: LevelTier; isCurrent: boolean }) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--color-bg-surface)',
        border: isCurrent ? `1px solid ${tier.color}` : '1px solid var(--color-border-soft)',
        borderRadius: 14,
        padding: '18px 14px',
        textAlign: 'center',
        boxShadow: isCurrent ? `0 0 0 1px ${tier.color}66, 0 8px 24px rgba(0,0,0,0.4)` : undefined,
        minHeight: 130,
      }}
    >
      <div
        aria-hidden
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${tier.color}55 0%, ${tier.color}22 100%)`,
          border: `1.5px solid ${tier.color}`,
          margin: '0 auto 10px',
        }}
      />
      <div
        style={{
          fontSize: 10,
          color: 'var(--color-gold)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        {tier.tier}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontSize: 16,
          color: 'var(--color-text-primary)',
          marginBottom: 6,
        }}
      >
        {tier.name}
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{tier.req}</div>

      {isCurrent && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            fontSize: 9,
            padding: '2px 6px',
            borderRadius: 4,
            background: 'var(--color-gold)',
            color: 'var(--color-bg-deepest)',
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}
        >
          NOW
        </div>
      )}
    </div>
  );
}

function BadgeTile({ badge, index }: { badge: BadgeItem; index: number }) {
  const Icon = BADGE_ICONS[index] ?? Wine;
  const iconColor = badge.owned ? 'var(--color-gold)' : 'var(--color-text-muted)';
  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '1 / 1',
        background: badge.owned ? 'rgba(201,168,76,0.08)' : 'var(--overlay-soft)',
        border: badge.owned ? '1px solid rgba(201,168,76,0.40)' : '1px solid var(--color-border-soft)',
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        opacity: badge.owned ? 1 : 0.55,
      }}
    >
      <div className="badge-icon" style={{ marginBottom: 8, display: 'flex' }} aria-hidden>
        <Icon className="badge-icon-svg" color={iconColor} strokeWidth={1.6} />
      </div>
      <div
        className="badge-name"
        style={{
          color: badge.owned ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
          textAlign: 'center',
          lineHeight: 1.3,
          fontWeight: 500,
        }}
      >
        {badge.name}
      </div>

      {!badge.owned && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            display: 'flex',
          }}
        >
          <Lock size={11} color="var(--color-text-muted)" strokeWidth={2} />
        </div>
      )}
    </div>
  );
}

export default function LevelBadgeSection() {
  const shouldReduceMotion = useReducedMotion();
  const { messages } = useLocale();
  const lb = messages.levelBadge;
  const catalog: LevelTier[] = (lb?.catalog as LevelTier[]) ?? [];
  const badges: BadgeItem[] = (lb?.badges as BadgeItem[]) ?? [];
  const currentTier = lb?.currentTier ?? 'Lv.3';

  return (
    <section
      style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 58%), var(--color-bg-deep)',
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
              color: 'var(--color-gold)',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            {lb?.sectionLabel}
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(26px,4vw,40px)',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              maxWidth: 720,
              margin: '0 auto',
              lineHeight: 1.25,
            }}
          >
            {lb?.heading}
          </h2>
          <div style={{ width: 60, height: 2, background: 'var(--color-gold)', margin: '20px auto 18px' }} />
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            {lb?.subheading}
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ marginBottom: 48 }}
        >
          <LevelProgressBar
            level={lb?.current?.level ?? ''}
            xp={lb?.current?.xp ?? ''}
            toNext={lb?.current?.toNext ?? ''}
            progress={1240 / 2000}
          />
        </motion.div>

        {/* Level catalog */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="level-catalog"
          style={{ marginBottom: 56 }}
        >
          {catalog.map((tier, i) => (
            <motion.div
              key={tier.tier}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              viewport={{ once: true, margin: '-40px' }}
              className={i === catalog.length - 1 ? 'level-card-wrap level-card-top' : 'level-card-wrap'}
            >
              <LevelCard tier={tier} isCurrent={tier.tier === currentTier} />
            </motion.div>
          ))}
        </motion.div>

        {/* Badge showcase */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-soft)',
            borderRadius: 16,
            padding: 'clamp(20px, 3vw, 28px)',
            maxWidth: 640,
            margin: '0 auto 56px',
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--color-gold)',
              fontWeight: 600,
              marginBottom: 18,
              textAlign: 'center',
            }}
          >
            Badge Cabinet
          </div>
          <div className="badge-grid">
            {badges.map((b, i) => (
              <motion.div
                key={i}
                initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <BadgeTile badge={b} index={i} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bullets */}
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
            borderTop: '1px solid var(--color-border-soft)',
          }}
        >
          {(lb?.bullets ?? []).map((b, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '8px 12px' }}>
              <div style={{ fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: 6 }}>{b.title}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{b.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        /* Level catalog grid — PC: auto-fit 5열, 모바일: 2열 + 마지막 카드 가로 폭 강조 */
        .level-catalog {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }
        @media (max-width: 640px) {
          .level-catalog {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .level-card-top {
            grid-column: 1 / -1;
          }
        }

        /* Badge grid */
        .badge-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .badge-icon :global(.badge-icon-svg) {
          width: 28px;
          height: 28px;
        }
        .badge-name {
          font-size: 11px;
        }
        @media (max-width: 640px) {
          .badge-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
          .badge-icon :global(.badge-icon-svg) {
            width: 36px;
            height: 36px;
          }
          .badge-icon {
            margin-bottom: 10px !important;
          }
          .badge-name {
            font-size: 13px;
          }
        }
      `}</style>
    </section>
  );
}
