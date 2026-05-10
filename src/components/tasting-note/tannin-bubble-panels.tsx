'use client';

// Tannin Panel (Red 전용) + Bubble Panel (Sparkling 전용)
// spec §tannin_panel + §bubble_panel

import WSETSlider from './wset-slider';
import { useLocale } from '@/components/providers/locale-provider';
import { WineGlassRedIcon, SparkleIcon } from '@/components/icons/wine-icons';
import {
  TANNIN_INTENSITY_LABELS,
  TANNIN_TEXTURE_LABELS,
  TANNIN_TEXTURE_GROUP_LABELS,
  DOSAGE_LABELS,
  SPARKLING_METHOD_LABELS,
  type WSETScale,
  type TanninTexture,
  type TanninTextureGroup,
  type BubbleSize,
  type BubblePersistence,
  type MousseTexture,
  type SparklingMethod,
  type SparklingDosage,
} from '@/lib/tasting-note-lexicon';

const GOLD = '#C9A84C';
const WINE_RED = '#8B1A2A';
const MUTED = '#9B8B7A';
const BORDER = '#2D1540';

const TEXTURE_SOFT: TanninTexture[] = ['silky', 'velvety', 'smooth', 'plush', 'soft', 'round'];
const TEXTURE_FINE: TanninTexture[] = ['fineGrained', 'polished', 'powdery', 'dusty', 'chalky'];
const TEXTURE_GRIPPY: TanninTexture[] = ['grainy', 'grippy', 'firm', 'chewy'];
const TEXTURE_HARSH: TanninTexture[] = ['coarse', 'rough', 'harsh', 'astringent', 'drying', 'aggressive'];

interface TanninState {
  intensity: WSETScale;
  texture: TanninTexture;
  ripeness: 'ripe' | 'unripe' | 'overripe';
}

