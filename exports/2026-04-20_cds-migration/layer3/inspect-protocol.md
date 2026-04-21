# Inspect Protocol — Layer 1+2 Spec Diff

> Phase 1 산출물. 155 Pencil reusables × CDS 120 components 정합성 검증 절차.

## 실행 환경

**Claude Code session 내부 orchestrator** — Pencil `.pen` 파일은 MCP 외부 접근 불가. 스크립트(Node/Python) 대신 세션에서 직접 `use_figma` + `pencil.batch_get` 호출.

## 입력

- `layer3/mapping.full.json` — Pencil ID ↔ CDS componentKey/variant 매핑 (155 rows)
- `layer3/cds-components.json` — CDS 120 core components 인덱스
- `exports/2026-04-20_cds-migration/pen/cds.pen` — Pencil 편집본 (155 reusables)

## 출력

- `layer3/diffs/<pencil-id>.json` — 컴포넌트별 spec diff JSON
- `layer3/triage-report.md` — Phase 3 산출물 (Critical/Major/Minor)
- `qa-tickets.md` Step L/M/N — Phase별 티켓

## Layer 1 — Spec Diff (자동 가능)

### 수집할 property

| 속성 | Figma Plugin API | Pencil Schema |
|------|-----------------|---------------|
| width, height | `node.width`, `node.height` | `.width`, `.height` |
| layout | `node.layoutMode` ("HORIZONTAL"/"VERTICAL"/"NONE") | `.layout` ("horizontal"/"vertical"/"none") |
| gap | `node.itemSpacing` | `.gap` |
| padding | `node.paddingTop/Right/Bottom/Left` | `.padding` ([top,right,bottom,left] or [v,h] or n) |
| cornerRadius | `node.cornerRadius` | `.cornerRadius` |
| fills | `node.fills[0]` (solid only) | `.fill` |
| strokes | `node.strokes[0]` | `.stroke` |
| child count | `node.children.length` | `.children.length` |

### 비교 규칙

- **정확 매칭**: layout, child count
- **Tolerance ±2px**: width, height, padding, gap
- **토큰 매칭**: fills/strokes — hex 일치 또는 변수명 일치 (e.g., `$--primary` ↔ `{r:0, g:0.80, b:0.38}`)
- **cornerRadius**: array/number 정규화 후 요소별 매칭

### Verdict

- **Critical**: 
  - layout mode 다름 (HORIZONTAL vs VERTICAL vs NONE)
  - **render-visible** child count 다름 (slot flatten 제외)
  - fill 색상 근본 다름 (초록 vs 검정 등)
- **Major**: 
  - dimension 차이 > 10%
  - corner style 다름 (pill 9999 vs rounded 8 vs square 0)
  - gap 차이 > 4px
- **Minor**: 
  - dimension 차이 ≤ 10% 또는 tolerance 이내 초과 2-5px
  - label/name only
  - child count 차이가 **optional slot flatten** 때문 (Figma의 숨김 icon/badge slot vs Pencil flatten)
- **ACCEPTED**: 
  - Figma variant flatten 불가로 인한 Pencil 구조 차이 (Pencil은 instance override로 대체)
  - CDS 비소속 ancillary (`cdsKey: null`)
- **PASS**: 위 항목 모두 tolerance 이내

### Child count 특례

Figma CDS 컴포넌트는 다양한 slot(icon/badge/trailing 등)을 **hidden** 상태로 포함. Pencil은 flatten하여 단일 children만 가짐. 판정:
- Figma children 중 `visible === false` 또는 `opacity === 0` 필터링 → "render-visible count" 비교
- render-visible 동일 → PASS / MINOR
- render-visible 다름 → Critical 후보

## Layer 2 — Anatomy Diff (80% 자동)

### 수집할 property

- 자식 노드 트리 (재귀 depth 3)
- 각 자식의 type/name
- 텍스트 자식의 fontSize/fontWeight/fontFamily
- 프레임 자식의 layout/gap/padding

