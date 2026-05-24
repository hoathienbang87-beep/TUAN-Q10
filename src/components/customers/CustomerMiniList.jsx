import { getCustomerStatusLabel } from "../../utils/format";

function CustomerMiniList({ customers }) {
  if (!customers || customers.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có khách hàng</h3>
        <p>Vào menu Khách hàng để thêm khách đầu tiên.</p>
      </div>
    );
  }

  return (
    <div className="mini-list">
      {customers.map((customer) => (
        <div className="mini-list-item" key={customer.id}>
          <div>
            <strong>{customer.name}</strong>
            <p>{customer.phone || "Chưa có SĐT"}</p>
          </div>
          <span className={`status-pill status-${customer.status}`}>
            {getCustomerStatusLabel(customer.status)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default CustomerMiniList;