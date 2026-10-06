import React, { useState } from "react";
import { Link } from "react-router-dom";
import AccountLayout from "../components/AccountLayout";
import { useAccount } from "../context/AccountContext";

const OrdersPage = () => {
  const { orders } = useAccount();
  const [filter, setFilter] = useState("All");

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((o) => o.status.toLowerCase() === filter.toLowerCase());

  return (
    <AccountLayout>
      <div className="bk-account-card">
        <div className="bk-account-card__header">
          <div>
            <h2 className="bk-account-card__title">
              <i className="fas fa-shopping-bag" style={{ color: "var(--bk-green-primary)" }}></i>
              My Orders
            </h2>
            <p className="bk-account-card__subtitle">
              Track current orders and review your purchase history.
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="bk-account-filter-tabs">
          {["All", "Processing", "Delivered", "Cancelled"].map((status) => (
            <button
              key={status}
              type="button"
              className={`bk-account-filter-btn ${
                filter === status ? "bk-account-filter-btn--active" : ""
              }`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--bk-text-muted)",
            }}
          >
            <i
              className="fas fa-box-open"
              style={{ fontSize: "40px", marginBottom: "16px", opacity: 0.5 }}
            ></i>
            <p>No orders found matching status "{filter}".</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
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
                    />
                  ))}
                  <div className="bk-account-order-meta-info">
                    <span style={{ fontWeight: "700", fontSize: "14px" }}>
                      {order.items.map((i) => i.title).join(", ")}
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--bk-text-muted)" }}>
                      {order.itemsCount} {order.itemsCount === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div className="bk-account-order-total">₹{order.total.toFixed(2)}</div>
                  <Link
                    to={`/account/orders/${order.orderId}`}
                    className="bk-account-btn bk-account-btn--primary bk-account-btn--sm"
                  >
                    View order
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AccountLayout>
  );
};

export default OrdersPage;
