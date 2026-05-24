import { useMemo, useState } from "react";
import { formatCurrency, formatNumber } from "../../utils/format";
import { getSearchScore, matchesSearchText } from "../../utils/search";

function ProductSearchSelect({
  products,
  value,
  onChange,
  placeholder = "Tìm mã, tên, loại, kích thước...",
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedProduct = products.find((product) => product.id === value);

  const filteredProducts = useMemo(() => {
    const keyword = query.trim();

    if (!keyword) {
      return products.slice(0, 12);
    }

    return products
      .filter((product) => matchesSearchText(getProductSearchFields(product), keyword))
      .sort((first, second) => {
        return (
          getSearchScore(getProductSearchFields(first), keyword) -
          getSearchScore(getProductSearchFields(second), keyword)
        );
      })
      .slice(0, 20);
  }, [products, query]);

  function selectProduct(product) {
    onChange(product.id);
    setQuery("");
    setIsOpen(false);
  }

  function clearProduct() {
    onChange("");
    setQuery("");
    setIsOpen(false);
  }

  return (
    <div className="product-search-select">
      <div className="product-search-input-wrap">
        <input
          value={query || selectedProduct?.code || ""}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            if (selectedProduct) {
              onChange("");
            }
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 120)}
          placeholder={placeholder}
        />

        {value && (
          <button type="button" onClick={clearProduct} aria-label="Xóa sản phẩm">
            ×
          </button>
        )}
      </div>

      {selectedProduct && !query && (
        <div className="selected-product-card">
          <strong>{selectedProduct.code}</strong>
          <span>{selectedProduct.name}</span>
          <small>
            {selectedProduct.size || "-"} · tồn {formatNumber(selectedProduct.stock_qty)} ·{" "}
            {formatCurrency(selectedProduct.price)}
          </small>
        </div>
      )}

      {isOpen && (
        <div className="product-search-results">
          {filteredProducts.length === 0 ? (
            <div className="product-search-empty">Không tìm thấy sản phẩm</div>
          ) : (
            filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectProduct(product)}
              >
                <strong>{product.code}</strong>
                <span>{product.name}</span>
                <small>
                  {product.category || "-"} · {product.size || "-"} · tồn{" "}
                  {formatNumber(product.stock_qty)}
                </small>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function getProductSearchFields(product) {
  return [
    product.code,
    product.name,
    product.category,
    product.size,
    product.surface,
    product.origin,
  ];
}

export default ProductSearchSelect;
