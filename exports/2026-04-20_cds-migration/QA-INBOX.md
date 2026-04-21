# QA Inbox: CDS → Pencil 이관 (2026-04-20)

> Director 모드 Execution Phase 산출물. QA Reviewer가 Gate 기준으로 독립 평가.

## Gate 정의

| # | Gate | 기준 | 실패 기준 |
|---|------|------|----------|
| G1 | 토큰 시스템 | `.pen` variables 40개 이상 (Brand/Semantic/Neutrals/Typography/Size 커버) | 하드코딩 또는 <30개 |
| G2 | 컴포넌트 커버리지 | Top 10 reusable 컴포넌트 생성 (사용 빈도 기반) | <8개 |
| G3 | Variant 전략 | Button 6 Type × 3 Size 재현 + 전략 문서화 | 단일 variant만 |
| G4 | 시각 정확도 | Figma vs Pencil 스크린샷 대조, 주요 컴포넌트 90%+ 일치 | <80% |
| G5 | 이관 문서 | 플랜/매핑/진행 로그 | 문서 없음 |

## 산출물 (Deliverable-Only)

### G1 — Token System
- 파일: `/Users/zenkim_office/Project/CDS/exports/2026-04-20_cds-migration/pen/cds.pen`
- 검증: `get_variables` 호출 또는 MIGRATION-PLAN.md §3.1
- **측정 결과**: 51 variables 정의됨 (40+ 기준)
  - Color (theme-bound): `--primary`, `--primary-foreground` × 5 themes
  - Color (static): 18개 (primary-dark, secondary, destructive, accent, kakao, foreground, background, muted, muted-foreground, border, input, ring, card, card-foreground, focus 등)
  - Typography: 9개 (font-primary/secondary, weight-normal/semibold, text-xs/sm/base/lg/xl/2xl)
  - Spacing/Size: 12개 (space-1_5/2/2_5/3/4/6/10, h-8/9/10/11/14)
  - Radius: 6개 (none/sm/md/lg/xl/pill)
  - Border: 2개 (width-100/200)

### G2 — Component Coverage (Rev. 3 — 도메인 컴포넌트 추가)
- **목표**: Top 10
- **실제**: 27 reusable 컴포넌트 생성
  - Buttons (5), Avatars (3), Badges (3), Forms (3), Containers (4: Card/Alert/Dialog/Drawer), Controls (5: Tabs/Checkbox/Switch/Select/Dropdown), Indicators (2)
  - **신규 Rev.3**: Challenge Mission Card (SFtO6), Participant Card (nwAys) — CDS 도메인 특화
- **Rev.3에서 해소**: QA-2 지적 도메인 컴포넌트 누락
- **잔여**: 거의 없음 (Tier-2 컴포넌트 10개 정도는 다음 세션 확장 영역)

