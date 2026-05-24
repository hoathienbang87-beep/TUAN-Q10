export function buildSalesKpis({
  profile,
  staffProfiles = [],
  customers = [],
  activities = [],
  orders = [],
  kpiTargets = [],
  selectedMonth,
}) {
  const activeOrders = orders.filter((order) => order.status !== "cancelled");

  const salesUsers = getSalesUsers({
    profile,
    staffProfiles,
    customers,
    activities,
    orders,
  });

  return salesUsers.map((sale) => {
    const saleCustomers = customers.filter((customer) => {
      return (
        (customer.assigned_to === sale.id || customer.created_by === sale.id) &&
        isInMonth(customer.created_at, selectedMonth)
      );
    });

    const saleActivities = activities.filter((activity) => {
      return activity.created_by === sale.id && isInMonth(activity.created_at, selectedMonth);
    });

    const saleOrders = activeOrders.filter((order) => {
      return order.sales_id === sale.id && isInMonth(order.created_at, selectedMonth);
    });

    const totalRevenue = saleOrders.reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    );

    const totalPaid = saleOrders.reduce(
      (sum, order) => sum + Number(order.paid_amount || 0),
      0
    );

    const totalDebt = saleOrders.reduce(
      (sum, order) => sum + Number(order.debt_amount || 0),
      0
    );

    const completedOrders = saleOrders.filter(
      (order) => order.status === "completed"
    );

    const uniqueOrderCustomerIds = new Set(
      saleOrders.map((order) => order.customer_id).filter(Boolean)
    );

    const conversionRate =
      saleCustomers.length > 0
        ? (uniqueOrderCustomerIds.size / saleCustomers.length) * 100
        : 0;

    const target = findTargetForSale({
      kpiTargets,
      saleId: sale.id,
      selectedMonth,
    });

    const targetRevenue = Number(target?.target_revenue || 0);
    const targetCustomers = Number(target?.target_customers || 0);
    const targetActivities = Number(target?.target_activities || 0);
    const targetOrders = Number(target?.target_orders || 0);

    const revenueCompletion = getCompletionRate(totalRevenue, targetRevenue);
    const customerCompletion = getCompletionRate(saleCustomers.length, targetCustomers);
    const activityCompletion = getCompletionRate(saleActivities.length, targetActivities);
    const orderCompletion = getCompletionRate(saleOrders.length, targetOrders);

    const overallCompletion = getAverageCompletion([
      { value: revenueCompletion, target: targetRevenue },
      { value: customerCompletion, target: targetCustomers },
      { value: activityCompletion, target: targetActivities },
      { value: orderCompletion, target: targetOrders },
    ]);

    return {
      sale_id: sale.id,
      sale_name: sale.full_name || sale.email || "Không rõ tên",
      sale_email: sale.email || "",
      role: sale.role || "sales",

      customer_count: saleCustomers.length,
      activity_count: saleActivities.length,
      order_count: saleOrders.length,
      completed_order_count: completedOrders.length,

      total_revenue: totalRevenue,
      total_paid: totalPaid,
      total_debt: totalDebt,

      conversion_rate: conversionRate,

      target_id: target?.id || "",
      target_revenue: targetRevenue,
      target_customers: targetCustomers,
      target_activities: targetActivities,
      target_orders: targetOrders,
      target_note: target?.note || "",

      revenue_completion: revenueCompletion,
      customer_completion: customerCompletion,
      activity_completion: activityCompletion,
      order_completion: orderCompletion,
      overall_completion: overallCompletion,

      latest_activity_at: getLatestDate(saleActivities, "created_at"),
      latest_order_at: getLatestDate(saleOrders, "created_at"),
    };
  });
}

function getSalesUsers({ profile, staffProfiles, customers, activities, orders }) {
  if (profile?.role === "sales") {
    return [profile];
  }

  const userMap = new Map();

  staffProfiles.forEach((item) => {
    if (["sales", "admin", "manager"].includes(item.role)) {
      userMap.set(item.id, item);
    }
  });

  customers.forEach((customer) => {
    if (customer.assigned_to && !userMap.has(customer.assigned_to)) {
      userMap.set(customer.assigned_to, {
        id: customer.assigned_to,
        full_name: "User chưa rõ tên",
        email: "",
        role: "sales",
      });
    }

    if (customer.created_by && !userMap.has(customer.created_by)) {
      userMap.set(customer.created_by, {
        id: customer.created_by,
        full_name: "User chưa rõ tên",
        email: "",
        role: "sales",
      });
    }
  });

  activities.forEach((activity) => {
    if (activity.created_by && !userMap.has(activity.created_by)) {
      userMap.set(activity.created_by, {
        id: activity.created_by,
        full_name: "User chưa rõ tên",
        email: "",
        role: "sales",
      });
    }
  });

  orders.forEach((order) => {
    if (order.sales_id && !userMap.has(order.sales_id)) {
      userMap.set(order.sales_id, {
        id: order.sales_id,
        full_name: "User chưa rõ tên",
        email: "",
        role: "sales",
      });
    }
  });

  return Array.from(userMap.values());
}

function findTargetForSale({ kpiTargets, saleId, selectedMonth }) {
  const targetMonth = `${selectedMonth}-01`;

  return kpiTargets.find((target) => {
    return target.sale_id === saleId && target.target_month === targetMonth;
  });
}

function isInMonth(value, selectedMonth) {
  if (!value || !selectedMonth) return false;
  return String(value).slice(0, 7) === selectedMonth;
}

function getCompletionRate(actual, target) {
  const safeTarget = Number(target || 0);

  if (safeTarget <= 0) {
    return 0;
  }

  return Math.min((Number(actual || 0) / safeTarget) * 100, 999);
}

function getAverageCompletion(items) {
  const validItems = items.filter((item) => Number(item.target || 0) > 0);

  if (validItems.length === 0) {
    return 0;
  }

  const total = validItems.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return total / validItems.length;
}

function getLatestDate(items, field) {
  if (!items || items.length === 0) return null;

  return items
    .map((item) => item[field])
    .filter(Boolean)
    .sort()
    .reverse()[0];
}