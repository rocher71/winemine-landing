'use client';

// Auto Description — 입력 종합 -> 자동 묘사 문장 생성 (디바운스 200ms)
// spec §auto_description

import { useEffect, useState } from 'react';
import { useLocale } from '@/components/providers/locale-provider';
import { StarBurstIcon, ArrowRightIcon } from '@/components/icons/wine-icons';
import {
  DESCRIPTION_TEMPLATES,
  LEX_BY_ID,
  WSET_LABELS_KO,
  WSET_LABELS_EN,
  type FormVariant,
  type WSETScale,
  type FinishLength,
  type EvolutionPoint,
} from '@/lib/tasting-note-lexicon';

const GOLD = 'var(--color-gold)';

interface Meta {
  vintage: number | null;
  producer: string;
  region: string;
  wineName: string;
}

interface Aroma {
  intensity: WSETScale;
  primary: string[];
  secondary: string[];
}

interface Palate {
  sweetness: WSETScale;
  acidity: WSETScale;
  body: WSETScale;
  alcohol: WSETScale;
  tannin?: { intensity: WSETScale; texture: string };
}

interface FinishField {
  caudalies: number | null;
  length: FinishLength;
  qualityKey?: string;
}

interface Props {
  variant: FormVariant;
  meta: Meta;
  aroma: Aroma;
  palate: Palate;
  finish: FinishField;
  rating: number;
  evolution?: { peak: EvolutionPoint | null };
  onCTA?: () => void;
}

export default function AutoDescription({ variant, meta, aroma, palate, finish, rating, evolution, onCTA }: Props) {
  const { t, locale } = useLocale();
  const [shown, setShown] = useState('');

  const target = buildSentence({ variant, meta, aroma, palate, finish, rating, evolution }, locale, t);

  useEffect(() => {
    const id = setTimeout(() => setShown(target), 200);
    return () => clearTimeout(id);
  }, [target]);

  return (
    <div
      style={{
        padding: 24,
        border: `1px solid ${GOLD}`,
        borderRadius: 12,
        background: 'rgba(201,168,76,0.04)',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: GOLD, marginBottom: 10, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span aria-hidden style={{ display: 'inline-flex' }}><StarBurstIcon size={12} /></span>
        {t('tastingNote.autoDescription.title')}
      </div>
      <p
        style={{
          fontFamily: 'var(--font-playfair, Georgia, serif)',
          fontSize: 17,
          fontStyle: 'italic',
          lineHeight: 1.7,
          color: 'var(--color-text-primary)',
          margin: 0,
          minHeight: 80,
        }}
      >
        {shown || t('tastingNote.autoDescription.placeholder' as string) || ''}
      </p>
      {onCTA && (
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCTA}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              color: GOLD,
              border: `1px solid ${GOLD}`,
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {t('tastingNote.autoDescription.saveCta')}
              <ArrowRightIcon size={14} aria-hidden />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function buildSentence(
  data: {
    variant: FormVariant;
    meta: Meta;
    aroma: Aroma;
    palate: Palate;
    finish: FinishField;
    rating: number;
    evolution?: { peak: EvolutionPoint | null };
  },
  locale: 'ko' | 'en',
  t: (k: string) => string,
): string {
  const { variant, meta, aroma, palate, finish, rating, evolution } = data;
  const tpl = DESCRIPTION_TEMPLATES[locale];
  const labels = locale === 'ko' ? WSET_LABELS_KO : WSET_LABELS_EN;

  const parts: string[] = [];

  if (meta.wineName) {
    if (meta.vintage) {
      parts.push(
        tpl.intro
          .replace('{vintage}', String(meta.vintage))
          .replace('{region}', meta.region)
          .replace('{producer}', meta.producer)
          .replace('{wineName}', meta.wineName),
      );
    } else {
      parts.push(tpl.introNV.replace('{producer}', meta.producer).replace('{wineName}', meta.wineName));
    }
  }

  const primaryNames = aroma.primary.slice(0, 3).map(id => lexLabel(id, locale)).filter(Boolean);
  const secondaryNames = aroma.secondary.slice(0, 2).map(id => lexLabel(id, locale)).filter(Boolean);
  if (primaryNames.length > 0) {
    parts.push(
      tpl.aroma
        .replace('{intensity}', labels[aroma.intensity])
        .replace('{primary}', primaryNames.join(' · '))
        .replace('{secondary}', secondaryNames.join(' · ') || (locale === 'ko' ? '복합적인 향들' : 'layered aromas')),
    );
  }

  parts.push(
    tpl.palate
      .replace('{body}', labels[palate.body])
      .replace('{acidity}', labels[palate.acidity])
      .replace('{sweetness}', labels[palate.sweetness]),
  );

  if (variant === 'red' && palate.tannin) {
    parts.push(
      tpl.redTannin
        .replace('{tanninIntensity}', labels[palate.tannin.intensity])
        .replace('{tannin}', labels[palate.tannin.intensity])
        .replace('{tanninTexture}', palate.tannin.texture),
    );
  }

  if (finish.caudalies != null && finish.caudalies > 0) {
    parts.push(
      tpl.finish
        .replace('{caudalies}', String(finish.caudalies))
        .replace('{finishLength}', finish.length)
        .replace('{finishQuality}', finish.qualityKey ?? (locale === 'ko' ? '균형 잡힌' : 'balanced')),
    );
  } else {
    parts.push(
      tpl.finishNoCaudalie
        .replace('{finishLength}', finish.length)
        .replace('{finishQuality}', finish.qualityKey ?? (locale === 'ko' ? '균형 잡힌' : 'balanced')),
    );
  }

  if (evolution?.peak) {
    const newAromas = evolution.peak.newAromasEmerged
      .slice(0, 2)
      .map(id => lexLabel(id, locale))
      .filter(Boolean)
      .join(' · ');
    parts.push(
      tpl.evolution
        .replace('{peakLabel}', evolution.peak.label)
        .replace('{firstChange}', evolution.peak.reductionPresent ? (locale === 'ko' ? '환원취가' : 'reduction') : (locale === 'ko' ? '닫힌 향이' : 'closed aromas'))
        .replace('{newAromas}', newAromas || (locale === 'ko' ? '복합적인 향' : 'layered notes')),
    );
  }

  if (rating > 0) {
    parts.push(tpl.rating.replace('{rating}', String(rating)));
  }

  if (parts.length === 0) {
    return t('tastingNote.autoDescription.placeholder' as string) || tpl.placeholder;
  }
  return parts.join(' ');
}

function lexLabel(id: string, locale: 'ko' | 'en'): string {
  const l = LEX_BY_ID[id];
  if (!l) return '';
  return locale === 'ko' ? l.ko : l.en;
}
