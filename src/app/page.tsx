'use client';

import { useState } from 'react';
import HeroSection from '@/components/sections/hero-section';
import FranceWineSection from '@/components/sections/france-wine-section';
import FranceWineDetailSection from '@/components/sections/france-wine-detail-section';
import BurgundySection from '@/components/sections/burgundy-section';
import VineyardStrip from '@/components/sections/vineyard-strip';
import FeaturesSection from '@/components/sections/features-section';
import MarketStatsSection from '@/components/sections/market-stats-section';
import HowItWorksSection from '@/components/sections/how-it-works-section';
import InstagramPreviewSection from '@/components/sections/instagram-preview-section';
import FinalCTASection from '@/components/sections/final-cta-section';
import WaitlistModal from '@/components/waitlist/waitlist-modal';
import { FloatingCTA } from '@/components/ui/floating-cta';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal  = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const scrollToPreview = () => {
    document.getElementById('instagram-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main>
      {/* 1. Hero — 전 세계 지도 슬라이딩 배경 */}
      <HeroSection onOpenModal={openModal} />

      {/* 2. 프랑스 드릴다운 — 스크롤 기반 지역 등장 */}
      <FranceWineSection />

      {/* 3. 부르고뉴 드릴다운 — 상세지역·생산자·밭 3필터 */}
      <BurgundySection />

      {/* 4. 프랑스 와인 상세 — 정적 지도 + 항상 표시되는 패널 */}
      <FranceWineDetailSection />

      {/* 4. 포도밭 갤러리 — 와인 산지 사진 + 대기 사진 스트립 */}
      <VineyardStrip />

      {/* 4. WineMine 핵심 기능 소개 */}
      <FeaturesSection onScrollToPreview={scrollToPreview} />

      {/* 5. 한국 와인 시장 통계 */}
      <MarketStatsSection />

      {/* 6. 사용 흐름 */}
      <HowItWorksSection />

      {/* 7. 인스타 공유 미리보기 */}
      <InstagramPreviewSection id="instagram-preview" />

      {/* 8. 최종 CTA */}
      <FinalCTASection onOpenModal={openModal} />

      <WaitlistModal isOpen={modalOpen} onClose={closeModal} />
      <FloatingCTA onOpenModal={openModal} isModalOpen={modalOpen} />
    </main>
  );
}
