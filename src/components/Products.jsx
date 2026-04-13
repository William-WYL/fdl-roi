import { useState } from "react";
import ProductCard from "./ProductCard";
import ProductListView from "./ProductListView";
import useProductStore from "../stores/productStore";

export default function Products({ onAddToCart, onNavigate, onSelectProduct }) {
  const [quantities, setQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("card"); // "card" or "list"

  // Store hooks
  const products = useProductStore((state) => state.products);
  const searchProducts = useProductStore((state) => state.searchProducts);
  const getEffectivePrice = useProductStore((state) => state.getEffectivePrice);

  // Derived state
  const filteredProducts = searchQuery ? searchProducts(searchQuery) : products;
  const hasResults = filteredProducts.length > 0;
  const resultCount = filteredProducts.length;

  // Handlers
  const handleQuantityChange = (id, value) => {
    const num = Math.max(1, parseInt(value) || 1);
    setQuantities((prev) => ({ ...prev, [id]: num }));
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product.id] || 1;
    if (qty > 0) {
      const effectivePrice = getEffectivePrice(product.id, qty);
      onAddToCart({
        id: product.id,
        sku: product.sku,
        name: product.name,
        wattage: Math.min(...product.wattageOptions),
        voltage: Math.min(...product.voltageOptions),
        lumens: Math.min(...product.lumensOptions),
        price: effectivePrice,
        quantity: qty,
      });
      setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1>LED Products</h1>
      </div>

      {/* Search and View Toggle */}
      <div className="products-toolbar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name or SKU#..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* View Toggle Buttons */}
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === "card" ? "active" : ""}`}
            onClick={() => setViewMode("card")}
            title="Card View"
          >
            <i className="fas fa-th"></i>
          </button>
          <button
            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            title="List View"
          >
            <i className="fas fa-list"></i>
          </button>
        </div>
      </div>

      {/* Results Counter */}
      {searchQuery && (
        <div className="search-results-info">
          Found {resultCount} product{resultCount !== 1 ? "s" : ""}
        </div>
      )}

      {/* Products Grid or List or No Results */}
      {hasResults ? (
        viewMode === "card" ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={quantities[product.id]}
                onQuantityChange={handleQuantityChange}
                onAddToCart={handleAddToCart}
                onProductClick={(productId) => {
                  onSelectProduct(productId);
                  onNavigate("product-detail");
                }}
              />
            ))}
          </div>
        ) : (
          <div className="products-list">
            {filteredProducts.map((product) => (
              <ProductListView
                key={product.id}
                product={product}
                quantity={quantities[product.id]}
                onQuantityChange={handleQuantityChange}
                onAddToCart={handleAddToCart}
                onProductClick={(productId) => {
                  onSelectProduct(productId);
                  onNavigate("product-detail");
                }}
              />
            ))}
          </div>
        )
      ) : (
        <div className="no-results">
          <p>No products found matching "{searchQuery}"</p>
          <p className="no-results-hint">
            Try searching by name or SKU (e.g., 100001)
          </p>
        </div>
      )}
    </div>
  );
}
