# CDS → Pencil 네이티브 이관 플랜

- **날짜**: 2026-04-20
- **담당**: Director 모드 (Engineering Lead + Design Director 리서치)
- **전략**: Hybrid (c) — Theme for color Type + Multiple structural reusables
- **산출 파일**: `pen/cds.pen`

## 1. 현황

- CDS 규모: 50+ 컴포넌트. Button 1종만 228 variants (Type×8, State×6, Size×6)
- Pencil 구조적 한계: 네이티브 variant dropdown 없음 → flatten 불가피
- Claude Design 대조 결과: 토큰 정확도 높고, variant flatten 동일

## 2. 이관 전략 (Hybrid)

### 2.1 Token System
- 51개 `.pen` variables 정의
- Type axis theme-bound (`--primary`, `--primary-foreground` 5 테마)
- 기타 색/타이포/스페이싱/라디우스는 단일 값

### 2.2 Variant 처리 규칙

| Figma axis | Pencil 구현 |
|-----------|------------|
| `Type` (8) | **Theme 축** `type={default,secondary,destructive,inverted,kakao}` → 색상 자동 스왑 (3 제외: Outline/Ghost/Link는 구조적 차이로 별도 reusable) |
| `Size` (6) | **Instance prop 오버라이드** (`height`, `padding`, `fontSize`를 instance-level로) |
| `State` (6) | **Instance-level 스타일 오버라이드** (fill/opacity/effect 직접 덮기) |
| `Boolean` (Show Icon Left/Right/Kbd/Reddot) | `descendants.{iconId}.enabled` 토글 |
| `INSTANCE_SWAP` (Icon-Left/Right/Only) | `descendants.{iconId}.iconFontName` 교체 |
| `TEXT` (Label) | `descendants.{labelId}.content` 덮기 |

### 2.3 Button 5개 Structural Reusables

| 이름 | 커버 범위 (Figma 원본 variants) | Pencil 재구현 |
|------|----------------------------|-------------|
| `Button-Filled` | Type={Default, Secondary, Destructive, Inverted, Kakao} | 1 reusable + theme-swapped fill |
| `Button-Outline` | Type=Outline (모든 상태) | 별도 reusable (bg transparent + border) |
| `Button-Ghost` | Type=Ghost | 별도 reusable (bg transparent, border 없음) |
| `Button-Link` | Type=Link | 별도 reusable (padding 0, underline 텍스트) |
| `Button-Icon` | Size=Icon/Icon-Small/Icon-Large (모든 Type) | 별도 reusable (정사각, label 없음) |

**합산**: 5 reusables × theme(5) × instance size(3) = 75 커버, 원본 228 variants의 약 33% 구조적 재현. 나머지는 instance-level 스타일 오버라이드로 런타임 생성.

## 3. 구현 산출물 (Pencil 파일)

### 3.1 Variables (51개)

