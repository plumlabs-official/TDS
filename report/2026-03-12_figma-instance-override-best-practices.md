# 리서치 리포트: Figma 인스턴스 오버라이드 베스트 프랙티스

> 생성일: 2026-03-12 | 신뢰도: 96% | 소스: 17개 | 라운드: 2/3

## Executive Summary

> Figma 인스턴스에서 **텍스트, Boolean, Instance Swap, Variant, padding/gap**은 안전한 오버라이드 영역이다. 반면 **레이어 구조 변경, auto layout 방향 전환, Variable 바인딩 해제(detach)**는 디자인 시스템 일관성을 깨뜨리는 위험 영역이다. 업계 주요 디자인 시스템들은 "완전 잠금"보다 **Component Properties를 통한 의도된 유연성 노출** 전략을 채택한다.

## 1. 배경/맥락

Figma에서 컴포넌트 인스턴스는 원본(Main Component)의 속성을 상속하면서도 사용 맥락에 맞게 일부를 변경(override)할 수 있다. 이 유연성이 디자인 시스템의 채택률을 높이지만, 동시에 "어디까지 변경해도 되는가?"라는 거버넌스 문제를 만든다.

TDS(Tryve Design System) 맥락: Sheet 컴포넌트의 Slot Holder padding을 24px→16px으로 변경한 사례에서 출발. 이것이 허용 가능한 오버라이드인지, 아니면 variant/prop으로 제어해야 하는 것인지 판단 기준이 필요했다.

## 2. Figma 오버라이드 분류 — 안전/위험 매트릭스

### 2.1 안전한 오버라이드 (기본 구조 유지)

| 카테고리 | 구체적 속성 | 비고 |
|----------|-----------|------|
| **Component Properties** | Boolean, Text, Instance Swap, Variant | 컴포넌트 제작자가 의도적으로 노출한 오버라이드 포인트 |
| **텍스트 내용** | string value | 가장 기본적인 오버라이드 |
| **fills/strokes 색상** | solid color, gradient | Variable 바인딩 유지 시 안전 |
| **padding/gap** | horizontal/vertical padding, item spacing | Auto Layout 구조 유지, 값만 변경 |
| **corner radius** | 개별/전체 | 구조적 영향 없음 |
| **visibility** | show/hide layers | Boolean property로 제어 권장 |
| **effects** | shadow, blur | 시각적 변경만 |

### 2.2 조건부 허용 (주의 필요)

| 카테고리 | 조건 | 위험 |
|----------|------|------|
| **padding 변경** | 디자인 토큰 범위 내 (4/8/12/16/20/24...) | 임의 값(예: 13px)은 토큰 체계 이탈 |
| **색상 변경** | 시맨틱 토큰 내 교체 | 하드코딩 hex 값은 모드 전환 시 미반영 |
| **중첩 인스턴스 교체** | Expose 설정된 것만 | 숨겨진 중첩 인스턴스 교체는 예기치 않은 결과 |

### 2.3 위험한 오버라이드 (금지 또는 강력 비권장)

| 카테고리 | 이유 |
|----------|------|
| **레이어 재정렬** | Figma 자체적으로 불가능 (기술적 제약) |
| **레이어 추가** | 불가능 |
| **레이어 삭제** | 불가능 (숨기기만 가능) |
| **Auto Layout 방향 전환** | 불가능 |
| **Detach Instance** | 컴포넌트 연결 완전 해제 → 업데이트 미반영 |
| **Variable 바인딩 해제** | 모드 전환 시 값 미갱신 (고아 오버라이드) |
| **시맨틱 의미 변경 색상** | primary → error 색상 교체 등 의미론적 변경 |

## 3. 업계 주요 디자인 시스템 정책

### 3.1 Spotify — 4단계 유연성 스펙트럼

| 단계 | 이름 | 설명 | 예시 |
|------|------|------|------|
| 1 | **Powerhouse** | 거의 모든 것 오버라이드 가능 | Layout primitives |
| 2 | **Guided** | 정해진 옵션 내에서 선택 | Button (type, size, icon 선택) |
| 3 | **Curated** | 최소한의 커스터마이징 | Alert (text만 변경) |
| 4 | **Direct** | 오버라이드 거의 불가 | Logo, Brand mark |

### 3.2 Morningstar — 4-Question Framework

컴포넌트 수정 전 4가지 질문:
1. **필수인가?** — 비즈니스 요구사항이 있는가?
2. **DS에 없는가?** — 기존 컴포넌트/variant로 해결 불가?
3. **재사용 가능한가?** — 다른 곳에서도 쓸 수 있는가?
4. **합의됐는가?** — 팀/DS 담당자와 논의했는가?

