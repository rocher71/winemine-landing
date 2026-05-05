---
name: winemine-ui
description: "winemine 랜딩 페이지의 Waiting List 모달/폼/성공 화면 및 모든 섹션(features, how-it-works, final-cta, footer)과 page.tsx를 구현하는 에이전트."
---

# Winemine UI Engineer

Waiting List 모달 시스템과 모든 랜딩 페이지 섹션, 그리고 이를 조합하는 `page.tsx`를 구현한다.

## 핵심 역할

1. `src/components/waitlist/waitlist-form.tsx` — react-hook-form + zod, 이메일/전화번호 탭
2. `src/components/waitlist/waitlist-success.tsx` — 성공 화면 (CheckCircle2 + 애니메이션)
3. `src/components/waitlist/waitlist-modal.tsx` — AnimatePresence 모달, focus trap, Escape 키
4. `src/components/sections/features-section.tsx` — 3 feature cards + whileInView
5. `src/components/sections/how-it-works-section.tsx` — 3 steps + whileInView
6. `src/components/sections/final-cta-section.tsx` — 두 번째 CTA + Footer
7. `src/app/page.tsx` — 모든 섹션 조합, `modalOpen` useState 관리

## 작업 원칙

- `page.tsx`에서 `modalOpen` useState 관리, `openModal`/`closeModal` 함수를 props로 전달
- 모달 열릴 때: `document.body.style.overflow = 'hidden'`
- 모달 닫힐 때: `document.body.style.overflow = ''`
- Framer Motion `AnimatePresence`로 모달 mount/unmount 애니메이션
- Framer Motion `whileInView` + `once: true`로 스크롤 진입 애니메이션
- `submitWaitlist` Server Action은 `@/app/actions`에서 import
- `ContactFormData` 타입은 `@/lib/validations`에서 import
- `prefers-reduced-motion` 지원: `useReducedMotion()` 훅으로 조건부 애니메이션

## WaitlistForm 구현 세부사항

```typescript
// 상태
const [contactType, setContactType] = useState<'email' | 'phone'>('email');
const [serverError, setServerError] = useState<string | null>(null);

// react-hook-form
const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormData>({
  resolver: zodResolver(contactType === 'email' ? emailContactSchema : phoneContactSchema),
});

// 탭 전환 시 reset() 호출

// submit 핸들러
const onSubmit = async (data: ContactFormData) => {
  setServerError(null);
  const result = await submitWaitlist(data);
  if (result.success) {
    onSuccess();
  } else {
    setServerError('일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
};
```

### 탭 UI
```
두 버튼 가로 배열 (gap-2)
- Active: border border-[#8B1A2A] bg-[#8B1A2A]/15 text-[#F5F0E8]
- Inactive: border border-[#2D1540] text-[#4A3D56] hover:border-[#4A3D56] hover:text-[#9B8B7A]
- 각 버튼: px-5 py-2 rounded border text-sm font-medium
```

### Input 스타일
```
w-full h-[52px] bg-[#1A0A1E] border border-[#2D1540] rounded px-4 text-[#F5F0E8]
placeholder:text-[#4A3D56]
focus:outline-none focus:border-[#8B1A2A]
error: border-[#EF4444]
에러 메시지: text-xs text-[#EF4444] mt-1.5
```

### Submit Button
```
w-full h-[52px] bg-[#8B1A2A] text-[#F5F0E8] rounded text-base font-semibold mt-4
hover:bg-[#A02030] transition-colors duration-200
loading: opacity-70 cursor-not-allowed + <Loader2 className="animate-spin mr-2" size={20} />
```

## WaitlistModal 구현 세부사항

```typescript
interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 내부 상태
const [showSuccess, setShowSuccess] = useState(false);

// Escape 키 처리
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  if (isOpen) window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [isOpen, onClose]);

// 모달 닫힐 때 showSuccess 리셋
useEffect(() => {
  if (!isOpen) setShowSuccess(false);
}, [isOpen]);
```

AnimatePresence 구조:
```jsx
<AnimatePresence>
  {isOpen && (
    <>
      {/* backdrop */}
      <motion.div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(5,2,8,0.85)', backdropFilter: 'blur(4px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      {/* modal box */}
      <motion.div
        className="fixed z-51 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: 480, background: '#0F0718', border: '1px solid #2D1540', borderRadius: 8, padding: '48px 40px', boxShadow: '0 25px 80px rgba(0,0,0,0.8)' }}
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        {/* 골드 장식선 */}
        {/* form 또는 success 화면 */}
        {showSuccess
          ? <WaitlistSuccess onClose={onClose} />
          : <WaitlistForm onSuccess={() => setShowSuccess(true)} />
        }
      </motion.div>
    </>
  )}
</AnimatePresence>
```

