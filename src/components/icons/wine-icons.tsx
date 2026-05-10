// Wine·Aroma·UI SVG icon library
// 프로젝트 전반에서 emoji 사용을 금지하고, 모든 시각 기호를 이 라이브러리의
// SVG 컴포넌트로 통일한다. 새 아이콘이 필요하면 이 파일에 추가하라.
//
// 모든 아이콘 컴포넌트의 공통 props:
//   - size?: number   (기본 24)
//   - color?: string  (기본 currentColor)
//   - filled?: boolean (해당 시 채움)

import type { SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'color'> {
  size?: number;
  color?: string;
  filled?: boolean;
}

function base({ size = 24, color = 'currentColor', filled = false, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: filled ? color : 'none',
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...rest,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Wine glassware
// ─────────────────────────────────────────────────────────────────────────────

export function WineGlassRedIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path
        d="M7 3 Q7 11 12 12 Q17 11 17 3 Z"
        fill={p.color ?? 'currentColor'}
        fillOpacity="0.85"
        stroke="none"
      />
      <path d="M7 3 Q7 11 12 12 Q17 11 17 3 Z" />
      <line x1="12" y1="12" x2="12" y2="20" />
      <line x1="8" y1="20" x2="16" y2="20" />
    </svg>
  );
}

export function WineGlassWhiteIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M7 3 Q7 11 12 12 Q17 11 17 3 Z" />
      <line x1="12" y1="12" x2="12" y2="20" />
      <line x1="8" y1="20" x2="16" y2="20" />
    </svg>
  );
}

export function ChampagneFluteIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9.5 3 L9.5 11 Q12 14 14.5 11 L14.5 3 Z" />
      <line x1="12" y1="14" x2="12" y2="20" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <circle cx="11" cy="7" r="0.5" fill={p.color ?? 'currentColor'} />
      <circle cx="13" cy="9" r="0.5" fill={p.color ?? 'currentColor'} />
    </svg>
  );
}

export function ToastingFlutesIcon(p: IconProps) {
  // 두 잔이 부딪히는 모양 (스파클링 / 축하)
  return (
    <svg {...base(p)}>
      <path d="M6 4 L7.5 11 Q9 12 10 11 L11 4 Z" />
      <line x1="8.5" y1="12" x2="9" y2="20" />
      <line x1="6" y1="20" x2="11" y2="20" />
      <path d="M13 4 L14 11 Q15 12 16.5 11 L18 4 Z" />
      <line x1="15" y1="12" x2="14.5" y2="20" />
      <line x1="13" y1="20" x2="18" y2="20" />
    </svg>
  );
}

export function WhiskyGlassIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="6" y="6" width="12" height="14" rx="1" />
      <line x1="6" y1="14" x2="18" y2="14" />
    </svg>
  );
}

export function GrapeIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3 L12 5" />
      <path d="M11 3 L13 3" />
      <circle cx="9"  cy="8"  r="2" fill={p.color ?? 'currentColor'} fillOpacity="0.5" />
      <circle cx="15" cy="8"  r="2" fill={p.color ?? 'currentColor'} fillOpacity="0.5" />
      <circle cx="12" cy="11" r="2" fill={p.color ?? 'currentColor'} fillOpacity="0.5" />
      <circle cx="9"  cy="14" r="2" fill={p.color ?? 'currentColor'} fillOpacity="0.5" />
      <circle cx="15" cy="14" r="2" fill={p.color ?? 'currentColor'} fillOpacity="0.5" />
      <circle cx="12" cy="17" r="2" fill={p.color ?? 'currentColor'} fillOpacity="0.5" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Aroma · Fruit · Plant
// ─────────────────────────────────────────────────────────────────────────────

export function StrawberryIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 4 Q5 6 5 13 Q5 19 12 21 Q19 19 19 13 Q19 6 12 4 Z" fill={p.color ?? 'currentColor'} fillOpacity="0.5" stroke="none" />
      <path d="M12 4 Q5 6 5 13 Q5 19 12 21 Q19 19 19 13 Q19 6 12 4 Z" />
      <path d="M9 3 L12 5 L15 3 L13 6" />
      <circle cx="9"  cy="11" r="0.6" fill={p.color ?? 'currentColor'} stroke="none" />
      <circle cx="13" cy="13" r="0.6" fill={p.color ?? 'currentColor'} stroke="none" />
      <circle cx="11" cy="16" r="0.6" fill={p.color ?? 'currentColor'} stroke="none" />
      <circle cx="15" cy="11" r="0.6" fill={p.color ?? 'currentColor'} stroke="none" />
    </svg>
  );
}

