-- Admin/manager data maintenance helpers.
-- Apply after 20260524090000_security_rpc_and_rls.sql.

alter table public.customers add column if not exists deleted_at timestamptz;
alter table public.customers add column if not exists deleted_by uuid references auth.users(id);

alter table public.customer_activities add column if not exists deleted_at timestamptz;
alter table public.customer_activities add column if not exists deleted_by uuid references auth.users(id);

alter table public.products add column if not exists deleted_at timestamptz;
alter table public.products add column if not exists deleted_by uuid references auth.users(id);

alter table public.orders add column if not exists deleted_at timestamptz;
alter table public.orders add column if not exists deleted_by uuid references auth.users(id);

alter table public.order_items add column if not exists deleted_at timestamptz;
alter table public.order_items add column if not exists deleted_by uuid references auth.users(id);

alter table public.payments add column if not exists deleted_at timestamptz;
alter table public.payments add column if not exists deleted_by uuid references auth.users(id);

alter table public.stock_movements add column if not exists deleted_at timestamptz;
alter table public.stock_movements add column if not exists deleted_by uuid references auth.users(id);

alter table public.kpi_targets add column if not exists deleted_at timestamptz;
alter table public.kpi_targets add column if not exists deleted_by uuid references auth.users(id);

create index if not exists customers_deleted_at_idx on public.customers (deleted_at);
create index if not exists customer_activities_deleted_at_idx on public.customer_activities (deleted_at);
create index if not exists products_deleted_at_idx on public.products (deleted_at);
create index if not exists orders_deleted_at_idx on public.orders (deleted_at);
create index if not exists order_items_deleted_at_idx on public.order_items (deleted_at);
create index if not exists payments_deleted_at_idx on public.payments (deleted_at);
create index if not exists stock_movements_deleted_at_idx on public.stock_movements (deleted_at);
create index if not exists kpi_targets_deleted_at_idx on public.kpi_targets (deleted_at);

drop policy if exists products_write_policy on public.products;
drop policy if exists products_insert_policy on public.products;
create policy products_insert_policy on public.products
for insert
to authenticated
with check (public.app_has_role(array['admin', 'manager', 'warehouse']));

drop policy if exists products_update_policy on public.products;
create policy products_update_policy on public.products
for update
to authenticated
using (public.app_has_role(array['admin', 'manager', 'warehouse']))
with check (public.app_has_role(array['admin', 'manager', 'warehouse']));

drop policy if exists kpi_targets_write_policy on public.kpi_targets;
drop policy if exists kpi_targets_insert_policy on public.kpi_targets;
create policy kpi_targets_insert_policy on public.kpi_targets
for insert
to authenticated
with check (public.app_has_role(array['admin', 'manager']));

drop policy if exists kpi_targets_update_policy on public.kpi_targets;
create policy kpi_targets_update_policy on public.kpi_targets
for update
to authenticated
using (public.app_has_role(array['admin', 'manager']))
with check (public.app_has_role(array['admin', 'manager']));

create or replace function public.soft_delete_business_data(p_scope text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.app_has_role(array['admin', 'manager']) then
    raise exception 'Only admin or manager can soft delete business data';
  end if;

  if p_scope not in ('customers', 'products', 'orders', 'payments', 'stock', 'activities', 'kpi') then
    raise exception 'Invalid soft delete scope';
  end if;

  if p_scope = 'customers' then
    update public.payments
    set deleted_at = coalesce(deleted_at, now()), deleted_by = auth.uid()
    where deleted_at is null
      and exists (
        select 1
        from public.orders
        where orders.id = payments.order_id
          and orders.deleted_at is null
      );

    update public.order_items
    set deleted_at = coalesce(deleted_at, now()), deleted_by = auth.uid()
    where deleted_at is null
      and exists (
        select 1
        from public.orders
        where orders.id = order_items.order_id
          and orders.deleted_at is null
      );

    update public.orders
    set deleted_at = coalesce(deleted_at, now()), deleted_by = auth.uid()
    where deleted_at is null;

    update public.customer_activities
    set deleted_at = coalesce(deleted_at, now()), deleted_by = auth.uid()
    where deleted_at is null;

    update public.customers
    set deleted_at = coalesce(deleted_at, now()), deleted_by = auth.uid()
    where deleted_at is null;
  elsif p_scope = 'products' then
    update public.products
    set deleted_at = coalesce(deleted_at, now()), deleted_by = auth.uid()
    where deleted_at is null;
  elsif p_scope = 'orders' then
    update public.payments
    set deleted_at = coalesce(deleted_at, now()), deleted_by = auth.uid()
    where deleted_at is null;

    update public.stock_movements
    set deleted_at = coalesce(deleted_at, now()), deleted_by = auth.uid()
    where deleted_at is null
      and order_id is not null;

    update public.order_items
    set deleted_at = coalesce(deleted_at, now()), deleted_by = auth.uid()
    where deleted_at is null;

    update public.orders
    set deleted_at = coalesce(deleted_at, now()), deleted_by = auth.uid()
    where deleted_at is null;
  elsif p_scope = 'payments' then
    update public.payments
    set deleted_at = coalesce(deleted_at, now()), deleted_by = auth.uid()
    where deleted_at is null;
  elsif p_scope = 'stock' then
    update public.stock_movements
    set deleted_at = coalesce(deleted_at, now()), deleted_by = auth.uid()
    where deleted_at is null;
  elsif p_scope = 'activities' then
    update public.customer_activities
    set deleted_at = coalesce(deleted_at, now()), deleted_by = auth.uid()
    where deleted_at is null;
  elsif p_scope = 'kpi' then
    update public.kpi_targets
    set deleted_at = coalesce(deleted_at, now()), deleted_by = auth.uid()
    where deleted_at is null;
  end if;
end;
$$;

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

revoke all on function public.soft_delete_business_data(text) from public;
grant execute on function public.soft_delete_business_data(text) to authenticated;

revoke all on function public.hard_reset_business_data(text, text) from public;
grant execute on function public.hard_reset_business_data(text, text) to authenticated;
