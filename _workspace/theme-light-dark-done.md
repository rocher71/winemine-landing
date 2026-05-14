# Light/Dark Theme System — Implementation Report

날짜: 2026-05-14
브랜치: dev

## 개요

winemine 랜딩 페이지에 시스템 `prefers-color-scheme` 기반의 라이트/다크 테마 시스템을 구축했다.
**기본은 라이트(시스템 설정 미감지 시 라이트)** 이며, 라이트 모드는 **화이트 와인 컨셉(밝은 크림 배경 + 골드 포인트)** 으로 디자인했다.

수동 토글 UI는 만들지 않았다. CSS의 `@media (prefers-color-scheme: dark)`만으로 동작한다.

---

## 수정한 파일 수

총 **37개 파일**.

- `src/app/globals.css` — CSS 변수 토큰 시스템 정의
- `src/app/layout.tsx` — `<html>` 태그에 `color-scheme: light dark` 메타/inline 추가
- `src/app/tasting-note-playground/page.tsx`
- `src/components/map/world-map.tsx`
- `src/components/sections/*.tsx` — 17개 섹션 컴포넌트
- `src/components/tasting-note/*.tsx` — 9개 인터랙티브 컴포넌트
- `src/components/ui/*.tsx` — floating-cta, locale-switcher, store-buttons
- `src/components/waitlist/*.tsx` — modal, form, success
- `src/components/wine-bottles/wine-bottle.tsx` — 와인병 SVG 프리셋

`src/components/icons/wine-icons.tsx`는 국기 색상이라 의도적으로 토큰화하지 않음.
`src/components/providers/locale-provider.tsx`는 색상 없음.

---

## 색상 토큰 매핑

### CSS 변수 토큰 정의 (`globals.css`)

| 토큰 | 라이트 모드 | 다크 모드 |
|---|---|---|
| `--color-wine-red` | `#8B1A2A` | `#8B1A2A` (공통) |
| `--color-wine-red-hover` | `#A02030` | `#A02030` (공통) |
| `--color-gold` | `#C9A84C` | `#C9A84C` (공통) |
| `--color-error` | `#EF4444` | `#EF4444` (공통) |
| `--color-bg-deepest` | `#FBF7F0` | `#05020A` |
| `--color-bg-deep` | `#F5EFE3` | `#0A050F` |
| `--color-bg-surface` | `#FFFBF2` | `#0F0718` |
| `--color-bg-map` | `#EAE0CC` | `#1A0A1E` |
| `--color-bg-input` | `rgba(245,239,227,0.6)` | `rgba(26,10,30,0.6)` |
| `--color-text-primary` | `#2A1F12` | `#F5F0E8` |
| `--color-text-secondary` | `#5A4830` | `#D4C5B0` |
| `--color-text-muted` | `#8B7A60` | `#9B8B7A` |
| `--color-text-disabled` | `#B8A88E` | `#4A3D56` |
| `--color-border` | `rgba(201,168,76,0.30)` | `#2D1540` |
| `--color-border-soft` | `rgba(42,31,18,0.10)` | `rgba(255,255,255,0.06)` |
| `--color-border-active` | `var(--color-gold)` | `var(--color-wine-red)` |
| `--overlay-soft` | `rgba(42,31,18,0.04)` | `rgba(255,255,255,0.04)` |
| `--overlay-medium` | `rgba(42,31,18,0.08)` | `rgba(255,255,255,0.08)` |
| `--overlay-strong` | `rgba(42,31,18,0.16)` | `rgba(255,255,255,0.16)` |

### 추가로 도입한 토큰

| 토큰 | 라이트 모드 | 다크 모드 | 용도 |
|---|---|---|---|
| `--color-map-bg` | `#F0E7D2` | `#0d0810` | 지도 캔버스 배경 |
| `--color-map-inactive` | `#E0D2B5` | `#1A0A2E` | 비-와인 국가 fill |
| `--color-map-stroke` | `#C9B894` | `#2A0C58` | 지도 stroke |
| `--color-paper` | `#F5F0E8` | `#F5F0E8` | **모드 무관**, 와인 라벨/노트 종이 |
| `--color-ink` | `#1A0A1E` | `#1A0A1E` | **모드 무관**, 라벨 잉크 |
| `--color-ink-dim` | `rgba(26,10,30,0.42)` | `rgba(26,10,30,0.42)` | **모드 무관**, dim ink |
| `--color-ink-very-dim` | `rgba(26,10,30,0.18)` | `rgba(26,10,30,0.18)` | **모드 무관**, very dim ink |
| `--color-ink-line` | `rgba(26,10,30,0.10)` | `rgba(26,10,30,0.10)` | **모드 무관**, ink line |
| `--color-modal-backdrop` | `rgba(42,31,18,0.55)` | `rgba(5,2,8,0.85)` | 모달 backdrop (가시성 보장) |

