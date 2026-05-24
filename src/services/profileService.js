import { supabase } from "../supabaseClient";

const PROFILE_SELECT =
  "id, email, full_name, role, department, status, created_at, updated_at";

export async function getProfileById(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function updateProfile(profileId, payload) {
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", profileId)
    .select(PROFILE_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}