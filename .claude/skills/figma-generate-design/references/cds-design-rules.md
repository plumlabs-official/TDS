# CDS Design Rules — figma-generate-design 오버레이

> 이 파일은 공식 figma-generate-design Skill의 Step 2~4에서 참조됩니다.
> SSOT: `.claude/rules/naming-policy.md` v2.0 + `.claude/rules/qa-rubric.md` v1.1

## CDS 라이브러리 정보

- **fileKey**: `H36eNEd6o7ZTv4R7VcyLf2`
- **planKey**: `team::1496396157731103008`
- `search_design_system`에서 `includeLibraryKeys` 사용 시 위 fileKey로 CDS 전용 검색 가능

## 네이밍 규칙 (naming-policy v2.0)

### 케이싱
- 레이어명: **Title Case 공백** (`Chat Area` O, `chatArea` X)
- 컴포넌트 Display Name: **Title Case 공백** (`Alert Dialog`)
- Variant Property Key: **camelCase** (`size`, `showIcon`)
- Variant Property Value: **lowercase** (`default`, `sm`)

### 네이밍 공식
```
[컨텍스트] [역할]
```
- 역할 1개 → 역할만: `Header`, `Footer`
- 역할 2개+ → 컨텍스트 추가: `Chat Header`, `Profile Header`

### 래퍼 프레임 우선순위
1. 역할명만: `Header`, `Footer`, `Sidebar`, `Form`, `Body`
2. `[컨텍스트] Area`: `Input Area`, `Bottom Area`
3. `[컨텍스트] Group`: `Card Group`, `Avatar Group` (동종 반복)

### 금지 접미사
`Container`, `Wrapper`, `Content` (래퍼), `Box`, `View`, `Div`

### 허용 역할 어휘
`Screen`, `Body`, `Header`, `Footer`, `Section`, `Area`, `Sidebar`, `Scroll Area`, `List`, `Grid`, `Navbar`, `Tab Bar`, `Input`, `Form`, `Card`, `Group`

### 텍스트 노드
`Title`, `Description`, `Label`, `Subtitle`, `Caption`, `Value`

### 이미지 노드
`[컨텍스트] [유형]` — 유형: `Image`, `Thumbnail`, `Avatar`, `Banner`, `Icon`, `Illustration`

## shadcn 컴포넌트 매핑

CDS는 shadcn/ui 기반. 스크린 생성 시 아래 컴포넌트를 `search_design_system`으로 찾아 인스턴스 사용:

```
Accordion, Alert, Alert Dialog, Aspect Ratio, Avatar, Badge, Breadcrumb,
Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Combobox,
Command, Context Menu, Data Table, Date Picker, Dialog, Drawer,
Dropdown Menu, Form, Hover Card, Input, Input OTP, Label, Menubar,
Navigation Menu, Pagination, Popover, Progress, Radio Group, Resizable,
Scroll Area, Select, Separator, Sidebar, Skeleton, Slider, Sonner,
Switch, Table, Tabs, Textarea, Toast, Toggle, Toggle Group, Tooltip
```

**레거시명 매핑**: `Sheet` → `Drawer`

## 아이콘
- **Lucide 인스턴스 필수** — 인라인 SVG 금지
- 아이콘 세트 혼용 금지 (Lucide 외 사용 금지)
- 이름: Lucide 공식명 Title Case (`Chevron Right`, `Arrow Left`)

## Auto Layout 패턴

- 모바일 Screen: column AL + `First on top`
- Status Bar: sticky (고정 높이)
- Body: fill + scroll-y
- 중첩 깊이 3단계 이하 권장 (5+ = Major 감점)

## 토큰 바인딩

- 색상/타이포/이펙트는 반드시 CDS 변수 바인딩
- 하드코딩 hex/px 금지 (변수가 있는 경우)
- `setBoundVariable` / `setBoundVariableForPaint` 사용