**Paper/Ink는 의도적으로 두 모드 공통**이다. 와인 라벨, 테이스팅 노트 paper, 영수증 등은 두 모드에서 모두 "물리적인 종이"로 보여야 한다.

---

## 치환된 hex/rgba 종류와 횟수

자동화된 perl 정규식으로 일괄 치환 (단어 경계 보장).

### Hex → 토큰
- `#05020A` (bg-deepest) → `var(--color-bg-deepest)`
- `#0A050F` (bg-deep) → `var(--color-bg-deep)`
- `#0F0718` (bg-surface) → `var(--color-bg-surface)`
- `#1A0A1E` (bg-map) → `var(--color-bg-map)`
- `#F5F0E8` (text-primary) → `var(--color-text-primary)`
- `#D4C5B0` (text-secondary) → `var(--color-text-secondary)`
- `#9B8B7A`, `#6A5E4A`, `#7A6E5A` (muted) → `var(--color-text-muted)`
- `#4A3D56` (disabled) → `var(--color-text-disabled)`
- `#2D1540` (border) → `var(--color-border)`
- `#8B1A2A` (wine-red) → `var(--color-wine-red)`
- `#A02030` (wine-red-hover) → `var(--color-wine-red-hover)`
- `#C9A84C` (gold) → `var(--color-gold)`
- `#EF4444` (error) → `var(--color-error)`
- 맵 다크 변형 (`#04010A`, `#0d0810`, `#0C0C0C`, `#060115`, `#08051A`) → `var(--color-map-bg)`
- 맵 비활성 변형 (`#1A0A2E`, `#1C0840`, `#1C0838`) → `var(--color-map-inactive)`
- 맵 stroke 변형 (`#28085A`, `#2A0C58`, `#3A1068`) → `var(--color-map-stroke)`

### Rgba (overlays) → 토큰
- `rgba(255,255,255,0.015~0.045)` → `var(--overlay-soft)`
- `rgba(255,255,255,0.05~0.095)` → `var(--color-border-soft)`
- `rgba(255,255,255,0.10~0.20)` → `var(--overlay-medium)`
- `rgba(255,255,255,0.21+)` → `var(--overlay-strong)`
- `rgba(15,7,24,*)` (dark surface 변형) → `var(--color-bg-surface)`
- `rgba(4,1,10,*)` / `rgba(5,2,8,*)` / `rgba(5,2,14,*)` (deepest 변형) → alpha 구간별 overlay-* 토큰

### 합계 (대략)
- 처리한 hex 색상 인스턴스: **약 470건** → 0건 (의도적으로 유지한 mode-invariant 색 제외)
- 처리한 white rgba 인스턴스: **약 70건** → 0건
- 처리한 deep-dark rgba 인스턴스: **약 20건** → 0건

---

## 의도적으로 유지한 색상

다음은 토큰화하지 않고 그대로 둔 색이다. 모드 변화와 무관하게 "기능적/시각적 의미"가 있는 색이기 때문.

| 종류 | 예시 | 사유 |
|---|---|---|
| Bright Wine accent | `#C41E3A`, `#D42040`, `#CC1C34`, `#E8253E` | 지도 와인 국가 fill — 두 모드에서 동일하게 빨간색 |
| Wine bottle 물리 색 | `#0E1A0D`(병 유리), `#3a0a14`(액체) | 와인병 SVG의 물성 표현 |
| 국기 색 (`wine-icons.tsx`) | `#0055A4`, `#FFFFFF` (FR) 등 | 국가 식별 의미 |
| 브랜드 로고 색 | Google Play의 `#FFD740`, `#F44336`... | 외부 브랜드 가이드 |
| Burgundy 와인 dot 색 | 각 와인의 `color: '#56142b'` 등 | 데이터 시각화 — 와인 종류별 식별 |
| `rgba(0,0,0,*)` 그림자/모달 darkening | `boxShadow: 0 25px 80px rgba(0,0,0,0.8)` | 그림자는 두 모드 공통 검정 |
| `rgba(201,168,76,*)` 골드 알파 | 골드 강조 글로우 | 골드는 두 모드 공통 |
| `rgba(196,30,58,*)` / `rgba(139,26,42,*)` 와인 레드 알파 | 와인 레드 글로우 | 와인 레드는 두 모드 공통 |
| `'red'`, `'white'`, `'sparkling'` 문자열 리터럴 | `WineType` discriminator | 타입 식별자 (색이 아님) |

