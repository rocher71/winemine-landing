/**
 * 설문 이메일 일괄 발송 스크립트
 *
 * 실행 방법:
 *   npx tsx --env-file .env.local scripts/send-survey-emails.ts              # dry run
 *   npx tsx --env-file .env.local scripts/send-survey-emails.ts --test me@gmail.com
 *   npx tsx --env-file .env.local scripts/send-survey-emails.ts --send       # 실제 발송
 *
 * 템플릿: src/emails/survey.html
 * 치환 변수: {{SURVEY_URL}}
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { join } from 'path';
import ws from 'ws';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } }
);
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM       = 'WineMine <wine@winemine.site>';
const REPLY_TO   = 'wine@winemine.site';
const SUBJECT    = 'WineMine 출시 전, 당신의 의견을 듣고 싶어요';
const SURVEY_URL = 'https://forms.gle/k5tySWyY662LQYpi6';
const DRY_RUN    = !process.argv.includes('--send') && !process.argv.includes('--test');
const TEST_IDX   = process.argv.indexOf('--test');
const TEST_EMAIL = TEST_IDX !== -1 ? process.argv[TEST_IDX + 1] : null;

async function main() {
  const template = readFileSync(join(process.cwd(), 'src/emails/survey.html'), 'utf-8');
  const html = template.replaceAll('{{SURVEY_URL}}', SURVEY_URL);

  if (TEST_EMAIL) {
    console.log(`[TEST] ${TEST_EMAIL} 으로 테스트 메일 발송 중...`);
    const { data, error } = await resend.emails.send({
      from: FROM,
      reply_to: REPLY_TO,
      to: TEST_EMAIL,
      subject: `[테스트] ${SUBJECT}`,
      html,
    });
    if (error) console.error('테스트 발송 실패:', error);
    else console.log(`테스트 완료 → ${TEST_EMAIL} (id: ${data?.id})`);
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

  if (DRY_RUN) {
    console.log('\n[DRY RUN] 실제 발송 없이 미리보기만 출력합니다.');
    console.log('실제 발송: npx tsx --env-file .env.local scripts/send-survey-emails.ts --send\n');
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
      reply_to: REPLY_TO,
      to: c.contact,
      subject: SUBJECT,
      html,
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
