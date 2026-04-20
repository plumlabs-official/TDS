# Claude Design 파일 업로드/레퍼런스 메커니즘 조사

> 생성일: 2026-04-20 | 신뢰도: 82% | 소스: 11개 | 라운드: 1/1
> 상위 리포트: `2026-04-20_claude-design-launch-research.md` (갭 보완)

## Executive Summary

> **재현의 증상 원인 판정**: "프로덕트 하이파이 디자인과 어긋남"은 **의도된 한계**로 판단됨. 현재(2026-04) 공식 지원 범위는 `.fig`에서 **색/타이포/컴포넌트 패턴을 추출해 "Design System 표현"으로 저장**하는 것뿐이며, 인스턴스 사용 패턴(레이아웃 컨벤션, 배치 관례)은 저장되지 않음. 하이파이 프로덕트 `.fig`를 추가로 업로드해도 **제한적 효과**만 예상되며, 오히려 **스크린샷 이미지 묶음으로 "make it look like this" 레퍼런스**를 주거나 **Figma MCP 경로로 전환**하는 것이 실무 해답에 가깝다.

---

## Q1. `.fig` 업로드 목적 구분 (공식 문서 vs 실무자 보고)

### 공식 Anthropic 문서 입장
Anthropic `support.claude.com`의 [Set up your design system](https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design) 페이지는 `.fig`나 "Figma"라는 단어 자체를 **명시하지 않음**. 열거된 업로드 대상은:
- Codebases (React 라이브러리 등 링크/업로드)
- Prototypes: "screenshots, web flows, and **existing design files**"
- Slide decks, PDF, 개별 브랜드 자산(로고/팔레트/타이포그래피)

`.fig`는 "existing design files" 문구로 **암묵적 포함**으로 해석되며, 업로드 시 "design-system representation"(요약본)으로 변환되어 저장. 원본은 Anthropic 서버에 저장되지 않음 (공식 프라이버시 고지).

### 실무자 보고 (비공식, B-C 신뢰도)
- **Push To Prod 블로그**: "`.fig` files directly from Figma" 지원 테스트 확인 — macOS 디자인 시스템 업로드 후 시각 언어 자동 상속 성공
- **rohitg00/awesome-claude-design** (GitHub): "drag `.fig` in chat → extract tokens" 가능하지만 **"multi-file libraries hit-or-miss at launch"** 경고
- **CopyRocket AI**: `.fig` exports가 "color/typography extraction"에 쓰인다고 명시

### 판정
- **DS 파일 vs 레퍼런스 파일 구분 슬롯은 공식적으로 존재하지 않음** (Organization > Design System 설정 vs 채팅 첨부의 암묵적 구분만 존재)
- **한 세션에 여러 파일 업로드는 가능**: Claude.ai 일반 규격(파일 30MB, 대화당 20파일)이 Claude Design에도 적용. 단, 여러 `.fig` 동시 업로드 시 파싱 안정성은 "hit-or-miss"로 보고됨
- **`.fig` 업로드의 실질 효과는 "토큰 추출"**: 컴포넌트 anatomy나 인스턴스 사용 패턴은 추출되지 않는 것으로 보임 (미검증 가설)

---

## Q2. 입력 형식 옵션별 용도

| 형식 | 공식 지원 | 용도 | 신뢰도 |
|------|-----------|------|--------|
| 텍스트 프롬프트 | O | 기본 입력. "make it look like X" 서술 | A |
| 이미지 업로드 (PNG/JPG/GIF/WebP) | O | **"make it look like this" 레퍼런스 핵심** (공식 명시) | A |
| DOCX/PPTX/XLSX | O | 브랜드 스타일 가이드, 기존 덱 스타일 복제 | A |
| PDF | O | 스타일 가이드, 색/타이포 추출 | A |
| 코드베이스 (repo URL/ZIP) | O | **DS 추출의 1급 입력** — 토큰/컴포넌트 파싱 정확도 최고 | A |
| 웹 캡처(Web capture) | O | 라이브 사이트 요소 직접 수집 → 프로토타입이 "실제 제품처럼" | A |
| `.fig` 파일 | **△ 암묵** | 토큰/타이포 추출, 다파일 안정성 낮음 | B |
| Figma URL 붙여넣기 | X (Claude Design 내부) | — Claude Design은 Figma Connector 미지원. Figma MCP는 Claude Code에서 별도 사용 | A |

### 핵심: Figma MCP는 Claude Design 기능이 **아님**
Figma MCP/Plugin은 **Claude Code** 측 통합. Claude Design 자체에는 Figma 파일 직접 연결/동기화 기능 없음. `.fig` 업로드는 정적 스냅샷 1회성.

---

## Q3. 하이파이 디자인 참조 효과성

