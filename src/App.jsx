import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import Header from "./components/Header";
import Banner from "./components/Banner";
import Calculator from "./components/Calculator";
import Benefits from "./components/Benefits";
import Products from "./components/Products";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div className="led-app">
        {/* Header - always visible */}
        <Header currentPage={currentPage} onNavigate={handleNavigate} />

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
        {currentPage === "products" && <Products />}
      </div>
    </>
  );
}
