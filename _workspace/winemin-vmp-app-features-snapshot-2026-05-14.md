# winemine 키스크린 — 현재 구현된 기능 전체 정리

> 스냅샷 일자: 2026-05-14
> 대상: `src/` 전체 코드 기반 실제 구현 확인 (코드 인용 없는 기능 목록)

---

## 1. 라우트 일람 (총 39개)

| # | 경로 | 설명 |
|---|------|------|
| 1 | `/` | 홈 |
| 2 | `/map` | 세계 지도 |
| 3 | `/cellar` | 셀러 리스트 (셀러 / 마신 와인 탭) |
| 4 | `/cellar/[id]` | 셀러 아이템 상세 |
| 5 | `/wine/[id]` | 와인 상세 |
| 6 | `/wine/[id]/story` | 와이너리 스토리 |
| 7 | `/wine/[id]/prices` | 가격 상세 |
| 8 | `/wine/[id]/community-peak` | 커뮤니티 음용 적기 상세 |
| 9 | `/notes/new` | 노트 출처 선택 |
| 10 | `/notes/new/write` | 노트 작성 (입문/전문가/커스텀 양식) |
| 11 | `/notes/[noteId]` | 노트 read-only 상세 (내 노트·공유 노트 공용) |
| 12 | `/capture` | 라벨 스캔 (mock 분석) |
| 13 | `/profile` | 내 프로필 |
| 14 | `/profile/[userId]` | 타 유저 프로필 |
| 15 | `/profile/ranking` | 랭킹 / XP·레벨 카탈로그 |
| 16 | `/favorites` | 즐겨찾기 |
| 17 | `/badges` | 뱃지 진열장 |
| 18 | `/photos` | 라벨 사진 갤러리 |
| 19 | `/notifications` | 알림 리스트 |
| 20 | `/glossary` | 와인 용어 사전 |
| 21 | `/glossary/[term]` | 용어 상세 |
| 22 | `/onboarding` | 첫 실행 온보딩 (4스텝) |
| 23 | `/settings` | 설정 홈 |
| 24 | `/settings/language` | 언어 |
| 25 | `/settings/experience` | 경험 수준 |
| 26 | `/settings/notifications` | 알림 설정 |
| 27 | `/settings/appearance` | 테마(다크/라이트) |
| 28 | `/settings/tasting-template` | 테이스팅 노트 양식 관리 |
| 29 | `/settings/tasting-template/new` | 양식 신규 작성 |
| 30 | `/settings/tasting-template/[templateId]/edit` | 양식 편집 |
| 31 | `/community` | 커뮤니티 피드 (5탭) |
| 32 | `/community/discover` | 취향 맞는 유저 발견 |
| 33 | `/community/tonight` | 오늘 밤 마시는 사람들 |
| 34 | `/community/new` | 새 글 타입 선택 |
| 35 | `/community/new/column` | 칼럼 작성 |
| 36 | `/community/new/album` | 앨범 작성 |
| 37 | `/community/[postId]` | 포스트 상세 |
| 38 | `/community/[postId]/comments` | 댓글 |
| 39 | `/community/templates` | 커뮤니티 노트 양식 둘러보기 |

---

## 2. 페이지별 기능 상세

### 2.1 홈 (`/`)

**heavy 모드 (기존 사용자)**
- **PeakGreeting** — 골드 eyebrow + Playfair 본문. 사용자 이름과 최근 시음 와인 아펠라시옹을 5초 간격으로 페이드 로테이션(최대 4종)
- **DraftNoteResume** — 작성 중인 노트가 있을 때만 노출되는 "이어쓰기" CTA
- **StatHero** — 방문 국가·마신 와인·작성 노트 3열 아이콘 카드
- **MapCameo** — 정적 SVG 미니 세계지도 + 방문 국가/지역 카운트, `/map` 진입
- **HomeCommunityPeek** — 팔로잉의 최신 커뮤니티 포스트 2건 dense row, `/community` 진입
- **RecentNotesStrip** — WMBottle + WMGlassRating 카드형 수평 스크롤
- **WineFeed** — 3탭 (Featured / Trending / Explore)
  - Featured: 큐레이션 12종
  - Trending: 최근 구매 등록 순
  - Explore: region 다양화 sample
