import logo from "../../public/images/0001465_FDLlogo.png";

export default function Header({ currentPage, onNavigate }) {
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
          onClick={() => onNavigate("benefits")}
          className={`led-nav-btn ${currentPage === "benefits" ? "active" : ""}`}
        >
          Benefits
        </button>
        <button
          onClick={() => onNavigate("products")}
          className={`led-nav-btn ${currentPage === "products" ? "active" : ""}`}
        >
          Products
        </button>
      </div>
    </div>
  );
}
