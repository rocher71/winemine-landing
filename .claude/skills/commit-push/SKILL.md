---
name: commit-push
description: "변경사항을 git commit하고 GitHub에 push한다. '커밋해줘', '푸시해줘', 'commit', 'push', '저장해줘', '배포 준비해줘', '깃에 올려줘' 요청 시 반드시 이 스킬을 사용. 커밋 메시지 자동 생성, 변경 파일 요약, push까지 한 번에 처리."
---

# Commit & Push Skill

변경사항을 확인하고 의미 있는 커밋 메시지를 작성한 뒤 GitHub에 push한다.

## 워크플로우

### Step 1: 현재 상태 파악

```bash
# 변경된 파일 확인
git status --short

# 변경 내용 확인 (staged + unstaged)
git diff --stat HEAD
```

변경 파일이 없으면: "커밋할 변경사항이 없습니다." 안내 후 종료.

### Step 2: i18n 동기화 체크

변경 파일 중 번역에 영향을 주는 파일이 있는지 확인한다.

**번역 영향 파일이란:**
- `src/messages/ko.json` 또는 `src/messages/en.json` 직접 수정
- `src/components/**/*.tsx`, `src/app/**/*.tsx` — UI 텍스트 변경 가능성

**체크 방법:**

```bash
# 번역 관련 파일이 변경됐는지 확인
git diff --name-only HEAD | grep -E '(messages/|\.tsx$|\.ts$)'
```

변경된 파일이 있으면 다음을 수행한다:

1. **`ko.json`만 변경된 경우** → `en.json`에 동일 키가 있는지 확인하고 없으면 영어 번역 추가
2. **`en.json`만 변경된 경우** → `ko.json`에 동일 키가 있는지 확인하고 없으면 한국어 번역 추가
3. **`.tsx` 파일에 새 하드코딩 텍스트가 생긴 경우** → 해당 텍스트를 `ko.json`과 `en.json` 양쪽에 추가하고 컴포넌트에서 `t()` 또는 `messages.*`로 교체

**동기화 규칙:**
- `ko.json`과 `en.json`의 **최상위 키 목록이 일치**해야 한다
- 배열의 **길이와 인덱스**가 일치해야 한다
- 새 키 추가 시 **양쪽 파일 동시에** 업데이트

**체크 명령어:**
```bash
# 두 파일의 최상위 키 비교 (node 필요)
node -e "
const ko = require('./src/messages/ko.json');
const en = require('./src/messages/en.json');
const koKeys = Object.keys(ko).sort();
const enKeys = Object.keys(en).sort();
const missing = koKeys.filter(k => !enKeys.includes(k));
if (missing.length) console.log('en.json 누락 키:', missing);
else console.log('i18n 동기화 OK');
"
```

동기화 문제가 발견되면 **커밋 전에 반드시 수정**한다. 수정 후 Step 3으로 이동.

---

### Step 3: 변경사항 분류

변경 파일 목록을 보고 커밋 타입을 결정한다:

| 타입 | 언제 |
|------|------|
| `feat` | 새로운 기능, 새 컴포넌트, 새 섹션 추가 |
| `fix` | 버그 수정, 오류 수정 |
| `style` | 색상, 폰트, 레이아웃 등 시각적 변경 |
| `refactor` | 기능 변경 없이 코드 구조 개선 |
| `perf` | 성능 개선 (애니메이션, 번들 크기 등) |
| `chore` | 설정 파일, 의존성, 빌드 관련 |
| `docs` | 문서, README, CLAUDE.md 변경 |

### Step 3: 커밋 메시지 작성 규칙

```
{타입}: {한 줄 요약 (한국어 가능, 50자 이내)}

{필요시 상세 설명 (72자 줄바꿈)}
```

**좋은 예:**
```
feat: 프랑스 와인 지역 드릴다운 섹션 추가
fix: 세계지도 와인 국가 ISO 코드 매핑 수정
style: 히어로 섹션 타이틀 WineMine 대소문자 변경
chore: Next.js 15.3.0 → 15.5.15 보안 업그레이드
```

**나쁜 예:** "update", "fix stuff", "changes", "수정"

### Step 5: Staging & Commit

```bash
# 모든 변경사항 스테이징 (새 파일 포함)
git add -A

# 커밋 (HEREDOC 사용 — 특수문자 안전)
git commit -m "$(cat <<'EOF'
{타입}: {요약}

{상세 설명 (선택)}
EOF
)"
```

**CRITICAL: 절대 커밋하면 안 되는 파일들**
- `.env.local`, `.env.*.local` → .gitignore에 있어야 함
- API 키, 비밀번호, 토큰이 포함된 파일
- `node_modules/`, `.next/`

커밋 전 `git status`로 민감한 파일이 스테이징됐는지 반드시 확인.

### Step 6: Push

```bash
# 첫 push (원격 저장소 등록 후)
git push -u origin main

# 이후 push
git push
```

push가 실패하면:
- **rejected (non-fast-forward)**: `git pull --rebase` 후 재시도
- **원격 저장소 없음**: 사용자에게 GitHub 레포 URL 요청

### Step 7: 완료 보고

```
✅ 커밋 완료
- 커밋: {commit hash 7자}
- 메시지: {커밋 메시지}
- 변경: {파일 수}개 파일 (+{추가줄} / -{삭제줄})
- Push: origin/main ✓
```

## 원격 저장소 미설정 시

`git remote -v` 결과가 비어있으면:

```
⚠️ GitHub 원격 저장소가 연결되지 않았습니다.

다음 단계를 따라 연결해주세요:
1. https://github.com/new 에서 새 레포 생성 (이름: winemine)
2. 아래 명령어 실행:
   ! git remote add origin https://github.com/{본인ID}/winemine.git
   ! git push -u origin main
```

## 선택적 동작

- **메시지 직접 지정**: "커밋 메시지 'feat: 히어로 수정'으로 커밋해줘" → 해당 메시지 그대로 사용
- **특정 파일만**: "src/components만 커밋해줘" → 해당 경로만 `git add`
- **커밋만 (push 제외)**: "push 없이 커밋만 해줘" → Step 5 건너뜀
