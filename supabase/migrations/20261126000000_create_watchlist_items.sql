-- 1) Tábla
create table public.watchlist_items (
    id        uuid        primary key default gen_random_uuid(),
    user_id   uuid        not null default auth.uid()
                          references auth.users (id) on delete cascade,
    ticker    text        not null check (ticker ~ '^[A-Z]{1,5}$'),
    added_at  timestamptz not null default now(),

    unique (user_id, ticker)
);

-- 2) Jogosultságok: ki milyen műveletet végezhet egyáltalán
revoke all on public.watchlist_items from anon;
grant select, insert, delete on public.watchlist_items to authenticated;

-- 3) Row Level Security bekapcsolása
alter table public.watchlist_items enable row level security;

-- 4) Policy-k: melyik SOROKRA vonatkozik a művelet
create policy "Users can view own watchlist"
on public.watchlist_items for select
to authenticated
using ( (select auth.uid()) = user_id );

create policy "Users can add to own watchlist"
on public.watchlist_items for insert
to authenticated
with check ( (select auth.uid()) = user_id );

create policy "Users can remove from own watchlist"
on public.watchlist_items for delete
to authenticated
using ( (select auth.uid()) = user_id );