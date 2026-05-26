-- Auto-create a profile row whenever a new auth.users row appears, plus
-- backfill any existing users who don't have a profile yet. Without this,
-- orders.user_id (FK → profiles.id) silently fails to link at checkout —
-- dashboards stay empty and every paid order looks like a "guest" order.

-- 1) Backfill: insert a profile row for every existing auth.users without one.
INSERT INTO profiles (id, email, created_at, updated_at)
SELECT u.id, u.email, COALESCE(u.created_at, now()), now()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id)
  AND u.email IS NOT NULL;

-- 2) Trigger: keep profiles in sync with auth.users on every future signup.
--    SECURITY DEFINER + explicit search_path so the trigger has the privileges
--    to write to public.profiles regardless of who initiated the signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
