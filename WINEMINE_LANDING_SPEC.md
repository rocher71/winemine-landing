```xml
<project_specification>

<project_name>winemine Landing Page - Wine Tracking App Waitlist</project_name>

<overview>
winemine은 와인 라벨을 촬영하면 AI가 와인을 인식하고, 마신 와인을 세계 지도 위에 지역별로 시각화해 기록하는 앱이다. 지역을 누르면 드릴다운(프랑스 → 보르도 → 포므롤)되고, 지역별 투명도로 얼마나 다양한 와인을 마셨는지 한눈에 보인다. Flighty/YouTube Music Recap처럼 인스타그램 스토리에 바로 공유할 수 있는 recap 이미지 생성이 핵심 기능이다.

이 스펙은 앱 출시 전 대기자 명단을 모으기 위한 **랜딩 페이지만** 다룬다. 첫 화면에 인터랙티브 세계 지도를 배경으로 서비스 가치를 보여주고, "앱 다운받기" CTA 버튼을 누르면 이메일/전화번호를 입력하는 waiting list 팝업이 열린다. 수집된 연락처는 Supabase PostgreSQL에 저장된다.

CRITICAL: 이 빌드는 랜딩 페이지 + waiting list 수집만 포함한다. 실제 와인 기록, 지도 드릴다운, AI 라벨 인식, 계정 시스템은 모두 out of scope다.
</overview>

<scope_boundaries>
  <in_scope>
    - Hero 섹션: 인터랙티브 세계 지도 배경 (demo 데이터 기반 opacity 표현), winemine 로고, 태그라인, CTA 버튼
    - Waiting list 모달: 이메일 또는 전화번호 입력, 중복 체크, 성공 확인 화면
    - Supabase waiting_list 테이블 연동 (이메일/전화번호 저장)
    - 기능 소개 섹션: 앱의 3가지 핵심 기능 소개 (지도 기록, 라벨 스캔, 스토리 공유)
    - How It Works 섹션: 3단계 사용 흐름
    - 하단 CTA 섹션: 두 번째 waiting list 신청 유도
    - 반응형: 모바일/태블릿/데스크탑 완전 지원
    - 메타 태그 (OG, Twitter Card) for 소셜 공유
    - Vercel 배포
  </in_scope>
  <out_of_scope>
    - 사용자 계정/로그인 시스템
    - 실제 와인 기록 기능
    - AI 라벨 인식
    - 지도 드릴다운 (실제 앱 기능)
    - Instagram recap 이미지 생성
    - 어드민 대시보드 (waiting list 관리용)
    - 이메일 뉴스레터 발송 (Resend 등 이메일 서비스 연동)
    - 다국어 지원 (한국어/영어 선택)
    - 분석 도구 (GA, Amplitude 등) 연동
  </out_of_scope>
  <future_considerations>
    - 어드민 대시보드: waiting list 조회/관리 (Phase 2)
    - 이메일 자동발송: 신청 확인 이메일 (Phase 2)
    - 다국어 지원: 영어/한국어 (Phase 2)
    - 앱 출시 후: 실제 App Store 링크로 CTA 교체 (Phase 3)
  </future_considerations>
</scope_boundaries>

<technology_stack>
  <frontend_application>
    <framework>Next.js 15.3 App Router with TypeScript 5.7</framework>
    <build_tool>Turbopack (Next.js 내장)</build_tool>
    <styling>Tailwind CSS v4.0 + shadcn/ui v2.0</styling>
    <routing>Next.js App Router (단일 페이지, / 라우트만 존재)</routing>
    <state_management>React useState/useEffect (외부 상태관리 라이브러리 불필요)</state_management>
  </frontend_application>
  <data_layer>
    <database>Supabase PostgreSQL (waiting_list 테이블)</database>
    <client>@supabase/supabase-js v2.49</client>
    <note>서버 액션(Server Action)으로 waiting list INSERT. 클라이언트에서 Supabase에 직접 접근하지 않는다.</note>
  </data_layer>
  <libraries>
    <map>react-simple-maps v3.0 - SVG 기반 세계 지도 (GeoJSON 렌더링)</map>
    <animation>framer-motion v12.0 - 지도 opacity 애니메이션, 모달 트랜지션, 스크롤 입장 효과</animation>
    <form>react-hook-form v7.54 + zod v3.24 - 이메일/전화번호 유효성 검사</form>
    <icons>lucide-react v0.475 - UI 아이콘</icons>
    <fonts>next/font (Playfair Display + Inter) - Google Fonts 자동 최적화</fonts>
    <topojson>topojson-client v3.1 - GeoJSON 세계 지도 데이터 파싱</topojson>
  </libraries>
</technology_stack>

<prerequisites>
  <environment_setup>
    - Node.js v20+ and npm v10+
    - Supabase 계정 및 프로젝트 생성 (무료 tier 사용 가능)
    - Vercel 계정 (배포용)
  </environment_setup>
  <build_configuration>
    - Next.js 15 App Router
    - TypeScript strict mode
    - Tailwind CSS v4 with @tailwindcss/postcss
    - Path alias: @ → src/
    - next/font으로 Playfair Display (serif headings) + Inter (body) 로드
  </build_configuration>
</prerequisites>

<environment_variables>
  <variable>
    <name>NEXT_PUBLIC_SUPABASE_URL</name>
    <description>Supabase 프로젝트 URL (패턴 통일용)</description>
    <required>true</required>
    <example>https://abcdefgh.supabase.co</example>
  </variable>
  <variable>
    <name>SUPABASE_SERVICE_ROLE_KEY</name>
    <description>Supabase Service Role Key - 서버 액션에서만 사용. 클라이언트에 절대 노출 금지.</description>
    <required>true</required>
    <example>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</example>
    <note>NEXT_PUBLIC_ 접두사 없이 서버 전용으로만 사용. anon key가 아닌 service_role key.</note>
  </variable>
  <variable>
    <name>NEXT_PUBLIC_SITE_URL</name>
    <description>배포된 사이트 URL (OG 메타 태그, canonical URL 용도)</description>
    <required>false</required>
    <example>https://winemine.com</example>
  </variable>
</environment_variables>

<file_structure>
winemine/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout: font, metadata, OG tags
│   │   ├── page.tsx                # 메인 랜딩 페이지 (섹션들 조합)
│   │   ├── globals.css             # Tailwind v4 imports, 커스텀 CSS
│   │   └── actions.ts              # Server Action: submitWaitlist()
│   ├── components/
│   │   ├── sections/
│   │   │   ├── hero-section.tsx        # 지도 배경 + 로고 + CTA
│   │   │   ├── features-section.tsx    # 3가지 핵심 기능 소개
│   │   │   ├── how-it-works-section.tsx # 3단계 사용 흐름
│   │   │   └── final-cta-section.tsx   # 하단 두 번째 CTA
│   │   ├── map/
│   │   │   └── world-map.tsx           # react-simple-maps 인터랙티브 지도
│   │   ├── waitlist/
│   │   │   ├── waitlist-modal.tsx      # 모달 래퍼 (Framer Motion)
│   │   │   ├── waitlist-form.tsx       # 이메일/전화번호 폼 (react-hook-form)
│   │   │   └── waitlist-success.tsx    # 신청 완료 화면
│   │   └── ui/                         # shadcn/ui 컴포넌트들
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── dialog.tsx
│   │       └── label.tsx
│   └── lib/
│       ├── supabase-server.ts      # Supabase 서버 클라이언트 (service role)
│       ├── validations.ts          # Zod 스키마: 이메일/전화번호
│       └── utils.ts                # cn() 헬퍼
├── public/
│   └── world-110m.json             # GeoJSON 세계 지도 데이터 (topojson 110m)
├── .env.local                      # 로컬 환경 변수 (git ignore)
├── .env.example                    # 환경 변수 템플릿 (git 포함)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
</file_structure>

<core_data_entities>
  <waitlist>
    Supabase PostgreSQL 테이블: waitlist

    - id: uuid (PRIMARY KEY, DEFAULT gen_random_uuid())
    - contact: varchar(255) (NOT NULL, UNIQUE) — 이메일 주소 또는 전화번호
    - contact_type: varchar(10) (NOT NULL, CHECK IN ('email', 'phone')) — 입력 타입 구분
    - created_at: timestamptz (DEFAULT now(), NOT NULL)
    - ip_address: varchar(50) (nullable) — 중복 제출 감지용
    - user_agent: text (nullable) — 디바이스 분석용

    Indexes: [contact] UNIQUE, [created_at DESC], [contact_type]

    RLS Policy:
    - SELECT: 모든 접근 차단 (어드민 UI 없으므로)
    - INSERT: service_role key로만 허용 (Server Action에서만 삽입)
    - UPDATE/DELETE: 차단
  </waitlist>
</core_data_entities>

<route_definitions>
  <public_routes>
    <route path="/" page="LandingPage" description="전체 랜딩 페이지 (단일 SPA-style 스크롤)" />
  </public_routes>
  <api_routes>
    <route path="(없음)" handler="Server Action (actions.ts submitWaitlist)" note="직접 API 라우트 없음 - Next.js Server Action 사용" />
  </api_routes>
</route_definitions>

<component_hierarchy>
  <app_shell>
    <!-- layout.tsx -->
    <html lang="ko">
      <body font="Playfair Display + Inter">
        <!-- page.tsx -->
        <main>
          <hero_section>
            <world_map />               <!-- react-simple-maps, 전체 배경, dynamic import ssr:false -->
            <overlay>                   <!-- 반투명 그라디언트 오버레이 -->
              <logo>winemine</logo>
              <tagline />
              <cta_button onClick="openModal" />
            </overlay>
            <scroll_indicator />        <!-- ChevronDown bounce 아이콘 -->
          </hero_section>
          <features_section>
            <feature_card />            <!-- 지도 기록: Globe2 아이콘 -->
            <feature_card />            <!-- 라벨 스캔: Camera 아이콘 -->
            <feature_card />            <!-- 스토리 공유: Share2 아이콘 -->
          </features_section>
          <how_it_works_section>
            <step_item num="01" />      <!-- 라벨을 찍어요 -->
            <step_item num="02" />      <!-- 지도에 기록돼요 -->
            <step_item num="03" />      <!-- 공유하세요 -->
          </how_it_works_section>
          <final_cta_section>
            <cta_button onClick="openModal" />
          </final_cta_section>
          <footer />
        </main>
        <!-- 전역 모달 (조건부 렌더링, AnimatePresence) -->
        <waitlist_modal isOpen={modalOpen}>
          <waitlist_form onSuccess="showSuccess" />
          <!-- OR (성공 시 교체) -->
          <waitlist_success />
        </waitlist_modal>
      </body>
    </html>
  </app_shell>
</component_hierarchy>

<pages_and_interfaces>
  <hero_section>
    <layout>
      - 높이: 100vh, 전체 화면
      - position: relative, overflow: hidden
      - 배경: WorldMap 컴포넌트 (SVG, absolute inset-0, fill 전체)
      - 위에 그라디언트 오버레이: linear-gradient(to bottom, rgba(5,2,8,0.3) 0%, rgba(5,2,8,0.6) 50%, rgba(5,2,8,0.85) 100%)
    </layout>

    <world_map_background>
      - react-simple-maps ComposableMap, projection="geoNaturalEarth1"
      - 기본 국가 색상: #1A0A1E (매우 어두운 보라-검정)
      - 국가 경계선: stroke #2D1540, stroke-width 0.5
      - Demo 데이터 opacity 국가들 (iso3 코드 기준):
        FRA: 0.85, ITA: 0.70, ESP: 0.45, USA: 0.60, DEU: 0.30,
        ARG: 0.50, CHL: 0.40, PRT: 0.55, AUT: 0.25, NZL: 0.35
      - 와인 국가 fill: #8B1A2A (와인 레드), CSS opacity 적용
      - 마우스 hover: 해당 국가 brightness 1.3 (CSS filter), cursor pointer
      - hover 시 툴팁: 국가명 + "X wines explored" 가상 텍스트, Inter 13px, bg #0F0718, border #2D1540
      - 페이지 로드 애니메이션: Framer Motion stagger, 각 와인 국가 opacity 0 → 목표값, 0.8s ease-out, stagger 0.05s
      - CRITICAL: dynamic(() => import(...), { ssr: false }) 필수
    </world_map_background>

    <content_overlay>
      - position: absolute, 수평 중앙, top: 38%
      - text-align: center
      - 로고: "winemine" — Playfair Display 72px / 400 weight, color #F5F0E8
        letter-spacing: -0.02em
        Framer Motion: opacity 0→1, translateY 20px→0, 600ms ease-out, delay 300ms
      - 골드 장식선: height 2px, width 80px, background #C9A84C, margin 16px auto
      - 태그라인: "Your wine journey, mapped." — Inter 18px / 300, #D4C5B0, margin-top 24px
      - 보조 설명: "라벨을 찍으면, 세계가 물든다." — Inter 14px / 400, #9B8B7A, margin-top 8px
      - CTA 버튼 (margin-top 48px):
        텍스트: "앱 다운받기"
        스타일: bg #8B1A2A, color #F5F0E8, height 56px, padding 0 40px, border-radius 4px, Inter 16px/600
        hover: bg #A02030, box-shadow 0 0 20px rgba(139,26,42,0.4), transform scale(1.02), 200ms ease
        Framer Motion: opacity 0→1, translateY 20px→0, 400ms ease-out, delay 700ms
      - CTA 아래 캡션: "coming soon — 지금 사전 신청하세요" — Inter 12px, #9B8B7A, margin-top 12px
    </content_overlay>

    <scroll_indicator>
      - position: absolute, bottom 32px, left 50%, transform translateX(-50%)
      - Lucide ChevronDown 24px, color #9B8B7A
      - Framer Motion animate: y [0, 8, 0], 1.5s infinite ease-in-out
    </scroll_indicator>
  </hero_section>

  <features_section>
    <layout>
      - background: #05020A
      - padding: 120px 24px (desktop), 80px 24px (mobile)
      - 섹션 제목: "왜 winemine인가" — Playfair Display 40px/400, #F5F0E8, text-align center
      - 골드 장식선: height 2px, width 60px, #C9A84C, margin 20px auto 64px
      - 카드 컨테이너: max-width 1100px, margin 0 auto
        display grid, grid-template-columns repeat(3, 1fr) (desktop), 1fr (mobile), gap 40px
    </layout>

    <feature_card>
      - border-top: 2px solid #2D1540
      - padding: 32px 24px
      - hover: border-top-color #8B1A2A, transition 300ms ease
      - Framer Motion whileInView: opacity 0→1, translateY 30px→0, 500ms ease-out, stagger 0.15s, once: true
      아이콘: 48px, color #C9A84C, margin-bottom 24px
      제목: Playfair Display 24px/400, #F5F0E8, margin-bottom 16px
      설명: Inter 15px/400, #9B8B7A, line-height 1.7
    </feature_card>

    <feature_card_1 name="세계를 물들여라">
      - 아이콘: Lucide Globe2
      - 설명: "마실 때마다 세계 지도에 그 지역이 물든다. 보르도를 마시면 보르도가 빛나고, 피에몬테를 마시면 피에몬테가 깨어난다."
    </feature_card_1>

    <feature_card_2 name="찍으면 전부 알아낸다">
      - 아이콘: Lucide Camera
      - 설명: "와인 라벨을 카메라로 찍기만 하면. 품종, 빈티지, 생산자, 원산지까지 자동으로 기록된다."
    </feature_card_2>

    <feature_card_3 name="당신만의 Recap">
      - 아이콘: Lucide Share2
      - 설명: "Flighty처럼, 언제든 내 와인 여정을 인스타그램 스토리에 올리기 딱 좋은 이미지로 한 번에 공유하라."
    </feature_card_3>
  </features_section>

  <how_it_works_section>
    <layout>
      - background: #0A050F
      - padding: 120px 24px (desktop), 80px 24px (mobile)
      - 섹션 제목: "이렇게 사용해요" — Playfair Display 40px/400, #F5F0E8, text-align center
      - 골드 장식선: 동일 패턴
      - step 컨테이너: max-width 900px, margin 0 auto
        display grid, grid-template-columns repeat(3, 1fr) (desktop), 1fr (mobile), gap 48px
    </layout>

    <step_item>
      - Framer Motion whileInView: opacity 0→1, translateY 30px→0, 500ms ease-out, stagger 0.15s, once: true
      번호: Playfair Display 64px/400, #2D1540 (장식용, 매우 어둡게)
      제목: Inter 20px/600, #F5F0E8, margin-top 8px
      설명: Inter 14px/400, #9B8B7A, line-height 1.7, margin-top 12px
      구분선 (desktop only): 점선 화살표 (→) 다음 step 연결, color #2D1540
    </step_item>

    <step_01 title="라벨을 찍어요">
      - 설명: "레스토랑에서, 와인 바에서, 집에서. 마시는 와인 라벨을 카메라로 찍으세요."
    </step_01>
    <step_02 title="지도에 기록돼요">
      - 설명: "AI가 라벨을 읽고 원산지를 파악해 세계 지도에 자동으로 핀을 꽂습니다. 지역이 쌓일수록 지도는 더 진하게 물들어요."
    </step_02>
    <step_03 title="공유하세요">
      - 설명: "내 와인 지도를 인스타그램 스토리 비율로 저장하고 공유하세요. 당신만의 빈티지 여행 기록."
    </step_03>
  </how_it_works_section>

  <final_cta_section>
    <layout>
      - background: #05020A
      - padding: 120px 24px (desktop), 80px 24px (mobile)
      - text-align: center
    </layout>
    <content>
      - 제목: "첫 번째 지도를 만들어보세요" — Playfair Display 48px/400, #F5F0E8
        mobile: 32px
      - 부제: "사전 신청하시면 출시 즉시 알려드립니다." — Inter 16px/400, #9B8B7A, margin-top 16px
      - CTA 버튼: 동일 스타일 (bg #8B1A2A, height 56px, "앱 다운받기"), margin-top 40px
      - 신청자 수 (옵션): "이미 {count}명이 신청했습니다" — Inter 13px, #9B8B7A, margin-top 16px
        초기에는 숨기거나 하드코딩 숫자 사용 가능
    </content>
  </final_cta_section>

  <footer>
    - background: #030106
    - height: 80px
    - display flex, align-items center, justify-content center
    - "© 2025 winemine. All rights reserved." — Inter 13px, #4A3D56
  </footer>

  <waitlist_modal>
    <trigger>
      - Hero CTA 버튼 OR Final CTA 버튼 클릭 → modalOpen state true
    </trigger>

    <backdrop>
      - Fixed full-screen: position fixed, inset 0, z-index 50
      - background: rgba(5,2,8,0.85), backdrop-filter blur(4px)
      - Framer Motion AnimatePresence: opacity 0→1 200ms ease-out (열기), 1→0 150ms ease-in (닫기)
      - 클릭 시 모달 닫힘
    </backdrop>

    <modal_box>
      - position: relative, z-index 51
      - width: 480px (desktop), calc(100vw - 32px) (mobile)
      - background: #0F0718, border: 1px solid #2D1540, border-radius 8px
      - padding: 48px 40px (desktop), 32px 24px (mobile)
      - box-shadow: 0 25px 80px rgba(0,0,0,0.8)
      - Framer Motion: scale 0.95→1.0, opacity 0→1, 250ms ease-out (열기)
      - 닫기 버튼: absolute top-16px right-16px, Lucide X 20px, color #4A3D56
        hover: color #F5F0E8, transition 150ms

      <modal_header>
        - 제목: "사전 신청" — Playfair Display 32px/400, #F5F0E8
        - 부제: "이메일 또는 전화번호를 남겨주시면 앱 출시 시 가장 먼저 알려드립니다."
          Inter 14px/400, #9B8B7A, line-height 1.6, margin-top 12px
        - 골드 장식선: height 2px, width 40px, #C9A84C, margin 16px 0 32px
      </modal_header>

      <form_default_state>
        <contact_type_toggle>
          - display flex, gap 8px, margin-bottom 20px
          - 각 탭 버튼: border 1px solid #2D1540, padding 8px 20px, border-radius 4px, Inter 14px/500
          - Active: border-color #8B1A2A, color #F5F0E8, background rgba(139,26,42,0.15)
          - Inactive: color #4A3D56, background transparent
          - hover (inactive): border-color #4A3D56, color #9B8B7A
        </contact_type_toggle>

        <input_field>
          - 이메일 탭: type="email", placeholder="wine@example.com"
          - 전화번호 탭: type="tel", placeholder="010-0000-0000"
          - 스타일: width 100%, height 52px, background #1A0A1E, border 1px solid #2D1540
          - border-radius 4px, padding 0 16px, color #F5F0E8
          - placeholder color: #4A3D56
          - focus: border-color #8B1A2A, outline none
          - error 상태: border-color #EF4444
          - 에러 메시지: Inter 12px, color #EF4444, margin-top 6px
            이메일: "올바른 이메일 형식이 아닙니다"
            전화번호: "올바른 전화번호 형식이 아닙니다 (010-XXXX-XXXX)"
            빈 칸: "연락처를 입력해주세요"
        </input_field>

        <submit_button>
          - width 100%, height 52px, background #8B1A2A, color #F5F0E8
          - border none, border-radius 4px, Inter 16px/600, cursor pointer
          - hover: background #A02030, transition 200ms ease
          - loading: spinner 아이콘 + "잠시만요...", disabled true, opacity 0.7
          - margin-top 16px
        </submit_button>

        <privacy_note>
          - "개인정보는 출시 알림 목적으로만 사용됩니다."
          - Inter 11px/400, #4A3D56, text-align center, margin-top 12px
        </privacy_note>
      </form_default_state>

      <form_success_state>
        - 중앙 정렬, padding 16px 0
        - Lucide CheckCircle2 64px, color #C9A84C, margin-bottom 24px
        - 제목: "신청이 완료되었습니다!" — Playfair Display 28px/400, #F5F0E8
        - 설명: "출시되면 가장 먼저 알려드리겠습니다. 좋은 와인과 함께하는 날을 기대해주세요."
          Inter 14px/400, #9B8B7A, margin-top 12px, line-height 1.6
        - Framer Motion: scale 0.8→1.0, opacity 0→1, 400ms ease-out
        - 닫기 버튼: Inter 15px, border 1px solid #2D1540, color #9B8B7A, padding 12px 32px
          hover: border-color #8B1A2A, color #F5F0E8, margin-top 32px
      </form_success_state>

      <form_duplicate_state>
        - 중복 연락처 → 성공 화면으로 동일 처리 (UX 우선)
        - Supabase에는 중복 저장 없음 (UNIQUE constraint)
      </form_duplicate_state>
    </modal_box>
  </waitlist_modal>
</pages_and_interfaces>

<core_functionality>
  <waiting_list_submission>
    흐름:
    1. 사용자가 이메일 또는 전화번호 탭 선택 후 입력
    2. "신청하기" 클릭 → react-hook-form handleSubmit
    3. 클라이언트 Zod 유효성 검사 (실패 시 인라인 에러 표시)
    4. 유효 시 Server Action submitWaitlist(data) 호출
    5. 서버: Supabase service_role key로 waitlist INSERT
    6. 중복(23505): success: true 반환 → 성공 화면
    7. 기타 에러: 모달 내 에러 메시지 표시, 재시도 가능
    8. 성공: 폼 → 성공 화면 전환 (AnimatePresence)
  </waiting_list_submission>

  <interactive_world_map>
    - react-simple-maps + topojson-client으로 SVG 세계 지도 렌더링
    - public/world-110m.json 정적 파일 사용
    - Demo 데이터 (하드코딩 상수):
      ```
      const WINE_REGIONS: Record<string, number> = {
        FRA: 0.85, ITA: 0.70, ESP: 0.45, USA: 0.60, DEU: 0.30,
        ARG: 0.50, CHL: 0.40, PRT: 0.55, AUT: 0.25, NZL: 0.35
      }
      ```
    - 와인 국가: fill #8B1A2A, opacity = WINE_REGIONS[iso3] || 0
    - 기타 국가: fill #1A0A1E, opacity 1
    - 로드 애니메이션: Framer Motion, 와인 국가별 opacity 0 → 목표값, stagger 0.05s
    - hover: CSS filter brightness(1.3), cursor pointer
    - 툴팁: mouse position 기준 absolute 배치
    - CRITICAL: dynamic import with ssr: false
  </interactive_world_map>

  <scroll_animations>
    - features_section 카드 3개: whileInView, stagger 0.15s
    - how_it_works step 3개: whileInView, stagger 0.15s
    - once: true (재진입 시 재실행 없음)
    - prefers-reduced-motion: animate 비활성화
  </scroll_animations>

  <modal_management>
    - page.tsx에서 modalOpen useState 관리
    - openModal(), closeModal() 함수를 필요한 컴포넌트에 props로 전달
    - 모달 열림 시: document.body.style.overflow = 'hidden'
    - 모달 닫힘 시: document.body.style.overflow = ''
    - Escape 키: useEffect → keydown 이벤트 → closeModal()
  </modal_management>
</core_functionality>

<error_handling>
  <user_facing>
    <form_validation>
      - 이메일: zod email() → "올바른 이메일 형식이 아닙니다"
      - 전화번호: /^010[-\s]?\d{4}[-\s]?\d{4}$/ → "올바른 전화번호 형식이 아닙니다 (010-XXXX-XXXX)"
      - 빈 칸: zod min(1) → "연락처를 입력해주세요"
      - submit 시 첫 번째 에러 필드로 자동 포커스
    </form_validation>
    <server_errors>
      - Server Action 실패 (network/DB): 모달 내 에러 배너 표시
        텍스트: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        Inter 13px, color #EF4444, margin-top 12px
        재시도: 버튼 다시 활성화 (loading → 기본 상태)
    </server_errors>
  </user_facing>
</error_handling>

<third_party_integrations>
  <integration name="Supabase">
    <purpose>waitlist 테이블에 연락처 저장</purpose>
    <sdk>@supabase/supabase-js v2.49</sdk>
    <setup>
      1. Supabase 대시보드에서 새 프로젝트 생성
      2. SQL Editor에서 waitlist 테이블 + 인덱스 + RLS 실행
      3. Settings → API → service_role key 복사 → .env.local 설정
    </setup>
    <usage>
      - lib/supabase-server.ts: createClient(URL, SERVICE_ROLE_KEY) 서버 전용
      - actions.ts: from('waitlist').insert({...})
      - 중복 에러 코드: PostgreSQL '23505' (unique_violation)
    </usage>
  </integration>

  <integration name="Vercel">
    <purpose>Next.js 앱 배포, 환경 변수 관리, Edge Network CDN</purpose>
    <setup>
      1. vercel link (또는 Vercel 대시보드에서 GitHub 연결)
      2. vercel env add NEXT_PUBLIC_SUPABASE_URL
      3. vercel env add SUPABASE_SERVICE_ROLE_KEY
      4. vercel --prod
    </setup>
  </integration>
</third_party_integrations>

<aesthetic_guidelines>
  <design_philosophy>
    어두운 밤, 와인 한 잔. 프리미엄 와인 라벨의 무게감과 우아함. 깊은 버건디와 골드, 크림으로 구성된 팔레트. 과한 장식 없이 타이포그래피와 여백으로 고급스러움을 표현한다. 인터랙티브 세계 지도가 배경을 지배하며, 글자와 버튼은 마치 지도 위에 새겨진 듯 절제되어 있다.
  </design_philosophy>

  <color_palette>
    <primary_colors>
      - Wine Red (CTA): #8B1A2A — 버튼, 와인 국가 fill
      - Wine Red Hover: #A02030 — 버튼 hover 상태
      - Gold (Accent): #C9A84C — 장식선, 아이콘, 성공 아이콘
      - Cream (Text Primary): #F5F0E8 — 제목, 주요 텍스트
    </primary_colors>
    <background_colors>
      - Deepest Dark: #05020A — Hero 배경, Features 섹션, Final CTA
      - Deep Dark: #0A050F — How It Works 섹션 (교차)
      - Map Dark: #1A0A1E — 지도 기본 국가 fill, 입력 필드 bg
      - Surface: #0F0718 — 모달 배경
      - Footer: #030106 — 최하단
    </background_colors>
    <text_colors>
      - Primary: #F5F0E8 — 로고, 섹션 제목, 카드 제목
      - Secondary: #D4C5B0 — 메인 태그라인
      - Muted: #9B8B7A — 본문 설명, 모달 부제
      - Disabled: #4A3D56 — placeholder, footer 텍스트, 비활성 탭
    </text_colors>
    <semantic_colors>
      - Error: #EF4444 — 에러 메시지, 에러 border
      - Warning: #F59E0B — (미사용, 예약)
      - Border Default: #2D1540
      - Border Active: #8B1A2A — focus, hover, active 탭
    </semantic_colors>
  </color_palette>

  <typography>
    <font_families>
      - Display: "Playfair Display", Georgia, serif
        용도: 로고, 모든 섹션 제목, 모달 제목, step 번호
      - Body: "Inter", -apple-system, BlinkMacSystemFont, sans-serif
        용도: 모든 설명, 버튼, 입력, 캡션
    </font_families>
    <font_sizes>
      - Logo: 72px / 400 weight, letter-spacing -0.02em → mobile 48px
      - Section Title: 40px / 400 → mobile 28px
      - Final CTA Title: 48px / 400 → mobile 32px
      - Modal Title: 32px / 400
      - Feature Card Title: 24px / 400
      - Step Title: 20px / 600
      - Body: 15px / 400, line-height 1.7
      - Small: 13px / 400
      - Caption/Note: 11-12px / 400
      - CTA Button: 16px / 600
      - Tab Button: 14px / 500
      - Step Number: 64px / 400, color #2D1540 (장식용)
    </font_sizes>
  </typography>

  <spacing>
    - Base unit: 4px
    - Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 120
    - Section padding: 120px top/bottom (desktop), 80px (mobile)
    - Max content width: 1100px (features), 900px (how it works), centered
    - Page horizontal padding: 24px (mobile/tablet)
  </spacing>

  <borders_and_shadows>
    <borders>
      - Default: 1px solid #2D1540
      - Active/Focus/Hover accent: 1px solid #8B1A2A
      - Feature card top separator: 2px solid #2D1540 → hover #8B1A2A
    </borders>
    <shadows>
      - Modal: 0 25px 80px rgba(0,0,0,0.8)
      - CTA Button hover glow: 0 0 20px rgba(139,26,42,0.4)
    </shadows>
  </borders_and_shadows>

  <animations>
    <page_load>
      - 세계 지도 국가: Framer Motion stagger 0.05s, opacity 0→목표값, duration 0.8s ease-out
      - 로고 + 장식선 + 태그라인: opacity 0→1, translateY 20px→0, 600ms ease-out, delay 300ms
      - CTA 버튼 + 캡션: opacity 0→1, translateY 20px→0, 400ms ease-out, delay 700ms
    </page_load>
    <scroll_reveal>
      - whileInView: opacity 0→1, translateY 30px→0, 500ms ease-out
      - stagger: 0.15s per item (카드, step)
      - once: true
    </scroll_reveal>
    <modal>
      - 열기: backdrop opacity 0→1 200ms ease-out, modal scale 0.95→1.0 + opacity 0→1 250ms ease-out
      - 닫기: backdrop opacity 1→0 150ms ease-in, modal scale 1.0→0.95 + opacity 1→0 150ms ease-in
      - 성공 전환: 폼 fade-out 200ms → success scale 0.8→1.0 + fade-in 400ms ease-out
    </modal>
    <map_hover>
      - 국가 hover: CSS filter brightness(1.3), transition 150ms ease
      - 툴팁: opacity 0→1 100ms ease
    </map_hover>
    <scroll_indicator_bounce>
      - Framer Motion animate: y [0, 8, 0], transition repeat Infinity 1.5s ease-in-out
    </scroll_indicator_bounce>
    <reduced_motion>
      - prefers-reduced-motion: all Framer Motion animations disabled
      - 사용: useReducedMotion() hook으로 조건부 적용
    </reduced_motion>
  </animations>

  <responsive_design>
    <breakpoints>
      - mobile: 0–767px (sm 미만)
      - tablet: 768–1023px
      - desktop: 1024px+
    </breakpoints>
    <mobile_adaptations>
      - 로고: 72px → 48px
      - 섹션 제목: 40px → 28px, Final CTA 제목: 48px → 32px
      - Features 카드: 3열 → 1열 세로 스택
      - How It Works: 3열 → 1열 세로, 연결 화살표 제거
      - 모달: width calc(100vw - 32px), 하단 고정 (position fixed bottom-0, border-radius 16px top only)
      - 섹션 padding: 120px → 80px
    </mobile_adaptations>
    <touch_interactions>
      - 지도 국가: hover 없음 → tap으로 툴팁 토글
      - 모달: bottom sheet 패턴 (아래서 위로 slide-up)
      - 최소 tap target: 44×44px (모든 버튼, 탭, 닫기 아이콘)
    </touch_interactions>
  </responsive_design>

  <icons>
    - Library: Lucide React v0.475
    - Globe2: features 지도 아이콘 (48px)
    - Camera: features 스캔 아이콘 (48px)
    - Share2: features 공유 아이콘 (48px)
    - CheckCircle2: 성공 아이콘 (64px)
    - ChevronDown: 스크롤 인디케이터 (24px)
    - X: 모달 닫기 (20px)
    - Loader2: 로딩 스피너 (20px, animate-spin)
  </icons>

  <accessibility>
    - 모달: role="dialog", aria-modal="true", aria-labelledby="modal-title"
    - 모달 열림 시 focus trap (Tab 키 모달 안에서만 순환)
    - Escape 키로 모달 닫기
    - 배경 스크롤 lock (body overflow hidden)
    - CTA 버튼: aria-haspopup="dialog"
    - 지도: role="img", aria-label="마신 와인 산지를 표시한 인터랙티브 세계 지도"
    - 색상 대비: 주요 텍스트 WCAG AA 기준 (4.5:1) 이상
    - 입력 필드: aria-describedby로 에러 메시지 연결
  </accessibility>
</aesthetic_guidelines>

<security_considerations>
  <input_validation>
    - CRITICAL: 클라이언트 Zod + 서버 Server Action 양쪽 모두 검증
    - 이메일: max 255자, z.string().email()
    - 전화번호: /^010[-\s]?\d{4}[-\s]?\d{4}$/, max 20자
    - 서버에서 .trim() 후 저장
  </input_validation>
  <rate_limiting>
    - ip_address 컬럼 기록으로 동일 IP 제출 추적
    - 실용적 접근: Supabase에서 동일 IP 24시간 내 5회 초과 시 Server Action에서 거부
    - 향후: Vercel Middleware + @vercel/edge-rate-limit으로 업그레이드 가능
  </rate_limiting>
  <data_protection>
    - CRITICAL: SUPABASE_SERVICE_ROLE_KEY는 절대 클라이언트 번들에 포함 불가 (NEXT_PUBLIC_ 접두사 금지)
    - Server Action 내에서만 Supabase 접근 (클라이언트 직접 접근 없음)
    - RLS 활성화: waitlist 테이블 public 접근 완전 차단
  </data_protection>
  <security_headers>
    <!-- next.config.ts headers() -->
    - X-Frame-Options: DENY
    - X-Content-Type-Options: nosniff
    - Referrer-Policy: strict-origin-when-cross-origin
    - Content-Security-Policy: default-src 'self'; font-src fonts.googleapis.com fonts.gstatic.com; img-src 'self' data:; script-src 'self' 'unsafe-inline' (Next.js 요구); style-src 'self' 'unsafe-inline' fonts.googleapis.com
  </security_headers>
</security_considerations>

<final_integration_test>
  <test_scenario_1>
    <description>첫 방문 — Hero 섹션 렌더링 및 인터랙션</description>
    <steps>
      1. 브라우저에서 / 접속 (캐시 클리어 상태)
      2. 세계 지도 SVG가 전체 화면 배경에 렌더링되는지 확인
      3. 주요 와인 산지 국가 (프랑스, 이탈리아 등)가 #8B1A2A로 opacity 차등 표시되는지 확인
      4. 국가들이 순차적으로 밝아지는 stagger 애니메이션 확인
      5. 이후 "winemine" 로고, 태그라인, CTA 버튼이 fade-in되는지 확인
      6. 프랑스(FRA)에 마우스 hover → fill 밝아짐 + 툴팁 표시 확인
      7. 스크롤 인디케이터 bounce 애니메이션 확인
      8. "앱 다운받기" 버튼 클릭 → 모달 열림 확인
      9. backdrop 클릭 → 모달 닫힘 확인
      10. 모달 다시 열고 Escape 키 → 닫힘 확인
    </steps>
  </test_scenario_1>

  <test_scenario_2>
    <description>이메일로 waiting list 신청 성공</description>
    <steps>
      1. "앱 다운받기" 클릭 → 모달 오픈
      2. "이메일" 탭이 기본 선택 확인
      3. "test@winemine.com" 입력
      4. "신청하기" 클릭
      5. 버튼이 loading 상태 ("잠시만요...") 전환 확인
      6. 성공: CheckCircle2 아이콘 + "신청이 완료되었습니다!" 성공 화면 확인
      7. Supabase 대시보드 → waitlist 테이블에서 새 행 확인
         (contact: "test@winemine.com", contact_type: "email")
      8. "닫기" 버튼 클릭 → 모달 닫힘 확인
    </steps>
  </test_scenario_2>

  <test_scenario_3>
    <description>전화번호로 waiting list 신청 성공</description>
    <steps>
      1. 모달 오픈 → "전화번호" 탭 클릭
      2. 탭 스타일 active 전환 확인 (border #8B1A2A)
      3. input placeholder "010-0000-0000" 확인
      4. "010-1234-5678" 입력
      5. "신청하기" 클릭 → 성공 화면 확인
      6. Supabase에서 contact_type: "phone" 저장 확인
    </steps>
  </test_scenario_3>

  <test_scenario_4>
    <description>유효성 검사 에러 처리</description>
    <steps>
      1. 모달 오픈 → 빈 칸으로 "신청하기" 클릭
      2. "연락처를 입력해주세요" 인라인 에러 표시 (red, 입력 필드 border red)
      3. "notanemail" 입력 후 제출
      4. "올바른 이메일 형식이 아닙니다" 에러 확인
      5. 전화번호 탭 → "010-123-456" (짧은 번호) → 에러 확인
      6. "01012345678" (하이픈 없음) → 허용 확인 (정규식 [-\s]? 옵션)
    </steps>
  </test_scenario_4>

  <test_scenario_5>
    <description>중복 신청 처리</description>
    <steps>
      1. 이미 신청한 이메일로 재신청: "test@winemine.com"
      2. 서버에서 PostgreSQL 23505 에러 → success: true 반환
      3. 성공 화면으로 전환 확인 (UX: 이미 신청했어도 성공 처리)
      4. Supabase waitlist 테이블에 중복 행 미생성 확인
    </steps>
  </test_scenario_5>

  <test_scenario_6>
    <description>스크롤 섹션 및 두 번째 CTA</description>
    <steps>
      1. 페이지 Features 섹션으로 스크롤
      2. 카드 3개 순차 fade-up 확인 (stagger 0.15s)
      3. How It Works 섹션으로 스크롤
      4. step 3개 순차 fade-up 확인
      5. Final CTA 섹션으로 스크롤
      6. 두 번째 "앱 다운받기" 버튼 클릭 → 동일 모달 오픈 확인
    </steps>
  </test_scenario_6>

  <test_scenario_7>
    <description>모바일 반응형 (iPhone 15 Pro 393px)</description>
    <steps>
      1. Chrome DevTools → iPhone 15 Pro (393px) 설정
      2. 가로 스크롤 없음 확인
      3. 로고가 48px로 렌더링 확인
      4. Features 카드 1열 세로 배열 확인
      5. How It Works step 1열 세로 배열, 화살표 없음 확인
      6. "앱 다운받기" 클릭 → 모달이 bottom sheet 스타일로 slide-up 확인
      7. 모달 폼 입력 및 제출 동작 확인
    </steps>
  </test_scenario_7>
</final_integration_test>

<success_criteria>
  <functionality>
    - 세계 지도가 Hero 배경에 인터랙티브하게 렌더링됨 (국가 hover, 색상 차등)
    - "앱 다운받기" 버튼 클릭 시 모달 열림 (Hero + Final CTA 모두)
    - 이메일/전화번호 제출 시 Supabase waitlist 테이블에 저장됨
    - 중복 연락처는 DB에 중복 저장되지 않음
    - 유효하지 않은 입력 시 인라인 에러 메시지 표시
    - 성공 시 성공 화면으로 애니메이션 전환
    - Escape/backdrop 클릭으로 모달 닫힘
  </functionality>
  <user_experience>
    - 초기 로드 LCP 2.5초 이하 (Vercel Edge Network 기준)
    - 지도 dynamic import로 메인 스레드 블로킹 없음
    - 모든 애니메이션 60fps 부드럽게 실행
    - 모바일 393px에서 가로 스크롤 없이 완전 표시
    - 모달 focus trap 정상 동작 (Tab 키)
  </user_experience>
  <technical_quality>
    - TypeScript strict mode 에러 0개
    - SUPABASE_SERVICE_ROLE_KEY가 클라이언트 번들에 미포함 (빌드 후 확인)
    - Vercel 빌드 성공 (빌드 에러 0개)
    - Lighthouse Performance 80+, Accessibility 90+
  </technical_quality>
  <visual_design>
    - color palette (#05020A, #8B1A2A, #C9A84C, #F5F0E8) 일관 사용
    - Playfair Display / Inter 폰트 정상 로드 (FOUT 없음)
    - 프리미엄 와인 브랜드 느낌 (어두운 배경, 골드 포인트, 절제된 레이아웃)
  </visual_design>
</success_criteria>

<build_output>
  <build_command>npm run build</build_command>
  <output_directory>.next/</output_directory>
  <deployment>Vercel (vercel --prod 또는 GitHub 연동 자동 배포)</deployment>
  <note>Next.js App Router + Server Action 사용으로 정적 파일만으로는 배포 불가. Vercel 또는 Node.js 서버 환경 필요.</note>
</build_output>

<key_implementation_notes>
  <repo_recommendation>
    현재 이 레포(winemine)를 랜딩 페이지에 그대로 사용한다.
    - 현재 빈 상태이므로 Next.js 프로젝트를 바로 scaffold 가능
    - 향후 iOS/Android 앱 개발 시 별도 레포 생성 권고 (예: react-native-winemine)
    - 규모가 커지면 Turborepo 모노레포 (packages/landing, packages/app)로 통합 고려
  </repo_recommendation>

  <critical_paths>
    1. Supabase 프로젝트 + waitlist 테이블 + 환경 변수 설정 (배포 전 필수)
    2. WorldMap 컴포넌트 (dynamic import, ssr: false) — Hero 섹션 핵심
    3. Server Action (submitWaitlist) + Supabase INSERT — waiting list 핵심
    4. WaitlistModal + 상태 관리 (open/form/success) — 가장 복잡한 컴포넌트
  </critical_paths>

  <recommended_implementation_order>
    1. Next.js 15 scaffold: npx create-next-app@latest . --typescript --tailwind --app --src-dir
    2. 의존성 설치: npm i @supabase/supabase-js react-simple-maps topojson-client framer-motion react-hook-form zod lucide-react
    3. shadcn/ui 초기화: npx shadcn@latest init (dark theme 선택)
    4. Supabase 프로젝트 생성 + SQL 실행 (waitlist 테이블 + 인덱스 + RLS)
    5. .env.local 환경 변수 설정
    6. lib/supabase-server.ts + lib/validations.ts + lib/utils.ts 구현
    7. src/app/actions.ts Server Action 구현
    8. layout.tsx: next/font (Playfair Display + Inter), metadata, OG tags, security headers
    9. globals.css: Tailwind v4 설정, 커스텀 CSS 변수 (색상 팔레트)
    10. public/world-110m.json 다운로드 및 저장
    11. components/map/world-map.tsx 구현 (react-simple-maps + demo 데이터)
    12. components/sections/hero-section.tsx 구현 (지도 배경 + 오버레이 + CTA)
    13. components/waitlist/waitlist-form.tsx + waitlist-success.tsx 구현
    14. components/waitlist/waitlist-modal.tsx 구현 (AnimatePresence + focus trap)
    15. components/sections/features-section.tsx 구현 (3 cards + scroll animation)
    16. components/sections/how-it-works-section.tsx 구현
    17. components/sections/final-cta-section.tsx + footer 구현
    18. src/app/page.tsx에서 모든 섹션 조합 + modalOpen state 관리
    19. 반응형 스타일 점검 (mobile 393px, tablet 768px)
    20. Vercel 연결 + 환경 변수 설정 + 배포
    21. Lighthouse 점수 확인 및 최적화
  </recommended_implementation_order>

  <database_schema>
    ```sql
    -- Supabase SQL Editor에서 실행
    CREATE TABLE waitlist (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      contact VARCHAR(255) NOT NULL,
      contact_type VARCHAR(10) NOT NULL CHECK (contact_type IN ('email', 'phone')),
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      ip_address VARCHAR(50),
      user_agent TEXT,
      CONSTRAINT waitlist_contact_unique UNIQUE (contact)
    );

    CREATE INDEX waitlist_created_at_idx ON waitlist (created_at DESC);
    CREATE INDEX waitlist_contact_type_idx ON waitlist (contact_type);

    ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
    -- service_role key는 RLS bypass하므로 추가 정책 불필요
    -- public 접근 완전 차단 (정책 없음 = 차단)
    ```
  </database_schema>

  <server_action_implementation>
    ```typescript
    // src/app/actions.ts
    'use server';
    import { createClient } from '@supabase/supabase-js';
    import { z } from 'zod';
    import { headers } from 'next/headers';

    const emailSchema = z.object({
      contactType: z.literal('email'),
      contact: z.string().email().max(255),
    });

    const phoneSchema = z.object({
      contactType: z.literal('phone'),
      contact: z.string().regex(/^010[-\s]?\d{4}[-\s]?\d{4}$/).max(20),
    });

    const schema = z.discriminatedUnion('contactType', [emailSchema, phoneSchema]);

    export async function submitWaitlist(data: {
      contact: string;
      contactType: 'email' | 'phone';
    }): Promise<{ success: boolean; error?: string }> {
      const parsed = schema.safeParse(data);
      if (!parsed.success) return { success: false, error: 'validation' };

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const headersList = await headers();
      const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

      const { error } = await supabase.from('waitlist').insert({
        contact: parsed.data.contact.trim(),
        contact_type: parsed.data.contactType,
        ip_address: ip,
        user_agent: headersList.get('user-agent'),
      });

      if (error?.code === '23505') return { success: true }; // 중복 = 이미 신청
      if (error) return { success: false, error: 'server' };
      return { success: true };
    }
    ```
  </server_action_implementation>

  <map_implementation_note>
    CRITICAL: react-simple-maps는 브라우저 API를 사용하므로 SSR 불가.
    반드시 dynamic import with ssr: false 사용:

    ```typescript
    // hero-section.tsx
    import dynamic from 'next/dynamic';
    const WorldMap = dynamic(() => import('@/components/map/world-map'), {
      ssr: false,
      loading: () => <div className="absolute inset-0 bg-[#05020A]" />,
    });
    ```

    world-110m.json 다운로드:
    curl -o public/world-110m.json https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json

    iso-3166 국가 코드 (iso3) 매핑은 react-simple-maps의 geographies[].properties.ISO_A3 사용.
    주의: 일부 국가는 ISO_A3 대신 ADM0_A3를 써야 할 수 있음 (react-simple-maps 버전에 따라 확인).
  </map_implementation_note>

  <performance_considerations>
    - world-110m.json (~110KB): public/ 정적 파일, Next.js 자동 캐시 (Cache-Control: public, max-age=31536000)
    - Framer Motion: named import 사용 (motion, AnimatePresence만 import)
    - WorldMap 컴포넌트: React.memo()로 memoize (props 변화 없으므로 재렌더링 방지)
    - Playfair Display: next/font subsets: ['latin'] 으로 제한
    - 이미지 없는 텍스트+SVG 페이지이므로 LCP는 로고 텍스트 (빠름)
  </performance_considerations>
</key_implementation_notes>

</project_specification>
```
