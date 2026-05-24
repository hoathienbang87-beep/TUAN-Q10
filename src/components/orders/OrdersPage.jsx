import { useMemo, useState } from "react";
import { ORDER_STATUS_OPTIONS } from "../../constants/appConstants";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  getOrderStatusLabel,
} from "../../utils/format";
import ProductSearchSelect from "../products/ProductSearchSelect";

function OrdersPage({
  profile,
  customers,
  products,
  orders,
  orderSaving,
  onCreateOrder,
  onUpdateOrderStatus,
  onReloadOrders,
}) {
  const canCreateOrders = ["admin", "manager", "sales"].includes(profile?.role);

  const [orderForm, setOrderForm] = useState({
    customer_id: "",
    status: "draft",
    note: "",
  });

  const [itemForm, setItemForm] = useState({
    product_id: "",
    quantity: "1",
    unit_price: "",
  });

  const [draftItems, setDraftItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [expandedCustomerIds, setExpandedCustomerIds] = useState(() => new Set());

  const activeProducts = products.filter((product) => product.status === "active");

  const selectedProduct = products.find(
    (product) => product.id === itemForm.product_id
  );

  const previewTotal = draftItems.reduce(
    (sum, item) => sum + Number(item.line_total || 0),
    0
  );

  const filteredOrders = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return orders;
    }

    return orders.filter((order) => {
      const customer = customers.find((item) => item.id === order.customer_id);
      const statusLabel = getOrderStatusLabel(order.status);

      return (
        order.order_code?.toLowerCase().includes(keyword) ||
        order.note?.toLowerCase().includes(keyword) ||
        order.status?.toLowerCase().includes(keyword) ||
        statusLabel?.toLowerCase().includes(keyword) ||
        customer?.name?.toLowerCase().includes(keyword) ||
        customer?.phone?.toLowerCase().includes(keyword)
      );
    });
  }, [orders, customers, searchText]);

  const groupedOrders = useMemo(() => {
    return groupOrdersByCustomer(filteredOrders, customers);
  }, [filteredOrders, customers]);

  function updateOrderField(field, value) {
    setOrderForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateItemField(field, value) {
    setItemForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function chooseProduct(productId) {
    const product = products.find((item) => item.id === productId);

    setItemForm((current) => ({
      ...current,
      product_id: productId,
      unit_price: product ? String(Number(product.price || 0)) : "",
    }));
  }

  function addDraftItem() {
    if (!itemForm.product_id) {
      alert("Bạn cần chọn sản phẩm.");
      return;
    }

    const product = products.find((item) => item.id === itemForm.product_id);

    if (!product) {
      alert("Không tìm thấy sản phẩm.");
      return;
    }

    const quantity = Number(itemForm.quantity);
    const unitPrice = Number(itemForm.unit_price);

    if (!quantity || quantity <= 0) {
      alert("Số lượng phải lớn hơn 0.");
      return;
    }

    if (unitPrice < 0) {
      alert("Đơn giá không hợp lệ.");
      return;
    }

    const newItem = {
      local_id: `${Date.now()}-${Math.random()}`,
      product_id: product.id,
      product_code: product.code,
      product_name: product.name,
      product_size: product.size,
      quantity,
      unit_price: unitPrice,
      line_total: quantity * unitPrice,
    };

    setDraftItems((current) => [...current, newItem]);

    setItemForm({
      product_id: "",
      quantity: "1",
      unit_price: "",
    });
  }

  function removeDraftItem(localId) {
    setDraftItems((current) => current.filter((item) => item.local_id !== localId));
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

    const success = await onCreateOrder(orderForm, draftItems);

    if (success) {
      setOrderForm({
        customer_id: "",
        status: "draft",
        note: "",
      });

      setItemForm({
        product_id: "",
        quantity: "1",
        unit_price: "",
      });

      setDraftItems([]);
    }
  }

  return (
    <div className="customer-page-stack">
      <div className="module-grid paired-panels">
        <section className="card paired-panel">
          <div className="section-header">
            <div>
              <h2>Tạo đơn hàng</h2>
              <p className="muted">
                Chọn khách hàng, thêm sản phẩm rồi tạo đơn.
              </p>
            </div>

            <span className="badge">{profile?.role}</span>
          </div>

          {!canCreateOrders ? (
            <div className="empty-state">
              <h3>Chỉ xem đơn hàng</h3>
              <p>
                Role hiện tại chưa có quyền tạo đơn. Tạo đơn dành cho admin,
                manager hoặc sales.
              </p>
            </div>
          ) : (
            <form className="customer-form" onSubmit={handleSubmit}>
              <div className="field">
                <label>Khách hàng *</label>
                <select
                  value={orderForm.customer_id}
                  onChange={(event) =>
                    updateOrderField("customer_id", event.target.value)
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

              <div className="field">
                <label>Trạng thái đơn</label>
                <select
                  value={orderForm.status}
                  onChange={(event) =>
                    updateOrderField("status", event.target.value)
                  }
                >
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="order-item-box">
                <h3>Thêm sản phẩm vào đơn</h3>

                <div className="field">
                  <label>Sản phẩm</label>
                  <ProductSearchSelect
                    products={activeProducts}
                    value={itemForm.product_id}
                    onChange={chooseProduct}
                    placeholder="Gõ mã, tên, loại, kích thước..."
                  />
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label>Số lượng</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemForm.quantity}
                      onChange={(event) =>
                        updateItemField("quantity", event.target.value)
                      }
                    />
                  </div>

                  <div className="field">
                    <label>Đơn giá</label>
                    <input
                      type="number"
                      min="0"
                      value={itemForm.unit_price}
                      onChange={(event) =>
                        updateItemField("unit_price", event.target.value)
                      }
                    />
                  </div>
                </div>

                {selectedProduct && (
                  <p className="muted">
                    Tồn kho hiện tại:{" "}
                    <strong>{formatNumber(selectedProduct.stock_qty)}</strong>
                  </p>
                )}

                <button
                  className="primary-btn full-width-btn"
                  type="button"
                  onClick={addDraftItem}
                >
                  Thêm dòng sản phẩm
                </button>
              </div>

              <DraftOrderItems items={draftItems} onRemoveItem={removeDraftItem} />

              <div className="order-total-box">
                <span>Tạm tính</span>
                <strong>{formatCurrency(previewTotal)}</strong>
              </div>

              <div className="field">
                <label>Ghi chú đơn hàng</label>
                <textarea
                  value={orderForm.note}
                  onChange={(event) =>
                    updateOrderField("note", event.target.value)
                  }
                  placeholder="VD: Giao hàng tại Quận 2, khách cần đủ lô màu..."
                  rows={3}
                />
              </div>

              <button className="primary-btn" type="submit" disabled={orderSaving}>
                {orderSaving ? "Đang tạo đơn..." : "Tạo đơn hàng"}
              </button>
            </form>
          )}
        </section>

        <section className="card paired-panel">
          <div className="section-header">
            <div>
              <h2>Danh sách đơn hàng</h2>
              <p className="muted">
                Đơn hàng lấy từ bảng orders và order_items.
              </p>
            </div>

            <button className="secondary-btn" onClick={onReloadOrders}>
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
            <GroupedOrderTable
              groups={groupedOrders}
              products={products}
              expandedCustomerIds={expandedCustomerIds}
              onToggleCustomerGroup={toggleCustomerGroup}
              onUpdateOrderStatus={onUpdateOrderStatus}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function DraftOrderItems({ items, onRemoveItem }) {
  if (!items || items.length === 0) {
    return (
      <div className="empty-state compact-empty">
        <h3>Chưa có sản phẩm trong đơn</h3>
        <p>Chọn sản phẩm, nhập số lượng rồi bấm “Thêm dòng sản phẩm”.</p>
      </div>
    );
  }

  return (
    <div className="draft-items">
      {items.map((item) => (
        <div className="draft-item" key={item.local_id}>
          <div>
            <strong>{item.product_name}</strong>
            <p>
              {item.product_code} {item.product_size ? `· ${item.product_size}` : ""}
            </p>
          </div>

          <div className="draft-item-right">
            <span>
              {formatNumber(item.quantity)} × {formatCurrency(item.unit_price)}
            </span>
            <strong>{formatCurrency(item.line_total)}</strong>
            <button
              className="danger-mini-btn"
              type="button"
              onClick={() => onRemoveItem(item.local_id)}
            >
              Xóa
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function GroupedOrderTable({
  groups,
  products,
  expandedCustomerIds,
  onToggleCustomerGroup,
  onUpdateOrderStatus,
}) {
  if (!groups || groups.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có đơn hàng</h3>
        <p>Hãy tạo đơn hàng đầu tiên ở form bên trái.</p>
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
            <th>Trạng thái</th>
            <th>Sản phẩm</th>
            <th>Tổng tiền</th>
            <th>Ngày tạo</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <OrderGroupRows
              group={group}
              key={group.customerId}
              products={products}
              isExpanded={expandedCustomerIds.has(group.customerId)}
              onToggle={() => onToggleCustomerGroup(group.customerId)}
              onUpdateOrderStatus={onUpdateOrderStatus}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderGroupRows({ group, products, isExpanded, onToggle, onUpdateOrderStatus }) {
  const totalAmount = group.orders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0
  );

  return (
    <>
      <tr className="table-group-row">
        <td colSpan={6}>
          <button
            className="table-group-button"
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
          >
            <span className="group-caret">{isExpanded ? "▾" : "▸"}</span>
            <strong>{group.customerName}</strong>
            <span>{group.orders.length} đơn</span>
            <span>Tổng {formatCurrency(totalAmount)}</span>
            {group.customerPhone && <span>{group.customerPhone}</span>}
          </button>
        </td>
      </tr>

      {isExpanded && group.orders.map((order) => (
        <tr key={order.id}>
          <td>
            <strong>{order.order_code}</strong>
          </td>
          <td>
            <strong>{group.customerName}</strong>
            <p className="table-subtext">{group.customerPhone}</p>
          </td>
          <td>
            <select
              className="table-select"
              value={order.status}
              onChange={(event) =>
                onUpdateOrderStatus(order.id, event.target.value)
              }
            >
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </td>
          <td className="note-cell">
            <OrderItemsSummary
              items={order.order_items || []}
              products={products}
            />
          </td>
          <td>
            <strong>{formatCurrency(order.total_amount)}</strong>
          </td>
          <td>{formatDate(order.created_at)}</td>
        </tr>
      ))}
    </>
  );
}

function OrderItemsSummary({ items, products }) {
  if (!items || items.length === 0) {
    return <span>-</span>;
  }

  return (
    <div className="order-items-summary">
      {items.map((item) => {
        const product = products.find(
          (productItem) => productItem.id === item.product_id
        );

        return (
          <div key={item.id}>
            <strong>{product?.code || "SP"}</strong>{" "}
            {product?.name || "Không rõ sản phẩm"} — {formatNumber(item.quantity)} ×{" "}
            {formatCurrency(item.unit_price)}
          </div>
        );
      })}
    </div>
  );
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

export default OrdersPage;
