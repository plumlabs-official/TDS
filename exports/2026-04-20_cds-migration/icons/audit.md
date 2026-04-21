# Icon Audit — Pencil 기존 컴포넌트 아이콘 검증

- **날짜**: 2026-04-21
- **대상**: 76 reusables의 iconFontName 사용 현황
- **기준**: mapping.json

## 사용 중 lucide icons (Pencil 현재)

| iconFontName | 위치 | Mapping status |
|-------------|------|----------------|
| arrow-left/right | Button (4), Kbd | ✓ direct |
| plus | Button-Icon | ✓ direct |
| search | Input, Home Feed | ✓ direct |
| info | Alert | ✓ direct |
| check | Checkbox, Drawer Item, Icon Scaler, Input Addon, Select Menu Item, Featured Circle | ✓ direct |
| chevron-down | Select, Accordion, Dropdown Trigger | ✓ direct |
| chevron-left | Navbar | ✓ direct |
| user | Dropdown Menu | ✓ direct |
| settings | Dropdown Menu | acceptable (CDS 미사용이지만 공통 icon) |
| log-out | Dropdown Menu | acceptable |
| play | CMC Thumbnail | Remix play-fill 1 → lucide play 매핑 |
| volume-2 | CMC Thumbnail | ✓ direct |
| crown | CMC Meta | ✓ direct |
| timer | CMC Meta | acceptable |
| x | Sheet/Alert Close | Lucide cross → x 매핑 |
| menu | Sheet/Dialog Header | Huge menu-01 → lucide menu 매핑 |
| star | Featured Square | Lucide star-filled → star 매핑 (fill로 filled 표현) |
| ellipsis | Navbar | ✓ direct |
| hand-helping | Nudge | custom icon, acceptable |
| circle-dollar-sign | Coin | T5 ticket accepted (CDS image asset) |
| flame | Fire | Huge ai-magic → sparkles? 아니 Fire는 별도. Lucide flame ✓ |
| signal, wifi, battery-full | iOS StatusBar | ✓ direct |
| house | TabBar Icon | 'home' → 'house' 교체 완료 (Lucide 네이밍) |
| heart | Lounge Card reactions | ✓ direct |
| users | Lounge Card Addon | ✓ direct |
| sparkles, badge-check, compass, flag, message-circle, trending-up | Creator Curation Home 화면 구성 | ✓ direct |

## 이슈 종합

- **수정된 icon**: `home` → `house` (lucide 네이밍 규칙) — Step B B3에서 처리
- **수정된 icon**: `more-horizontal` → `ellipsis` — Rev.9 중 처리
- **T5 accepted**: Coin custom image → lucide `circle-dollar-sign` 근사

## 미지원 icon 세트 대응

CDS에는 Lucide 외에 Tabler/Huge/Phosphor/Remix 혼용. Pencil icon_font는 lucide + phosphor 지원.

| CDS 세트 | Pencil 전략 | 예시 |
|---------|-----------|------|
| Lucide Icons / * | direct (`family: lucide`) | arrow-right, check 등 |
| Phosphor Icons / * | native (`family: phosphor`) | chat-centered-dots, question, bell |
| Tabler Icons / * | Lucide 근사 매핑 | pencil-plus → pencil-line |
| Huge Icons / * | Lucide 근사 매핑 | menu-01 → menu, ai-magic → sparkles |
| Remix Icons / * | Lucide 근사 매핑 | play-fill 1 → play |

## Gate 판정

| Gate | 기준 | 결과 |
|------|------|------|
| C1 | 아이콘 인벤토리 (99 unique) | PASS |
| C2 | 매핑 테이블 (mapping.json 48건) | PASS |
| C3 | Pencil 기존 아이콘 매핑 검증 (76 reusables) | PASS |
| C4 | QA tickets 문서화 | PASS |

**Step C PASS**
