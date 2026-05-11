---
name: new-worktree
description: "본체 세션을 건드리지 않고 깨끗한 새 git worktree에 의존성·.env까지 자동 세팅한 뒤 사용자가 지정한 작업을 그 안에서 실행한다. '새 worktree에서 …', 'worktree에서 작업해줘', '워크트리 만들어서 …', '격리해서 작업해줘', '새 브랜치 worktree로 …', '워크트리에서 …' 요청 시 반드시 이 스킬을 사용. 격리된 환경에서 코드 수정, 실험적 변경, 본체와 분리된 기능 개발을 한 번에 처리."
---

# New Worktree Skill

본체(현재 winemine 레포)의 작업 디렉토리·미커밋 변경을 그대로 두고, 별도 git worktree 폴더에 깨끗한 작업 공간을 만든 뒤 사용자가 요청한 작업을 그 폴더 안에서 실행한다.

## 워크플로우

### Step 1: 입력 파싱

사용자 메시지에서 다음 세 가지를 뽑아낸다.

| 항목 | 추출 방법 | 기본값 |
|------|----------|--------|
| **작업 내용 (A)** | "…해줘" 부분. worktree 생성 자체를 빼고 실제 할 일. | (필수, 없으면 사용자에게 다시 묻기) |
| **worktree 이름** | "X 이름으로", "X 라는 이름" 같은 명시. | 작업 내용에서 슬러그 자동 생성 (예: "i18n 동기화" → `i18n-sync`, "히어로 카피 수정" → `hero-copy`) |
| **베이스 브랜치** | "main에서", "dev에서", "현재 브랜치에서" | `main` |
| **브랜치 prefix** | 작업 성격에 따라 결정 (아래 표) | `chore` |

**브랜치 prefix 결정 표** (commit-push 스킬의 분류 재사용):

| prefix | 언제 |
|--------|------|
| `feat` | 새 기능, 새 컴포넌트, 새 섹션 추가 |
| `fix` | 버그 수정, 오류 수정 |
| `style` | 색상·폰트·레이아웃 등 시각 변경 |
| `refactor` | 기능 변경 없이 구조 개선 |
| `perf` | 성능 개선 |
| `chore` | 설정·의존성·빌드·번역 동기화 |
| `docs` | 문서, README, CLAUDE.md |

### Step 2: 사전 점검

```bash
# 본체 레포 루트 확인 (안전장치)
git rev-parse --show-toplevel

# 동일 경로/브랜치 충돌 점검
git worktree list
git branch --list <prefix>/<name>
```

- 경로 `../winemine-<name>` 가 이미 존재하면 → 다른 이름 요청.
- 브랜치 `<prefix>/<name>` 가 이미 있으면 → 다른 이름 요청.

또한 `.gitignore`에 `.env*`가 포함돼 있는지 한 줄로 확인:
```bash
grep -E '^\.env' .gitignore || echo "WARN: .env가 .gitignore에 없음"
```
경고가 뜨면 사용자에게 알리고 진행 여부 확인.

### Step 3: worktree 생성

```bash
git worktree add ../winemine-<name> -b <prefix>/<name> <base>
```

생성 직후 진행 상황을 사용자에게 한 줄로 알린다:
```
✓ ../winemine-<name> 생성 (브랜치: <prefix>/<name>, 베이스: <base>)
```

### Step 4: 환경 동기화

```bash
cd ../winemine-<name>

# 의존성 설치 — 시간이 걸리므로 사용자에게 먼저 알림
echo "npm install 중… (1~2분 소요)"
npm install

# .env.local 자동 복사 (사용자 합의된 동작)
if [ -f ../winemine/.env.local ]; then
  cp ../winemine/.env.local ./.env.local
  echo "✓ .env.local 복사"
fi

# 추가 .env 파일도 있으면 함께 복사
for f in .env .env.development .env.production; do
  if [ -f "../winemine/$f" ]; then
    cp "../winemine/$f" "./$f"
    echo "✓ $f 복사"
  fi
done
```

### Step 5: 검증 (가벼운 sanity check)

