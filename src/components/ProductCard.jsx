import useProductStore from "../stores/productStore";

export default function ProductCard({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  onProductClick,
}) {
  const getEffectivePrice = useProductStore((state) => state.getEffectivePrice);
  const getFormattedSize = useProductStore((state) => state.getFormattedSize);

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
      className="product-card"
      onClick={() => onProductClick && onProductClick(product.id)}
    >
      {/* Product Image Placeholder - Clickable */}
      <div className="product-card-image">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="product-image-icon">
            <i className={`fas ${getCategoryIcon(product.category)}`}></i>
          </div>
        )}
      </div>

      {/* Product Header - Clickable */}
      <h3 className="product-card-name">{product.name}</h3>

      {/* Product Description */}
      {product.description && (
        <p className="product-card-description">{product.description}</p>
      )}

      {/* SKU Section */}
      <div className="product-card-sku">SKU: {product.sku}</div>

      {/* Size Section */}
      {product.size && (
        <div className="product-card-size">
          Size: {getFormattedSize(product.id)}
        </div>
      )}

      {/* Price Section */}
      <div
        className={`product-price mt-auto ${isBulkPrice ? "bulk-active" : ""}`}
      >
        ${effectivePrice.toFixed(2)}
        {isBulkPrice && <span className="bulk-badge">Bulk Price</span>}
      </div>

      {/* Actions Section */}
      <div className="product-actions" onClick={(e) => e.stopPropagation()}>
        <div className="product-quantity">
          <label>Quantity:</label>
          <input
            type="number"
            min="1"
            value={currentQuantity}
            onChange={(e) => onQuantityChange(product.id, e.target.value)}
            className="quantity-input"
          />
        </div>

        <button
          className="product-btn"
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
