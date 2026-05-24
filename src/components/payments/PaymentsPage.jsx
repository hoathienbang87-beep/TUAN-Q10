import { useMemo, useState } from "react";
import { PAYMENT_METHOD_OPTIONS } from "../../constants/appConstants";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "../../utils/format";

function PaymentsPage({
  profile,
  customers,
  orders,
  payments,
  paymentSaving,
  onCreatePayment,
  onReloadPayments,
}) {
  const canCreatePayment = ["admin", "manager"].includes(profile?.role);

  const [paymentForm, setPaymentForm] = useState({
    order_id: "",
    amount: "",
    payment_method: "bank_transfer",
    payment_date: getTodayInputValue(),
    note: "",
  });

  const [searchText, setSearchText] = useState("");
  const [expandedCustomerIds, setExpandedCustomerIds] = useState(() => new Set());

  const selectedOrder = orders.find((order) => order.id === paymentForm.order_id);
  const selectedCustomer = selectedOrder
    ? customers.find((customer) => customer.id === selectedOrder.customer_id)
    : null;

  const filteredOrders = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return orders;
    }

    return orders.filter((order) => {
      const customer = customers.find((item) => item.id === order.customer_id);

      return (
        order.order_code?.toLowerCase().includes(keyword) ||
        order.payment_status?.toLowerCase().includes(keyword) ||
        getPaymentStatusLabel(order.payment_status)?.toLowerCase().includes(keyword) ||
        customer?.name?.toLowerCase().includes(keyword) ||
        customer?.phone?.toLowerCase().includes(keyword)
      );
    });
  }, [orders, customers, searchText]);

  const groupedDebtOrders = useMemo(() => {
    return groupOrdersByCustomer(filteredOrders, customers);
  }, [filteredOrders, customers]);

  const selectedOrderPayments = payments.filter(
    (payment) => payment.order_id === paymentForm.order_id
  );

  function updatePaymentField(field, value) {
    setPaymentForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function chooseOrder(orderId) {
    setPaymentForm((current) => ({
      ...current,
      order_id: orderId,
      amount: "",
      note: "",
    }));
  }

  function toggleCustomerGroup(customerId) {
    setExpandedCustomerIds((current) => {
      const next = new Set(current);

      if (next.has(customerId)) {
        next.delete(customerId);
      } else {
        next.add(customerId);
      }

      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const success = await onCreatePayment(paymentForm);

    if (success) {
      setPaymentForm({
        order_id: "",
        amount: "",
        payment_method: "bank_transfer",
        payment_date: getTodayInputValue(),
        note: "",
      });
    }
  }

  return (
    <div className="customer-page-stack">
      <div className="module-grid paired-panels">
        <section className="card paired-panel">
          <div className="section-header">
            <div>
              <h2>Ghi nhận thanh toán</h2>
              <p className="muted">
                Một đơn hàng có thể thanh toán nhiều lần.
              </p>
            </div>

            <span className="badge">{profile?.role}</span>
          </div>

          {!canCreatePayment ? (
            <div className="empty-state">
              <h3>Chỉ xem công nợ</h3>
              <p>
                Role hiện tại chỉ xem được công nợ. Ghi nhận thanh toán dành cho
                admin hoặc manager.
              </p>
            </div>
          ) : (
            <form className="customer-form" onSubmit={handleSubmit}>
              <div className="field">
                <label>Đơn hàng *</label>
                <select
                  value={paymentForm.order_id}
                  onChange={(event) =>
                    updatePaymentField("order_id", event.target.value)
                  }
                  required
                >
                  <option value="">Chọn đơn hàng</option>
                  {orders.map((order) => {
                    const customer = customers.find(
                      (item) => item.id === order.customer_id
                    );

                    return (
                      <option key={order.id} value={order.id}>
                        {order.order_code} - {customer?.name || "Không rõ khách"} - còn nợ{" "}
                        {formatCurrency(order.debt_amount)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedOrder && (
                <div className="payment-summary-box">
                  <div>
                    <span>Khách hàng</span>
                    <strong>{selectedCustomer?.name || "Không rõ khách"}</strong>
                  </div>

                  <div>
                    <span>Tổng đơn</span>
                    <strong>{formatCurrency(selectedOrder.total_amount)}</strong>
                  </div>

                  <div>
                    <span>Đã thu</span>
                    <strong>{formatCurrency(selectedOrder.paid_amount)}</strong>
                  </div>

                  <div>
                    <span>Còn nợ</span>
                    <strong>{formatCurrency(selectedOrder.debt_amount)}</strong>
                  </div>
                </div>
              )}

              <div className="form-grid">
                <div className="field">
                  <label>Số tiền thanh toán *</label>
                  <input
                    type="number"
                    min="0"
                    value={paymentForm.amount}
                    onChange={(event) =>
                      updatePaymentField("amount", event.target.value)
                    }
                    placeholder="VD: 1000000"
                    required
                  />
                </div>

                <div className="field">
                  <label>Ngày thanh toán</label>
                  <input
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(event) =>
                      updatePaymentField("payment_date", event.target.value)
                    }
                  />
                </div>

                <div className="field">
                  <label>Phương thức</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(event) =>
                      updatePaymentField("payment_method", event.target.value)
                    }
                  >
                    {PAYMENT_METHOD_OPTIONS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Ghi chú</label>
                <textarea
                  value={paymentForm.note}
                  onChange={(event) =>
                    updatePaymentField("note", event.target.value)
                  }
                  placeholder="VD: Khách chuyển khoản đợt 1, đặt cọc, thanh toán phần còn lại..."
                  rows={3}
                />
              </div>

              <button className="primary-btn" type="submit" disabled={paymentSaving}>
                {paymentSaving ? "Đang lưu..." : "Ghi nhận thanh toán"}
              </button>
            </form>
          )}
        </section>

        <section className="card paired-panel">
          <div className="section-header">
            <div>
              <h2>Công nợ đơn hàng</h2>
              <p className="muted">
                Theo dõi tổng đơn, đã thu, còn nợ và trạng thái thu tiền.
              </p>
            </div>

            <button className="secondary-btn" onClick={onReloadPayments}>
              Tải lại
            </button>
          </div>

          <div className="list-toolbar">
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm theo mã đơn, khách hàng, trạng thái..."
            />

            <span className="badge">{filteredOrders.length} đơn</span>
          </div>

          <div className="paired-scroll-body">
            <DebtOrderTable
              groups={groupedDebtOrders}
              expandedCustomerIds={expandedCustomerIds}
              selectedOrderId={paymentForm.order_id}
              onToggleCustomerGroup={toggleCustomerGroup}
              onChooseOrder={chooseOrder}
            />
          </div>
        </section>
      </div>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Lịch sử thanh toán</h2>
            <p className="muted">
              {selectedOrder
                ? `Đang xem đơn: ${selectedOrder.order_code}`
                : "Chọn một đơn hàng để xem lịch sử thanh toán riêng."}
            </p>
          </div>

          <span className="badge">
            {paymentForm.order_id ? selectedOrderPayments.length : payments.length} dòng
          </span>
        </div>

        <PaymentHistoryTable
          payments={paymentForm.order_id ? selectedOrderPayments : payments}
          orders={orders}
          customers={customers}
        />
      </section>
    </div>
  );
}

function DebtOrderTable({
  groups,
  expandedCustomerIds,
  selectedOrderId,
  onToggleCustomerGroup,
  onChooseOrder,
}) {
  if (!groups || groups.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có đơn hàng</h3>
        <p>Tạo đơn hàng trước, sau đó quay lại ghi nhận thanh toán.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Tổng đơn</th>
            <th>Đã thu</th>
            <th>Còn nợ</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {groups.map((group) => (
            <DebtOrderGroupRows
              group={group}
              key={group.customerId}
              isExpanded={expandedCustomerIds.has(group.customerId)}
              selectedOrderId={selectedOrderId}
              onToggle={() => onToggleCustomerGroup(group.customerId)}
              onChooseOrder={onChooseOrder}
            />
          ))}
          {/*
          {false && orders.map((order) => {
            const customer = customers.find((item) => item.id === order.customer_id);

            return (
              <tr
                key={order.id}
                className={selectedOrderId === order.id ? "selected-row" : ""}
              >
                <td>
                  <strong>{order.order_code}</strong>
                </td>

                <td>
                  <strong>{customer?.name || "Không rõ khách"}</strong>
                  <p className="table-subtext">{customer?.phone || ""}</p>
                </td>

                <td>{formatCurrency(order.total_amount)}</td>
                <td>{formatCurrency(order.paid_amount)}</td>

                <td>
                  <strong>{formatCurrency(order.debt_amount)}</strong>
                </td>

                <td>
                  <span className={`status-pill payment-status-${order.payment_status}`}>
                    {getPaymentStatusLabel(order.payment_status)}
                  </span>
                </td>

                <td>
                  <button
                    className="mini-btn"
                    type="button"
                    onClick={() => onChooseOrder(order.id)}
                  >
                    Chọn
                  </button>
                </td>
              </tr>
            );
          })}
          */}
        </tbody>
      </table>
    </div>
  );
}

function DebtOrderGroupRows({ group, isExpanded, selectedOrderId, onToggle, onChooseOrder }) {
  const totalDebt = group.orders.reduce(
    (sum, order) => sum + Number(order.debt_amount || 0),
    0
  );

  return (
    <>
      <tr className="table-group-row">
        <td colSpan={7}>
          <button
            className="table-group-button"
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
          >
            <span className="group-caret">{isExpanded ? "▾" : "▸"}</span>
            <strong>{group.customerName}</strong>
            <span>{group.orders.length} đơn</span>
            <span>Còn nợ {formatCurrency(totalDebt)}</span>
            {group.customerPhone && <span>{group.customerPhone}</span>}
          </button>
        </td>
      </tr>

      {isExpanded && group.orders.map((order) => (
        <tr
          key={order.id}
          className={selectedOrderId === order.id ? "selected-row" : ""}
        >
          <td>
            <strong>{order.order_code}</strong>
          </td>

          <td>
            <strong>{group.customerName}</strong>
            <p className="table-subtext">{group.customerPhone}</p>
          </td>

          <td>{formatCurrency(order.total_amount)}</td>
          <td>{formatCurrency(order.paid_amount)}</td>

          <td>
            <strong>{formatCurrency(order.debt_amount)}</strong>
          </td>

          <td>
            <span className={`status-pill payment-status-${order.payment_status}`}>
              {getPaymentStatusLabel(order.payment_status)}
            </span>
          </td>

          <td>
            <button
              className="mini-btn"
              type="button"
              onClick={() => onChooseOrder(order.id)}
            >
              Chọn
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}

function PaymentHistoryTable({ payments, orders, customers }) {
  if (!payments || payments.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có thanh toán</h3>
        <p>Ghi nhận thanh toán đầu tiên để xem lịch sử ở đây.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ngày thanh toán</th>
            <th>Đơn hàng</th>
            <th>Khách hàng</th>
            <th>Số tiền</th>
            <th>Phương thức</th>
            <th>Ghi chú</th>
            <th>Thời gian tạo</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((payment) => {
            const order = orders.find((item) => item.id === payment.order_id);
            const customer = order
              ? customers.find((item) => item.id === order.customer_id)
              : null;

            return (
              <tr key={payment.id}>
                <td>{formatDate(payment.payment_date)}</td>

                <td>
                  <strong>{order?.order_code || "Không rõ đơn"}</strong>
                </td>

                <td>{customer?.name || "Không rõ khách"}</td>

                <td>
                  <strong>{formatCurrency(payment.amount)}</strong>
                </td>

                <td>
                  <span className="badge">
                    {getPaymentMethodLabel(payment.payment_method)}
                  </span>
                </td>

                <td className="note-cell">{payment.note || "-"}</td>

                <td>{formatDateTime(payment.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function getTodayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function groupOrdersByCustomer(orders, customers) {
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
  const groupMap = new Map();

  orders.forEach((order) => {
    const customer = customerMap.get(order.customer_id);
    const customerId = order.customer_id || "unknown";
    const current = groupMap.get(customerId) || {
      customerId,
      customerName: customer?.name || "Không rõ khách",
      customerPhone: customer?.phone || "",
      orders: [],
    };

    current.orders.push(order);
    groupMap.set(customerId, current);
  });

  return Array.from(groupMap.values());
}

export default PaymentsPage;
