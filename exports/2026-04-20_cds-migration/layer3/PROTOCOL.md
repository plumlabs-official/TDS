# Layer 3 Visual Diff Agent Protocol

> `diff-protocol.md` Layer 3 (Rendered PNG) 자동화 프로토콜.
> Rev.18 PoC 설계.

## 목적

Figma 원본과 Pencil reusable의 **렌더 결과 시각 일치** 여부를 사람의 눈 없이 agent로 판정한다. Rev.14에서 수동 사용자 루프로 돌던 "피그마와 달라" 감지를 자동 catch한다.

## 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│  Orchestrator (Claude Code 세션)                        │
│                                                          │
│  1. mapping.json 로드                                    │
│  2. for each { figma_node, pencil_node } pair:          │
│       ├─ parallel:                                      │
│       │    figma.get_screenshot(fileKey, nodeId)        │
│       │    pencil.export_nodes(filePath, nodeId)        │
│       ├─ save → samples/{comp}-figma.png                │
│       │           samples/{comp}-pencil.png             │
│       ├─ Agent subagent("visual-diff"):                 │
│       │    input: 두 PNG path + component 설명           │
│       │    output: diff JSON                            │
│       └─ accumulate ticket (or mark PASS)               │
│  3. 종합 리포트 qa-tickets.md 에 append                  │
└─────────────────────────────────────────────────────────┘
```

## 입력 스키마

`mapping.json`:

```json
{
  "components": [
    {
      "id": "tooltip-top",
      "figmaFileKey": "H36eNEd6o7ZTv4R7VcyLf2",
      "figmaNodeId": "17896:74532",
      "pencilFilePath": "exports/2026-04-20_cds-migration/pen/cds.pen",
      "pencilNodeId": "DSVOy",
      "name": "Tooltip Top",
      "expectedDim": { "width": 78, "height": 34 },
      "tolerance": { "size": 2, "padding": 2 }
    }
  ]
}
```

## 에이전트 반환 스키마

`layer3-result.json`:

```json
{
  "id": "tooltip-top",
  "verdict": "PASS | FAIL | ACCEPTED",
  "diffs": [
    {
      "dimension": "padding",
      "figma": { "top": 6, "bottom": 6 },
      "pencil": { "top": 4, "bottom": 4 },
      "severity": "minor"
    }
  ],
  "screenshots": {
    "figma": "samples/tooltip-top-figma.png",
    "pencil": "samples/tooltip-top-pencil.png"
  },
  "notes": "caret 방향 일치. padding 2px 얇음."
}
```

## Agent 프롬프트 템플릿

```
You are a visual-diff agent. Compare two PNG renders of the same UI component.

Input:
- Figma render: {figma_png_path}
- Pencil render: {pencil_png_path}
- Component name: {name}
- Expected dimensions: {expectedDim}
- Tolerance: {tolerance}

Check:
1. Overall shape/layout match
2. Color fidelity (fill, stroke)
3. Text content + typography
4. Spacing (padding/gap) proportion
5. Icons/images position + size

Output JSON:
- verdict: PASS (no diffs) | FAIL (material diffs) | ACCEPTED (known architectural divergence, e.g., flatten variants)
- diffs: array of { dimension, figma, pencil, severity: critical|major|minor }
- notes: 2-sentence summary

Do NOT suggest fixes — only report observed differences.
```

## 실행 기준

### Verdict 정의

| Verdict | 조건 | 후속 |
|---------|------|------|
| **PASS** | diffs 비어있거나 모두 minor + tolerance 이내 | mark resolved |
| **FAIL** | critical/major 1건 이상 | qa-tickets.md ticket 생성 |
| **ACCEPTED** | 알려진 architectural 제약 (variant flatten 등) | note만 기록, pass로 간주 |

### 심각도 기준

- **Critical**: 컴포넌트 기능/의미 변경 (색상 역전, 아이콘 누락, 텍스트 의미 차이)
- **Major**: 시각 정렬/크기 차이 10% 초과 (padding, gap, dimension)
- **Minor**: 시각 차이 < 10% + 사용자 인지 낮은 영역

## PoC 스코프 (Rev.18)

- 샘플 10종 (Rev.17/Rev.18 신규 중심)
- 수동 orchestrator (Claude Code 세션 내부 agent 루프)
- 자동 export + subagent 판정 검증
- 결과 `samples/` 폴더에 PNG + result JSON

## 후속 확장 (다음 세션)

- 155 reusables 전수 매핑 (`mapping.full.json`)
- Drift monitor: discovery.json snapshot diff 시 자동 재실행
- CI 연동: pre-publish gate로 Layer 3 PASS 강제
- Ralph subprocess MCP 호환 (Claude Code 외부에서도 루프 구동)