- **QuickActions** — 자주 쓰는 액션 바로가기 버튼들
- **LevelProgressBar** — XP 진척도 (`/badges` 진입)

**first-time 모드 (신규 사용자)**
- FirstTimeGreeting — 사용자 이름 환영 메시지
- EmptyStatHero — 0/0/0 빈 통계 + 첫 스캔 유도 문구
- SuggestedActions — 첫 액션 제안 카드 (스캔/탐색)
- WineFeed (공통)

**공통**
- AppHeader (WMLogoMark + "wine·mine" 워드마크 + 미읽음 알림 벨 + 레벨 칩)
- first-time + 온보딩 미완료 시 `/onboarding`으로 자동 리다이렉트

---

### 2.2 세계 지도 (`/map`)

- react-simple-maps 기반 인터랙티브 세계지도 (dynamic import, SSR off)
- heavy: 마신 와인·셀러 와인 국가 Wine Red 채색
- first-time: 빈 지도 + "첫 스캔" 유도 패널
- 필터 칩 바: 전체 / 마신 와인 / 셀러 / 즐겨찾기 + 슬라이더 아이콘
- 국가 클릭 → CountryDetailPanel(BottomSheet): 병 수 뱃지·지역 수·마신 수, 지역→와인 드릴다운
- MapLegend 색상 범례
- 라이트 모드 분기 — 글래스 오버레이 가독성 보정

---

### 2.3 셀러 리스트 (`/cellar`)

세그먼트 탭: **내 셀러 / 마신 와인** (탭 옆 병 수 뱃지)

**내 셀러**
- 검색 입력 (이름·생산자·지역·국가·아펠라시옹·품종·빈티지)
- 와인 타입 필터 칩 — all/red/white/sparkling/rosé/fortified + 색 도트
- 정렬 칩 — 최근 등록 / 음용 임박 / 빈티지 / 지역 / 보관 장소 / 가격
- 결과 카운트 + "필터 초기화"
- 2열 그리드 CellarCard — WMBottle SVG + 타입 도트 + 음용 적기 배지
- "셀러에 추가" 버튼 (PlaceholderToast)
- 빈 상태 + 검색결과 없음 분기

**마신 와인**
- 검색 (이름·생산자·지역·빈티지)
- TastedWineRow — WMBottle + 와인 메타 + 내 노트 인라인 미리보기:
  - 입문자: WMGlassRating + 아로마 힌트
  - 전문가: /100점 + 산도·바디·타닌·단맛 미니 그리드
- "노트 편집" + "와인 상세" 버튼

---

### 2.4 셀러 아이템 상세 (`/cellar/[id]`)

- 240px 그라데이션 와인 헤로 (WineLabelArt + 와인 메타)
- 음용 적기 카드 — DrinkWindowBadge + 타임라인 바 (from→peak→to + 현재 위치 점)
- "피크까지 N년" 텍스트
- 알림 토글 — 피크 도달 시 알림
- 메타 그리드 2×2 — 보관 장소 / 취득일 / 구매 가격 / 메모
- 커뮤니티 리뷰 최대 3건 + "와인 상세 보기"
- 하단 고정 "마시기" CTA (DrinkThisButton)

---

### 2.5 와인 상세 (`/wine/[id]`)

- BackHeader + FavoriteToggle (localStorage 영속)
- WineHeader — 라디얼 그라데이션 + 88×290 WMBottle + 메타
- MyTastingNoteCard — 내 노트 있을 때 표시 (커뮤니티 비교 인사이트)
- WriteNoteCta — 내 노트 없을 때 자동 노출
- ExternalRatingsCard — Vivino / Wine Searcher / CellarTracker 점수
- AveragePricePill — 평균가 ₩ 칩
- PriceChart (compact) — Recharts LineChart 가격 추이
- CommunityDrinkWindowCard (compact) — 음용 적기 히스토그램
- WineStoryCard — 와이너리 스토리 요약 + 풀페이지 링크
- ReviewList — 커뮤니티 리뷰 리스트 (LevelPill 동반)
- AddToCellarCta — 인라인 추가 버튼

---

### 2.6 와이너리 스토리 (`/wine/[id]/story`)

