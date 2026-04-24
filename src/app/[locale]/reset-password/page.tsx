import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata = {
  title: 'Set New Password',
};

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      <ResetPasswordForm />
    </div>
  );
}
