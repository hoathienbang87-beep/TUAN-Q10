import { supabase } from "../supabaseClient";

const KPI_TARGET_SELECT =
  "id, sale_id, target_month, target_revenue, target_customers, target_activities, target_orders, note, created_by, updated_by, created_at, updated_at";

const DEFAULT_PAGE_SIZE = 500;

export async function getKpiTargets({ page = 0, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("kpi_targets")
    .select(KPI_TARGET_SELECT)
    .is("deleted_at", null)
    .order("target_month", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function saveKpiTarget(payload) {
  const { sale_id, target_month } = payload;

  const { data: existing, error: findError } = await supabase
    .from("kpi_targets")
    .select("id")
    .eq("sale_id", sale_id)
    .eq("target_month", target_month)
    .is("deleted_at", null)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (existing?.id) {
    const { data, error } = await supabase
      .from("kpi_targets")
      .update(payload)
      .eq("id", existing.id)
      .select(KPI_TARGET_SELECT)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabase
    .from("kpi_targets")
    .insert(payload)
    .select(KPI_TARGET_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
