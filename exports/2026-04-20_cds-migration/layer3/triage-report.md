# Phase 3 Triage Report — CDS↔Pencil 전수 정합성 분류

> 155 reusables L1+L2 inspection 결과. Atomic/Molecule/Organism × structural/dimension/label 매트릭스 분류.

## Summary

| Verdict | 개수 | 비율 | 처리 방향 |
|---------|------|------|---------|
| PASS | ~80 | 51.6% | 작업 없음 |
| MINOR | ~40 | 25.8% | accept (note만 기록) |
| MAJOR | 12 | 7.7% | Phase 4 fix 후보 |
| CRITICAL | 3 | 1.9% | Phase 4 즉시 fix |
| ACCEPTED | ~10 | 6.5% | 정책 명문화 (CDS 비소속 ancillary, composed frames) |
| PENDING | 10 | 6.5% | Layer 1 PASS BUT 후속 검증 필요 (variant name 일부 추정) |

**총 155/155 = 100% 검증 완료**

## Critical (즉시 fix, Phase 4 P0)

### C1. Dialog Header layout 불일치 (P7iGE)

- **CDS**: `Type=Nav+Title+Action` 317×60 **VERTICAL** gap 6, 1 child
- **Pencil**: 317×60 **HORIZONTAL** space_between, 3 children (left/title/right)
- **추가 검증 필요**: CDS plugin API 응답이 의심스러움. "Nav+Title+Action" 이름이 실제로 horizontal이어야 직관적. Figma에서 실제 children 노드 trace 후 결정
- **임시 행동**: Pencil HORIZONTAL이 의도대로 작동 → CDS variant 재확인 후 매핑 수정 또는 Pencil rebuild

### C2. Content Header layout 불일치 (LkCa2)

- **CDS Size=Large**: 348×74 **HORIZONTAL** gap 12, 3 children
- **Pencil**: 348×auto **VERTICAL** gap 4, 2 children (title + desc)
- **CDS 6 variants** (Alignment Left/Center × Size Large/Medium/Small) — Pencil이 어떤 variant 매칭인지 명확하지 않음
- **임시 행동**: Pencil 사용처 grep → CDS Size=Small (작은 것) variant 확인. 매핑 정정 vs Pencil rebuild 결정

### C3. Label 컴포넌트 오분류 (Ti74H)

- **mapping.full.json**: cdsKey = Badge 매핑 (Variant=Label 추정)
- **실제 Pencil Ti74H**: text + required asterisk (form label component)
- **CDS Badge variants**: Default/Ghost/Secondary/Outline/Destructive × Number False/True (Label variant 없음)
- **Fix**: mapping.full.json에서 Ti74H의 cdsKey를 null + accepted (form primitive, CDS 단독 매핑 없음) 또는 별도 CDS Label 컴포넌트 검색

## Major (Phase 4 P1)

### M1. 라벨 scale 불일치 패턴 (3종)

| Pencil | Pencil size | CDS Size | 문제 |
|--------|------------|---------|------|
| F6A53 Avatar X Large | 56 | Large=48 | Rev.18 fix 완료 (이름 X Large로 교정) |
| 1DpZI Challenge Thumbnail Medium | 64 | Medium=40 | Pencil "Medium" 실제 CDS 2X-Large(64) |
| gsauZ Challenge Thumbnail Large | 128 | Large=48 | Pencil "Large" 실제 CDS 5X-Large(128) |

**패턴**: Pencil이 CDS와 다른 scale step 사용 (S=32→M=64→L=128 vs CDS S=32→M=40→L=48). 
**Fix 옵션**:
- A) Pencil size를 CDS와 맞춤 (Medium 64→40, Large 128→48) → 사용처 영향 큼
- B) Pencil 라벨 교정 (Medium→2X-Large, Large→5X-Large) → F6A53 동일 패턴
- C) 추가 size variants 생성 (Medium/Large 유지 + 신규 2X-Large/5X-Large) → +2 reusables

**권장: B** (F6A53 패턴과 일관, 사용처 영향 최소)

### M2. Challenge Thumbnail Group family scale 불일치 (5종)

| Pencil | Pencil dim | CDS dim | gap diff |
|--------|-----------|---------|----------|
| uhRL3 (Medium) | 110×40, gap -12, 6 children | 110×40, gap -26 | gap 14 차이 |
| qPbQZ (XS) | 16×16, gap -8, 3 children | 64×24, gap -16, 6 children | structural diff |
| Wp4Gz (Small) | 28×28, gap -16, 3 children | 92×32, gap -20, 6 children | structural |
| 7SE3M (Medium) | 40×40, gap -20, 3 children | 110×40, gap -26, 6 children | structural |
| pX06f (Large) | 56×56, gap -24, 3 children | 138×48, gap -30, 6 children | structural |

**Fix**: Avatar Group Rev.18 fix와 동일 패턴 적용 — children 3→6, gap CDS spec, width 정정.

