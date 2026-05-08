'use client';

import { useState } from 'react';
import HeroSection from '@/components/sections/hero-section';
import WineDiscoverySection from '@/components/sections/wine-discovery-section';
import BurgundySection from '@/components/sections/burgundy-section';
import VineyardStrip from '@/components/sections/vineyard-strip';
import FeaturesSection from '@/components/sections/features-section';
import HowItWorksSection from '@/components/sections/how-it-works-section';
import FinalCTASection from '@/components/sections/final-cta-section';
import WaitlistModal from '@/components/waitlist/waitlist-modal';
import { FloatingCTA } from '@/components/ui/floating-cta';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal  = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <main>
      {/* 1. Hero — 전 세계 지도 슬라이딩 배경 */}
      <HeroSection onOpenModal={openModal} />

      {/* 2. Wine Discovery — 초보자 친화 스크롤 스토리텔링 (라벨 → 입맛 → Recap → 부르고뉴 전환) */}
      <WineDiscoverySection />

      {/* 3. 부르고뉴 드릴다운 — AI가 자동 분류한 내 와인 컬렉션 */}
      <BurgundySection />

      {/* 4. 포도밭 갤러리 — 와인 산지 사진 + 대기 사진 스트립 */}
      <VineyardStrip />

      {/* 5. WineMine 와인 카드 쇼케이스 (단일 패널) */}
      <FeaturesSection />

      {/* 6. 사용 흐름 */}
      <HowItWorksSection />

      {/* 7. 최종 CTA */}
      <FinalCTASection onOpenModal={openModal} />

      <WaitlistModal isOpen={modalOpen} onClose={closeModal} />
      <FloatingCTA onOpenModal={openModal} isModalOpen={modalOpen} />
    </main>
  );
}
