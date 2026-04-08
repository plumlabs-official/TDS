# Slot → Instance Swap 전환 분석 + Icon Scaler 사용처

> 날짜: 2026-04-08 | 분석 대상: TDS 라이브러리 (`H36eNEd6o7ZTv4R7VcyLf2`)

---

## 1. Slot → Instance Swap 전환 후보

기준: **항상 단일 인스턴스 1개만 포함** (아이콘, 버튼, 아바타 등 1:1 교체 가능)

### 전환 권장 (단일 인스턴스 100%)

| # | 컴포넌트 | Slot | 기본 콘텐츠 | 이유 |
|---|---------|------|-----------|------|
| 1 | Tooltip | ↳ Left Slot | Icon Scaler | 아이콘 1개 |
| 2 | Badge | ↳ Left Slot | Lucide icon | 아이콘 1개 |
| 3 | Badge | ↳ Right Slot | Lucide icon | 아이콘 1개 |
| 4 | Status | Icon Slot | Fire emoji | 아이콘 1개 |
| 5 | Profile Card | ↳ Icon Slot | Icon Scaler | 아이콘 1개 |
| 6 | Challenge Talk Card | ↳ Left Slot | Lucide icon | Badge 내부 아이콘 |
| 7 | Challenge Talk Card | ↳ Right Slot | Lucide icon | Badge 내부 아이콘 |
| 8 | Updates Card | ↳ Thumbnail Slot | Avatar | 아바타/썸네일 1개 |
| 9 | Updates Card | ↳ Left Slot | Lucide icon | Badge 내부 아이콘 |
| 10 | Updates Card | ↳ Right Slot | Lucide icon | Badge 내부 아이콘 |
| 11 | Pro Creator Card | ↳ Left Slot (×2) | Lucide icons | Badge 내부 아이콘 |
| 12 | Pro Creator Card | ↳ Right Slot (×2) | Lucide icons | Badge 내부 아이콘 |
| 13 | Challenge List Card | ↳ Left Slot (×2) | Lucide / Icon Scaler | Badge 내부 아이콘 |
| 14 | Challenge List Card | ↳ Right Slot (×2) | Lucide icons | Badge 내부 아이콘 |
| 15 | Challenge Day Progress | ↳ Left Slot | Lucide clock | 아이콘 1개 |
| 16 | Challenge Day Progress | ↳ Right Slot | Lucide check | 아이콘 1개 |
| 17 | Challenge Mission Card Thumbnail | ↳ Left/Right Slot (×4) | Lucide icons | Badge 내부 아이콘 |

### 전환 가능하나 주의 필요

| # | 컴포넌트 | Slot | 기본 콘텐츠 | 비고 |
|---|---------|------|-----------|------|
| 18 | Content Header | ↳ Right Slot | Button | 버튼 교체는 유용하나, 향후 복합 액션 가능성 |
| 19 | Profile Card | ↳ Right Slot | Button | 동일 |
| 20 | Alert | ↳ Left Slot | Avatar | 아바타 교체 |
| 21 | Alert | ↳ Right Slot | Button | 버튼 교체 |
| 22 | Alert | ↳ Bottom Slot | Status | Status 교체 |
| 23 | Participant Card | ↳ Left Slot, Host Slot, ↳ Right Slot, Icon Slot | Icon/Button | 4개 모두 단일 인스턴스이나 구조 복잡 |
| 24 | Item (Context Menu) | ↳ Slot Left | .Item Media | 미디어 교체 |
| 25 | Item (Context Menu) | ↳ Slot Right | Button | 버튼 교체 |

### Slot 유지 (자유 콘텐츠)

| 컴포넌트 | Slot | 이유 |
|---------|------|------|
| Navbar | ↳ Left Slot | TEXT 노드 (인스턴스 아님) |
| Card | ↳ Slot | 빈 slot — 자유 콘텐츠 영역 |
| Drawer | ↳ Slot | 빈 slot — 자유 콘텐츠 영역 |
| Item | Description Slot | TEXT 노드 |
| Updates Card | ↳ Content Slot | 복합 프레임 (Title + Description) |
| Challenge Mission Card Thumbnail | ↳ Attendee Slot | 복합 (Avatar Group + Count) |
| Segmented Progress | Bar/Point Slot | 복합 구조 프레임 |
| Accordion Item | ↳ Accordion Item Slot | 자유 콘텐츠 |

---

## 2. Icon Scaler 사용처

### 컴포넌트 개요

- **노드**: `20153:1318` (COMPONENT_SET)
- **역할**: Lucide 아이콘 크기 조절 래퍼 (Size variant + Icon Swap)
- **Size variant**: 16, 20(Size6), 24, 28, 32, 36

### 사용처 (20개 컴포넌트, ~150 인스턴스)

| # | 컴포넌트 | 수 | Size | 용도 |
|---|---------|-----|------|------|
| 1 | Segmented Progress | 44 | 16 | Segment Point 아이콘 |
| 2 | .Participant Card + Left/Right Slot | 42 | 16 | Host/Icon Slot 아이콘 |
| 3 | Dropdown Menu | 18 | 16 | Menu Item 좌측 아이콘 |
| 4 | Challenge Mission Card | 12 | 16/24 | Badge 아이콘 + Icon Slot |
| 5 | TabsList Tag | 9 | 16 | 탭 아이콘 |
| 6 | .Participant Card Left/Right Slot | 12 | 16 | Host/Icon Slot |
| 7 | Challenge Day Progress | 4 | 16 | Segment Point |
| 8 | .Dropdown Menu Item | 4 | 16 | Icon variant |
| 9 | Challenge List Card | 3 | 16/24 | Badge + Attendee + Rating |
| 10 | TabsTrigger Tag | 2 | 16 | 탭 아이콘 |
| 11 | Profile Card | 2 | 16 | ↳ Icon Slot |
| 12 | Invite Profile Card | 2 | 16 | .Invite Item |
| 13 | .Challenge Mission Card Header | 2 | 24 | Icon Slot |
| 14 | Item (Context Menu) | 1 | 16 | ↳ Slot Left |
| 15 | Challenge Mission Card Thumbnail | 1 | 16 | Badge |
| 16 | .Invite Item | 1 | 16 | 내부 |
| 17 | Cover Pay Header | 1 | 16 | 아이콘 |
| 18 | Challenge Talk Card | 1 | 16 | Attendee |
| 19 | Pro Creator Card | 1 | 16 | Attendee |

### Size 분포

| Size | 사용 비율 | 비고 |
|------|----------|------|
| 16 | ~90% | 대다수 |
| 24 | ~10% | Challenge Mission Card Header, Challenge List Card |
| 28/32/36/Size6 | 0% | TDS 내부 사용 없음 |

### 관찰

- Size 16이 압도적. 28/32/36/Size6 variant은 TDS 내에서 미사용
- `Size6` 네이밍 미정리 (실제 20px)
- description 없음
- Lucide 아이콘 자체가 리사이즈 가능하므로 래퍼 필요성 검토 가능
