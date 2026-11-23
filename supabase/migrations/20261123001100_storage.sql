-- One private bucket for avatars, workout photos and PR photos.
-- Paths: {uid}/avatar/{uuid}.webp, {uid}/workouts/{workout_id}/{photo_id}.webp,
--        {uid}/prs/{pr_id}.webp. Files are compressed client-side before upload.
-- Reads use short-lived signed URLs; the bucket is never public.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-media', 'user-media', false, 2097152, array['image/webp', 'image/jpeg'])
on conflict (id) do nothing;

create policy "user-media: select own" on storage.objects
  for select to authenticated
  using (bucket_id = 'user-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "user-media: insert own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'user-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "user-media: update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'user-media' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'user-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "user-media: delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'user-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Account deletion (P-5) is a Supabase Edge Function, delete-account, using the
-- service role: it removes every object under {uid}/ through the Storage API, then
-- calls auth.admin.deleteUser(uid). Every table above cascades from auth.users,
-- so that single call removes all personal rows.
