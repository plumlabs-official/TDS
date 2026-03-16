# 챌린지 카드 4종 바이브코딩 적합성 분석

- **날짜**: 2026-03-16
- **모드**: Team Mode — Feature Review
- **참석**: Design Director, Engineering Lead
- **주제**: ChallengeCard / Challenge List Card / Challenge Mini Card / Participant Card 바이브코딩 적합성 분석 + 수정 목록 재구성

---

## 분석 대상 (프로덕트 디자인)

| 카드 | 파일 키 | 노드 ID |
|------|---------|---------|
| ChallengeCard (미션) | `DxrzwmdzqAi4m4F0pp83gd` | `21230-1767` |
| Challenge List Card | `DxrzwmdzqAi4m4F0pp83gd` | `21230-1943` |
| Challenge Mini Card | `DxrzwmdzqAi4m4F0pp83gd` | `21230-2045` |
| Participant Card (인증) | `DxrzwmdzqAi4m4F0pp83gd` | `21230-2313` |

---

## Phase 1: 전문가별 분석

### Design Director

**디자인 시스템 준수 기준:**

| 기준 | 현재 상태 | 판정 |
|------|----------|------|
| 레이어명이 역할을 설명하는가 | `Text` 4곳, `Description` 3중복 | 실패 |
| 특수문자 없는 이름 | `Blur:mask-group` 콜론 | 실패 |
| 하드코딩된 이름 없음 | `Sophie Tan`, `외`, `5명` | 실패 |
| 아이콘 세트 통일 | Lucide + Huge + Phosphor + Remix + Tabler 5종 혼용 | 실패 |

**아이콘 혼용 현황:**

| 아이콘 세트 | 사용 아이콘 | 갯수 |
|------------|-----------|------|
| Lucide Icons | check, arrow-left/right, star-filled, timer | 5 |
| Huge Icons | cancel-01, clock-01, crown-03, user-multiple | 4 |
| Phosphor Icons | speaker-simple-high | 1 |
| Remix Icons | play-fill, vip-crown-2-fill | 2 |
| Tabler Icons | pencil-plus | 1 |

### Engineering Lead

**바이브코딩 매핑 정확도:**

- `Blur:mask-group` → 콜론이 코드 파서에서 프로퍼티 구분자와 충돌. 파싱 불가
- `ID#6789:1` → React `id` HTML attribute와 충돌
- `Description` 3중복 → AI가 어느 Description인지 구분 불가
- `Sophie Tan` → 하드코딩된 Shadcn 원본 이름, 코드에서 constant로 오인 가능

**코드 복잡도 기준:**

| 컴포넌트 | 프로퍼티 수 | 중첩 깊이 | 판정 |
|----------|-----------|----------|------|
| ChallengeCard | 20+ | 5단계 | 리팩토링 필수 |
| Challenge List Card | 11 | 4단계 | 주의 |
| Challenge Mini Card | 1 | 2단계 | 우수 |
| Participant Card | 8 | 3단계 | 적정 |

---

## Phase 2: 종합 토론

### 합의점
- `Text` 레이어명 전면 교체 (4개 카드)
- `Blur:mask-group` 콜론 제거 → `Gradient Overlay`
- `Sophie Tan` → `Name`
- `ID` → `Host Name`
- 아이콘 Lucide 통일 (비-Lucide 8개 교체)
- Description 3중 충돌 해소

### 충돌점
- **DD**: Video Duration/Button 분리 유지 (디자인 유연성)
- **EL**: 통합 권장 (AI 매핑 오류 방지)

### 트레이드오프

| 옵션 | 장점 | 단점 | 지지 |
|------|------|------|------|
| A. 분리 유지 | 디자인 유연성 | AI 매핑 오류 | DD |
| B. 통합 | AI 매핑 정확 | Duration만 표시 불가 | EL |
| C. 분리 + 문서화 | 유연성 + 가이드 | 문서 의존 | 절충 |

### 추천
> **옵션 C** — 분리 유지 + 유효 조합 문서화. 네이밍 정비 우선, 통합은 실제 오류 발생 시 재검토.

