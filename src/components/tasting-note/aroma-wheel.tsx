'use client';

// Aroma Wheel — UC Davis 12 wedge SVG, 활성 wedge의 어휘 칩 패널, 임팩트 화합물 hover 툴팁
// spec §aroma_wheel

import { useState, useMemo, type ComponentType } from 'react';
import { useLocale } from '@/components/providers/locale-provider';
import {
  AROMA_CATEGORIES,
  AROMA_LEXICON,
  IMPACT_BY_ID,
  type AromaCategoryId,
  type AromaCategoryIconKey,
  type FormVariant,
} from '@/lib/tasting-note-lexicon';
import {
  CherryIconSimple,
  RoseIcon,
  ChiliIcon,
  HerbIcon,
  ChestnutIcon,
  HoneyJarIcon,
  WoodIcon,
  LeafIcon,
  TestTubeIcon,
  FlameIcon,
  WhiskyGlassIcon,
  DnaIcon,
  CheckIcon,
  type IconProps,
} from '@/components/icons/wine-icons';

const CATEGORY_ICON: Record<AromaCategoryIconKey, ComponentType<IconProps>> = {
  cherry: CherryIconSimple,
  rose: RoseIcon,
  chili: ChiliIcon,
  herb: HerbIcon,
  chestnut: ChestnutIcon,
  honey: HoneyJarIcon,
  wood: WoodIcon,
  leaf: LeafIcon,
  testTube: TestTubeIcon,
  flame: FlameIcon,
  whisky: WhiskyGlassIcon,
  dna: DnaIcon,
};

const GOLD = '#C9A84C';
const WINE_RED = '#8B1A2A';

interface Props {
  variant: FormVariant;
  selected: string[];
  onToggle: (id: string) => void;
}

