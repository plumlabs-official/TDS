# Asset Section Cleanup — Wave 0~4

> 2026-04-28 | Plan: `~/.claude/plans/codex-plan-imperative-flame.md` v3 | Codex peer review: 2 rounds

## Wave 0 Canary 결과

| 항목 | 결과 |
|---|---|
| 0.1 swapComponent reactions 보존 | inst root + parent wrapper ✓, instance descendant는 자식 이름 변동 시 path 미스매치 |
| 0.2 variant value rename 자동 재매핑 | ✓ 인스턴스 mainComponent.id 동일, name + componentProperties.value 자동 갱신 |
| 결정 | Wave 3은 swap이 아닌 rename으로 처리 → reactions 위험 0, manualRestore=false |

## Wave 1 결과

| 작업 | 결과 |
|---|---|
| `Container Asset` (`20197:1531`) → `Asset Set` rename | ✓ |
| Creator Badge → `Container Badge` (`20144:1140`) 이동 | ✓ |
| Circle Progress → `Container Progress` (`20085:30053`) 이동 | ✓ |
| Gift Illust → Gift Illustration | ✓ |
| Ticket Item Illust → Ticket Item Illustration | ✓ |
| 11개 컴포넌트 publish key 보존 | ✓ keyDiffs 0건 |
| CDS 내부 nested 사용처 카운트 | 233 → 233 (delta 0) |

## Wave 2 결과

| 삭제 | 사용처 (재검증) | 결과 |
|---|---|---|
| Bell Image (`20324:2514`) | 0 | ✓ removed |
| Fire / Scale=16 (`20199:7033`) | 0 | ✓ removed |
| Contact Illustration / Type=Size220 (`20358:7657`) | 0 | ✓ removed |
| 사용처 카운트 | 233 → 233 (delta 0) | ✓ |

## Wave 3.1 결과 — Character Illustration

- Variant `Context=certifications` → `Context=Certifications` rename
- Component key 보존 (`2b0693fdf6efc24924a12cd5b42b8771ccc59fe4`)
- CDS 내부 사용 0건 (자동 재매핑 해당 X)
- 프로덕트 파일 사용 3건 — Wave 4 publish 후 자동 갱신 예정

## Wave 3.2 — Circle Progress (진행 중)

### Component Creation Decision Gate

| 항목 | 값 |
|---|---|
| sourceUnitNodeId | `20348:2520` (Percentage=35%), `20348:2522` (Percentage=100%) |
| candidateComponents | 동일 set `Circle Progress` (`20348:2521`) 내부 variant 확장 |
| decision | `extendExisting` |
| decisionReason | 기존 시각 패턴(stroke ring + gradient arc) 동일. 단일 axis(Percentage) 확장. variant explosion 위험 낮음 |
| rejectedOptions | `createNew`(별도 컴포넌트는 사용처 swap 부담), `reuseExisting`(0/25/50/75 step 부재) |
| variantExplosionRisk | 낮음 (단일 axis, 4 추가 → 2→6) |

### 변경 사항
- `Percentage=35%` → `Percentage=35` rename
- `Percentage=100%` → `Percentage=100` rename
- 신규 variant 4종: `Percentage=0`, `=25`, `=50`, `=75`
- 시각: 100% 패턴 base, `endingAngle = 0.697 + (percentage / 100) × 2π`

## Wave 3.3 — Ticket Item Illustration (대기)

### Component Creation Decision Gate

| 항목 | 값 |
|---|---|
| sourceUnitNodeId | `20383:5285`, `20383:5289`, `20383:5295` (1, 5 More, 10 More) |
| candidateComponents | 동일 set `Ticket Item Illustration` |
| decision | `extendExisting` |
| decisionReason | 기존 일러스트 보간 형태 추가. axis 변동 X |
| rejectedOptions | 없음 |
| variantExplosionRisk | 낮음 (3 → 4) |

### 변경 사항
- `Quantity=5 More` → `Quantity=5`
- `Quantity=10 More` → `Quantity=10`
- `Quantity=1` 보존
- 신규 `Quantity=3` (1↔5 보간 SVG)

## Wave 3.3 결과 — Ticket Item Illustration

| 작업 | 결과 |
|---|---|
| `Quantity=5 More` → `Quantity=5` rename | ✓ key 보존 |
| `Quantity=10 More` → `Quantity=10` rename | ✓ key 보존 |
| `Quantity=1` 보존 | ✓ |
| 신규 `Quantity=3` (1 clone) | ✓ key `552da52b...` |

