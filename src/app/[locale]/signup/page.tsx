'use client';

import { BambuVideo } from '@/components/bambu/bambu-video';
import { SignupForm } from '@/components/auth/signup-form';

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-20">
      <BambuVideo variant="welcome" size={120} className="hidden md:inline-flex" />
      <BambuVideo variant="welcome" size={100} className="md:hidden" />

      <div className="mt-12 w-full flex justify-center">
        <SignupForm />
      </div>
    </div>
  );
}
