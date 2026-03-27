---
name: tds-property-optimizer
description: "Checks and fixes TDS component properties — Boolean prefixes, camelCase, variant lowercase, special chars. Use when user says '프로퍼티 점검', 'property check', 'Boolean 접두어', 'variant 소문자'. For naming issues use tds-naming-enforcer, for full QA use tds-qa-auditor."
---

# TDS Property Optimizer

TDS 라이브러리 컴포넌트의 프로퍼티를 점검하고 최적화합니다.

**MANDATORY**: load `figma-use` before every `use_figma` call.
**Always pass `skillNames: "tds-property-optimizer"` when calling `use_figma`.**

## SSOT

- 규칙 원본: `.claude/rules/naming-policy.md` v2.0 (Section 2: 케이싱)
- 로직 원본: `figma-plugins/tds/src/modules/renamer/property-checker.ts`

## 오탐 방지 원칙

| 규칙 | 이유 |
|------|------|
| `mainComponent.remote === true` → TDS 소속 | 프로덕트 파일에서 검사 시 라이브러리 원본과 혼동 방지 |
| `figma.root.findAll` 전체 트리 검색 | 중첩 프레임 안 컴포넌트 누락 방지 |
| `componentKey` 기반 TDS 소속 판별 | 이름 기반 매칭 금지 |
| Property 검사는 반드시 TDS 원본(COMPONENT_SET)에서 | 인스턴스 오버라이드 값이 아닌 원본 정의 기준 |
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
| Boolean 접두어 없음 (`show`/`is`/`has`) | BOOLEAN 프로퍼티 | Minor -5 |
| camelCase 아님 (공백 포함) | BOOLEAN, VARIANT key | Minor -5 |
| Variant value lowercase 아님 | VARIANT 값 | Warning -2 |
| 특수문자 (`:`, `↳`) | 모든 프로퍼티 key | Minor -5 |
| prop 이름 충돌 (같은 이름 2개+) | 전체 | Major -10 |
| prop 20개 초과 | 전체 | Major -10 |
| prop 16~20개 | 전체 | Minor -5 |

### Step 3: 이슈 리포트

```
## Property Optimizer Report: [컴포넌트명]

| # | Property | Issue | Current | Suggested | Severity |
|---|----------|-------|---------|-----------|----------|
| 1 | Show Icon | missing-prefix → not-camelCase | Show Icon | showIcon | Minor |
| 2 | Size=Medium | value-not-lowercase | Medium | medium | Warning |
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