### 공식 가이던스
`support.claude.com`의 [Get started](https://support.claude.com/en/articles/14604416-get-started-with-claude-design)는 **명확한 역할 분리**를 제시:
- **조직 DS**: "colors, typography, components" — 프로젝트 자동 상속, 업로드 불필요
- **Reference materials**: "make it look like this" 용 — 스크린샷/경쟁사/와이어프레임/비주얼 영감

즉, **하이파이 프로덕트 스크린의 레퍼런스적 역할은 "외형 유사성" 신호**로 해석되도록 설계됨. 컴포넌트 조합 패턴이나 인스턴스 사용 컨벤션 학습은 공식 사양에 없음.

### 이미지 vs `.fig` 업로드 차이 (실무자 관찰)
| 입력 | 기대 효과 | 한계 |
|------|----------|------|
| **하이파이 스크린샷(PNG)** | 레이아웃/톤/배치 감각 유사 카피 | "외형 카피" 수준, 컴포넌트 일치 보장 없음 |
| **`.fig`** | 색/타이포/이름붙은 토큰 추출 | 인스턴스 사용 패턴/레이아웃 컨벤션 미반영 (미검증) |
| **코드베이스(React+Tailwind)** | 토큰+컴포넌트 구조 파싱 — 공식 1급 입력 | 디자인 화면 맥락(특정 화면 레이아웃) 없음 |

### 재현의 "어긋남" 원인 가설
현재 CDS `.fig` 라이브러리는 **컴포넌트 원본**만 담김. 사용 맥락(크리에이터 홈의 레이아웃 컨벤션, CDS 인스턴스 조합 관례)은 **프로덕트 파일 쪽**에 있음. Claude Design은 라이브러리 `.fig`를 "DS 추출"로만 쓰므로, 크리에이터 큐레이션 홈 시안 생성 시 "컴포넌트는 맞지만 배치가 낯선" 결과가 자연스러움.

---

## Q4. 베스트 프랙티스 (실무자 보고 + 공식 조합)

### 권장 워크플로우 (가중치 순)
1. **조직 DS 설정 선행** (공식 강조): 디자이너가 시간 들여 Organization > Design System을 직접 튜닝. 컴포넌트 "Needs work" 플래그로 반복 정제. 이후 모든 프로젝트 자동 상속.
2. **레퍼런스는 이미지 + 짧은 서술**: "이 캡처 3장의 레이아웃/정보 밀도/여백 감각을 따라라" + 하이파이 PNG 묶음 업로드. `.fig` 추가 업로드보다 **이미지 + 명시적 프롬프트가 더 확실**.
3. **코드베이스 연동**: 만약 CDS가 코드 라이브러리(React/Tailwind)로 내보내졌다면, 그 repo URL 연결이 `.fig`보다 컴포넌트 토큰 추출 정확도 높음.
4. **Low-fi → Hi-fi 2단계 프롬프트**: 공식 가이드는 와이어프레임 먼저, 그 위에 하이파이 적용 2-phase 권장.

### 하지 말 것
- 여러 `.fig` 파일을 한 번에 업로드해 "multi-file library" 구성 기대 — 2026-04 기준 불안정으로 보고됨
- `.fig` 하나만 업로드하고 레퍼런스 이미지 없이 "알아서 하이파이 맥락 맞춰달라" 프롬프트 — 인스턴스 사용 패턴 추론 어려움

---

## Q5. 대안 — Figma MCP + Claude Code 경로

### 경로 비교

| 축 | Claude Design + `.fig` | Figma MCP + Claude Code |
|----|-----------------------|-------------------------|
| 컴포넌트 **실제 인스턴스** 배치 | △ 외형 모사 | **O** (Sergei Chyrkov 블로그: "placing actual component instances from your library") |
| CDS 토큰 정확 바인딩 | △ 추출 기반 | **O** (boundVariables 직접 조회) |
| 사용 맥락 반영 (인스턴스 사용 컨벤션) | X | **O** (`get_design_context`로 기존 화면 참조 가능) |
| 비디자이너 접근성 | **O** (자연어 프롬프트) | △ (MCP 세팅 필요) |
| 반복 수정/슬라이더 | **O** | X (Figma 내 직접 편집) |
| 재현 상황 적합도 | 낮음 (증상의 원인) | **높음** |

### 판단
재현이 원하는 것이 **"CDS 인스턴스가 실제 사용 패턴대로 배치된 크리에이터 큐레이션 홈"**이라면, 현재 문제는 Claude Design에 `.fig`를 추가 업로드해 해결할 성격이 아님. 기대 효과가 제한적이고 multi-`.fig` 안정성도 미확인.

**권장 방향:**
- **탐색/아이디어 단계**: Claude Design 유지 + 하이파이 스크린 **이미지** 묶음으로 레퍼런스 보강
- **실제 화면 양산 단계**: Figma MCP + Claude Code의 `/figma-generate-design` 워크플로우로 전환. CDS 라이브러리(`H36eNEd6o7ZTv4R7VcyLf2`) 연결 후 기존 프로덕트 파일(`t0SK7XaNqw8qIY3PpZw4s7`)의 유사 화면을 `get_design_context`로 불러 맥락 주입

---

## 모순점/미검증

| 주장 | 공식 | 실무자 | 판정 |
|------|------|--------|------|
| `.fig` 직접 업로드 지원 | 명시 없음("existing design files"만) | O (Push To Prod, awesome-claude-design) | **암묵적 지원. multi-file은 불안정** |
| 여러 `.fig` 동시 업로드 | 명시 없음 | "hit-or-miss" | **단일 파일만 신뢰 가능** |
| 인스턴스 사용 패턴 학습 | 언급 없음 | 반대 사례 (외형 카피에 그침) | **미지원으로 추정** |

### 미검증 (추가 조사 필요)
- `.fig` 업로드 시 실제로 어떤 데이터가 파싱되는지 (컴포넌트 name/variant/token까지? anatomy까지?) — Anthropic 공식 내부 스펙 비공개
- CDS 라이브러리 `.fig`에 IBM Plex Sans KR 바인딩이 Claude Design 내부 DS 표현에 반영되는지 여부
- Claude Design 내 "Organization Design System"이 `.fig` 업로드를 1급 입력으로 인정하는지 — 공식 가이드는 코드베이스를 1급으로 표현

---

## 결론 (재현 액션)

1. **지금 업로드된 `.fig`는 유지**. 추가 `.fig`(프로덕트 하이파이 파일) 업로드는 효과 제한 + multi-file 불안정 리스크 → **비추천**
2. **대안 1 (Claude Design 고수 시)**: 크리에이터 큐레이션 홈과 가장 가까운 기존 CDS 프로덕트 화면 **PNG 스크린샷 3-5장**을 채팅에 첨부 + "이 레이아웃 감각, 정보 밀도, 여백 컨벤션을 유지" 명시 프롬프트
3. **대안 2 (본격 양산)**: Figma MCP + Claude Code로 전환. CDS 라이브러리 + 기존 프로덕트 파일 모두 읽기 가능 → 인스턴스 실제 배치 생성

---

## Sources

| # | URL | 유형 | 신뢰도 | 검증 |
|---|-----|------|--------|------|
| 1 | [support.claude.com/.../14604397-set-up-your-design-system](https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design) | 공식 헬프 | A | WebFetch O |
| 2 | [support.claude.com/.../14604416-get-started-with-claude-design](https://support.claude.com/en/articles/14604416-get-started-with-claude-design) | 공식 헬프 | A | WebFetch O |
| 3 | [support.claude.com/.../14604406-admin-guide](https://support.claude.com/en/articles/14604406-claude-design-admin-guide-for-team-and-enterprise-plans) | 공식 헬프 | A | WebFetch O |
| 4 | [anthropic.com/news/claude-design-anthropic-labs](https://www.anthropic.com/news/claude-design-anthropic-labs) | 공식 블로그 | A | WebFetch O |
| 5 | [support.claude.com/.../8241126-uploading-files-to-claude](https://support.claude.com/en/articles/8241126-uploading-files-to-claude) | 공식 헬프 | A | WebFetch O |
| 6 | [getpushtoprod.substack.com/.../everything-you-need-to-know](https://getpushtoprod.substack.com/p/everything-you-need-to-know-about) | 실무자 블로그 | B | WebFetch O |
| 7 | [muz.li/.../getting-started-with-claude-design](https://muz.li/blog/getting-started-with-claude-design-a-collaborator-for-your-design-workflow/) | 전문 매체 | B | WebFetch O |
| 8 | [copyrocket.ai/i-tested-claude-design-on-my-real-brand](https://copyrocket.ai/i-tested-claude-design-on-my-real-brand) | 실무 리뷰 | B | WebFetch O |
| 9 | [github.com/rohitg00/awesome-claude-design](https://github.com/rohitg00/awesome-claude-design) | 커뮤니티 큐레이션 | B-C | WebFetch O |
| 10 | [sergeichyrkov.com/.../claude-code-design-system](https://sergeichyrkov.com/blog/how-to-generate-real-ui-designs-in-figma-using-claude-code-and-your-design-system) | 디자이너 블로그 | B | WebFetch O |
| 11 | [figma.com/blog/introducing-claude-code-to-figma](https://www.figma.com/blog/introducing-claude-code-to-figma/) | 공식 블로그 (상위 리포트 재참조) | A | 이전 검증 |

---
*Generated by /research — Deep Research Protocol (focused gap-fill)*
*Confidence: 82% | Sources: 11 | Gaps noted in 미검증 section*
