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

export async function notifyNewSignup(p: Payload): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;

  const contactTypeKo = p.contactType === 'email' ? '이메일' : '전화번호';
  const marketingKo = p.marketingAgree ? '동의' : '미동의';
  const time = formatKstNow();

  const headline = p.isDuplicate ? '🔁 중복 시도' : '🍷 새 사전 신청';
  const timeLabel = p.isDuplicate ? '시도 시간' : '등록 시간';

  const lines = [
    headline,
    `연락처: ${p.contact} (${contactTypeKo})`,
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
