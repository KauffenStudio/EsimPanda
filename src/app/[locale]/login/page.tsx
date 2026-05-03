import { BambuVideo } from '@/components/bambu/bambu-video';
import { LoginForm } from '@/components/auth/login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; deleted?: string }>;
}) {
  const { error, deleted } = await searchParams;

  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-20">
      <BambuVideo variant="welcome" size={120} className="hidden md:inline-flex" />
      <BambuVideo variant="welcome" size={100} className="md:hidden" />

      <div className="mt-12 w-full flex justify-center">
        <LoginForm initialError={error} accountDeleted={deleted === '1'} />
      </div>
    </div>
  );
}
