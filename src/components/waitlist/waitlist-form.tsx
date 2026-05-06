'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { submitWaitlist } from '@/app/actions';
import { trackEvent } from '@/lib/analytics';
import {
  emailContactSchema,
  phoneContactSchema,
  type ContactFormData,
} from '@/lib/validations';
import { useLocale } from '@/components/providers/locale-provider';

interface WaitlistFormProps {
  onSuccess: () => void;
}

// 전화번호 자동 포맷: 숫자만 입력받아 010-XXXX-XXXX 형식으로 변환
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const { t } = useLocale();
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [marketingAgree, setMarketingAgree] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = contactType === 'email' ? emailContactSchema : phoneContactSchema;

  const {
    register,
    handleSubmit,
    control,
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
    trackEvent('waitlist_submit', { contact_type: contactType, marketing_agree: marketingAgree });
    try {
      const result = await submitWaitlist({
        contact: data.contact,
        contactType,
        marketingAgree,
      });
      if (result.success) {
        trackEvent('waitlist_success', { contact_type: contactType });
        onSuccess();
      } else {
        setServerError(t('waitlistForm.serverError'));
      }
    } catch {
      setServerError(t('waitlistForm.serverError'));
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

  const inputBaseStyle: React.CSSProperties = {
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
    fontFamily: 'inherit',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 이메일 / 전화번호 탭 */}
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
              fontFamily: 'inherit',
              ...(contactType === type ? activeTabStyle : inactiveTabStyle),
            }}
          >
            {t(`waitlistForm.tabs.${type}`)}
          </button>
        ))}
      </div>

      {/* 입력 필드 */}
      <div>
        {contactType === 'email' ? (
          <input
            {...register('contact')}
            type="email"
            autoComplete="email"
            placeholder={t('waitlistForm.emailPlaceholder')}
            aria-invalid={errors.contact ? 'true' : 'false'}
            style={inputBaseStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#8B1A2A'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = errors.contact ? '#EF4444' : '#2D1540'; }}
          />
        ) : (
          // 전화번호: Controller로 자동 하이픈 포맷 적용
          <Controller
            name="contact"
            control={control}
            render={({ field }) => (
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder=""
                value={field.value}
                onChange={(e) => field.onChange(formatPhone(e.target.value))}
                onBlur={field.onBlur}
                aria-invalid={errors.contact ? 'true' : 'false'}
                style={inputBaseStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#8B1A2A'; }}
              />
            )}
          />
        )}
        {errors.contact && (
          <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6 }}>
            {errors.contact.message}
          </p>
        )}
      </div>

      {/* 마케팅 알림 동의 (선택) */}
      <div
        onClick={() => setMarketingAgree(!marketingAgree)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, cursor: 'pointer', userSelect: 'none' }}
      >
        <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1 }}>
          {marketingAgree ? '✅' : '☐'}
        </span>
        <span style={{ fontSize: 12, color: '#6A5E4A', lineHeight: 1.5 }}>
          {t('waitlistForm.marketingCheckbox')}
        </span>
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
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#A02030'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#8B1A2A'; }}
      >
        {isSubmitting && <Loader2 size={20} className="animate-spin" />}
        {isSubmitting ? t('waitlistForm.loadingButton') : t('waitlistForm.submitButton')}
      </button>

      {/* 개인정보 처리 안내 */}
      <p style={{ fontSize: 11, color: '#4A3D56', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
        {t('waitlistForm.privacyNotice').split('\n')[0]}<br />{t('waitlistForm.privacyNotice').split('\n')[1]}
      </p>
    </form>
  );
}
