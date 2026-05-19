'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { submitFeedback } from '@/app/actions';
import { trackEvent } from '@/lib/analytics';
import { feedbackSchema, type FeedbackFormData } from '@/lib/validations';
import { useLocale } from '@/components/providers/locale-provider';

interface FeedbackFormProps {
  onSuccess: () => void;
}

const MAX_LENGTH = 2000;

export default function FeedbackForm({ onSuccess }: FeedbackFormProps) {
  const { t } = useLocale();
  const [serverError, setServerError] = useState<string | null>(null);
  const formStartedRef = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { message: '', email: '', category: 'feature' },
  });

  const messageValue = watch('message') ?? '';

  const handleInputFocus = () => {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    trackEvent('feedback_start', { category: 'feature' });
  };

  const onSubmit = async (data: FeedbackFormData) => {
    setServerError(null);
    trackEvent('feedback_submit', { category: data.category });
    try {
      const result = await submitFeedback({
        message: data.message,
        email: data.email || undefined,
        category: data.category,
      });
      if (result.success) {
        trackEvent('feedback_success', { category: data.category });
        onSuccess();
      } else {
        trackEvent('feedback_error', { error_code: result.error ?? 'unknown' });
        setServerError(t('feedbackForm.serverError'));
      }
    } catch (e) {
      trackEvent('feedback_error', {
        error_code: 'network',
        message: e instanceof Error ? e.message.slice(0, 100) : 'unknown',
      });
      setServerError(t('feedbackForm.serverError'));
    }
  };

  const onInvalid = (formErrors: typeof errors) => {
    const failedField = Object.keys(formErrors)[0] ?? 'unknown';
    trackEvent('feedback_validation_error', { field: failedField });
  };

  const inputBaseStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-bg-map)',
    border: `1px solid ${errors.email ? 'var(--color-error)' : 'var(--color-border)'}`,
    borderRadius: 4,
    padding: '0 16px',
    color: 'var(--color-text-primary)',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    height: 52,
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 160,
    background: 'var(--color-bg-map)',
    border: `1px solid ${errors.message ? 'var(--color-error)' : 'var(--color-border)'}`,
    borderRadius: 4,
    padding: '14px 16px',
    color: 'var(--color-text-primary)',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
    lineHeight: 1.6,
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      {/* 카테고리 배지 — 현재는 '기능 제안' 단일 옵션이지만 향후 확장 가능 */}
      <div style={{ marginBottom: 16 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 999,
            border: '1px solid var(--color-gold)',
            background: 'rgba(201,168,76,0.10)',
            color: 'var(--color-gold)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          {t('feedbackForm.categoryFeature')}
        </span>
        <input type="hidden" {...register('category')} value="feature" />
      </div>

      {/* 메시지 textarea */}
      <div>
        <label
          htmlFor="feedback-message"
          style={{
            display: 'block',
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            marginBottom: 8,
            fontWeight: 500,
          }}
        >
          {t('feedbackForm.messageLabel')}
        </label>
        <textarea
          id="feedback-message"
          {...register('message')}
          placeholder={t('feedbackForm.messagePlaceholder')}
          aria-invalid={errors.message ? 'true' : 'false'}
          style={textareaStyle}
          maxLength={MAX_LENGTH}
          onFocus={(e) => {
            handleInputFocus();
            e.currentTarget.style.borderColor = 'var(--color-wine-red)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = errors.message
              ? 'var(--color-error)'
              : 'var(--color-border)';
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          {errors.message ? (
            <p style={{ fontSize: 12, color: 'var(--color-error)' }}>{errors.message.message}</p>
          ) : (
            <span />
          )}
          <span style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>
            {messageValue.length} / {MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* 이메일 (선택) */}
      <div style={{ marginTop: 16 }}>
        <label
          htmlFor="feedback-email"
          style={{
            display: 'block',
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            marginBottom: 8,
            fontWeight: 500,
          }}
        >
          {t('feedbackForm.emailLabel')}
        </label>
        <input
          id="feedback-email"
          {...register('email')}
          type="email"
          autoComplete="email"
          placeholder={t('feedbackForm.emailPlaceholder')}
          aria-invalid={errors.email ? 'true' : 'false'}
          style={inputBaseStyle}
          onFocus={(e) => {
            handleInputFocus();
            e.currentTarget.style.borderColor = 'var(--color-wine-red)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = errors.email
              ? 'var(--color-error)'
              : 'var(--color-border)';
          }}
        />
        {errors.email && (
          <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 6 }}>
            {errors.email.message}
          </p>
        )}
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
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'background 200ms ease',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting) e.currentTarget.style.background = 'var(--color-wine-red-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--color-wine-red)';
        }}
      >
        {isSubmitting && <Loader2 size={20} className="animate-spin" />}
        {isSubmitting ? t('feedbackForm.loadingButton') : t('feedbackForm.submitButton')}
      </button>

      <p
        style={{
          fontSize: 11,
          color: 'var(--color-text-disabled)',
          textAlign: 'center',
          marginTop: 12,
          lineHeight: 1.6,
        }}
      >
        {t('feedbackForm.privacyNotice')}
      </p>
    </form>
  );
}
