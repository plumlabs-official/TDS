# RECIPES

> AI용 워크플로우 - 링크 중심, SSOT 복사 금지
>
> Last updated: 2026-03-17

---

## 빌드 명령어

```bash
# 플러그인 빌드
npm run build

# 플러그인 watch 모드
npm run watch
```

---

## 디버깅

```bash
# 플러그인 콘솔
Figma > Plugins > Development > Open Console
```

---

## 커밋 형식

```
<type>: <한글 요약>

- 상세 내용

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## 체크리스트

### PR 전
- [ ] `npm run build` 성공
- [ ] Figma 플러그인 테스트 완료

### 버그 수정 후
- [ ] `docs/architecture/lessons-learned.md` 패턴 추가
