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
            {type === 'email' ? '이메일' : '전화번호'}
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
            placeholder="wine@example.com"
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
      <label style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        cursor: 'pointer',
        marginTop: 16,
        padding: '12px 14px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid #2D1540',
        borderRadius: 6,
      }}>
        <input
          type="checkbox"
          checked={marketingAgree}
          onChange={(e) => setMarketingAgree(e.target.checked)}
          style={{
            marginTop: 2,
            accentColor: '#8B1A2A',
            width: 16,
            height: 16,
            flexShrink: 0,
            cursor: 'pointer',
          }}
        />
        <span style={{ fontSize: 12, color: '#9B8B7A', lineHeight: 1.6 }}>
          <span style={{ color: '#4A3D56', marginRight: 4 }}>(선택)</span>
          <strong style={{ color: '#D4C5B0', fontWeight: 600 }}>마케팅 알림 받기</strong>
          <br />
          앱 출시 소식 및 특별 혜택 정보를 이메일/문자로 받겠습니다.
        </span>
      </label>

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
        {isSubmitting ? '잠시만요...' : '신청하기'}
      </button>

      {/* 개인정보 처리 안내 */}
      <p style={{ fontSize: 11, color: '#4A3D56', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
        수집된 연락처는 출시 알림 목적으로만 사용되며,<br />
        앱 출시 후 즉시 폐기됩니다.
      </p>
    </form>
  );
}
