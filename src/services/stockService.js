import { supabase } from "../supabaseClient";

const STOCK_MOVEMENT_SELECT =
  "id, product_id, order_id, movement_type, quantity, note, created_by, created_at";

const DEFAULT_PAGE_SIZE = 500;

export async function getStockMovements({ page = 0, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("stock_movements")
    .select(STOCK_MOVEMENT_SELECT)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createStockMovement(payload) {
  const { data, error } = await supabase
    .rpc("create_stock_movement", {
      p_product_id: payload.product_id,
      p_movement_type: payload.movement_type,
      p_quantity: payload.quantity,
      p_note: payload.note,
    });

  if (error) {
    throw error;
  }

  return data;
}
