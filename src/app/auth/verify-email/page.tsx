import { VerifyEmailForm } from '@/features/auth/components/VerifyEmailForm';

export default function VerifyEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <VerifyEmailForm />
      </div>
    </div>
  );
} 