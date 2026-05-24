import { supabase } from "../supabaseClient";

const ACTIVITY_SELECT =
  "id, customer_id, activity_type, note, next_follow_up, created_by, created_at";

const DEFAULT_PAGE_SIZE = 500;

export async function getActivities({ page = 0, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("customer_activities")
    .select(ACTIVITY_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createActivity(payload) {
  const { data, error } = await supabase
    .from("customer_activities")
    .insert(payload)
    .select(ACTIVITY_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
