-- User-isolated storage bucket
--
-- Creates a private 'user-uploads' bucket and RLS policies that scope every
-- read/write/update/delete to objects inside the authenticated user's own
-- folder. Each user's files must be stored under a top-level folder named
-- after their auth.uid(), e.g.:
--
--   user-uploads/<user_id>/avatar.png
--   user-uploads/<user_id>/support/screenshot-1.jpg
--
-- The first path segment is extracted with storage.foldername(name)[1] and
-- compared to auth.uid()::text. The service role key bypasses RLS and can
-- still administer files (e.g., signed URLs, admin tools, cleanup jobs).

-- 1. Create the bucket (idempotent)
insert into storage.buckets (id, name, public)
values ('user-uploads', 'user-uploads', false)
on conflict (id) do nothing;

-- 2. Drop any pre-existing policies with the same names so this migration
--    is safe to re-run during development.
drop policy if exists "user-uploads: read own files" on storage.objects;
drop policy if exists "user-uploads: upload to own folder" on storage.objects;
drop policy if exists "user-uploads: update own files" on storage.objects;
drop policy if exists "user-uploads: delete own files" on storage.objects;

-- 3. Read: authenticated users can SELECT only objects in their own folder.
create policy "user-uploads: read own files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Write: authenticated users can INSERT only into their own folder.
create policy "user-uploads: upload to own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Update: authenticated users can UPDATE (replace metadata, etc.) only
--    objects in their own folder. The same constraint applies before and
--    after the update so they can't move a file out of their folder.
create policy "user-uploads: update own files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Delete: authenticated users can DELETE only objects in their own folder.
create policy "user-uploads: delete own files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);
