/* ─────────────────────────────────────────────
   Shared ROI Calculator Utilities
   Used by both Calculator.jsx and Cart.jsx
───────────────────────────────────────────── */

// Lamp type constants
export const LAMP_TYPES = [
  { k: "inc", label: "Incandescent", color: "#7F77DD", cls: "inc" },
  { k: "hal", label: "Halogen", color: "#1D9E75", cls: "hal" },
  { k: "flu", label: "Fluorescent", color: "#D85A30", cls: "flu" },
];

/* ── Formatting helpers ── */
export const eff = (watts, lumens) => (watts > 0 ? lumens / watts : 0);

export const fmt$ = (value) => `$${value.toFixed(2)}`;

export const fmtW = (watts) => `${watts.toFixed(1)} W`;

/* ── Savings Calculation ── */
/**
 * Calculate annual energy savings for a specific old lamp type
 * @param {string} lampType - 'inc', 'hal', or 'flu'
 * @param {object} oldLamp - { watts, lumens } for the lamp type
 * @param {number} totalLumens - Total lumens produced by new LED system
 * @param {number} ledWatts - Total watts consumed by new LED system
 * @param {object} common - { hours, days, rate } usage and electricity rate
 * @returns {number} Annual savings in dollars
 */
export const calculateSavings = (
  lampType,
  oldLamp,
  totalLumens,
  ledWatts,
  common,
) => {
  const oldEff = eff(oldLamp.watts, oldLamp.lumens);
  const ledEff = eff(ledWatts, totalLumens);

  // Calculate old lamp wattage needed for same lumens
  const oldWattsNeeded = totalLumens / oldEff;

  // Annual energy consumption (kWh)
  const oldEnergy = (oldWattsNeeded * common.hours * common.days) / 1000;
  const newEnergy = (ledWatts * common.hours * common.days) / 1000;

  // Annual savings = energy difference × electricity rate
  return (oldEnergy - newEnergy) * common.rate;
};

/* ── Power Information ── */
/**
 * Generate power comparison for a specific lamp type
 * @param {string} lampType - 'inc', 'hal', or 'flu'
 * @param {object} oldLamp - { watts, lumens } for the lamp type
 * @param {number} lumensPerUnit - Lumens per individual lamp
 * @param {number} quantity - Number of lamps
 * @returns {object} { per, tot, eff } watts per lamp, total watts, efficiency
 */
export const getPowerInfo = (lampType, oldLamp, lumensPerUnit, quantity) => {
  const oldEff = eff(oldLamp.watts, oldLamp.lumens);
  const wattsPerLamp = lumensPerUnit / oldEff;
  const totalWatts = wattsPerLamp * quantity;

  return {
    per: wattsPerLamp,
    tot: totalWatts,
    eff: oldEff,
  };
};

/* ── Chart Generation ── */
/**
 * Generate break-even analysis chart data
 * @param {object} savings - { inc, hal, flu } annual savings for each type
 * @param {number} upfrontCost - Total upfront LED cost
 * @param {number} months - Number of months to chart (default 60)
 * @returns {object} { chart, paybacks }
 */
export const generateChart = (savings, upfrontCost, months = 60) => {
  const chart = [];
  const paybacks = [];

  for (let m = 0; m <= months; m++) {
    const row = { time: m };

    // Calculate cumulative value for each lamp type
    ["inc", "hal", "flu"].forEach((t) => {
      row[t] = (m / 12) * savings[t] - upfrontCost;
    });

    chart.push(row);

    // Track payback period for each type
    if (m > 0) {
      ["inc", "hal", "flu"].forEach((t) => {
        if (row[t] >= 0 && !paybacks.find((p) => p.t === t)) {
          paybacks.push({ time: m, val: row[t], t });
        }
      });
    }
  }

  return { chart, paybacks };
};

/* ── Cart-specific calculation ── */
/**
 * Calculate total LED specifications from cart items
 * @param {array} cartItems - Cart items with wattage, lumens, quantity
 * @returns {object} { totalWatts, totalLumens }
 */
export const calculateLEDFromCart = (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return { totalWatts: 0, totalLumens: 0 };
  }

  return cartItems.reduce(
    (acc, item) => ({
      totalWatts: acc.totalWatts + (item.wattage || 0) * (item.quantity || 1),
      totalLumens: acc.totalLumens + (item.lumens || 0) * (item.quantity || 1),
    }),
    { totalWatts: 0, totalLumens: 0 },
  );
};

/* ── Calculator-specific calculation ── */
/**
 * Calculate quantities based on mode
 * @param {string} mode - 'quantity' or 'lumens'
 * @param {object} inputs - Mode-specific input { qty } or { total }
 * @param {object} led - { watts, lumens }
 * @param {object} oldLampSpecs - Old lamp types { incandescent, halogen, fluorescent }
 * @returns {object} { oldQty, ledQty, oldTotLm, oldTotLmByType, ledTotLm }
 */
