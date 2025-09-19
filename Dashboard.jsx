import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalInvestment: 0,
    roi: 0,
    monthlyGrowth: 0
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Simulate fetching data
    setMetrics({
      totalRevenue: 150000,
      totalInvestment: 100000,
      roi: 50,
      monthlyGrowth: 12.5
    });

    // Sample chart data
    setChartData([
      { month: 'Jan', revenue: 10000, investment: 8000 },
      { month: 'Feb', revenue: 12000, investment: 9000 },
      { month: 'Mar', revenue: 15000, investment: 10000 },
      { month: 'Apr', revenue: 18000, investment: 11000 },
      { month: 'May', revenue: 22000, investment: 12000 },
      { month: 'Jun', revenue: 25000, investment: 13000 }
    ]);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>HECOS ROI Dashboard</h1>
        <p>Real-time Return on Investment Analytics</p>
      </header>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Revenue</h3>
          <p className="metric-value">{formatCurrency(metrics.totalRevenue)}</p>
        </div>
        
        <div className="metric-card">
          <h3>Total Investment</h3>
          <p className="metric-value">{formatCurrency(metrics.totalInvestment)}</p>
        </div>
        
        <div className="metric-card">
          <h3>ROI Percentage</h3>
          <p className="metric-value roi-positive">{metrics.roi}%</p>
        </div>
        
        <div className="metric-card">
          <h3>Monthly Growth</h3>
          <p className="metric-value growth-positive">+{metrics.monthlyGrowth}%</p>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>Revenue vs Investment Trends</h3>
          <div className="chart-placeholder">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Investment</th>
                  <th>ROI</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((data, index) => (
                  <tr key={index}>
                    <td>{data.month}</td>
                    <td>{formatCurrency(data.revenue)}</td>
                    <td>{formatCurrency(data.investment)}</td>
                    <td>{((data.revenue - data.investment) / data.investment * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="insights-section">
        <h3>Key Insights</h3>
        <ul>
          <li>ROI has consistently improved over the past 6 months</li>
          <li>Revenue growth rate is accelerating month over month</li>
          <li>Investment efficiency is at an all-time high</li>
          <li>Projected annual ROI: {metrics.roi * 2}%</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
