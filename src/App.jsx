import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
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
import { Button, Collapse, Form } from "react-bootstrap";

function App() {
  const [mode, setMode] = useState("quantity"); // quantity | lumen

  const [inputs, setInputs] = useState({
    quantity: 10,
    lumens: 1000,
    ledEfficacy: 150,
    hours: 24,
    days: 365,
    rate: 0.14,
    ledCost: 80,
    rebate: 10,
    installation: 200,
    delivery: 50,
  });

  const [efficiency, setEfficiency] = useState({
    incandescent: 15,
    halogen: 20,
    fluorescent: 80,
  });

  const [chartData, setChartData] = useState([]);
  const [paybackPoints, setPaybackPoints] = useState([]);
  const [openChart, setOpenChart] = useState(false);
  const [timeRange, setTimeRange] = useState([0, 60]);

  // 新增状态：存储每年的节省金额和总成本
  const [annualSavings, setAnnualSavings] = useState({
    incandescent: 0,
    halogen: 0,
    fluorescent: 0,
  });
  const [totalCost, setTotalCost] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (["incandescent", "halogen", "fluorescent"].includes(name)) {
      setEfficiency({
        ...efficiency,
        [name]: parseFloat(value),
      });
    } else {
      setInputs({
        ...inputs,
        [name]: parseFloat(value),
      });
    }
  };

  const calculate = () => {
    const calcSavings = (oldEff, quantity) => {
      const lumensTotal = inputs.lumens * quantity;

      const oldWatt = lumensTotal / oldEff;
      const ledWatt = lumensTotal / inputs.ledEfficacy;

      const oldEnergy = (oldWatt * inputs.hours * inputs.days) / 1000;
      const newEnergy = (ledWatt * inputs.hours * inputs.days) / 1000;

      return (oldEnergy - newEnergy) * inputs.rate;
    };

    let quantityMap = {
      incandescent:
        mode === "quantity"
          ? inputs.quantity
          : inputs.lumens / efficiency.incandescent,
      halogen:
        mode === "quantity"
          ? inputs.quantity
          : inputs.lumens / efficiency.halogen,
      fluorescent:
        mode === "quantity"
          ? inputs.quantity
          : inputs.lumens / efficiency.fluorescent,
    };

    const savings = {
      incandescent: calcSavings(
        efficiency.incandescent,
        quantityMap.incandescent,
      ),
      halogen: calcSavings(efficiency.halogen, quantityMap.halogen),
      fluorescent: calcSavings(efficiency.fluorescent, quantityMap.fluorescent),
    };

    const totalCostValue =
      inputs.ledCost * (mode === "quantity" ? inputs.quantity : 1) -
      inputs.rebate +
      inputs.installation +
      inputs.delivery;

    let data = [];
    let paybacks = [];

    for (let month = 0; month <= 60; month++) {
      const inc = (month / 12) * savings.incandescent - totalCostValue;
      const hal = (month / 12) * savings.halogen - totalCostValue;
      const flu = (month / 12) * savings.fluorescent - totalCostValue;

      data.push({
        time: month,
        incandescent: inc,
        halogen: hal,
        fluorescent: flu,
      });

      if (month > 0) {
        if (inc >= 0 && !paybacks.find((p) => p.type === "incandescent")) {
          paybacks.push({ time: month, value: inc, type: "incandescent" });
        }
        if (hal >= 0 && !paybacks.find((p) => p.type === "halogen")) {
          paybacks.push({ time: month, value: hal, type: "halogen" });
        }
        if (flu >= 0 && !paybacks.find((p) => p.type === "fluorescent")) {
          paybacks.push({ time: month, value: flu, type: "fluorescent" });
        }
      }
    }

    setChartData(data);
    setPaybackPoints(paybacks);
    setAnnualSavings(savings);
    setTotalCost(totalCostValue);
  };

  const filteredData = chartData.filter(
    (d) => d.time >= timeRange[0] && d.time <= timeRange[1],
  );

  // 辅助函数：获取某个技术的回收期（月）
  const getPaybackMonth = (type) => {
    const point = paybackPoints.find((p) => p.type === type);
    return point ? point.time : null;
  };

  // 辅助函数：格式化货币
  const formatMoney = (value) => `$${value.toFixed(2)}`;

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">💡 LED ROI Calculator</h2>

      {/* MODE */}
      <div className="card p-3 mb-3">
        <Form.Check
          type="radio"
          label="By Quantity (e.g. 10 incandescent → 10 LED)"
          name="mode"
          checked={mode === "quantity"}
          onChange={() => setMode("quantity")}
        />
        <Form.Check
          type="radio"
          label="By Lumens (e.g. same 1000 lm output)"
          name="mode"
          checked={mode === "lumen"}
          onChange={() => setMode("lumen")}
        />
      </div>

      {/* INPUT */}
      <div className="card p-3 mb-4">
        <div className="row">
          {[
            { label: "Quantity", name: "quantity" },
            { label: "Lumens per Fixture", name: "lumens" },
            { label: "LED lm/W", name: "ledEfficacy" },
            { label: "Hours/Day", name: "hours" },
            { label: "Days/Year", name: "days" },
            { label: "Electricity Rate ($/kWh)", name: "rate" },
            { label: "LED Cost ($)", name: "ledCost" },
            { label: "Rebate ($)", name: "rebate" },
            { label: "Installation Cost ($)", name: "installation" },
            { label: "Delivery Cost ($)", name: "delivery" },
          ].map((item) => (
            <div className="col-md-3 mb-2" key={item.name}>
              <label>{item.label}</label>
              <input
                type="number"
                className="form-control"
                name={item.name}
                value={inputs[item.name]}
                onChange={handleInputChange}
              />
            </div>
          ))}
        </div>

        <h6 className="mt-3">Old Lighting lm/W</h6>
        <div className="row">
          {Object.keys(efficiency).map((key) => (
            <div className="col-md-4" key={key}>
              <label>{key}</label>
              <input
                className="form-control"
                name={key}
                value={efficiency[key]}
                onChange={handleInputChange}
              />
            </div>
          ))}
        </div>

        <Button className="mt-3" onClick={calculate}>
          Confirm & Calculate
        </Button>
      </div>

      {/* RESULTS - 现在显示实际数值 */}
      {chartData.length > 0 && (
        <div className="card p-3 mb-4">
          <h5>📊 Results</h5>
          <div className="mb-2">
            <strong>Total LED Investment Cost:</strong> {formatMoney(totalCost)}
          </div>
          <hr />
          <div className="row">
            <div className="col-md-4">
              <strong>💡 Incandescent</strong>
              <div>
                Annual Savings: {formatMoney(annualSavings.incandescent)}
              </div>
              {getPaybackMonth("incandescent") ? (
                <div>
                  Payback Period: {getPaybackMonth("incandescent")} months (
                  {(getPaybackMonth("incandescent") / 12).toFixed(1)} years)
                </div>
              ) : (
                <div>Payback Period: {">"} 60 months (not reached)</div>
              )}
            </div>
            <div className="col-md-4">
              <strong>💡 Halogen</strong>
              <div>Annual Savings: {formatMoney(annualSavings.halogen)}</div>
              {getPaybackMonth("halogen") ? (
                <div>
                  Payback Period: {getPaybackMonth("halogen")} months (
                  {(getPaybackMonth("halogen") / 12).toFixed(1)} years)
                </div>
              ) : (
                <div>Payback Period: {">"} 60 months (not reached)</div>
              )}
            </div>
            <div className="col-md-4">
              <strong>💡 Fluorescent</strong>
              <div>
                Annual Savings: {formatMoney(annualSavings.fluorescent)}
              </div>
              {getPaybackMonth("fluorescent") ? (
                <div>
                  Payback Period: {getPaybackMonth("fluorescent")} months (
                  {(getPaybackMonth("fluorescent") / 12).toFixed(1)} years)
                </div>
              ) : (
                <div>Payback Period: {">"} 60 months (not reached)</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHART */}
      <div className="mb-5">
        <Button onClick={() => setOpenChart(!openChart)}>
          {openChart ? "Hide Chart" : "Show Chart"}
        </Button>

        <Collapse in={openChart}>
          <div className="mt-4">
            <LineChart width={900} height={400} data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" wrapperStyle={{ marginTop: 20 }} />
              <Line dataKey="incandescent" stroke="#8884d8" />
              <Line dataKey="halogen" stroke="#82ca9d" />
              <Line dataKey="fluorescent" stroke="#ff7300" />
              {paybackPoints.map((p, i) => (
                <ReferenceDot key={i} x={p.time} y={p.value} r={5} fill="red" />
              ))}
            </LineChart>

            <div className="mt-3">
              <label>
                Time Range: {timeRange[0]} - {timeRange[1]} months
              </label>
              <input
                type="range"
                min="0"
                max="60"
                value={timeRange[1]}
                onChange={(e) =>
                  setTimeRange([timeRange[0], parseInt(e.target.value)])
                }
                className="form-range"
              />
            </div>
          </div>
        </Collapse>
      </div>
    </div>
  );
}

export default App;