export const calculateQuantities = (mode, inputs, led, oldLampSpecs) => {
  const typeMap = { inc: "incandescent", hal: "halogen", flu: "fluorescent" };
  let result = {};

  if (mode === "quantity") {
    const q = inputs.qty;
    const oldTotLmByType = {
      inc: q * (oldLampSpecs[typeMap.inc]?.lumens || 0),
      hal: q * (oldLampSpecs[typeMap.hal]?.lumens || 0),
      flu: q * (oldLampSpecs[typeMap.flu]?.lumens || 0),
    };
    result = {
      oldQty: { inc: q, hal: q, flu: q },
      ledQty: q,
      oldTotLm: oldTotLmByType.inc,
      oldTotLmByType,
      ledTotLm: q * led.lumens,
    };
  } else {
    // lumens mode
    const tot = inputs.total;
    const oldQty = {
      inc: tot / Math.max(oldLampSpecs[typeMap.inc]?.lumens || 0, 1),
      hal: tot / Math.max(oldLampSpecs[typeMap.hal]?.lumens || 0, 1),
      flu: tot / Math.max(oldLampSpecs[typeMap.flu]?.lumens || 0, 1),
    };
    result = {
      oldQty,
      ledQty: tot / led.lumens,
      oldTotLm: tot,
      oldTotLmByType: { inc: tot, hal: tot, flu: tot },
      ledTotLm: tot,
    };
  }

  return result;
};

/* ── Complete calculation pipeline ── */
/**
 * Complete ROI calculation for calculator mode
 * @param {string} mode - 'quantity' or 'lumens'
 * @param {object} inputs - Mode-specific inputs
 * @param {object} led - LED specs { watts, lumens }
 * @param {object} oldLampSpecs - Old lamp types { incandescent, halogen, fluorescent }
 * @param {object} common - Calculation parameters { hours, days, rate, ledCost, rebate, installation, delivery }
 * @returns {object} Complete results { savings, ledCostTotal, ledQty, oldQty, oldTotLm, ledTotLm, chart, paybacks, power }
 */
export const calculateROI = (mode, inputs, led, oldLampSpecs, common) => {
  const typeMap = { inc: "incandescent", hal: "halogen", flu: "fluorescent" };
  const ledEff = eff(led.watts, led.lumens);

  // Calculate quantities
  const qty = calculateQuantities(mode, inputs, led, oldLampSpecs);

  // Calculate savings for each lamp type
  const savings = {};
  ["inc", "hal", "flu"].forEach((t) => {
    savings[t] = calculateSavings(
      t,
      oldLampSpecs[typeMap[t]],
      qty.ledTotLm,
      qty.ledQty * led.watts,
      common,
    );
  });

  // Calculate LED upfront cost
  const ledCostTotal =
    qty.ledQty * common.ledCost -
    qty.ledQty * common.rebate +
    (common.installation || 0) +
    (common.delivery || 0);

  // Generate break-even chart
  const { chart, paybacks } = generateChart(savings, ledCostTotal);

  // Calculate power information
  const power = {};
  ["inc", "hal", "flu"].forEach((t) => {
    power[t] = getPowerInfo(
      t,
      oldLampSpecs[typeMap[t]],
      oldLampSpecs[typeMap[t]].lumens,
      qty.oldQty[t],
    );
  });
  power.led = {
    per: led.watts,
    tot: qty.ledQty * led.watts,
    eff: ledEff,
  };

  return {
    savings,
    ledCostTotal,
    ledQty: qty.ledQty,
    oldQty: qty.oldQty,
    oldTotLm: qty.oldTotLm,
    oldTotLmByType: qty.oldTotLmByType,
    ledTotLm: qty.ledTotLm,
    chart,
    paybacks,
    power,
  };
};

/* ── Cart-specific ROI calculation ── */
/**
 * Complete ROI calculation for cart mode
 * @param {array} cartItems - Cart items with id, quantity, etc.
 * @param {object} oldLampSpecs - Old lamp types { incandescent, halogen, fluorescent }
 * @param {object} common - Calculation parameters { hours, days, rate, installation, delivery }
 * @param {function} getEffectivePrice - Zustand store function to get price based on quantity
 * @returns {object} Complete results for cart
 */
export const calculateCartROI = (
  cartItems,
  oldLampSpecs,
  common,
  getEffectivePrice,
) => {
  const typeMap = { inc: "incandescent", hal: "halogen", flu: "fluorescent" };

  // Calculate total LED specs from cart
  const ledData = calculateLEDFromCart(cartItems);
  const ledEff = eff(ledData.totalWatts, ledData.totalLumens);

  // Calculate savings for each lamp type
  const savings = {};
  ["inc", "hal", "flu"].forEach((t) => {
    savings[t] = calculateSavings(
      t,
      oldLampSpecs[typeMap[t]],
      ledData.totalLumens,
      ledData.totalWatts,
      common,
    );
  });

  // Calculate cart total and other costs
  const cartTotal = cartItems.reduce(
    (sum, item) =>
      sum + getEffectivePrice(item.id, item.quantity) * item.quantity,
    0,
  );
  const upfrontCost =
    cartTotal + (common.installation || 0) + (common.delivery || 0);

  // Generate chart data
  const { chart, paybacks } = generateChart(savings, upfrontCost);

  // Calculate power comparison
  const power = {};
  ["inc", "hal", "flu"].forEach((t) => {
    power[t] = getPowerInfo(
      t,
      oldLampSpecs[typeMap[t]],
      ledData.totalLumens / ledData.totalWatts,
      cartItems.reduce((s, i) => s + i.quantity, 0),
    );
  });
  power.led = {
    per: ledData.totalWatts / cartItems.reduce((s, i) => s + i.quantity, 0),
    eff: ledEff,
  };

  return {
    savings,
    cartTotal: upfrontCost,
    ledQty: cartItems.reduce((s, i) => s + i.quantity, 0),
    ledWatts: ledData.totalWatts,
    ledLumens: ledData.totalLumens,
    chart,
    paybacks,
    power,
  };
};