export default function AromaWheel({ variant, selected, onToggle }: Props) {
  const { t, locale } = useLocale();
  const [activeCat, setActiveCat] = useState<AromaCategoryId | null>('fruity');
  const [hoveredLex, setHoveredLex] = useState<string | null>(null);

  const lexByCategory = useMemo(() => {
    const m: Record<string, typeof AROMA_LEXICON[number][]> = {};
    AROMA_LEXICON.forEach(l => {
      if (!l.appliesTo.includes(variant)) return;
      if (!m[l.category]) m[l.category] = [];
      m[l.category].push(l);
    });
    return m;
  }, [variant]);

  const wheelSize = 320;
  const center = wheelSize / 2;
  const outerR = center - 8;
  const innerR = 56;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <svg
        width={wheelSize}
        height={wheelSize}
        viewBox={`0 0 ${wheelSize} ${wheelSize}`}
        style={{ display: 'block' }}
      >
        <circle cx={center} cy={center} r={innerR - 2} fill="#1A0A1E" stroke={GOLD} strokeOpacity="0.3" />
        <text x={center} y={center} textAnchor="middle" dominantBaseline="middle" fill={GOLD} fontSize="11" fontFamily="serif" fontStyle="italic">
          aroma
        </text>
        {AROMA_CATEGORIES.map((cat, i) => {
          const a0 = (i * 30 - 90) * (Math.PI / 180);
          const a1 = ((i + 1) * 30 - 90) * (Math.PI / 180);
          const x0 = center + outerR * Math.cos(a0);
          const y0 = center + outerR * Math.sin(a0);
          const x1 = center + outerR * Math.cos(a1);
          const y1 = center + outerR * Math.sin(a1);
          const xi0 = center + innerR * Math.cos(a0);
          const yi0 = center + innerR * Math.sin(a0);
          const xi1 = center + innerR * Math.cos(a1);
          const yi1 = center + innerR * Math.sin(a1);
          const isActive = activeCat === cat.id;
          const labelAngle = (i + 0.5) * 30 - 90;
          const labelR = (outerR + innerR) / 2;
          const lx = center + labelR * Math.cos((labelAngle * Math.PI) / 180);
          const ly = center + labelR * Math.sin((labelAngle * Math.PI) / 180);
          const count = (lexByCategory[cat.id] ?? []).filter(l => selected.includes(l.id)).length;
          return (
            <g key={cat.id} style={{ cursor: 'pointer' }} onClick={() => setActiveCat(cat.id)}>
              <path
                d={`M ${x0} ${y0} A ${outerR} ${outerR} 0 0 1 ${x1} ${y1} L ${xi1} ${yi1} A ${innerR} ${innerR} 0 0 0 ${xi0} ${yi0} Z`}
                fill={cat.color}
                fillOpacity={isActive ? 0.95 : 0.55}
                stroke={isActive ? GOLD : 'rgba(245,240,232,0.08)'}
                strokeWidth={isActive ? 2 : 1}
                style={{ transition: 'fill-opacity 180ms ease' }}
              />
              {(() => {
                const Icon = CATEGORY_ICON[cat.icon];
                if (!Icon) return null;
                // SVG 안에 React SVG 컴포넌트를 transform으로 위치 조정
                return (
                  <g transform={`translate(${lx - 8}, ${ly - 16})`} style={{ pointerEvents: 'none' }}>
                    <Icon size={16} color="#F5F0E8" />
                  </g>
                );
              })()}
              <text
                x={lx}
                y={ly + 8}
                textAnchor="middle"
                fill="#F5F0E8"
                fontSize="9"
                fontWeight="600"
                style={{ pointerEvents: 'none' }}
              >
                {locale === 'ko' ? cat.ko : cat.en}
              </text>
              {count > 0 && (
                <g>
                  <circle
                    cx={lx + 18}
                    cy={ly - 14}
                    r={7}
                    fill={GOLD}
                  />
                  <text
                    x={lx + 18}
                    y={ly - 11}
                    textAnchor="middle"
                    fill="#1A0A1E"
                    fontSize="9"
                    fontWeight="700"
                  >
                    {count}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {activeCat && (
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: GOLD,
              marginBottom: 8,
            }}
          >
            {locale === 'ko'
              ? AROMA_CATEGORIES.find(c => c.id === activeCat)?.ko
              : AROMA_CATEGORIES.find(c => c.id === activeCat)?.en}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(lexByCategory[activeCat] ?? []).map(lex => {
              const isOn = selected.includes(lex.id);
              const impact = lex.impactCompound ? IMPACT_BY_ID[lex.impactCompound] : null;
              return (
                <span
                  key={lex.id}
                  onMouseEnter={() => setHoveredLex(lex.id)}
                  onMouseLeave={() => setHoveredLex(null)}
                  style={{ position: 'relative', display: 'inline-block' }}
                >
                  <button
                    type="button"
                    onClick={() => onToggle(lex.id)}
                    style={{
                      padding: '6px 12px',
                      fontSize: 12,
                      borderRadius: 999,
                      border: `1px solid ${isOn ? WINE_RED : 'rgba(245,240,232,0.16)'}`,
                      background: isOn ? 'rgba(139,26,42,0.22)' : 'transparent',
                      color: isOn ? '#F5F0E8' : '#D4C5B0',
                      cursor: 'pointer',
                      fontWeight: isOn ? 600 : 400,
                      fontFamily: 'inherit',
                      letterSpacing: '0.02em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'background 180ms ease',
                    }}
                  >
                    {isOn && (
                      <span aria-hidden style={{ display: 'inline-flex' }}>
                        <CheckIcon size={11} />
                      </span>
                    )}
                    {locale === 'ko' ? lex.ko : lex.en}
                    {impact && (
                      <span
                        style={{
                          fontSize: 9,
                          color: GOLD,
                          marginLeft: 2,
                          letterSpacing: '0.04em',
                        }}
                      >
                        ⓘ
                      </span>
                    )}
                  </button>
                  {hoveredLex === lex.id && impact && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 6px)',
                        left: 0,
                        zIndex: 50,
                        width: 240,
                        padding: 12,
                        background: '#0A050F',
                        border: `1px solid ${GOLD}`,
                        borderRadius: 8,
                        fontSize: 11,
                        color: '#F5F0E8',
                        lineHeight: 1.4,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: GOLD, marginBottom: 4 }}>
                        {impact.name}
                      </div>
                      <div style={{ fontSize: 10, color: '#9B8B7A', marginBottom: 4, fontStyle: 'italic' }}>
                        {impact.chemistry} · {impact.threshold}
                      </div>
                      <div>{impact.note}</div>
                    </div>
                  )}
                </span>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 11,
              fontStyle: 'italic',
              color: '#9B8B7A',
            }}
          >
            {t('tastingNote.playground.aromaHint')}
          </div>
        </div>
      )}
    </div>
  );
}