- StoryImage 헤로 (와이너리명·설립연도·위치)
- History 본문 3~4문단 (LocalizedString)
- 인라인 GlossaryTooltip (전문 용어 최소 5곳)
- FunFact 카드 (Gold 보더 + Lightbulb)
- Philosophy 단락 (옵션)
- 메타 그리드 2×2 — 설립연도 / 포도밭 면적 / 주요 품종 / 연 생산량
- "이 와인 다시 보기" CTA
- 스토리 없을 때 빈 상태

---

### 2.7 가격 상세 (`/wine/[id]/prices`)

- PriceChart (full, 전체 기간)
- PriceDetailTable — 매장별 그룹 구매 기록 (작성자 익명화, LevelPill만)
- "내 구매 정보 등록" 하단 고정 CTA → BottomSheet 폼 (+5 XP 토스트)

---

### 2.8 커뮤니티 음용 적기 (`/wine/[id]/community-peak`)

- 인트로 카드 (L3+ 참여 + 가중치 설명)
- 280px 큰 히스토그램 PeakDistribution (시스템 추정·평균·중앙값 마커)
- ContributorsList 추정자 리스트 (`LevelName #anonId`)
- "내 추정 추가" 하단 고정 CTA (L3+ 활성)

---

### 2.9 노트 출처 선택 (`/notes/new`)

SourcePicker 3가지 카드:
- 셀러에서 선택 (보유 병 수 배지) → BottomSheet 리스트
- 새로 검색 (PlaceholderToast)
- 새 항목 입력

---

### 2.10 노트 작성 (`/notes/new/write`)

쿼리스트링 `templateId`로 폼을 분기:
- **명시 없음** + experience=beginner → BeginnerNote
- **명시 없음** + experience=expert → ExpertNote
- **builtin-beginner / builtin-expert** ID → 위와 동일
- **커스텀 / 커뮤니티 양식 ID** → DynamicTemplateForm (필드 정의에 따라 동적 렌더)

**입문자 모드 (BeginnerNote)**
- 와인명·생산자 표시
- 별점(1~5)
- 향 체크박스 (과일/꽃/나무/흙/기타)
- 맛 라디오 (가벼움~진함, 단맛, 신맛, 탄닌)
- 자유 메모
- 서빙 온도 입력
- AutoDescription — 선택값 기반 한·영 자동 묘사
- 사진 첨부 (PlaceholderToast)

**전문가 모드 (ExpertNote)**
- WSET 5축 슬라이더 — 단맛·산미·바디·알코올·타닌
- 향·풍미 강도, 타닌 텍스처/숙성도, 마무리 길이
- AromaWheel (UC Davis 계통, 3레벨)
- CaudalieMeter (1~30초 여운)
- FaultChecklist
- OpeningTimeline (디캔팅·체크포인트·peak 도달)
- TanninPanel (red 전용)
- BubblePanel (sparkling 전용 — 크기·지속성·무스·제조 방식·도사주)
- RegionalAromaHints — 산지별 대표 아로마 칩
- AutoDescription
- BlindMode — 와인 정보 숨김 + 추측 입력
- PeakEtaInput — 추정 절정 연도 + 신뢰도 + 메모
- ServingTempInput
- 100점 평점 + 재구매 의향(boolean)
- 자유 메모 (Playfair italic)

**DynamicTemplateForm 지원 필드 타입**
- slider (1~5), wsetScale, rating(별점 0~5), chipsSingle, chipsMulti, text(긴 메모), number, checkbox

수정 모드: `?edit=1&templateId=...`로 진입 시 원본 노트의 모드/템플릿을 그대로 재현

---

### 2.11 노트 상세 read-only (`/notes/[noteId]`)

