# 3-Layer Diff Protocol

> CDS Figma ↔ Pencil `.pen` 시각/구조 정합성 자동 검증 프로토콜.
> Rev.10 NEW PLAN v2 Phase 2 착수.

## 목적

사용자가 "padding 얇아", "아바타 색 다름" 같은 gap을 발견하기 전에 루프 내부에서 자동 catch.

## 3-Layer 정의

### Layer 1: Top-Level Spec (기존 방식)
- 속성: width, height, padding, gap, cornerRadius, fills, strokes
- 도구: Figma Plugin API `node.paddingTop` 등 + Pencil `batch_get`
- 판정: 수치 == 허용 tolerance 이내

### Layer 2: Inner Anatomy (신규)
- 속성: 자식 노드 트리 전체
  - 자식 수, 각 자식의 type/name
  - 텍스트 자식의 fontSize/fontWeight/fontFamily
  - 아이콘 자식의 iconFontName/size/color
  - 프레임 자식의 layout/gap/padding (재귀적)
- 도구: Figma Plugin API로 재귀 탐색 + Pencil `batch_get(readDepth:3)`
- 판정: 구조 동일 + 각 자식 속성 매칭

### Layer 3: Rendered PNG (신규)
- 속성: 실제 시각 출력
- 도구: `figma get_screenshot` + `pencil export_nodes`
- 판정: 시각적 일치 (에이전트 기반 평가 또는 픽셀 diff)

## 실행 플로우

```
for each component in [P0 first, then P1, then P2]:
  L1 = layer1_diff(figma_spec, pencil_spec)
  if L1.has_diffs:
    fix(L1.diffs)
    continue
  L2 = layer2_diff(figma_tree, pencil_tree)
  if L2.has_diffs:
    fix(L2.diffs)
    continue
  L3 = layer3_diff(figma_png, pencil_png)
  if L3.has_diffs:
    fix(L3.diffs)
    continue
  mark_pass(component)
```

## QA Ticket Schema

각 diff는 `qa-tickets.md`에 기록:

```markdown
### TICKET-{N} | {component} | Layer {1|2|3}

**Status**: open | in_progress | resolved | accepted

**Diff**:
- Figma: {value}
- Pencil: {value}

**Resolution**:
- {적용한 수정 or 수용 이유}
```

## Gate 기준

- P0 18종 전부 3-Layer PASS → Step A 완료
- 예외: architectural divergence (문서화된 경우)는 "accepted"
