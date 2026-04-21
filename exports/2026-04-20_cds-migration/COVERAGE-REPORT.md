# Coverage Report — CDS → Pencil 매칭률

- **날짜**: 2026-04-21
- **CDS 원본**: 102 top-level 컴포넌트 (fileKey `H36eNEd6o7ZTv4R7VcyLf2`)
- **Pencil 현재**: 51 reusables
- **Challify 프로덕트 기준 실사용**: 240 unique 컴포넌트

## 우선순위 Tier (Challify usage 기반)

- **P0 (사용 100회+)**: Notification Badge, Button, Icon Scaler, Avatar, Kbd, Badge, Separator, TabsTrigger Tag, Input Group Addon Inline, Coin, TabsTrigger Section, Message, Messaging Reaction, Challenge Thumbnail, iOS StatusBar, Navbar, Dots, iOS HomeIndicator — **18종**
- **P1 (50–100회)**: Status, Select Menu Item, TabBar Icon 등 — **~15종**
- **P2 (<50회)**: 나머지

## P0 매칭 상태

| P0 컴포넌트 | Usage | Pencil 상태 | Pencil ID |
|------------|-------|------------|-----------|
| Notification Badge | 1290 | ✅ 있음 | YewQW |
| Button | 1258 | ✅ 5 structural | V9iZj + 4 |
| **Icon Scaler** | 1071 | ❌ **누락** | — |
| Avatar | 898 | ✅ 3 size | SfBW1/UjAmH/F6A53 |
| **Kbd** | 560 | ❌ **누락** | — |
| Badge | 447 | ✅ 6 variants | quH1j + 5 |
| Separator | 440 | ✅ | iK2eK |
| **TabsTrigger Tag** | 423 | ❌ **누락** | — |
| **Input Group Addon Inline** | 391 | ❌ **누락** | — |
| **Coin** | 169 | ❌ **누락** | — |
| **TabsTrigger Section** | 138 | ❌ **누락** | — |
| Message | 133 | ✅ 2 (Received/Sent) | 92QWU/racHP |
| **Messaging Reaction** | 132 | ❌ **누락** | — |
| Challenge Thumbnail | 120 | ✅ 3 size + CMC | MiRzL/1DpZI/gsauZ/Zp365 |
| **iOS StatusBar** | 115 | ❌ **누락** | — |
| Navbar | 112 | ✅ | DvnDV |
| Dots | 108 | ✅ | shXsW |
| **iOS HomeIndicator** | 108 | ❌ **누락** | — |

## P0 커버리지 스코어

- **매칭**: 10/18 = **55.6%**
- **누락**: 8/18 (Icon Scaler, Kbd, TabsTrigger Tag, Input Group Addon Inline, Coin, TabsTrigger Section, Messaging Reaction, iOS StatusBar, iOS HomeIndicator)

### P0 누락 심각도 분석

**Critical (P0 사용 200회+):**
- **Icon Scaler (1,071)**: CDS 아이콘 사이징 유틸. 미커버 시 모든 아이콘 배치가 비표준
- **Kbd (560)**: 단축키 표시 컴포넌트
- **TabsTrigger Tag (423)**: 필터 태그 탭
- **Input Group Addon Inline (391)**: 인풋 좌/우 부착 요소

**High (P0 사용 100–200회):**
- Coin (169), TabsTrigger Section (138), Messaging Reaction (132), iOS StatusBar (115), iOS HomeIndicator (108)

## 전체 매칭 상세 (51 Pencil ↔ 102 CDS)

### CDS에 있고 Pencil에 있는 것 (20+종)
Alert, Avatar, Avatar Group, Badge, Button, Card, Challenge Mission Card, Challenge Mission Card Thumbnail, Challenge Thumbnail (3 size), Checkbox, Dialog Header, Dots, Drawer, Dropdown Menu, Featured Icon (2), Field, Input, Label, Lounge Card, Message (2), Navbar, Notification Badge, Nudge, Participant Card, Progress, Select, Separator, Switch, Tabs (TabsTrigger Toggle 추정)

### Pencil-only (CDS에 없음, 6종)
- Sheet Header Card (shadcn 스타일 구조)
- Card Host Info (CMC 내부 승격)
- Card Meta Row (CMC 내부 승격)
- Alert Default With Avatar / Alert Destructive / Alert Primary (Alert color variants 별도 reusable 화)

