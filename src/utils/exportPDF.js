/* ─────────────────────────────────────────────
   Unified PDF Export Utility
   Supports: Cart PDF, Calculator PDF
───────────────────────────────────────────── */

/* Constants */
const LAMP_TYPES = [
  { k: "inc", label: "Incandescent", color: "#7F77DD", cls: "inc" },
  { k: "hal", label: "Halogen", color: "#1D9E75", cls: "hal" },
  { k: "flu", label: "Fluorescent", color: "#D85A30", cls: "flu" },
];

/* Helper Functions */
const eff = (w, l) => (w > 0 ? l / w : 0);
const fmt$ = (v) => `$${v.toFixed(2)}`;
const fmtW = (w) => `${w.toFixed(1)} W`;

/**
 * Export cart items and ROI analysis as PDF
 * @param {Array} cartItems - Array of cart items with id, name, wattage, lumens, price, quantity
 * @param {Object} results - ROI calculation results (null if not calculated)
 * @param {Object} oldLamp - Old lamp specifications for each type
 * @param {Object} common - Common parameters (hours, days, rate)
 */
export function exportCartPDF(cartItems, results, oldLamp, common) {
  if (cartItems.length === 0) return;

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const cartRows = cartItems
    .map(
      (item) =>
        `<tr>
        <td>${item.name}</td>
        <td>${item.wattage}W</td>
        <td>${item.lumens} lm</td>
        <td>${item.quantity}</td>
        <td>${fmt$(item.price * item.quantity)}</td>
      </tr>`,
    )
    .join("");

  const totalLedWatts = cartItems.reduce(
    (sum, item) => sum + item.wattage * item.quantity,
    0,
  );
  const totalLedLumens = cartItems.reduce(
    (sum, item) => sum + item.lumens * item.quantity,
    0,
  );
  const ledEfficacy =
    totalLedWatts > 0 ? (totalLedLumens / totalLedWatts).toFixed(1) : 0;

  const oldLampRows = LAMP_TYPES.map(({ k, label }) => {
    const ol =
      oldLamp[{ inc: "incandescent", hal: "halogen", flu: "fluorescent" }[k]];
    const oldEff = ol.watts > 0 ? (ol.lumens / ol.watts).toFixed(1) : 0;
    return `<tr>
      <td>${label}</td>
      <td>${ol.watts}W</td>
      <td>${ol.lumens} lm</td>
      <td>${oldEff} lm/W</td>
    </tr>`;
  }).join("");

  const typeRows = results
    ? LAMP_TYPES.map(({ k, label }) => {
        const pb = results.paybacks.find((p) => p.t === k);
        const net5 = results.savings[k] * 5 - results.cartTotal;
        return `<tr>
        <td>${label}</td>
        <td>${fmt$(results.savings[k])}</td>
        <td style="color:${net5 >= 0 ? "#1D9E75" : "#D85A30"}">
          ${fmt$(net5)}
        </td>
        <td>${pb ? pb.time + " mo (" + (pb.time / 12).toFixed(1) + " yrs)" : "> 60 mo"}</td>
      </tr>`;
      }).join("")
    : "";

  const detailedCalcs = results
    ? LAMP_TYPES.map(({ k, label }) => {
        const ol =
          oldLamp[
            { inc: "incandescent", hal: "halogen", flu: "fluorescent" }[k]
          ];
        const oldEff = ol.watts > 0 ? ol.lumens / ol.watts : 0;
        const oldWatts = totalLedLumens / oldEff;
        const oldEnergy = (oldWatts * common.hours * common.days) / 1000;
        const newEnergy = (totalLedWatts * common.hours * common.days) / 1000;
        const annualSavings = (oldEnergy - newEnergy) * common.rate;

        return `
    <div style="margin-bottom:24px;padding:14px;background:#f9f9f9;border-radius:6px;border-left:4px solid #1d9e75">
      <h3 style="margin:0 0 12px 0;font-size:14px;color:#333">${label} Comparison</h3>
      <table style="width:100%;font-size:12px;margin-bottom:12px">
        <tr>
          <td style="padding:6px 0"><strong>Old Lamp Efficacy:</strong></td>
          <td style="text-align:right;padding:6px 0">${oldEff.toFixed(1)} lm/W</td>
        </tr>
        <tr>
          <td style="padding:6px 0"><strong>Required Wattage (for ${totalLedLumens} lumens):</strong></td>
          <td style="text-align:right;padding:6px 0">${oldWatts.toFixed(1)}W (old) vs ${totalLedWatts}W (LED)</td>
        </tr>
        <tr>
          <td style="padding:6px 0"><strong>Annual Energy:&nbsp;</strong></td>
          <td style="text-align:right;padding:6px 0">${oldEnergy.toFixed(0)} kWh (old) vs ${newEnergy.toFixed(0)} kWh (LED)</td>
        </tr>
        <tr>
          <td style="padding:6px 0"><strong>Annual Savings:</strong></td>
          <td style="text-align:right;padding:6px 0;color:#1d9e75;font-weight:600">${fmt$(annualSavings)}</td>
        </tr>
      </table>
    </div>`;
      }).join("")
    : "";

  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html>
<html><head><title>LED Cart Report</title>
<style>
  body{font-family:sans-serif;padding:32px;max-width:1000px;margin:0 auto;color:#111;line-height:1.6}
  h1{font-size:24px;margin:0 0 4px 0}
  h2{font-size:16px;margin:24px 0 12px 0;color:#1a1a2e;border-bottom:2px solid #e8d5a3;padding-bottom:8px}
  h3{font-size:14px;margin:0;color:#333}
  .sub{color:#666;margin-bottom:28px;font-size:13px}
  .summary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:28px;margin-top:16px}
  .sc{background:#f4f5f7;border-radius:8px;padding:14px}
  .sc .sl{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px}
  .sc .sv{font-size:20px;font-weight:600;margin-top:4px;font-family:monospace}
  table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px}
  th{background:#1a1a2e;color:#e8d5a3;padding:12px 14px;text-align:left;font-weight:600}
  td{padding:10px 14px;border-bottom:1px solid #eee}
  .print-btn{background:#1a1a2e;color:#e8d5a3;border:none;padding:10px 22px;border-radius:7px;
             font-size:13px;cursor:pointer;margin-bottom:24px}
  @media print{.print-btn{display:none}}
</style></head><body>
<h1>LED Cart & ROI Report</h1>
<p class="sub">Generated ${new Date().toLocaleDateString()}<br/>
  <span style="font-size:12px;color:#888">
    * All calculations are based on equivalent total lumens (same light output comparison)
  </span>
</p>
<button class="print-btn" onclick="window.print()">Print / Save as PDF</button>

<h2>1. Shopping Cart Summary</h2>
<div class="summary">
  <div class="sc"><div class="sl">Cart Total</div><div class="sv">${fmt$(cartTotal)}</div></div>
  <div class="sc"><div class="sl">Total Items</div><div class="sv">${cartItems.length}</div></div>
  <div class="sc"><div class="sl">Total Power</div><div class="sv">${totalLedWatts.toFixed(1)} W</div></div>
</div>

<h2>2. Cart Items</h2>
<table>
  <thead><tr><th>Product</th><th>Watts</th><th>Lumens</th><th>Qty</th><th>Price</th></tr></thead>
  <tbody>${cartRows}</tbody>
</table>

<h2>3. LED Configuration</h2>
<div class="summary">
  <div class="sc"><div class="sl">Total LED Power</div><div class="sv">${totalLedWatts.toFixed(1)} W</div></div>
  <div class="sc"><div class="sl">Total LED Lumens</div><div class="sv">${totalLedLumens.toFixed(0)} lm</div></div>
  <div class="sc"><div class="sl">LED Efficacy</div><div class="sv">${ledEfficacy} lm/W</div></div>
</div>

<h2>4. Calculation Parameters</h2>
<div class="summary">
  <div class="sc"><div class="sl">Usage Hours/Day</div><div class="sv">${common.hours} hrs</div></div>
  <div class="sc"><div class="sl">Operating Days/Year</div><div class="sv">${common.days} days</div></div>
  <div class="sc"><div class="sl">Electricity Rate</div><div class="sv">\$${common.rate.toFixed(2)}/kWh</div></div>
</div>

<h2>5. Old Lighting Specifications (Per Fixture)</h2>
<table>
  <thead><tr><th>Lamp Type</th><th>Watts</th><th>Lumens</th><th>Efficacy</th></tr></thead>
  <tbody>${oldLampRows}</tbody>
</table>

${
  results
    ? `
<h2>6. Detailed Savings Calculations</h2>
${detailedCalcs}

<h2>7. ROI Summary</h2>
<div class="summary">
  <div class="sc"><div class="sl">Total Investment</div><div class="sv">${fmt$(results.cartTotal)}</div></div>
  <div class="sc"><div class="sl">LED Efficacy</div><div class="sv">${results.power.led.eff.toFixed(1)} lm/W</div></div>
  <div class="sc"><div class="sl">Annual Savings (vs Inc.)</div><div class="sv">${fmt$(results.savings.inc)}</div></div>
</div>

<h2>8. Payback Analysis</h2>
<table>
  <thead><tr><th>Lamp Type</th><th>Annual Savings</th><th>5-Year Net Return</th><th>Payback Period</th></tr></thead>
  <tbody>${typeRows}</tbody>
</table>
`
    : "<h2>6. ROI Analysis</h2><p style='color:#999;font-size:13px'>No ROI analysis yet. Run 'Calculate Savings' in cart to see projected savings and payback periods.</p>"
}

</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

/**
 * Export calculator results as PDF
 * @param {Object} results - Calculator results object
 * @param {string} mode - Mode used ("quantity" or "lumens")
 */
export function exportCalculatorPDF(results, mode) {
  if (!results) return;
  const r = results;

  const rows = LAMP_TYPES.map(({ k, label }) => {
    const pb = r.paybacks.find((p) => p.t === k);
    return `
      <tr>
        <td>${label}</td>
        <td>${fmt$(r.savings[k])}</td>
        <td style="color:${r.savings[k] * 5 - r.ledCostTotal >= 0 ? "#1D9E75" : "#D85A30"}">
          ${fmt$(r.savings[k] * 5 - r.ledCostTotal)}
        </td>
        <td>${pb ? pb.time + " mo (" + (pb.time / 12).toFixed(1) + " yrs)" : "> 60 mo"}</td>
      </tr>`;
  }).join("");

  const powerRows = `
    <tr><td>Power / fixture</td>
      <td>${fmtW(r.power.inc.per)}</td><td>${fmtW(r.power.hal.per)}</td>
      <td>${fmtW(r.power.flu.per)}</td><td>${fmtW(r.power.led.per)}</td></tr>
    <tr><td>Total power</td>
      <td>${fmtW(r.power.inc.tot)}</td><td>${fmtW(r.power.hal.tot)}</td>
      <td>${fmtW(r.power.flu.tot)}</td><td>${fmtW(r.power.led.tot)}</td></tr>
    <tr><td>Efficacy</td>
      <td>${r.power.inc.eff.toFixed(1)} lm/W</td><td>${r.power.hal.eff.toFixed(1)} lm/W</td>
      <td>${r.power.flu.eff.toFixed(1)} lm/W</td><td>${r.power.led.eff.toFixed(1)} lm/W</td></tr>`;

  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html>
<html><head><title>LED ROI Report</title>
<style>
  body{font-family:sans-serif;padding:32px;max-width:720px;margin:0 auto;color:#111}
  h1{font-size:22px;margin-bottom:4px}
  .sub{color:#666;margin-bottom:28px;font-size:13px}
  .summary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:28px}
  .sc{background:#f4f5f7;border-radius:8px;padding:14px}
  .sc .sl{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px}
  .sc .sv{font-size:20px;font-weight:600;margin-top:4px;font-family:monospace}
  table{width:100%;border-collapse:collapse;margin-bottom:28px;font-size:13px}
  th{background:#1a1a2e;color:#e8d5a3;padding:10px 14px;text-align:left}
  td{padding:9px 14px;border-bottom:1px solid #eee}
  .print-btn{background:#1a1a2e;color:#e8d5a3;border:none;padding:10px 22px;border-radius:7px;
             font-size:13px;cursor:pointer;margin-bottom:24px}
  @media print{.print-btn{display:none}}
</style></head><body>
<h1>LED ROI Calculator — Report</h1>
<p class="sub">Generated ${new Date().toLocaleDateString()} &nbsp;·&nbsp; Mode: ${mode === "quantity" ? "By Quantity" : "By Total Lumens"}</p>
<button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
<div class="summary">
  <div class="sc"><div class="sl">Total investment</div><div class="sv">${fmt$(r.ledCostTotal)}</div></div>
  <div class="sc"><div class="sl">LED fixtures</div><div class="sv">${r.ledQty.toFixed(1)}</div></div>
  <div class="sc"><div class="sl">LED efficacy</div><div class="sv">${r.power.led.eff.toFixed(1)} lm/W</div></div>
</div>
<table>
  <thead><tr><th>Lamp type</th><th>Annual savings</th><th>5-yr net return</th><th>Payback period</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<table>
  <thead><tr><th>Parameter</th><th>Incandescent</th><th>Halogen</th><th>Fluorescent</th><th>LED</th></tr></thead>
  <tbody>${powerRows}</tbody>
</table>
</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}
