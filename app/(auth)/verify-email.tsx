import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';

import {
  AuthScreen,
  EmailAuthError,
  GENERIC_AUTH_MESSAGE,
  OtpCodeInput,
  OTP_EXPIRED_MESSAGE,
  PrimaryButton,
  RESEND_FAILURE_MESSAGE,
  TextField,
  logAuthError,
  openEmailApp,
  resendVerificationEmail,
  toFriendlyAuthError,
  useAuth,
  useResendCooldown,
  verifySignupOtp,
} from '@/features/auth';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email?: string;
    reason?: string;
    status?: string;
  }>();
  const { user, session, isEmailVerified } = useAuth();
  const [email, setEmail] = useState(
    (typeof params.email === 'string' ? params.email : '') || user?.email || '',
  );
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState(false);
  const [showCode, setShowCode] = useState(params.reason !== 'unverified');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [status, setStatus] = useState<'code' | 'verified'>(
    params.status === 'all-set' || params.status === 'verified' ? 'verified' : 'code',
  );
  const cooldown = useResendCooldown();
  const unverifiedLogin = params.reason === 'unverified';

  useEffect(() => {
    if (unverifiedLogin) {
      return;
    }
    cooldown.start();
    // Signup already sent the first email; block an immediate second send.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== 'code') {
      return;
    }
    if (session && isEmailVerified) {
      setStatus('verified');
    }
  }, [isEmailVerified, session, status]);

  useEffect(() => {
    if (status !== 'verified') {
      return;
    }
    const timer = setTimeout(() => {
      router.replace('/');
    }, 700);
    return () => clearTimeout(timer);
  }, [router, status]);

  async function onVerify() {
    if (verifyLoading || resendLoading) {
      return;
    }
    const token = code.replace(/\D/g, '');
    if (token.length !== 6) {
      setCodeError('Enter the 6-digit code from your email.');
      return;
    }
    if (!email.trim()) {
      setFormError('Enter your email to verify the code.');
      setEditingEmail(true);
      return;
    }

    setVerifyLoading(true);
    setCodeError(null);
    setFormError(null);
    setMessage(null);
    try {
      await verifySignupOtp(email, token);
      setStatus('verified');
    } catch (error) {
      logAuthError(error);
      const mapped = error instanceof EmailAuthError ? error : toFriendlyAuthError(error, 'verify');
      if (mapped.kind === 'otp_expired') {
        setCodeError(OTP_EXPIRED_MESSAGE);
        return;
      }
      if (mapped.kind === 'otp_invalid') {
        setCodeError(mapped.message);
        return;
      }
      setFormError(mapped.message);
    } finally {
      setVerifyLoading(false);
    }
  }

  async function onResend() {
    if (verifyLoading || resendLoading || cooldown.isCoolingDown) {
      return;
    }
    if (!email.trim()) {
      setFormError('Enter your email to resend the code.');
      setEditingEmail(true);
      return;
    }

    setResendLoading(true);
    setFormError(null);
    setCodeError(null);
    setMessage(null);
    try {
      await resendVerificationEmail(email);
      setMessage('We sent a new code. Check your inbox and spam folder.');
      cooldown.start();
    } catch (error) {
      logAuthError(error);
      const mapped = error instanceof EmailAuthError ? error : toFriendlyAuthError(error, 'verify');
      setFormError(mapped.message || RESEND_FAILURE_MESSAGE);
    } finally {
      setResendLoading(false);
    }
  }

  async function onOpenEmail() {
    try {
      await openEmailApp();
    } catch (error) {
      logAuthError(error);
      setFormError(GENERIC_AUTH_MESSAGE);
    }
  }

  if (status === 'verified') {
    return (
      <AuthScreen title="Email verified! ✅">
        <Text className="mb-4 text-base text-brand-700">
          Taking you into QuranFamily…
        </Text>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title={unverifiedLogin ? 'One quick step left 📧' : 'Check your email 📧'}
      subtitle={
        unverifiedLogin
          ? 'Please verify your email before continuing.'
          : 'We sent a verification code to your email.'
      }
    >
      <Text className="mb-4 text-base text-brand-700">
        We sent a verification code to{' '}
        <Text className="font-semibold text-brand-800">{email || 'your email'}</Text>.
      </Text>

      {editingEmail ? (
        <TextField
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />
      ) : null}

      {showCode ? (
        <OtpCodeInput
          value={code}
          onChange={(next) => {
            setCode(next);
            setCodeError(null);
          }}
          error={codeError ?? undefined}
          editable={!verifyLoading}
        />
      ) : null}

      {message ? <Text className="mb-3 text-sm text-brand-600">{message}</Text> : null}
      {formError ? <Text className="mb-3 text-sm text-red-600">{formError}</Text> : null}

      {showCode ? (
        <PrimaryButton
          label={verifyLoading ? 'Verifying…' : 'Verify'}
          onPress={() => void onVerify()}
          loading={verifyLoading}
          disabled={resendLoading}
        />
      ) : (
        <PrimaryButton label="Enter Verification Code" onPress={() => setShowCode(true)} />
      )}
      <PrimaryButton
        label={
          cooldown.isCoolingDown
            ? `Resend code in ${cooldown.remaining}s`
            : resendLoading
              ? 'Sending code…'
              : unverifiedLogin
                ? 'Resend Email'
                : 'Resend Code'
        }
        onPress={() => void onResend()}
        loading={resendLoading}
        disabled={cooldown.isCoolingDown || verifyLoading}
        variant="secondary"
      />
      <PrimaryButton label="Open Email" onPress={() => void onOpenEmail()} variant="secondary" />
      <PrimaryButton
        label="Change Email"
        onPress={() => {
          if (unverifiedLogin) {
            setEditingEmail(true);
            return;
          }
          router.replace('/(auth)/register');
        }}
        variant="secondary"
      />
      <Pressable onPress={() => router.replace('/(auth)/welcome')} className="py-2">
        <Text className="text-center text-sm font-medium text-brand-600">Back</Text>
      </Pressable>
    </AuthScreen>
  );
}
