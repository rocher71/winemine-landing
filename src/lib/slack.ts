type Payload = {
  contact: string;
  contactType: 'email' | 'phone';
  marketingAgree: boolean;
  isDuplicate: boolean;
  totalCount: number | null;
};

function formatKstNow(): string {
  const fmt = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const get = (t: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')} KST`;
}

// Slack 메시지 인젝션 방지 — 개행/꺾쇠/at-mention 메타문자 제거.
// (`<!channel>`, `<!here>`, `\n` 삽입으로 운영자 채널 위조 차단)
// eslint-disable-next-line no-control-regex
const SLACK_META = /[\x00-\x1F\x7F<>]/g;
function sanitizeForSlack(s: string): string {
  return s.replace(SLACK_META, '').slice(0, 256);
}

export async function notifyNewSignup(p: Payload): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;

  const contactTypeKo = p.contactType === 'email' ? '이메일' : '전화번호';
  const marketingKo = p.marketingAgree ? '동의' : '미동의';
  const time = formatKstNow();

  const headline = p.isDuplicate ? '[REPEAT] 중복 시도' : '[NEW] 새 사전 신청';
  const timeLabel = p.isDuplicate ? '시도 시간' : '등록 시간';

  const safeContact = sanitizeForSlack(p.contact);

  const lines = [
    headline,
    `연락처: ${safeContact} (${contactTypeKo})`,
    `마케팅 수신: ${marketingKo}`,
    `${timeLabel}: ${time}`,
  ];
  if (typeof p.totalCount === 'number') {
    lines.push(`누적 신청자: ${p.totalCount.toLocaleString('ko-KR')}명`);
  }
  const text = lines.join('\n');

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.error('[slack] notifyNewSignup failed:', err);
  }
}
