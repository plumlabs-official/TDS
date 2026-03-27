# TDS Rename Pipeline — 데이터 레퍼런스

> 자동 생성 금지 — 이 파일은 `rules.ts`에서 수동 동기화.
> SSOT: `figma-plugins/tds/src/modules/renamer/rules.ts`
> Last synced: 2026-03-27

## BANNED_SUFFIXES (6개)

```
Container, Wrapper, Content, Box, View, Div
```

## AUTO_GENERATED_PATTERNS (10개)

```regex
/^Text$/i
/^Frame\s*\d*$/i
/^Group\s*\d*$/i
/^Rectangle\s*\d*$/i
/^Ellipse\s*\d*$/i
/^Line\s*\d*$/i
/^Vector\s*\d*$/i
/^Component\s*\d*$/i
/^Instance\s*\d*$/i
```

## SPECIAL_CHARS_IN_NAMES

```regex
/[:\u2199\u2198\u2197\u2196↳↗↘↙]/
```

## ALLOWED_ROLES (16개)

```
Screen, Body, Header, Footer, Section, Area,
Sidebar, Scroll Area, List, Grid, Navbar, Tab Bar,
Input, Form, Card, Group
```

## TEXT_ROLES (6개)

```
Title, Description, Label, Subtitle, Caption, Value
```

## IMAGE_TYPES (6개)

```
Image, Thumbnail, Avatar, Banner, Icon, Illustration
```

## SHADCN_COMPONENTS (59개)

```
Accordion, Alert, Alert Dialog, Aspect Ratio, Avatar, Badge, Breadcrumb,
Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Combobox,
Command, Context Menu, Data Table, Date Picker, Dialog, Drawer,
Dropdown Menu, Form, Hover Card, Input, Input OTP, Label, Menubar,
Navigation Menu, Pagination, Popover, Progress, Radio Group, Resizable,
Scroll Area, Select, Separator, Drawer, Sidebar, Skeleton, Slider, Sonner,
Switch, Table, Tabs, Textarea, Toast, Toggle, Toggle Group, Tooltip
```

## DOMAIN_KEYWORDS (33개)

```
Challenge, Feed, Profile, Notification, Message, Chat, User, Friend,
Mission, Achievement, Ranking, Shop, Settings, Home, Search, Video,
Photo, Image, Comment, Like, Share, Bookmark, Calendar, Event, Badge,
Progress, Weekly, Daily, Auth, Invite, Onboarding, Payment, Reward, Streak
```

## KOREAN_LABEL_MAP (25개)

| 한글 | 영문 |
|------|------|
| 홈 | Home |
| 라운지 | Lounge |
| 마이페이지 | My Page |
| 챌린지 | Challenge |
| 피드 | Feed |
| 검색 | Search |
| 알림 | Notification |
| 설정 | Settings |
| 프로필 | Profile |
| 친구 | Friends |
| 미션 | Mission |
| 상점 | Shop |
| 랭킹 | Ranking |
| 업적 | Achievement |
| 더보기 | More |
| 확인 | Confirm |
| 취소 | Cancel |
| 다음 | Next |
| 이전 | Previous |
| 완료 | Done |
| 저장 | Save |
| 삭제 | Delete |
| 수정 | Edit |
| 닫기 | Close |
| 시작 | Start |

## LEGACY_NAME_MAP

| 레거시 | 현재 |
|--------|------|
| Sheet | Drawer |

## STRUCTURAL_LAYER_NAMES (30개)

| 키 | 값 |
|----|-----|
| header, hdr | Header |
| footer, ftr | Footer |
| body, content | Body |
| list | List |
| grid | Grid |
| nav, navigation | Navbar |
| sidebar | Sidebar |
| section | Section |
| area | Area |
| image, img | Image |
| icon | Icon |
| avatar | Avatar |
| thumbnail, thumb | Thumbnail |
| title | Title |
| subtitle | Subtitle |
| description, desc | Description |
| label | Label |
| caption | Caption |
| button, btn | Button |
| input, field | Input/Field |
| card | Card |
| badge | Badge |
| tab, tabs | Tab/Tabs |
| form | Form |
| action, actions | Action/Actions |
| status | Status |
| divider, separator | Divider/Separator |
| overlay | Overlay |
| background | Background |
| empty, placeholder | Empty/Placeholder |
| progress, indicator | Progress/Indicator |
| handle | Handle |

## 7단계 파이프라인

```
1. 한글 → 영문 (KOREAN_LABEL_MAP)
2. 금지 접미사 제거 (BANNED_SUFFIXES) → bannedRemoved = true
3. 슬래시 → 공백 (레이어명 전용, Variant 슬래시 제외)
4. PascalCase → Title Case (ChatArea → Chat Area)
5. toTitleCase (body → Body)
6. 특수문자 제거 (SPECIAL_CHARS_IN_NAMES)
7. 역할 접미사 추가 (bannedRemoved=true일 때만, Area/Group 중 적절한 것)
```

**멱등성 보장**: 2회 연속 실행 시 변경 0건이어야 함.
