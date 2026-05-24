-- Fix hard reset order for customer/product/order dependencies.

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
    delete from public.payments;
  end if;

  if p_scope in ('all', 'stock') then
    delete from public.stock_movements;
  end if;

  if p_scope in ('all', 'orders') then
    delete from public.payments;
    delete from public.stock_movements where order_id is not null;
    delete from public.order_items;
    delete from public.orders;
  end if;

  if p_scope in ('all', 'activities') then
    delete from public.customer_activities;
  end if;

  if p_scope in ('all', 'kpi') then
    delete from public.kpi_targets;
  end if;

  if p_scope = 'products' then
    delete from public.payments;
    delete from public.stock_movements;
    delete from public.order_items;
    delete from public.orders;
    delete from public.products;
  elsif p_scope = 'customers' then
    delete from public.payments;
    delete from public.stock_movements where order_id is not null;
    delete from public.order_items;
    delete from public.orders;
    delete from public.customer_activities;
    delete from public.customers;
  elsif p_scope = 'all' then
    delete from public.products;
    delete from public.customers;
  end if;
end;
$$;

revoke all on function public.hard_reset_business_data(text, text) from public;
grant execute on function public.hard_reset_business_data(text, text) to authenticated;
