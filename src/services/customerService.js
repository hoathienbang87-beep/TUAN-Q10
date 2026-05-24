import { supabase } from "../supabaseClient";

const CUSTOMER_SELECT =
  "id, name, phone, address, source, status, assigned_to, created_by, created_at, updated_at";

export async function getCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select(CUSTOMER_SELECT)
    .order("created_at", { ascending: false });

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