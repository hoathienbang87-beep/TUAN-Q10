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

const ORDER_BASE_SELECT =
  "id, customer_id, sales_id, order_code, status, total_amount, paid_amount, debt_amount, payment_status, note, created_at, updated_at";

export async function getOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createOrderWithItems(orderPayload, orderItems) {
  const { data: newOrder, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select(ORDER_BASE_SELECT)
    .single();

  if (orderError) {
    throw orderError;
  }

  const itemPayload = orderItems.map((item) => ({
    order_id: newOrder.id,
    product_id: item.product_id,
    quantity: Number(item.quantity) || 0,
    unit_price: Number(item.unit_price) || 0,
  }));

  const { error: itemError } = await supabase
    .from("order_items")
    .insert(itemPayload);

  if (itemError) {
    throw itemError;
  }

  return newOrder;
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