import {
  ACTIVITY_TYPE_OPTIONS,
  CUSTOMER_STATUS_OPTIONS,
  ORDER_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
} from "../constants/appConstants";

export function getCustomerStatusLabel(status) {
  const found = CUSTOMER_STATUS_OPTIONS.find((item) => item.value === status);
  return found?.label || status;
}

export function getActivityTypeLabel(type) {
  const found = ACTIVITY_TYPE_OPTIONS.find((item) => item.value === type);
  return found?.label || type;
}

export function getProductStatusLabel(status) {
  const found = PRODUCT_STATUS_OPTIONS.find((item) => item.value === status);
  return found?.label || status;
}

export function getOrderStatusLabel(status) {
  const found = ORDER_STATUS_OPTIONS.find((item) => item.value === status);
  return found?.label || status;
}

export function getPaymentStatusLabel(status) {
  const found = PAYMENT_STATUS_OPTIONS.find((item) => item.value === status);
  return found?.label || status;
}

export function getPaymentMethodLabel(method) {
  const found = PAYMENT_METHOD_OPTIONS.find((item) => item.value === method);
  return found?.label || method;
}

export function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}