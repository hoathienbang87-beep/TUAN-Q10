import { supabase } from "../supabaseClient";

const ORDER_SELECT = `
  id,
  customer_id,
  sales_id,
  order_code,
  status,
  total_amount,
  paid_amount,
  debt_amount,
  payment_status,
  note,
  created_at,
  updated_at,
  order_items (
    id,
    order_id,
    product_id,
    quantity,
    unit_price,
    line_total,
    created_at
  )
`;

const DEFAULT_PAGE_SIZE = 500;

export async function getOrders({ page = 0, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createOrderWithItems(orderPayload, orderItems) {
  const items = orderItems.map((item) => ({
    product_id: item.product_id,
    quantity: Number(item.quantity) || 0,
    unit_price: Number(item.unit_price) || 0,
  }));

  const { data, error } = await supabase.rpc("create_order_with_items", {
    p_customer_id: orderPayload.customer_id,
    p_status: orderPayload.status,
    p_note: orderPayload.note,
    p_items: items,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function updateOrderStatus(orderId, newStatus) {
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) {
    throw error;
  }
}
