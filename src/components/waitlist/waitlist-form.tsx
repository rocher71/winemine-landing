'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { submitWaitlist } from '@/app/actions';
import {
  emailContactSchema,
  phoneContactSchema,
  type ContactFormData,
} from '@/lib/validations';

interface WaitlistFormProps {
  onSuccess: () => void;
}

export default function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = contactType === 'email' ? emailContactSchema : phoneContactSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
    defaultValues: { contactType, contact: '' } as ContactFormData,
  });

  const handleTabChange = (type: 'email' | 'phone') => {
    setContactType(type);
    setServerError(null);
    reset({ contactType: type, contact: '' } as ContactFormData);
  };

  const onSubmit = async (data: ContactFormData) => {
    setServerError(null);
    try {
      const result = await submitWaitlist({ contact: data.contact, contactType });
      if (result.success) {
        onSuccess();
      } else {
        setServerError('일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch {
      setServerError('일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['email', 'phone'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleTabChange(type)}
            style={{
              padding: '8px 20px',
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '-0.224px',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              border: '1px solid',
              borderColor: contactType === type ? 'var(--color-action)' : 'var(--color-hairline)',
              background: contactType === type ? 'rgba(139,26,42,0.06)' : 'transparent',
              color: contactType === type ? 'var(--color-action)' : 'var(--color-ink-muted)',
            }}
          >
            {type === 'email' ? '이메일' : '전화번호'}
          </button>
        ))}
      </div>

      {/* Input */}
      <div>
        <input
          {...register('contact')}
          type={contactType === 'email' ? 'email' : 'tel'}
          autoComplete={contactType === 'email' ? 'email' : 'tel'}
          placeholder={contactType === 'email' ? 'wine@example.com' : '010-0000-0000'}
          aria-invalid={errors.contact ? 'true' : 'false'}
          style={{
            width: '100%',
            height: 52,
            background: 'var(--color-parchment)',
            border: `1px solid ${errors.contact ? 'var(--color-error)' : 'var(--color-hairline)'}`,
            borderRadius: 11,
            padding: '0 16px',
            color: 'var(--color-ink)',
            fontSize: 17,
            letterSpacing: '-0.374px',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 150ms ease',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-action)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = errors.contact ? 'var(--color-error)' : 'var(--color-hairline)'; }}
        />
        {errors.contact && (
          <p style={{ fontSize: 13, color: 'var(--color-error)', marginTop: 6, letterSpacing: '-0.12px' }}>
            {errors.contact.message}
          </p>
        )}
      </div>

      {serverError && (
        <p style={{ fontSize: 14, color: 'var(--color-error)', marginTop: 12, letterSpacing: '-0.224px' }}>
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-pill btn-primary"
        style={{
          width: '100%',
          height: 52,
          fontSize: 17,
          marginTop: 16,
          borderRadius: 11,
          opacity: isSubmitting ? 0.7 : 1,
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
        {isSubmitting ? '잠시만요...' : '신청하기'}
      </button>

      <p style={{
        fontSize: 12,
        color: 'var(--color-ink-disabled)',
        textAlign: 'center',
        marginTop: 12,
        letterSpacing: '-0.12px',
      }}>
        개인정보는 출시 알림 목적으로만 사용됩니다.
      </p>
    </form>
  );
}
