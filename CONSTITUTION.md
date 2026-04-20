# Project Constitution

> CDS (Challify Design System) - AI 행동 지침
>
> Last updated: 2026-03-17 | v3.0.0

## Tech Stack

- **Figma Plugins**: TypeScript 기반 플러그인 (`figma-plugins/`)
  - `cds/` — CDS Tools (Renamer, Docs Generator)
  - `cds-docs/` — 문서 생성기
  - `migrate-to-cds/` — CDS 마이그레이션
- **Design System**: 바이브코딩(Tailwind+React+shadcn) 최적화

## Core Rules

1. **문서 우선**: 모든 작업 전 `docs/`, `.ai/` 문서 참조
2. **네이밍 규칙 준수**: `.claude/rules/naming-policy.md` 필수 참조
3. **Read First**: 코드 수정 전 반드시 해당 파일 Read 먼저
4. **작은 단위**: 한 번에 50줄 이상 작성 금지
5. **정책 파일 단일화**: 이 프로젝트의 정책 파일은 `CONSTITUTION.md`만 사용 (`AGENTS.md` 재생성/수정 금지)

## Forbidden

### 네이밍 금지 사항
> 상세: `.claude/rules/naming-policy.md` → "금지 어휘" 섹션

### 코드 작성 금지 사항
- 읽지 않은 파일 수정 제안
- 과도한 탐색 (3회 이상 연속 검색)
- 테스트 없는 배포

## Memory Bank

> 문서 참조 테이블: `CLAUDE.md` → "Quick Reference" 참조

## Project Structure

```
/
├── CONSTITUTION.md         # 프로젝트 헌법 (이 파일)
├── CLAUDE.md               # Claude Code 지침
├── docs/                   # 문서 (목적 중심)
│   ├── cds-overview.md     # CDS 컴포넌트/토큰 구조 개요
│   ├── specs/              # SSOT (규칙/사양)
│   ├── how-to/             # 작업별 실행 레시피
│   └── architecture/       # 설계/배경/ADR
├── figma-plugins/
│   ├── cds/                # CDS Tools (Renamer + Docs Generator)
│   ├── cds-docs/           # 문서 생성기
│   └── migrate-to-cds/     # CDS 마이그레이션
├── report/                 # 리서치/분석 결과물
├── reviews/                # QA/리뷰 기록
├── meetings/               # 미팅 기록
├── .ai/                    # AI 전용 메모리 (링크 중심)
│   ├── SESSION.md          # 세션 단기 기억
│   └── RECIPES.md          # 반복 작업 레시피
└── .claude/
    └── rules/              # 네이밍 정책, QA 루브릭
```

## Quick Commands

> 상세: `.ai/RECIPES.md` → "빌드" 섹션

| 명령 | 설명 |
|------|------|
| `npm run build` | Figma 플러그인 빌드 |
| `npm run watch` | 플러그인 watch 모드 |
| `/context` | 토큰 사용량 확인 |

---

## 문서 관리 원칙

### 1. 문서 구조
- `docs/specs/`: 규칙/사양 (SSOT)
- `docs/how-to/`: 작업별 실행 레시피
- `docs/architecture/`: 설계/배경/ADR

### 2. 플랜 모드 활용
- 복잡한 작업 전 `plan mode`로 설계 승인
- plan 파일 → `.claude/plans/` 폴더 보관
- 코드 작성 전 아키텍처 검토

### 3. 회고 문화
- 실패 패턴 즉시 `docs/architecture/lessons-learned.md` 기록
- AI 실수도 기록 → 다음 세션에서 방지
- 형식: 문제 → 원인 → 해결 → 재발 방지

### 4. 문서 = 코드
- 문서 변경도 Git으로 관리
- 살아있는 문서로 취급 (지속 업데이트)
- Single Source of Truth 유지

### 5. AI 협업 지침
- 모호하면 추측 말고 **질문**
- 시니어 개발자처럼 품질 체크
- 테스트 작성 → 문서화 병행

---

## 관련 문서

> `CLAUDE.md` → "Quick Reference" 참조
