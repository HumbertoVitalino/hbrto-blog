-- Create posts table
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  tags text[] default '{}',
  published boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  user_id uuid not null references auth.users(id) on delete cascade
);

-- Create indexes for better performance
create index if not exists idx_posts_slug on public.posts(slug);
create index if not exists idx_posts_user_id on public.posts(user_id);
create index if not exists idx_posts_published on public.posts(published);
create index if not exists idx_posts_created_at on public.posts(created_at desc);

-- Enable RLS
alter table public.posts enable row level security;

-- RLS Policy: SELECT - Public (anyone can see published posts)
create policy "Posts are publicly readable when published"
on public.posts for select
using (published = true);

-- RLS Policy: SELECT - Owner can see their own unpublished posts
create policy "Users can see their own unpublished posts"
on public.posts for select
using (auth.uid() = user_id);

-- RLS Policy: INSERT - Only authenticated users can create posts
create policy "Authenticated users can create posts"
on public.posts for insert
with check (auth.uid() = user_id);

-- RLS Policy: UPDATE - Only owner can update
create policy "Users can update their own posts"
on public.posts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- RLS Policy: DELETE - Only owner can delete
create policy "Users can delete their own posts"
on public.posts for delete
using (auth.uid() = user_id);

-- Optional: Create a trigger to update updated_at timestamp
create or replace function public.update_posts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_posts_updated_at
before update on public.posts
for each row
execute function public.update_posts_updated_at();