export function LemonIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <ellipse cx="12" cy="12" rx="7" ry="5" transform="rotate(-22 12 12)" />
      <path d="M5.5 9 L4 7" />
      <path d="M18.5 15 L20 17" />
    </svg>
  );
}

export function PeachIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 6 Q4 8 5 14 Q6 21 12 21 Q18 21 19 14 Q20 8 12 6 Z" />
      <path d="M11 6 Q12 4 14 5 Q13 7 12 7" fill={p.color ?? 'currentColor'} />
      <path d="M11 11 Q11 13 12 14 Q13 13 13 11" />
    </svg>
  );
}

export function CherryIconSimple(p: IconProps) {
  // 단순화: aroma wheel wedge 안에 들어갈 작은 cherry — 두 동그라미만
  return (
    <svg {...base(p)}>
      <circle cx="9"  cy="14" r="4" fill={p.color ?? 'currentColor'} fillOpacity="0.55" stroke="none" />
      <circle cx="15" cy="14" r="4" fill={p.color ?? 'currentColor'} fillOpacity="0.55" stroke="none" />
      <path d="M9 10 Q12 5 15 10" />
    </svg>
  );
}

export function CherryIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9 5 Q11 8 9 14" />
      <path d="M15 5 Q13 8 15 14" />
      <circle cx="9"  cy="16" r="3.5" fill={p.color ?? 'currentColor'} fillOpacity="0.6" />
      <circle cx="15" cy="16" r="3.5" fill={p.color ?? 'currentColor'} fillOpacity="0.6" />
      <path d="M9 4 L15 4" />
    </svg>
  );
}

export function HoneyJarIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="6" y="9" width="12" height="11" rx="1" />
      <rect x="7" y="6" width="10" height="3" rx="0.5" />
      <path d="M9 12 L15 12 L14 18 L10 18 Z" fill={p.color ?? 'currentColor'} fillOpacity="0.5" stroke="none" />
    </svg>
  );
}

export function BreadIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 12 Q5 7 12 7 Q19 7 19 12 Q19 17 12 19 Q5 17 5 12 Z" />
      <path d="M9 9 L9 17" />
      <path d="M12 8 L12 19" />
      <path d="M15 9 L15 17" />
    </svg>
  );
}

export function NutIcon(p: IconProps) {
  // 헤이즐넛/아몬드 — 둥근 견과 모양
  return (
    <svg {...base(p)}>
      <ellipse cx="12" cy="13" rx="6" ry="7" />
      <path d="M12 6 Q14 9 12 13 Q10 9 12 6 Z" fill={p.color ?? 'currentColor'} fillOpacity="0.4" stroke="none" />
      <path d="M9 11 Q11 14 12 11" />
    </svg>
  );
}

export function ChestnutIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 13 Q12 5 19 13 Q12 16 5 13 Z" fill={p.color ?? 'currentColor'} fillOpacity="0.3" />
      <path d="M6 14 Q12 21 18 14" fill={p.color ?? 'currentColor'} fillOpacity="0.6" stroke={p.color ?? 'currentColor'} />
      <line x1="12" y1="6" x2="12" y2="9" />
    </svg>
  );
}

export function RoseIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="10" r="3" />
      <path d="M9 10 Q7 7 9 5 Q12 5 12 8" />
      <path d="M15 10 Q17 7 15 5 Q12 5 12 8" />
      <path d="M9 12 Q6 14 8 17 Q11 16 12 13" />
      <path d="M15 12 Q18 14 16 17 Q13 16 12 13" />
      <path d="M12 13 L12 21" />
      <path d="M12 18 L9 16" />
    </svg>
  );
}

export function PinkRoseIcon(p: IconProps) {
  // 측면형 장미 (rosé 와인 표시용)
  return (
    <svg {...base(p)}>
      <path d="M12 5 Q8 7 8 11 Q8 14 12 14 Q16 14 16 11 Q16 7 12 5 Z" fill={p.color ?? 'currentColor'} fillOpacity="0.4" />
      <path d="M10 9 Q12 11 14 9" />
      <path d="M11 11 Q12 12 13 11" />
      <path d="M12 14 L12 20" />
      <path d="M12 17 L9 16" />
    </svg>
  );
}

