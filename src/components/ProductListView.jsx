import useProductStore from "../stores/productStore";

export default function ProductListView({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  onProductClick,
}) {
  const getEffectivePrice = useProductStore((state) => state.getEffectivePrice);

  // Map product category to Font Awesome icon
  const getCategoryIcon = (category) => {
    const iconMap = {
      gimbal: "fa-lightbulb",
      bulb: "fa-lightbulb",
      panel: "fa-square",
      tube: "fa-light",
      flood: "fa-sun",
      strip: "fa-bars",
    };
    return iconMap[category] || "fa-lightbulb";
  };

  const currentQuantity = quantity || 1;
  const effectivePrice = getEffectivePrice(product.id, currentQuantity);
  const isBulkPrice =
    product.bulkPricing &&
    product.bulkPricing.enabled &&
    currentQuantity >= product.bulkPricing.threshold;

  return (
    <div
      className="product-list-item"
      onClick={() => onProductClick && onProductClick(product.id)}
    >
      {/* Product Image */}
      <div className="product-list-image">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="product-list-image-icon">
            <i className={`fas ${getCategoryIcon(product.category)}`}></i>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-list-info" onClick={(e) => e.stopPropagation()}>
        <h3 className="product-list-name">{product.name}</h3>
        <div className="product-list-details">
          <span className="product-list-sku">SKU: {product.sku}</span>
          {product.ProductNo && (
            <span className="product-list-pno">
              Product #: {product.ProductNo}
            </span>
          )}
          <span
            className={`product-list-specs ${isBulkPrice ? "bulk-active" : ""}`}
          >
            {Math.min(...product.wattageOptions)}W ·{" "}
            {Math.min(...product.lumensOptions)}lm · $
            {effectivePrice.toFixed(2)}
            {isBulkPrice && <span className="bulk-badge">Bulk</span>}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div
        className="product-list-actions"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="product-list-quantity">
          <label>Qty:</label>
          <input
            type="number"
            min="1"
            value={quantity || 1}
            onChange={(e) => onQuantityChange(product.id, e.target.value)}
            className="product-list-qty-input"
          />
        </div>
        <button
          className="product-list-btn"
          onClick={() =>
            onAddToCart({
              ...product,
              wattage: Math.min(...product.wattageOptions),
              lumens: Math.min(...product.lumensOptions),
              voltage: Math.min(...product.voltageOptions),
            })
          }
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
