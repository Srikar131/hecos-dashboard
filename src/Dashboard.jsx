import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./Dashboard.css";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer as RCContainer, Legend as PieLegend,
  BarChart, Bar
} from "recharts";

// Utility for fetching & parsing CSV
async function fetchSheetData(csvUrl) {
  const response = await fetch(csvUrl);
  const csvText = await response.text();
  const parsed = Papa.parse(csvText, { header: true });
  return parsed.data.filter(row => row && row[Object.keys(row)[0]]);
}

// Sheet config (add links as needed)
const SHEETS = [
  { label: "Monthly Sales Data",         url: "https://docs.google.com/spreadsheets/d/1_5wFyACpq1GsYw3Dw_01UqGOn5gAJH-pCQ-kpxIRjiU/export?format=csv&gid=0" },
  { label: "Daily Sales (Current Month)", url: "https://docs.google.com/spreadsheets/d/1_5wFyACpq1GsYw3Dw_01UqGOn5gAJH-pCQ-kpxIRjiU/export?format=csv&gid=1184846642" },
  { label: "Product Performance", url: "https://docs.google.com/spreadsheets/d/1_5wFyACpq1GsYw3Dw_01UqGOn5gAJH-pCQ-kpxIRjiU/export?format=csv&gid=24490182" },
  { label: "Regional Sales",             url: "https://docs.google.com/spreadsheets/d/1_5wFyACpq1GsYw3Dw_01UqGOn5gAJH-pCQ-kpxIRjiU/export?format=csv&gid=143078882" },
  { label: "Real-Time Metrics (Live Data)",url: "https://docs.google.com/spreadsheets/d/1_5wFyACpq1GsYw3Dw_01UqGOn5gAJH-pCQ-kpxIRjiU/export?format=csv&gid=1030906733" },
  { label: "Hourly Sales Today",         url: "https://docs.google.com/spreadsheets/d/1_5wFyACpq1GsYw3Dw_01UqGOn5gAJH-pCQ-kpxIRjiU/export?format=csv&gid=1784280736" },
  { label: "Goals & Targets",            url: "https://docs.google.com/spreadsheets/d/1_5wFyACpq1GsYw3Dw_01UqGOn5gAJH-pCQ-kpxIRjiU/export?format=csv&gid=1190777355" }
];

export default function Dashboard() {
  const [active, setActive] = useState(0);
  const [sheetData, setSheetData] = useState({});
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(() => new Date());

  // Refresh clock every second
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch data for active sheet
  useEffect(() => {
    setLoading(true);
    fetchSheetData(SHEETS[active].url).then(rows => {
      setSheetData(prev => ({ ...prev, [active]: rows }));
      setLoading(false);
    });
  }, [active]);

  return (
    <div style={{width:"100vw", minHeight:"100vh",overflowX:"hidden", background:"none"}}>
      {/* Topbar */}
      <header className="topbar">
        <div className="brand-title">HECOS</div>
        <div className="sheet-dropdown">
          <ModernDropdown
            options={SHEETS.map(s=>s.label)}
            value={active}
            onChange={setActive}
          />
        </div>
        <div className="live-time">
          <span className="dot-live"></span>
          <span style={{fontWeight: 500, color:"#fff"}}>Live Data&nbsp;&nbsp;</span>
          <span className="dashboard-clock">
            {time.toLocaleTimeString("en-IN")}
          </span>
        </div>
      </header>
      {/* Content */}
      <main className="dashboard-container" style={{marginTop:80}}>
        <h2 className="dashboard-title" style={{marginBottom: 25}}>
          {SHEETS[active].label}
        </h2>
        {loading && <div style={{fontSize:22, color:"#8546b6ff"}}>Loading...</div>}
        {sheetData[active] && !loading && (
          <SheetSection
            sheetIdx={active}
            data={sheetData[active]}
            label={SHEETS[active].label}
          />
        )}
      </main>
    </div>
  );
}

