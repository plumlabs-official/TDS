---
name: cds-property-optimizer
description: "Checks and fixes CDS component properties — Boolean prefixes, camelCase, variant lowercase, special chars. Use when user says '프로퍼티 점검', 'property check', 'Boolean 접두어', 'variant 소문자'. For naming issues use cds-naming-enforcer, for full QA use cds-qa-auditor."
---

# CDS Property Optimizer

CDS 라이브러리 컴포넌트의 프로퍼티를 점검하고 최적화합니다.

**MANDATORY**: load `figma-use` before every `use_figma` call.
**Always pass `skillNames: "cds-property-optimizer"` when calling `use_figma`.**

## SSOT

- 규칙 원본: `.claude/rules/naming-policy.md` v2.0 (Section 2: 케이싱)
- 컴포넌트 property 실행 계약: `.claude/rules/component-contract.md#property-reference-matrix`
- 로직 원본: `figma-plugins/cds/src/modules/renamer/property-checker.ts`

## 오탐 방지 원칙

| 규칙 | 이유 |
|------|------|
| `mainComponent.remote === true` → CDS 소속 | 프로덕트 파일에서 검사 시 라이브러리 원본과 혼동 방지 |
| `figma.root.findAll` 전체 트리 검색 | 중첩 프레임 안 컴포넌트 누락 방지 |
| `componentKey` 기반 CDS 소속 판별 | 이름 기반 매칭 금지 |
| Property 검사는 반드시 CDS 원본(COMPONENT_SET)에서 | 인스턴스 오버라이드 값이 아닌 원본 정의 기준 |
| Property 정의와 reference를 함께 검사 | 정의만 있고 연결되지 않은 property는 사용자에게 작동하지 않음 |
| 일관성 검사: 동일 의미 property를 전체 라이브러리에서 비교 | 예: `Show Reddot` vs `Show Red Dot` 혼재 탐지 |

## Workflow

### Step 1: 컴포넌트 프로퍼티 읽기

`get_design_context` 또는 `use_figma`로 대상 컴포넌트의 `componentPropertyDefinitions` 조회:

```js
const node = await figma.getNodeByIdAsync("NODE_ID");
if (node.type === "COMPONENT_SET" || node.type === "COMPONENT") {
  const props = node.componentPropertyDefinitions;
  return { name: node.name, properties: props };
}
```

### Step 2: 위반 감지

| 검사 항목 | 대상 | 감점 |
|----------|------|------|
| stale property (definition은 있으나 reference 없음) | VARIANT 예외 외 전체 | Critical -20 |
| dangling reference (존재하지 않는 definition key 참조) | 전체 `componentPropertyReferences` | Critical -20 |
| field mismatch (TEXT→characters 등 타입/field 불일치) | 전체 reference | Major -10 |
| instance override probe 실패 | 주요 content property | Critical -20 |
| Boolean 접두어 없음 (`show`/`is`/`has`) | BOOLEAN 프로퍼티 | Minor -5 |
| camelCase 아님 (공백 포함) | BOOLEAN, VARIANT key | Minor -5 |
| Variant value lowercase 아님 | VARIANT 값 | Warning -2 |
| 특수문자 (`:`, `↳`) | 모든 프로퍼티 key | Minor -5 |
| prop 이름 충돌 (같은 이름 2개+) | 전체 | Major -10 |
| prop 20개 초과 | 전체 | Major -10 |
| prop 16~20개 | 전체 | Minor -5 |

Reference matrix 산출물은 `.claude/rules/component-contract.md#property-reference-matrix`를 따른다.

### Step 3: 이슈 리포트

```
## Property Optimizer Report: [컴포넌트명]

| # | Property | Issue | Current | Suggested | Severity |
|---|----------|-------|---------|-----------|----------|
| 1 | Show Icon | missing-prefix → not-camelCase | Show Icon | showIcon | Minor |
| 2 | Size=Medium | value-not-lowercase | Medium | medium | Warning |
| 3 | Title | stale-property | no target reference | connect to Title.characters | Critical |
```

### Step 4: 사용자 승인

**MUST STOP** — 리포트 출력 후 사용자 승인 대기.

### Step 5: 적용

승인 후 `use_figma`로 프로퍼티 수정.

**주의**: Figma Plugin API에서 프로퍼티 이름 변경은 제한적. 일부는 수동 수정이 필요할 수 있음.
그 경우 수동 수정 가이드를 제공.

### Step 6: 파트명 순서 점검 (추가)

컴포넌트 내부 파트명이 `[컴포넌트] [파트]` 순서인지 확인:
- `Content Sheet` → `Sheet Content` (역할이 먼저 오면 역전)

## 케이싱 규칙 요약

| 대상 | 케이싱 | 예시 |
|------|--------|------|
| Variant Property Key | camelCase | `size`, `variant`, `showIcon` |
| Variant Property Value | lowercase | `default`, `destructive`, `sm` |
| Boolean Property | camelCase + show/is/has | `showIcon`, `isActive` |
