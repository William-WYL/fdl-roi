import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import Header from "./components/Header";
import Home from "./components/Home";
import Calculator from "./components/Calculator";
import Benefits from "./components/Benefits";
import Products from "./components/Products";
import ProductInfo from "./components/ProductInfo";
import Cart from "./components/Cart";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [cartItems, setCartItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);

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

        {/* Page content */}
        {currentPage === "home" && <Home onNavigate={handleNavigate} />}

        {currentPage === "calculator" && <Calculator />}
        {currentPage === "benefits" && <Benefits />}
        {currentPage === "products" && (
          <Products
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
            onSelectProduct={setSelectedProductId}
          />
        )}
        {currentPage === "product-detail" && selectedProductId && (
          <ProductInfo
            productId={selectedProductId}
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
          />
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
