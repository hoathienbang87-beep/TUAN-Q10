import { supabase } from "../supabaseClient";

const PRODUCT_SELECT =
  "id, code, name, category, size, surface, origin, price, stock_qty, image_url, status, created_at, updated_at";

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createProduct(payload) {
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select(PRODUCT_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProduct(productId, payload) {
  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", productId)
    .select(PRODUCT_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}