### 비교 규칙

- **자식 type 매칭**: figma.ELLIPSE ↔ pencil.ellipse, figma.INSTANCE ↔ pencil.ref
- **자식 name 매칭**: 정규화 후 (CDS의 `.` 접두어 무시, Title Case 통일)
- **텍스트 스타일**: fontSize tolerance 0, fontWeight exact

## Layer 3 — Visual Diff (50%, optional)

Phase 4 critical fix 중 의심 컴포넌트에만 실행. `layer3/PROTOCOL.md` 참조.

## Orchestration Loop

```
for each row in mapping.full.json:
  if row.cdsKey == null: skip (unmapped)
  if row.status == "accepted": skip (known divergence)
  
  # Fetch Figma spec
  figma = use_figma(fileKey, code: "const n = await figma.getNodeByIdAsync(nodeId); ... return dumpSpec(n);")
  
  # Fetch Pencil spec
  pencil = batch_get(filePath, nodeIds: [pencilId], readDepth: 3)
  
  # Compare
  diffs = compare(figma, pencil, tolerance: 2)
  
  # Write ticket
  if diffs.has_diffs:
    write diffs/{pencilId}.json with { verdict, diffs, figmaSnap, pencilSnap }
  else:
    mark PASS in mapping.full.json
```

## Batch 전략

Figma rate limit (200/day) 고려:
- 1 batch = 10 컴포넌트 (20 use_figma 호출 + 10 batch_get)
- 총 16 batches × 10 = 160 이내
- 1회 실행 ~30min

## 비교 예시

### Input
```jsonc
// figma (dumpSpec 반환)
{ "width": 180, "height": 40, "layoutMode": "HORIZONTAL", "itemSpacing": -12, "childCount": 6 }

// pencil (batch_get)
{ "width": 180, "height": 40, "layout": "horizontal", "gap": -12, "children": [6 items] }
```

### Output
```json
{
  "pencilId": "KwYkH",
  "cdsKey": "2e51c2f65048f8ed5cfb7f6a7c4519f2b7896109",
  "cdsVariant": "Size=Medium",
  "verdict": "PASS",
  "diffs": [],
  "checkedAt": "2026-04-21"
}
```

### Diff 발견
```json
{
  "pencilId": "I7c2F",
  "cdsKey": "85a68b5f73df1ffd56009c1325862c2c452f8294",
  "cdsVariant": "Progress=35%",
  "verdict": "MINOR",
  "diffs": [
    {"dimension": "child.height", "figma": 6, "pencil": 8, "delta": 2, "severity": "minor"}
  ]
}
```

## 매핑 정책

### 이름 매칭 규칙

1. Pencil `Avatar` (기본) ↔ CDS `Avatar / Type=Image, Size=Medium` (default variant)
2. Pencil `Avatar Small` ↔ CDS `Avatar / Size=Small`
3. Pencil `Avatar Group Medium` ↔ CDS `Avatar Group / Size=Medium`
4. Pencil family members (`Tooltip Top/Bottom/Left/Right`) → 각각 CDS variant로 매핑

### 매핑 불가 케이스

- Pencil의 CDS 비소속 reusable (예: `Creator Card Compact` ancillary) → `cdsKey: null, accepted: true, reason: "CDS 비소속"`
- CDS의 `.private` internal parts → Pencil 매핑 없으면 skip

### 커버리지 목표

- **Public components**: 120 (CDS `.` 접두어 제외 약 102)
- **Pencil reusables**: 155
- **매핑 예상**: 최소 140+ (variant 분할 포함)
- **unmapped 허용**: ancillary 1-2개만

## Gate

- **G1 Coverage**: 매핑 가능 147/155 (ancillary 제외) diff JSON 생성 = 100%
- **G2 Triage**: Critical + Major 100% classified
- **G3 Minor accept**: Minor는 note 처리
- **G4 Figma rate**: 200/day 이내
