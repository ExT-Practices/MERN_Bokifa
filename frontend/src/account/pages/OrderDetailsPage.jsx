import { Link, useParams } from "react-router-dom";
import AccountLayout from "../components/AccountLayout";
import { useAccount } from "../context/AccountContext";
import React, { useEffect, useState } from "react";
const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { getOrderDetails, cancelUserOrder } = useAccount();
  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);

        const data = await getOrderDetails(orderId);

        setOrder(data);
      } catch (error) {
        console.error("Order Details Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <AccountLayout>
        <div
          className="bk-account-card"
          style={{
            textAlign: "center",
            padding: "50px",
          }}
        >
          <i
            className="fas fa-spinner fa-spin"
            style={{ fontSize: "28px" }}
          ></i>

          <p style={{ marginTop: "12px" }}>Loading order details...</p>
        </div>
      </AccountLayout>
    );
  }
  if (!order) {
    return (
      <AccountLayout>
        <div
          className="bk-account-card"
          style={{ textAlign: "center", padding: "40px" }}
        >
          <h2>Order Not Found</h2>
          <p>We couldn't find an order matching #{orderId}.</p>
          <Link
            to="/account/orders"
            className="bk-account-btn bk-account-btn--primary"
            style={{ marginTop: "16px" }}
          >
            Back to My Orders
          </Link>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      {/* Back button link */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          to="/account/orders"
          style={{
            color: "var(--bk-green-primary)",
            textDecoration: "none",
            fontWeight: "700",
            fontSize: "14px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <i className="fas fa-arrow-left"></i> Back to orders
        </Link>
      </div>

      {/* Main Order Card Header */}
      <div className="bk-account-card">
        <div className="bk-account-card__header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h2 className="bk-account-card__title">Order #{order.id}</h2>
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
            <p className="bk-account-card__subtitle">
              Placed on {order.date} • Payment: {order.paymentMethod}
            </p>
          </div>
          <button
            type="button"
            className="bk-account-btn bk-account-btn--secondary bk-account-btn--sm"
            onClick={() => window.print()}
          >
            <i className="fas fa-print"></i> Print Invoice
          </button>
          {["Pending", "Confirmed", "Processing"].includes(order.status) && (
            <button
              type="button"
              className="bk-account-btn bk-account-btn--outline-danger bk-account-btn--sm"
              onClick={() => setShowCancelConfirm(true)}
            >
              <i className="fas fa-times-circle"></i> Cancel Order
            </button>
          )}
        </div>

        {/* Delivery Progress Bar */}
        <div
          style={{
            backgroundColor: "var(--bk-bg-subtle)",
            padding: "16px 20px",
            borderRadius: "var(--bk-radius-sm)",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <span style={{ fontSize: "13px", color: "var(--bk-text-muted)" }}>
              Tracking Number:
            </span>
            <strong style={{ marginLeft: "6px", fontSize: "14px" }}>
              {order.trackingNumber}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--bk-text-muted)" }}>
              Est. Delivery:
            </span>
            <strong
              style={{
                marginLeft: "6px",
                fontSize: "14px",
                color: "var(--bk-green-dark)",
              }}
            >
              {order.estimatedDelivery}
            </strong>
          </div>
        </div>

        <div className="bk-account-order-detail-grid">
          {/* Left Column: Product Items */}
          <div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                marginBottom: "16px",
                color: "var(--bk-text-main)",
              }}
            >
              Items in this order ({order.items.length})
            </h3>
            <div style={{ marginBottom: "24px" }}>
              {order.items.map((item) => (
                <div key={item.id} className="bk-account-order-item-row">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="bk-account-order-item-img"
                  />
                  <div className="bk-account-order-item-info">
                    <div className="bk-account-order-item-title">
                      {item.title}
                    </div>
                    <div className="bk-account-order-item-meta">
                      Author: {item.author} • Format: {item.format}
                    </div>
                    <div
                      className="bk-account-order-item-meta"
                      style={{ marginTop: "4px" }}
                    >
                      Qty: {item.qty} × ₹{item.price.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ fontWeight: "700", fontSize: "15px" }}>
                    ₹{(item.qty * item.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Address Info Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px solid var(--bk-border-color)",
              }}
            >
              <div>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    marginBottom: "8px",
                    color: "var(--bk-text-main)",
                  }}
                >
                  <i
                    className="fas fa-map-marker-alt"
                    style={{
                      color: "var(--bk-green-primary)",
                      marginRight: "6px",
                    }}
                  ></i>
                  Shipping Address
                </h4>
                <div
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.6",
                    color: "var(--bk-text-muted)",
                  }}
                >
                  <strong>{order.shippingAddress.fullName}</strong>
                  <br />
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postcode}
                  <br />
                  {order.shippingAddress.country}
                  <br />
                  Phone: {order.shippingAddress.phone}
                </div>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    marginBottom: "8px",
                    color: "var(--bk-text-main)",
                  }}
                >
                  <i
                    className="fas fa-file-invoice"
                    style={{
                      color: "var(--bk-green-primary)",
                      marginRight: "6px",
                    }}
                  ></i>
                  Billing Address
                </h4>
                <div
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.6",
                    color: "var(--bk-text-muted)",
                  }}
                >
                  <strong>{order.billingAddress.fullName}</strong>
                  <br />
                  {order.billingAddress.street}
                  <br />
                  {order.billingAddress.city}, {order.billingAddress.state}{" "}
                  {order.billingAddress.postcode}
                  <br />
                  {order.billingAddress.country}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Box */}
          <div>
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid var(--bk-border-color)",
                borderRadius: "var(--bk-radius-md)",
                padding: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--bk-border-color)",
                }}
              >
                Order Summary
              </h3>

              <div className="bk-account-price-summary-row">
                <span>Subtotal</span>
                <span>₹{order.pricing.subtotal.toFixed(2)}</span>
              </div>

              <div className="bk-account-price-summary-row">
                <span>Shipping</span>
                <span>
                  {order.pricing.shipping === 0
                    ? "FREE"
                    : `₹${order.pricing.shipping.toFixed(2)}`}
                </span>
              </div>

              {order.pricing.discount > 0 && (
                <div
                  className="bk-account-price-summary-row"
                  style={{ color: "#027a36" }}
                >
                  <span>Discount</span>
                  <span>-₹{order.pricing.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="bk-account-price-summary-row bk-account-price-summary-row--total">
                <span>Total</span>
                <span>₹{order.pricing.total.toFixed(2)}</span>
              </div>

              <div style={{ marginTop: "24px" }}>
                <Link
                  to="/collection/all"
                  className="bk-account-btn bk-account-btn--secondary bk-account-btn--full"
                >
                  <i className="fas fa-redo"></i> Buy Again
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showCancelConfirm && (
        <div className="bk-account-modal-overlay">
          <div className="bk-account-modal" style={{ maxWidth: "420px" }}>
            <div className="bk-account-modal__header">
              <h3 className="bk-account-modal__title">Cancel Order</h3>

              <button
                type="button"
                className="bk-account-input-icon"
                onClick={() => setShowCancelConfirm(false)}
                style={{ position: "static" }}
              >
                <i className="fas fa-times" style={{ fontSize: "18px" }}></i>
              </button>
            </div>

            <div className="bk-account-modal__body">
              <p>
                Are you sure you want to cancel order{" "}
                <strong>#{order.id}</strong>?
              </p>

              <p
                style={{
                  color: "var(--bk-text-muted)",
                  fontSize: "13px",
                }}
              >
                This action cannot be undone.
              </p>
            </div>

            <div className="bk-account-modal__footer">
              <button
                type="button"
                className="bk-account-btn bk-account-btn--secondary"
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
              >
                Keep Order
              </button>

              <button
                type="button"
                className="bk-account-btn bk-account-btn--outline-danger"
                disabled={isCancelling}
                onClick={async () => {
                  try {
                    setIsCancelling(true);

                    await cancelUserOrder(order.orderId);

                    const updatedOrder = await getOrderDetails(order.orderId);

                    setOrder(updatedOrder);

                    setShowCancelConfirm(false);
                  } catch (error) {
                    console.error("Cancel order failed:", error);
                  } finally {
                    setIsCancelling(false);
                  }
                }}
              >
                {isCancelling ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Cancelling...
                  </>
                ) : (
                  <>
                    <i className="fas fa-times-circle"></i> Yes, Cancel Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
};

export default OrderDetailsPage;
