-- Goals for the habit tracker ("where I'm going"). Run in the Supabase SQL editor AFTER
-- 20261020_habit_tracker.sql (it uses is_site_admin() and habits) and BEFORE deploying the code.
--
-- Private like the rest of the tracker: row level security on, only the signed-in admin.
--
-- A goal is measured one of three ways:
--   manual  current out of target, moved by hand (phase 2 of 6)
--   books   books finished in a year out of target, counted from the library (15 books in 2026)
--   habit   how many of the last weeks a habit was done on every day it was planned (train 3x a week)

begin;

create table if not exists public.goals (
    id uuid primary key default gen_random_uuid(),
    title text not null check (length(trim(title)) > 0),
    kind text not null check (kind in ('manual', 'books', 'habit')),
    target numeric check (target is null or target > 0),
    -- only for 'manual'; the other kinds are counted from the site and never stored
    current numeric not null default 0 check (current >= 0),
    unit text,
    habit_id uuid references public.habits(id) on delete cascade,
    year smallint check (year is null or year between 2000 and 2100),
    position integer not null default 0,
    created_at timestamptz not null default now(),
    archived_at timestamptz,
    constraint goals_shape check (
        (kind = 'manual' and target is not null)
        or (kind = 'books' and target is not null and year is not null)
        or (kind = 'habit' and habit_id is not null)
    )
);

alter table public.goals enable row level security;

drop policy if exists "admin only" on public.goals;
create policy "admin only" on public.goals for all to authenticated
    using (public.is_site_admin()) with check (public.is_site_admin());

commit;