내 노트(`note_…`)와 공유 노트(`sn-…`) 양쪽 지원.
- 와인 헤더(사진 또는 그라데이션) — `/wine/[id]` 진입
- 작성자 + 메타 카드: 레벨 그라데이션 아바타, 날짜, /100점, 가격(있을 때), 사용된 템플릿 배지
- 메모 본문 (Playfair italic)
- 내 노트일 때 BackHeader에 **Edit** 버튼 (Share 버튼은 모두 노출)
- 노트 차원 요약 카드 (Expert):
  - **WSET 차원** (단맛·산미·바디·알코올·타닌)
  - **구조** (향·풍미 강도 + 타닌 텍스처/숙성도 + 마무리 길이 라벨/범위)
  - 풍미 노트 자유 입력
  - **버블** (크기·지속성·무스·방식·도사주) — sparkling 전용
  - **여운·온도** (caudalies + 시음 온도)
  - **아로마** — 카테고리별 chips 그룹
  - **오프닝 타임라인** (오픈 시각·디캔팅·peak 도달·체크포인트 list /100)
  - **음용 적기 추정** (절정 연도·신뢰도·메모)
  - **결함**
  - **재구매 의향** (Yes/Not this time)
- Beginner 노트는 4차원 미니 그리드(단/산/바/타닌, /5)

---

### 2.12 라벨 스캔 (`/capture`)

- 4개 옵션 카드 — 카메라 스캔 / 갤러리 / 내 라이브러리 / 수동 입력
- 1.5초 AI 분석 시뮬레이션 (로딩 애니메이션)
- 인식 결과 카드 — 와인명·생산자·빈티지·지역·외부 평점
- "노트 작성" → `/notes/new/write?from=newEntry&wineId=…`
- "셀러에 추가" → localStorage 저장 + XP 토스트
- 다시 스캔 / 직접 입력

---

### 2.13 프로필

**내 프로필 (`/profile`)**
- ProfileHero — 아바타·닉네임·레벨·가입일
- StatGrid — 마신 와인/방문 국가/탐험 지역/노트 수/셀러 병 수 (localStorage 머지)
- QuickLinks — 즐겨찾기 / 뱃지 / 사진 / 랭킹 / 지도

**타 유저 프로필 (`/profile/[userId]`)**
- UserMapHero — 해당 유저 방문 국가 미니맵 + 통계
- TasteCompatibilityCard — 취향 일치도 점수 (공유 와인·공유 지역)
- 시음 와인 리스트 (최근순/평점순 탭)
- 팔로우 버튼 (PlaceholderToast)

**랭킹 상세 (`/profile/ranking`)**
- 현재 레벨 카드 + 다음 레벨까지 진척도
- XP 적립 액션 전체 (노트 작성·셀러 추가·스캔·국가 첫 방문 등)
- 5단계 레벨 카탈로그 (브론즈~플래티넘 혜택 카드)

---

### 2.14 즐겨찾기 (`/favorites`)

- 와인명·지역·평점 리스트
- 아이템별 "구매 시 알림" 토글 → 가격 등록 누적 시 푸시 알림 트리거
- 와인 상세 진입
- 빈 상태 EmptyState

---

### 2.15 뱃지 진열장 (`/badges`)

- 등급 필터 칩 — all/bronze/silver/gold/platinum
- 보유/미보유 그리드 (미보유는 Lock + 흐림)
- 뱃지 클릭 → BottomSheet 상세 (이름·설명·획득 조건·획득일)
- 보유/전체 카운트

---

### 2.16 라벨 사진 갤러리 (`/photos`)

- 필터 — all / 올해 / 셀러 연결됨 / 마신 와인 / 미매칭
- PhotoCard 그리드 (와인명·날짜)
- 클릭 → BottomSheet (와인 링크·셀러/노트 연결 정보)
- "스캔 추가" → `/capture`
- 빈 상태

---

### 2.17 알림 (`/notifications`)

- 타입별 NotificationRow (아이콘·제목·상대 시간)
- "모두 읽음 처리" 버튼
- 읽음/미읽음 시각 구분
- 빈 상태

---

### 2.18 와인 용어 사전

**리스트 (`/glossary`)**
- 카테고리 칩 — all / sensory / fault / classification / technique / unit
- 한·영 + 정의 전문 검색
- 알파벳 정렬, 카테고리 아이콘
- 진입 시 `/glossary/[term]`

**상세 (`/glossary/[term]`)**
- 한·영 용어명 + 카테고리 배지
- 정의 본문
- 관련 용어 링크
- 인라인 GlossaryTooltip 헬퍼와 공유

---

### 2.19 온보딩 (`/onboarding`)