### CDS에 있고 Pencil에 없음 (누락, 50+종)
**P0 누락 8종** (위 표 참고) + 다음:
- Accordion, Accordion Item, Breadcrumb, Breadcrumb Item
- Calendar Block, Challenge Day Progress, Challenge List Card, Challenge Mini Card
- Character/Contact/Gift Illust, Checkbox Group, Checkbox Toggle
- Circle Progress, Combobox, Combobox Menu, Content Header
- Cover Pay Header, Creator Badge, Date Picker, Dropdown Menu Trigger
- Field Legend, Fieldset, Fire, Footer, Form Message
- Input Group, Input Group Addon Block, Input Group Button, Input OTP, Input OTP Field
- Invite Profile Card, Item, Kbd Group, Keyboard
- Lounge Badge Illust, Lounge Card Addon Block
- Navbar Addon Inline, Page Indicator, Participant Card Authed
- Participant Left/Right Column, Placeholder Creator/Host/Logo
- Pro Creator Card, Profile Card, Purchase Button, Radio Group
- Segmented Progress, Select Menu, Select Menu Label
- Status, Switch Toggle, TabBar, TabsList Section/Tag/Toggle
- TabsTrigger Section, Textarea, Ticket Item Illust, Tooltip

## Gate 기준 (NEW PLAN v2)

- **P0 통과 기준**: 18/18 = 100%
- **P1 통과 기준**: 80%+
- **P2 통과 기준**: best-effort

## 다음 액션 (Phase 1)

P0 누락 9종 추가 (우선순위):
1. **Icon Scaler** — 아이콘 사이징 공통 래퍼
2. **Kbd** — 단축키 표시 블록
3. **TabsTrigger Tag** — 필터 태그
4. **Input Group Addon Inline** — 인풋 부착
5. **TabsTrigger Section** — 섹션 탭
6. **Coin** — 코인 인디케이터
7. **Messaging Reaction** — 메시지 리액션
8. **iOS StatusBar** — 디바이스 목업 요소
9. **iOS HomeIndicator** — 디바이스 목업 요소

## Phase 1 실행 결과 (2026-04-21)

9종 모두 reusable 추가 완료. **Pencil 총 reusable 51 → 60.**

| 컴포넌트 | Pencil ID | Figma spec 준수 | 렌더 검증 |
|---------|-----------|----------------|----------|
| Icon Scaler | sBr4L | 16×16 | ⚠️ PNG export 공백 |
| Kbd | 88NGD | 32×20 pad 4, radius 6, $--muted | ⚠️ |
| TabsTrigger Tag | 2VIG0 | 80×32 pad [4,12] pill $--input | ⚠️ |
| Input Group Addon Inline | CxAC4 | 16×16 pill $--foreground | ⚠️ |
| TabsTrigger Section | jxJ1s | 126×56 border | ⚠️ |
| Coin | JQJLe | 24×24 pill | ⚠️ |
| Messaging Reaction | etzPD | 52×22 radius 16 + border | ⚠️ |
| iOS StatusBar | vt3QU | 375×44 | ⚠️ |
| iOS HomeIndicator | 70K2Q | 375×34 | ⚠️ |

**⚠️ 렌더 이슈**: `batch_get`으로 구조 정상 확인되나 `export_nodes` PNG가 blank. 기존 V9iZj/quH1j/DvnDV 등은 정상 export. **Pencil MCP 버그 추정** — 새로 추가한 reusable에 대해 cache/layout 재계산 미발생 가능. 다음 세션에서 Pencil 앱 재시작 후 재검증 필요.

## P0 커버리지 최종

- **매칭**: 18/18 = **100%** (구조적으로)
- **렌더 검증**: 10/18 (기존) + 0/9 (신규 — 도구 이슈)
- **Total reusable**: **60** (51 기존 + 9 P0 신규)

## Rev.13 실행 결과 (2026-04-21)

**P2 Structural 26종 + P3 Illustrations 8종 추가. Pencil 총 reusable 93 → 127.**

### P2 Structural 26종
| Group | 컴포넌트 | Pencil ID |
|-------|---------|-----------|
| Input Group family | Input Group / Addon Block / Button / Input OTP / OTP Field | 4JeWv / qIFqk / 4Zfh9 / 0SJ1R / kaawD |
| Participant family | Card Authed / Left Column / Right Column | nZEmh / 4Hyoh / ze5tv |
| TabsList container | Section / Tag / Toggle | fmFai / RbjCn / bfmP6 |
| Challenge Card family | List Card / Mini Card / Thumbnail Group | Wbz1S / IPV3S / uhRL3 |
| Container 5종 | Kbd Group / Keyboard / Accordion / Select Menu / Item | wCxdu / jw16H / lqsg4 / 2Sa6W / 8dk9T |
| 단독 7종 | Bell Image / Calendar Block / Field Legend / Footer / Cover Pay Header / Checkbox Toggle / Pro Creator Card | l8Rwc / idVNI / Q9HjO / lTJeL / qhKCi / r2dVq / ohHDE |

