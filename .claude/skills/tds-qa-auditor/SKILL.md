---
name: tds-qa-auditor
description: "Runs TDS vibe-coding QA audit with 8-axis rubric (R1-R8). Returns PASS/CONDITIONAL/FAIL with scores and fix guide. Use when user says 'QA', '점검', 'audit', '품질 검사', '/qa'. For naming-only checks use tds-naming-enforcer, for property-only checks use tds-property-optimizer."
---

# TDS QA Auditor

TDS 바이브코딩 적합성을 qa-rubric v1.1 기준 8축으로 평가합니다.

**MANDATORY**: load `figma-use` before every `use_figma` call.

## SSOT

- 루브릭 원본: `.claude/rules/qa-rubric.md` v1.1
- TDS fileKey: `H36eNEd6o7ZTv4R7VcyLf2`

## 점수 체계

- **축 점수** = max(0, 100 - Σ감점)
- **총점** = Σ(축 점수 × 가중치)

| 판정 | 조건 | 다음 액션 |
|------|------|----------|
| **PASS** | 총점 ≥85 + 모든 축 ≥60 | 완료 |
| **CONDITIONAL** | 총점 ≥75 + 축 <60 1개 이하 | 해당 축 수정 후 재실행 |
| **FAIL** | 총점 <75 또는 축 <60 2개+ | 에스컬레이션 |

## 오탐 방지 원칙

| 규칙 | 이유 |
|------|------|
| `mainComponent.remote === true` → TDS 소속 | R1 TDS 커버리지 판정 시 정확한 소속 확인 |
| `figma.root.findAll` 전체 트리 검색 | R7 shadcn 매핑 시 중첩 컴포넌트 누락 방지 |
| `componentKey` 기반 TDS 소속 판별 | R1 인스턴스 카운트 정확도 보장 |
| Property 검사는 TDS 원본 기준 | R4 프로퍼티 설계 점수 산정 시 오버라이드 제외 |

## Workflow

### Step 1: 대상 노드 읽기

`get_design_context`로 대상 노드의 전체 트리 + 스크린샷 확보.

### Step 2: 8축 평가

#### R1. TDS 인스턴스 커버리지 (20%)

`node.type === "INSTANCE"` 카운트 → `componentId`가 TDS fileKey 소속인지 확인.
- detached instance = 비-TDS
- 비-TDS 노드 1건당 -10

#### R2. 네이밍 시맨틱 (20%)

naming-policy v2.0 기준. TDS 인스턴스 내부 레이어는 검사 제외.
- 금지 접미사: Major -10
- 접미사 중복: Major -10
- 자동 생성명: Minor -5
- 특수문자: Minor -5
- 하드코딩 데이터: Minor -3
- CTA: Minor -5
- 역할 미설명 일반명: Warning -2

#### R3. 레이아웃 구조 (10%)

Auto Layout → Tailwind flex/grid 매핑 가능 여부.
- 부당한 absolute: Major -10/건
- 중첩 5단계+: Major -10
- 중첩 4단계: Minor -5

#### R4. 프로퍼티 설계 (10%)

Boolean/Variant → React props 직매핑.
- prop 이름 충돌: Major -10/건
- prop 20개 초과: Major -10
- Boolean show/is/has 접두어 없음: Minor -5/건
- camelCase 아님: Minor -5/건

#### R5. 합성 구조 (10%)

컴포넌트 분해가 React 트리와 대응하는지.
- 중첩 깊이 ≤3: 100점
- 중첩 깊이 6+: 40점
- 불필요 래퍼 프레임: -5/건

#### R6. 토큰 준수 (5%)

하드코딩 값 vs 디자인 토큰 바인딩.
- 색상/타이포/이펙트 토큰 미바인딩: Major -10/건

#### R7. shadcn 매핑 정확도 (20%)

Figma 컴포넌트 → shadcn import 직매핑.
- shadcn 컴포넌트 존재하나 미사용: Major -10/건
- Display Name ≠ shadcn 공식명: Minor -5/건
- 아이콘이 Lucide 인스턴스가 아님: Major -10/건
- 아이콘 세트 혼용: Major -10

#### R8. 접근성 (5%)

- 터치 타겟 < 44×44px: Major -10/건
- 텍스트 대비 < 4.5:1: Major -10/건

### Step 3: 리포트 출력

```
## QA Report: [화면명]

> 날짜: YYYY-MM-DD | 루브릭: v1.1 | 노드: [node-id]

### 총점: XX/100 — [PASS/CONDITIONAL/FAIL]

| 축 | 점수 | 가중 | 이슈 수 |
|----|------|------|---------|
| R1 TDS 커버리지 | /100 | ×0.20 | |
| R2 네이밍 | /100 | ×0.20 | |
| R3 레이아웃 | /100 | ×0.10 | |
| R4 프로퍼티 | /100 | ×0.10 | |
| R5 합성 구조 | /100 | ×0.10 | |
| R6 토큰 | /100 | ×0.05 | |
| R7 shadcn 매핑 | /100 | ×0.20 | |
| R8 접근성 | /100 | ×0.05 | |

### Critical 이슈
### Major 이슈
### Minor 이슈
### Warnings
```

### Step 4: 수정 가이드 (CONDITIONAL/FAIL 시)

각 이슈에 대해 수정 방법 제안. 다른 Skills 연계:
- R2 이슈 → `tds-naming-enforcer` 사용 제안
- R4 이슈 → `tds-property-optimizer` 사용 제안
- R6 이슈 → `sync-figma-token` 사용 제안

## 주의사항

- 프로덕션 TDS 파일에 write 금지 (읽기만)
- QA는 항상 read-only — 수정은 별도 승인 후 다른 Skill로
- 리포트는 마크다운 테이블 형식으로 출력
