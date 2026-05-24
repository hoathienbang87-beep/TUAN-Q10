import { useMemo, useState } from "react";
import { STOCK_MOVEMENT_TYPE_OPTIONS } from "../../constants/appConstants";
import {
  formatDateTime,
  formatNumber,
} from "../../utils/format";
import { matchesSearchText } from "../../utils/search";
import ProductSearchSelect from "../products/ProductSearchSelect";

function StockPage({
  profile,
  products,
  stockMovements,
  stockSaving,
  onCreateStockMovement,
  onReloadStock,
}) {
  const canManageStock = ["admin", "manager", "warehouse"].includes(profile?.role);

  const [movementForm, setMovementForm] = useState({
    product_id: "",
    movement_type: "in",
    quantity: "",
    note: "",
  });

  const [searchText, setSearchText] = useState("");
  const [movementFilter, setMovementFilter] = useState("all");

  const selectedProduct = products.find(
    (product) => product.id === movementForm.product_id
  );

  const filteredProducts = useMemo(() => {
    const keyword = searchText.trim();

    if (!keyword) {
      return products;
    }

    return products.filter((product) => {
      return matchesSearchText(
        [
          product.code,
          product.name,
          product.category,
          product.size,
          product.surface,
          product.origin,
        ],
        keyword
      );
    });
  }, [products, searchText]);

  const filteredStockMovements = useMemo(() => {
    if (movementFilter === "all") {
      return stockMovements;
    }

    return stockMovements.filter(
      (movement) => movement.movement_type === movementFilter
    );
  }, [stockMovements, movementFilter]);

  const movementCounts = useMemo(() => {
    return stockMovements.reduce(
      (result, movement) => {
        result.all += 1;
        result[movement.movement_type] = (result[movement.movement_type] || 0) + 1;
        return result;
      },
      { all: 0, in: 0, out: 0, adjustment: 0 }
    );
  }, [stockMovements]);

  function updateMovementField(field, value) {
    setMovementForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const success = await onCreateStockMovement(movementForm);

    if (success) {
      setMovementForm({
        product_id: "",
        movement_type: "in",
        quantity: "",
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
              <h2>Tạo phiếu kho</h2>
              <p className="muted">
                Nhập kho, xuất kho hoặc điều chỉnh tồn kho sản phẩm.
              </p>
            </div>

            <span className="badge">{profile?.role}</span>
          </div>

          {!canManageStock ? (
            <div className="empty-state">
              <h3>Chỉ xem tồn kho</h3>
              <p>
                Role hiện tại không có quyền tạo phiếu kho. Quyền này dành cho
                admin, manager hoặc warehouse.
              </p>
            </div>
          ) : (
            <form className="customer-form" onSubmit={handleSubmit}>
              <div className="field">
                <label>Sản phẩm *</label>
                <ProductSearchSelect
                  products={products}
                  value={movementForm.product_id}
                  onChange={(productId) => updateMovementField("product_id", productId)}
                  placeholder="Gõ mã, tên, loại, kích thước..."
                />
              </div>

              {selectedProduct && (
                <div className="stock-current-box">
                  <span>Tồn hiện tại</span>
                  <strong>{formatNumber(selectedProduct.stock_qty)}</strong>
                </div>
              )}

              <div className="field">
                <label>Loại phiếu *</label>
                <select
                  value={movementForm.movement_type}
                  onChange={(event) =>
                    updateMovementField("movement_type", event.target.value)
                  }
                >
                  {STOCK_MOVEMENT_TYPE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Số lượng *</label>
                <input
                  type="number"
                  step="0.01"
                  value={movementForm.quantity}
                  onChange={(event) =>
                    updateMovementField("quantity", event.target.value)
                  }
                  placeholder={
                    movementForm.movement_type === "adjustment"
                      ? "VD: 5 hoặc -3"
                      : "VD: 10"
                  }
                  required
                />
                <p className="muted">
                  Nhập kho và xuất kho dùng số dương. Điều chỉnh kho có thể dùng
                  số dương hoặc âm.
                </p>
              </div>

              <div className="field">
                <label>Ghi chú</label>
                <textarea
                  value={movementForm.note}
                  onChange={(event) =>
                    updateMovementField("note", event.target.value)
                  }
                  placeholder="VD: Nhập hàng đầu kỳ, xuất cho công trình, điều chỉnh sau kiểm kê..."
                  rows={3}
                />
              </div>

              <button className="primary-btn" type="submit" disabled={stockSaving}>
                {stockSaving ? "Đang lưu..." : "Tạo phiếu kho"}
              </button>
            </form>
          )}
        </section>

        <section className="card paired-panel">
          <div className="section-header">
            <div>
              <h2>Tồn kho sản phẩm</h2>
              <p className="muted">
                Tồn kho hiện tại đang lấy từ bảng products.
              </p>
            </div>

            <button className="secondary-btn" onClick={onReloadStock}>
              Tải lại
            </button>
          </div>

          <div className="list-toolbar">
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm theo mã, tên, loại, kích thước..."
            />

            <span className="badge">{filteredProducts.length} sản phẩm</span>
          </div>

          <div className="paired-scroll-body">
            <StockProductTable products={filteredProducts} />
          </div>
        </section>
      </div>

      <section className="card stock-history-panel">
        <div className="section-header">
          <div>
            <h2>Lịch sử kho</h2>
            <p className="muted">
              Mỗi lần nhập, xuất, điều chỉnh đều được lưu lại ở đây.
            </p>
          </div>

          <span className="badge">{stockMovements.length} phiếu</span>
        </div>

        <div className="segmented-filter">
          <button
            className={movementFilter === "all" ? "active" : ""}
            type="button"
            onClick={() => setMovementFilter("all")}
          >
            Tất cả <span>{movementCounts.all}</span>
          </button>
          <button
            className={movementFilter === "in" ? "active" : ""}
            type="button"
            onClick={() => setMovementFilter("in")}
          >
            Nhập kho <span>{movementCounts.in}</span>
          </button>
          <button
            className={movementFilter === "out" ? "active" : ""}
            type="button"
            onClick={() => setMovementFilter("out")}
          >
            Xuất kho <span>{movementCounts.out}</span>
          </button>
          <button
            className={movementFilter === "adjustment" ? "active" : ""}
            type="button"
            onClick={() => setMovementFilter("adjustment")}
          >
            Điều chỉnh <span>{movementCounts.adjustment}</span>
          </button>
        </div>

        <div className="fixed-history-body">
          <StockMovementTable
            stockMovements={filteredStockMovements}
            products={products}
          />
        </div>
      </section>
    </div>
  );
}

function StockProductTable({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có sản phẩm</h3>
        <p>Hãy thêm sản phẩm ở module Sản phẩm trước.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên sản phẩm</th>
            <th>Loại</th>
            <th>Kích thước</th>
            <th>Bề mặt</th>
            <th>Tồn kho</th>
            <th>Trạng thái tồn</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            const stockQty = Number(product.stock_qty || 0);

            return (
              <tr key={product.id}>
                <td>
                  <strong>{product.code}</strong>
                </td>
                <td>{product.name}</td>
                <td>{product.category || "-"}</td>
                <td>{product.size || "-"}</td>
                <td>{product.surface || "-"}</td>
                <td>
                  <strong>{formatNumber(stockQty)}</strong>
                </td>
                <td>
                  <span
                    className={
                      stockQty > 0
                        ? "status-pill status-won"
                        : "status-pill status-lost"
                    }
                  >
                    {stockQty > 0 ? "Còn hàng" : "Hết hàng"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StockMovementTable({ stockMovements, products }) {
  if (!stockMovements || stockMovements.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có lịch sử kho</h3>
        <p>Tạo phiếu nhập/xuất/điều chỉnh đầu tiên để xem lịch sử.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Sản phẩm</th>
            <th>Loại phiếu</th>
            <th>Số lượng</th>
            <th>Ghi chú</th>
          </tr>
        </thead>

        <tbody>
          {stockMovements.map((movement) => {
            const product = products.find(
              (item) => item.id === movement.product_id
            );

            return (
              <tr key={movement.id}>
                <td>{formatDateTime(movement.created_at)}</td>

                <td>
                  <strong>{product?.code || "Không rõ mã"}</strong>
                  <p className="table-subtext">
                    {product?.name || "Không rõ sản phẩm"}
                  </p>
                </td>

                <td>
                  <span
                    className={`status-pill stock-type-${movement.movement_type}`}
                  >
                    {getStockMovementLabel(movement.movement_type)}
                  </span>
                </td>

                <td>
                  <strong>{formatNumber(movement.quantity)}</strong>
                </td>

                <td className="note-cell">{movement.note || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function getStockMovementLabel(type) {
  const found = STOCK_MOVEMENT_TYPE_OPTIONS.find((item) => item.value === type);
  return found?.label || type;
}

export default StockPage;
