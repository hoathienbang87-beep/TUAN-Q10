import { supabase } from "../supabaseClient";

export async function getStats() {
  const [productsResult, customersResult, ordersResult] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
  ]);

  if (productsResult.error) {
    throw productsResult.error;
  }

  if (customersResult.error) {
    throw customersResult.error;
  }

  if (ordersResult.error) {
    throw ordersResult.error;
  }

  return {
    products: productsResult.count || 0,
    customers: customersResult.count || 0,
    orders: ordersResult.count || 0,
  };
}