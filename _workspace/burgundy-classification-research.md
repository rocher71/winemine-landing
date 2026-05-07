# 부르고뉴 와인 분류 체계 — 와인 덕후의 시각

> **작성 배경.** winemine 부르고뉴 드릴다운 섹션의 현재 필터(상세지역 / 생산자 / 밭)가 와인 덕후 관점에서 "전문성이 떨어진다"는 피드백을 받음. 이 문서는 부르고뉴 와인을 실제로 마시고 거래하고 평가하는 사람들이 어떤 축으로 와인을 분류·식별·평가하는지 정리하고, winemine UI 재설계를 위한 근거를 제공한다.
>
> **참고 자료.** `_workspace/france-wine-research.md` (사내 조사 자료) + 외부 웹 자료 (Decanter, Wine Enthusiast, Cult Wines, BIVB(Bourgogne Wine Board), UNESCO, Jancis Robinson 등).

---

## 핵심 결론 (TL;DR)

**부르고뉴는 "땅"을 분류한다. 보르도가 "샤토(생산자)"를 분류하는 것과 정반대다.**

- 보르도의 1855 그랑 크뤼 클라세는 **샤토 단위**(Lafite, Latour…) — 와이너리에 등급이 붙는다.
- 부르고뉴의 AOC는 **포도밭(클리마) 단위** — 같은 밭이면 누가 만들어도 같은 등급. 등급은 땅에 붙는다.

따라서 부르고뉴 와인을 식별·평가할 때 1순위는 "어떤 **클리마(climat)**의 어떤 **등급(cru)** 와인인가"이고, 그 다음에 "누가(**도멘**) 어느 **빈티지**에 만들었는가"가 따라온다. **"상세지역 / 생산자 / 밭"이라는 평면적 구분은 부르고뉴의 본질적 위계를 평탄화시킨 것**으로, 와인 덕후 입장에서 어색하게 느껴진다.

---

## 1. 부르고뉴 와인 덕후가 쓰는 7개 분류 축

와인 덕후가 부르고뉴 와인 한 병을 보면 **다음 순서로 정보를 디코딩한다.** 굵은 글씨가 핵심 식별 축.

### 1) 등급 (Cru / Classification) — **최우선**
4단계 피라미드. 부르고뉴 분류의 척추.

| 등급 | 비율 | 의미 | 라벨 표기 예시 |
|---|---|---|---|
| **Grand Cru** | ~1.4% | 33개 단일 클리마. 클리마 자체가 곧 AOC | `Romanée-Conti`, `Le Montrachet`, `Chambertin` (마을명조차 안 씀) |
| **Premier Cru (1er Cru)** | ~10% | 약 640개 클리마. 마을 AOC 안의 우수 클리마 | `Gevrey-Chambertin 1er Cru Clos Saint-Jacques` |
| **Village** | ~37% | 44개 마을 AOC. 한 코뮌 안의 일반 포도밭 | `Meursault`, `Pommard` |
| **Régional** | ~52% | 부르고뉴 전역 포괄 AOC | `Bourgogne Pinot Noir`, `Bourgogne Aligoté` |

**왜 1순위인가.** 보르도와 달리 부르고뉴는 등급이 **포도밭(땅)**에 붙어 있어, 누가 만들어도 그 등급. 라벨에서 가장 먼저 눈에 띄는 정보이며, 가격·희소성·숙성 잠재력이 등급에 강하게 종속된다. 와인 덕후는 "Grand Cru를 몇 병 마셔봤다"는 식으로 컬렉션을 자랑한다.

### 2) 클리마 (Climat) — **부르고뉴의 영혼**
> "클리마"는 기후가 아니다. **개별 포도밭 구획**을 가리키는 부르고뉴 전용 용어다.

