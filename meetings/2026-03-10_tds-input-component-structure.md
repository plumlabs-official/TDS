# TDS Input 컴포넌트 구조 설계

**Date:** 2026-03-10
**Mode:** Team
**Participants:** Design Director, Engineering Lead

## 안건

1. Input Group에 Type=Bare 추가가 바이브코딩 환경에서 최선인가?
2. 전화번호 (🇰🇷 +82) 입력 타입 처리 방법
3. Validation 텍스트를 Input 포맷에 포함할 것인가?

## 합의

| 안건 | 결론 | 구현 방식 |
|------|------|----------|
| Bare 스타일 | Type이 아닌 **Variant 프로퍼티** 추가 | `Variant=Default|Bare` (Type 축과 분리) |
| 전화번호 | 별도 Type 불필요 | Input Group `Variant=Bare` + Addon Inline (🇰🇷 Chip) 조합 |
| Validation | Error 프로퍼티 유지 (테두리), 메시지는 Addon Block | Figma: Addon Block에 예시 / Code: `<FormMessage>` 분리 |

## 최종 Input Group 프로퍼티 매트릭스

| Property | Values | 역할 |
|----------|--------|------|
| Type | Text, Textarea | 내용물 형태 |
| Variant | Default, Bare | 시각적 스타일 |
| State | Enabled, Focus, Filled, Disabled | 인터랙션 상태 |
| Error | True, False | 에러 여부 (테두리 색상) |

## 근거

- **Variant 분리:** Type은 내용물 형태, Variant는 시각적 스타일 — 같은 축에 다른 의미를 섞지 않는다 (Atomic Design)
- **전화번호:** Input Group Addon Inline 조합으로 처리. 전용 타입 만들면 prefix 케이스마다 타입 추가 필요
- **Validation:** shadcn/ui의 `<FormMessage>` 패턴 — Input은 error prop으로 테두리만, 메시지는 Form 레벨
- **코드 매핑:** `<Input variant="bare" />` — AI가 바로 이해 가능, HTML type 속성과 혼동 없음
