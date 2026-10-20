-- Notes replace reviews: a note has one title + body per language and cites zero or more books/games.
-- Run in the Supabase SQL editor BEFORE deploying the code that reads/writes notes.
-- The old `reviews` table is left untouched; drop it once the notes are confirmed in production.

begin;

create table if not exists public.notes (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- One row per language version of a note.
create table if not exists public.note_entries (
    note_id uuid not null references public.notes(id) on delete cascade,
    language text not null check (language in ('en', 'pt-BR')),
    title text not null check (length(trim(title)) > 0),
    body text not null check (length(trim(body)) > 0),
    -- the review this entry was migrated from, so old /reviews/<id> links can redirect
    legacy_review_id uuid unique,
    primary key (note_id, language)
);

-- What a note cites. One real foreign key per kind, so deleting a book or game drops its citations.
-- Music (Spotify) is deferred: it will need a snapshot instead of a foreign key.
create table if not exists public.note_refs (
    id uuid primary key default gen_random_uuid(),
    note_id uuid not null references public.notes(id) on delete cascade,
    book_id uuid references public.books(id) on delete cascade,
    game_id uuid references public.games(id) on delete cascade,
    position smallint not null default 0,
    constraint note_refs_exactly_one_subject check (num_nonnulls(book_id, game_id) = 1),
    constraint note_refs_unique_book unique (note_id, book_id),
    constraint note_refs_unique_game unique (note_id, game_id)
);

create index if not exists note_refs_book_idx on public.note_refs (book_id) where book_id is not null;
create index if not exists note_refs_game_idx on public.note_refs (game_id) where game_id is not null;
create index if not exists notes_created_at_idx on public.notes (created_at desc);

-- Creates (p_id null) or replaces a note with its entries and citations in one transaction.
-- p_entries: [{ "language": "en", "title": "...", "body": "..." }]
-- p_refs:    [{ "bookId": "<uuid>" } | { "gameId": "<uuid>" }], in display order
create or replace function public.save_note(
    p_id uuid,
    p_entries jsonb,
    p_refs jsonb default '[]'::jsonb,
    p_created_at timestamptz default null
) returns uuid
language plpgsql
as $$
declare
    v_id uuid;
begin
    if p_entries is null or jsonb_array_length(p_entries) = 0 then
        raise exception 'A note needs at least one language version' using errcode = '22023';
    end if;

    if p_id is null then
        insert into public.notes (created_at, updated_at)
        values (coalesce(p_created_at, now()), now())
        returning id into v_id;
    else
        update public.notes
        set updated_at = now(),
            created_at = coalesce(p_created_at, created_at)
        where id = p_id
        returning id into v_id;

        if v_id is null then
            raise exception 'Note not found' using errcode = 'P0002';
        end if;

        delete from public.note_refs where note_id = v_id;
    end if;

    -- upsert keeps legacy_review_id on entries that survive an edit
    insert into public.note_entries (note_id, language, title, body)
    select v_id, e->>'language', e->>'title', e->>'body'
    from jsonb_array_elements(p_entries) as e
    on conflict (note_id, language) do update
        set title = excluded.title,
            body = excluded.body;

    delete from public.note_entries
    where note_id = v_id
      and language not in (select e->>'language' from jsonb_array_elements(p_entries) as e);

    insert into public.note_refs (note_id, book_id, game_id, position)
    select v_id, (r->>'bookId')::uuid, (r->>'gameId')::uuid, (t.ord - 1)::smallint
    from jsonb_array_elements(coalesce(p_refs, '[]'::jsonb)) with ordinality as t(r, ord);

    return v_id;
end;
$$;

-- ── Migrate reviews ──
-- Reviews with the same title were language versions of one entry: they become one note.
-- The rating is dropped (notes have none); the review's book becomes the note's citation.
create temporary table review_groups on commit drop as
select lower(trim(title)) as title_key,
       gen_random_uuid() as note_id,
       min(created_at) as created_at
from public.reviews
where not exists (select 1 from public.note_entries ne where ne.legacy_review_id = reviews.id)
group by lower(trim(title));

insert into public.notes (id, created_at, updated_at)
select note_id, coalesce(created_at, now()), coalesce(created_at, now())
from review_groups;

insert into public.note_entries (note_id, language, title, body, legacy_review_id)
select distinct on (g.note_id, coalesce(r.language, 'en'))
       g.note_id, coalesce(r.language, 'en'), r.title, r.comment, r.id
from public.reviews r
join review_groups g on g.title_key = lower(trim(r.title))
order by g.note_id, coalesce(r.language, 'en'), r.created_at desc;

insert into public.note_refs (note_id, book_id)
select distinct g.note_id, r.book_id
from public.reviews r
join review_groups g on g.title_key = lower(trim(r.title))
join public.books b on b.id = r.book_id
on conflict do nothing;

commit;
