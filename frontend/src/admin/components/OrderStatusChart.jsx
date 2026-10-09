import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#f59e0b", icon: "fa-clock" },
  confirmed: { label: "Confirmed", color: "#3b82f6", icon: "fa-circle-check" },
  processing: {
    label: "Processing",
    color: "#8b5cf6",
    icon: "fa-arrows-rotate",
  },
  shipped: { label: "Shipped", color: "#06b6d4", icon: "fa-truck-fast" },
  delivered: { label: "Delivered", color: "#10b981", icon: "fa-box-open" },
  cancelled: { label: "Cancelled", color: "#ef4444", icon: "fa-ban" },
};

const CustomTooltip = ({ active, payload, totalOrders }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const percentage =
      totalOrders > 0 ? ((item.value / totalOrders) * 100).toFixed(1) : 0;
    const config = STATUS_CONFIG[item.payload?.statusKey] || {
      color: item.payload?.color || "#94a3b8",
      label: item.name,
    };

    return (
      <div className="admin-chart-tooltip shadow-sm">
        <div className="d-flex align-items-center gap-2 mb-1">
          <span
            className="admin-chart-legend-dot"
            style={{ backgroundColor: config.color }}
          ></span>
          <span className="fw-bold text-dark">{config.label}</span>
        </div>
        <div className="small text-muted">
          Orders: <strong className="text-dark">{item.value}</strong> (
          {percentage}%)
        </div>
      </div>
    );
  }
  return null;
};

const OrderStatusChart = ({ data = [] }) => {
  const totalOrders = (data || []).reduce(
    (acc, curr) => acc + (Number(curr.count) || 0),
    0,
  );

  const chartData = (data || [])
    .filter((d) => Number(d.count) > 0)
    .map((d) => {
      const sKey = String(d.status).toLowerCase();
      const cfg = STATUS_CONFIG[sKey] || {
        label: d.label || d.status,
        color: "#94a3b8",
      };
      return {
        name: cfg.label,
        statusKey: sKey,
        value: Number(d.count),
        color: cfg.color,
      };
    });

  return (
    <div className="admin-card mb-0 h-100">
      <div className="admin-card-header d-flex align-items-center justify-content-between">
        <div>
          <h2 className="admin-card-title d-flex align-items-center gap-2">
            <i className="fa-solid fa-chart-pie text-info"></i>
            Order Status
          </h2>
          <small className="text-muted">Status distribution</small>
        </div>
        <span
          className="badge bg-light text-dark border px-2 py-1"
          style={{ fontSize: "0.75rem" }}
        >
          Total: {totalOrders}
        </span>
      </div>

      <div className="admin-card-body d-flex flex-column justify-content-between">
        {totalOrders === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
            <i className="fa-solid fa-chart-pie fa-2x mb-2 text-secondary opacity-50"></i>
            <span className="small">No orders recorded yet</span>
          </div>
        ) : (
          <>
            <div
              style={{ width: "100%", height: 200 }}
              className="position-relative"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={<CustomTooltip totalOrders={totalOrders} />}
                  />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div
                className="position-absolute top-50 start-50 translate-middle text-center"
                style={{ pointerEvents: "none" }}
              >
                <span className="d-block fw-bold fs-5 text-dark lh-1">
                  {totalOrders}
                </span>
                <span
                  className="text-muted text-uppercase fw-semibold"
                  style={{ fontSize: "0.65rem" }}
                >
                  Orders
                </span>
              </div>
            </div>

            {/* Custom Status Legend Grid */}
            <div className="row g-2 mt-2 pt-2 border-top">
              {(data || []).map((item) => {
                const sKey = String(item.status).toLowerCase();
                const config = STATUS_CONFIG[sKey] || {
                  label: item.label || item.status,
                  color: "#94a3b8",
                };
                const pct =
                  totalOrders > 0
                    ? ((item.count / totalOrders) * 100).toFixed(0)
                    : 0;
                return (
                  <div key={item.status} className="col-4">
                    <div className="p-1 rounded bg-light bg-opacity-50 text-center">
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        <span
                          className="admin-chart-legend-dot"
                          style={{
                            backgroundColor: config.color,
                            width: "7px",
                            height: "7px",
                          }}
                        ></span>
                        <span
                          className="text-muted text-truncate"
                          style={{ fontSize: "0.7rem", maxWidth: "60px" }}
                        >
                          {config.label}
                        </span>
                      </div>
                      <span
                        className="fw-bold text-dark d-block"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {item.count}{" "}
                        <small
                          className="text-muted fw-normal"
                          style={{ fontSize: "0.65rem" }}
                        >
                          ({pct}%)
                        </small>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderStatusChart;
