import logo from "../../public/images/0001465_FDLlogo.png";

export default function Header({ currentPage, onNavigate, cartCount = 0 }) {
  return (
    <div className="led-header">
      <img
        src={logo}
        alt="FDL Logo"
        className="led-header-logo"
        onClick={() => onNavigate("home")}
      />

      <div className="led-header-nav">
        <button
          onClick={() => onNavigate("calculator")}
          className={`led-nav-btn ${currentPage === "calculator" ? "active" : ""}`}
        >
          Calculator
        </button>
        <button
          onClick={() => onNavigate("products")}
          className={`led-nav-btn ${currentPage === "products" ? "active" : ""}`}
        >
          Products
        </button>
        <button
          onClick={() => onNavigate("benefits")}
          className={`led-nav-btn ${currentPage === "benefits" ? "active" : ""}`}
        >
          Benefits
        </button>
        <button
          onClick={() => onNavigate("cart")}
          className={`led-nav-btn ${currentPage === "cart" ? "active" : ""}`}
          style={{ position: "relative" }}
        >
          🛒 Cart
          {cartCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                background: "#1d9e75",
                color: "#fff",
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