- **정의.** 토양·지질·향(向) ·고도·경사가 어우러진, 시간이 지나도 **일관된 개성**을 보이는 정밀하게 구획된 단일 포도밭.
- **2015년 UNESCO 세계문화유산 등재** — "Climats, terroirs of Burgundy". 코트 도르(Côte d'Or)에만 **1,247개 클리마**가 공식 인정됨 (샤블리·코트 샬로네즈·마코네 별도).
- **Climat vs Lieu-dit 구분 (전문가 영역).**
  - *Lieu-dit* — 1807년 나폴레옹 토지대장(cadastre)에서 유래한 일반적 "이름 붙은 땅". 프랑스 어디에나 존재.
  - *Climat* — 부르고뉴 고유. **Premier Cru / Grand Cru에 한해** 클리마라고 부르며 INAO(국립원산지명칭통제기구) 인증을 받은 것. BIVB(Bourgogne Wine Board)는 빌라주·레지오날 단위 명명에는 *lieu-dit*만 쓰고, 1er Cru / Grand Cru에만 *climat*을 쓰자는 입장.
  - 일상에서는 두 단어가 혼용되지만, 와인 덕후는 이 차이를 알고 구분해 쓴다.

**구체 예시.** 뫼르소(Meursault) 마을 안에서:
- **뫼르소** *Meursault* (Village 등급) — 마을 평균
- **뫼르소 레 테송** *Meursault Les Tessons* (Lieu-dit, 등급은 Village) — 동일 등급 안의 명명된 구획
- **뫼르소 1er Cru 레 샤름** *Meursault 1er Cru Les Charmes* (Premier Cru = 클리마)
- **뫼르소 1er Cru 레 페리에르** *Meursault 1er Cru Les Perrières* (다른 Premier Cru 클리마)

→ 같은 마을·같은 도멘·같은 빈티지여도 **클리마가 바뀌면 다른 와인**. 부르고뉴 컬렉션의 깊이는 클리마를 얼마나 다양하게 마셨는지로 측정된다.

### 3) 마을 (Commune / Village)
46개 마을 AOC. 같은 꼬뜨 안에서도 마을마다 스타일이 명확히 다르다 — "주브레는 묵직하고 남성적, 샹볼은 가볍고 향기롭다" 같은 캐릭터 어휘가 와인 덕후 사이의 공통어.

| 코트 드 뉘 마을 | 캐릭터 | 코트 드 본 마을 | 캐릭터 |
|---|---|---|---|
| **주브레-샹베르탱** Gevrey-Chambertin | 묵직, 남성적, 검은 과실 | **포마르** Pommard | 강건, 흙내음 |
| **샹볼-뮈지니** Chambolle-Musigny | 가볍고 향기로움, 꽃 | **볼네** Volnay | 우아, 실키 |
| **본-로마네** Vosne-Romanée | 이국적, 향신료, 깊이 | **뫼르소** Meursault | 풍성, 버터, 헤이즐넛 |
| **모레-생-드니** Morey-Saint-Denis | 체리, 견고함 | **퓔리니-몽라셰** Puligny-Montrachet | 정밀, 미네랄, 시트러스 |
| **뉘-생-조르주** Nuits-Saint-Georges | 견고, 광물성 | **샤사뉴-몽라셰** Chassagne-Montrachet | 풍성, 견과 |

마을 이름은 라벨의 핵심 식별자다 (Grand Cru는 마을명을 생략하므로 예외).

> **표기 주의.** 한국 와인 업계에서는 프랑스어 발음에 가까운 표기를 쓴다. 영어식 발음(예: "게브레이")은 와인 덕후 대화에서 즉시 어색함이 드러나므로 피하는 것이 좋다.

### 4) 꼬뜨 (Côte) / 대(大)지역
- **Chablis** — 100% 샤르도네, 키메리지안 토양, 가장 미네랄
- **Côte de Nuits** — 피노 누아의 본거지, 부르고뉴 최고급 레드 거의 전부
- **Côte de Beaune** — 화이트의 왕국 (Montrachet) + 우아한 레드 (Pommard, Volnay)
- **Côte Chalonnaise** — 가성비 부르고뉴
- **Mâconnais** — 따뜻한 화이트 (Pouilly-Fuissé)
- **Beaujolais** — 가메 100%, 별개 지역으로 보기도 함

코트 단위는 **취향의 큰 분기점** — "나는 코트 드 뉘 레드 위주로 마신다"처럼.

### 5) 도멘 / 메종 / 네고시앙 (생산자 유형) — **소유와 양조 방식**
부르고뉴에서 "생산자"는 단일 카테고리가 아니다. 이 구분이 와인 덕후 사이에서 큰 차이를 만든다.

| 유형 | 정의 | 라벨 표기 | 가치 평가 |
|---|---|---|---|
| **Domaine** | 자기 밭에서 재배·양조·병입까지 — 평균 8ha 미만의 소규모 가족 경영 | `Mis en bouteille au domaine` | 떼루아 표현 ↑, 희소성 ↑ |
| **Maison** | 매입 포도/주스로 양조 — '하우스' 의미 | `Maison ~`, `Mis en bouteille par ~` | 양조자의 스타일 ↑ |
| **Négociant** | 포도·주스·완성 와인을 매입해 블렌딩·병입·판매. 부르고뉴 와인의 **절반 이상**을 담당. 평균적으로 도멘의 10배 생산 | (메종과 혼용) | 가격 접근성 ↑, 일관성 ↑ |
| **Négociant-Éleveur** | 매입 포도·주스를 **자기 양조장에서 숙성·병입**하는 메종 — 최근 부활하는 카테고리 | `Négociant-Éleveur` | 매입 와인이지만 떼루아 표현 노력 |

**왜 이 구분이 중요한가.** 같은 **뫼르소 레 페리에르 1er Cru**(*Meursault Perrières 1er Cru*)라도:
- **도멘 코슈-뒤리 뫼르소 페리에르** *Domaine Coche-Dury Meursault Perrières* — 도멘이 직접 재배한 0.4ha. 연 1,200병. 시장 USD 5,000+.
- **부샤르 페르 에 피스 뫼르소 페리에르** *Bouchard Père & Fils Meursault Perrières* — 메종이 매입해 양조. 더 많은 양, 일관된 품질, 합리적 가격.

같은 클리마·등급이지만 **희소성·가격·평가가 완전히 다르다.** 이걸 구분 못 하면 와인 덕후 대화에서 즉시 들통난다.

### 6) 모노폴 (Monopole)
- **정의.** 한 클리마(밭)를 **단 하나의 도멘이 100% 소유**한 경우.
- 라벨에 "Monopole" 표기.
- 부르고뉴는 상속법으로 인해 클리마가 잘게 쪼개진 게 일반적이라(Clos de Vougeot 50.6ha를 80여 명이 공유), 모노폴은 **희소성의 정점**.

**대표 모노폴.**
- **로마네-콩티** *Romanée-Conti* — 1.81ha, DRC(도멘 드 라 로마네-콩티) 단독 (그랑 크뤼)
- **라 타슈** *La Tâche* — 6.06ha, DRC 단독 (그랑 크뤼)
- **클로 드 타르** *Clos de Tart* — 7.53ha, 클로 드 타르 도멘 단독 (그랑 크뤼, 부르고뉴 최대 모노폴)
- **라 로마네** *La Romanée* — 0.85ha, 리제-벨레르(Liger-Belair) 단독 (그랑 크뤼, 부르고뉴 최소 AOC)
- **클로 데 랑브레이** *Clos des Lambrays* — 8.84ha, LVMH 산하 (그랑 크뤼)

**대조군 (공유 클리마).** **클로 드 부조** *Clos de Vougeot* 50.6ha 80+ 소유주 / **리슈부르** *Richebourg* / **샹베르탱** *Chambertin* 25 소유주.

→ 같은 그랑 크뤼라도 **모노폴이면 양조 일관성·품질 통제가 압도적**. 와인 덕후는 모노폴 라벨을 보면 가격이 두 배가 돼도 납득한다.

### 7) 빈티지 (Millésime)
부르고뉴는 **대륙성 기후**(서리·우박·여름 폭우)로 **빈티지 편차가 매우 큰 산지**. 보르도가 빈티지마다 비교적 일관된 것과 대비된다. 와인 덕후가 라벨 보고 가장 먼저 입에 올리는 게 빈티지인 이유.

**최근 10년 부르고뉴 빈티지 평가 (Wine Spectator / Cult Wines / Jancis Robinson 종합).**

| 빈티지 | 레드 | 화이트 | 코멘트 |
|---|---|---|---|
| **2015** | ★★★★★ | ★★★★ | "역사적 빈티지". 따뜻한 여름, 농축, 장기 숙성 |
| 2016 | ★★★★ | ★★★★★ | 봄 서리로 수량 적음, 살아남은 와인은 정밀 |
| 2017 | ★★★★ | ★★★★★ | 화이트의 해. 신선·미네랄, "2014 이후 최고 화이트" |
| 2018 | ★★★★★ | ★★★ | 풍년·풍성한 레드 |
| **2019** | ★★★★★ | ★★★★★ | 농축과 신선의 균형. "이 시대의 클래식" |
| **2020** | ★★★★★ | ★★★★★ | "2010 이후 최고", 집중·신선·구조 |
| 2021 | ★★ | ★★★ | 서리 피해 심각, 수량 1/3 감소 |
| 2022 | ★★★★ | ★★★★ | 회복의 해, 풍성 |

→ 와인 덕후는 *"2015 Chambertin Rousseau"* 같은 식으로 **빈티지+클리마+도멘**을 한 호흡에 말한다.

---

## 2. 와인 라벨 디코딩 순서 (와인 덕후의 무의식)

부르고뉴 라벨을 본 와인 덕후의 뇌는 **이 순서**로 파싱한다:

```
Step 1. 등급 신호 찾기
        → "Grand Cru" 표기? → 마을명 없이 클리마만? → 최상위
        → "1er Cru" 표기? → 마을명+1er Cru+클리마명 → 중상위
        → 마을명만? → Village
        → "Bourgogne ~"? → Régional

Step 2. 클리마 / 마을 식별
        → 클리마명을 안다 → 즉시 스타일 추론
        → 마을명을 안다 → 코뮌 캐릭터 추론

Step 3. 생산자 유형 + 명성
        → "Domaine ~" 또는 "Mis en bouteille au domaine" → 도멘
        → "Maison ~" → 매입 양조
        → 도멘 이름이 알려진 톱티어인가? (DRC, Leroy, Rousseau, Coche-Dury…)

Step 4. 빈티지
        → 좋은 해? 영(young)한가, 마실 적기인가?

Step 5. 모노폴 표기 / 기타 단서
        → "Monopole"? → 희소성 추가 점수
        → 임포터·수입사 (한국 시장 신뢰도)
```

**예시 — Domaine Armand Rousseau Chambertin Grand Cru 2015 (도멘 아르망 루소 샹베르탱 그랑 크뤼 2015)**
1. Grand Cru → 최상위 등급 (그랑 크뤼)
2. Chambertin (샹베르탱) → 주브레-샹베르탱(Gevrey-Chambertin) 마을의 그랑 크뤼 클리마. 묵직·구조감.
3. Domaine Armand Rousseau (도멘 아르망 루소) → 주브레-샹베르탱의 절대자, 도멘 직접 양조
4. 2015 → 역사적 빈티지, 30년 이상 숙성 가능
5. (모노폴 아님 — Chambertin(샹베르탱)은 25명 소유 공유 클리마)

→ 한 줄로 압축: **"역사적 해의, 주브레-샹베르탱 절대자가 만든, 그랑 크뤼 단일 클리마 와인."**

---

## 3. 와인 덕후가 컬렉션을 분류하는 실제 축

위 7개 축 중 **컬렉션 분류·자랑·검색 시 실제로 쓰이는 축은 이렇다** (와인 커뮤니티·블로그·셀러 트래커 관찰 종합):

| 우선순위 | 분류 축 | 활용 빈도 | 비고 |
|---|---|---|---|
| 1 | **등급 (Cru)** | ★★★★★ | "그랑 크뤼 5병, 1er Cru 12병, 빌라주 8병" |
| 2 | **클리마 (Climat)** | ★★★★★ | "Romanée-Conti는 한 번, Chambertin은 세 번 마셔봤다" |
| 3 | **도멘** | ★★★★★ | "DRC 라인업 컴플리트", "Leflaive 셀러" |
| 4 | **빈티지** | ★★★★ | "2015 빈티지 페어링 디너" |
| 5 | **마을 (Commune)** | ★★★★ | "Meursault 5종 비교 시음" |
| 6 | **모노폴** | ★★★ | 희소성 콜렉터 위주 |
| 7 | **꼬뜨** | ★★ | 큰 분류 — 너무 광역적이라 일상 분류엔 약함 |

**현재 winemine 필터 vs 권장 필터.**

| 항목 | 현재 (평이) | 권장 (덕후 친화) |
|---|---|---|
| 1번 탭 | "상세지역" | **"등급 / Cru"** (Grand / 1er / Village 단위) |
| 2번 탭 | "생산자" | **"도멘 / Domaine"** (생산자 — 좋음, 라벨 강화) |
| 3번 탭 | "밭" | **"클리마 / Climat"** (이름만 바꿔도 즉시 전문성 ↑) |
| (추가) | — | **"빈티지 / Millésime"** (선택) |

→ "**밭 → 클리마**" 한 단어 교체만으로도 와인 덕후 톤이 살아남.
→ "**상세지역**"이 가장 어색. 부르고뉴에서 "지역"은 없는 표현. **"등급 / Cru"**로 갈아엎는 것이 가장 큰 임팩트.

---

## 4. winemine UI 적용 제안

### 제안 A — 최소 변경 (라벨만 교체)
| 현재 | 변경 |
|---|---|
| 상세지역 / Sub-regions | **꼬뜨 / Côte** (또는 **마을 / Commune**) |
| 생산자 / Producers | **도멘 / Domaine** |
| 밭 / Vineyards | **클리마 / Climat** |

→ 작업량 0에 가깝고 즉시 톤 개선.

### 제안 B — 축 재설계 (권장)
필터를 와인 덕후가 실제 쓰는 축으로 재구성.

| 탭 | 라벨 | 그룹핑 단위 | 마커 |
|---|---|---|---|
| 1 | **등급 / Cru** | Grand Cru × 9, 1er Cru × 5 등 등급별로 마신 와인 묶음 | 등급별 색상 핀(Grand 빨강, 1er 골드, Village 회색) |
| 2 | **클리마 / Climat** | 클리마(밭) 단위 — 같은 클리마 다른 도멘 비교 가능 | 다이아몬드 마커 |
| 3 | **도멘 / Domaine** | 도멘별 묶음 + 도멘 유형(Domaine/Maison/Négociant) 배지 | 동그라미 마커 |
| 4 (선택) | **빈티지 / Millésime** | 빈티지별 묶음 — 그 해의 평가/별점 함께 | (지도 대신 타임라인 뷰?) |

→ 와인 덕후 친화도 ★★★★★. 데이터 모델 변경(WINES에 `cru` 필드 추가) 필요.

### 제안 C — 하이브리드 (현실적 추천)
탭 3개를 유지하되 **본질적인 축 재배치**:

| 탭 | 라벨 |
|---|---|
| 1 | **등급 / Cru** ← (현재 "상세지역" 자리) |
| 2 | **도멘 / Domaine** ← (현재 "생산자" 자리, 라벨만 교체) |
| 3 | **클리마 / Climat** ← (현재 "밭" 자리, 라벨만 교체) |

데이터 모델에 `cru` 필드(Grand Cru / 1er Cru / Village / Régional) 추가하면 1번 탭 그룹핑이 가능. 추가 작업 30분~1시간.

**부가 디테일.**
- 도멘 카드에 **유형 배지** ("도멘", "메종", "네고시앙-엘레뵈르") 추가
- 클리마 카드에 **모노폴 표기** ("Monopole" 골드 배지)
- 와인 카드 라벨 약자 옆에 **등급 칩** ("GC", "1er", "V")
- 빈티지 옆에 **빈티지 별점** (Wine Spectator 등급 활용 — ★ 5단계)

---

## 5. 추가로 고려할 만한 와인 덕후 코드

UI에 안 들어가도 톤·카피에 녹일 수 있는 어휘:

- **떼루아 (Terroir)** — 토양·기후·인간의 손이 만드는 고유 환경. 부르고뉴 와인의 핵심 가치
- **밀레짐 (Millésime)** — 빈티지의 프랑스어. 라벨/광고 카피에 빈번
- **네고시앙-엘레뵈르 (Négociant-Éleveur)** — 매입 포도를 자기 양조장에서 숙성·병입하는 메종. 최근 부르고뉴 톱 메종(Drouhin, Bouchard, Faiveley, Jadot)이 자랑스럽게 내세우는 라벨
- **앙 마뉴(En Magnum)** — 매그넘(1.5L) 보틀. 숙성에 유리해 와인 덕후 컬렉션 기본
- **앵 프리뫼르(En Primeur)** — 출시 전 선물(先物) 매입. 부르고뉴는 보르도만큼 보편화되진 않음
- **알로카시옹 (Allocation)** — 도멘이 단골에게 분배하는 할당량. DRC·Leroy·Rousseau는 알로카시옹 받기가 별 따기
- **레지오날 (Régional)** — Bourgogne 단일 AOC. 입문용이지만 좋은 도멘의 레지오날은 가성비 보석
- **빠스튀-그랑(Passe-tout-grains)** — 가메+피노 누아 블렌딩 부르고뉴 AOC, 캐주얼 데일리

---

## 6. 결론 및 권장 액션

1. **즉시 가능 (5분):** 필터 라벨을 "**등급 / 도멘 / 클리마**"로 교체. 가장 작은 변경으로 가장 큰 톤 개선.
2. **중기 (1~2시간):** WINES 데이터에 `cru` 필드 추가, 1번 탭을 "등급" 그룹핑으로 재구현. 카드에 등급 칩·모노폴 배지·도멘 유형 배지 추가.
3. **장기 (선택):** 빈티지 축을 4번째 탭이나 별도 뷰로 노출. 부르고뉴 빈티지의 변동성을 시각화 (좋은 해/나쁜 해 별점).

---

## 7. 한글 표기 용어집 (Korean ↔ French)

> **표기 원칙.** 한국 와인 업계는 **프랑스어 발음**을 표준으로 한다. 영어식 표기(예: Gevrey를 "게브레이"로 읽기)는 와인 덕후·소믈리에 대화에서 즉시 어색해지므로 피한다. 표기가 두 가지 이상 통용되는 경우 더 흔히 쓰이는 것을 먼저 적었다.

### 꼬뜨 / 대지역 (Côte / Région)

| 한글 | 프랑스어 |
|---|---|
| 샤블리 | Chablis |
| 코트 도르 (코트의 황금 띠) | Côte d'Or |
| 코트 드 뉘 | Côte de Nuits |
| 코트 드 본 | Côte de Beaune |
| 코트 샬로네즈 | Côte Chalonnaise |
| 마코네 | Mâconnais |
| 보졸레 | Beaujolais |

### 마을 (Commune) — 코트 드 뉘 북→남

| 한글 | 프랑스어 |
|---|---|
| 마르사네 | Marsannay |
| 픽생 | Fixin |
| **주브레-샹베르탱** | Gevrey-Chambertin |
| 모레-생-드니 | Morey-Saint-Denis |
| 샹볼-뮈지니 | Chambolle-Musigny |
| 부조 | Vougeot |
| **본-로마네** / 플라제-에셰조 | Vosne-Romanée / Flagey-Échezeaux |
| 뉘-생-조르주 | Nuits-Saint-Georges |

### 마을 (Commune) — 코트 드 본 북→남

| 한글 | 프랑스어 |
|---|---|
| 알록스-코르통 | Aloxe-Corton |
| 페르낭-베르즐레스 | Pernand-Vergelesses |
| 사비니-레-본 | Savigny-lès-Beaune |
| 본 | Beaune |
| 포마르 | Pommard |
| 볼네 | Volnay |
| **뫼르소** | Meursault |
| **퓔리니-몽라셰** | Puligny-Montrachet |
| 샤사뉴-몽라셰 | Chassagne-Montrachet |
| 생-토뱅 | Saint-Aubin |
| 상트네 | Santenay |

### 그랑 크뤼 — 코트 드 뉘 (대표)

| 한글 | 프랑스어 |
|---|---|
| **로마네-콩티** | Romanée-Conti |
| 라 타슈 | La Tâche |
| 리슈부르 | Richebourg |
| 로마네-생-비방 | Romanée-Saint-Vivant |
| 라 로마네 | La Romanée |
| 라 그랑드 뤼 | La Grande Rue |
| 에셰조 / 그랑-에셰조 | Échezeaux / Grands-Échezeaux |
| **샹베르탱** | Chambertin |
| 샹베르탱-클로 드 베즈 | Chambertin-Clos de Bèze |
| 샤름-샹베르탱 | Charmes-Chambertin |
| 마지-샹베르탱 | Mazis-Chambertin |
| 라트리시에르-샹베르탱 | Latricières-Chambertin |
| 뤼쇼트-샹베르탱 | Ruchottes-Chambertin |
| 그리오트-샹베르탱 | Griottes-Chambertin |
| 샤펠-샹베르탱 | Chapelle-Chambertin |
| **뮈지니** | Musigny |
| 본 마르 | Bonnes Mares |
| 클로 드 타르 | Clos de Tart |
| 클로 드 라 로슈 | Clos de la Roche |
| 클로 생-드니 | Clos Saint-Denis |
| 클로 데 랑브레이 | Clos des Lambrays |
| **클로 드 부조** | Clos de Vougeot |

### 그랑 크뤼 — 코트 드 본 + 샤블리

| 한글 | 프랑스어 |
|---|---|
| 코르통 | Corton |
| 코르통-샤를마뉴 | Corton-Charlemagne |
| **르 몽라셰** | Le Montrachet |
| 슈발리에-몽라셰 | Chevalier-Montrachet |
| 바타르-몽라셰 | Bâtard-Montrachet |
| 비앙브뉘-바타르-몽라셰 | Bienvenues-Bâtard-Montrachet |
| 크리오-바타르-몽라셰 | Criots-Bâtard-Montrachet |
| 샤블리 그랑 크뤼 — 레 클로 | Chablis Grand Cru — Les Clos |
| 보데지르 / 발뮈르 / 그르누이으 | Vaudésir / Valmur / Grenouilles |
| 부그로 / 프뢰즈 / 블랑쇼 | Bougros / Preuses / Blanchot |

### 1er Cru 클리마 (대표)

| 한글 | 프랑스어 |
|---|---|
| 클로 생-자크 | Clos Saint-Jacques (주브레) |
| 레 페리에르 | Les Perrières (뫼르소) |
| 레 샤름 | Les Charmes (뫼르소) |
| 레 즈느브리에르 | Les Genevrières (뫼르소) |
| 레 테송 (Lieu-dit) | Les Tessons (뫼르소) |
| 레 프뤼리에 | Les Pruliers (NSG) |
| 레 보크랭 | Les Vaucrains (NSG) |

### 도멘·메종 (Domaines & Maisons)

| 한글 | 프랑스어 / 비고 |
|---|---|
| **도멘 드 라 로마네-콩티 (DRC)** | Domaine de la Romanée-Conti |
| 도멘 아르망 루소 | Domaine Armand Rousseau |
| 도멘 르루아 | Domaine Leroy ("르로이"보다 "르루아"가 일반) |
| 코슈-뒤리 | Coche-Dury |
| 콩트 라퐁 | Comtes Lafon |
| 도멘 르플레브 | Domaine Leflaive |
| 도멘 룰로 | Domaine Roulot |
| 도멘 뒤작 | Domaine Dujac |
| 라브노 | Raveneau |
| 앙리 구즈 | Henri Gouges |
| 앙리 자이에 (별세, 전설) | Henri Jayer |
| 콩트 조르주 드 보귀에 | Comte Georges de Vogüé |
| 메오-카뮈제 | Méo-Camuzet |
| 안 그로 | Anne Gros |
| 메종 부샤르 페르 에 피스 | Maison Bouchard Père & Fils |
| 메종 조제프 드루앵 | Maison Joseph Drouhin |
| 메종 루이 자도 | Maison Louis Jadot |
| 메종 페블레 | Maison Faiveley |

### 핵심 용어 (Vocabulary)

| 한글 | 프랑스어 | 의미 |
|---|---|---|
| 그랑 크뤼 | Grand Cru | 단일 클리마 자체가 AOC인 최상위 등급 |
| 프르미에 크뤼 (1er Cru) | Premier Cru | 마을 AOC 안의 우수 클리마 |
| 빌라주 / 마을급 | Village / Communale | 마을 단위 AOC |
| 레지오날 | Régional | 부르고뉴 전역 포괄 AOC |
| **클리마** | Climat | 부르고뉴 고유 — 1er/Grand Cru 단일 포도밭 |
| **리외-디** | Lieu-dit | 일반적 명명 구획 (Village 등급 내) |
| **모노폴** | Monopole | 단일 도멘 100% 소유 클리마 |
| 떼루아 | Terroir | 토양·기후·인간의 손이 만드는 고유 환경 |
| **도멘** | Domaine | 자기 밭에서 재배·양조·병입 |
| 메종 | Maison | 매입 포도/주스로 양조 — '하우스' |
| 네고시앙 | Négociant | 포도·와인 매입·블렌딩·판매 상인 |
| 네고시앙-엘레뵈르 | Négociant-Éleveur | 매입한 것을 자기 양조장에서 숙성·병입 |
| **밀레짐** | Millésime | 빈티지(연도) |
| 미 장 부테이으 오 도멘 | Mis en bouteille au domaine | "도멘에서 병입" — 도멘 와인 인증 라벨 문구 |
| 알로카시옹 | Allocation | 톱 도멘이 단골에 분배하는 할당량 |
| 앙 마뉴 | En Magnum | 매그넘(1.5L) 보틀 |
| 앙 프리뫼르 | En Primeur | 출시 전 선물(先物) 매입 |
| 방당주 타르디브 | Vendanges Tardives | 늦수확 (주로 알자스) |
| 파스-투-그랭 | Passe-tout-grains | 가메+피노 누아 블렌드 부르고뉴 AOC |
| AOC / AOP | Appellation d'Origine Contrôlée / Protégée | 원산지명칭통제 |

### 품종 (Cépages)

| 한글 | 프랑스어 |
|---|---|
| 피노 누아 | Pinot Noir |
| 샤르도네 | Chardonnay |
| 알리고테 | Aligoté |
| 가메 | Gamay |

---

## 출처

- [Decanter — Climat vs Lieu-dit](https://www.decanter.com/learn/are-you-sure-you-know-the-difference-between-a-climat-and-a-lieu-dit/)
- [UNESCO — The Climats, terroirs of Burgundy (1425)](https://whc.unesco.org/en/list/1425/)
- [BIVB — Burgundy's Climats (PDF)](https://www.bourgogne-wines.com/home-press-room/release/gallery_files/site/289/1910/13244.pdf)
- [Trading Grapes — What is a Monopole?](https://tradinggrapes.com/blogs/learn-about-wine/what-is-a-monopole-why-burgundy-s-rarest-vineyards-matter)
- [Cult Wines — Clos de Tart: A New Chapter](https://www.wineinvestment.com/learn/magazine/2018/08/cult-wines-wine-analysis-clos-de-tart-a-new-chapter/)
- [Wikipedia — Romanée-Conti](https://en.wikipedia.org/wiki/Roman%C3%A9e-Conti)
- [BurgDirect — The Burgundy Négociant System Explained](https://burgdirect.com/media/2023-03/the-burgundy-negociant-system-explained/)
- [Wine Enthusiast — What is a Négociant-Éleveur?](https://www.wineenthusiast.com/culture/wine/burgundy-negociant-wine-guide/)
- [Winecap — Burgundy's quality and ownership divisions](https://winecap.com/editorial/learn/understanding-burgundys-quality-and-ownership-divisions)
- [Cult Wines — Burgundy Classification System Guide](https://www.wineinvestment.com/learn/magazine/2022/01/a-guide-to-burgundys-wine-classification-system/)
- [Wine Spectator — Burgundy Vintage Charts](https://www.winespectator.com/vintage-charts/region/burgundy-cotes-de-nuits-reds)
- [Cult Wines — Best Burgundy Vintage Years](https://www.wineinvestment.com/us/learn/insights/best-burgundy-vintage-years/)
- [Jancis Robinson — Burgundy Red Vintage Chart 1978~2024](https://www.jancisrobinson.com/learn/vintages/burgundy-red)
- [Flatiron Wines — How to Read a Burgundy Wine Label](https://flatiron-wines.com/blogs/the-latest/how-to-read-a-burgundy-wine-label)
- [Wikipedia — Burgundy wine](https://en.wikipedia.org/wiki/Burgundy_wine)
- (사내) `_workspace/france-wine-research.md` §부르고뉴 — 등급 체계, 클리마, 마을 라인업