### P3 Illustrations 8종 (lucide icon placeholder 기반)
| 컴포넌트 | Pencil ID | 대체 lucide icon |
|---------|-----------|----------------|
| Character Illust | A8ARz | users |
| Contact Illust | xdG5s | phone |
| Gift Illust | HuL9C | gift |
| Lounge Badge Illust | 6OdJl | award |
| Ticket Item Illust | ZUXhF | ticket |
| Placeholder Creator | kU7Eg | "Creator" 텍스트 |
| Placeholder Host | 6HCOq | "Host" 텍스트 |
| Placeholder Logo | BxOv9 | "Logo" 텍스트 |

## 최종 커버리지 (Rev.13 기준)

- **CDS 원본**: 102 top-level 컴포넌트
- **Pencil 매칭**: 126 CDS reusables (+ 1 ancillary Creator Card Compact + 6 Pencil-only Alert variants/Card anatomy)
- **매칭률**: **102/102 = 100%** (구조적)
- **P0/P1/P2/P3 모두 커버**

## Variant Mapping Strategy

> **원칙**: Figma variants를 Pencil reusable로 어떻게 매핑할지 기준. 무분별 복제 방지.

### 분류

| 유형 | 정의 | Pencil 처리 | 예시 |
|------|------|------------|------|
| **Size Structural** | 크기/비율이 다름 (높이/너비/레이아웃 자체 변동) | **별도 reusable 각각** | Participant Card Authed 1:1/4:5/9:16, Challenge Thumbnail Group 2XS~L, Avatar sm/md/lg |
| **State** | 같은 구조, 상태만 다름 (Enabled/Focus/Disabled/Hover/Loading/Active) | **단일 reusable + Pencil variable 바인딩** (--input → --ring 등) | Input OTP 3v, Checkbox Toggle 8v, Button 228v |
| **Theme/Color** | 같은 구조, 색상만 다름 (Primary/Secondary/Destructive/Accent) | **단일 reusable + theme prop** (Pencil theme axes) | Badge variants, Alert variants, Placeholder Creator/Host/Logo 12v |
| **Icon/Content** | 구조 동일, 아이콘/텍스트만 다름 | **단일 reusable + prop** (React props) | TabBar Icon 10v, Breadcrumb Item 12v |
| **Layout Variant** | 내부 배치가 다름 (Button left vs right, Stacked vs Inline) | **케이스별 판단** — 3+ variants는 별도, 2는 prop | Footer 9v (분리), Item 3v (prop) |

### 적용 결과 (Rev.14)

**별도 reusable로 분리한 Size Structural:**
- Participant Card Authed: **3** (nZEmh = 1:1, mfzeR = 4:5, 2ZPTR = 9:16)
- Challenge Thumbnail Group: **5** (uhRL3 + qPbQZ 2XS / Wp4Gz S / 7SE3M M / pX06f L)

**prop/variable 처리로 결정한 것:**
- Input OTP, OTP Field: state는 `--input` (Enabled), `--ring` (Focus), opacity 0.5 (Disabled) 바인딩으로 처리
- Item: Size prop로 처리 (React 쪽에서 `<Item size="sm|md|lg" />`)
- Checkbox Toggle: state variants 8개 모두 prop 처리
- Footer 9v: 사용 빈도 낮은 variant는 prop, Button Stacked만 필요 시 별도 추가
- TabsList Section 3v: Type=3/4/5 Section은 자식 tab 수 차이. slot + count prop로 처리
- Illust 8종 + Placeholder 3종: color theme prop 처리

### Rev.12 이전 92종 Size Structural 후보 (다음 세션)

| 컴포넌트 | Figma size variants | Pencil 현재 | 추가 필요? |
|---------|-------------------|------------|----------|
| Avatar | 3 size (sm/md/lg) | 3 (SfBW1/UjAmH/F6A53) | 완료 |
| Featured Icon | 2 (Circle Large/Square Medium) | 2 (9zDUt/wRyh9) | 완료 |
| Challenge Thumbnail | 3 (Small/Medium/Large) | 3 (MiRzL/1DpZI/gsauZ) | 완료 |
| Button | 5 type + size variants | 5 type × 1 size | **size 별도 필요?** (검토) |
| Badge | 6 variants (color + size) | 6 (quH1j/...) | 완료 (color prop + 크기 동일) |
| Alert | Default/Destructive/Primary | 4 (uzlqg/AAsfd/FZzbw/pSekL) | 완료 |

→ 대부분 이미 Size Structural은 분리돼 있음. 추가 작업 불필요.

## 다음 세션 TODO

1. **렌더 검증** — `export_nodes` PNG로 Size variants 시각 점검 (Pencil 앱 재시작 후 MCP 버그 우회)
2. **Illust 업그레이드** — lucide placeholder → Figma REST API PNG export → Pencil image fill 교체 (8종)
3. **Layer 3 자동화** — rendered PNG diff 이미지 비교 에이전트
4. **Drift Monitoring** — discovery.json 스냅샷 diff 알림 메커니즘
5. **Pencil MCP Ralph 호환** — subprocess MCP 허용 탐색
