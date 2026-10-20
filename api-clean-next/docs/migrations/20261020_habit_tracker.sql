-- Habit tracker (admin only): habits and their daily logs, a schedule of time blocks and how each
-- one went, and the weekly review. Run in the Supabase SQL editor BEFORE deploying the code.
--
-- Unlike the rest of the database, these tables are private from the start: row level security is
-- on and only the signed-in admin can read or write them. The API talks to them with the admin's
-- own access token, so these rules are what actually guards the data, not just the API checks.

begin;

-- The one account allowed in. Matches NEXT_PUBLIC_ADMIN_EMAIL.
create or replace function public.is_site_admin() returns boolean
language sql stable
as $$
    select coalesce(auth.jwt() ->> 'email', '') = 'humbertovitalino01@gmail.com'
$$;

-- ── Habits ──
create table if not exists public.habits (
    id uuid primary key default gen_random_uuid(),
    name text not null check (length(trim(name)) > 0),
    -- the area of life it feeds; the weekly balance is read from this
    area text not null check (area in ('health', 'mind', 'career', 'people', 'rest')),
    -- 'bool' is done or not; 'qty' counts toward target in unit (pages, ml, min)
    kind text not null default 'bool' check (kind in ('bool', 'qty')),
    target numeric check (target is null or target > 0),
    unit text,
    step numeric check (step is null or step > 0),
    time_of_day text not null default 'anytime' check (time_of_day in ('morning', 'anytime', 'evening')),
    -- weekdays it's planned on, 0 = Sunday; null means every day
    days smallint[] check (days is null or (cardinality(days) between 1 and 7 and days <@ array[0,1,2,3,4,5,6]::smallint[])),
    -- filled in from the rest of the site instead of by hand
    auto_source text check (auto_source is null or auto_source in ('study_focus', 'note_published')),
    position integer not null default 0,
    created_at timestamptz not null default now(),
    archived_at timestamptz,
    constraint habits_qty_has_target check (kind = 'bool' or target is not null)
);

-- One row per habit per day it was touched; a missing row means nothing was logged.
create table if not exists public.habit_logs (
    habit_id uuid not null references public.habits(id) on delete cascade,
    day date not null,
    -- 1 or 0 for a 'bool' habit, the amount for a 'qty' one
    value numeric not null default 0 check (value >= 0),
    updated_at timestamptz not null default now(),
    primary key (habit_id, day)
);

create index if not exists habit_logs_day_idx on public.habit_logs (day);

-- ── Schedule ──
-- A block repeats on its weekdays (the usual week), or happens once on one_off_day.
create table if not exists public.schedule_blocks (
    id uuid primary key default gen_random_uuid(),
    title text not null check (length(trim(title)) > 0),
    area text not null check (area in ('health', 'mind', 'career', 'people', 'rest')),
    starts_at time not null,
    -- may be earlier than starts_at for a block that runs past midnight (sleep)
    ends_at time not null,
    weekdays smallint[] check (weekdays is null or (cardinality(weekdays) between 1 and 7 and weekdays <@ array[0,1,2,3,4,5,6]::smallint[])),
    one_off_day date,
    created_at timestamptz not null default now(),
    archived_at timestamptz,
    constraint schedule_blocks_when check ((weekdays is null) <> (one_off_day is null))
);

create table if not exists public.schedule_block_logs (
    block_id uuid not null references public.schedule_blocks(id) on delete cascade,
    day date not null,
    status text not null check (status in ('done', 'partial', 'missed')),
    updated_at timestamptz not null default now(),
    primary key (block_id, day)
);

-- ── Weekly review ──
create table if not exists public.weekly_reviews (
    -- the Monday the week starts on
    week_start date primary key check (extract(isodow from week_start) = 1),
    went_well text,
    got_in_the_way text,
    change_next text,
    updated_at timestamptz not null default now()
);

-- ── Privacy ──
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.schedule_blocks enable row level security;
alter table public.schedule_block_logs enable row level security;
alter table public.weekly_reviews enable row level security;

drop policy if exists "admin only" on public.habits;
create policy "admin only" on public.habits for all to authenticated
    using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "admin only" on public.habit_logs;
create policy "admin only" on public.habit_logs for all to authenticated
    using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "admin only" on public.schedule_blocks;
create policy "admin only" on public.schedule_blocks for all to authenticated
    using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "admin only" on public.schedule_block_logs;
create policy "admin only" on public.schedule_block_logs for all to authenticated
    using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "admin only" on public.weekly_reviews;
create policy "admin only" on public.weekly_reviews for all to authenticated
    using (public.is_site_admin()) with check (public.is_site_admin());

commit;
