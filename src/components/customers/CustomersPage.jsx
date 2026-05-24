import { useMemo, useState } from "react";
import {
  ACTIVITY_TYPE_OPTIONS,
  CUSTOMER_STATUS_OPTIONS,
} from "../../constants/appConstants";
import { formatDate } from "../../utils/format";
import ActivityTimeline from "../care/ActivityTimeline";

function CustomersPage({
  profile,
  customers,
  activities,
  customerSaving,
  activitySaving,
  onCreateCustomer,
  onCreateActivity,
  onUpdateCustomerStatus,
  onReloadCustomers,
}) {
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    address: "",
    source: "",
    status: "new",
  });

  const [activityForm, setActivityForm] = useState({
    customer_id: "",
    activity_type: "call",
    note: "",
    next_follow_up: "",
  });

  const [searchText, setSearchText] = useState("");

  const selectedCustomer = customers.find(
    (customer) => customer.id === activityForm.customer_id
  );

  const filteredCustomers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(keyword) ||
        customer.phone?.toLowerCase().includes(keyword) ||
        customer.address?.toLowerCase().includes(keyword) ||
        customer.source?.toLowerCase().includes(keyword)
      );
    });
  }, [customers, searchText]);

  const selectedActivities = useMemo(() => {
    if (!activityForm.customer_id) {
      return activities.slice(0, 10);
    }

    return activities.filter(
      (activity) => activity.customer_id === activityForm.customer_id
    );
  }, [activities, activityForm.customer_id]);

  function updateCustomerField(field, value) {
    setCustomerForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateActivityField(field, value) {
    setActivityForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCustomerSubmit(event) {
    event.preventDefault();

    const success = await onCreateCustomer(customerForm);

    if (success) {
      setCustomerForm({
        name: "",
        phone: "",
        address: "",
        source: "",
        status: "new",
      });
    }
  }

  async function handleActivitySubmit(event) {
    event.preventDefault();

    const success = await onCreateActivity(activityForm);

    if (success) {
      setActivityForm((current) => ({
        ...current,
        activity_type: "call",
        note: "",
        next_follow_up: "",
      }));
    }
  }

  function selectCustomerForCare(customerId) {
    setActivityForm((current) => ({
      ...current,
      customer_id: customerId,
    }));
  }

  return (
    <div className="customer-page-stack">
      <div className="module-grid">
        <section className="card">
          <div className="section-header">
            <div>
              <h2>Thêm khách hàng</h2>
              <p className="muted">
                Khách mới sẽ được gán cho user đang đăng nhập.
              </p>
            </div>

            <span className="badge">{profile?.role}</span>
          </div>

          <form className="customer-form" onSubmit={handleCustomerSubmit}>
            <div className="form-grid">
              <div className="field">
                <label>Tên khách hàng *</label>
                <input
                  value={customerForm.name}
                  onChange={(event) =>
                    updateCustomerField("name", event.target.value)
                  }
                  placeholder="VD: Anh Minh / Công ty ABC"
                  required
                />
              </div>

              <div className="field">
                <label>Số điện thoại</label>
                <input
                  value={customerForm.phone}
                  onChange={(event) =>
                    updateCustomerField("phone", event.target.value)
                  }
                  placeholder="VD: 090..."
                />
              </div>

              <div className="field">
                <label>Nguồn khách</label>
                <input
                  value={customerForm.source}
                  onChange={(event) =>
                    updateCustomerField("source", event.target.value)
                  }
                  placeholder="VD: Facebook, KTS, showroom..."
                />
              </div>

              <div className="field">
                <label>Trạng thái</label>
                <select
                  value={customerForm.status}
                  onChange={(event) =>
                    updateCustomerField("status", event.target.value)
                  }
                >
                  {CUSTOMER_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label>Địa chỉ / ghi chú nhanh</label>
              <textarea
                value={customerForm.address}
                onChange={(event) =>
                  updateCustomerField("address", event.target.value)
                }
                placeholder="VD: Quận 2, đang xây nhà phố, quan tâm gạch 60x120..."
                rows={3}
              />
            </div>

            <button className="primary-btn" type="submit" disabled={customerSaving}>
              {customerSaving ? "Đang lưu..." : "Thêm khách hàng"}
            </button>
          </form>
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h2>Danh sách khách hàng</h2>
              <p className="muted">
                Bấm “Chăm sóc” để ghi lịch sử cho từng khách.
              </p>
            </div>

            <button className="secondary-btn" onClick={onReloadCustomers}>
              Tải lại
            </button>
          </div>

          <div className="list-toolbar">
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm theo tên, SĐT, địa chỉ, nguồn..."
            />

            <span className="badge">{filteredCustomers.length} khách</span>
          </div>

          <CustomerTable
            customers={filteredCustomers}
            selectedCustomerId={activityForm.customer_id}
            onSelectCustomer={selectCustomerForCare}
            onUpdateCustomerStatus={onUpdateCustomerStatus}
          />
        </section>
      </div>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Lịch sử chăm sóc</h2>
            <p className="muted">
              {selectedCustomer
                ? `Đang xem khách: ${selectedCustomer.name}`
                : "Chọn một khách hàng để xem và ghi lịch sử chăm sóc."}
            </p>
          </div>

          <span className="badge">{selectedActivities.length} hoạt động</span>
        </div>

        <div className="care-grid">
          <form className="customer-form" onSubmit={handleActivitySubmit}>
            <div className="field">
              <label>Khách hàng *</label>
              <select
                value={activityForm.customer_id}
                onChange={(event) =>
                  updateActivityField("customer_id", event.target.value)
                }
                required
              >
                <option value="">Chọn khách hàng</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.phone ? `- ${customer.phone}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Loại chăm sóc</label>
                <select
                  value={activityForm.activity_type}
                  onChange={(event) =>
                    updateActivityField("activity_type", event.target.value)
                  }
                >
                  {ACTIVITY_TYPE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Ngày hẹn chăm lại</label>
                <input
                  type="date"
                  value={activityForm.next_follow_up}
                  onChange={(event) =>
                    updateActivityField("next_follow_up", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="field">
              <label>Nội dung chăm sóc *</label>
              <textarea
                value={activityForm.note}
                onChange={(event) =>
                  updateActivityField("note", event.target.value)
                }
                placeholder="VD: Đã gọi khách, khách quan tâm gạch 80x160 vân đá..."
                rows={4}
                required
              />
            </div>

            <button className="primary-btn" type="submit" disabled={activitySaving}>
              {activitySaving ? "Đang lưu..." : "Ghi lịch sử chăm sóc"}
            </button>
          </form>

          <ActivityTimeline
            activities={selectedActivities}
            customers={customers}
            selectedCustomerId={activityForm.customer_id}
          />
        </div>
      </section>
    </div>
  );
}

function CustomerTable({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onUpdateCustomerStatus,
}) {
  if (!customers || customers.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có khách hàng</h3>
        <p>Hãy thêm khách hàng đầu tiên ở form bên trái.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Tên khách</th>
            <th>SĐT</th>
            <th>Nguồn</th>
            <th>Địa chỉ / ghi chú</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer.id}
              className={selectedCustomerId === customer.id ? "selected-row" : ""}
            >
              <td>
                <strong>{customer.name}</strong>
              </td>
              <td>{customer.phone || "-"}</td>
              <td>{customer.source || "-"}</td>
              <td className="note-cell">{customer.address || "-"}</td>
              <td>
                <select
                  className="table-select"
                  value={customer.status}
                  onChange={(event) =>
                    onUpdateCustomerStatus(customer.id, event.target.value)
                  }
                >
                  {CUSTOMER_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </td>
              <td>{formatDate(customer.created_at)}</td>
              <td>
                <button
                  className="mini-btn"
                  onClick={() => onSelectCustomer(customer.id)}
                >
                  Chăm sóc
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomersPage;
