# Drift Monitor — CDS Figma ↔ Pencil 변경 감지 메커니즘

> Phase 5 산출물. CDS 원본이 업데이트되면 Pencil도 재검증해야 하는데, 수동 감지는 누락 위험. 자동 스냅샷 diff.

## 목표

CDS Figma 라이브러리(`H36eNEd6o7ZTv4R7VcyLf2`)가 업데이트될 때:
1. 새로 추가된 컴포넌트 detect → Pencil 매핑에 추가
2. 삭제된 컴포넌트 detect → Pencil reusable 정리
3. 기존 컴포넌트 variant 변경 detect → spec 재비교 필요 알림
4. 토큰 추가/변경 detect → Pencil variables 동기화 필요 알림

## 스냅샷 원본

- **`layer3/cds-components.json`** — 120 CDS core components (name/key/id/type/variantCount, 2026-04-21 기준)
- **`layer3/variants-index-batch1.json`** — 42 set variants (partial, Placeholder Logo까지)
- **`layer3/mapping.full.json`** — 155 Pencil ↔ CDS 매핑

## Check Cadence 권고

| 트리거 | 체크 빈도 |
|-------|---------|
| CDS 디자이너 변경 통지 받음 | 즉시 |
| 정기 주간 체크 | 매주 월요일 |
| 릴리스 전 gate | 필수 |

## 실행 절차 (manual orchestrator)

Claude Code 세션 내부 Agent 실행:

```
# 1. 새 discovery fetch
use_figma({
  fileKey: "H36eNEd6o7ZTv4R7VcyLf2",
  code: `
    const out = [];
    const ICON_PREFIXES = ["Remix Icons", "Tabler Icons", ...];
    for (const page of figma.root.children) {
      if (page.name !== "Components") continue;
      page.findAllWithCriteria({ types: ["COMPONENT_SET"] })
        .filter(n => !ICON_PREFIXES.some(p => n.name.startsWith(p)))
        .forEach(n => out.push({ id: n.id, key: n.key, name: n.name, type: "SET", variantCount: n.children.length }));
      page.findAllWithCriteria({ types: ["COMPONENT"] })
        .filter(c => !(c.parent && c.parent.type === "COMPONENT_SET"))
        .filter(c => !ICON_PREFIXES.some(p => c.name.startsWith(p)))
        .forEach(c => out.push({ id: c.id, key: c.key, name: c.name, type: "COMP" }));
    }
    return { totalComponents: out.length, components: out.sort((a,b) => a.name.localeCompare(b.name)) };
  `
})
```

## Diff 비교 규칙

### 추가 감지 (새 컴포넌트)

- New component `key` not in old snapshot → **ALERT**: Pencil 매핑 추가 필요
- 예: 새 CDS "Slider" 추가 → mapping.full.json에 `pencilId: null, cdsKey: <new>, status: "pending"` 엔트리 추가

### 삭제 감지

- Old component `key` not in new snapshot → **ALERT**: Pencil reusable 제거 검토
- Pencil 사용처 grep → 영향 화면 보고

### 변경 감지

- Same key, different `variantCount` → **ALERT**: variant 구성 변경. Phase 2 L1+L2 재실행 권고
- Same key, different `name` → **ALERT**: 라벨 변경. mapping.full.json 업데이트

## Gate 기준 (drift check PASS)

- **추가 0 or 매핑 완료**
- **삭제 0 or 사용처 정리 완료**
- **variantCount 변경 0 or 재검증 완료**

drift 감지 시 **Phase 2 재실행** 또는 **incremental spec fix** — 상황에 따라 결정.

## 자동화 확장 (미래 작업)

### Option A: Claude Code scheduled task

```
# /loop 5d "drift check CDS Figma"
# → 주 1회 자동 실행
```

### Option B: CI 연동

- GitHub Actions에 Figma REST API check
- 변경 시 Slack/Email 알림
- Pencil .pen 변경 PR에 자동 trigger

### Option C: Figma Webhook (유료 enterprise)

- Figma 라이브러리 업데이트 시 webhook → 자동 re-inspect

## 현재 스냅샷 상태

- **Generated at**: 2026-04-21
- **CDS components**: 120 (`.` private 18 + public 102)
- **Pencil reusables**: 158 (Rev.19)
- **Last diff baseline**: batch{1..11} inspection

## 다음 체크 예정

- 2026-04-28 (주간) — CDS 업데이트 없으면 skip
- **우선 alert 조건**: 새 컴포넌트 추가, variant 구성 변경 (기존 fix된 uhRL3/qPbQZ/등 재검증 필요)

## 후속 TODO

- [ ] Figma REST API `/v1/files/:key/components` endpoint 조사 (out-of-session CI 용)
- [ ] variants-index-batch1/2 complete (현재 partial) — 120 전체 variants 스냅샷
- [ ] Pencil 측 drift: `batch_get` patterns로 reusable name/id 리스트 스냅샷
