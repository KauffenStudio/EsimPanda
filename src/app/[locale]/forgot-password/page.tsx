import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata = {
  title: 'Reset Password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      <ForgotPasswordForm />
    </div>
  );
}
