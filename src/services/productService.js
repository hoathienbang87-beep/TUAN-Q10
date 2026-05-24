import { supabase } from "../supabaseClient";

const PRODUCT_SELECT =
  "id, code, name, category, size, surface, origin, price, stock_qty, image_url, status, created_at, updated_at";

const DEFAULT_PAGE_SIZE = 500;

export async function getProducts({ page = 0, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

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
