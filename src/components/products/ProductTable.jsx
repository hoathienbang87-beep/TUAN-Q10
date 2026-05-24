import {
  formatCurrency,
  formatNumber,
  getProductStatusLabel,
} from "../../utils/format";

function ProductTable({ products, canManageProducts, onEditProduct }) {
  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có sản phẩm</h3>
        <p>Hãy thêm sản phẩm đầu tiên hoặc kiểm tra quyền đọc bảng products.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mobile-card-list product-mobile-list">
        {products.map((product) => (
          <article className="mobile-data-card product-mobile-card" key={product.id}>
            <div className="mobile-card-head">
              <div>
                <h3>{product.code}</h3>
                <p>{product.name}</p>
              </div>

              <span
                className={
                  product.status === "active"
                    ? "status-pill status-won"
                    : "status-pill status-lost"
                }
              >
                {getProductStatusLabel(product.status)}
              </span>
            </div>

            <div className="mobile-card-fields two-cols">
              <div className="mobile-card-field compact">
                <span>Giá</span>
                <strong>{formatCurrency(product.price)}</strong>
              </div>
              <div className="mobile-card-field compact">
                <span>Tồn kho</span>
                <strong>{formatNumber(product.stock_qty)}</strong>
              </div>
              <div className="mobile-card-field compact">
                <span>Loại</span>
                <strong>{product.category || "-"}</strong>
              </div>
              <div className="mobile-card-field compact">
                <span>Kích thước</span>
                <strong>{product.size || "-"}</strong>
              </div>
              <div className="mobile-card-field compact">
                <span>Bề mặt</span>
                <strong>{product.surface || "-"}</strong>
              </div>
              <div className="mobile-card-field compact">
                <span>Xuất xứ</span>
                <strong>{product.origin || "-"}</strong>
              </div>
            </div>

            {canManageProducts && (
              <button
                className="mini-btn full-width-btn"
                onClick={() => onEditProduct(product)}
              >
                Sửa sản phẩm
              </button>
            )}
          </article>
        ))}
      </div>

      <div className="table-wrap desktop-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên sản phẩm</th>
              <th>Loại</th>
              <th>Kích thước</th>
              <th>Bề mặt</th>
              <th>Xuất xứ</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              {canManageProducts && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <strong>{product.code}</strong>
                </td>
                <td>{product.name}</td>
                <td>{product.category || "-"}</td>
                <td>{product.size || "-"}</td>
                <td>{product.surface || "-"}</td>
                <td>{product.origin || "-"}</td>
                <td>{formatCurrency(product.price)}</td>
                <td>{formatNumber(product.stock_qty)}</td>
                <td>
                  <span
                    className={
                      product.status === "active"
                        ? "status-pill status-won"
                        : "status-pill status-lost"
                    }
                  >
                    {getProductStatusLabel(product.status)}
                  </span>
                </td>
                {canManageProducts && (
                  <td>
                    <button
                      className="mini-btn"
                      onClick={() => onEditProduct(product)}
                    >
                      Sửa
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ProductTable;
