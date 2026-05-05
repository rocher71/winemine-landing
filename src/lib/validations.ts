import { z } from 'zod';

export const emailContactSchema = z.object({
  contactType: z.literal('email'),
  contact: z.string().min(1, '연락처를 입력해주세요').email('올바른 이메일 형식이 아닙니다').max(255),
});

export const phoneContactSchema = z.object({
  contactType: z.literal('phone'),
  contact: z
    .string()
    .min(1, '연락처를 입력해주세요')
    .regex(/^010[-\s]?\d{4}[-\s]?\d{4}$/, '올바른 전화번호 형식이 아닙니다 (010-XXXX-XXXX)')
    .max(20),
});

export const contactSchema = z.discriminatedUnion('contactType', [
  emailContactSchema,
  phoneContactSchema,
]);

export type ContactFormData = z.infer<typeof contactSchema>;