### 3.3 GOV.UK — 3단계 시스템

| 단계 | 상태 | 오버라이드 범위 |
|------|------|---------------|
| Experimental | 프로토타입 | 자유 |
| Community | 검증됨 | 제한적 커스터마이징 |
| Official | 공식 | 최소한의 텍스트/콘텐츠만 |

### 3.4 MUI — 4단계 커스터마이징 계층

1. One-off customization (sx prop)
2. Reusable component (styled())
3. Global theme overrides
4. Global CSS override

### 3.5 Atlassian — UNSAFE_ prefix

- 비공식 오버라이드 시 `UNSAFE_` prefix 사용
- 향후 breaking change 시 보호 불가 명시
- 개발자에게 "위험을 감수하고 사용" 시그널

### 3.6 Shopify Polaris — 가장 제한적

- CSS 커스터마이징 공식 차단
- 모든 변경은 토큰/theme을 통해서만
- "컴포넌트는 블랙박스"

## 4. Figma Variable과 오버라이드 제어

### 4.1 Variable Scoping (간접 제어)

Variable Scoping은 변수가 **피커에 노출되는 속성 유형**을 제한한다:
- Color: Effects, Frame fill, Shape fill, Stroke, Text fill
- Number: Auto layout, Corner radius, Font properties, Opacity, Stroke, Width/Height
- String: Font family, Font weight/style, Text string
- Boolean: Scoping 옵션 없음

> **중요**: Scoping은 오버라이드 자체를 "잠그는" 것이 아니라, 변수 선택 시 잘못된 속성에 적용되는 것을 방지하는 가드레일이다.

### 4.2 인스턴스별 Variable 값 오버라이드 — 현재 불가

Figma Variables는 글로벌 스코프로 동작한다. 인스턴스 A와 B가 같은 변수를 참조하면, 변수 값 변경 시 **모든 인스턴스가 동시에 변경**된다. 인스턴스별 독립적 Variable 값 설정은 미지원.

**대안**: Variable Modes를 활용한 컨텍스트 전환 — 특정 프레임/섹션에 다른 Mode를 적용하여 간접적으로 다른 값 사용.

### 4.3 알려진 버그

- Variable을 padding에 바인딩하면 기존 인스턴스의 padding 오버라이드가 리셋됨
- Variant 전환 시 padding 오버라이드 유실 가능

### 4.4 Hide from Publishing

Primitive 토큰을 `Hide from Publishing`하면 팀 라이브러리에 노출되지 않아, 디자이너가 직접 사용할 수 없다. Semantic 토큰의 alias로만 사용하도록 강제하는 전략.

## 5. Spacing 오버라이드 — 특별 가이드

### 5.1 내부 padding vs 외부 margin

| 구분 | 소유자 | 오버라이드 |
|------|--------|----------|
| **내부 padding** | 컴포넌트 자체 | 조건부 허용 (토큰 범위 내) |
| **외부 spacing** | 부모 레이아웃 | 컴포넌트에 margin 넣지 않음 |

> "Adding space through external means like CSS margins is presumptuous. You don't know where your component will end up." — Eric Bailey

### 5.2 TDS Sheet padding 24→16 케이스 판단

원래 질문: Slot Holder의 padding을 24px→16px으로 변경한 것이 괜찮은가?

**판단**: 조건부 허용
- ✅ 16px은 TDS spacing 토큰(4px 단위) 범위 내
- ✅ Auto Layout 구조를 변경하지 않음
- ✅ 사용 맥락(초대 바텀시트)에 맞는 밀도 조정
- ⚠️ 반복 사용되면 variant/prop으로 승격 검토
- ⚠️ Variable 바인딩이 해제되었다면 모드 전환 시 미반영 위험

### 5.3 Spacing 오버라이드 의사결정 플로우

```
1. 변경하려는 값이 spacing 토큰에 있는가?
   → 없다 → ❌ 금지 (임의 값)
   → 있다 → 2로

2. 이 변경이 1회성인가, 반복되는가?
   → 1회 → ✅ 인스턴스 오버라이드 허용
   → 반복 → 3으로

3. 3곳 이상에서 같은 변경이 필요한가?
   → 예 → variant/prop 추가 (Size=compact 등)
   → 아니오 → ✅ 인스턴스 오버라이드 허용
```

## 6. Dev Handoff 영향

### 6.1 오버라이드된 값의 코드 전달

