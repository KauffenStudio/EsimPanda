-- Device tokens for native push notifications.
--
-- The native iOS / Android shells call POST /api/push/register-device
-- after the user grants push permission. The endpoint stores the APNs /
-- FCM device token here so server-side jobs (eSIM expiry alerts, low-data
-- warnings, etc.) can target the user's actual device.
--
-- Rows are deleted automatically when the user account is deleted, via
-- the FK ON DELETE CASCADE.

create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);

create index if not exists device_tokens_user_id_idx
  on public.device_tokens(user_id);

create index if not exists device_tokens_token_idx
  on public.device_tokens(token);

alter table public.device_tokens enable row level security;

drop policy if exists "device_tokens: select own" on public.device_tokens;
drop policy if exists "device_tokens: insert own" on public.device_tokens;
drop policy if exists "device_tokens: update own" on public.device_tokens;
drop policy if exists "device_tokens: delete own" on public.device_tokens;

create policy "device_tokens: select own"
on public.device_tokens
for select
to authenticated
using (auth.uid() = user_id);

create policy "device_tokens: insert own"
on public.device_tokens
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "device_tokens: update own"
on public.device_tokens
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "device_tokens: delete own"
on public.device_tokens
for delete
to authenticated
using (auth.uid() = user_id);
