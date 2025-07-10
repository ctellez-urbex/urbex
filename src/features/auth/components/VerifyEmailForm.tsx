"use client";

import { useState, useCallback, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyEmail, resendVerificationCode } from '@/config/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const VerifyEmailForm = memo(() => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    code: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ code: e.target.value });
    if (error) setError('');
  }, [error]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      console.log('🔵 Verifying email for:', email);
      const result = await verifyEmail({
        username: email,
        confirmation_code: formData.code.trim()
      });
      console.log('🔵 Verify email result:', result);

      if (result.success) {
        setMessage('✅ Correo electrónico verificado correctamente. Ya puedes iniciar sesión.');
        setTimeout(() => {
          router.push('/auth/login/index.html?verified=true');
        }, 3000);
      } else {
        setError(result.error || 'Error al verificar el correo electrónico');
      }
    } catch (err) {
      console.error('❌ Verification error:', err);
      setError(err instanceof Error ? err.message : 'Error al verificar el correo electrónico');
    } finally {
      setLoading(false);
    }
  }, [email, formData.code, router]);

  const handleResendCode = useCallback(async () => {
    setError('');
    setMessage('');
    setResendLoading(true);

    try {
      console.log('🔵 Resending verification code for:', email);
      const result = await resendVerificationCode({ email });
      console.log('🔵 Resend code result:', result);
      
      if (result.success) {
        setMessage('📧 Código de verificación reenviado');
      } else {
        setError(result.error || 'Error al reenviar el código');
      }
    } catch (err) {
      console.error('❌ Resend error:', err);
      setError(err instanceof Error ? err.message : 'Error al reenviar el código');
    } finally {
      setResendLoading(false);
    }
  }, [email]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Verificar correo electrónico
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Ingresa el código de verificación enviado a:
        </p>
        <p className="font-medium text-blue-600 dark:text-blue-400 text-sm">
          {email || 'tu correo electrónico'}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {message && (
        <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label 
            htmlFor="code" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Código de verificación
          </label>
          <Input
            id="code"
            name="code"
            type="text"
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="123456"
            value={formData.code}
            onChange={handleCodeChange}
            disabled={loading || resendLoading}
            required
            className="text-center text-lg tracking-widest"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Ingresa el código de 6 dígitos
          </p>
        </div>

        <Button
          type="submit"
          variant="primary-blue"
          disabled={loading || resendLoading || !formData.code.trim()}
          loading={loading}
          className={cn(
            "w-full transition-all duration-300",
            !formData.code.trim() && "opacity-50 cursor-not-allowed",
            formData.code.trim() && !loading && !resendLoading && "hover:scale-105"
          )}
        >
          {loading ? 'Verificando...' : 'Verificar correo'}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleResendCode}
          disabled={loading || resendLoading}
          loading={resendLoading}
          className="text-sm text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-950"
        >
          {resendLoading ? 'Reenviando...' : '¿No recibiste el código? Reenviar'}
        </Button>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>¿Problemas con la verificación?</p>
          <a 
            href="/auth/login/index.html" 
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  );
}); 

VerifyEmailForm.displayName = 'VerifyEmailForm';

export { VerifyEmailForm }; 