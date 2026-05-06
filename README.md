# winemine

와인 라벨을 찍으면, 세계가 물든다.

와인 라벨을 촬영하면 AI가 자동으로 인식하고, 마신 와인을 세계 지도 위에 지역별로 시각화해 기록하는 앱입니다. 이 레포는 앱 출시 전 사전 신청자를 모으기 위한 **랜딩 페이지**입니다.

## 스택

- **Next.js 15** App Router + TypeScript 5.7
- **Tailwind CSS v4** + Framer Motion v12
- **react-simple-maps v3** — 인터랙티브 세계 지도
- **Supabase** PostgreSQL — 웨이팅 리스트 저장
- **Vercel** 배포

## 로컬 실행

```bash
npm install
```

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

```bash
npm run dev   # http://localhost:3000
```

## 환경 변수

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 키 (클라이언트 노출 금지) |
| `NEXT_PUBLIC_SITE_URL` | 배포 URL (OG 태그용, optional) |

## 데이터베이스

Supabase에서 아래 테이블 생성:

```sql
CREATE TABLE waitlist (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  contact      VARCHAR(255) NOT NULL,
  contact_type VARCHAR(10)  NOT NULL CHECK (contact_type IN ('email', 'phone')),
  created_at   TIMESTAMPTZ  DEFAULT now() NOT NULL,
  ip_address   VARCHAR(50),
  user_agent   TEXT,
  CONSTRAINT waitlist_contact_unique UNIQUE (contact)
);
```

RLS 활성화 후 public SELECT 정책은 추가하지 않습니다.
