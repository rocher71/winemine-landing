# map-engineer 완료 보고

## 완료 태스크
- Task #1: WorldMap 컴포넌트
- Task #2: HeroSection

## 생성/수정된 파일
- `src/components/map/world-map.tsx` — react-simple-maps v3 기반 인터랙티브 세계 지도
- `src/components/sections/hero-section.tsx` — 지도 배경 + 로고 오버레이 + CTA
- `src/types/react-simple-maps.d.ts` — react-simple-maps 모듈 타입 선언 (의존성 추가 없이 strict TS 통과)

## 구현 노트
- WorldMap은 v3 호환을 위해 `motion.path d={geo.properties.path}` 대신 `<Geography>` + inline `style.default.fillOpacity` + CSS transition + `requestAnimationFrame` 트리거 방식으로 stagger 애니메이션 구현 (delay = wineIndex * 50ms, 800ms ease-out)
- HeroSection은 `dynamic(() => import('@/components/map/world-map'), { ssr: false })`로 클라이언트 전용 로드
- `useReducedMotion` 처리 포함 (h1/divider/p/CTA fadeUp + scroll indicator bounce)

## 공개 인터페이스
```ts
// hero-section.tsx
interface HeroSectionProps {
  onOpenModal: () => void;
}

// world-map.tsx
interface WorldMapProps {
  className?: string;
  onCountryHover?: (name: string | null) => void;
}
```

## 검증
- `npx tsc --noEmit` 통과 (에러 0)

## 의존성
- `public/world-110m.json` 사용 (스캐폴드가 이미 다운로드함)
- `react-simple-maps@3.0.0`, `framer-motion@12`, `lucide-react`, `next/dynamic`
