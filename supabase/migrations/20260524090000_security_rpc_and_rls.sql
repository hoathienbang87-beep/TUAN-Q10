-- Transactional RPCs and RLS policies for the Mini ERP app.
-- Apply this migration in Supabase before deploying the matching frontend code.

create or replace function public.app_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
    and status = 'active'
  limit 1
$$;

create or replace function public.app_has_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.app_profile_role() = any(allowed_roles), false)
$$;

create or replace function public.create_order_with_items(
  p_customer_id uuid,
  p_status text,
  p_note text,
  p_items jsonb
)
returns public.orders
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_order public.orders%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.app_has_role(array['admin', 'manager', 'sales']) then
    raise exception 'Insufficient permission to create orders';
  end if;

  if p_customer_id is null then
    raise exception 'Customer is required';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Order needs at least one item';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(product_id uuid, quantity numeric, unit_price numeric)
    where item.product_id is null
       or coalesce(item.quantity, 0) <= 0
       or coalesce(item.unit_price, 0) < 0
  ) then
    raise exception 'Invalid order item';
  end if;

  insert into public.orders (customer_id, sales_id, status, note)
  values (p_customer_id, auth.uid(), coalesce(nullif(p_status, ''), 'draft'), nullif(p_note, ''))
  returning * into new_order;

  insert into public.order_items (order_id, product_id, quantity, unit_price)
  select
    new_order.id,
    item.product_id,
    item.quantity,
    item.unit_price
  from jsonb_to_recordset(p_items) as item(product_id uuid, quantity numeric, unit_price numeric);

  return new_order;
end;
$$;

create or replace function public.record_payment(
  p_order_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_payment_date date,
  p_note text
)
returns public.payments
language plpgsql
security invoker
set search_path = public
as $$
declare
  target_order public.orders%rowtype;
  new_payment public.payments%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.app_has_role(array['admin', 'manager']) then
    raise exception 'Insufficient permission to record payments';
  end if;

  if coalesce(p_amount, 0) <= 0 then
    raise exception 'Payment amount must be greater than zero';
  end if;

  select *
  into target_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if p_amount > coalesce(target_order.debt_amount, 0) then
    raise exception 'Payment amount cannot exceed order debt';
  end if;

  insert into public.payments (
    order_id,
    amount,
    payment_method,
    payment_date,
    note,
    created_by
  )
  values (
    p_order_id,
    p_amount,
    coalesce(nullif(p_payment_method, ''), 'bank_transfer'),
    coalesce(p_payment_date, current_date),
    nullif(p_note, ''),
    auth.uid()
  )
  returning * into new_payment;

  return new_payment;
end;
$$;

create or replace function public.create_stock_movement(
  p_product_id uuid,
  p_movement_type text,
  p_quantity numeric,
  p_note text
)
returns public.stock_movements
language plpgsql
security invoker
set search_path = public
as $$
declare
  target_product public.products%rowtype;
  new_movement public.stock_movements%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.app_has_role(array['admin', 'manager', 'warehouse']) then
    raise exception 'Insufficient permission to create stock movements';
  end if;

  if p_movement_type not in ('in', 'out', 'adjustment') then
    raise exception 'Invalid movement type';
  end if;

  if coalesce(p_quantity, 0) = 0 then
    raise exception 'Quantity must be different from zero';
  end if;

  if p_movement_type in ('in', 'out') and p_quantity < 0 then
    raise exception 'Stock in/out movements must use positive quantity';
  end if;

  select *
  into target_product
  from public.products
  where id = p_product_id
  for update;

  if not found then
    raise exception 'Product not found';
  end if;

  if p_movement_type = 'out' and coalesce(target_product.stock_qty, 0) < p_quantity then
    raise exception 'Not enough stock';
  end if;

  insert into public.stock_movements (
    product_id,
    movement_type,
    quantity,
    note,
    created_by
  )
  values (
    p_product_id,
    p_movement_type,
    p_quantity,
    nullif(p_note, ''),
    auth.uid()
  )
  returning * into new_movement;

  return new_movement;
end;
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.customer_activities enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.stock_movements enable row level security;
alter table public.kpi_targets enable row level security;

drop policy if exists profiles_select_policy on public.profiles;
create policy profiles_select_policy on public.profiles
for select
to authenticated
using (id = auth.uid() or public.app_has_role(array['admin', 'manager']));