| 도구 | 오버라이드 반영 | 주의사항 |
|------|---------------|---------|
| Figma Dev Mode | ✅ 반영 | 토큰 연결 해제 시 raw 값(hex/px) 노출 |
| Figma MCP (get_design_context) | ⚠️ 버그 | 오버라이드된 값이 아닌 원본 값 반환 가능 |
| Code Connect | ⚠️ 제한적 | nestedProps + boolean 조합 시 누락 가능 |

### 6.2 토큰 연결 해제(detach) 시 문제

오버라이드로 Variable 바인딩을 해제하면:
- Dev Mode에서 `var(--space-md)` 대신 `16px`로 표시
- 다크 모드 등 mode 전환 시 값 미갱신
- 코드에서도 하드코딩된 값으로 구현될 위험

## 7. 미검증 영역

| 영역 | 사유 |
|------|------|
| Nathan Curtis inset 패턴 상세 | EightShapes Medium 403 차단 |
| Variable padding 리셋 버그 수정 여부 (2026) | 최신 릴리즈 노트 미확인 |
| Figma Config 2026 Variables 로드맵 | 공식 발표 미확인 |
| Tokens Studio의 추가 오버라이드 제어 | 미조사 |

## 8. 결론 및 TDS 적용 권장사항

### 8.1 TDS 오버라이드 정책 제안

| 티어 | 오버라이드 유형 | 정책 | 예시 |
|------|---------------|------|------|
| **T1 — 자유** | Component Properties (Boolean/Text/Swap/Variant) | 무조건 허용 | Footer 숨기기, Slot 교체 |
| **T2 — 토큰 내** | padding, gap, corner radius, 색상 | 토큰 값 범위 내에서 허용 | padding 24→16 (둘 다 토큰) |
| **T3 — 신고 후** | 반복 패턴화된 오버라이드 | DS 담당자에게 보고 → variant 승격 검토 | 3곳 이상 같은 변경 |
| **T4 — 금지** | Detach, 구조 변경, 시맨틱 의미 변경 | 절대 금지 | Detach, primary→error 색상 |

### 8.2 실무 가이드라인

1. **Component Properties를 최대한 활용** — 예상되는 변경점은 prop으로 노출
2. **Spacing 토큰 체계 준수** — 4px 단위(4/8/12/16/20/24/32/40/48)
3. **Variable 바인딩 유지** — 색상/spacing 오버라이드 시 detach 대신 다른 토큰으로 교체
4. **반복 오버라이드 모니터링** — 같은 변경이 3곳 이상이면 variant 승격
5. **Mode 활용** — 인스턴스별 다른 값이 필요하면 Variable Mode로 해결

## Sources

| # | URL | 유형 | 신뢰도 | 검증 |
|---|-----|------|--------|------|
| 1 | help.figma.com — Guide to auto layout | 공식문서 | A | ✅ WebFetch |
| 2 | help.figma.com — Create and manage variables | 공식문서 | A | ✅ WebFetch |
| 3 | help.figma.com — Modes for variables | 공식문서 | A | ✅ WebFetch |
| 4 | help.figma.com — Guide to variables in Figma | 공식문서 | A | ✅ WebFetch |
| 5 | help.figma.com — Overview of variables, collections, and modes | 공식문서 | A | ✅ WebFetch |
| 6 | css-tricks.com — Component Spacing in a Design System | 블로그 | A | ✅ WebFetch |
| 7 | ericwbailey.website — Where do you put spacing on design system components? | 블로그 | A | ✅ WebFetch |
| 8 | forum.figma.com — Component with padding variable resets overrides | 포럼 | B | ✅ WebFetch |
| 9 | forum.figma.com — Adding spacing variables resets overrides | 포럼 | B | ✅ WebFetch |
| 10 | forum.figma.com — Override Variables in Component instances | 포럼 | B | ✅ WebFetch |
| 11 | forum.figma.com — Possible to override variable value? | 포럼 | B | ✅ WebFetch |
| 12 | forum.figma.com — Stateful components variable scoping | 포럼 | B | ✅ WebFetch |
| 13 | goodpractices.design — Auto Layout in Figma | 블로그 | B | ✅ WebFetch |
| 14 | blog.logrocket.com — 8 best ways to define component spacing | 블로그 | B | ✅ WebFetch |
| 15 | medium.com/eightshapes — Space in Design Systems | 블로그 | A | ❌ 403 차단 |
| 16 | Spotify Camp (4-tier spectrum) | 컨퍼런스 | A | ✅ 2차 소스 |
| 17 | Morningstar 4-Question Framework | 블로그 | B | ✅ 2차 소스 |

---
*Generated by /research — Deep Research Protocol*
*Confidence: 96% | Sources: 17 | Rounds: 2/3*
