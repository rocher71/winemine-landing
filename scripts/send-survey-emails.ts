/**
 * 설문 이메일 일괄 발송 스크립트
 *
 * Resend 대시보드 템플릿(RESEND_TEMPLATE_ID_SURVEY) + batch.send() 사용.
 * 변수: {{SURVEY_URL}}
 *
 * 실행 방법:
 *   npx tsx --env-file .env.local scripts/send-survey-emails.ts              # dry run (전체 대상 미리보기)
 *   npx tsx --env-file .env.local scripts/send-survey-emails.ts --test me@gmail.com   # 1명 테스트 발송 ([테스트] 접두)
 *   npx tsx --env-file .env.local scripts/send-survey-emails.ts --to user@x.com       # 1명 실제 발송 (접두 없음)
 *   npx tsx --env-file .env.local scripts/send-survey-emails.ts --send       # 전체 실제 발송
 *
 * 로컬 HTML 백업: src/emails/feature-survey.html (Resend 대시보드 템플릿의 as-built 참조용)
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import ws from 'ws';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } }
);
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM        = 'WineMine <wine@winemine.site>';
const REPLY_TO    = 'wine@winemine.site';
const SUBJECT     = 'WineMine, 어떤 모습이 되면 좋을까요? (2분 설문)';
const SURVEY_URL  = 'https://forms.gle/fztHXswcqcbWzpGF6';
const TEMPLATE_ID = process.env.RESEND_TEMPLATE_ID_SURVEY;

const TEST_IDX   = process.argv.indexOf('--test');
const TEST_EMAIL = TEST_IDX !== -1 ? process.argv[TEST_IDX + 1] : null;
const TO_IDX     = process.argv.indexOf('--to');
const TO_EMAIL   = TO_IDX !== -1 ? process.argv[TO_IDX + 1] : null;
const DRY_RUN    = !process.argv.includes('--send') && !TEST_EMAIL && !TO_EMAIL;

async function main() {
  if (!TEMPLATE_ID) {
    console.error('RESEND_TEMPLATE_ID_SURVEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  if (TEST_EMAIL) {
    console.log(`[TEST] ${TEST_EMAIL} 으로 테스트 메일 발송 중...`);
    const { data, error } = await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: TEST_EMAIL,
      subject: `[테스트] ${SUBJECT}`,
      template: { id: TEMPLATE_ID, variables: { SURVEY_URL } },
    });
    if (error) console.error('테스트 발송 실패:', error);
    else console.log(`테스트 완료 → ${TEST_EMAIL} (id: ${data?.id})`);
    return;
  }

  if (TO_EMAIL) {
    console.log(`${TO_EMAIL} 으로 실제 발송 중...`);
    const { data, error } = await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: TO_EMAIL,
      subject: SUBJECT,
      template: { id: TEMPLATE_ID, variables: { SURVEY_URL } },
    });
    if (error) console.error('발송 실패:', error);
    else console.log(`발송 완료 → ${TO_EMAIL} (id: ${data?.id})`);
    return;
  }

  const { data: contacts, error: fetchError } = await supabase
    .from('waitlist')
    .select('contact')
    .eq('contact_type', 'email')
    .order('created_at');

  if (fetchError || !contacts) {
    console.error('Supabase 조회 실패:', fetchError);
    process.exit(1);
  }

  console.log(`총 ${contacts.length}명 조회`);
  console.log(`템플릿 ID: ${TEMPLATE_ID}`);
  console.log(`설문 링크: ${SURVEY_URL}`);

  if (DRY_RUN) {
    console.log('\n[DRY RUN] 실제 발송 없이 미리보기만 출력합니다.');
    console.log('테스트 발송:  npx tsx --env-file .env.local scripts/send-survey-emails.ts --test 내메일@gmail.com');
    console.log('실제 발송:    npx tsx --env-file .env.local scripts/send-survey-emails.ts --send\n');
    contacts.slice(0, 3).forEach(c => console.log(`  → ${c.contact}`));
    if (contacts.length > 3) console.log(`  ... 외 ${contacts.length - 3}명`);
    console.log(`\n총 ${contacts.length}건 발송 예정`);
    return;
  }

  console.log(`\n발송 시작: ${contacts.length}명`);

  const BATCH = 100;
  for (let i = 0; i < contacts.length; i += BATCH) {
    const chunk = contacts.slice(i, i + BATCH);

    const emails = chunk.map(c => ({
      from: FROM,
      replyTo: REPLY_TO,
      to: c.contact,
      subject: SUBJECT,
      template: { id: TEMPLATE_ID, variables: { SURVEY_URL } },
    }));

    const { error: batchError } = await resend.batch.send(emails);

    if (batchError) {
      console.error(`배치 ${Math.floor(i / BATCH) + 1} 실패:`, batchError);
    } else {
      console.log(`배치 ${Math.floor(i / BATCH) + 1} 완료 — ${chunk.length}건 발송`);
    }

    if (i + BATCH < contacts.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log('\n완료!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
