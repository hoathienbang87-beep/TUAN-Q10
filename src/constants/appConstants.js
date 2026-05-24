export const CUSTOMER_STATUS_OPTIONS = [
  { value: "new", label: "Mới" },
  { value: "contacted", label: "Đã liên hệ" },
  { value: "quoted", label: "Đã báo giá" },
  { value: "won", label: "Đã mua" },
  { value: "lost", label: "Mất khách" },
];

export const ACTIVITY_TYPE_OPTIONS = [
  { value: "call", label: "Gọi điện" },
  { value: "meeting", label: "Gặp mặt" },
  { value: "zalo", label: "Zalo" },
  { value: "email", label: "Email" },
  { value: "note", label: "Ghi chú" },
  { value: "quote", label: "Báo giá" },
  { value: "other", label: "Khác" },
];

export const PRODUCT_STATUS_OPTIONS = [
  { value: "active", label: "Đang bán" },
  { value: "inactive", label: "Ngưng bán" },
];

export const PRODUCT_CATEGORY_OPTIONS = [
  "porcelain",
  "ceramic",
  "large slab",
  "stone look",
  "marble look",
  "wood look",
  "outdoor",
  "mosaic",
];

export const ORDER_STATUS_OPTIONS = [
  { value: "draft", label: "Nháp" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "delivering", label: "Đang giao" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã hủy" },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: "unpaid", label: "Chưa thu" },
  { value: "partial", label: "Thu một phần" },
  { value: "paid", label: "Đã thu đủ" },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Tiền mặt" },
  { value: "bank_transfer", label: "Chuyển khoản" },
  { value: "card", label: "Thẻ" },
  { value: "other", label: "Khác" },
];

export const PROFILE_ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Quản lý" },
  { value: "sales", label: "Sale" },
  { value: "warehouse", label: "Kho" },
];

export const PROFILE_STATUS_OPTIONS = [
  { value: "active", label: "Đang hoạt động" },
  { value: "blocked", label: "Đã khóa" },
];

export const STOCK_MOVEMENT_TYPE_OPTIONS = [
  { value: "in", label: "Nhập kho" },
  { value: "out", label: "Xuất kho" },
  { value: "adjustment", label: "Điều chỉnh kho" },
];