4스텝:
1. Welcome — 서비스 소개
2. Language — 한국어 / English (즉시 LocaleContext 반영)
3. Experience — 입문자 / 전문가 (즉시 ExperienceContext 반영)
4. Done — 완료 화면

- 종료 시 `localStorage.winemine.onboardingComplete='true'` → `/` 이동
- 이미 완료된 유저 진입 시 `/`로 리다이렉트

---

### 2.20 설정

**설정 홈 (`/settings`)**
- 앱 섹션: 언어 / 경험 수준 / **테이스팅 노트 양식** / **외관(테마)** — 현재 값 표시
- 알림 섹션: 알림 설정
- 계정 섹션: 닉네임 변경 / 로그아웃 (PlaceholderToast)
- 정보 섹션: 버전 / 약관 / 개인정보처리방침

**언어 (`/settings/language`)**
- RadioList — 한국어 / English (즉시 반영 + 토스트)

**경험 수준 (`/settings/experience`)**
- RadioList — 입문자 / 전문가 (설명 포함)

**알림 설정 (`/settings/notifications`)**
- ToggleRow — 음용 적기 / 가격 변동 / 커뮤니티 활동 등

**외관 (`/settings/appearance`)** ← 신규
- 다크 (와인 바 톤, 짙은 보라 배경) / 라이트 (크림 종이 + 골드 강조)
- ThemeContext 즉시 반영 + 토스트
- 라이트 모드는 화이트 와인 컨셉 + 골드 통일 (라운드 1·2 가독성 패치 반영)

**테이스팅 노트 양식 (`/settings/tasting-template`)** ← 신규
4섹션 구성:
1. winemine 제공 (builtin beginner / expert) — read-only
2. 내가 만든 양식 — 편집(Pencil) / 삭제(Trash) / 공개 토글(Globe 뱃지)
3. 저장한 커뮤니티 양식 — 저장 해제(Bookmark)
4. + 새 양식 만들기 → `/settings/tasting-template/new`
5. "커뮤니티 양식 둘러보기" → `/community/templates`

**양식 빌더 (`/settings/tasting-template/new`, `/[templateId]/edit`)**
- 제목·설명 (ko/en 양쪽 입력)
- 필드 단위 add/remove/위↑아래↓
- 필드 라벨(ko/en) + 옵션 편집
- 지원 필드 타입: slider, wsetScale, rating(별점), chipsSingle, chipsMulti, text, number, checkbox
- "커뮤니티에 공유" isPublic 토글
- 편집 모드: 기존 템플릿 로드 → 수정/삭제

---

### 2.21 커뮤니티

**피드 (`/community`)** — 5탭
- **Following** — Tonight 티저 배너 + 팔로잉 피드 CommFeedCard
- **All** — 타입 필터 칩(all/note/question/column/news/album) + CommFeedRow 컴팩트 리스트
- **Trending** — 키워드 hash 칩(부르고뉴 22빈티지·레 루지엥·디캔팅 시간 등 + 횟수) + 랭킹 카드 (TrendingUp/Flame/ChevronUp 아이콘)
- **Notes** — 공유된 시음 노트 카드 (작성자 레벨 그라데이션 아바타·평점/100·메모·♥/저장/날짜)
- **Templates** — 커뮤니티 노트 양식 카드 (제목·작성자·필드수·저장수·저장 토글)
- 인기/최신 SortToggle (Notes·Templates 탭에서)
- 우하단 PenLine FAB (모바일에서 viewport 우하단 고정, 데스크톱은 frame 내 absolute, 골드 그라데이션 + 골드 보더)

**오늘 밤 (`/community/tonight`)**
- 실시간 와인 마시는 유저 피드
- 미니 지도 위 지역 도트 (청담·한남·판교 등)
- 유저 아바타 + 와인명 + 장소 + 시간 + 분위기

**Discover (`/community/discover`)**
- 취향 일치도 % 상위 유저 리스트
- 공통 산지·품종 태그 미리보기

**포스트 상세 (`/community/[postId]`)**
- 본문 + 작성자 + 연결 와인 카드
- 좋아요·댓글 수
- ReactionBar

**댓글 (`/community/[postId]/comments`)**
- CommentRow 리스트 (LevelPill + 타임스탬프)
- 입력 폼 (PlaceholderToast)

