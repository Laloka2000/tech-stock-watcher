create function public.enforce_watchlist_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if (
        select count(*)
        from public.watchlist_items
        where user_id = new.user_id
    ) >= 20 then
        raise exception 'watchlist_limit_reached'
            using hint = 'A watchlist can contain a maximum of 20 tickers.';
    end if;

    return new;
end;
$$;

create trigger watchlist_items_limit
before insert on public.watchlist_items
for each row
execute function public.enforce_watchlist_limit();