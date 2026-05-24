import { supabase } from "../supabaseClient";

const STOCK_MOVEMENT_SELECT =
  "id, product_id, order_id, movement_type, quantity, note, created_by, created_at";

export async function getStockMovements() {
  const { data, error } = await supabase
    .from("stock_movements")
    .select(STOCK_MOVEMENT_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createStockMovement(payload) {
  const { data, error } = await supabase
    .from("stock_movements")
    .insert(payload)
    .select(STOCK_MOVEMENT_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}