**글 작성 (`/community/new`)**
- 타입 선택: 시음 노트 / 질문 / 칼럼 / 뉴스 / 앨범
- Column (`/community/new/column`) — 제목·본문·태그·와인 연결
- Album (`/community/new/album`) — 사진 업로드 + 캡션

**커뮤니티 양식 둘러보기 (`/community/templates`)**
- 인기/최신 SortToggle
- 양식 카드 + 저장/저장 해제 (Bookmark) — 저장 시 노트 작성 picker에 즉시 노출
- 토스트: "이제 이 양식으로도 노트를 쓸 수 있어요"

---

## 3. 크로스커팅 규칙

### 3.1 언어 (Locale)
- 한국어 / English 두 가지, 온보딩 + 설정에서 즉시 전환
- **영어 모드에서 한글은 단 한 글자도 노출 금지** — 와인명·생산자·지역·알림·뱃지·정의·아펠라시옹 등 전 사용자 노출 문자열
- 한국어 모드에서 영어 병기는 허용
- 모든 도메인 데이터는 LocalizedString `{ ko, en }` 패턴, `LocaleText`가 분기 렌더

### 3.2 테마 (Theme) ← 신규
- 다크: 와인 바 짙은 보라 배경 (기본)
- 라이트: 크림 종이 + 골드 강조 (화이트 와인 컨셉)
- ThemeContext + localStorage, 즉시 전환
- 지도 글래스 오버레이는 라이트 모드 별도 분기

### 3.3 레벨·뱃지 노출 (LevelPill)
모든 사용자 생성 콘텐츠에 레벨 칩 동반:

| 콘텐츠 | 위치 |
|---|---|
| 커뮤니티 리뷰 | 작성자 행 우측 |
| 가격 구매 기록 | 익명 (`LevelName #anonId`) |
| 커뮤니티 음용 적기 추정 | 추정자 행 |
| 공유 시음 노트 | 작성자 레벨 그라데이션 아바타 |
| 댓글 | 작성자 행 |

### 3.4 즐겨찾기 → 구매 알림 플로우
즐겨찾기 등록 → 다른 유저 가격 등록 누적 → 푸시 알림("누군가 [와인명]을 [가격]에 구매했어요!") → `/notifications` → `/wine/[id]` → PriceChart → `/wine/[id]/prices` 매장별 표

### 3.5 작성 중 노트 이어쓰기 (DraftNoteResume)
홈 상단 CTA. 미완성 노트가 있으면 노출.

### 3.6 노트 공유 / 저장 / Edit
- 내 노트(`note_…`)는 본인만 Edit 버튼
- 공유 노트(`sn-…`)는 작성자 read-only 카드 + 평점·메모만
- 모든 노트는 Share 버튼
- 양식 ID는 LocalStorage(TastingTemplateContext)로 저장/관리

---

## 4. 공통 인프라 컴포넌트

| 컴포넌트 | 역할 |
|---|---|
| DeviceFrame | iPhone 390×844 목업 + Dynamic Island + Home Indicator |
| StatusBar | 상단 상태바 (시간·신호·배터리) |
| PushBanner | 데모용 푸시 알림 배너 |
| AppHeader | 홈 계열 상단 헤더 (로고·알림·레벨 칩) |
| BackHeader | 서브 페이지 뒤로가기 헤더 (액션 슬롯 지원) |
| BottomNav | 하단 5탭 (홈·지도·스캔·프로필·셀러) |
| BottomSheet | 슬라이드업 모달 |
| Modal | 범용 모달 |
| ConfirmDialog | 확인/취소 다이얼로그 |
| PlaceholderToast | 미구현 액션 토스트 피드백 |
| EmptyState | 빈 상태 일러스트 + 텍스트 + 액션 |
| PageBackground | 페이지 배경 그라디언트 |
| LocaleText | LocalizedString ko/en 분기 렌더 |
| GlossaryTooltip | 인라인 (i) → 용어 정의 팝업 |
| LevelPill | 레벨 배지 칩 |
| LevelProgressBar | XP 진척도 바 (골드 glow) |
| ReviewBadge | 외부 평점 배지 |
| PrimaryButton | 주요 CTA 버튼 |
| WineLabelArt | SVG 와인 라벨 아트 플레이스홀더 |
| **WMBottle** | 와인 병 SVG (포일캡·골드칼라·라벨·빈티지) |
| **WMGlassRating** | 와인잔 5개 아이콘 평점 (half 지원) |

