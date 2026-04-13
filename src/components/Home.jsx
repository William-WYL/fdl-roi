import Banner from "./Banner";

export default function Home({ onNavigate }) {
  return (
    <>
      {/* Banner */}
      <Banner />

      {/* Page Content */}
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <h1 className="text-center">Welcome to Factory Direct Lighting</h1>
          <p>
            Factory Direct Lighting designs premier LED lighting solutions in
            Canada. FDL offers a wide range of LED lighting options to suit
            every need and style preference: High Bays, Panel Lights, Linear
            Strip Lights, Recessed Pot Lights, Recessed Downlights, Slim Baffle,
            Floating Gimbal, Emergency Light, etc. FDL is dedicated to
            brightening up your spaces with efficiency and elegance, ensuring
            both affordability and excellence.
          </p>
        </div>
        {/* Call to Action Buttons */}
        <div className="fdl-cta-buttons">
          <button onClick={() => onNavigate("calculator")} className="calc-btn">
            ROI Calculator
          </button>
          <button
            onClick={() => onNavigate("products")}
            className="calc-btn"
            style={{ marginLeft: 12 }}
          >
            Browse Products
          </button>
        </div>

        {/* Features Grid */}
        <div className="fdl-features-grid">
          {/* Feature 1 */}
          <div className="fdl-feature-card">
            <div className="fdl-feature-icon">
              <i className="fas fa-warehouse"></i>
            </div>
            <h3 className="fdl-feature-title">Canada Warehouses</h3>
            <p className="fdl-feature-subtitle">Canadian LED Manufacturer</p>
            <p className="fdl-feature-desc">
              FDL is an LED Lighting manufacturer shipping across Canada.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="fdl-feature-card">
            <div className="fdl-feature-icon">
              <i className="fas fa-certificate"></i>
            </div>
            <h3 className="fdl-feature-title">Certified Quality</h3>
            <p className="fdl-feature-subtitle">Product Quality Certified</p>
            <p className="fdl-feature-desc">
              Our products are under multiple certifications: DLC 5.1 Premium,
              ETL certified, Energy Star, etc.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="fdl-feature-card">
            <div className="fdl-feature-icon">
              <i className="fas fa-handshake"></i>
            </div>
            <h3 className="fdl-feature-title">Contractor Distributor</h3>
            <p className="fdl-feature-subtitle">Partnership Development</p>
            <p className="fdl-feature-desc">
              We offer high quality products and supreme customer service to
              you.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="fdl-feature-card">
            <div className="fdl-feature-icon">
              <i className="fas fa-lightbulb"></i>
            </div>
            <h3 className="fdl-feature-title">Lighting Audit</h3>
            <p className="fdl-feature-subtitle">Free Lighting Audit</p>
            <p className="fdl-feature-desc">
              We provide free LED lighting audit, meeting your customized needs.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="fdl-feature-card">
            <div className="fdl-feature-icon">
              <i className="fas fa-truck"></i>
            </div>
            <h3 className="fdl-feature-title">Free Shipping</h3>
            <p className="fdl-feature-subtitle">Courier Shipping & Delivery</p>
            <p className="fdl-feature-desc">
              Any orders over $1300 will be qualified for free shipping.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="fdl-feature-card">
            <div className="fdl-feature-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3 className="fdl-feature-title">Energy Rebate Program</h3>
            <p className="fdl-feature-subtitle">Energy Rebate Program</p>
            <p className="fdl-feature-desc">
              We provide instant discounts from Save On Energy on qualifying
              energy-efficient lighting purchases.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