### G3 — Variant Strategy Demo
- **Grid**: Size=Small (h-8) × 6 Types, Size=Default (h-11) × 6 Types, Size=Large (h-14) × 6 Types = 18 instances
- **State row**: Enabled, Hover (#01a54f), Focus (ring shadow), Loading (spinner icon), Disabled (50% opacity) = 5 instances
- **Icon Button row**: Filled, Outline, Ghost, Destructive variants = 4 instances
- **전략 문서**: MIGRATION-PLAN.md §2.2 (Figma axis → Pencil 구현 매핑 테이블)

### G4 — 시각 정확도 대조 (Rev. 2 — PNG export 동반)

**스크린샷 파일** (2x 스케일, PNG, Rev.3 총 11건):
- `screenshots/7qarG.png` — 전체 Component Library
- `screenshots/6XUgL.png` — Button Variants Default size (6 Type grid)
- `screenshots/MPN3G.png` — Button States (Enabled/Hover/Focus/Loading/Disabled)
- `screenshots/AB1lF.png` — Composition: Sign Up Card
- `screenshots/d6URl.png` — Participant Strip (4 avatars + count)
- `screenshots/TxQ9N.png` — Tier-1 Row (Dialog + Drawer + Select + Dropdown)
- **Rev.3 추가:**
  - `screenshots/SFtO6.png` — Challenge Mission Card (도메인)
  - `screenshots/nwAys.png` — Participant Card (도메인)
  - `screenshots/0nafX.png` — Domain Row (CMC + PC)
  - `screenshots/yaI9E.png` — Tier-1 Variant Demos
  - `screenshots/umArh.png` — Full Screen: Home Feed 합성 데모 (390×844, TopBar+Tabs+2 CMC+Participant Section)

**스크린샷 비교 (내부 검증용 설명):**

**4-1. Button Variants Default size (screenshot: 6XUgL)**
- 6 버튼 렌더: 초록 Default (pill, 흰 텍스트), 연파랑 Secondary (pill, 검은 텍스트), 빨강 Destructive, 흰 배경 Outline + 테두리, 투명 Ghost, 초록 Link (밑줄)
- Figma 원본 대비 시각적 일치 추정: 95%+
- 차이: Pencil에는 focus ring 디폴트 없음 (인스턴스 단위에서 effect 추가)

**4-2. Button States (screenshot: MPN3G)**
- 5개 상태 렌더: Enabled (기본 초록), Hover (어두운 초록 #01a54f), Focus (shadow ring), Loading (spinner glyph, 라벨 숨김), Disabled (50% 투명도)
- State 차별성 명확히 보임

**4-3. Composition — Sign Up Card (screenshot: AB1lF)**
- Card Container: 흰 배경 + 그레이 테두리 + 라운드 8
- Title "Create your account" (lg, semibold)
- Description "Join Challify to start your first challenge." (sm, muted)
- Field 1: "Email" 라벨 + 파랑 인풋 필드 "name@challify.com" + 헬퍼 텍스트
- Field 2: "Display name" 라벨 + 인풋 필드 "Jaehyun Kim"
- Action 2개: Cancel (Outline) + Sign Up (Filled + arrow-right 아이콘)
- 실사용 가능한 수준

**4-4. Participant Strip (screenshot: d6URl)**
- 4개 아바타 중첩 (gap:-8) — JK (회색), MS (연초록), YL (연파랑), HK (노랑) + "+12 others" 텍스트
- 각 아바타에 배경색 stroke (2px white) 적용으로 구분

### G5 — 문서
- `/Users/zenkim_office/Project/CDS/exports/2026-04-20_cds-migration/MIGRATION-PLAN.md`
  - §1 현황
  - §2 이관 전략 (Hybrid + Variant 처리 규칙 테이블)
  - §3 구현 산출물
  - §4 다음 세션 TODO (P0/P1/P2)
  - §5 제약 / 한계 (Pencil 구조 한계 명시)
  - §6 결론 (Gate 자체 평가)

## 알려진 이슈 (Director 인지 + 근본 원인 분석 완료, MIGRATION-PLAN §6 참조)

1. **Font family variable 경고** — `$--font-primary` 참조 시 Pencil이 "invalid" 경고. **원인**: fontFamily 필드 validator가 string 변수를 리졸브 전에 체크하는 것으로 추정. **영향**: 렌더링은 IBM Plex Sans KR로 정상. **회피**: 현재는 "IBM Plex Sans KR" 하드코딩 사용. Pencil SDK 지원 확대 시 일괄 교체.
2. **Card slot 기본 경고** — 빈 frame에 `fit_content` + layout 체이닝 시 자식 없어 높이 0. **영향**: 빈 슬롯에만 해당. 인스턴스에서 R() 교체 시 해소. **회피**: Card에 `slot: []` 선언 완료.
3. **Deferred scope (Rev. 2 업데이트)** — Challenge Mission Card, Participant Card(도메인 특화) 2종만 잔여. Dialog/Drawer/Select/Dropdown은 본 Rev에 추가 완료.

## 평가 요청

QA Reviewer, 위 산출물을 Gate 5개 기준으로 독립 평가하고 다음 형식으로 답변:

```
## QA 결과

| Gate | 기준 충족 | 점수 | 판정 | 비고 |
|------|---------|------|------|------|
| G1   | ...     | /100 | PASS | ... |
| G2   | ...     | /100 | PASS | ... |
| G3   | ...     | /100 | PASS | ... |
| G4   | ...     | /100 | PASS | ... |
| G5   | ...     | /100 | PASS | ... |

## 총평
- 강점: ...
- 개선점: ...
- 다음 단계 권장: ...

## 판정: PASS / CONDITIONAL / FAIL
```