---

## 5. 데모 / 개발 도구

| 컴포넌트 | 역할 |
|---|---|
| DemoControls | 데스크톱 좌측 패널 — first-time / heavy 모드 전환 (URL `?demo=` 동기) |
| FeatureFlagPanel | 데스크톱 우측 패널 — 현재 라우트 기능별 status 토글 (`useRegisterFeatures` 자동 수집) |

---

## 6. 전역 상태 (Context)

| 컨텍스트 | 저장소 | 역할 |
|---|---|---|
| AppModeContext | localStorage + URL `?demo=` | first-time / heavy 모드 |
| ExperienceContext | localStorage | beginner / expert |
| LocaleContext | localStorage | ko / en |
| **ThemeContext** ← 신규 | localStorage | dark / light |
| FavoritesContext | localStorage | 즐겨찾기 와인 목록 |
| UserDataContext | localStorage | 사용자 추가 셀러·노트 (mock 머지) |
| **TastingTemplateContext** ← 신규 | localStorage | 내 커스텀 양식 / 저장한 커뮤니티 양식 |
| FeatureFlagContext | in-memory | 라우트별 기능 status |

---

## 7. Mock 데이터 (`src/lib/mock/`)

| 파일 | 데이터 |
|---|---|
| wines.ts | 와인 카탈로그 30종+ (LocalizedString) |
| users.ts | 2명 — heavy(풍부) / first-time(빈 컬렉션) |
| cellar.ts | 셀러 아이템 목록 |
| tasting-notes.ts | 내 테이스팅 노트 |
| **shared-notes.ts** ← 신규 | 커뮤니티 공개 노트 풀 (작성자 익명) |
| purchases.ts | 구매 기록 (가격 추이) |
| stores.ts | 와인 판매점 14곳 |
| notifications.ts | 알림 |
| favorites.ts | 즐겨찾기 |
| badges.ts | 뱃지 카탈로그 |
| levels.ts | 5단계 레벨 정의 |
| reviews.ts | 커뮤니티 리뷰 |
| wine-stories.ts | 와이너리 스토리 본문 |
| external-ratings.ts | Vivino·WS·CT 점수 |
| community-peaks.ts | 음용 적기 추정 |
| community-posts.ts | 커뮤니티 포스트 풀 |
| label-photos.ts | 라벨 사진 메타 |
| glossary.ts | 와인 용어 사전 |
| **tasting-templates.ts** ← 신규 | builtin beginner/expert + 커뮤니티 풀 + 정렬 헬퍼 |

---

## 8. 보조 라이브러리 (`src/lib/`)

| 파일 | 역할 |
|---|---|
| drink-window.ts | 음용 적기 계산 (from·peak·to·status) |
| xp.ts | XP 액션 정의 + 레벨 계산 |
| compatibility.ts | 두 유저 취향 일치도 점수 |
| regional-aromas.ts | 산지별 대표 아로마 매핑 |
| community-peak-aggregator.ts | 커뮤니티 추정 → 히스토그램 |
| tasting-note-lexicon.ts | UC Davis 아로마 휠·WSET·결함 카탈로그 |
| recommended-wines.ts | 입문용 추천 와인 |
| profile-helpers.ts | 사용자 resolve 유틸 (mock + user) |

---

## 9. 기술 스택

- Next.js 15 App Router (TypeScript strict)
- Tailwind CSS v4 + CSS 변수 토큰 시스템 (다크/라이트 분기)
- next-intl (`messages/ko.json`, `messages/en.json`, 각 841줄)
- react-simple-maps v3 (dynamic, SSR off) + topojson-client
- Recharts (PriceChart LineChart, PeakDistribution 히스토그램)
- Framer Motion (PeakGreeting 페이드, 온보딩 전환)
- lucide-react (모든 아이콘 — 이모지 금지)
- localStorage (demo·locale·experience·theme·즐겨찾기·user data·tasting templates)
