# Round 1 결론 — Pencil/CDS 전수 정합성 조사 플래닝

## 합의점
1. 6 사례는 빙산 일각 — 추가 조사 필수
2. L1+L2는 자동화 가능 (use_figma + pencil.batch_get JSON diff)
3. Critical은 fix, Minor는 accept 가능
4. Drift monitoring 구조 필요

## 권고: Phase 1-5

| Phase | 작업 | 시간 | Owner |
|-------|------|------|-------|
| 1 | L1+L2 inspection 자동화 스크립트 작성 | 1-2h | AI Ops |
| 2 | 155 reusables 전수 실행 → diff JSON | 1h | 자동 |
| 3 | Triage: Critical / Major / Minor 분류 | 1h | Design |
| 4 | Critical fix only (~10건 추정, Minor는 accept ticket) | 3-5h | Claude (with Director QA per fix) |
| 5 | 재검증 + drift monitor 등록 | 30min | QA |

총 7-10h, 단일 세션 또는 2-3 세션 분할.

## Gate 정의

- **G1 Coverage**: 155/155 컴포넌트 L1 spec diff JSON 생성 = 100%
- **G2 Triage**: critical/major 티켓 모두 owner 지정
- **G3 Fix critical**: critical 100% resolved
- **G4 Accept minor**: minor는 명시 accepted (skipping 금지)
- **G5 Re-verify**: fix 후 동일 도구로 재실행 = critical 0건

## 분류 기준 (Design Director)

- **Atomic** (Avatar/Button/Icon/Badge 등): 사용처 100+, 깨지면 도미노 → critical 격상
- **Molecule** (Tooltip/Card/Field): structural diff = critical, dimension diff = major
- **Organism** (Drawer/Dialog/Footer): structural diff = major, label diff = minor

## 정책

- **WCAG 격상**: 터치 타겟(44×44px 미만) 또는 색상 대비(<4.5:1) 영향 시 critical
- **Maker-Checker**: inspection agent ≠ fix agent ≠ QA agent
- **자동화 우선**: 향후 drift도 같은 도구로 catch

## 거부된 옵션

- ❌ A. P0 30 incremental (Product 단독 안) — 자동화 인프라 미보유 시 매번 갱신 비용
- ❌ B 단독 (전수 자동화만, fix 보류) — Critical 누적, 사용처 영향 방치
