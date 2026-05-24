import { supabase } from "../supabaseClient";

const ACTIVITY_SELECT =
  "id, customer_id, activity_type, note, next_follow_up, created_by, created_at";

export async function getActivities() {
  const { data, error } = await supabase
    .from("customer_activities")
    .select(ACTIVITY_SELECT)
    .order("created_at", { ascending: false });

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