export function ChiliIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M8 5 Q9 7 10 6 Q12 5 13 7" />
      <path d="M11 7 Q6 11 7 17 Q9 21 14 19 Q19 17 18 12 Q17 8 13 7 Z" fill={p.color ?? 'currentColor'} fillOpacity="0.55" />
    </svg>
  );
}

export function HerbIcon(p: IconProps) {
  // 잎 + 줄기
  return (
    <svg {...base(p)}>
      <path d="M12 21 Q12 14 18 10" />
      <path d="M18 10 Q14 8 12 14" fill={p.color ?? 'currentColor'} fillOpacity="0.4" />
      <path d="M12 16 Q9 13 5 14" />
      <path d="M5 14 Q8 17 12 16" fill={p.color ?? 'currentColor'} fillOpacity="0.3" />
    </svg>
  );
}

export function LeafIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 19 Q5 8 19 5 Q16 19 5 19 Z" fill={p.color ?? 'currentColor'} fillOpacity="0.3" />
      <path d="M5 19 Q12 12 19 5" />
    </svg>
  );
}

export function SproutIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 21 L12 12" />
      <path d="M12 13 Q5 13 5 7 Q11 7 12 13 Z" fill={p.color ?? 'currentColor'} fillOpacity="0.4" />
      <path d="M12 12 Q19 12 19 6 Q13 6 12 12 Z" fill={p.color ?? 'currentColor'} fillOpacity="0.4" />
    </svg>
  );
}

export function WoodIcon(p: IconProps) {
  // 단면이 보이는 통나무
  return (
    <svg {...base(p)}>
      <ellipse cx="12" cy="12" rx="7" ry="6" />
      <ellipse cx="12" cy="12" rx="4.5" ry="3.5" />
      <ellipse cx="12" cy="12" rx="2"   ry="1.5" />
    </svg>
  );
}

export function FlameIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3 Q9 8 9 11 Q9 14 7 15 Q5 16 5 18 Q5 21 12 21 Q19 21 19 18 Q19 16 17 15 Q15 14 15 11 Q15 8 12 3 Z" fill={p.color ?? 'currentColor'} fillOpacity="0.5" />
    </svg>
  );
}

export function TestTubeIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9 3 L9 18 Q9 21 12 21 Q15 21 15 18 L15 3" />
      <path d="M9 12 L15 12" />
      <line x1="8" y1="3" x2="16" y2="3" />
    </svg>
  );
}

export function DnaIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M8 4 Q16 8 8 12 Q16 16 8 20" />
      <path d="M16 4 Q8 8 16 12 Q8 16 16 20" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Emotion · Mode
// ─────────────────────────────────────────────────────────────────────────────

export function StarEyesFaceIcon(p: IconProps) {
  // 마음에 쏙 — 눈이 별
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" fill={p.color ?? 'currentColor'} fillOpacity="0.12" />
      <path d="M8 9 L8.6 10.2 L10 10.4 L9 11.3 L9.3 12.6 L8 12 L6.7 12.6 L7 11.3 L6 10.4 L7.4 10.2 Z" fill={p.color ?? 'currentColor'} stroke="none" />
      <path d="M16 9 L16.6 10.2 L18 10.4 L17 11.3 L17.3 12.6 L16 12 L14.7 12.6 L15 11.3 L14 10.4 L15.4 10.2 Z" fill={p.color ?? 'currentColor'} stroke="none" />
      <path d="M8 16 Q12 19 16 16" />
    </svg>
  );
}

export function SmileFaceIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9"  cy="10" r="0.8" fill={p.color ?? 'currentColor'} stroke="none" />
      <circle cx="15" cy="10" r="0.8" fill={p.color ?? 'currentColor'} stroke="none" />
      <path d="M9 15 Q12 17 15 15" />
    </svg>
  );
}

export function ThinkingFaceIcon(p: IconProps) {
  // 음... 별로 — 얇은 입 + 비대칭 눈썹
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9"  cy="11" r="0.8" fill={p.color ?? 'currentColor'} stroke="none" />
      <circle cx="15" cy="11" r="0.8" fill={p.color ?? 'currentColor'} stroke="none" />
      <path d="M7.5 8.5 Q9 7.5 10.5 8.5" />
      <path d="M9 16 L15 16" />
    </svg>
  );
}

