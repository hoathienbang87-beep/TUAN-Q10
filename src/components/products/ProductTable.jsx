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
    <div className="table-wrap">
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
  );
}

export default ProductTable;