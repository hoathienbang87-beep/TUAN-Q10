import { supabase } from "../supabaseClient";

export const ADMIN_DATA_SCOPES = [
  {
    key: "customers",
    label: "Khách hàng",
    description: "Ẩn khách hàng kèm lịch sử chăm sóc, đơn hàng và thanh toán liên quan.",
  },
  {
    key: "products",
    label: "Sản phẩm",
    description: "Ẩn sản phẩm khỏi danh mục và form chọn sản phẩm.",
  },
  {
    key: "orders",
    label: "Đơn hàng",
    description: "Ẩn đơn hàng kèm dòng hàng và thanh toán liên quan.",
  },
  {
    key: "payments",
    label: "Công nợ / thanh toán",
    description: "Ẩn lịch sử thanh toán đã ghi nhận.",
  },
  {
    key: "stock",
    label: "Kho",
    description: "Ẩn lịch sử phiếu kho.",
  },
  {
    key: "activities",
    label: "Chăm sóc KH",
    description: "Ẩn lịch sử chăm sóc khách hàng.",
  },
  {
    key: "kpi",
    label: "KPI",
    description: "Ẩn chỉ tiêu KPI đã nhập.",
  },
];

export const HARD_RESET_SCOPES = [
  { key: "all", label: "Toàn bộ dữ liệu vận hành" },
  ...ADMIN_DATA_SCOPES,
];

export async function softDeleteBusinessData(scope) {
  const { error } = await supabase.rpc("soft_delete_business_data", {
    p_scope: scope,
  });

  if (error) {
    throw error;
  }
}

export async function hardResetBusinessData(scope, confirmation) {
  const { error } = await supabase.rpc("hard_reset_business_data", {
    p_scope: scope,
    p_confirmation: confirmation,
  });

  if (error) {
    throw error;
  }
}
