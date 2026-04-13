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
import { exportCalculatorPDF } from "../utils/exportPDF";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const TYPES = [
  { k: "inc", label: "Incandescent", color: "#7F77DD", cls: "inc" },
  { k: "hal", label: "Halogen", color: "#1D9E75", cls: "hal" },
  { k: "flu", label: "Fluorescent", color: "#D85A30", cls: "flu" },
];

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const eff = (w, l) => (w > 0 ? l / w : 0);
const fmt$ = (v) => `$${v.toFixed(2)}`;
const fmtW = (w) => `${w.toFixed(1)} W`;

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function Calculator() {
  /* ── state ── */
  const [mode, setMode] = useState("quantity");
  const [pendingMode, setPending] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [timeRange, setTimeRange] = useState(60);
  const [hasResults, setHasResults] = useState(false);
  const [results, setResults] = useState(null);

  const [common, setCommon] = useState({
    hours: 24,
    days: 365,
    rate: 0.14,
    ledCost: 10,
    rebate: 0,
    installation: 100,
    delivery: 40,
  });
  const [oldLamp, setOldLamp] = useState({
    incandescent: { watts: 60, lumens: 800 },
    halogen: { watts: 50, lumens: 900 },
    fluorescent: { watts: 30, lumens: 1800 },
  });
  const [led, setLed] = useState({ watts: 10, lumens: 1200 });
  const [qIn, setQIn] = useState({ qty: 100, oldLm: 800 });
  const [lIn, setLIn] = useState({ total: 100000, oldLm: 800 });

  /* ── mode switch (with save prompt) ── */
  const handleModeClick = (m) => {
    if (m === mode) return;
    if (hasResults) {
      setPending(m);
      setShowModal(true);
    } else setMode(m);
  };

  const doSwitch = (save) => {
    if (save) exportCalculatorPDF(results, mode);
    setMode(pendingMode);
    setPending(null);
    setShowModal(false);
    setHasResults(false);
    setResults(null);
  };

  /* ── calculate ── */
  const calculate = () => {
    const ledEff = eff(led.watts, led.lumens);
    let oldQty = {},
      ledQty = 0,
      oldTotLm = 0,
      ledTotLm = 0,
      oldLmPer = 0;

    if (mode === "quantity") {
      const q = qIn.qty;
      oldLmPer = qIn.oldLm;
      oldTotLm = q * oldLmPer;
      ledTotLm = q * led.lumens;
      oldQty = { inc: q, hal: q, flu: q };
      ledQty = q;
    } else {
      const tot = lIn.total;
      oldLmPer = lIn.oldLm;
      oldTotLm = tot;
      ledTotLm = tot;
      const oq = tot / oldLmPer;
      oldQty = { inc: oq, hal: oq, flu: oq };
      ledQty = tot / led.lumens;
    }

    const typeMap = { inc: "incandescent", hal: "halogen", flu: "fluorescent" };

    const calcSav = (key) => {
      const ol = oldLamp[typeMap[key]];
      const oEff = eff(ol.watts, ol.lumens);
      const oW = oldTotLm / oEff;
      const lW = ledTotLm / ledEff;
      const oE = (oW * common.hours * common.days) / 1000;
      const nE = (lW * common.hours * common.days) / 1000;
      return (oE - nE) * common.rate;
    };

    const savings = {
      inc: calcSav("inc"),
      hal: calcSav("hal"),
      flu: calcSav("flu"),
    };
    const ledCostTotal =
      ledQty * common.ledCost -
      ledQty * common.rebate +
      common.installation +
      common.delivery;

    /* chart data */
    const chart = [];
    const paybacks = [];
    for (let m = 0; m <= 60; m++) {
      const row = { time: m };
      ["inc", "hal", "flu"].forEach((t) => {
        row[t] = (m / 12) * savings[t] - ledCostTotal;
      });
      chart.push(row);
      if (m > 0) {
        ["inc", "hal", "flu"].forEach((t) => {
          if (row[t] >= 0 && !paybacks.find((p) => p.t === t))
            paybacks.push({ time: m, val: row[t], t });
        });
      }
    }

    /* power info */
    const mkPow = (key) => {
      const ol = oldLamp[typeMap[key]];
      const oEf = eff(ol.watts, ol.lumens);
      const per = oldLmPer / oEf;
      return { per, tot: per * oldQty[key], eff: oEf };
    };
    const power = {
      inc: mkPow("inc"),
      hal: mkPow("hal"),
      flu: mkPow("flu"),
      led: { per: led.watts, tot: led.watts * ledQty, eff: ledEff },
    };

    setResults({
      savings,
      ledCostTotal,
      ledQty,
      oldQty,
      oldTotLm,
      ledTotLm,
      chart,
      paybacks,
      power,
    });
    setHasResults(true);
  };

  /* ── derived ── */
  const filteredChart = results
    ? results.chart.filter((d) => d.time <= timeRange)
    : [];
  const lumPct = results
    ? (
        ((results.ledTotLm - results.oldTotLm) / results.oldTotLm) *
        100
      ).toFixed(1)
    : 0;

  /* ─────────────────────────────────────────────
     Render
  ───────────────────────────────────────────── */
  return (
    <div className="led-app">
      <div className="page-header">
        <h1>LED Lighting ROI Calculator</h1>
      </div>
      {/* ── mode card ── */}
      <div className="led-card">
        <h2>Calculation mode</h2>
        <div className="mode-row">
          <button
            className={"mode-btn" + (mode === "quantity" ? " active" : "")}
            onClick={() => handleModeClick("quantity")}
          >
            By Quantity — replace same number of fixtures
          </button>
          <button
            className={"mode-btn" + (mode === "lumen" ? " active" : "")}
            onClick={() => handleModeClick("lumen")}
          >
            By Total Lumens — match light output
          </button>
        </div>
      </div>

      {/* ── inputs card ── */}
      <div className="led-card">
        {/* old lamps */}
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
                {eff(oldLamp[type].watts, oldLamp[type].lumens).toFixed(1)} lm/W
              </div>
            </div>
          ))}
        </div>

        {/* LED lamp */}
        <h2>LED parameters (per fixture)</h2>
        <div className="lamp-grid">
          <div className="lamp-box led-box">
            <div className="lamp-label" style={{ color: "#0F6E56" }}>
              LED
            </div>
            <div className="inp-row">
              <div className="inp-group">
                <label>Watts (W)</label>
                <input
                  type="number"
                  value={led.watts}
                  onChange={(e) =>
                    setLed((p) => ({
                      ...p,
                      watts: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="inp-group">
                <label>Lumens (lm)</label>
                <input
                  type="number"
                  value={led.lumens}
                  onChange={(e) =>
                    setLed((p) => ({
                      ...p,
                      lumens: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <div className="eff-tag" style={{ color: "#0F6E56" }}>
              Efficacy: {eff(led.watts, led.lumens).toFixed(1)} lm/W
            </div>
          </div>
        </div>

        {/* mode-specific inputs */}
        {mode === "quantity" ? (
          <div
            className="params-grid"
            style={{
              gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
            }}
          >
            <div className="inp-group">
              <label>Number of old fixtures</label>
              <input
                type="number"
                value={qIn.qty}
                onChange={(e) =>
                  setQIn((p) => ({
                    ...p,
                    qty: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="inp-group">
              <label>Lumens per old fixture</label>
              <input
                type="number"
                value={qIn.oldLm}
                onChange={(e) =>
                  setQIn((p) => ({
                    ...p,
                    oldLm: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
        ) : (
          <div
            className="params-grid"
            style={{
              gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
            }}
          >
            <div className="inp-group">
              <label>Total lumens required</label>
              <input
                type="number"
                value={lIn.total}
                onChange={(e) =>
                  setLIn((p) => ({
                    ...p,
                    total: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="inp-group">
              <label>Lumens per old fixture</label>
              <input
                type="number"
                value={lIn.oldLm}
                onChange={(e) =>
                  setLIn((p) => ({
                    ...p,
                    oldLm: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
        )}

        {/* common params */}
        <h2 style={{ marginTop: 16 }}>Cost & usage parameters</h2>
        <div className="params-grid">
          {[
            ["hours", "Hours / day"],
            ["days", "Days / year"],
            ["rate", "Electricity ($/kWh)"],
            ["ledCost", "LED cost ($ / fixture)"],
            ["rebate", "Rebate ($ / fixture)"],
            ["installation", "Installation ($)"],
            ["delivery", "Delivery ($)"],
          ].map(([k, l]) => (
            <div className="inp-group" key={k}>
              <label>{l}</label>
              <input
                type="number"
                value={common[k]}
                onChange={(e) =>
                  setCommon((p) => ({
                    ...p,
                    [k]: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          ))}
        </div>

        {/* action buttons */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
          <button className="calc-btn" onClick={calculate}>
            Confirm &amp; Calculate
          </button>
          {hasResults && (
            <button
              className="pdf-btn"
              onClick={() => exportCalculatorPDF(results, mode)}
            >
              Export PDF
            </button>
          )}
        </div>
      </div>

      {/* ── results card ── */}
      {results && (
        <div className="led-card">
          <h2>Results</h2>

          {/* summary stat cards */}
          <div className="summary-row">
            <div className="stat-card">
              <div className="s-label">Total investment</div>
              <div className="s-val">{fmt$(results.ledCostTotal)}</div>
            </div>
            <div className="stat-card">
              <div className="s-label">LED fixtures</div>
              <div className="s-val">{results.ledQty.toFixed(1)}</div>
            </div>
            <div className="stat-card">
              <div className="s-label">LED efficacy</div>
              <div className="s-val">
                {results.power.led.eff.toFixed(1)} lm/W
              </div>
            </div>
            <div className="stat-card">
              <div className="s-label">Total LED power</div>
              <div className="s-val">{fmtW(results.power.led.tot)}</div>
            </div>
          </div>

          {/* lumen bar */}
          <div className="lumen-bar">
            <div className="lb-row">
              <span style={{ fontSize: 12, color: "#666" }}>
                Brightness comparison
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'DM Mono',monospace",
                  color:
                    results.ledTotLm >= results.oldTotLm
                      ? "#1D9E75"
                      : "#D85A30",
                }}
              >
                {results.ledTotLm >= results.oldTotLm ? "+" : ""}
                {lumPct}% vs old
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>
              Old: {results.oldTotLm.toFixed(0)} lm &nbsp;·&nbsp; LED:{" "}
              {results.ledTotLm.toFixed(0)} lm
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width:
                    Math.min(
                      100,
                      (results.ledTotLm /
                        Math.max(results.oldTotLm, results.ledTotLm)) *
                        100,
                    ) + "%",
                }}
              />
            </div>
          </div>

          {/* per-lamp result cards */}
          <div className="lamp-results">
            {TYPES.map(({ k, label, cls }) => {
              const pb = results.paybacks.find((p) => p.t === k);
              const net5 = results.savings[k] * 5 - results.ledCostTotal;
              return (
                <div className="lr-card" key={k}>
                  <div className={"lr-name " + cls}>{label}</div>
                  <div className="lr-row">
                    <span>Quantity</span>
                    <span className="lr-v">{results.oldQty[k].toFixed(1)}</span>
                  </div>
                  <div className="lr-row">
                    <span>Power / fixture</span>
                    <span className="lr-v">{fmtW(results.power[k].per)}</span>
                  </div>
                  <div className="lr-row">
                    <span>Total power</span>
                    <span className="lr-v">{fmtW(results.power[k].tot)}</span>
                  </div>
                  <div className="lr-row">
                    <span>Efficacy</span>
                    <span className="lr-v">
                      {results.power[k].eff.toFixed(1)} lm/W
                    </span>
                  </div>
                  <div className="lr-big">
                    <div
                      style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}
                    >
                      Annual savings
                    </div>
                    <div className="savings">{fmt$(results.savings[k])}</div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 8,
                      }}
                    >
                      <span style={{ fontSize: 11, color: "#aaa" }}>
                        5-yr net return
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontFamily: "'DM Mono',monospace",
                          fontWeight: 600,
                          color: net5 >= 0 ? "#1D9E75" : "#D85A30",
                        }}
                      >
                        {fmt$(net5)}
                      </span>
                    </div>
                    <div className="payback">
                      {pb
                        ? `Payback: ${pb.time} months (${(pb.time / 12).toFixed(1)} yrs)`
                        : "Payback: > 60 months"}
                    </div>
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
                    {TYPES.map(({ k, label, color }) => (
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

      {/* ── save modal ── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Switch calculation mode?</h3>
            <p>
              You have existing results. Would you like to export them as a PDF
              before switching to{" "}
              {pendingMode === "quantity" ? "Quantity" : "Lumens"} mode?
            </p>
            <div className="modal-btns">
              <button
                className="mb-cancel"
                onClick={() => {
                  setShowModal(false);
                  setPending(null);
                }}
              >
                Cancel
              </button>
              <button className="mb-nosave" onClick={() => doSwitch(false)}>
                Discard
              </button>
              <button className="mb-save" onClick={() => doSwitch(true)}>
                Save PDF &amp; Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
