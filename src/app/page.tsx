'use client';

import { useState } from 'react';
import HeroSection from '@/components/sections/hero-section';
import WineDiscoverySection from '@/components/sections/wine-discovery-section';
import BurgundySection from '@/components/sections/burgundy-section';
import CellarSection from '@/components/sections/cellar-section';
import TastingNoteSection from '@/components/sections/tasting-note-section';
import PriceIntelligenceSection from '@/components/sections/price-intelligence-section';
import FavoritesAlertSection from '@/components/sections/favorites-alert-section';
import VineyardStrip from '@/components/sections/vineyard-strip';
// import FeaturesSection from '@/components/sections/features-section'; // 미마운트 (롤백 대비 보존)
import CommunityTonightSection from '@/components/sections/community-tonight-section';
import LevelBadgeSection from '@/components/sections/level-badge-section';
import InstagramPreviewSection from '@/components/sections/instagram-preview-section';
// import HowItWorksSection from '@/components/sections/how-it-works-section'; // 미마운트 (롤백 대비 보존)
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

      {/* 2. Wine Discovery — 초보자 친화 스크롤 스토리텔링 (라벨 - 입맛 - Recap - 부르고뉴 전환) */}
      <WineDiscoverySection />

      {/* 3. 부르고뉴 드릴다운 — AI가 자동 분류한 내 와인 컬렉션 */}
      <BurgundySection />

      {/* 4. 셀러 — 보유 와인 + 음용 적기 추적 */}
      <CellarSection />

      {/* 5. 테이스팅 노트 — 디지털 양식 시연 (White/Red/Sparkling/Blind) */}
      <TastingNoteSection onOpenModal={openModal} />

      {/* 6. 가격 인텔리전스 — 추이 그래프 + 매장별 비교 + 외부 평점 */}
      <PriceIntelligenceSection />

      {/* 7. 즐겨찾기 + 가격 알림 — 4스텝 플로우 */}
      <FavoritesAlertSection />

      {/* 8. 포도밭 갤러리 — 와인 산지 사진 + 대기 사진 스트립 */}
      <VineyardStrip />

      {/* 9. (미마운트) FeaturesSection — '와인 카드 쇼케이스'. 재마운트 시 위치 복원 */}
      {/* <FeaturesSection /> */}

      {/* 10. Tonight, Together — 오늘 밤 마시는 사람들 커뮤니티 */}
      <CommunityTonightSection />

      {/* 11. Grow Your Cellar — 레벨·뱃지 게이미피케이션 */}
      <LevelBadgeSection />

      {/* 12. Recap 공유 — PhoneMockup + StoryCard */}
      <InstagramPreviewSection />

      {/* 13. (미마운트) HowItWorksSection — '사용 흐름 6단계'. 재마운트 시 위치 복원 */}
      {/* <HowItWorksSection /> */}

      {/* 14. 최종 CTA */}
      <FinalCTASection onOpenModal={openModal} />

      <WaitlistModal isOpen={modalOpen} onClose={closeModal} />
      <FloatingCTA onOpenModal={openModal} isModalOpen={modalOpen} />
    </main>
  );
}