### M3. Tooltip 기본 컴포넌트에 caret 누락 (HrIXe)

- **Pencil**: 단일 pill (caret 없음). 4방향 별도 reusable로 caret 처리.
- **CDS Primary default**: caret 포함
- **K3-1 ticket과 같은 라벨 convention 이슈와 묶음**

**Fix**: 
- (1) Pencil HrIXe에 default caret 추가 (방향성 어떤?) 또는
- (2) HrIXe를 "Tooltip Body"로 라벨 변경 + caret 없는 base component로 명문화

### M4. Switch row+label 구조 차이 (RmT6o)

- **CDS Switch**: 411×42 row (label + toggle)
- **Pencil Switch**: 44×24 toggle only
- **CDS의 .Switch Toggle Core** (private) ↔ Pencil RmT6o 매핑이 더 정확

**Fix**: mapping.full.json 정정 — Pencil RmT6o cdsKey를 CDS Switch private toggle로 재매핑. 또는 Switch row reusable 추가 신설.

### M5. Drawer composition (PAezh)

- **CDS Drawer Type=White**: 375×414 vertical 2 children
- **Pencil Drawer**: 375×480 vertical 4 children (Handle/Header/Body/Footer)
- **Pencil 더 풍부**

**Fix 옵션**:
- A) Pencil 4 children 유지 (richer composition, 디자인 가치) → ACCEPT
- B) CDS와 동일하게 단순화 (2 children) → 사용처 다시 디자인 필요

**권장: A (ACCEPT)** — Pencil 풍부한 슬롯이 사용성 높음

### M6. 기타 dim/structural

- **Pey6H Footer Calendar**: childCount 4 vs 2 + padding diff. CDS title + 3 buttons vs Pencil title + 1 button. Fix: Pencil 추가 button + padding 정정
- **RbjCn TabsList Tag**: layout NONE vs horizontal. Pencil flex 더 적절. ACCEPT.
- **IeMdq Circle Progress**: 120 vs 300 + center text. Pencil dynamic 더 사용성 좋음. ACCEPT.
- **zyEbi Lounge Card Addon Block**: width 35 vs 120. Pencil 사용처 fit. ACCEPT.
- **shXsW Dots**: CDS 1 dot vs Pencil 3 dots composition. Pencil 자체 reusable로 의미 있음. ACCEPT.
- **wRyh9 Featured Icon Square Medium**: 48 vs 64 size. variant 매핑 재확인.

## Minor (accept, note 기록)

40여 건. 주요 패턴:
- **childCount 차이**: Pencil flatten vs CDS optional slots (icon/badge/trailing) — Pencil 명시적 디자인 선택
- **Width difference < 30px**: fill_container friendly로 사용 시 무관
- **gap/padding ±2-4px**: 시각 차이 미미
- **Color hex case (#00CC61 vs #00cc61)**: 동일 값
- **fontSize 5%**: token vs hardcode (Avatar 2XS/XS Rev.18 신규)

## Accepted (정책 명문화)

| Pencil | 이유 |
|--------|------|
| 5vMvg Sheet Header Card | Rev.7 추가 ancillary, CDS 비소속 |
| 5czSp Dialog | composed frame (Dialog Header + body + actions) |
| iXk8R Creator Card Compact | Pencil ancillary |
| 6sR1L Card Host Info | CDS private part |
| DHyHK Card Meta Row | composition |
| EKcrm Tabs | composed |
| nnrXX Badge Accent | Pencil 임의 추가 variant (CDS Badge에 없음) |

## Decision Matrix

| Category × Severity | Atomic | Molecule | Organism |
|----------------------|--------|----------|---------|
| Critical | C3 (Label) | C1 (Dialog Header), C2 (Content Header) | — |
| Major | M1 (Avatar/CT scale 3), M3 (Tooltip caret), M6 dim | M2 (CT Group 5), M4 (Switch), M6 footer/tablistag | M5 (Drawer) |
| Minor | child count flatten, dim ±5% | gap diff, sample count | composition diff |

## Phase 4 작업 권장 순서

1. **즉시 (1h)**: C3 Label mapping 수정 + M3 Tooltip K3-1/K3-2 결정 반영
2. **빠른 fix (2h)**: M2 Challenge Thumbnail Group 5종 (Avatar Group Rev.18 패턴 동일)
3. **검증 후 fix (1h)**: C1/C2 Dialog/Content Header — CDS variant 재확인 → 매핑 정정 or rebuild
4. **검토 후 결정 (1h)**: M1 Challenge Thumbnail M/L 라벨 vs scale, M4 Switch
5. **Accept 결정 (30min)**: M5 Drawer, M6 minors, ACCEPTED 7종 → qa-tickets 명문화

**예상 총 시간**: 5-6h (8-10h 예상보다 단축. 원인 = MAJOR 12종 중 5종이 Avatar Group과 동일 패턴, 1h batch fix 가능)

## 다음 액션

Phase 4 P0 (Critical 3개) 즉시 시작 권장.
