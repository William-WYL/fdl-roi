export default function Products() {
  const products = [
    {
      id: 1,
      name: "LED Bulb A19",
      wattage: 9,
      lumens: 800,
      price: "$8.99",
      icon: "💡",
    },
    {
      id: 2,
      name: "LED Bulb PAR38",
      wattage: 15,
      lumens: 1500,
      price: "$12.99",
      icon: "💡",
    },
    {
      id: 3,
      name: "LED Panel 2x2",
      wattage: 32,
      lumens: 3800,
      price: "$45.99",
      icon: "📦",
    },
    {
      id: 4,
      name: "LED Tube T8",
      wattage: 10,
      lumens: 1200,
      price: "$6.99",
      icon: "📏",
    },
    {
      id: 5,
      name: "LED Flood Light",
      wattage: 50,
      lumens: 5000,
      price: "$35.99",
      icon: "🔆",
    },
    {
      id: 6,
      name: "LED Strip Light",
      wattage: 7,
      lumens: 300,
      price: "$4.99",
      icon: "📡",
    },
  ];

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

            <div className="product-price">{product.price}</div>

            <button className="product-btn">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
