# CDS-max 시안 재개 가이드

> 다음 세션 즉시 이어서 할 수 있는 컨텍스트 요약. `/cds` 실행 후 이 파일 먼저 읽기.

## 컨텍스트 한 줄
`cold-start-lounge-home-prd.md` v0.3을 CDS 최대 활용으로 Figma Test 페이지에 옮기는 중. Shell만 완성, 9 섹션 미착수.

## 타겟
- **파일**: `t0SK7XaNqw8qIY3PpZw4s7`
- **페이지**: `25577:23646` (이름 "Test")
- **스크린 프레임 (생성 완료)**: `25582:337` "Lounge Cold Start (CDS-max)" 390×auto

## Shell 구성 (25582:337 직계 자식)
| 노드 ID | 이름 | 타입 |
|---|---|---|
| 25582:389 | iOS StatusBar | CDS instance (Dark) |
| 25582:409 | Lounge Top Bar | 커스텀 (검정 pill 180×40 / 피드·라운지·빨간 dot / 검색) |
| 25582:422 | Body | 커스텀 frame (빈 상태, vertical AL, padding top:4 bottom:16) |
| 25582:423 | TabBar | CDS instance Active=Feed |
| 25582:478 | iOS HomeIndicator | CDS instance Light |

## 다음 세션 실행 체크리스트

### 1. 이미지 맥락 매핑 (먼저)
페이지 `14332:285690`의 3 섹션(25429:17375 Lounge Screen / 24112:14085 Creator Case / 22206:21655 Consumer)을 walk해서 이미지 fill 수집.
크기별 분류:
- **아바타용 (20-80pt, aspect ~1)**: 원형 크리에이터 포트레이트
- **챌린지 썸네일 (100-250pt)**: Challenge Mission Card Thumbnail
- **Spotlight/News hero (300+pt)**: 대형 이미지

### 2. 섹션 구현 (4-5회 use_figma 호출 예상)

| # | 섹션 | CDS 인스턴스 | 커스텀 |
|---|------|------------|--------|
| §4.1 | Hero Banner | Badge | Hero Banner 래퍼 (white bg variant) |
| §4.2 | My Lounge | Content Header | Prompt Slot 3개 (원형 dashed circle 60×60 FIXED) |
| §4.3 | Spotlight | Avatar, Creator Badge(Pro), Button×2 (Primary solid + Outline) | Spotlight Card (full-bleed image + scrim + PRO badge + Today chip + avatar peek) |
| §4.4 | Categories | TabsTrigger Tag 8개 + **Profile Card Vertical 4개** | — (CDS-max 핵심) |
| §4.5 | Trending | Avatar 2X-Large 8개 + Badge 8개 | 원형 wrap + delta badge overlay |
| §4.6 | Popular | **Pro Creator Card 6개** | — (CDS-max 핵심) |
| §4.7 | News | Lounge Card 시도 or 커스텀 | thumb 64×64 + eyebrow + title + body fade |
| §4.8 | Bait | Button Secondary | Mini Challenge 2개 |

### 3. 기존 시안 참조 (plumlabs-context에서 복사 가능)
- `25490:337` CDS 정합 버전 — §4.4/§4.6 이미 Profile Card/Pro Creator Card 사용. 구조 참고.
- `25560:337` Proto default — from-scratch 프로토타입 재현 기준.
- `25568:337` Proto Tweak — green gradient / inline card / no news.

### 4. 주요 CDS 컴포넌트 키
- iOS StatusBar: `273474072cdbfdfad86dfb1af37145b44ecd193e`
- iOS HomeIndicator: `af0785828cc0c17aaa98e2f86b47605860b4ec48`
- TabBar: `7e2bd65f6b703a8860ae987de65be925f301c3a9`
- Content Header: `f80bf2aa2b80f1fb6dcb04d6ef3891ebc29b1d05`
- Button: `40aeea83d711664085b19b9470c0718c2ebe10ed`
- Badge: `e8805c655161e7d35e619793745498516eb493bc`
- Creator Badge: `5be34e3dec0d8e61abbe6a5e49ee47c064c5c1c1`
- Avatar: `5a800bdc6e26ef84f1480ce44343a7fd3e9029a2`
- Pro Creator Card: `2ca6610baebdac1e71ab3c98afd96601c55efeaa`
- Profile Card: `43c74e269ea710c0f8f02a7a7eb63f09aa742b97`
- TabsTrigger Tag: `56d46a27e1eda85271a7916a54f9b5f830bf193f`
- Lucide search icon: `98f66ee23b24c292b8b9f49f06a0d254ff6d9b9b`

### 5. 주의사항 (이전 세션 학습)
- `use_figma` code 50KB 제한 → 섹션별 분할
- `use_figma` base64 transport 5KB+ truncation → 파일 내 기존 해시만 재활용 (Unsplash URL import 불가)
- Sub-instance setProperties 후 findAll 사용 시 phantom node 에러 → 직접 children 탐색 + try/catch
- 원형 frame은 layoutMode=NONE + resize 고정 필요 (VERTICAL auto로 하면 HUG에 의해 축소됨)

### 6. 카피 (Option 2 - 용어 정합)
- §4.1 배지 "NEW START" / 타이틀 "아직 참여한 라운지가 없어요.\n크리에이터를 만나보세요" / 서브 "전문 크리에이터를 팔로우하고\n크리에이터 챌린지와 커뮤니티에 참여해 보세요"
- 용어 금지: "슈퍼호스트", "독점 챌린지", "방", "방장"

## 관련 문서
- PRD: `/Users/zen/Project/plumlabs-context/_to_be_applied/cold-start-lounge-home-prd.md`
- Team 회의: `meetings/2026-04-21_lounge-cold-start-cds-max-planning.md`
- 이전 Rev.20: `reviews/2026-04-21_pencil-figma-roundtrip-test.md`
