import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const formatCurrencyCompact = (val) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
  return `₹${val}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const revenueItem = payload.find((p) => p.dataKey === "revenue");
    const ordersItem = payload.find((p) => p.dataKey === "orders");

    const formatFullCurrency = (amount) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(amount || 0);
    };

    return (
      <div className="admin-chart-tooltip shadow-sm">
        <div className="admin-chart-tooltip-title fw-bold text-dark">
          {label}
        </div>
        <div className="d-flex align-items-center justify-content-between gap-3 py-1">
          <span className="d-flex align-items-center gap-2">
            <span
              className="admin-chart-legend-dot"
              style={{ backgroundColor: "#2563eb" }}
            ></span>
            <span className="text-muted">Revenue:</span>
          </span>
          <span className="fw-bold text-primary">
            {formatFullCurrency(revenueItem ? revenueItem.value : 0)}
          </span>
        </div>
        <div className="d-flex align-items-center justify-content-between gap-3 py-1">
          <span className="d-flex align-items-center gap-2">
            <span
              className="admin-chart-legend-dot"
              style={{ backgroundColor: "#10b981" }}
            ></span>
            <span className="text-muted">Orders:</span>
          </span>
          <span className="fw-bold text-success">
            {ordersItem ? ordersItem.value : 0} orders
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const MonthlyRevenueChart = ({ data = [] }) => {
  const chartData = data && data.length > 0 ? data : [];
  const totalPeriodRevenue = chartData.reduce(
    (acc, curr) => acc + (Number(curr.revenue) || 0),
    0,
  );
  const totalPeriodOrders = chartData.reduce(
    (acc, curr) => acc + (Number(curr.orders) || 0),
    0,
  );

  const formatFullCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="admin-card mb-0 h-100">
      <div className="admin-card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h2 className="admin-card-title d-flex align-items-center gap-2">
            <i className="fa-solid fa-chart-simple text-primary"></i>
            Revenue & Order Trends
          </h2>
          <small className="text-muted">
            Performance over the last 6 months
          </small>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="text-end d-none d-sm-block">
            <small
              className="text-muted d-block"
              style={{ fontSize: "0.72rem" }}
            >
              6-Month Revenue
            </small>
            <span className="fw-bold text-success small">
              {formatFullCurrency(totalPeriodRevenue)}
            </span>
          </div>
          <div className="text-end d-none d-sm-block">
            <small
              className="text-muted d-block"
              style={{ fontSize: "0.72rem" }}
            >
              6-Month Orders
            </small>
            <span className="fw-bold text-primary small">
              {totalPeriodOrders}
            </span>
          </div>
        </div>
      </div>

      <div className="admin-card-body">
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              barGap={6}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
              />
              {/* Left Y Axis for Revenue */}
              <YAxis
                yAxisId="revenue"
                orientation="left"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickFormatter={formatCurrencyCompact}
                allowDecimals={false}
              />
              {/* Right Y Axis for Order Count */}
              <YAxis
                yAxisId="orders"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: "12px", fontSize: "0.8rem" }}
              />
              <Bar
                yAxisId="revenue"
                dataKey="revenue"
                name="Revenue (₹)"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                yAxisId="orders"
                dataKey="orders"
                name="Orders"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MonthlyRevenueChart;