시각: Quantity=3은 Quantity=1 그대로 (단일 ticket image). 디자이너 후속 보강 필요(1↔5 사이 보간 일러스트, image fill 교체).

## Wave 3.2 결과 — Circle Progress (변경 6 variants 일관 시계방향)

| Variant | sweep | endingAngle | key |
|---|---|---|---|
| Percentage=0 | Ellipse 10 hidden | 6.980 (n/a) | `11eb92b1...` (신규) |
| Percentage=25 | 90° | 2.268 | `8b098360...` (신규) |
| Percentage=35 | 126° | 2.896 (시계방향 정정) | `e17c973d...` (key 보존) |
| Percentage=50 | 180° | 3.839 | `1c615209...` (신규) |
| Percentage=75 | 270° | 5.410 | `9ca65a7f...` (신규) |
| Percentage=100 | 360° | 6.980 | `f30d603a...` (key 보존) |

**의도된 변경**: 35% sweep 방향이 원래 시계반대(좌상 그라디언트)였으나 100%와 일관성 위해 시계방향(우하단)으로 정정. 사용자 결정.

## Wave 4 결과 — Publish + Library Update + 검증

### 4.1 / 4.2 — 사용자 수동 publish 완료
- Plugin API에 `publishLibraryAsync` **부재 확정** (`figma.publishLibraryAsync: no such property` throw)
- 사용자가 Figma UI에서 CDS publish + Challify library update 수동 수행

### 4.3 — Post-update 검증

**프로덕트 파일 (`t0SK7XaNqw8qIY3PpZw4s7`)**:

| 컴포넌트 | 변경 후 카운트 | baseline | 자동 재매핑 |
|---|---|---|---|
| Creator Badge | 608 | 608 | (rename 없음) ✓ |
| Coin | 71 | 71 | (변경 없음) ✓ |
| Fire | 25 (Scale=24만) | 25 | (Scale=16 0건 영향 X) ✓ |
| Character Illustration | 3 (Certifications) | 3 | `certifications` → `Certifications` ✓ |
| Contact Illustration | 5 (Progress 3, Size50 2) | 5 | (Size220 0건 영향 X) ✓ |
| Circle Progress | 3 (35:2, 100:1) | 4 | `35%` → `35`, `100%` → `100` ✓ |
| Gift Illustration | 5 (Scale=400 4, =80 1) | 5 | (rename 자동) ✓ |
| Ticket Item Illustration | 2 (1:1, 5:1) | 2 | `5 More` → `5` ✓ |

**검증 통과**:
- detached-to-deleted: **0건**
- 페이지별 분포 무변동 (Link 98 / Invite 187 / Feed and Lounge 364 / Paywall 73)
- 신규 variant 사용 0 (정상 — 신규라 사용처 없음)
- 모든 자동 재매핑 ✓ (`mainComponent.id` 보존, value rename 자동 적용)

⚠️ Note: 이전 baseline 보고서 기재 Circle Progress 4건이지만 실측 3건 (35:2 + 100:1). baseline 카운트 정확값 = 3.

### 합계
- CDS 내부: 233 → 233 (delta 0)
- 프로덕트: 722 → 722 (delta 0)
- 전체: **955건 무변동**

## codex Peer Review 적용 결과

| Severity | 지적 | 실 적용 |
|---|---|---|
| Critical | swap 헬퍼 fail-open 위험 | Wave 0.2 결과로 swap 자체 미발생(rename 자동 재매핑) → 위험 자동 회피 |
| Critical | reactions canary 불충분 | Wave 0.1 실시. swap 미발생으로 manualRestore 불필요 |
| Major | publish gate 누락 | Wave 4 manual fallback 수행 |
| Major | qa-rubric 신규 항목 누락 | Decision Gate 산출물 작성 (Circle/Ticket) |
| Major | Reactions descendant matching | swap 미발생으로 적용 안 됨 |
| Major | 모든 prop 타입 preflight | swap 미발생 |
| Major | Decision Gate 누락 | Wave 3.2/3.3 산출물 명시 |
| Minor | Wave 1 레이블 | "0 detach / 0 visual impact" |
| Minor | cleanup 순서 | SET A/B 분리 + 0.3 cleanup |
| Minor | preflight/execution 분리 | swap 미발생으로 N/A |
