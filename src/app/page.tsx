'use client';

import { useState } from 'react';
import HeroSection from '@/components/sections/hero-section';
import FranceWineSection from '@/components/sections/france-wine-section';
import FeaturesSection from '@/components/sections/features-section';
import HowItWorksSection from '@/components/sections/how-it-works-section';
import InstagramPreviewSection from '@/components/sections/instagram-preview-section';
import FinalCTASection from '@/components/sections/final-cta-section';
import WaitlistModal from '@/components/waitlist/waitlist-modal';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const scrollToPreview = () => {
    const el = document.getElementById('instagram-preview');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main>
      {/* 1. 전 세계 지도 슬라이딩 배경 + 히어로 */}
      <HeroSection onOpenModal={openModal} />

      {/* 2. 프랑스 확대 드릴다운 — 스크롤 연동 */}
      <FranceWineSection />

      {/* 3. 인터랙티브 기능 소개 */}
      <FeaturesSection onScrollToPreview={scrollToPreview} />

      {/* 4. 사용 흐름 */}
      <HowItWorksSection />

      {/* 5. 인스타 공유 미리보기 */}
      <InstagramPreviewSection id="instagram-preview" />

      {/* 6. 최종 CTA */}
      <FinalCTASection onOpenModal={openModal} />

      <WaitlistModal isOpen={modalOpen} onClose={closeModal} />
    </main>
  );
}
