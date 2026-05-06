'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { submitWaitlist } from '@/app/actions';
import { trackEvent } from '@/lib/analytics';
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
    trackEvent('waitlist_submit', { contact_type: contactType });
    try {
      const result = await submitWaitlist({
        contact: data.contact,
        contactType,
      });
      if (result.success) {
        trackEvent('waitlist_success', { contact_type: contactType });
        onSuccess();
      } else {
        setServerError('일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch {
      setServerError('일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const activeTabStyle = {
    borderColor: '#8B1A2A',
    color: '#F5F0E8',
    background: 'rgba(139,26,42,0.15)',
  };
  const inactiveTabStyle = {
    borderColor: '#2D1540',
    color: '#4A3D56',
    background: 'transparent',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['email', 'phone'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleTabChange(type)}
            style={{
              border: '1px solid',
              padding: '8px 20px',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
              ...(contactType === type ? activeTabStyle : inactiveTabStyle),
            }}
          >
            {type === 'email' ? '이메일' : '전화번호'}
          </button>
        ))}
      </div>

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
            background: '#1A0A1E',
            border: `1px solid ${errors.contact ? '#EF4444' : '#2D1540'}`,
            borderRadius: 4,
            padding: '0 16px',
            color: '#F5F0E8',
            fontSize: 15,
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#8B1A2A';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = errors.contact ? '#EF4444' : '#2D1540';
          }}
        />
        {errors.contact && (
          <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6 }}>
            {errors.contact.message}
          </p>
        )}
      </div>

      {serverError && (
        <p style={{ fontSize: 13, color: '#EF4444', marginTop: 12 }}>{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: '100%',
          height: 52,
          background: '#8B1A2A',
          color: '#F5F0E8',
          border: 'none',
          borderRadius: 4,
          fontSize: 16,
          fontWeight: 600,
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          opacity: isSubmitting ? 0.7 : 1,
          marginTop: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'background 200ms ease',
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting) e.currentTarget.style.background = '#A02030';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#8B1A2A';
        }}
      >
        {isSubmitting && <Loader2 size={20} className="animate-spin" />}
        {isSubmitting ? '잠시만요...' : '신청하기'}
      </button>

      <p style={{ fontSize: 11, color: '#4A3D56', textAlign: 'center', marginTop: 12 }}>
        개인정보는 출시 알림 목적으로만 사용됩니다.
      </p>
    </form>
  );
}
