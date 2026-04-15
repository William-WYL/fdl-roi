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
const fmtQty = (q) =>
  Number.isFinite(q)
    ? Math.abs(q - Math.round(q)) < 1e-9
      ? String(Math.round(q))
      : q.toFixed(1)
    : "0";

/**
 * Export cart items and ROI analysis as PDF
 * @param {Array} cartItems - Array of cart items with id, name, wattage, lumens, price, quantity
 * @param {Object} results - ROI calculation results (null if not calculated)
 * @param {Object} oldLamp - Old lamp specifications for each type
 * @param {Object} common - Common parameters (hours, days, rate)
 */
export function exportCartPDF(
  cartItems,
  results,
  oldLamp,
  common,
  getEffectivePrice,
) {
  if (cartItems.length === 0) return;

  const cartProductTotal = cartItems.reduce(
    (sum, item) =>
      sum + getEffectivePrice(item.id, item.quantity) * item.quantity,
    0,
  );

  const totalInvestment =
    cartProductTotal + (common.installation || 0) + (common.delivery || 0);

  const cartRows = cartItems
    .map((item) => {
      const unitPrice = getEffectivePrice(item.id, item.quantity);
      return `<tr>
        <td>${item.name}</td>
        <td>${item.sku}</td>
        <td>${fmt$(unitPrice)}</td>
        <td>${item.quantity}</td>
        <td>${fmt$(unitPrice * item.quantity)}</td>
      </tr>`;
    })
    .join("");

  const totalLedWatts = cartItems.reduce(
    (sum, item) => sum + item.wattage * item.quantity,
    0,
  );
  const totalLedLumens = cartItems.reduce(
    (sum, item) => sum + item.lumens * item.quantity,
    0,
  );
  const totalFixtures = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const ledEfficacy =
    totalLedWatts > 0 ? (totalLedLumens / totalLedWatts).toFixed(1) : 0;

  const detailedCalcs = results
    ? LAMP_TYPES.map(({ k, label }) => {
        const ol =
          oldLamp[
            { inc: "incandescent", hal: "halogen", flu: "fluorescent" }[k]
          ];
        const oldEff = eff(ol.watts, ol.lumens);
        if (oldEff <= 0) {
          return `
    <div style="margin-bottom:24px;padding:14px;background:#f9f9f9;border-radius:6px;border-left:4px solid #1d9e75">
      <h3 style="margin:0 0 12px 0;font-size:14px;color:#333">${label} Comparison</h3>
      <p style="margin:0;font-size:12px;color:#666">Insufficient old-lamp efficacy data to compute this comparison.</p>
    </div>`;
        }
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

  const projectionRows = results
    ? results.chart
        .filter((row) => row.time % 6 === 0)
        .map(
          (row) => `
      <tr>
        <td>${row.time} mo</td>
        <td>${fmt$(row.inc)}</td>
        <td>${fmt$(row.hal)}</td>
        <td>${fmt$(row.flu)}</td>
      </tr>`,
        )
        .join("")
    : "";

  const fullProjectionRows = results
    ? results.chart
        .map(
          (row) => `
      <tr>
        <td>${row.time} mo</td>
        <td>${fmt$(row.inc)}</td>
        <td>${fmt$(row.hal)}</td>
        <td>${fmt$(row.flu)}</td>
      </tr>`,
        )
        .join("")
    : "";

  const paybackSummaryRows = results
    ? LAMP_TYPES.map(({ k, label }) => {
        const pb = results.paybacks.find((p) => p.t === k);
        const net5 = results.savings[k] * 5 - totalInvestment;
        return `<tr>
          <td>${label}</td>
          <td>${fmt$(results.savings[k])}</td>
          <td style="color:${net5 >= 0 ? "#1D9E75" : "#D85A30"}">${fmt$(net5)}</td>
          <td>${pb ? pb.time : "> 60"}</td>
          <td>${pb ? (pb.time / 12).toFixed(1) : "> 5.0"}</td>
          <td>${pb ? "Reached" : "Not reached"}</td>
        </tr>`;
      }).join("")
    : "";

  const bestFiveYearReturn = results
    ? Math.max(
        ...LAMP_TYPES.map(({ k }) => results.savings[k] * 5 - totalInvestment),
      )
    : 0;

  const annualRoiCart =
    results && totalInvestment > 0
      ? (() => {
          const fiveYearMultiple = 1 + bestFiveYearReturn / totalInvestment;
          if (fiveYearMultiple <= 0) return "-100.00";
          return ((Math.pow(fiveYearMultiple, 1 / 5) - 1) * 100).toFixed(2);
        })()
      : "0.00";

  const fiveYearRoiCart =
    results && totalInvestment > 0
      ? ((bestFiveYearReturn / totalInvestment) * 100).toFixed(2)
      : "0.00";

  const comparisonRows = LAMP_TYPES.map(({ k, label }) => {
    const ol =
      oldLamp[{ inc: "incandescent", hal: "halogen", flu: "fluorescent" }[k]];
    return `<tr>
      <td>${label}</td>
      <td>${ol.watts} W</td>
      <td>${ol.lumens} lm</td>
      <td>${eff(ol.watts, ol.lumens).toFixed(1)} lm/W</td>
    </tr>`;
  }).join("");

  const ledPerFixtureWatts =
    totalFixtures > 0 ? totalLedWatts / totalFixtures : 0;
  const ledPerFixtureLumens =
    totalFixtures > 0 ? totalLedLumens / totalFixtures : 0;

  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html>
<html><head><title>LED Cart Report</title>
<style>
  body{font-family:Arial,sans-serif;padding:32px;max-width:1020px;margin:0 auto;color:#111;line-height:1.6;background:#fff}
  h1{font-size:26px;margin:0 0 4px 0;color:#1a1a2e}
  h2{font-size:16px;margin:0 0 12px 0;color:#1a1a2e;border-bottom:2px solid #e8d5a3;padding-bottom:8px}
  h3{font-size:14px;margin:0 0 10px 0;color:#333}
  .sub{color:#666;margin-bottom:20px;font-size:13px}
  .section{margin:0 0 26px 0}
  .summary{display:grid;grid-template-columns:repeat(auto-fit, minmax(170px, 1fr));gap:12px}
  .sc{background:#f7f8fa;border:1px solid #ebedf0;border-radius:10px;padding:12px 14px}
  .sc .sl{font-size:11px;color:#777;text-transform:uppercase;letter-spacing:.5px}
  .sc .sv{font-size:20px;font-weight:700;margin-top:4px;font-family:Consolas,monospace;color:#1a1a2e}
  .pos{color:#1D9E75 !important}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{background:#1a1a2e;color:#e8d5a3;padding:10px 12px;text-align:left;font-weight:600}
  td{padding:9px 12px;border-bottom:1px solid #eceff3;vertical-align:top}
  .table-wrap{border:1px solid #e6e9ee;border-radius:8px;overflow:hidden}
  .print-btn{background:#1a1a2e;color:#e8d5a3;border:none;padding:10px 22px;border-radius:7px;
             font-size:13px;cursor:pointer;margin-bottom:20px}
  .muted{color:#666;font-size:12px}
  .detail-card{margin:0 0 16px 0;padding:14px;background:#f9f9f9;border-radius:8px;border-left:4px solid #1D9E75}
  @media print{.print-btn{display:none}}
</style></head><body>
<h1>LED Cart & ROI Report</h1>
<p class="sub">Generated ${new Date().toLocaleDateString()}</p>
<button class="print-btn" onclick="window.print()">Print / Save as PDF</button>

<section class="section">
  <h2>1. Payback Summary</h2>
  <div class="summary">
    <div class="sc"><div class="sl">Best 5-Year Return</div><div class="sv ${results && bestFiveYearReturn >= 0 ? "pos" : ""}">${results ? fmt$(bestFiveYearReturn) : "N/A"}</div></div>
    <div class="sc"><div class="sl">Total Investment</div><div class="sv">${fmt$(totalInvestment)}</div></div>
    <div class="sc"><div class="sl">Best Annual ROI</div><div class="sv">${results ? annualRoiCart : "N/A"}%</div></div>
    <div class="sc"><div class="sl">Best 5-Year ROI</div><div class="sv">${results ? fiveYearRoiCart : "N/A"}%</div></div>
  </div>
  ${
    results
      ? `<div class="table-wrap" style="margin-top:12px">
    <table>
      <thead><tr><th>Baseline Type</th><th>Annual Savings</th><th>5-Year Net Return</th><th>Payback (Months)</th><th>Payback (Years)</th><th>Status</th></tr></thead>
      <tbody>${paybackSummaryRows}</tbody>
    </table>
  </div>`
      : ""
  }
</section>

<section class="section">
  <h2>2. Cost Breakdown</h2>
  <div class="summary">
    <div class="sc"><div class="sl">Product Cost</div><div class="sv">${fmt$(cartProductTotal)}</div></div>
    <div class="sc"><div class="sl">Installation Cost</div><div class="sv">${fmt$(common.installation || 0)}</div></div>
    <div class="sc"><div class="sl">Delivery Cost</div><div class="sv">${fmt$(common.delivery || 0)}</div></div>
    <div class="sc"><div class="sl">Total Investment</div><div class="sv">${fmt$(totalInvestment)}</div></div>
  </div>
</section>

<section class="section">
  <h2>3. Lighting Configuration</h2>
  <div class="summary">
    <div class="sc"><div class="sl">Total LED Wattage</div><div class="sv">${fmtW(totalLedWatts)}</div></div>
    <div class="sc"><div class="sl">Total LED Lumens</div><div class="sv">${totalLedLumens.toFixed(0)} lm</div></div>
    <div class="sc"><div class="sl">LED Efficacy</div><div class="sv">${ledEfficacy} lm/W</div></div>
    <div class="sc"><div class="sl">Total Fixtures</div><div class="sv">${fmtQty(totalFixtures)}</div></div>
  </div>
</section>

<section class="section">
  <h2>4. Input Parameters</h2>
  <div class="summary">
    <div class="sc"><div class="sl">Hours per day</div><div class="sv">${common.hours}</div></div>
    <div class="sc"><div class="sl">Days per year</div><div class="sv">${common.days}</div></div>
    <div class="sc"><div class="sl">Electricity rate</div><div class="sv">$${common.rate.toFixed(2)}/kWh</div></div>
    <div class="sc"><div class="sl">Calculation mode</div><div class="sv">Cart-based Equivalent Lumens</div></div>
  </div>
</section>

<section class="section">
  <h2>5. Product / Cart Details</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Product</th><th>SKU</th><th>Unit Price</th><th>Qty</th><th>Total Price</th></tr></thead>
      <tbody>${cartRows}</tbody>
    </table>
  </div>
</section>

<section class="section">
  <h2>6. Old vs LED Comparison</h2>
  <h3>Lamp Characteristics</h3>
  <div class="table-wrap" style="margin-bottom:14px">
    <table>
      <thead><tr><th>Type</th><th>Watts</th><th>Lumens</th><th>Efficacy</th></tr></thead>
      <tbody>
        ${comparisonRows}
        <tr><td><strong>LED (Average / Fixture)</strong></td><td>${ledPerFixtureWatts.toFixed(1)} W</td><td>${ledPerFixtureLumens.toFixed(0)} lm</td><td>${ledEfficacy} lm/W</td></tr>
      </tbody>
    </table>
  </div>
</section>

${
  results
    ? `
<section class="section">
  <h2>7. Detailed Calculations</h2>
  ${detailedCalcs.replaceAll("margin-bottom:24px", "margin-bottom:16px").replaceAll("background:#f9f9f9", "background:#f8fafc").replaceAll("border-radius:6px", "border-radius:8px")}
</section>

<section class="section">
  <h2>8. ROI Projection</h2>
  <h3>6-Month Summary</h3>
  <div class="table-wrap" style="margin-bottom:14px">
    <table>
      <thead><tr><th>Time</th><th>Incandescent</th><th>Halogen</th><th>Fluorescent</th></tr></thead>
      <tbody>${projectionRows}</tbody>
    </table>
  </div>
  <details>
    <summary style="cursor:pointer;font-weight:600;margin:8px 0 12px 0">Show full monthly projection (0 to 60 months)</summary>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Time</th><th>Incandescent</th><th>Halogen</th><th>Fluorescent</th></tr></thead>
        <tbody>${fullProjectionRows}</tbody>
      </table>
    </div>
  </details>
</section>

<section class="section">
  <h2>9. Notes & Assumptions</h2>
  <div class="detail-card">
    <p style="margin:0 0 8px 0"><strong>Calculation Basis:</strong> Results are generated from the current inputs, product selections, operating schedule, and electricity rate provided in this report.</p>
    <p style="margin:0"><strong>Estimation Disclaimer:</strong> This engineering ROI report is an estimation. Real-world savings can vary due to usage behavior, operating conditions, fixture losses, tariff structures, and maintenance cycles.</p>
  </div>
</section>
`
    : `
<section class="section">
  <h2>9. Notes & Assumptions</h2>
  <div class="detail-card">
    <p style="margin:0">ROI analysis sections are displayed after running calculations. Current report includes configuration, costs, and inputs only.</p>
  </div>
</section>
`
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
export function exportCalculatorPDF(results, mode, common, details = {}) {
  if (!results) return;
  const r = results;
  const safeCommon = common || {};
  const safeDetails = details || {};
  const safeOldLamp = safeDetails.oldLamp || null;
  const safeLed = safeDetails.led || null;

  const totalInvestment = r.ledCostTotal;
  const installCost = safeCommon.installation || 0;
  const deliveryCost = safeCommon.delivery || 0;
  const inferredProductCost = Math.max(
    0,
    totalInvestment - installCost - deliveryCost,
  );
  const grossEquipmentCost = (safeCommon.ledCost || 0) * r.ledQty;
  const rebateTotal = (safeCommon.rebate || 0) * r.ledQty;

  const oldLampRows = safeOldLamp
    ? LAMP_TYPES.map(({ k, label }) => {
        const keyMap = {
          inc: "incandescent",
          hal: "halogen",
          flu: "fluorescent",
        };
        const ol = safeOldLamp[keyMap[k]];
        if (!ol) return "";
        return `<tr>
          <td>${label}</td>
          <td>${ol.watts}W</td>
          <td>${ol.lumens} lm</td>
          <td>${eff(ol.watts, ol.lumens).toFixed(1)} lm/W</td>
        </tr>`;
      }).join("")
    : "";

  const detailedCalcs = LAMP_TYPES.map(({ k, label }) => {
    const oldPower = r.power[k].tot;
    const ledPower = r.power.led.tot;
    const oldEnergy =
      (oldPower * (safeCommon.hours || 0) * (safeCommon.days || 0)) / 1000;
    const ledEnergy =
      (ledPower * (safeCommon.hours || 0) * (safeCommon.days || 0)) / 1000;
    const oldCost = oldEnergy * (safeCommon.rate || 0);
    const ledCostAnnual = ledEnergy * (safeCommon.rate || 0);
    const annualSavings = oldCost - ledCostAnnual;

    return `
      <div style="margin-bottom:24px;padding:14px;background:#f9f9f9;border-radius:6px;border-left:4px solid #1d9e75">
        <h3 style="margin:0 0 12px 0;font-size:14px;color:#333">${label} Comparison</h3>
        <table style="width:100%;font-size:12px;margin-bottom:12px">
          <tr><td style="padding:6px 0"><strong>Total Power:</strong></td><td style="text-align:right;padding:6px 0">${fmtW(oldPower)} (old) vs ${fmtW(ledPower)} (LED)</td></tr>
          <tr><td style="padding:6px 0"><strong>Annual Energy:</strong></td><td style="text-align:right;padding:6px 0">${oldEnergy.toFixed(0)} kWh (old) vs ${ledEnergy.toFixed(0)} kWh (LED)</td></tr>
          <tr><td style="padding:6px 0"><strong>Annual Electricity Cost:</strong></td><td style="text-align:right;padding:6px 0">${fmt$(oldCost)} (old) vs ${fmt$(ledCostAnnual)} (LED)</td></tr>
          <tr><td style="padding:6px 0"><strong>Annual Savings:</strong></td><td style="text-align:right;padding:6px 0;color:#1d9e75;font-weight:600">${fmt$(annualSavings)}</td></tr>
        </table>
      </div>`;
  }).join("");

  const projectionRows = r.chart
    .filter((row) => row.time % 6 === 0)
    .map(
      (row) => `
      <tr>
        <td>${row.time} mo</td>
        <td>${fmt$(row.inc)}</td>
        <td>${fmt$(row.hal)}</td>
        <td>${fmt$(row.flu)}</td>
      </tr>`,
    )
    .join("");

  const fullProjectionRows = r.chart
    .map(
      (row) => `
      <tr>
        <td>${row.time} mo</td>
        <td>${fmt$(row.inc)}</td>
        <td>${fmt$(row.hal)}</td>
        <td>${fmt$(row.flu)}</td>
      </tr>`,
    )
    .join("");

  const paybackSummaryRows = LAMP_TYPES.map(({ k, label }) => {
    const pb = r.paybacks.find((p) => p.t === k);
    const net5 = r.savings[k] * 5 - totalInvestment;
    return `<tr>
      <td>${label}</td>
      <td>${fmt$(r.savings[k])}</td>
      <td style="color:${net5 >= 0 ? "#1D9E75" : "#D85A30"}">${fmt$(net5)}</td>
      <td>${pb ? pb.time : "> 60"}</td>
      <td>${pb ? (pb.time / 12).toFixed(1) : "> 5.0"}</td>
      <td>${pb ? "Reached" : "Not reached"}</td>
    </tr>`;
  }).join("");

  const bestFiveYearReturn = Math.max(
    ...LAMP_TYPES.map(({ k }) => r.savings[k] * 5 - totalInvestment),
  );

  const annualRoi =
    totalInvestment > 0
      ? (() => {
          const fiveYearMultiple = 1 + bestFiveYearReturn / totalInvestment;
          if (fiveYearMultiple <= 0) return "-100.00";
          return ((Math.pow(fiveYearMultiple, 1 / 5) - 1) * 100).toFixed(2);
        })()
      : "0.00";

  const fiveYearRoi =
    totalInvestment > 0
      ? ((bestFiveYearReturn / totalInvestment) * 100).toFixed(2)
      : "0.00";

  const lumensComparisonRows = LAMP_TYPES.map(({ k, label }) => {
    const oldTypeLumens = r.oldTotLmByType?.[k] ?? r.oldTotLm;
    const delta = r.ledTotLm - oldTypeLumens;
    const deltaPct =
      oldTypeLumens > 0 ? ((delta / oldTypeLumens) * 100).toFixed(2) : "0.00";

    return `<tr>
      <td>${label}</td>
      <td>${oldTypeLumens.toFixed(0)} lm</td>
      <td>${r.ledTotLm.toFixed(0)} lm</td>
      <td>${delta >= 0 ? "+" : ""}${delta.toFixed(0)} lm</td>
      <td>${delta >= 0 ? "+" : ""}${deltaPct}%</td>
    </tr>`;
  }).join("");

  const lumenDiffBarData = LAMP_TYPES.map(({ k, label, color }) => {
    const oldTypeLumens = r.oldTotLmByType?.[k] ?? r.oldTotLm;
    const delta = r.ledTotLm - oldTypeLumens;
    const deltaPct = oldTypeLumens > 0 ? (delta / oldTypeLumens) * 100 : 0;
    return {
      label,
      color,
      delta,
      deltaPct,
    };
  });

  const maxAbsLumenDiff = Math.max(
    ...lumenDiffBarData.map((row) => Math.abs(row.delta)),
    1,
  );

  const lumensDiffBarRows = lumenDiffBarData
    .map((row) => {
      const isPositive = row.delta >= 0;
      const width = (Math.abs(row.delta) / maxAbsLumenDiff) * 100;
      return `<div style="display:grid;grid-template-columns:120px 1fr 190px;gap:10px;align-items:center;margin:0 0 8px 0">
        <div style="font-size:12px;color:#555">${row.label}</div>
        <div style="height:10px;border-radius:999px;background:#e5e9f0;overflow:hidden">
          <div style="height:100%;width:${width}%;border-radius:999px;background:${isPositive ? row.color : "#D85A30"}"></div>
        </div>
        <div style="font-size:12px;text-align:right;font-family:Consolas,monospace;color:${isPositive ? "#1D9E75" : "#D85A30"}">
          ${isPositive ? "+" : ""}${row.delta.toFixed(0)} lm (${isPositive ? "+" : ""}${row.deltaPct.toFixed(2)}%)
        </div>
      </div>`;
    })
    .join("");

  const fixtureComparisonRows = LAMP_TYPES.map(({ k, label }) => {
    const oldFixtures = r.oldQty[k];
    const delta = r.ledQty - oldFixtures;
    const deltaPct =
      oldFixtures > 0 ? ((delta / oldFixtures) * 100).toFixed(2) : "0.00";

    return `<tr>
      <td>${label}</td>
      <td>${fmtQty(oldFixtures)}</td>
      <td>${fmtQty(r.ledQty)}</td>
      <td>${delta >= 0 ? "+" : ""}${fmtQty(delta)}</td>
      <td>${delta >= 0 ? "+" : ""}${deltaPct}%</td>
    </tr>`;
  }).join("");

  const oldVsLedRows = `${
    safeLed
      ? `<tr><td>LED</td><td>${safeLed.watts} W</td><td>${safeLed.lumens} lm</td><td>${eff(safeLed.watts, safeLed.lumens).toFixed(1)} lm/W</td></tr>`
      : ""
  }
  ${oldLampRows}`;

  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html>
<html><head><title>LED ROI Report</title>
<style>
  body{font-family:Arial,sans-serif;padding:32px;max-width:980px;margin:0 auto;color:#111;line-height:1.6;background:#fff}
  h1{font-size:26px;margin:0 0 4px 0;color:#1a1a2e}
  h2{font-size:16px;margin:0 0 12px 0;color:#1a1a2e;border-bottom:2px solid #e8d5a3;padding-bottom:8px}
  h3{font-size:14px;margin:0 0 10px 0;color:#333}
  .sub{color:#666;margin-bottom:20px;font-size:13px}
  .section{margin:0 0 26px 0}
  .summary{display:grid;grid-template-columns:repeat(auto-fit, minmax(170px, 1fr));gap:12px}
  .sc{background:#f7f8fa;border:1px solid #ebedf0;border-radius:10px;padding:12px 14px}
  .sc .sl{font-size:11px;color:#777;text-transform:uppercase;letter-spacing:.5px}
  .sc .sv{font-size:20px;font-weight:700;margin-top:4px;font-family:Consolas,monospace;color:#1a1a2e}
  .pos{color:#1D9E75 !important}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{background:#1a1a2e;color:#e8d5a3;padding:10px 12px;text-align:left}
  td{padding:9px 12px;border-bottom:1px solid #eceff3;vertical-align:top}
  .table-wrap{border:1px solid #e6e9ee;border-radius:8px;overflow:hidden}
  .print-btn{background:#1a1a2e;color:#e8d5a3;border:none;padding:10px 22px;border-radius:7px;
             font-size:13px;cursor:pointer;margin-bottom:20px}
  .detail-card{margin:0 0 16px 0;padding:14px;background:#f8fafc;border-radius:8px;border-left:4px solid #1D9E75}
  .hbar-card{margin-top:12px;border:1px solid #e6e9ee;border-radius:8px;background:#f8fafc;padding:12px}
  .hbar-title{font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.5px;font-weight:600;margin:0 0 10px 0}
  @media print{.print-btn{display:none}}
</style></head><body>
<h1>LED ROI Calculator — Report</h1>
<p class="sub">Generated ${new Date().toLocaleDateString()} &nbsp;·&nbsp; Mode: ${
    mode === "quantity" ? "By Quantity" : "By Total Lumens"
  }</p>
<button class="print-btn" onclick="window.print()">Print / Save as PDF</button>

<section class="section">
  <h2>1. Payback Summary</h2>
  <div class="summary">
    <div class="sc"><div class="sl">Best 5-Year Return</div><div class="sv ${bestFiveYearReturn >= 0 ? "pos" : ""}">${fmt$(bestFiveYearReturn)}</div></div>
    <div class="sc"><div class="sl">Total Investment</div><div class="sv">${fmt$(totalInvestment)}</div></div>
    <div class="sc"><div class="sl">Best Annual ROI</div><div class="sv">${annualRoi}%</div>
    </div>
    <div class="sc"><div class="sl">Best 5-Year ROI</div><div class="sv">${fiveYearRoi}%</div></div>
  </div>
  <div class="table-wrap" style="margin-top:12px">
    <table>
      <thead><tr><th>Baseline Type</th><th>Annual Savings</th><th>5-Year Net Return</th><th>Payback (Months)</th><th>Payback (Years)</th><th>Status</th></tr></thead>
      <tbody>${paybackSummaryRows}</tbody>
    </table>
  </div>
</section>

<section class="section">
  <h2>2. Cost Breakdown</h2>
  <div class="summary">
    <div class="sc"><div class="sl">Product Cost (Gross Equipment)</div><div class="sv">${fmt$(grossEquipmentCost)}</div></div>
    <div class="sc"><div class="sl">Installation Cost</div><div class="sv">${fmt$(installCost)}</div></div>
    <div class="sc"><div class="sl">Delivery Cost</div><div class="sv">${fmt$(deliveryCost)}</div></div>
    <div class="sc"><div class="sl">Rebate Total</div><div class="sv">${fmt$(rebateTotal)}</div></div>
    <div class="sc"><div class="sl">Net Equipment Cost</div><div class="sv">${fmt$(inferredProductCost)}</div></div>
    <div class="sc"><div class="sl">Total Investment</div><div class="sv">${fmt$(totalInvestment)}</div></div>
  </div>
</section>

<section class="section">
  <h2>3. Lighting Configuration</h2>
  <div class="summary">
    <div class="sc"><div class="sl">Total LED Wattage</div><div class="sv">${fmtW(r.power.led.tot)}</div></div>
    <div class="sc"><div class="sl">Total LED Lumens</div><div class="sv">${r.ledTotLm.toFixed(0)} lm</div></div>
    <div class="sc"><div class="sl">LED Efficacy</div><div class="sv">${r.power.led.eff.toFixed(1)} lm/W</div></div>
    <div class="sc"><div class="sl">Total Fixtures</div><div class="sv">${fmtQty(r.ledQty)}</div></div>
  </div>
  ${
    mode === "quantity"
      ? `<div class="table-wrap" style="margin-top:12px">
    <table>
      <thead><tr><th>Baseline Type</th><th>Old Total Lumens</th><th>LED Total Lumens</th><th>Lumens Difference (LED - Old)</th><th>Difference (%)</th></tr></thead>
      <tbody>${lumensComparisonRows}</tbody>
    </table>
  </div>
  <div class="hbar-card">
    <div class="hbar-title">Lumen Difference by Baseline Type</div>
    ${lumensDiffBarRows}
  </div>`
      : `<div class="table-wrap" style="margin-top:12px">
    <table>
      <thead><tr><th>Baseline Type</th><th>Old Fixtures Needed</th><th>LED Fixtures Needed</th><th>Fixtures Difference (LED - Old)</th><th>Difference (%)</th></tr></thead>
      <tbody>${fixtureComparisonRows}</tbody>
    </table>
  </div>`
  }
</section>

<section class="section">
  <h2>4. Input Parameters</h2>
  <div class="summary">
    <div class="sc"><div class="sl">Hours per day</div><div class="sv">${safeCommon.hours || 0}</div></div>
    <div class="sc"><div class="sl">Days per year</div><div class="sv">${safeCommon.days || 0}</div></div>
    <div class="sc"><div class="sl">Electricity rate</div><div class="sv">${(safeCommon.rate || 0).toFixed(2)} $/kWh</div></div>
    <div class="sc"><div class="sl">Calculation mode</div><div class="sv">${mode === "quantity" ? "By Quantity" : "By Total Lumens"}</div></div>
  </div>
</section>

<section class="section">
  <h2>5. Scenario Details</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Item</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>Report Type</td><td>Calculator Scenario (No cart items)</td></tr>
        <tr><td>LED Cost / Fixture</td><td>${fmt$(safeCommon.ledCost || 0)}</td></tr>
        <tr><td>Rebate / Fixture</td><td>${fmt$(safeCommon.rebate || 0)}</td></tr>
        <tr><td>Gross Equipment Cost</td><td>${fmt$(grossEquipmentCost)}</td></tr>
      </tbody>
    </table>
  </div>
</section>

<section class="section">
  <h2>6. Old vs LED Comparison</h2>
  <h3>Lamp Characteristics</h3>
  <div class="table-wrap" style="margin-bottom:14px">
    <table>
      <thead><tr><th>Type</th><th>Watts</th><th>Lumens</th><th>Efficacy</th></tr></thead>
      <tbody>${oldVsLedRows}</tbody>
    </table>
  </div>
</section>


<section class="section">
  <h2>7. Detailed Calculations</h2>
  ${detailedCalcs.replaceAll("margin-bottom:24px", "margin-bottom:16px").replaceAll("background:#f9f9f9", "background:#f8fafc").replaceAll("border-radius:6px", "border-radius:8px")}
</section>

<section class="section">
  <h2>8. ROI Projection</h2>
  <h3>6-Month Summary</h3>
  <div class="table-wrap" style="margin-bottom:14px">
    <table>
      <thead><tr><th>Time</th><th>Incandescent</th><th>Halogen</th><th>Fluorescent</th></tr></thead>
      <tbody>${projectionRows}</tbody>
    </table>
  </div>
  <details>
    <summary style="cursor:pointer;font-weight:600;margin:8px 0 12px 0">Show full monthly projection (0 to 60 months)</summary>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Time</th><th>Incandescent</th><th>Halogen</th><th>Fluorescent</th></tr></thead>
        <tbody>${fullProjectionRows}</tbody>
      </table>
    </div>
  </details>
</section>

<section class="section">
  <h2>9. Notes & Assumptions</h2>
  <div class="detail-card">
    <p style="margin:0 0 8px 0"><strong>Calculation Basis:</strong> Results are generated from the active calculator inputs, fixture parameters, operating schedule, and electricity rate provided in this report.</p>
    <p style="margin:0"><strong>Estimation Disclaimer:</strong> This report is an engineering estimate. Actual outcomes can vary with operating patterns, environmental conditions, tariff structures, and installation quality.</p>
  </div>
</section>
</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}
