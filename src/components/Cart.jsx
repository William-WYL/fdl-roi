import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceDot,
} from "recharts";
import { exportCartPDF } from "../utils/exportPDF";
import useProductStore from "../stores/productStore";
import {
  LAMP_TYPES,
  calculateLEDFromCart,
  calculateCartROI,
  fmt$,
  fmtW,
  eff,
} from "../utils/calculator";

export default function Cart({
  cartItems,
  onRemoveFromCart,
  onUpdateQuantity,
}) {
  const [showChart, setShowChart] = useState(false);
  const [timeRange, setTimeRange] = useState(60);
  const [results, setResults] = useState(null);
  const getEffectivePrice = useProductStore((state) => state.getEffectivePrice);

  const [common, setCommon] = useState({
    hours: 24,
    days: 365,
    rate: 0.14,
    installation: 100,
    delivery: 40,
  });

  const [oldLamp, setOldLamp] = useState({
    incandescent: { watts: 60, lumens: 800 },
    halogen: { watts: 50, lumens: 900 },
    fluorescent: { watts: 30, lumens: 1800 },
  });

  // Calculate total LED wattage and lumens from cart
  const ledData = calculateLEDFromCart(cartItems);

  const calculate = () => {
    if (cartItems.length === 0) return;

    // Use centralized ROI calculator
    setResults(calculateCartROI(cartItems, oldLamp, common, getEffectivePrice));
  };

  const filteredChart = results
    ? results.chart.filter((d) => d.time <= timeRange)
    : [];
  const cartSubtotal = cartItems.reduce(
    (sum, item) =>
      sum + getEffectivePrice(item.id, item.quantity) * item.quantity,
    0,
  );
  const electricityCostData = results
    ? [
        {
          k: "led",
          label: "LED",
          color: "#0F6E56",
          annualCost:
            ((results.power.led.tot * common.hours * common.days) / 1000) *
            common.rate,
        },
        ...LAMP_TYPES.map(({ k, label, color }) => ({
          k,
          label,
          color,
          annualCost:
            ((results.power[k].tot * common.hours * common.days) / 1000) *
            common.rate,
        })),
      ]
    : [];
  const maxElectricityCost = electricityCostData.length
    ? Math.max(...electricityCostData.map((d) => d.annualCost), 1)
    : 1;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p>Review your selected LED products and see savings potential.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="led-card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 16, color: "#999" }}>Your cart is empty</p>
          <p style={{ fontSize: 13, color: "#aaa" }}>
            Add some products to get started!
          </p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="led-card">
            <h2>Cart Items</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eee" }}>
                  <th style={{ textAlign: "left", padding: 12 }}>Product</th>
                  <th style={{ textAlign: "center", padding: 12 }}>SKU</th>
                  <th style={{ textAlign: "center", padding: 12 }}>Watts</th>
                  <th style={{ textAlign: "center", padding: 12 }}>Lumens</th>
                  <th style={{ textAlign: "center", padding: 12 }}>Qty</th>
                  <th style={{ textAlign: "center", padding: 12 }}>
                    Unit Price
                  </th>
                  <th style={{ textAlign: "right", padding: 12 }}>
                    Total Price
                  </th>
                  <th style={{ textAlign: "center", padding: 12 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 12 }}>{item.name}</td>
                    <td
                      style={{
                        textAlign: "center",
                        padding: 12,
                        fontSize: 13,
                        fontFamily: "monospace",
                      }}
                    >
                      {item.sku}
                    </td>
                    <td
                      style={{ textAlign: "center", padding: 12, fontSize: 13 }}
                    >
                      {item.wattage}W
                    </td>
                    <td
                      style={{ textAlign: "center", padding: 12, fontSize: 13 }}
                    >
                      {item.lumens} lm
                    </td>
                    <td style={{ textAlign: "center", padding: 12 }}>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          onUpdateQuantity(
                            item.id,
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="quantity-input"
                        style={{
                          width: 60,
                          padding: "6px 8px",
                          border: "0.5px solid #ccc",
                          borderRadius: 4,
                          fontSize: 13,
                          textAlign: "center",
                        }}
                      />
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        padding: 12,
                        fontWeight: 500,
                        color: "#1d9e75",
                        fontFamily: "DM Mono, monospace",
                      }}
                    >
                      {fmt$(getEffectivePrice(item.id, item.quantity))}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        padding: 12,
                        fontWeight: 600,
                      }}
                    >
                      {fmt$(
                        getEffectivePrice(item.id, item.quantity) *
                          item.quantity,
                      )}
                    </td>
                    <td style={{ textAlign: "center", padding: 12 }}>
                      <button
                        onClick={() => onRemoveFromCart(item.id)}
                        style={{
                          background: "#fff",
                          border: "1px solid #ddd",
                          color: "#666",
                          padding: "6px 12px",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: 12,
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = "#f5f5f5";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = "#fff";
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{
                marginTop: 12,
                marginRight: 14,
                textAlign: "right",
                fontSize: 14,
                fontWeight: 600,
                color: "#000000",
                fontFamily: "DM Mono, monospace",
              }}
            >
              Total: <span>{fmt$(cartSubtotal)}</span>
            </div>
          </div>

          {/* LED Data Summary */}
          <div className="led-card">
            <h2>Your LED Configuration</h2>
            <div className="summary-row">
              <div className="stat-card">
                <div className="s-label">Total LED Power</div>
                <div className="s-val">{fmtW(ledData.totalWatts)}</div>
              </div>
              <div className="stat-card">
                <div className="s-label">Total LED Lumens</div>
                <div className="s-val">{ledData.totalLumens.toFixed(0)} lm</div>
              </div>
              <div className="stat-card">
                <div className="s-label">LED Efficacy</div>
                <div className="s-val">
                  {eff(ledData.totalWatts, ledData.totalLumens).toFixed(1)} lm/W
                </div>
              </div>
              <div className="stat-card">
                <div className="s-label">Categories Count</div>
                <div className="s-val">{cartItems.length}</div>
              </div>
            </div>
          </div>

          {/* Calculation Parameters */}
          <div className="led-card">
            <h2>Calculation Parameters</h2>
            <div className="params-grid">
              <div className="inp-group">
                <label>Hours per day</label>
                <input
                  type="number"
                  value={common.hours}
                  onChange={(e) =>
                    setCommon({ ...common, hours: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="inp-group">
                <label>Days per year</label>
                <input
                  type="number"
                  value={common.days}
                  onChange={(e) =>
                    setCommon({ ...common, days: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="inp-group">
                <label>Electricity ($/kWh)</label>
                <input
                  type="number"
                  value={common.rate}
                  onChange={(e) =>
                    setCommon({ ...common, rate: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="inp-group">
                <label>Installation ($)</label>
                <input
                  type="number"
                  value={common.installation}
                  onChange={(e) =>
                    setCommon({
                      ...common,
                      installation: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="inp-group">
                <label>Delivery ($)</label>
                <input
                  type="number"
                  value={common.delivery}
                  onChange={(e) =>
                    setCommon({
                      ...common,
                      delivery: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Old Lamp Parameters */}
          <div className="led-card">
            <h2>Old lighting parameters (per fixture)</h2>
            <div className="lamp-grid">
              {["incandescent", "halogen", "fluorescent"].map((type) => (
                <div className="lamp-box" key={type}>
                  <div className="lamp-label">{type}</div>
                  <div className="inp-row">
                    <div className="inp-group">
                      <label>Watts (W)</label>
                      <input
                        type="number"
                        value={oldLamp[type].watts}
                        onChange={(e) =>
                          setOldLamp((p) => ({
                            ...p,
                            [type]: {
                              ...p[type],
                              watts: parseFloat(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="inp-group">
                      <label>Lumens (lm)</label>
                      <input
                        type="number"
                        value={oldLamp[type].lumens}
                        onChange={(e) =>
                          setOldLamp((p) => ({
                            ...p,
                            [type]: {
                              ...p[type],
                              lumens: parseFloat(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="eff-tag">
                    Efficacy:{" "}
                    {eff(oldLamp[type].watts, oldLamp[type].lumens).toFixed(1)}{" "}
                    lm/W
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 16,
              }}
            >
              <button className="calc-btn" onClick={calculate}>
                Calculate Savings
              </button>
              {results && (
                <button
                  className="pdf-btn"
                  onClick={() =>
                    exportCartPDF(
                      cartItems,
                      results,
                      oldLamp,
                      common,
                      getEffectivePrice,
                    )
                  }
                >
                  Export PDF
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="led-card">
              <h2>Savings Analysis</h2>
              <div
                style={{
                  fontSize: 12,
                  color: "#888",
                  marginBottom: 12,
                  fontStyle: "italic",
                }}
              >
                * Calculation based on equivalent total lumens (same light
                output comparison) and the lowest values from each product's
                available options. For products with multiple wattage, voltage,
                or lumens options, we use the minimum value to provide
                conservative (best-case) savings estimates.
              </div>
              {/* summary stat cards */}
              <div className="summary-row">
                <div className="stat-card">
                  <div className="s-label">Total Investment</div>
                  <div className="s-val">{fmt$(results.cartTotal)}</div>
                </div>
                <div className="stat-card">
                  <div className="s-label">LED Efficacy</div>
                  <div className="s-val">
                    {results.power.led.eff.toFixed(1)} lm/W
                  </div>
                </div>
                <div className="stat-card">
                  <div className="s-label">
                    Annual Savings (vs Incandescent)
                  </div>
                  <div className="s-val">{fmt$(results.savings.inc)}</div>
                </div>
              </div>

              {electricityCostData.length > 0 && (
                <div className="cost-bar-chart">
                  <div className="cbc-title">
                    Annual Electricity Cost Comparison
                  </div>
                  {electricityCostData.map((row) => {
                    const width = (row.annualCost / maxElectricityCost) * 100;
                    return (
                      <div className="cbc-row" key={row.k}>
                        <div className="cbc-label">{row.label}</div>
                        <div className="cbc-track">
                          <div
                            className="cbc-fill"
                            style={{
                              width: `${width}%`,
                              backgroundColor: row.color,
                            }}
                          />
                        </div>
                        <div className="cbc-value">
                          {fmt$(row.annualCost)} / yr
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* per-lamp result cards */}
              <div className="lamp-results">
                {LAMP_TYPES.map(({ k, label, cls }) => {
                  const pb = results.paybacks.find((p) => p.t === k);
                  const net5 = results.savings[k] * 5 - results.cartTotal;
                  return (
                    <div className="lr-card" key={k}>
                      <div className={"lr-name " + cls}>{label}</div>
                      <div className="lr-row">
                        <span>Annual savings</span>
                        <span className="lr-v">{fmt$(results.savings[k])}</span>
                      </div>
                      <div className="lr-row">
                        <span>5-yr vs old</span>
                        <span
                          className="lr-v"
                          style={{
                            color: net5 >= 0 ? "#1D9E75" : "#D85A30",
                          }}
                        >
                          {fmt$(net5)}
                        </span>
                      </div>
                      <div className="lr-row">
                        <span>Payback</span>
                        <span className="lr-v">
                          {pb ? `${pb.time} mo` : "> 60 mo"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* chart */}
              <div style={{ marginTop: 20 }}>
                <button
                  className="chart-toggle"
                  onClick={() => setShowChart((p) => !p)}
                >
                  {showChart ? "Hide chart" : "Show ROI chart"}
                </button>
                {showChart && (
                  <div>
                    <div className="chart-wrap">
                      <LineChart
                        width={880}
                        height={320}
                        data={filteredChart}
                        margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => v + "mo"}
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => "$" + Math.round(v)}
                        />
                        <Tooltip
                          formatter={(v, n) => [fmt$(v), n]}
                          labelFormatter={(l) => l + " months"}
                        />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                        {LAMP_TYPES.map(({ k, label, color }) => (
                          <Line
                            key={k}
                            dataKey={k}
                            name={label}
                            stroke={color}
                            dot={false}
                            strokeWidth={2}
                          />
                        ))}
                        {results.paybacks.map((p, i) => (
                          <ReferenceDot
                            key={i}
                            x={p.time}
                            y={p.val}
                            r={5}
                            fill="#e8d5a3"
                            stroke="#1a1a2e"
                            strokeWidth={1.5}
                          />
                        ))}
                      </LineChart>
                    </div>
                    <div className="range-row">
                      <span>Show: 0 –</span>
                      <input
                        type="range"
                        min={6}
                        max={60}
                        step={6}
                        value={timeRange}
                        onChange={(e) => setTimeRange(parseInt(e.target.value))}
                      />
                      <span>{timeRange} months</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