export function TanninPanel({
  state,
  onChange,
}: {
  state: TanninState;
  onChange: (s: TanninState) => void;
}) {
  const { t, locale } = useLocale();
  return (
    <div style={{ padding: 16, background: 'rgba(139,26,42,0.08)', border: `1px solid ${WINE_RED}`, borderRadius: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: WINE_RED, marginBottom: 12, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span aria-hidden style={{ display: 'inline-flex' }}><WineGlassRedIcon size={14} /></span>
        {t('tastingNote.dimensions.tannin')}
      </div>
      <WSETSlider
        labelKey="tastingNote.dimensions.tannin"
        value={state.intensity}
        onChange={v => onChange({ ...state, intensity: v })}
        labels={TANNIN_INTENSITY_LABELS}
      />
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>
          {t('tastingNote.dimensions.tanninTexture')}
        </div>
        <TextureGroup groupId="soft"   locale={locale} textures={TEXTURE_SOFT}   active={state.texture} onSelect={tex => onChange({ ...state, texture: tex })} accent={GOLD} />
        <TextureGroup groupId="fine"   locale={locale} textures={TEXTURE_FINE}   active={state.texture} onSelect={tex => onChange({ ...state, texture: tex })} accent="#D4C5B0" />
        <TextureGroup groupId="grippy" locale={locale} textures={TEXTURE_GRIPPY} active={state.texture} onSelect={tex => onChange({ ...state, texture: tex })} accent="#A05A3D" />
        <TextureGroup groupId="harsh"  locale={locale} textures={TEXTURE_HARSH}  active={state.texture} onSelect={tex => onChange({ ...state, texture: tex })} accent={WINE_RED} />
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        {(['unripe', 'ripe', 'overripe'] as const).map(r => (
          <button
            key={r}
            type="button"
            onClick={() => onChange({ ...state, ripeness: r })}
            style={{
              flex: 1,
              padding: '8px',
              background: state.ripeness === r ? WINE_RED : 'transparent',
              color: state.ripeness === r ? '#F5F0E8' : MUTED,
              border: `1px solid ${state.ripeness === r ? WINE_RED : BORDER}`,
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'inherit',
            }}
          >
            {t(`tastingNote.mockup.tannin.${r}`)}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextureGroup({
  groupId, locale, textures, active, onSelect, accent,
}: { groupId: TanninTextureGroup; locale: 'ko' | 'en'; textures: TanninTexture[]; active: TanninTexture; onSelect: (t: TanninTexture) => void; accent: string }) {
  const groupLabel = TANNIN_TEXTURE_GROUP_LABELS[groupId][locale];
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 9, color: accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>
        {groupLabel}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {textures.map(tex => {
          const isOn = active === tex;
          return (
            <button
              key={tex}
              type="button"
              onClick={() => onSelect(tex)}
              style={{
                padding: '4px 8px',
                background: isOn ? accent : 'transparent',
                color: isOn ? '#1A0A1E' : '#D4C5B0',
                border: `1px solid ${isOn ? accent : BORDER}`,
                borderRadius: 12,
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: isOn ? 700 : 400,
              }}
            >
              {TANNIN_TEXTURE_LABELS[tex][locale]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface BubbleState {
  size: BubbleSize;
  persistence: BubblePersistence;
  mousse: MousseTexture;
  pressure: number;
  method: SparklingMethod;
}

export function BubblePanel({
  bubbles, dosage, onBubbles, onDosage,
}: {
  bubbles: BubbleState;
  dosage: SparklingDosage;
  onBubbles: (b: BubbleState) => void;
  onDosage: (d: SparklingDosage) => void;
}) {
  const { t, locale } = useLocale();
  return (
    <div style={{ padding: 16, background: 'rgba(201,168,76,0.06)', border: `1px solid ${GOLD}`, borderRadius: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 12, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span aria-hidden style={{ display: 'inline-flex' }}><SparkleIcon size={14} /></span>
        {t('tastingNote.mockup.section.bubbles')}
      </div>
      <Group label={t('tastingNote.mockup.bubbles.size')}>
        {(['fine', 'medium', 'coarse'] as const).map(s => (
          <Chip key={s} active={bubbles.size === s} onClick={() => onBubbles({ ...bubbles, size: s })}>{s}</Chip>
        ))}
      </Group>
      <Group label={t('tastingNote.mockup.bubbles.persistence')}>
        {(['fleeting', 'steady', 'persistent', 'continuous'] as const).map(p => (
          <Chip key={p} active={bubbles.persistence === p} onClick={() => onBubbles({ ...bubbles, persistence: p })}>{p}</Chip>
        ))}
      </Group>
      <Group label={t('tastingNote.mockup.bubbles.mousse')}>
        {(['creamy', 'silky', 'frothy', 'soft', 'aggressive'] as const).map(m => (
          <Chip key={m} active={bubbles.mousse === m} onClick={() => onBubbles({ ...bubbles, mousse: m })}>{m}</Chip>
        ))}
      </Group>
      <Group label={`Pressure (${bubbles.pressure} ${t('tastingNote.mockup.bubbles.bar')})`}>
        <input
          type="range"
          min={1}
          max={6}
          value={bubbles.pressure}
          onChange={e => onBubbles({ ...bubbles, pressure: Number(e.target.value) })}
          style={{ width: '100%', accentColor: GOLD }}
        />
      </Group>
      <Group label={t('tastingNote.dimensions.method')}>
        {(['traditional', 'charmat', 'asti', 'ancestral', 'unknown'] as const).map(m => (
          <Chip key={m} active={bubbles.method === m} onClick={() => onBubbles({ ...bubbles, method: m })} title={SPARKLING_METHOD_LABELS[m].note}>
            {SPARKLING_METHOD_LABELS[m][locale]}
          </Chip>
        ))}
      </Group>
      <Group label={t('tastingNote.mockup.dosage')}>
        {(['brutNature', 'extraBrut', 'brut', 'extraDry', 'sec', 'demiSec', 'doux'] as const).map(d => (
          <button
            key={d}
            type="button"
            onClick={() => onDosage(d)}
            style={{
              padding: '8px 10px',
              background: dosage === d ? WINE_RED : 'transparent',
              color: dosage === d ? '#F5F0E8' : '#D4C5B0',
              border: `1px solid ${dosage === d ? WINE_RED : BORDER}`,
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 11,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              minWidth: 76,
              fontWeight: dosage === d ? 700 : 400,
            }}
          >
            <span>{DOSAGE_LABELS[d][locale]}</span>
            <span style={{ fontSize: 9, color: dosage === d ? 'rgba(245,240,232,0.7)' : MUTED }}>
              {DOSAGE_LABELS[d].range}
            </span>
          </button>
        ))}
      </Group>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children, title }: { active: boolean; onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        padding: '6px 12px',
        background: active ? GOLD : 'transparent',
        color: active ? '#1A0A1E' : '#D4C5B0',
        border: `1px solid ${active ? GOLD : BORDER}`,
        borderRadius: 16,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 11,
        fontWeight: active ? 700 : 400,
      }}
    >
      {children}
    </button>
  );
}
