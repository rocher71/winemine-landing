import { z } from 'zod';

// 제어 문자(NULL byte 포함, \x00-\x1F, \x7F) 차단 — NULL byte injection / 로그 위조 / Slack 메시지 위조 방지
// eslint-disable-next-line no-control-regex
const NO_CONTROL_CHARS = /^[^\x00-\x1F\x7F]+$/;

export const emailContactSchema = z.object({
  contactType: z.literal('email'),
  contact: z
    .string()
    .trim()
    .min(1, '연락처를 입력해주세요')
    .max(255)
    .regex(NO_CONTROL_CHARS, '허용되지 않은 문자가 포함되어 있습니다')
    .email('올바른 이메일 형식이 아닙니다'),
});

export const phoneContactSchema = z.object({
  contactType: z.literal('phone'),
  contact: z
    .string()
    .trim()
    .min(1, '연락처를 입력해주세요')
    .max(20)
    .regex(/^010[-\s]?\d{4}[-\s]?\d{4}$/, '올바른 전화번호 형식이 아닙니다 (010-XXXX-XXXX)'),
});

export const contactSchema = z.discriminatedUnion('contactType', [
  emailContactSchema,
  phoneContactSchema,
]);

export type ContactFormData = z.infer<typeof contactSchema>;