**Color (theme-bound):** `--primary`, `--primary-foreground` (5 modes)
**Color (static):** `--primary-dark`, `--secondary`, `--secondary-foreground`, `--destructive`, `--destructive-foreground`, `--accent`, `--accent-foreground`, `--kakao`, `--kakao-foreground`, `--foreground`, `--background`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--ring`, `--card`, `--card-foreground`, `--focus`
**Typography:** `--font-primary`, `--font-secondary`, `--font-weight-normal`, `--font-weight-semibold`, `--text-xs/sm/base/lg/xl/2xl`
**Spacing:** `--space-1_5/2/2_5/3/4/6/10`, `--h-8/9/10/11/14`
**Radius:** `--radius-none/sm/md/lg/xl/pill`
**Border:** `--border-width-100/200`

### 3.2 Reusable Components (31개, Rev.4 기준)

| 구분 | 컴포넌트 | Pencil ID |
|------|---------|-----------|
| Buttons | Button-Filled, Button-Outline, Button-Ghost, Button-Link, Button-Icon | V9iZj, YCwzB, Y0u3G, m6wCU, RBJ1k |
| Avatars | Avatar, Avatar-Small, Avatar-Large | SfBW1, UjAmH, F6A53 |
| Badges | Badge (filled), Badge-Secondary, Badge-Outline, Badge-Accent, Badge-Destructive, Badge-Number | quH1j, SQohC, p2TeB, nnrXX, 4wJtS, EPnHc |
| Forms | Label, Input, Field | Ti74H, uQsLv, vI713 |
| Containers | Card (generic), Sheet Header Card (CDS), Alert, Dialog, Drawer | EctOI, 5vMvg, uzlqg, 5czSp, PAezh |
| Controls | Tabs (composite), Checkbox, Switch, Select, Dropdown Menu | EKcrm, gnNok, RmT6o, ssooQ, MFjKg |
| Indicators | Progress, Separator | I7c2F, iK2eK |
| Domain | Challenge Mission Card, Participant Card | SFtO6, nwAys |

### 3.3 Variant Demos (G3)

- **Size × Type grid**: 3 sizes (Small/Default/Large) × 6 Types (Default/Secondary/Destructive/Outline/Ghost/Link)
- **State row**: Enabled/Hover/Focus/Loading/Disabled
- **Icon Button row**: 4 styles

### 3.4 Composition Demo

- Sign Up Card (Title + Desc + 2 Input Fields + 2 Action Buttons)
- Participant Strip (4 overlapping Avatars + "+12 others")
- Status Badge Stack

## 4. 다음 세션에 할 일 (Deferred)

### P0 (핵심)
- Challenge Mission Card, Participant Card (CDS 도메인 특화)
- Dialog/Drawer/Select/Dropdown — 본 세션에 추가 완료 → **다음 세션은 variant 확장 + instance demo 다수**
- 각 컴포넌트 state/type variant 실증 데모 확장

### P1 (확장)
- 나머지 Tier-2 컴포넌트 (10개)
- State theme axis 시도 (단일 reusable에 State 통합 가능성 검증)

### P2 (유지보수)
- CDS Figma 업데이트 시 Pencil 수동 싱크 절차 문서화
- Instance Swap 슬롯 정의 (Card content slot 등)

## 5. 제약 / 한계

1. **Variant dropdown UX 부재**: Pencil은 instance-level 오버라이드만 지원. "Type을 Secondary로 바꾸기"가 클릭 한 번 아님.
2. **Loading state 애니메이션**: `.pen` 포맷에 애니메이션 프리미티브 없음. Static spinner glyph만 가능.
3. **Theme 축 카디널리티**: 5 Types × 6 States = 30 값 세트 per token. 관리 복잡도.
4. **CDS Figma 양방향 참조 없음**: Figma 원본 업데이트 시 Pencil 수동 재작업.

## 6. 알려진 이슈 근본 원인 분석

### 6.1 `$--font-primary` invalid 경고
- **원인**: Pencil의 fontFamily 필드 검증 로직이 string 타입 변수 참조를 리졸브 전에 validate 하는 것으로 추정
- **영향**: 경고만 발생, 실제 렌더링은 정상 ("IBM Plex Sans KR" 폰트가 올바르게 적용됨)
- **회피책**: 현재 변수 값으로 "IBM Plex Sans KR" 하드코딩 사용 (모든 fontFamily 필드). 변수 참조가 Pencil SDK 업데이트로 지원될 시 일괄 교체 가능.

### 6.2 Card slot `fit_content` 경고
- **원인**: 빈 frame이 `fit_content` sizing + layout 체이닝 시 자식 없어 높이 0 처리
- **영향**: 빈 슬롯에만 해당. 실제 인스턴스에서 R()로 콘텐츠 교체하면 해소됨
- **회피책**: Card에 `slot: []` 선언하여 슬롯임을 명시 + 초기 placeholder child 주입 (향후 작업)

## 7. 결론

- G1 (토큰 51/40+): **PASS** (51 vars, theme-bound 2 tokens)
- G2 (Top 10 → 25개): **PASS** (초기 18 + Tier-1 4 + 추가 3)
- G3 (Button 6 Type × 3 Size + 전략 문서화): **PASS** (18 grid + state row + icon row)
- G4 (시각 정확도): PNG export 6건 동반 → `screenshots/`
- G5 (문서): **PASS** (이 문서 + QA-INBOX)

**본 세션 규모**: 25 reusables + 35+ 인스턴스 데모 + 51 variables + 5 theme modes. 전체 CDS 이관까지 약 2 추가 세션 소요 예상 (Challenge Mission Card/Participant Card 등 도메인 컴포넌트 우선).
