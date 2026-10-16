-- Completion date for the reading log (year filter on /library).
-- `date`, not `timestamptz`: a book finished late on Dec 31 must not drift into the next year by timezone.
-- Run in the Supabase SQL editor BEFORE deploying the code that reads/writes completed_at.

alter table public.books
    add column if not exists completed_at date;

-- the date only means something for finished books
alter table public.books
    add constraint books_completed_at_only_when_completed
    check (completed_at is null or status = 'completed');