---

## 빌드 결과

```
✓ Compiled successfully in 18.9s
✓ Generating static pages (8/8)

Route (app)                                 Size  First Load JS
┌ ƒ /                                     198 kB         388 kB
├ ƒ /_not-found                            996 B         103 kB
├ ƒ /tasting-note-playground             14.8 kB         205 kB
```

**0 error, 0 warning** (TypeScript strict 통과).

---

## 라이트/다크 시각 점검

### 자동 점검
- `npm run dev` 실행 → `GET / 200` 응답 확인
- Recharts 경고 1건 — 사전부터 존재하던 컴포넌트 콘솔 경고 (테마와 무관)

### 수동 점검 권장 항목
- `prefers-color-scheme` OS 설정 변경 시 즉시 전환되는지 (브라우저 DevTools의 Rendering 패널에서도 가능)
- Hero 슬라이딩 세계 지도: 와인 국가 빨간색은 두 모드 동일, 비-와인 국가는 라이트 모드에서 베이지/크림 톤
- Burgundy 섹션 부르고뉴 dept 라벨: 와인 라벨 cream/ink 그대로 유지, 지도 빈 영역만 모드별 전환
- Tasting Note 섹션 paper 카드: 두 모드 모두 cream 종이에 dark ink (의도)
- Cellar 섹션 wine bottle: 와인 라벨이 cream paper로 유지
- Waitlist Modal backdrop: 두 모드 모두 충분히 어두워서 콘텐츠가 가려짐

---

## 미해결 이슈

1. **Hero gradient 가시성**: 라이트 모드에서 hero 하단 `overlay-strong`(16%)이 다크 모드 대비 약하다. CTA 버튼/태그라인 가독성은 보장되나, 디자인 의도(드라마틱한 vignette)가 일부 손실될 수 있음. 필요 시 hero 전용 gradient 토큰을 분리할 것.
2. **Wine bottle preset 색감**: `red-bordeaux`, `red-burgundy` 등 액체/유리 색은 그대로 두었으므로 라이트 모드에서도 다크 보틀이 자연스럽게 보일 것. 다만 라이트 배경 위에서는 보틀 자체가 어둡게 도드라질 수 있음 — 디자인 의도에 부합한다고 판단해 유지.
3. **Light 모드 색감 미세 조정**: 화이트 와인 컨셉의 크림 톤(`#FBF7F0`, `#F5EFE3` 등) 대비가 처음 보면 다소 평면적으로 느껴질 수 있음. 시각 점검 후 그라데이션/그림자 강도 조정이 필요할 수 있음.
4. **`tasting-note-playground` 페이지**: 토큰화는 적용됐지만 본 페이지는 main 마운트 외부 디버그 페이지라 별도 QA 권장.

---

## 절대 금지 사항 준수 확인

- 커밋: **수행하지 않음** (사용자가 별도 진행)
- `ko/en` JSON 파일: **변경하지 않음**
- Tailwind 미사용 (이 프로젝트는 inline style 위주, 그대로 유지)
- localStorage / ThemeProvider Context: **만들지 않음** (CSS만으로 처리)
- 새 색상 도입: 작업 사양에 명시된 토큰 셋 + (추가 협의 필요 시) `--color-map-*`, `--color-paper/ink/*`, `--color-modal-backdrop` 한정으로만 도입

---

## 다음 액션 (사용자가 수동으로)

1. `npm run dev` 실행 후 OS 다크모드 토글
2. 브라우저 DevTools → Rendering → "Emulate CSS media feature prefers-color-scheme" 로 빠른 전환 점검
3. 각 섹션별 가독성 / 그라데이션 강도 / 그림자 강도 점검
4. 필요 시 토큰 값 미세 조정 후 commit