---

## 수정 목록

### Phase 0: 네이밍 (13건)

| # | 대상 | 현재 | 변경 | 카드 |
|---|------|------|------|------|
| 1 | 레이어 | `Text` (Host Info 내) | `Host Name Container` | ChallengeCard |
| 2 | 레이어 | `Text` (Stats/Attendee 내) | `Attendee Value` | List Card |
| 3 | 레이어 | `Text` (Stats/Rating 내) | `Rating Value` | List Card |
| 4 | 레이어 | `Text` (Participant 하단) | `Description Container` | Participant |
| 5 | 레이어 | `Text` (Mini Card 내) | 제거 또는 `Title Container` | Mini Card |
| 6 | 레이어 | `Blur:mask-group` | `Gradient Overlay` | List Card |
| 7 | 레이어 | `Sophie Tan` | `Name` | Participant |
| 8 | 텍스트 | `외` + `5명` 분리 | `Attendee Suffix` + `Attendee Count` | ChallengeCard |
| 9 | 프로퍼티 | `ID#6789:1` | `Host#6789:1` | ChallengeCard |
| 10 | 텍스트 | `ID` | `Host Name` | ChallengeCard |
| 11 | 프로퍼티 | `Title Section` | `Title` | List Card |
| 12 | 레이어 | `Title Section` | `Title Container` | List Card |
| 13 | 레이어 | `Button Play` | `Video Button` | List Card, ChallengeCard |

### Phase 1: Description 충돌 해소 (5건)

| # | 대상 | 현재 | 변경 | 카드 |
|---|------|------|------|------|
| 14 | Thumbnail Boolean | `Description#20192:30` | `Subtitle#20192:30` | ChallengeCard |
| 15 | Thumbnail Text | `↳ Description#20192:31` | `↳ Subtitle#20192:31` | ChallengeCard |
| 16 | Thumbnail Footer | `Description` | `Subtitle` | ChallengeCard |
| 17 | Header Boolean | `Description#20192:10` | `Timer Label#20192:10` | ChallengeCard |
| 18 | Header Text | `Description` | `Timer Label` | ChallengeCard |

### Phase 2: 프로퍼티 명확화 (7건)

| # | 대상 | 현재 | 변경 | 카드 |
|---|------|------|------|------|
| 19 | Boolean | `Determination` | `Show Determination` | Participant |
| 20 | Boolean | `Nudge` | `Show Nudge` | Participant |
| 21 | Boolean | `Video Button` | `Show Video Button` | List Card |
| 22 | Boolean | `Video Duration` | `Show Video Duration` | List Card |
| 23 | 프로퍼티 | `↳ Mission Title` | `↳ Title` | ChallengeCard |
| 24 | Boolean | `Mission Title` (Thumbnail) | `Show Title Badge` | ChallengeCard |
| 25 | Boolean | `Mission Title` (Header) | `Show Title` | ChallengeCard Header |

### Phase 3: 아이콘 통일 (8건, 마지막 일괄)

| # | 현재 | Lucide 대응 | 사용처 |
|---|------|------------|--------|
| 26 | Huge / clock-01 | `Clock` | ChallengeCard |
| 27 | Huge / cancel-01 | `X` | ChallengeCard |
| 28 | Huge / crown-03 | `Crown` | Participant |
| 29 | Huge / user-multiple | `Users` | List Card |
| 30 | Phosphor / speaker-simple-high | `Volume2` | ChallengeCard, List Card |
| 31 | Remix / play-fill | `Play` | ChallengeCard, List Card |
| 32 | Remix / vip-crown-2-fill | `Crown` | ChallengeCard |
| 33 | Tabler / pencil-plus | `PenLine` | Participant |

---

## Next Actions

1. Phase 0~2 Figma 수정 (25건) → `/director` 재QA
2. Phase 3 아이콘 통일 (8건) → 마지막 일괄 처리
3. Migrator + Variable 2개 생성 → 프로덕트 디자인 인스턴스 테스트

---
*Generated by Lenny's Product Team — Team Mode*