export function GraduationCapIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M2 9 L12 5 L22 9 L12 13 Z" fill={p.color ?? 'currentColor'} fillOpacity="0.4" />
      <path d="M6 11 L6 16 Q12 19 18 16 L18 11" />
      <line x1="22" y1="9" x2="22" y2="14" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UI · Action · Status
// ─────────────────────────────────────────────────────────────────────────────

export function SparkleIcon(p: IconProps) {
  // 4-point sparkle / star burst (emoji sparkle 대체)
  return (
    <svg {...base(p)}>
      <path d="M12 3 L13.4 10.6 L21 12 L13.4 13.4 L12 21 L10.6 13.4 L3 12 L10.6 10.6 Z" fill={p.color ?? 'currentColor'} fillOpacity="0.65" />
    </svg>
  );
}

export function SparkleSmallIcon(p: IconProps) {
  return (
    <svg {...base({ ...p, size: p.size ?? 14 })}>
      <path d="M12 4 L13 11 L20 12 L13 13 L12 20 L11 13 L4 12 L11 11 Z" fill={p.color ?? 'currentColor'} fillOpacity="0.6" stroke="none" />
    </svg>
  );
}

export function StarBurstIcon(p: IconProps) {
  // 장식용 decorative star (eyebrow 사이 구분자)
  return (
    <svg {...base(p)}>
      <path d="M12 4 L13 11 L20 12 L13 13 L12 20 L11 13 L4 12 L11 11 Z" fill={p.color ?? 'currentColor'} fillOpacity="0.6" stroke="none" />
    </svg>
  );
}

export function StarFilledIcon(p: IconProps) {
  // 5-point classic star (rating용 star)
  return (
    <svg {...base(p)}>
      <path
        d="M12 3 L14.4 9.4 L21 9.6 L15.7 13.7 L17.7 20.2 L12 16.5 L6.3 20.2 L8.3 13.7 L3 9.6 L9.6 9.4 Z"
        fill={p.filled ? (p.color ?? 'currentColor') : 'none'}
        stroke={p.color ?? 'currentColor'}
      />
    </svg>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 12.5 L10 17 L19 7" />
    </svg>
  );
}

export function CrossIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 6 L18 18 M18 6 L6 18" />
    </svg>
  );
}

export function ArrowRightIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 12 L19 12 M14 7 L19 12 L14 17" />
    </svg>
  );
}

export function ArrowLeftIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M19 12 L5 12 M10 7 L5 12 L10 17" />
    </svg>
  );
}

export function ArrowUpIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 19 L12 5 M7 10 L12 5 L17 10" />
    </svg>
  );
}

export function ArrowDownIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 5 L12 19 M7 14 L12 19 L17 14" />
    </svg>
  );
}

export function RefreshIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 12 A9 9 0 0 1 18 6" />
      <path d="M21 12 A9 9 0 0 1 6 18" />
      <path d="M14 6 L18 6 L18 2" />
      <path d="M10 18 L6 18 L6 22" />
    </svg>
  );
}

export function CheckboxEmptyIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

export function CheckboxCheckedIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="4" y="4" width="16" height="16" rx="2" fill={p.color ?? 'currentColor'} fillOpacity="0.3" />
      <path d="M8 12 L11 15 L17 9" stroke={p.color ?? 'currentColor'} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tools · Devices · UI affordance
// ─────────────────────────────────────────────────────────────────────────────

export function StopwatchIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="13" r="7" />
      <line x1="10" y1="3" x2="14" y2="3" />
      <line x1="12" y1="3" x2="12" y2="5" />
      <line x1="12" y1="13" x2="15" y2="11" />
      <line x1="18" y1="6" x2="20" y2="4" />
    </svg>
  );
}

export function ClockIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="6" x2="12" y2="12" />
      <line x1="12" y1="12" x2="16" y2="14" />
    </svg>
  );
}

export function HourglassIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 3 L18 3 L18 6 L13 12 L18 18 L18 21 L6 21 L6 18 L11 12 L6 6 Z" />
    </svg>
  );
}

export function CameraIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <circle cx="12" cy="13" r="4" />
      <path d="M8 7 L9 4 L15 4 L16 7" />
    </svg>
  );
}

export function PhoneIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <line x1="11" y1="19" x2="13" y2="19" />
    </svg>
  );
}

export function StoreIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 9 L4 4 L20 4 L21 9" />
      <path d="M3 9 L3 20 L21 20 L21 9" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <rect x="9" y="13" width="6" height="7" />
    </svg>
  );
}

