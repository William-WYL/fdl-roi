import { useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import useProductStore from "../stores/productStore";

export default function ProductInfo({ productId, onAddToCart, onNavigate }) {
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);
  const getProductById = useProductStore((state) => state.getProductById);
  const getEffectivePrice = useProductStore((state) => state.getEffectivePrice);
  const product = getProductById(productId);

  if (!product) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Product Not Found</h1>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (quantity > 0) {
      const effectivePrice = getEffectivePrice(product.id, quantity);
      onAddToCart({
        id: product.id,
        sku: product.sku,
        name: product.name,
        wattage: Math.min(...product.wattageOptions),
        voltage: Math.min(...product.voltageOptions),
        lumens: Math.min(...product.lumensOptions),
        price: effectivePrice,
        quantity: quantity,
      });
      setQuantity(1);
    }
  };

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

  const currentImage = product.images?.[imageIndex];

  const handlePrevImage = () => {
    setImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className="page-container">
      {/* Back Button */}
      <button className="back-button" onClick={() => onNavigate("products")}>
        ← Back to Products
      </button>

      {/* Compact Product Detail Container */}
      <div className="product-detail-compact">
        {/* Left: Image Gallery Section */}
        <div className="product-detail-image-compact">
          {/* Main Image with Zoom on Hover */}
          <div className="product-gallery-main">
            {currentImage ? (
              <Zoom>
                <img
                  src={currentImage}
                  alt={product.name}
                  className="product-gallery-image"
                />
              </Zoom>
            ) : (
              <div className="product-detail-icon">
                <i className={`fas ${getCategoryIcon(product.category)}`}></i>
              </div>
            )}

            {/* Carousel Navigation Arrows */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  className="carousel-arrow carousel-arrow-prev"
                  onClick={handlePrevImage}
                  title="Previous image"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  className="carousel-arrow carousel-arrow-next"
                  onClick={handleNextImage}
                  title="Next image"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {product.images && product.images.length > 1 && (
            <div className="product-thumbnails-carousel">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setImageIndex(idx)}
                  className={`thumbnail-btn ${idx === imageIndex ? "active" : ""}`}
                  title={`View image ${idx + 1}`}
                >
                  <img
                    src={_}
                    alt={`Product view ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info Section (Compact) */}
        <div className="product-detail-info-compact">
          {/* Header */}
          <div className="product-header-compact">
            <h1 className="product-title-compact">{product.name}</h1>
            <div className="product-sku-compact">SKU: {product.sku}</div>
            {product.ProductNo && (
              <div className="product-number-compact">
                Product #: {product.ProductNo}
              </div>
            )}
            {(() => {
              const effectivePrice = getEffectivePrice(product.id, quantity);
              const isBulkPrice =
                product.bulkPricing &&
                product.bulkPricing.enabled &&
                quantity >= product.bulkPricing.threshold;
              return (
                <>
                  <div
                    className={`product-price-compact ${isBulkPrice ? "bulk-active" : ""}`}
                  >
                    ${effectivePrice.toFixed(2)}
                    {isBulkPrice && (
                      <span className="bulk-badge">Bulk Price Active</span>
                    )}
                  </div>
                  {product.bulkPricing && product.bulkPricing.enabled && (
                    <div className="bulk-pricing-hint">
                      {isBulkPrice ? (
                        <span className="hint-active">
                          ✓ Bulk pricing active: $
                          {product.bulkPricing.bulkPrice.toFixed(2)}/unit at{" "}
                          {product.bulkPricing.threshold}+ units
                        </span>
                      ) : (
                        <span className="hint-inactive">
                          Bulk pricing: $
                          {product.bulkPricing.bulkPrice.toFixed(2)}/unit at{" "}
                          {product.bulkPricing.threshold}+ units
                        </span>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Description Box */}
          <div className="product-description-box">
            <p>
              <strong>Description:</strong>
            </p>
            <p>{product.description}</p>
            {(product.size || product.shape || product.finish) && (
              <>
                <p>
                  <strong>Physical:</strong>{" "}
                  {product.size && `${product.size}"`}{" "}
                  {product.shape &&
                    `· ${product.shape.charAt(0).toUpperCase() + product.shape.slice(1)}`}{" "}
                  {product.finish && `· ${product.finish}`}
                </p>
              </>
            )}
            {(product.wattageOptions ||
              product.voltageOptions ||
              product.lumensOptions) && (
              <>
                <p>
                  <strong>Electrical:</strong> {product.wattageOptions?.[0]}W ·{" "}
                  {product.voltageOptions?.[0]}V · {product.lumensOptions?.[0]}{" "}
                  lm
                </p>
              </>
            )}
          </div>

          {/* Specs & Installation Buttons */}
          <div className="specs-actions">
            <button
              className="specs-btn"
              onClick={() => setShowSpecs(!showSpecs)}
            >
              <i className={`fas fa-chevron-${showSpecs ? "up" : "down"}`}></i>{" "}
              More details
            </button>
            <a
              href={product.specsLink}
              className="specs-btn installation-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fas fa-download"></i> Specs & Installation
            </a>
          </div>

          {/* Expandable Specs Section */}
          {showSpecs && (
            <div className="specs-expanded">
              <div className="expanded-spec-row">
                <span className="spec-label">Power Consumption</span>
                <span className="spec-value">
                  {product.wattageOptions?.map((w, idx) => (
                    <span key={idx}>
                      {w}W{idx < product.wattageOptions.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </span>
              </div>
              <div className="expanded-spec-row">
                <span className="spec-label">Brightness</span>
                <span className="spec-value">
                  {product.lumensOptions && product.lumensOptions.length > 3 ? (
                    <span>
                      {Math.min(...product.lumensOptions)} lm -{" "}
                      {Math.max(...product.lumensOptions)} lm
                    </span>
                  ) : (
                    product.lumensOptions?.map((l, idx) => (
                      <span key={idx}>
                        {l} lm
                        {idx < product.lumensOptions.length - 1 ? ", " : ""}
                      </span>
                    ))
                  )}
                </span>
              </div>
              <div className="expanded-spec-row">
                <span className="spec-label">Efficiency</span>
                <span className="spec-value">
                  {(
                    (product.lumensOptions?.[0] || 0) /
                    (product.wattageOptions?.[0] || 1)
                  ).toFixed(1)}{" "}
                  lm/W
                </span>
              </div>
              <div className="expanded-spec-row">
                <span className="spec-label">Voltage</span>
                <span className="spec-value">
                  {product.voltageOptions?.map((v, idx) => (
                    <span key={idx}>
                      {v}V{idx < product.voltageOptions.length - 1 ? " - " : ""}
                    </span>
                  ))}
                </span>
              </div>
              {product.cctOptions && (
                <div className="expanded-spec-row">
                  <span className="spec-label">CCT Options</span>
                  <span className="spec-value">
                    {product.cctOptions.map((cct, idx) => (
                      <span key={idx}>
                        {typeof cct === "number" ? `${cct}K` : cct}
                        {idx < product.cctOptions.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                </div>
              )}
              {product.dimmable && (
                <div className="expanded-spec-row">
                  <span className="spec-label">Dimmable</span>
                  <span className="spec-value">
                    {product.dimmable.min}-{product.dimmable.max}%
                  </span>
                </div>
              )}
              {product.category && (
                <div className="expanded-spec-row">
                  <span className="spec-label">Category</span>
                  <span
                    className="spec-value"
                    style={{ textTransform: "capitalize" }}
                  >
                    {product.category}
                  </span>
                </div>
              )}
              {product.type && (
                <div className="expanded-spec-row">
                  <span className="spec-label">Type</span>
                  <span
                    className="spec-value"
                    style={{ textTransform: "capitalize" }}
                  >
                    {product.type.replace(/_/g, " ")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Add to Cart Section */}
          <div className="product-detail-actions-compact">
            <div className="detail-quantity-group-compact">
              <label>Qty:</label>
              <div className="quantity-control-compact">
                <button
                  className="qty-btn-compact"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="qty-input-compact"
                />
                <button
                  className="qty-btn-compact"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <button
              className="detail-add-to-cart-btn-compact"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
