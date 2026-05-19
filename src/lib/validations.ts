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

// 피드백 본문 — 개행·탭은 허용하되 그 외 제어 문자(NULL byte 포함) 차단.
// eslint-disable-next-line no-control-regex
const FEEDBACK_FORBIDDEN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

export const feedbackSchema = z.object({
  message: z
    .string()
    .trim()
    .min(5, '5자 이상 입력해주세요')
    .max(2000, '2000자 이하로 입력해주세요')
    .refine((s) => !FEEDBACK_FORBIDDEN.test(s), '허용되지 않은 문자가 포함되어 있습니다'),
  email: z
    .string()
    .trim()
    .max(255)
    .email('올바른 이메일 형식이 아닙니다')
    .regex(NO_CONTROL_CHARS, '허용되지 않은 문자가 포함되어 있습니다')
    .optional()
    .or(z.literal('')),
  category: z.literal('feature'),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;
