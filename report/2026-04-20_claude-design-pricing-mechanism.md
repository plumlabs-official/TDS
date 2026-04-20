# Claude Design 요금/토큰 차감 메커니즘 조사

> 조사일: 2026-04-20 | 대상 출시: 2026-04-17 Anthropic Labs Research Preview
> 신뢰도: A (공식 소스 4개 WebFetch 교차 검증)

## TL;DR — 재현(CDS PO)을 위한 한 줄 결론

**API 크레딧 별도 결제 불필요. 주간 한도 리셋(최대 7일)을 기다리거나, Extra Usage를 활성화해 API 요율로 초과 사용 가능.** Claude Design은 Claude.ai 채팅/Claude Code와 **완전히 분리된 별도 쿼터**를 가진다.

---

## 1. 요금 체계 — 구독 플랜 기반 (API 크레딧 X)

Claude Design은 Pro, Max, Team, Enterprise 구독자에게 **추가 비용 없이** 포함된다. Research Preview 기간 중 별도 SKU 없음. ([Anthropic 공식 블로그](https://www.anthropic.com/news/claude-design-anthropic-labs))

**예외**: Enterprise *Usage-Based* 계약 조직만 기존 API 계약의 표준 API 요율로 과금되며, 사용자당 약 20프롬프트 상당의 일회성 크레딧이 2026-07-17에 만료 예정. ([Help Center: Claude Design subscription usage and pricing](https://support.claude.com/en/articles/14667344-claude-design-subscription-usage-and-pricing))

## 2. 한도 메커니즘 — **별도 쿼터 + 주간 리셋**

공식 문구 (Help Center 직접 인용, WebFetch 검증):

> "Claude Design usage is metered separately from chat and Claude Code, so design activity never draws from those other limits."
> "Claude Design comes with a recurring weekly allowance that resets every seven days."

핵심 결론:
- **Claude.ai 채팅/Claude Code 쿼터와 독립된 풀** (포함 X, 병렬 존재)
- **주간(7일) 리셋** — daily 아님
- **사용자 단위**로 배정 (Team/Enterprise에서도 조직 풀링 X)

## 3. 플랜별 한도 차등 (공식 확인)

| 플랜 | Claude Design 주간 할당 | 공식 설명 |
|------|-------------------------|-----------|
| Pro | 기준(1x) | "quick explorations, one-off use" |
| Max 5x | Pro의 5x | "PMs and engineers producing regular mock-ups" |
| Max 20x (Opus) | Pro의 20x | "power use — designers and creatives" |
| Team | Standard/Premium 시트별 주간 할당 | 사용자당 배정, 7일 리셋 |
| Enterprise (Seat-Based) | Standard/Premium 시트별 주간 할당 | Team과 동일 구조 |
| Enterprise (Usage-Based) | 표준 API 요율 과금 | 일회성 크레딧 20프롬프트 (2026-07-17 만료) |

출처: [Help Center: Claude Design subscription usage and pricing](https://support.claude.com/en/articles/14667344-claude-design-subscription-usage-and-pricing)

## 4. "24 hours" 에러 메시지 해석 — **미검증 영역**

공식 문서는 **7일 주기**만 명시하며, "try again in about 24 hours" 문구의 정확한 의미는 공식 문서에 없음.

가능 해석 (추정):
1. **부분 리셋** 가능성 — Claude Pro의 5시간 세션 한도처럼 서브한도가 있을 수 있음
2. **UI 표시 버그/근사값** — 주간 리셋까지 남은 시간을 분 단위 계산 후 "약 24시간" 표시
3. **Rolling window** — 24시간 사용량 집계 후 오래된 항목 소멸 방식

**권장 행동**: 이 메시지를 그대로 믿고 24시간 대기해도 안전(주간 리셋이 더 빨리 올 수 있지만, 늦게 오지는 않음). 단 대기 중에도 **업무 흐름 끊김을 막고 싶다면 Extra Usage 활성화**가 즉시 해법.

## 5. Extra Usage — 대기 없이 재개하는 방법

- Settings → Usage 에서 활성화, **선불 충전금** 기반
- **표준 API 요율**로 과금되며, 구독료와 **별도 결제**로 청구서에 추가
- 일일 redemption 한도: $2,000
- Pro/Max/Team/Enterprise 모든 유료 플랜에서 지원
- Claude Design이 이 메커니즘에 포함된다고 공식 명시되진 않았으나, Help Center의 Claude Design 섹션에서 "Extra usage is available for purchase"라고 별도 안내 — **동일 방식 적용으로 판단** (근거: 동일 Settings > Usage 경로, 동일 "extra usage" 용어)

출처: [Help Center: Manage extra usage for paid Claude plans](https://support.claude.com/en/articles/12429409-manage-extra-usage-for-paid-claude-plans)

## 6. Figma Make 등 크레딧 시스템과의 비교

| 항목 | Claude Design | Figma Make |
|------|---------------|-----------|
| 과금 단위 | 주간 allowance (프롬프트/세션 단위, 상세 미공개) | AI credit (별도 구매) |
| 별도 크레딧 구매 | X (Extra Usage = API 요율 종량제) | O (크레딧 팩 구매) |
| 리셋 | 7일 주기 자동 | 월간 갱신 + 소진 시 구매 |

Claude Design은 **별도 크레딧 SKU 없음**. 공식 "Extra Usage"만 존재하고 이는 API 종량제 형태.

---

## 재현을 위한 실무 판단

1. **오늘 usage limit 도달했으면** — API 크레딧 별도 결제 불필요. 대기 시 자동 복원.
2. **업무 연속성이 급하면** — Settings → Usage → Extra Usage 활성화 (API 요율 종량제, 선불 충전)
3. **Max로 업그레이드 고려 시** — Pro 대비 5x/20x 할당. Max 20x("Opus")는 디자인/크리에이티브 파워유저 타겟으로 공식 명시
4. **정확한 리셋 시각** — Claude UI의 "Settings > Usage" 화면에서 주간 리셋 카운트다운 확인 권장

---

## 확실도 분포

| 항목 | 확실도 | 근거 |
|------|--------|------|
| API 크레딧 별도 결제 불필요 (Enterprise Usage-Based 제외) | 확실 | 공식 Help Center 명시 |
| 채팅/Claude Code와 별도 쿼터 | 확실 | 공식 직접 인용 |
| 7일 주기 리셋 | 확실 | 공식 직접 인용 |
| Pro/Max 5x/Max 20x 한도 차등 | 확실 | 공식 직접 인용 |
| "24 hours" 에러 메시지의 정확한 의미 | 미검증 | 공식 문구 없음, 주간 리셋과 상충 가능 |
| Claude Design이 Extra Usage(API 요율)로 연장 가능 | 강한 추정 | Help Center가 동일 용어 사용하나 직접 연결 문구 없음 |
| 주간 할당의 절대 수치 (프롬프트 개수 등) | 미공개 | 공식 문서에 수치 없음, 상대 배수만 공개 |

---

## Sources (WebFetch 검증 완료)

| URL | 유형 | 신뢰도 | 검증 |
|-----|------|--------|------|
| [Claude Design subscription usage and pricing](https://support.claude.com/en/articles/14667344-claude-design-subscription-usage-and-pricing) | Anthropic 공식 Help Center | A | O |
| [Introducing Claude Design by Anthropic Labs](https://www.anthropic.com/news/claude-design-anthropic-labs) | Anthropic 공식 블로그 | A | O |
| [Get started with Claude Design](https://support.claude.com/en/articles/14604416-get-started-with-claude-design) | Anthropic 공식 Help Center | A | O |
| [Claude Design admin guide for Team and Enterprise plans](https://support.claude.com/en/articles/14604406-claude-design-admin-guide-for-team-and-enterprise-plans) | Anthropic 공식 Help Center | A | O |
| [Manage extra usage for paid Claude plans](https://support.claude.com/en/articles/12429409-manage-extra-usage-for-paid-claude-plans) | Anthropic 공식 Help Center | A | O |

---
*생성: /research Deep Research Protocol | 라운드 1/3 | 공식 소스만 사용*
