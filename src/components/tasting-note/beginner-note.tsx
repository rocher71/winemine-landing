'use client';

// Beginner Note — 입문자용 단순화 모드
// WSET 5단계 -> 3단계, 어휘 200개 -> 8개 큰 카테고리, 카우달리·결함·자동묘사 X
// 리서치 출처: 사내 01·02·03_research.md + 한국 와인 매체(미슐랭/와인21/소믈리에타임즈) 권장 수준

import { useState, type ComponentType } from 'react';
import { useLocale } from '@/components/providers/locale-provider';
import type { FormVariant } from '@/lib/tasting-note-lexicon';
import {
  StrawberryIcon,
  LemonIcon,
  PeachIcon,
  RoseIcon,
  ChiliIcon,
  HoneyJarIcon,
  LeafIcon,
  BreadIcon,
  StarEyesFaceIcon,
  SmileFaceIcon,
  ThinkingFaceIcon,
  StopwatchIcon,
  ClockIcon,
  WineGlassRedIcon,
  StarFilledIcon,
  StarBurstIcon,
  LightbulbIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  type IconProps,
} from '@/components/icons/wine-icons';

type IconComponent = ComponentType<IconProps>;

const GOLD = 'var(--color-gold)';
const WINE_RED = 'var(--color-wine-red)';
const CREAM = 'var(--color-text-primary)';
const MUTED = 'var(--color-text-muted)';
const BORDER = 'var(--color-border)';
const SURFACE = 'var(--color-bg-surface)';

type Level = 'low' | 'mid' | 'high';
type Impression = 'love' | 'ok' | 'meh';
type FinishLevel = 'short' | 'medium' | 'long';

const AROMA_CARDS: { id: string; Icon: IconComponent; appliesTo: FormVariant[] }[] = [
  { id: 'berry',      Icon: StrawberryIcon, appliesTo: ['red', 'sparkling'] },
  { id: 'citrus',     Icon: LemonIcon,      appliesTo: ['white', 'sparkling'] },
  { id: 'stoneFruit', Icon: PeachIcon,      appliesTo: ['white', 'sparkling'] },
  { id: 'floral',     Icon: RoseIcon,       appliesTo: ['white', 'red', 'sparkling'] },
  { id: 'spice',      Icon: ChiliIcon,      appliesTo: ['red'] },
  { id: 'sweet',      Icon: HoneyJarIcon,   appliesTo: ['white', 'red', 'sparkling'] },
  { id: 'earth',      Icon: LeafIcon,       appliesTo: ['red'] },
  { id: 'yeast',      Icon: BreadIcon,      appliesTo: ['sparkling', 'white'] },
];

const AROMA_CARD_BY_ID: Record<string, IconComponent> = AROMA_CARDS.reduce((acc, c) => {
  acc[c.id] = c.Icon;
  return acc;
}, {} as Record<string, IconComponent>);

interface Props {
  variant: FormVariant; // 'blind'은 beginner에서 비활성
  wineName: string;
  producer: string;
}

