# TDS OTP Validation UX 결정

- **Date:** 2026-03-10
- **Mode:** Team
- **Participants:** Design Director, Engineering Lead, Product Leader

## 안건

OTP 인증번호 6자리 입력 후 validation UX 결정:
- 옵션 A: "인증하기" 버튼 터치 → invalid면 모달/토스트
- 옵션 B: 6자리 입력 완료 즉시 자동 validation

## 결정

**옵션 B(자동 검증) 만장일치 채택**

### 근거
- Design Director: 태스크 완료 시간 2-3초 단축, 업계 표준 (카카오/토스/당근), 접근성 우수
- Engineering Lead: shadcn/ui `onComplete` 콜백 기본 제공, 구현 단순
- Product Leader: 온보딩 전환율 직결, RICE 평가 옵션 B 우세

### UX 플로우
1. 6자리 입력 완료 → 자동 API 호출 + 로딩 스피너
2. 성공 → 다음 화면 자동 전환
3. 실패 → FormMessage(Type=Fail) + 입력값 클리어 + 재입력 포커스
4. 3회 실패 → "다시 보내기" 유도
5. 5회 실패 → 쿨다운 30초

### 보안
- Rate limiting 필수 (brute force 방지)
- 5회 실패 → 쿨다운 30초 또는 재발송 강제

### TDS 컴포넌트 영향
- Input OTP: State=Destructive 유지 (실패 시 빨간 테두리)
- "인증하기" 버튼: 보조 수단으로 유지 (선택)
- FormMessage: OTP 아래 배치 (독립 컴포넌트로 준비 완료)
