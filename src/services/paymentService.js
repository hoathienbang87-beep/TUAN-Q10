import { supabase } from "../supabaseClient";

const PAYMENT_SELECT =
  "id, order_id, amount, payment_method, payment_date, note, created_by, created_at, updated_at";

export async function getPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_SELECT)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createPayment(payload) {
  const { data, error } = await supabase
    .from("payments")
    .insert(payload)
    .select(PAYMENT_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}