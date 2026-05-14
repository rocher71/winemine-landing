'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { CheckboxEmptyIcon, CheckboxCheckedIcon } from '@/components/icons/wine-icons';
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
    borderColor: 'var(--color-wine-red)',
    color: 'var(--color-text-primary)',
    background: 'rgba(139,26,42,0.15)',
  };
  const inactiveTabStyle = {
    borderColor: 'var(--color-border)',
    color: 'var(--color-text-disabled)',
    background: 'transparent',
  };

  const inputBaseStyle: React.CSSProperties = {
    width: '100%',
    height: 52,
    background: 'var(--color-bg-map)',
    border: `1px solid ${errors.contact ? 'var(--color-error)' : 'var(--color-border)'}`,
    borderRadius: 4,
    padding: '0 16px',
    color: 'var(--color-text-primary)',
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
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-wine-red)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = errors.contact ? 'var(--color-error)' : 'var(--color-border)'; }}
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
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-wine-red)'; }}
              />
            )}
          />
        )}
        {errors.contact && (
          <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 6 }}>
            {errors.contact.message}
          </p>
        )}
      </div>

      {/* 마케팅 알림 동의 (선택) */}
      <div
        onClick={() => setMarketingAgree(!marketingAgree)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, cursor: 'pointer', userSelect: 'none' }}
      >
        <span aria-hidden style={{ flexShrink: 0, display: 'inline-flex', color: marketingAgree ? 'var(--color-wine-red)' : 'var(--color-text-muted)' }}>
          {marketingAgree ? <CheckboxCheckedIcon size={16} /> : <CheckboxEmptyIcon size={16} />}
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          {t('waitlistForm.marketingCheckbox')}
        </span>
      </div>

      {serverError && (
        <p style={{ fontSize: 13, color: 'var(--color-error)', marginTop: 12 }}>{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: '100%',
          height: 52,
          background: 'var(--color-wine-red)',
          color: 'var(--color-text-primary)',
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
        onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = 'var(--color-wine-red-hover)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-wine-red)'; }}
      >
        {isSubmitting && <Loader2 size={20} className="animate-spin" />}
        {isSubmitting ? t('waitlistForm.loadingButton') : t('waitlistForm.submitButton')}
      </button>

      {/* 개인정보 처리 안내 */}
      <p style={{ fontSize: 11, color: 'var(--color-text-disabled)', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
        {t('waitlistForm.privacyNotice').split('\n')[0]}<br />{t('waitlistForm.privacyNotice').split('\n')[1]}
      </p>
    </form>
  );
}
