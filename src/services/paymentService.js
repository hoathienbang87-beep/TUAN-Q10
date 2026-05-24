import { supabase } from "../supabaseClient";

const PAYMENT_SELECT =
  "id, order_id, amount, payment_method, payment_date, note, created_by, created_at, updated_at";

const DEFAULT_PAGE_SIZE = 500;

export async function getPayments({ page = 0, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_SELECT)
    .is("deleted_at", null)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createPayment(payload) {
  const { data, error } = await supabase
    .rpc("record_payment", {
      p_order_id: payload.order_id,
      p_amount: payload.amount,
      p_payment_method: payload.payment_method,
      p_payment_date: payload.payment_date,
      p_note: payload.note,
    });

  if (error) {
    throw error;
  }

  return data;
}
