'use client';

import { SignupForm } from '@/components/auth/signup-form';

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-20">
      <div className="mt-12 w-full flex justify-center">
        <SignupForm />
      </div>
    </div>
  );
}
