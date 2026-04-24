'use client';

import { BambuWelcome } from '@/components/bambu/bambu-welcome';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-20">
      <BambuWelcome variant="wave" size={120} className="md:block hidden" />
      <BambuWelcome variant="wave" size={100} className="md:hidden block" />

      <div className="mt-12 w-full flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