// --- Modern Dropdown ---
function ModernDropdown({ options, value, onChange }) {
  return (
    <div className="modern-dropdown">
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="modern-dropdown-select"
      >
        {options.map((opt, i) => (
          <option key={opt} value={i}>{opt}</option>
        ))}
      </select>
      <span className="dropdown-arrow">&#9662;</span>
    </div>
  );
}

/* --- Example: Sheet Section for Sheet 1 --- */
function SheetSection({ sheetIdx, data, label }) {
  // Sheet 1: Monthly Sales Data
  if (sheetIdx === 0) {
    const latest = data.length ? data[data.length-1] : null;
    const metrics = latest ? [
      { title: "Revenue", value: `$${Number(latest.Revenue).toLocaleString()}` },
      { title: "Orders", value: latest.Orders },
      { title: "Total Units Sold", value: latest.TotalUnitsSold },
      { title: "New Customers", value: latest.NewCustomers },
      { title: "Returning Customers", value: latest.ReturningCustomers },
      { title: "Avg. Order Value", value: `$${Number(latest.AverageOrderValue).toLocaleString()}` }
    ] : [];
    return (
      <>
        <div className="metric-cards">
          {metrics.map((m, i) => (
            <div className="metric" key={i}>
              <div className="metric-title">{m.title}</div>
              <div className="metric-value">{m.value}</div>
            </div>
          ))}
        </div>
        <div className="charts-grid">
          <div className="chart-card">
            <h2 style={{ color: "#ffa502", margin: "0 0 18px 0" }}>Revenue Trend (Monthly)</h2>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="4 1 2" stroke="#312f46" />
                <XAxis dataKey="Month" stroke="#ffe566" />
                <YAxis stroke="#fff" tickFormatter={num => `$${Number(num).toLocaleString()}`} />
                <Tooltip contentStyle={{ background: "#ffffffff", borderRadius: 10, color: '#ffa502' }} formatter={value => `$${Number(value).toLocaleString()}`}/>
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#ffa502"
                  strokeWidth={4}
                  dot={{ r: 6, fill: "#fff" }}
                  activeDot={{ r: 10, stroke: "#06ffa5", strokeWidth: 6, fill: "#ffa502" }}
                  animationDuration={1400}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <h2 style={{ color: "#06ffa5", margin: "0 0 18px 0" }}>Customer Split (Latest Month)</h2>
            <RCContainer width="100%" height={290}>
              <PieChart>
                <Pie
                  data={[
                    { name: "New Customers", value: latest ? Number(latest.NewCustomers) : 0 },
                    { name: "Returning Customers", value: latest ? Number(latest.ReturningCustomers) : 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent*100).toFixed(0)}%`}
                  animationDuration={1200}
                >
                  <Cell key="a" fill="#ff477e" />
                  <Cell key="b" fill="#06ffa5" />
                </Pie>
                <PieTooltip contentStyle={{ background: "#a2a2a5ff", borderRadius: 10, color: "#ffa502" }} formatter={x => Number(x).toLocaleString()} />
                <PieLegend verticalAlign="bottom" iconType="circle" align="center"/>
              </PieChart>
            </RCContainer>
          </div>
          <div className="chart-card">
            <h2 style={{ color: "#42e9f5", margin: "0 0 18px 0" }}>Units Sold (Monthly)</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="4 4" stroke="#23233a" />
                <XAxis dataKey="Month" stroke="#06ffa5"/>
                <YAxis stroke="#fff" tickFormatter={num => Number(num).toLocaleString()} />
                <Tooltip contentStyle={{ background: "#1a1a2e", borderRadius: 12, color: "#42e9f5" }} formatter={x => Number(x).toLocaleString()} />
                <Bar
                  dataKey="TotalUnitsSold"
                  name="Total Units Sold"
                  fill="#06ffa5" barSize={40}
                  radius={[9, 9, 0, 0]}
                  animationDuration={1200}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    );
  }
  
  // Sheet 2: Daily Sales (Current Month)
  if (sheetIdx === 1) {
    const today = data.length ? data[data.length-1] : {};
    const metrics = [
      { title: "Today's Revenue", value: `$${Number(today.Revenue || 0).toLocaleString()}` },
      { title: "Orders", value: today.Orders },
      { title: "Visitors", value: today.Visitors },
      { title: "Conversion Rate", value: today.ConversionRate ? `${today.ConversionRate}%` : "--" },
      { title: "Top Product", value: today.TopProduct },
      { title: "Units Sold Today", value: today.UnitsSoldToday }
    ];
    return (
      <>
        <div className="metric-cards">
          {metrics.map((m, i) => (
            <div className="metric" key={i}>
              <div className="metric-title">{m.title}</div>
              <div className="metric-value">{m.value}</div>
            </div>
          ))}
        </div>
        <div className="charts-grid">
          <div className="chart-card">
            <h2 style={{color:"#06ffa5",margin:"0 0 18px 0"}}>Revenue Trend (Daily)</h2>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="4 1 2" stroke="#312f46" />
                <XAxis dataKey="Date" stroke="#ffe566" />
                <YAxis stroke="#fff" tickFormatter={num => `$${Number(num).toLocaleString()}`} />
                <Tooltip contentStyle={{ background: "#2b2756", borderRadius: 10, color: '#ffa502' }} formatter={value => `$${Number(value).toLocaleString()}`}/>
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#06ffa5"
                  strokeWidth={4}
                  dot={{ r: 6, fill: "#fff" }}
                  activeDot={{ r: 10, stroke: "#ff477e", strokeWidth: 6, fill: "#06ffa5" }}
                  animationDuration={1400}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <h2 style={{color:"#ffa502",margin:"0 0 18px 0"}}>Orders Per Day</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="4 1 2" stroke="#312f46" />
                <XAxis dataKey="Date" stroke="#ffe566" />
                <YAxis stroke="#fff" />
                <Tooltip contentStyle={{ background: "#2b2756", borderRadius: 10, color: '#ffa502' }} />
                <Legend verticalAlign="top" height={36} />
                <Bar
                  dataKey="Orders"
                  name="Orders"
                  fill="#ffa502"
                  barSize={38}
                  radius={[8, 8, 0, 0]}
                  animationDuration={1200}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    );
  }
  
  // Sheet 3: Product Performance (example cards + chart)
  if (sheetIdx === 2) {
  // Sheet 3: Product Performance
  if (!data.length) return <>No data</>;
  // Top product: highest UnitsSoldThisMonth
  const topProduct = data.reduce(
    (prev, curr) => (
      (!prev || Number(curr.UnitsSoldThisMonth) > Number(prev.UnitsSoldThisMonth))
        ? curr
        : prev
    ), null
  );
  const metrics = [
    { title: 'Top Product', value: topProduct.ProductName },
    { title: 'Units Sold', value: topProduct.UnitsSoldThisMonth },
    { title: 'Revenue', value: `$${Number(topProduct.RevenueThisMonth).toLocaleString()}` },
    { title: 'Profit Margin', value: `${topProduct.ProfitMargin}%` },
    { title: 'Rating', value: topProduct.Rating },
    { title: 'Reviews', value: topProduct.ReviewsCount },
    { title: 'In Stock', value: topProduct.StockLevel }
  ];
  return (
    <>
      <div className="metric-cards">
        {metrics.map((m, i) => (
          <div className="metric" key={i}>
            <div className="metric-title">{m.title}</div>
            <div className="metric-value">{m.value}</div>
          </div>
        ))}
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h2 style={{color:"#06ffa5",margin:"0 0 18px 0"}}>Units Sold by Product</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="4 4" stroke="#23233a" />
              <XAxis dataKey="ProductName" stroke="#06ffa5"/>
              <YAxis stroke="#fff"/>
              <Tooltip contentStyle={{ background: "#23233a", borderRadius: 10, color: "#ffa502" }} />
              <Bar
                dataKey="UnitsSoldThisMonth"
                name="Units Sold"
                fill="#06ffa5"
                barSize={40}
                radius={[9, 9, 0, 0]}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h2 style={{color:"#ffa502",margin:"0 0 18px 0"}}>Revenue by Product</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="4 4" stroke="#23233a" />
              <XAxis dataKey="ProductName" stroke="#ffa502" />
              <YAxis stroke="#fff"/>
              <Tooltip contentStyle={{ background: "#23233a", borderRadius: 10, color: "#ffa502" }} formatter={v=>`$${v}`}/>
              <Bar
                dataKey="RevenueThisMonth"
                name="Revenue"
                fill="#ffa502"
                barSize={40}
                radius={[9, 9, 0, 0]}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
if (sheetIdx === 3) {
  if (!data.length) return <>No data</>;
  // Filter out rows missing region!
  const filtered = data.filter(x => x.Region && x.RevenueThisMonth && !isNaN(Number(x.RevenueThisMonth)));
  const topRegion = filtered.reduce(
    (prev, curr) => (
      (!prev || Number(curr.RevenueThisMonth) > Number(prev.RevenueThisMonth))
        ? curr
        : prev
    ), null
  );
  const safe = v => (v !== undefined && v !== null && v !== "" ? v : "--");
  const metrics = [
  { title: 'Top Region', value: safe(topRegion?.Region) },
  { title: 'Revenue', value: topRegion ? `$${Number(topRegion.RevenueThisMonth).toLocaleString()}` : "--" },
  { title: 'Orders', value: safe(topRegion?.Orders) },
  { title: 'Customers', value: safe(topRegion?.Customers) },
  { title: 'Growth Rate', value: topRegion?.GrowthRate ? `${topRegion.GrowthRate}%` : "--" },
  { title: 'Top Category', value: safe(topRegion?.TopProductCategory) },
  { title: 'Market Share', value: topRegion?.MarketShare ? `${topRegion.MarketShare}%` : "--" }
];

  return (
    <>
      <div className="metric-cards">
        {metrics.map((m, i) => (
          <div className="metric" key={i}>
            <div className="metric-title">{m.title}</div>
            <div className="metric-value">{m.value}</div>
          </div>
        ))}
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h2 style={{color:"#06ffa5",margin:"0 0 18px 0"}}>Revenue by Region</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={filtered}>
              <CartesianGrid strokeDasharray="4 4" stroke="#23233a" />
              <XAxis dataKey="Region" stroke="#06ffa5"/>
              <YAxis stroke="#fff"/>
              <Tooltip contentStyle={{ background: "#23233a", borderRadius: 10, color: "#ffa502" }} />
              <Bar
                dataKey="RevenueThisMonth"
                name="Revenue"
                fill="#06ffa5"
                barSize={40}
                radius={[9, 9, 0, 0]}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h2 style={{color:"#ffa502",margin:"0 0 18px 0"}}>Orders by Country</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={filtered}>
              <CartesianGrid strokeDasharray="4 4" stroke="#23233a" />
              <XAxis dataKey="Country" stroke="#ffa502"/>
              <YAxis stroke="#fff"/>
              <Tooltip contentStyle={{ background: "#23233a", borderRadius: 10, color: "#ffa502" }} />
              <Bar
                dataKey="Orders"
                name="Orders"
                fill="#ffa502"
                barSize={40}
                radius={[9, 9, 0, 0]}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h2 style={{color:"#42e9f5",margin:"0 0 18px 0"}}>Market Share (%) by Region</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={filtered}>
              <CartesianGrid strokeDasharray="4 4" stroke="#23233a" />
              <XAxis dataKey="Region" stroke="#42e9f5"/>
              <YAxis stroke="#fff"/>
              <Tooltip contentStyle={{ background: "#23233a", borderRadius: 10, color: "#42e9f5" }} />
              <Bar
                dataKey="MarketShare"
                name="Market Share"
                fill="#42e9f5"
                barSize={40}
                radius={[9, 9, 0, 0]}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
if (sheetIdx === 4) {
  if (!data.length) return <>No data</>;
  // Show each metric as a card, color-coded by ChangePercentage
  return (
    <>
      <div className="metric-cards">
        {data.map((row, i) => (
          <div className="metric" key={i}>
            <div className="metric-title">{row.MetricName}</div>
            <div className="metric-value">{row.CurrentValue}</div>
            <div
              className="metric-change"
              style={{
                background: Number(row.ChangePercentage) > 0
                  ? "linear-gradient(90deg, #06ffa5 60%, #21e81a99 100%)"
                  : Number(row.ChangePercentage) < 0
                  ? "linear-gradient(90deg, #ff477e 60%, #f1524c99 100%)"
                  : "linear-gradient(90deg, #fae866 60%, #ffe9a399 100%)",
                color: Number(row.ChangePercentage) >= 0 ? "#192a56" : "#fff"
              }}
            >
              {row.ChangePercentage > 0 && "+"}
              {row.ChangePercentage ? `${row.ChangePercentage}%` : "--"}
            </div>
            <div style={{ fontSize: "0.94em", marginTop: "13px", color: "#7dedfc" }}>
              Target: <b>{row.TargetValue || "--"}</b>
            </div>
            <div style={{ fontSize: "0.87em", marginTop: "7px", color: "#fff9" }}>
              Last updated: {row.LastUpdated || "--"}
            </div>
          </div>
        ))}
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h2 style={{ color: "#06ffa5", margin: "0 0 18px 0" }}>Real-time Metric Change</h2>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="4 4" stroke="#23233a" />
              <XAxis dataKey="MetricName" stroke="#06ffa5"/>
              <YAxis stroke="#fff"/>
              <Tooltip contentStyle={{ background: "#23233a", borderRadius: 10, color: "#ffa502" }} />
              <Bar dataKey="ChangePercentage" fill="#06ffa5" barSize={44} radius={[9,9,0,0]} animationDuration={1200}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h2 style={{ color: "#ffa502", margin: "0 0 18px 0" }}>Metric vs Target</h2>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="4 4" stroke="#23233a" />
              <XAxis dataKey="MetricName" stroke="#ffa502"/>
              <YAxis stroke="#fff"/>
              <Tooltip contentStyle={{ background: "#23233a", borderRadius: 10, color: "#ffa502" }} />
              <Bar dataKey="CurrentValue" name="Now" fill="#ffa502" barSize={39} radius={[9,9,0,0]} />
              <Bar dataKey="TargetValue" name="Target" fill="#42e9f5" barSize={39} radius={[9,9,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
if (sheetIdx === 5) {
  if (!data.length) return <>No data</>;
  // Summary stats for today
  const totalSales = data.reduce((acc, r) => acc + (Number(r.Sales) || 0), 0);
  const totalOrders = data.reduce((acc, r) => acc + (Number(r.Orders) || 0), 0);
  const totalVisitors = data.reduce((acc, r) => acc + (Number(r.Visitors) || 0), 0);
  // Most sold product by hour
  const top = [...data].sort((a, b) => (Number(b.Sales) || 0) - (Number(a.Sales) || 0))[0] || {};
  const metrics = [
    { title: 'Total Sales', value: `$${totalSales.toLocaleString()}` },
    { title: 'Total Orders', value: totalOrders },
    { title: 'Total Visitors', value: totalVisitors },
    { title: 'Top Product (Peak Hour)', value: top.TopProductSold }
  ];
  return (
    <>
      <div className="metric-cards">
        {metrics.map((m, i) => (
          <div className="metric" key={i}>
            <div className="metric-title">{m.title}</div>
            <div className="metric-value">{m.value}</div>
          </div>
        ))}
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h2 style={{ color: "#06ffa5", margin: "0 0 18px 0" }}>Sales by Hour</h2>
          <ResponsiveContainer width="100%" height={315}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="4 4" stroke="#23233a" />
              <XAxis dataKey="Hour" stroke="#06ffa5" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ background: "#23233a", borderRadius: 10, color: "#ffa502" }} />
              <Bar dataKey="Sales" fill="#06ffa5" barSize={40} radius={[9, 9, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h2 style={{ color: "#ffa502", margin: "0 0 18px 0" }}>Orders by Hour</h2>
          <ResponsiveContainer width="100%" height={315}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="4 4" stroke="#23233a" />
              <XAxis dataKey="Hour" stroke="#ffa502" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ background: "#23233a", borderRadius: 10, color: "#ffa502" }} />
              <Bar dataKey="Orders" fill="#ffa502" barSize={40} radius={[9, 9, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h2 style={{ color: "#42e9f5", margin: "0 0 18px 0" }}>Visitors by Hour</h2>
          <ResponsiveContainer width="100%" height={315}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="4 4" stroke="#23233a" />
              <XAxis dataKey="Hour" stroke="#42e9f5" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ background: "#23233a", borderRadius: 10, color: "#42e9f5" }} />
              <Line type="monotone" dataKey="Visitors" stroke="#42e9f5" strokeWidth={4} dot={{ r: 6, fill: "#fff" }} animationDuration={1400} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
if (sheetIdx === 6) {
  if (!data.length) return <>No data</>;
  return (
    <>
      <div className="metric-cards">
        {data.map((row, i) => (
          <div className="metric" key={i}>
            <div className="metric-title">{row.GoalType}</div>
            <div className="metric-value">
              {row.CurrentValue}/{row.TargetValue}
            </div>
            <div style={{
              width: "90%",
              marginTop: 16,
              marginBottom: 5,
              background: "#262b47",
              borderRadius: 7,
              height: "13px",
              overflow: "hidden"
            }}>
              <div
                className="goal-bar"
                style={{
                  width: `${Math.min(Number(row.AchievementPercentage)||0,100)}%`,
                  background: (Number(row.AchievementPercentage) >= 100
                    ? "linear-gradient(90deg, #06ffa5 60%, #21e81a99 100%)"
                    : "linear-gradient(90deg, #ffa502 70%, #ff477e 100%)"),
                  height: "100%",
                  borderRadius: 7
                }}
              ></div>
            </div>
            <div style={{
              fontSize: "0.95em",
              marginTop: "9px",
              color:
                row.Status && String(row.Status).toLowerCase().includes("excellent")
                  ? "#06ffa5"
                  : row.Status && String(row.Status).toLowerCase().includes("behind")
                  ? "#ff477e"
                  : "#ffe566"
            }}>
              {row.Status || "--"}
            </div>
            <div style={{
              fontSize: "0.87em",
              marginTop: "6px",
              color: "#fff9"
            }}>
              Deadline: {row.Deadline || "--"}
            </div>
          </div>
        ))}
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h2 style={{ color: "#42e9f5", margin: "0 0 18px 0" }}>Goal Achievement (%)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="4 4" stroke="#23233a" />
              <XAxis dataKey="GoalType" stroke="#42e9f5"/>
              <YAxis stroke="#fff"/>
              <Tooltip contentStyle={{ background: "#23233a", borderRadius: 10, color: "#42e9f5" }} />
              <Bar dataKey="AchievementPercentage" name="Achieved (%)" fill="#42e9f5" barSize={40} radius={[9, 9, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

  return (
    <div style={{textAlign:"center",opacity:0.8,padding:"80px 0"}}>
      <h2 style={{color:"#ffa502"}}>Integrate this section with analytics for {label}</h2>
      <div style={{color:"#06ffa5", marginTop:24}}>Copy your card/chart pattern above for this sheet's analytics!</div>
    </div>
  );
}