drop policy if exists profiles_update_policy on public.profiles;
create policy profiles_update_policy on public.profiles
for update
to authenticated
using (public.app_has_role(array['admin']))
with check (public.app_has_role(array['admin']));

drop policy if exists products_select_policy on public.products;
create policy products_select_policy on public.products
for select
to authenticated
using (public.app_profile_role() is not null);

drop policy if exists products_write_policy on public.products;
create policy products_write_policy on public.products
for all
to authenticated
using (public.app_has_role(array['admin', 'manager', 'warehouse']))
with check (public.app_has_role(array['admin', 'manager', 'warehouse']));

drop policy if exists customers_select_policy on public.customers;
create policy customers_select_policy on public.customers
for select
to authenticated
using (public.app_profile_role() is not null);

drop policy if exists customers_insert_policy on public.customers;
create policy customers_insert_policy on public.customers
for insert
to authenticated
with check (
  public.app_has_role(array['admin', 'manager', 'sales'])
  and created_by = auth.uid()
);

drop policy if exists customers_update_policy on public.customers;
create policy customers_update_policy on public.customers
for update
to authenticated
using (
  public.app_has_role(array['admin', 'manager'])
  or assigned_to = auth.uid()
  or created_by = auth.uid()
)
with check (
  public.app_has_role(array['admin', 'manager'])
  or assigned_to = auth.uid()
  or created_by = auth.uid()
);

drop policy if exists activities_select_policy on public.customer_activities;
create policy activities_select_policy on public.customer_activities
for select
to authenticated
using (public.app_profile_role() is not null);

drop policy if exists activities_insert_policy on public.customer_activities;
create policy activities_insert_policy on public.customer_activities
for insert
to authenticated
with check (
  public.app_has_role(array['admin', 'manager', 'sales'])
  and created_by = auth.uid()
);

drop policy if exists orders_select_policy on public.orders;
create policy orders_select_policy on public.orders
for select
to authenticated
using (public.app_profile_role() is not null);

drop policy if exists orders_insert_policy on public.orders;
create policy orders_insert_policy on public.orders
for insert
to authenticated
with check (
  public.app_has_role(array['admin', 'manager', 'sales'])
  and sales_id = auth.uid()
);

drop policy if exists orders_update_policy on public.orders;
create policy orders_update_policy on public.orders
for update
to authenticated
using (
  public.app_has_role(array['admin', 'manager'])
  or sales_id = auth.uid()
)
with check (
  public.app_has_role(array['admin', 'manager'])
  or sales_id = auth.uid()
);

drop policy if exists order_items_select_policy on public.order_items;
create policy order_items_select_policy on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
  )
);

drop policy if exists order_items_insert_policy on public.order_items;
create policy order_items_insert_policy on public.order_items
for insert
to authenticated
with check (
  public.app_has_role(array['admin', 'manager', 'sales'])
  and exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and (public.app_has_role(array['admin', 'manager']) or orders.sales_id = auth.uid())
  )
);

drop policy if exists payments_select_policy on public.payments;
create policy payments_select_policy on public.payments
for select
to authenticated
using (public.app_has_role(array['admin', 'manager', 'sales']));

drop policy if exists payments_insert_policy on public.payments;
create policy payments_insert_policy on public.payments
for insert
to authenticated
with check (
  public.app_has_role(array['admin', 'manager'])
  and created_by = auth.uid()
);

drop policy if exists stock_movements_select_policy on public.stock_movements;
create policy stock_movements_select_policy on public.stock_movements
for select
to authenticated
using (public.app_has_role(array['admin', 'manager', 'warehouse']));

drop policy if exists stock_movements_insert_policy on public.stock_movements;
create policy stock_movements_insert_policy on public.stock_movements
for insert
to authenticated
with check (
  public.app_has_role(array['admin', 'manager', 'warehouse'])
  and created_by = auth.uid()
);

drop policy if exists kpi_targets_select_policy on public.kpi_targets;
create policy kpi_targets_select_policy on public.kpi_targets
for select
to authenticated
using (
  public.app_has_role(array['admin', 'manager'])
  or sale_id = auth.uid()
);

drop policy if exists kpi_targets_write_policy on public.kpi_targets;
create policy kpi_targets_write_policy on public.kpi_targets
for all
to authenticated
using (public.app_has_role(array['admin', 'manager']))
with check (public.app_has_role(array['admin', 'manager']));
