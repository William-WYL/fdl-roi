import { useState } from "react";

export default function Products({ onAddToCart }) {
  const [quantities, setQuantities] = useState({});

  const products = [
    {
      id: 1,
      name: "LED Bulb A19",
      wattage: 9,
      lumens: 800,
      price: 8.99,
      icon: "💡",
    },
    {
      id: 2,
      name: "LED Bulb PAR38",
      wattage: 15,
      lumens: 1500,
      price: 12.99,
      icon: "💡",
    },
    {
      id: 3,
      name: "LED Panel 2x2",
      wattage: 32,
      lumens: 3800,
      price: 45.99,
      icon: "📦",
    },
    {
      id: 4,
      name: "LED Tube T8",
      wattage: 10,
      lumens: 1200,
      price: 6.99,
      icon: "📏",
    },
    {
      id: 5,
      name: "LED Flood Light",
      wattage: 50,
      lumens: 5000,
      price: 35.99,
      icon: "🔆",
    },
    {
      id: 6,
      name: "LED Strip Light",
      wattage: 7,
      lumens: 300,
      price: 4.99,
      icon: "📡",
    },
  ];

  const handleQuantityChange = (id, value) => {
    const num = parseInt(value) || 0;
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, num),
    }));
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product.id] || 1;
    if (qty > 0) {
      onAddToCart({
        id: product.id,
        name: product.name,
        wattage: product.wattage,
        lumens: product.lumens,
        price: product.price,
        quantity: qty,
      });
      setQuantities((prev) => ({ ...prev, [product.id]: 0 }));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>LED Products</h1>
        <p>Browse our selection of high-quality LED lighting solutions.</p>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div style={{ fontSize: 28, marginBottom: 12 }}>{product.icon}</div>
            <h3 className="product-card-name">{product.name}</h3>

            <div className="product-card-specs">
              <div className="product-spec">
                <span style={{ marginRight: 8 }}>⚡</span>
                <span>
                  {product.wattage}W &nbsp;·&nbsp; {product.lumens} lm
                </span>
              </div>
            </div>

            <div className="product-price">${product.price.toFixed(2)}</div>

            <div className="product-actions">
              <div className="product-quantity">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="0"
                  value={quantities[product.id] || 0}
                  onChange={(e) =>
                    handleQuantityChange(product.id, e.target.value)
                  }
                  className="quantity-input"
                />
              </div>

              <button
                className="product-btn"
                onClick={() => handleAddToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