```bash
test -d node_modules && echo "deps OK" || echo "FAIL: node_modules 없음"
test -f .env.local && echo "env OK" || echo "WARN: .env.local 없음 (본체에도 없었음)"
```

`deps OK` 가 안 뜨면 즉시 중단하고 `npm install` 출력 마지막 부분을 사용자에게 보고.

### Step 6: 작업(A) 실행

이제 새 worktree(`../winemine-<name>`)를 **작업 디렉토리로 삼아** 사용자가 Step 1에서 요청한 작업 A를 수행한다.
- 모든 Read/Edit/Write/Bash는 이 폴더 기준.
- 본체 폴더(`/Users/yejinkim/Documents/git/winemine`)는 절대 건드리지 않는다.
- 작업 중 빌드·타입 검증이 필요하면 이 worktree 안에서 `npm run build` 또는 `npm run lint` 실행 (포트 없는 명령이므로 충돌 무관).

### Step 7: 완료 보고

```
✅ 새 worktree 세팅 + 작업 완료
- 경로: ../winemine-<name>
- 브랜치: <prefix>/<name>  (베이스: <base>)
- 의존성: 설치 완료
- env: .env.local 복사됨 (또는 "원본 없음")

작업 결과:
- (A 수행 내역을 1~3줄로 요약)
- 변경 파일: <개수>개

다음 단계:
- 변경 확인:  cd ../winemine-<name> && git status
- 커밋:       이 세션에서 "커밋해줘" → commit-push 스킬 (단, 본체 세션이라면 cd 필요)
- 정리:       git worktree remove ../winemine-<name>
```

## 주의사항

### 포트 충돌

본체에서 `npm run dev`가 돌고 있을 가능성이 높음 (기본 3000). 새 worktree에서 dev 서버를 띄울 일이 생기면 다른 포트로 안내:
```bash
PORT=3001 npm run dev
```

### 민감 파일 보호

- `.env.local`, `.env.*.local` 은 절대 커밋하지 않음. `.gitignore` 검증을 Step 2에 박아둔 이유.
- API 키·토큰이 들어간 파일이 새 worktree에 생기지 않도록 주의.
- 이 스킬은 **커밋을 만들지 않는다.** 커밋이 필요하면 작업 후 사용자가 `commit-push` 스킬을 따로 호출.

### 본체 미커밋 변경 처리

`git worktree add`는 워킹트리의 **미커밋 변경을 새 worktree로 끌고 가지 않는다.** 새 worktree는 항상 베이스 브랜치의 마지막 커밋 기준으로 깨끗하게 시작.

사용자가 "본체의 현재 변경 위에서 이어 작업하고 싶어"라고 하면 → 본체에서 먼저 `git stash` 또는 임시 커밋 후 worktree 생성 안내.

### 베이스 브랜치가 본체에 체크아웃돼 있을 때

`git worktree add … -b new-branch main` 처럼 새 브랜치를 만드는 경우는 문제 없음.
**동일한 기존 브랜치**를 두 worktree에서 체크아웃하려고 하면 Git이 거부함. 이 스킬은 항상 새 브랜치를 만들므로 해당 없음.

### 정리 (Cleanup)

작업 끝난 worktree는 사용자가 명시적으로 정리 요청할 때만 삭제:
```bash
git worktree remove ../winemine-<name>
```
브랜치까지 함께 삭제하려면:
```bash
git branch -D <prefix>/<name>
```

미커밋 변경이 있으면 `remove`가 거부됨. 강제 삭제는 사용자가 명시할 때만 `--force` 사용.

## 선택적 동작

- **이름 직접 지정**: "i18n-sync 이름으로 worktree 만들어서 …" → 슬러그 자동 생성 건너뛰고 그대로 사용.
- **베이스 직접 지정**: "dev에서 따와서 …" → 베이스를 `dev`로.
- **세팅만 하고 작업 X**: "worktree만 만들어줘 (작업은 나중에)" → Step 6 건너뜀.
- **여러 worktree 동시**: 한 메시지에 여러 작업이 있으면 worktree를 하나씩 순차 생성. 병렬 처리는 별도 Agent isolation으로 확장 가능.