export default function BeginnerNote({ variant, wineName, producer }: Props) {
  const { t } = useLocale();
  const [impression, setImpression] = useState<Impression | null>(null);
  const [sweetness, setSweetness] = useState<Level | null>(null);
  const [acidity, setAcidity] = useState<Level | null>(null);
  const [body, setBody] = useState<Level | null>(null);
  const [tannin, setTannin] = useState<Level | null>(null);
  const [bubbles, setBubbles] = useState<Level | null>(null);
  const [aromas, setAromas] = useState<string[]>([]);
  const [finish, setFinish] = useState<FinishLevel | null>(null);
  const [rating, setRating] = useState(0);
  const [memo, setMemo] = useState('');
  const [tipOpen, setTipOpen] = useState(false);

  const cardsForVariant = AROMA_CARDS.filter(c => c.appliesTo.includes(variant));

  function toggleAroma(id: string) {
    setAromas(a => (a.includes(id) ? a.filter(x => x !== id) : [...a, id]));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Intro */}
      <p
        style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.6,
          color: MUTED,
          textAlign: 'center',
          fontStyle: 'italic',
        }}
      >
        {t('tastingNote.beginner.intro')}
      </p>

      {/* Step 1 — Wine identity (정적 카드) */}
      <Card>
        <CardLabel>{t('tastingNote.beginner.step.wine')}</CardLabel>
        <h3
          style={{
            fontFamily: 'var(--font-playfair, Georgia, serif)',
            fontSize: 22,
            fontWeight: 700,
            color: CREAM,
            margin: '8px 0 6px',
            lineHeight: 1.3,
          }}
        >
          {wineName}
        </h3>
        <div style={{ fontSize: 13, color: MUTED, fontStyle: 'italic' }}>{producer}</div>
      </Card>

      {/* Step 2 — First impression (3 emojis) */}
      <Card>
        <CardLabel>{t('tastingNote.beginner.step.impression')}</CardLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
          {([
            { id: 'love', Icon: StarEyesFaceIcon },
            { id: 'ok',   Icon: SmileFaceIcon },
            { id: 'meh',  Icon: ThinkingFaceIcon },
          ] as { id: Impression; Icon: IconComponent }[]).map(opt => {
            const active = impression === opt.id;
            const Icon = opt.Icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setImpression(active ? null : opt.id)}
                style={{
                  padding: '20px 10px',
                  background: active ? 'rgba(201,168,76,0.18)' : SURFACE,
                  border: `2px solid ${active ? GOLD : BORDER}`,
                  borderRadius: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  alignItems: 'center',
                  transition: 'background 200ms ease, border-color 200ms ease, transform 200ms ease',
                  transform: active ? 'scale(1.03)' : 'scale(1)',
                  color: active ? GOLD : CREAM,
                }}
              >
                <span aria-hidden style={{ display: 'inline-flex' }}>
                  <Icon size={36} />
                </span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {t(`tastingNote.beginner.impression.${opt.id}`)}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Step 3 — Taste (3 levels) */}
      <Card>
        <CardLabel>{t('tastingNote.beginner.step.taste')}</CardLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 16 }}>
          <ThreeWay
            label={t('tastingNote.beginner.tasteLabel.sweetness')}
            value={sweetness}
            onChange={setSweetness}
            options={[
              { id: 'low',  label: t('tastingNote.beginner.scale.sweetLow') },
              { id: 'mid',  label: t('tastingNote.beginner.scale.sweetMid') },
              { id: 'high', label: t('tastingNote.beginner.scale.sweetHigh') },
            ]}
          />
          <ThreeWay
            label={t('tastingNote.beginner.tasteLabel.acidity')}
            value={acidity}
            onChange={setAcidity}
            options={[
              { id: 'low',  label: t('tastingNote.beginner.scale.acidLow') },
              { id: 'mid',  label: t('tastingNote.beginner.scale.acidMid') },
              { id: 'high', label: t('tastingNote.beginner.scale.acidHigh') },
            ]}
          />
          <ThreeWay
            label={t('tastingNote.beginner.tasteLabel.body')}
            value={body}
            onChange={setBody}
            options={[
              { id: 'low',  label: t('tastingNote.beginner.scale.bodyLow') },
              { id: 'mid',  label: t('tastingNote.beginner.scale.bodyMid') },
              { id: 'high', label: t('tastingNote.beginner.scale.bodyHigh') },
            ]}
          />
          {variant === 'red' && (
            <ThreeWay
              label={t('tastingNote.beginner.tasteLabel.tannin')}
              value={tannin}
              onChange={setTannin}
              options={[
                { id: 'low',  label: t('tastingNote.beginner.scale.tanninLow') },
                { id: 'mid',  label: t('tastingNote.beginner.scale.tanninMid') },
                { id: 'high', label: t('tastingNote.beginner.scale.tanninHigh') },
              ]}
            />
          )}
          {variant === 'sparkling' && (
            <ThreeWay
              label={t('tastingNote.beginner.tasteLabel.bubbles')}
              value={bubbles}
              onChange={setBubbles}
              options={[
                { id: 'low',  label: t('tastingNote.beginner.scale.bubblesLow') },
                { id: 'mid',  label: t('tastingNote.beginner.scale.bubblesMid') },
                { id: 'high', label: t('tastingNote.beginner.scale.bubblesHigh') },
              ]}
            />
          )}
        </div>
      </Card>

      {/* Step 4 — Aroma cards */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <CardLabel>{t('tastingNote.beginner.step.aroma')}</CardLabel>
          <span style={{ fontSize: 11, color: MUTED, fontStyle: 'italic' }}>
            {t('tastingNote.beginner.aromaHint')}
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 10,
            marginTop: 14,
          }}
        >
          {cardsForVariant.map(c => {
            const active = aromas.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleAroma(c.id)}
                style={{
                  padding: '16px 10px',
                  background: active ? 'var(--color-accent-tint)' : SURFACE,
                  border: `2px solid ${active ? 'var(--color-accent)' : BORDER}`,
                  borderRadius: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'background 200ms ease, border-color 200ms ease',
                }}
              >
                <span aria-hidden style={{ display: 'inline-flex', color: active ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                  <c.Icon size={28} />
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: active ? CREAM : 'var(--color-text-secondary)' }}>
                  {t(`tastingNote.beginner.aromaCard.${c.id}`)}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Step 5 — Finish (3 levels) */}
      <Card>
        <CardLabel>{t('tastingNote.beginner.step.finish')}</CardLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
          {(['short', 'medium', 'long'] as FinishLevel[]).map(opt => {
            const active = finish === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setFinish(active ? null : opt)}
                style={{
                  padding: '14px 10px',
                  background: active ? 'var(--color-accent-tint)' : SURFACE,
                  border: `2px solid ${active ? 'var(--color-accent)' : BORDER}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span aria-hidden style={{ display: 'inline-flex', color: active ? 'var(--color-accent)' : MUTED }}>
                  {opt === 'short' ? <StopwatchIcon size={20} />
                    : opt === 'medium' ? <ClockIcon size={20} />
                    : <WineGlassRedIcon size={20} />}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: active ? CREAM : 'var(--color-text-secondary)' }}>
                  {t(`tastingNote.beginner.finishOption.${opt}`)}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Step 6 — Rating */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <CardLabel>{t('tastingNote.beginner.step.rating')}</CardLabel>
          <span style={{ fontSize: 11, color: MUTED, fontStyle: 'italic' }}>
            {t('tastingNote.beginner.ratingHint')}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
          {[1, 2, 3, 4, 5].map(i => {
            const filled = i <= rating;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i === rating ? 0 : i)}
                aria-label={`Rating ${i}`}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  background: filled ? 'var(--color-accent)' : 'transparent',
                  border: `2px solid ${filled ? 'var(--color-accent)' : BORDER}`,
                  cursor: 'pointer',
                  color: filled ? CREAM : MUTED,
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 180ms ease, transform 180ms ease',
                  transform: filled ? 'scale(1.04)' : 'scale(1)',
                }}
              >
                <StarFilledIcon size={20} filled={filled} />
              </button>
            );
          })}
          <span style={{ marginLeft: 12, fontSize: 14, color: MUTED }}>{rating}/5</span>
        </div>
      </Card>

      {/* Step 7 — Memo */}
      <Card>
        <CardLabel>{t('tastingNote.beginner.step.memo')}</CardLabel>
        <textarea
          value={memo}
          onChange={e => setMemo(e.target.value.slice(0, 200))}
          placeholder={t('tastingNote.beginner.memoPlaceholder')}
          rows={3}
          style={{
            width: '100%',
            marginTop: 12,
            padding: 12,
            background: 'var(--color-bg-map)',
            color: CREAM,
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            fontFamily: 'inherit',
            fontSize: 14,
            lineHeight: 1.6,
            resize: 'vertical',
          }}
        />
        <div style={{ marginTop: 4, fontSize: 11, color: MUTED, textAlign: 'right' }}>
          {memo.length}/200
        </div>
      </Card>

      {/* Summary card — 한 화면에 보기 */}
      <SummaryCard
        wineName={wineName}
        producer={producer}
        impression={impression}
        sweetness={sweetness}
        acidity={acidity}
        body={body}
        tannin={variant === 'red' ? tannin : null}
        bubbles={variant === 'sparkling' ? bubbles : null}
        aromas={aromas}
        finish={finish}
        rating={rating}
        memo={memo}
      />

      {/* 학습 팁 — 토글로 펼침 */}
      <div>
        <button
          type="button"
          onClick={() => setTipOpen(o => !o)}
          style={{
            width: '100%',
            padding: '14px 18px',
            background: 'rgba(201,168,76,0.06)',
            border: `1px solid ${GOLD}`,
            borderRadius: 12,
            color: GOLD,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span aria-hidden style={{ display: 'inline-flex' }}>
              <LightbulbIcon size={14} />
            </span>
            {t('tastingNote.beginner.tipTitle')}
          </span>
          <span aria-hidden style={{ display: 'inline-flex' }}>
            {tipOpen ? <ArrowUpIcon size={12} /> : <ArrowDownIcon size={12} />}
          </span>
        </button>
        {tipOpen && (
          <div
            style={{
              padding: 18,
              marginTop: 8,
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              fontSize: 12,
              lineHeight: 1.6,
              color: 'var(--color-text-secondary)',
            }}
          >
            <TipRow titleKey="tastingNote.beginner.tasteLabel.sweetness" bodyKey="tastingNote.beginner.tip.sweetness" />
            <TipRow titleKey="tastingNote.beginner.tasteLabel.acidity"   bodyKey="tastingNote.beginner.tip.acidity" />
            <TipRow titleKey="tastingNote.beginner.tasteLabel.body"      bodyKey="tastingNote.beginner.tip.body" />
            <TipRow titleKey="tastingNote.beginner.tasteLabel.tannin"    bodyKey="tastingNote.beginner.tip.tannin" />
            <TipRow titleKey="tastingNote.beginner.step.finish"          bodyKey="tastingNote.beginner.tip.finish" last />
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: MUTED, fontStyle: 'italic', margin: 0 }}>
        {t('tastingNote.beginner.switchToExpert')}
      </p>
    </div>
  );
}

// ─── Sub components ────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 22,
        background: 'var(--color-bg-surface)',
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.32)',
      }}
    >
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: GOLD,
      }}
    >
      {children}
    </div>
  );
}

function ThreeWay<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T | null;
  onChange: (v: T | null) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: CREAM, marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {options.map(opt => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(active ? null : opt.id)}
              style={{
                padding: '12px 10px',
                background: active ? GOLD : 'transparent',
                color: active ? 'var(--color-bg-map)' : 'var(--color-text-secondary)',
                border: `1.5px solid ${active ? GOLD : BORDER}`,
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                lineHeight: 1.3,
                transition: 'background 180ms ease, color 180ms ease, border-color 180ms ease',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({
  wineName, producer, impression,
  sweetness, acidity, body, tannin, bubbles,
  aromas, finish, rating, memo,
}: {
  wineName: string;
  producer: string;
  impression: Impression | null;
  sweetness: Level | null;
  acidity: Level | null;
  body: Level | null;
  tannin: Level | null;
  bubbles: Level | null;
  aromas: string[];
  finish: FinishLevel | null;
  rating: number;
  memo: string;
}) {
  const { t } = useLocale();
  const ImpIcon: Record<Impression, IconComponent> = {
    love: StarEyesFaceIcon,
    ok: SmileFaceIcon,
    meh: ThinkingFaceIcon,
  };
  return (
    <div
      style={{
        padding: 24,
        background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(139,26,42,0.06) 100%)',
        border: `1px solid ${GOLD}`,
        borderRadius: 16,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: GOLD,
          marginBottom: 10,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span aria-hidden style={{ color: GOLD, display: 'inline-flex' }}>
            <StarBurstIcon size={12} />
          </span>
          {t('tastingNote.beginner.summary')}
        </span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-playfair, Georgia, serif)',
          fontSize: 18,
          fontWeight: 700,
          color: CREAM,
          marginBottom: 4,
          lineHeight: 1.3,
        }}
      >
        {wineName}
      </div>
      <div style={{ fontSize: 12, color: MUTED, fontStyle: 'italic', marginBottom: 16 }}>
        {producer}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {impression && (
          <Tag>
            <span aria-hidden style={{ display: 'inline-flex', marginRight: 4 }}>
              {(() => { const I = ImpIcon[impression]; return <I size={12} />; })()}
            </span>
            {t(`tastingNote.beginner.impression.${impression}`)}
          </Tag>
        )}
        {sweetness && <Tag>{t('tastingNote.beginner.tasteLabel.sweetness')} · {t(`tastingNote.beginner.scale.sweet${cap(sweetness)}`)}</Tag>}
        {acidity && <Tag>{t('tastingNote.beginner.tasteLabel.acidity')} · {t(`tastingNote.beginner.scale.acid${cap(acidity)}`)}</Tag>}
        {body && <Tag>{t('tastingNote.beginner.tasteLabel.body')} · {t(`tastingNote.beginner.scale.body${cap(body)}`)}</Tag>}
        {tannin && <Tag>{t('tastingNote.beginner.tasteLabel.tannin')} · {t(`tastingNote.beginner.scale.tannin${cap(tannin)}`)}</Tag>}
        {bubbles && <Tag>{t('tastingNote.beginner.tasteLabel.bubbles')} · {t(`tastingNote.beginner.scale.bubbles${cap(bubbles)}`)}</Tag>}
        {finish && <Tag>{t(`tastingNote.beginner.finishOption.${finish}`)}</Tag>}
      </div>
      {aromas.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {aromas.map(id => {
            const Icon = AROMA_CARD_BY_ID[id];
            return (
              <Tag key={id} accent>
                {Icon && (
                  <span aria-hidden style={{ display: 'inline-flex', marginRight: 4 }}>
                    <Icon size={12} />
                  </span>
                )}
                {t(`tastingNote.beginner.aromaCard.${id}`)}
              </Tag>
            );
          })}
        </div>
      )}
      {rating > 0 && (
        <div style={{ marginBottom: memo ? 12 : 0, display: 'flex', gap: 2 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} aria-hidden style={{ display: 'inline-flex', color: i <= rating ? 'var(--color-accent)' : BORDER }}>
              <StarFilledIcon size={18} filled={i <= rating} />
            </span>
          ))}
        </div>
      )}
      {memo && (
        <p
          style={{
            margin: 0,
            padding: '12px 14px',
            background: 'var(--color-bg-surface)',
            borderRadius: 10,
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}
        >
          “{memo}”
        </p>
      )}
    </div>
  );
}

function Tag({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      style={{
        padding: '4px 10px',
        background: accent ? 'var(--color-accent-tint)' : 'var(--color-bg-surface)',
        border: `1px solid ${accent ? 'var(--color-accent)' : BORDER}`,
        borderRadius: 999,
        fontSize: 11,
        color: CREAM,
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}

function TipRow({ titleKey, bodyKey, last = false }: { titleKey: string; bodyKey: string; last?: boolean }) {
  const { t } = useLocale();
  return (
    <div
      style={{
        padding: '8px 0',
        borderBottom: last ? 'none' : `1px dashed ${BORDER}`,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 4 }}>{t(titleKey)}</div>
      <div>{t(bodyKey)}</div>
    </div>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
