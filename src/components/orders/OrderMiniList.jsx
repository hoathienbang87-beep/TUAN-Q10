import { formatCurrency, getOrderStatusLabel } from "../../utils/format";

function OrderMiniList({ orders, customers }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có đơn hàng</h3>
        <p>Vào menu Đơn hàng để tạo đơn đầu tiên.</p>
      </div>
    );
  }

  return (
    <div className="mini-list">
      {orders.map((order) => {
        const customer = customers.find((item) => item.id === order.customer_id);

        return (
          <div className="mini-list-item" key={order.id}>
            <div>
              <strong>{order.order_code}</strong>
              <p>{customer?.name || "Không rõ khách"}</p>
            </div>
            <div className="mini-list-right">
              <span className={`status-pill order-status-${order.status}`}>
                {getOrderStatusLabel(order.status)}
              </span>
              <strong>{formatCurrency(order.total_amount)}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OrderMiniList;