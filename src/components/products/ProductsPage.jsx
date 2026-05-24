import { useMemo, useState } from "react";
import {
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
} from "../../constants/appConstants";
import ProductTable from "./ProductTable";

function ProductsPage({
  profile,
  products,
  productSaving,
  onCreateProduct,
  onUpdateProduct,
  onReloadProducts,
}) {
  const canManageProducts = ["admin", "manager", "warehouse"].includes(profile?.role);

  const emptyProductForm = {
    code: "",
    name: "",
    category: "",
    size: "",
    surface: "",
    origin: "",
    price: "",
    stock_qty: "",
    image_url: "",
    status: "active",
  };

  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState("");
  const [searchText, setSearchText] = useState("");

  const filteredProducts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.code?.toLowerCase().includes(keyword) ||
        product.name?.toLowerCase().includes(keyword) ||
        product.category?.toLowerCase().includes(keyword) ||
        product.size?.toLowerCase().includes(keyword) ||
        product.surface?.toLowerCase().includes(keyword) ||
        product.origin?.toLowerCase().includes(keyword)
      );
    });
  }, [products, searchText]);

  function updateProductField(field, value) {
    setProductForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetProductForm() {
    setProductForm(emptyProductForm);
    setEditingProductId("");
  }

  function startEditProduct(product) {
    setEditingProductId(product.id);
    setProductForm({
      code: product.code || "",
      name: product.name || "",
      category: product.category || "",
      size: product.size || "",
      surface: product.surface || "",
      origin: product.origin || "",
      price: product.price ?? "",
      stock_qty: product.stock_qty ?? "",
      image_url: product.image_url || "",
      status: product.status || "active",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    let success = false;

    if (editingProductId) {
      success = await onUpdateProduct(editingProductId, productForm);
    } else {
      success = await onCreateProduct(productForm);
    }

    if (success) {
      resetProductForm();
    }
  }

  return (
    <div className="module-grid">
      <section className="card">
        <div className="section-header">
          <div>
            <h2>{editingProductId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
            <p className="muted">
              {canManageProducts
                ? "Admin / manager / kho được thêm và cập nhật sản phẩm."
                : "Tài khoản hiện tại chỉ có quyền xem sản phẩm."}
            </p>
          </div>

          <span className="badge">{profile?.role}</span>
        </div>

        {!canManageProducts ? (
          <div className="empty-state">
            <h3>Chỉ xem sản phẩm</h3>
            <p>
              Role hiện tại không có quyền thêm hoặc sửa sản phẩm. Quyền này dành cho
              admin, manager hoặc warehouse.
            </p>
          </div>
        ) : (
          <form className="customer-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label>Mã sản phẩm *</label>
                <input
                  value={productForm.code}
                  onChange={(event) =>
                    updateProductField("code", event.target.value)
                  }
                  placeholder="VD: KC-60120-MARBLE-01"
                  required
                />
              </div>

              <div className="field">
                <label>Tên sản phẩm *</label>
                <input
                  value={productForm.name}
                  onChange={(event) =>
                    updateProductField("name", event.target.value)
                  }
                  placeholder="VD: Gạch vân đá Marble trắng"
                  required
                />
              </div>

              <div className="field">
                <label>Loại gạch</label>
                <input
                  list="product-category-list"
                  value={productForm.category}
                  onChange={(event) =>
                    updateProductField("category", event.target.value)
                  }
                  placeholder="VD: porcelain"
                />
                <datalist id="product-category-list">
                  {PRODUCT_CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>

              <div className="field">
                <label>Kích thước</label>
                <input
                  value={productForm.size}
                  onChange={(event) =>
                    updateProductField("size", event.target.value)
                  }
                  placeholder="VD: 60x120"
                />
              </div>

              <div className="field">
                <label>Bề mặt</label>
                <input
                  value={productForm.surface}
                  onChange={(event) =>
                    updateProductField("surface", event.target.value)
                  }
                  placeholder="VD: polished, matt, sugar..."
                />
              </div>

              <div className="field">
                <label>Xuất xứ / phong cách</label>
                <input
                  value={productForm.origin}
                  onChange={(event) =>
                    updateProductField("origin", event.target.value)
                  }
                  placeholder="VD: Italy style, Spain style..."
                />
              </div>

              <div className="field">
                <label>Giá bán</label>
                <input
                  type="number"
                  min="0"
                  value={productForm.price}
                  onChange={(event) =>
                    updateProductField("price", event.target.value)
                  }
                  placeholder="VD: 850000"
                />
              </div>

              <div className="field">
                <label>Tồn kho</label>
                <input
                  type="number"
                  min="0"
                  value={productForm.stock_qty}
                  onChange={(event) =>
                    updateProductField("stock_qty", event.target.value)
                  }
                  placeholder="VD: 120"
                />
              </div>

              <div className="field">
                <label>Trạng thái</label>
                <select
                  value={productForm.status}
                  onChange={(event) =>
                    updateProductField("status", event.target.value)
                  }
                >
                  {PRODUCT_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label>Link hình ảnh</label>
              <input
                value={productForm.image_url}
                onChange={(event) =>
                  updateProductField("image_url", event.target.value)
                }
                placeholder="Dán link ảnh sản phẩm nếu có"
              />
            </div>

            <div className="form-actions">
              <button className="primary-btn" type="submit" disabled={productSaving}>
                {productSaving
                  ? "Đang lưu..."
                  : editingProductId
                    ? "Cập nhật sản phẩm"
                    : "Thêm sản phẩm"}
              </button>

              {editingProductId && (
                <button
                  className="secondary-btn"
                  type="button"
                  onClick={resetProductForm}
                >
                  Hủy sửa
                </button>
              )}
            </div>
          </form>
        )}
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Danh sách sản phẩm gạch</h2>
            <p className="muted">
              Đây là danh mục sản phẩm dùng cho báo giá và đơn hàng.
            </p>
          </div>

          <button className="secondary-btn" onClick={onReloadProducts}>
            Tải lại
          </button>
        </div>

        <div className="list-toolbar">
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Tìm theo mã, tên, loại, kích thước, bề mặt..."
          />

          <span className="badge">{filteredProducts.length} sản phẩm</span>
        </div>

        <ProductTable
          products={filteredProducts}
          canManageProducts={canManageProducts}
          onEditProduct={startEditProduct}
        />
      </section>
    </div>
  );
}

export default ProductsPage;