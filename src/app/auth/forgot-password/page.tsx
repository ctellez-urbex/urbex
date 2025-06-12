import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { AuthRoute } from '@/components/auth/AuthRoute';

export default function ForgotPasswordPage() {
  return (
    <AuthRoute>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="mt-8 bg-white dark:bg-neutral-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>      
    </AuthRoute>
  );
} 