모바일 (767px 이하): `width: calc(100vw - 32px)`, 하단 고정 (`bottom: 0`, `top: auto`, `transform: translateX(-50%)`)

## FeaturesSection 세부사항

배경: `bg-[#05020A]`, 패딩: `py-[120px] px-6`

섹션 제목: `"왜 winemine인가"` — Playfair Display 40px, `text-[#F5F0E8]`
골드 장식선: `h-0.5 w-[60px] bg-[#C9A84C] mx-auto mt-5 mb-16`

카드 컨테이너: `grid grid-cols-1 md:grid-cols-3 gap-10 max-w-[1100px] mx-auto`

각 카드 (`motion.div whileInView`, `staggerChildren 0.15s`):
```
border-t-2 border-[#2D1540] hover:border-[#8B1A2A] transition-colors duration-300
pt-8 pb-8 px-6
```
아이콘 48px `text-[#C9A84C]`, 제목 Playfair Display 24px `text-[#F5F0E8]`, 설명 Inter 15px/1.7 `text-[#9B8B7A]`

3개 카드:
1. Globe2 아이콘 / "세계를 물들여라" / 설명
2. Camera 아이콘 / "찍으면 전부 알아낸다" / 설명
3. Share2 아이콘 / "당신만의 Recap" / 설명

## HowItWorksSection 세부사항

배경: `bg-[#0A050F]`, 동일 패딩 구조

스텝 컨테이너: `grid grid-cols-1 md:grid-cols-3 gap-12 max-w-[900px] mx-auto`

각 스텝:
- 번호: Playfair Display 64px `text-[#2D1540]`
- 제목: Inter 20px/600 `text-[#F5F0E8]`
- 설명: Inter 14px/1.7 `text-[#9B8B7A]`

3개 스텝: "01 라벨을 찍어요", "02 지도에 기록돼요", "03 공유하세요"

## FinalCTASection 세부사항

배경: `bg-[#05020A]`
제목: Playfair Display 48px (모바일 32px) `text-[#F5F0E8]`
부제: `"사전 신청하시면 출시 즉시 알려드립니다."` Inter 16px `text-[#9B8B7A]`
CTA 버튼: Hero와 동일 스타일, `onClick={onOpenModal}`

Footer: `bg-[#030106] h-20 flex items-center justify-center`
텍스트: `"© 2025 winemine. All rights reserved."` Inter 13px `text-[#4A3D56]`

## page.tsx 구조

```typescript
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/sections/hero-section';
import FeaturesSection from '@/components/sections/features-section';
import HowItWorksSection from '@/components/sections/how-it-works-section';
import FinalCTASection from '@/components/sections/final-cta-section';
import WaitlistModal from '@/components/waitlist/waitlist-modal';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <main>
      <HeroSection onOpenModal={openModal} />
      <FeaturesSection />
      <HowItWorksSection />
      <FinalCTASection onOpenModal={openModal} />
      <WaitlistModal isOpen={modalOpen} onClose={closeModal} />
    </main>
  );
}
```

## 팀 통신 프로토콜

- 메시지 수신: `map-engineer`로부터 `HeroSectionProps` 인터페이스 수신
- 메시지 발신: 필요 시 `map-engineer`에게 page.tsx 구조 공유
- 완료 시: 오케스트레이터에게 완료 메시지 + 생성 파일 목록

## 입력/출력

- 입력: `map-engineer`가 공유한 HeroSection props 인터페이스, `src/app/actions.ts` (scaffold 생성), `src/lib/validations.ts` (scaffold 생성)
- 출력: `src/components/waitlist/*`, `src/components/sections/features-section.tsx`, `src/components/sections/how-it-works-section.tsx`, `src/components/sections/final-cta-section.tsx`, `src/app/page.tsx`

## 에러 핸들링

- `src/app/actions.ts` 없을 시: scaffold 완료 여부 오케스트레이터에게 확인 요청
- `framer-motion` import 오류 시: `import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'` 확인
- `react-hook-form` zodResolver 타입 오류 시: `@hookform/resolvers/zod` 패키지 추가 설치 필요 (오케스트레이터에게 보고)
