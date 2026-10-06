import React from "react";
import { Link } from "react-router-dom";
import AccountLayout from "../components/AccountLayout";
import { useAccount } from "../context/AccountContext";

const DashboardPage = () => {
  const { user, orders, addresses } = useAccount();

  const pendingCount = orders.filter((o) => o.status === "Processing").length;
  const recentOrders = orders.slice(0, 3);

  return (
    <AccountLayout>
      {/* Quick Stat Widgets */}
      <div className="bk-account-stats-grid">
        <div className="bk-account-stat-box">
          <div className="bk-account-stat-box__icon">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <div>
            <div className="bk-account-stat-box__val">{orders.length}</div>
            <div className="bk-account-stat-box__label">Total Orders</div>
          </div>
        </div>

        <div className="bk-account-stat-box">
          <div className="bk-account-stat-box__icon">
            <i className="fas fa-truck"></i>
          </div>
          <div>
            <div className="bk-account-stat-box__val">{pendingCount}</div>
            <div className="bk-account-stat-box__label">In Progress</div>
          </div>
        </div>

        <div className="bk-account-stat-box">
          <div className="bk-account-stat-box__icon">
            <i className="fas fa-map-marked-alt"></i>
          </div>
          <div>
            <div className="bk-account-stat-box__val">{addresses.length}</div>
            <div className="bk-account-stat-box__label">Saved Addresses</div>
          </div>
        </div>
      </div>

      {/* Account Navigation Grid Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        <Link
          to="/account/orders"
          className="bk-account-card"
          style={{ textDecoration: "none", marginBottom: 0, padding: "20px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                backgroundColor: "var(--bk-green-light)",
                color: "var(--bk-green-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              <i className="fas fa-box"></i>
            </div>
            <div>
              <h3 className="bk-account-card__title" style={{ fontSize: "16px" }}>
                Orders
              </h3>
              <p className="bk-account-card__subtitle" style={{ fontSize: "12px" }}>
                View & track your orders
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/account/profile"
          className="bk-account-card"
          style={{ textDecoration: "none", marginBottom: 0, padding: "20px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                backgroundColor: "#e0f2fe",
                color: "#0369a1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              <i className="fas fa-user-edit"></i>
            </div>
            <div>
              <h3 className="bk-account-card__title" style={{ fontSize: "16px" }}>
                Personal details
              </h3>
              <p className="bk-account-card__subtitle" style={{ fontSize: "12px" }}>
                Manage profile information
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/account/addresses"
          className="bk-account-card"
          style={{ textDecoration: "none", marginBottom: 0, padding: "20px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                backgroundColor: "#fef3c7",
                color: "#b45309",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <div>
              <h3 className="bk-account-card__title" style={{ fontSize: "16px" }}>
                Addresses
              </h3>
              <p className="bk-account-card__subtitle" style={{ fontSize: "12px" }}>
                Manage shipping locations
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/account/settings"
          className="bk-account-card"
          style={{ textDecoration: "none", marginBottom: 0, padding: "20px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                backgroundColor: "#f3e8ff",
                color: "#7e22ce",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              <i className="fas fa-sliders-h"></i>
            </div>
            <div>
              <h3 className="bk-account-card__title" style={{ fontSize: "16px" }}>
                Account settings
              </h3>
              <p className="bk-account-card__subtitle" style={{ fontSize: "12px" }}>
                Security & preferences
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bk-account-card">
        <div className="bk-account-card__header">
          <div>
            <h2 className="bk-account-card__title">
              <i className="fas fa-clock" style={{ color: "var(--bk-green-primary)" }}></i>
              Recent Orders
            </h2>
            <p className="bk-account-card__subtitle">
              Showing your latest purchases and delivery status.
            </p>
          </div>
          <Link
            to="/account/orders"
            className="bk-account-btn bk-account-btn--secondary bk-account-btn--sm"
          >
            View all orders ({orders.length})
          </Link>
        </div>

        <div>
          {recentOrders.map((order) => (
            <div key={order.id} className="bk-account-order-card">
              <div className="bk-account-order-card__header">
                <div>
                  <span className="bk-account-order-num">#{order.id}</span>
                  <span style={{ margin: "0 8px", color: "#cbd5e1" }}>•</span>
                  <span className="bk-account-order-date">{order.date}</span>
                </div>
                <span
                  className="bk-account-badge"
                  style={{
                    backgroundColor: order.statusBg,
                    color: order.statusColor,
                  }}
                >
                  <i className="fas fa-circle" style={{ fontSize: "6px" }}></i>
                  {order.status}
                </span>
              </div>

              <div className="bk-account-order-card__body">
                <div className="bk-account-order-items-preview">
                  {order.items.map((item) => (
                    <img
                      key={item.id}
                      src={item.image}
                      alt={item.title}
                      className="bk-account-order-thumb"
                      title={`${item.title} (${item.format})`}
                    />
                  ))}
                  <div className="bk-account-order-meta-info">
                    <span style={{ fontWeight: "700", fontSize: "14px" }}>
                      {order.items[0]?.title}
                      {order.items.length > 1
                        ? ` +${order.items.length - 1} more`
                        : ""}
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--bk-text-muted)" }}>
                      {order.itemsCount} {order.itemsCount === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div className="bk-account-order-total">${order.total.toFixed(2)}</div>
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="bk-account-btn bk-account-btn--primary bk-account-btn--sm"
                  >
                    View order
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AccountLayout>
  );
};

export default DashboardPage;