export function CalendarIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  );
}

export function MapIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 6 L9 4 L15 6 L21 4 L21 18 L15 20 L9 18 L3 20 Z" />
      <line x1="9" y1="4" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="20" />
    </svg>
  );
}

export function SearchIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="10" cy="10" r="6" />
      <line x1="14.5" y1="14.5" x2="20" y2="20" />
    </svg>
  );
}

export function EyeIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M2 12 Q7 5 12 5 Q17 5 22 12 Q17 19 12 19 Q7 19 2 12 Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function LightbulbIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9 18 L15 18" />
      <path d="M10 21 L14 21" />
      <path d="M8 14 Q5 11 6 8 Q7 4 12 4 Q17 4 18 8 Q19 11 16 14 L16 18 L8 18 Z" />
    </svg>
  );
}

export function WarningTriangleIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3 L22 20 L2 20 Z" />
      <line x1="12" y1="10" x2="12" y2="15" />
      <circle cx="12" cy="18" r="0.6" fill={p.color ?? 'currentColor'} stroke="none" />
    </svg>
  );
}

export function TrophyIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M7 4 L17 4 L17 9 Q17 13 12 13 Q7 13 7 9 Z" fill={p.color ?? 'currentColor'} fillOpacity="0.45" />
      <path d="M7 6 L4 6 L4 9 Q4 11 7 11" />
      <path d="M17 6 L20 6 L20 9 Q20 11 17 11" />
      <line x1="12" y1="13" x2="12" y2="17" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

export function TargetIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill={p.color ?? 'currentColor'} stroke="none" />
    </svg>
  );
}

export function FerrisWheelIcon(p: IconProps) {
  // 부케 휠 (UC Davis aroma wheel) 시각화
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="8" />
      <line x1="4"  y1="12" x2="20" y2="12" />
      <line x1="12" y1="4"  x2="12" y2="20" />
      <line x1="6"  y1="6"  x2="18" y2="18" />
      <line x1="18" y1="6"  x2="6"  y2="18" />
      <circle cx="12" cy="12" r="2" fill={p.color ?? 'currentColor'} stroke="none" />
    </svg>
  );
}

export function BoltIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M13 3 L5 13 L11 13 L9 21 L19 11 L13 11 Z" fill={p.color ?? 'currentColor'} fillOpacity="0.5" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Country flag — emoji 대체용 (단순 직사각형 + ISO 2-letter code)
// ─────────────────────────────────────────────────────────────────────────────

export interface CountryFlagProps {
  code: 'FR' | 'IT' | 'CL' | 'NZ' | 'ES' | 'AR' | 'US' | 'AU' | 'DE' | 'KR';
  size?: number;
}

const FLAG_PALETTE: Record<CountryFlagProps['code'], { bg: string; fg: string }> = {
  FR: { bg: '#0055A4', fg: '#FFFFFF' },
  IT: { bg: '#009246', fg: '#FFFFFF' },
  CL: { bg: '#0033A0', fg: '#FFFFFF' },
  NZ: { bg: '#012169', fg: '#FFFFFF' },
  ES: { bg: '#AA151B', fg: '#F1BF00' },
  AR: { bg: '#74ACDF', fg: '#FFFFFF' },
  US: { bg: '#3C3B6E', fg: '#FFFFFF' },
  AU: { bg: '#012169', fg: '#FFFFFF' },
  DE: { bg: '#000000', fg: '#FFCE00' },
  KR: { bg: '#FFFFFF', fg: '#0047A0' },
};

export function CountryFlag({ code, size = 18 }: CountryFlagProps) {
  const colors = FLAG_PALETTE[code];
  const w = Math.round(size * 1.5);
  const h = size;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} rx="2" fill={colors.bg} stroke="rgba(245,240,232,0.18)" strokeWidth="1" />
      <text
        x={w / 2}
        y={h / 2 + 0.5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-inter, system-ui, sans-serif)"
        fontSize={Math.round(h * 0.55)}
        fontWeight="700"
        fill={colors.fg}
        letterSpacing="0.04em"
      >
        {code}
      </text>
    </svg>
  );
}

export function RepeatIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 9 L8 5 L8 8 L18 8 L18 12" />
      <path d="M20 15 L16 19 L16 16 L6 16 L6 12" />
    </svg>
  );
}
