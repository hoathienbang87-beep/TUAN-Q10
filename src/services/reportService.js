import { getTodayString } from "../utils/format";

export function buildReports({
  customers = [],
  orders = [],
  products = [],
  payments = [],
  activities = [],
}) {
  const activeOrders = orders.filter((order) => order.status !== "cancelled");

  const totalRevenue = activeOrders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0
  );

  const totalPaid = activeOrders.reduce(
    (sum, order) => sum + Number(order.paid_amount || 0),
    0
  );

  const totalDebt = activeOrders.reduce(
    (sum, order) => sum + Number(order.debt_amount || 0),
    0
  );

  const orderStatusCounts = countBy(orders, "status");
  const paymentStatusCounts = countBy(activeOrders, "payment_status");
  const customerStatusCounts = countBy(customers, "status");

  const topCustomers = buildTopCustomers(activeOrders, customers);
  const topProducts = buildTopProducts(activeOrders, products);

  const lowStockProducts = products
    .filter((product) => Number(product.stock_qty || 0) <= 10)
    .sort((a, b) => Number(a.stock_qty || 0) - Number(b.stock_qty || 0))
    .slice(0, 10);

  const today = getTodayString();

  const dueActivities = activities
    .filter((activity) => activity.next_follow_up && activity.next_follow_up <= today)
    .slice(0, 10);

  const paymentMethodSummary = buildPaymentMethodSummary(payments);

  return {
    totalRevenue,
    totalPaid,
    totalDebt,
    totalOrders: orders.length,
    totalCustomers: customers.length,
    totalProducts: products.length,
    orderStatusCounts,
    paymentStatusCounts,
    customerStatusCounts,
    topCustomers,
    topProducts,
    lowStockProducts,
    dueActivities,
    paymentMethodSummary,
  };
}

function countBy(items, field) {
  return items.reduce((result, item) => {
    const key = item[field] || "unknown";
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
}

function buildTopCustomers(orders, customers) {
  const map = new Map();

  orders.forEach((order) => {
    const current = map.get(order.customer_id) || {
      customer_id: order.customer_id,
      order_count: 0,
      total_amount: 0,
      paid_amount: 0,
      debt_amount: 0,
    };

    current.order_count += 1;
    current.total_amount += Number(order.total_amount || 0);
    current.paid_amount += Number(order.paid_amount || 0);
    current.debt_amount += Number(order.debt_amount || 0);

    map.set(order.customer_id, current);
  });

  return Array.from(map.values())
    .map((item) => {
      const customer = customers.find((customer) => customer.id === item.customer_id);

      return {
        ...item,
        customer_name: customer?.name || "Không rõ khách",
        customer_phone: customer?.phone || "",
      };
    })
    .sort((a, b) => b.total_amount - a.total_amount)
    .slice(0, 10);
}

function buildTopProducts(orders, products) {
  const map = new Map();

  orders.forEach((order) => {
    const items = order.order_items || [];

    items.forEach((item) => {
      const current = map.get(item.product_id) || {
        product_id: item.product_id,
        quantity: 0,
        total_amount: 0,
        order_count: 0,
      };

      current.quantity += Number(item.quantity || 0);
      current.total_amount += Number(item.line_total || 0);
      current.order_count += 1;

      map.set(item.product_id, current);
    });
  });

  return Array.from(map.values())
    .map((item) => {
      const product = products.find((product) => product.id === item.product_id);

      return {
        ...item,
        product_code: product?.code || "Không rõ mã",
        product_name: product?.name || "Không rõ sản phẩm",
        product_size: product?.size || "",
      };
    })
    .sort((a, b) => b.total_amount - a.total_amount)
    .slice(0, 10);
}

function buildPaymentMethodSummary(payments) {
  const map = new Map();

  payments.forEach((payment) => {
    const key = payment.payment_method || "unknown";

    const current = map.get(key) || {
      payment_method: key,
      count: 0,
      total_amount: 0,
    };

    current.count += 1;
    current.total_amount += Number(payment.amount || 0);

    map.set(key, current);
  });

  return Array.from(map.values()).sort((a, b) => b.total_amount - a.total_amount);
}