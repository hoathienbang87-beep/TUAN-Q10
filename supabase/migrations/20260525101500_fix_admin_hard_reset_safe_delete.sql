-- Supabase can enforce safe updates/deletes and reject DELETE without WHERE.
-- This version keeps the same admin checks but uses explicit WHERE clauses.

create or replace function public.hard_reset_business_data(
  p_scope text,
  p_confirmation text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.app_has_role(array['admin']) then
    raise exception 'Only admin can hard reset business data';
  end if;

  if p_confirmation <> 'RESET DATA' then
    raise exception 'Invalid confirmation';
  end if;

  if p_scope not in ('all', 'customers', 'products', 'orders', 'payments', 'stock', 'activities', 'kpi') then
    raise exception 'Invalid hard reset scope';
  end if;

  if p_scope in ('all', 'payments') then
    delete from public.payments where true;
  end if;

  if p_scope in ('all', 'stock') then
    delete from public.stock_movements where true;
  end if;

  if p_scope in ('all', 'orders') then
    delete from public.payments where true;
    delete from public.stock_movements where order_id is not null;
    delete from public.order_items where true;
    delete from public.orders where true;
  end if;

  if p_scope in ('all', 'activities') then
    delete from public.customer_activities where true;
  end if;

  if p_scope in ('all', 'kpi') then
    delete from public.kpi_targets where true;
  end if;

  if p_scope = 'products' then
    delete from public.payments where true;
    delete from public.stock_movements where true;
    delete from public.order_items where true;
    delete from public.orders where true;
    delete from public.products where true;
  elsif p_scope = 'customers' then
    delete from public.payments where true;
    delete from public.stock_movements where order_id is not null;
    delete from public.order_items where true;
    delete from public.orders where true;
    delete from public.customer_activities where true;
    delete from public.customers where true;
  elsif p_scope = 'all' then
    delete from public.products where true;
    delete from public.customers where true;
  end if;
end;
$$;

revoke all on function public.hard_reset_business_data(text, text) from public;
grant execute on function public.hard_reset_business_data(text, text) to authenticated;
