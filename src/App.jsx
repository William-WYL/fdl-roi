import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import Header from "./components/Header";
import Banner from "./components/Banner";
import Calculator from "./components/Calculator";
import Benefits from "./components/Benefits";
import Products from "./components/Products";
import Cart from "./components/Cart";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [cartItems, setCartItems] = useState([]);

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleAddToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.quantity }
            : item,
        );
      }
      return [...prevItems, product];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId),
    );
  };

  const handleUpdateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    }
  };

  return (
    <>
      <div className="led-app">
        {/* Header - always visible */}
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        />

        {/* Banner - only show on home page */}
        {currentPage === "home" && <Banner />}

        {/* Page content */}
        {currentPage === "home" && (
          <div className="page-container" style={{ textAlign: "center" }}>
            <div className="page-header">
              <h1>Welcome to LED ROI Calculator</h1>
              <p>
                Calculate your return on investment when switching to LED
                lighting. Use our calculator to see potential savings on energy
                costs.
              </p>
            </div>
            <button
              onClick={() => handleNavigate("calculator")}
              className="calc-btn"
              style={{ marginTop: 20 }}
            >
              Start Calculator
            </button>
          </div>
        )}

        {currentPage === "calculator" && <Calculator />}
        {currentPage === "benefits" && <Benefits />}
        {currentPage === "products" && (
          <Products onAddToCart={handleAddToCart} />
        )}
        {currentPage === "cart" && (
          <Cart
            cartItems={cartItems}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateQuantity={handleUpdateCartQuantity}
          />
        )}
      </div>
    </>
  );
}
