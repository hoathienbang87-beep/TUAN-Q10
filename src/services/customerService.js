import { supabase } from "../supabaseClient";

const CUSTOMER_SELECT =
  "id, name, phone, address, source, status, assigned_to, created_by, created_at, updated_at";

const DEFAULT_PAGE_SIZE = 500;

export async function getCustomers({ page = 0, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("customers")
    .select(CUSTOMER_SELECT)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createCustomer(payload) {
  const { data, error } = await supabase
    .from("customers")
    .insert(payload)
    .select(CUSTOMER_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCustomerStatus(customerId, newStatus) {
  const { data, error } = await supabase
    .from("customers")
    .update({ status: newStatus })
    .eq("id", customerId)
    .select(CUSTOMER_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
