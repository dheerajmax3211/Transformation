-- Run this in your Supabase SQL Editor to create the storage bucket and set up policies

-- Create the bucket
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', true)
on conflict (id) do nothing;

-- Allow public read access to the bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'progress-photos' );

-- Allow authenticated and anonymous users to upload files
create policy "Anon Insert"
  on storage.objects for insert
  with check ( bucket_id = 'progress-photos' );

-- Allow users to update their own files (optional, depending on your needs)
create policy "Anon Update"
  on storage.objects for update
  using ( bucket_id = 'progress-photos' );
