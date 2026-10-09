import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getAdminOrderById,
  updateOrderStatus,
  adminCancelOrder,
  refundOrder,
} from "../../api/orderApi";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import ToastContainer from "../components/ToastContainer";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status Change State
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Modal States
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refunding, setRefunding] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const toastId = Date.now();
    setToasts((prev) => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 4000);
  };

  const removeToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  // Fetch Order
  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminOrderById(id);
      if (res.success && res.data) {
        setOrder(res.data);
        setSelectedStatus(res.data.status || "");
      } else {
        setError(res.message || "Order details not found.");
      }
    } catch (err) {
      console.error("Fetch order detail error:", err);
      setError("Failed to fetch order details from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  // Update Status
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedStatus || selectedStatus === order.status) return;

    setUpdatingStatus(true);
    try {
      const res = await updateOrderStatus(order.order_id, selectedStatus);
      if (res.success) {
        addToast(`Order status updated to "${selectedStatus}".`, "success");
        fetchOrderDetails();
      } else {
        addToast(res.message || "Failed to update order status.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast(
        err.response?.data?.message || "Failed to update status.",
        "error",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Confirm Admin Cancellation
  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      const res = await adminCancelOrder(order.order_id);
      if (res.success) {
        addToast("Order cancelled successfully.", "success");
        fetchOrderDetails();
      } else {
        addToast(res.message || "Failed to cancel order.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast(
        err.response?.data?.message || "Failed to cancel order.",
        "error",
      );
    } finally {
      setCancelling(false);
      setCancelModalOpen(false);
    }
  };

  // Confirm Razorpay Refund
  const handleConfirmRefund = async () => {
    setRefunding(true);
    try {
      const res = await refundOrder(order.order_id);
      if (res.success) {
        addToast(
          "Razorpay refund initiated and order cancelled successfully.",
          "success",
        );
        fetchOrderDetails();
      } else {
        addToast(res.message || "Refund failed.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast(
        err.response?.data?.message || "Refund operation failed.",
        "error",
      );
    } finally {
      setRefunding(false);
      setRefundModalOpen(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const formatFullDateTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="admin-order-details-loading text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted fw-medium">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="admin-order-details-error alert alert-danger my-4 p-4 text-center">
        <i className="fa-solid fa-circle-exclamation fs-2 mb-2 d-block text-danger"></i>
        <h4 className="fw-bold">Failed to Load Order</h4>
        <p className="text-muted mb-3">{error || "Order not found."}</p>
        <Link to="/admin/orders" className="btn btn-outline-danger">
          <i className="fa-solid fa-arrow-left me-2"></i> Back to Orders List
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";
  const isPaidOnline =
    order.payment_method === "online" && order.payment_status === "paid";

  return (
    <div className="admin-order-details-page">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        title="Cancel Order"
        message={`Are you sure you want to cancel Order #${order.order_number}? Stock for COD items will be restored.`}
        confirmText="Confirm Cancellation"
        confirmVariant="danger"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onClose={() => setCancelModalOpen(false)}
      />

      {/* Refund Confirmation Modal */}
      <ConfirmModal
        isOpen={refundModalOpen}
        title="Initiate Razorpay Refund"
        message={`Are you sure you want to initiate a full refund of ${formatCurrency(order.total_amount)} for Order #${order.order_number}?`}
        confirmText="Initiate Refund"
        confirmVariant="warning"
        loading={refunding}
        onConfirm={handleConfirmRefund}
        onClose={() => setRefundModalOpen(false)}
      />

      {/* Order Details Header */}
      <div className="admin-order-details-header">
        <div className="admin-order-details-header-info">
          <div className="admin-order-details-title-row">
            <h1 className="admin-order-details-title">
              Order #{order.order_number}
            </h1>
            <div className="admin-order-details-badges">
              <StatusBadge status={order.status} />
              <StatusBadge status={order.payment_status} />
            </div>
          </div>
          <p className="admin-order-details-meta">
            <i className="fa-regular fa-calendar me-1"></i>
            <span>
              Placed on{" "}
              {formatFullDateTime(order.createdAt || order.created_at)}
            </span>
          </p>
        </div>

        <div className="admin-order-details-header-actions">
          <Link to="/admin/orders" className="btn admin-order-back-btn">
            <i className="fa-solid fa-arrow-left me-2"></i>
            <span>Back to Orders</span>
          </Link>
        </div>
      </div>

      {/* 2-Column Responsive Grid */}
      <div className="admin-order-details-grid">
        {/* Left / Main Column: Items, Summary, Shipping */}
        <div className="admin-order-details-main">
          {/* Ordered Items Card */}
          <div className="admin-card admin-order-items-card">
            <div className="admin-card-header">
              <div className="d-flex align-items-center gap-2">
                <i className="fa-solid fa-bag-shopping text-primary"></i>
                <h2 className="admin-card-title">
                  Ordered Items ({order.items?.length || 0})
                </h2>
              </div>
            </div>

            {/* Desktop Table for Items */}
            <div className="admin-table-container d-none d-sm-block">
              <table className="admin-table admin-order-items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th className="text-center">Qty</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr
                      key={item.order_item_id}
                      className="admin-order-item-row"
                    >
                      <td>
                        <div className="admin-order-item-product">
                          {item.product?.image ? (
                            <img
                              src={
                                item.product.image.startsWith("http")
                                  ? item.product.image
                                  : `http://localhost:5000${item.product.image}`
                              }
                              alt={item.product_title}
                              className="admin-order-item-image"
                            />
                          ) : (
                            <div className="admin-order-item-placeholder">
                              <i className="fa-solid fa-book"></i>
                            </div>
                          )}
                          <div className="admin-order-item-details">
                            <span className="admin-order-item-title">
                              {item.product_title}
                            </span>
                            {item.product?.author && (
                              <span className="admin-order-item-author">
                                By {item.product.author}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="admin-order-item-price">
                        {formatCurrency(item.product_price)}
                      </td>
                      <td className="text-center">
                        <span className="admin-order-item-qty">
                          x{item.quantity}
                        </span>
                      </td>
                      <td className="text-end admin-order-item-subtotal">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View for Items */}
            <div className="admin-order-items-mobile-list d-sm-none">
              {order.items?.map((item) => (
                <div
                  key={item.order_item_id}
                  className="admin-order-item-mobile-card"
                >
                  <div className="admin-order-item-product">
                    {item.product?.image ? (
                      <img
                        src={
                          item.product.image.startsWith("http")
                            ? item.product.image
                            : `http://localhost:5000${item.product.image}`
                        }
                        alt={item.product_title}
                        className="admin-order-item-image"
                      />
                    ) : (
                      <div className="admin-order-item-placeholder">
                        <i className="fa-solid fa-book"></i>
                      </div>
                    )}
                    <div className="admin-order-item-details">
                      <span className="admin-order-item-title">
                        {item.product_title}
                      </span>
                      {item.product?.author && (
                        <span className="admin-order-item-author">
                          By {item.product.author}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="admin-order-item-mobile-pricing">
                    <div className="admin-order-item-mobile-meta">
                      <span>{formatCurrency(item.product_price)}</span>
                      <span className="admin-order-item-qty">
                        x{item.quantity}
                      </span>
                    </div>
                    <div className="admin-order-item-subtotal">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Breakdown / Summary inside Card */}
            <div className="admin-order-financial-breakdown">
              <div className="admin-order-financial-row">
                <span className="admin-order-financial-label">Subtotal</span>
                <span className="admin-order-financial-val">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              <div className="admin-order-financial-row">
                <span className="admin-order-financial-label">
                  Shipping Charge
                </span>
                <span className="admin-order-financial-val">
                  {Number(order.shipping_charge) === 0 ? (
                    <span className="text-success fw-semibold">Free</span>
                  ) : (
                    formatCurrency(order.shipping_charge)
                  )}
                </span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="admin-order-financial-row">
                  <span className="admin-order-financial-label">
                    Discount Applied
                  </span>
                  <span className="admin-order-financial-val text-success fw-semibold">
                    -{formatCurrency(order.discount)}
                  </span>
                </div>
              )}
              <div className="admin-order-financial-divider"></div>
              <div className="admin-order-financial-row admin-order-financial-total">
                <span className="admin-order-financial-total-label">
                  Total Amount
                </span>
                <span className="admin-order-financial-total-val">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="admin-card admin-order-shipping-card">
            <div className="admin-card-header">
              <div className="d-flex align-items-center gap-2">
                <i className="fa-solid fa-location-dot text-primary"></i>
                <h2 className="admin-card-title">
                  Shipping & Delivery Details
                </h2>
              </div>
            </div>
            <div className="admin-card-body">
              <div className="admin-order-shipping-grid">
                <div className="admin-order-shipping-recipient">
                  <div className="admin-order-shipping-avatar">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div>
                    <h4 className="admin-order-shipping-name">
                      {order.shipping_name || "Recipient Name Not Provided"}
                    </h4>
                    <div className="admin-order-shipping-phone">
                      <i className="fa-solid fa-phone me-1 text-muted"></i>
                      <span>{order.shipping_phone || "No phone provided"}</span>
                    </div>
                  </div>
                </div>

                <div className="admin-order-shipping-address-block">
                  <div className="admin-order-shipping-address-label">
                    Delivery Address
                  </div>
                  <div className="admin-order-shipping-address-lines">
                    <p className="m-0">
                      {order.shipping_address_line1}
                      {order.shipping_address_line2 &&
                        `, ${order.shipping_address_line2}`}
                    </p>
                    <p className="m-0">
                      {order.shipping_city}, {order.shipping_state} -{" "}
                      <strong>{order.shipping_postal_code}</strong>
                    </p>
                    <p className="m-0 text-muted">
                      {order.shipping_country || "India"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right / Sidebar Column: Actions, Customer, Payment */}
        <div className="admin-order-details-sidebar">
          {/* Order Status Action Card */}
          <div className="admin-card admin-order-status-card">
            <div className="admin-card-header">
              <div className="d-flex align-items-center gap-2">
                <i className="fa-solid fa-sliders text-primary"></i>
                <h2 className="admin-card-title">Order Status Action</h2>
              </div>
            </div>
            <div className="admin-card-body">
              <div className="admin-order-current-status-box mb-3">
                <span className="admin-order-status-box-label">
                  Current Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {isCancelled || isDelivered ? (
                <div className="admin-order-status-locked-banner">
                  <i className="fa-solid fa-lock text-muted me-2"></i>
                  <span>
                    This order is <strong>{order.status}</strong>. Its status is
                    finalized and cannot be modified.
                  </span>
                </div>
              ) : (
                <form
                  onSubmit={handleUpdateStatus}
                  className="admin-order-status-form"
                >
                  <label
                    htmlFor="order-status-select"
                    className="form-label admin-order-form-label"
                  >
                    Change Status
                  </label>
                  <select
                    id="order-status-select"
                    className="form-select admin-order-select mb-3"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 admin-order-update-btn"
                    disabled={updatingStatus || selectedStatus === order.status}
                  >
                    {updatingStatus ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Updating Status...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check me-2"></i> Update Status
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Danger Zone / Admin Actions */}
              {!isCancelled && !isDelivered && (
                <div className="admin-order-danger-zone mt-3 pt-3">
                  <span className="admin-order-danger-title">
                    Administrative Actions
                  </span>
                  <div className="admin-order-danger-actions mt-2">
                    {isPaidOnline && (
                      <button
                        type="button"
                        className="btn btn-outline-warning text-dark w-100 admin-order-refund-btn"
                        onClick={() => setRefundModalOpen(true)}
                      >
                        <i className="fa-solid fa-rotate-left me-2"></i>
                        Refund via Razorpay
                      </button>
                    )}

                    {order.status !== "shipped" && !isPaidOnline && (
                      <button
                        type="button"
                        className="btn btn-outline-danger w-100 admin-order-cancel-btn"
                        onClick={() => setCancelModalOpen(true)}
                      >
                        <i className="fa-solid fa-ban me-2"></i>
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Account Card */}
          <div className="admin-card admin-order-customer-card">
            <div className="admin-card-header">
              <div className="d-flex align-items-center gap-2">
                <i className="fa-solid fa-user-check text-primary"></i>
                <h2 className="admin-card-title">Customer Account</h2>
              </div>
            </div>
            <div className="admin-card-body">
              {order.user ? (
                <div className="admin-order-customer-card-content">
                  <div className="admin-order-customer-card-profile">
                    <div className="admin-order-customer-card-avatar">
                      {order.user.name
                        ? order.user.name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <div className="admin-order-customer-card-meta">
                      <h4 className="admin-order-customer-card-name">
                        {order.user.name}
                      </h4>
                      <span className="admin-order-customer-card-email">
                        {order.user.email}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/admin/users/${order.user.id}`}
                    className="btn btn-outline-secondary btn-sm w-100 admin-order-user-link-btn mt-3"
                  >
                    <i className="fa-solid fa-user-gear me-2"></i>
                    View Customer Profile & History
                  </Link>
                </div>
              ) : (
                <div className="admin-order-guest-box">
                  <div className="admin-order-guest-icon">
                    <i className="fa-solid fa-user-slash"></i>
                  </div>
                  <div className="admin-order-guest-text">
                    <strong>Guest Customer</strong>
                    <p className="m-0 text-muted small">
                      This order was placed without registering an account.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info Card */}
          <div className="admin-card admin-order-payment-card">
            <div className="admin-card-header">
              <div className="d-flex align-items-center gap-2">
                <i className="fa-solid fa-credit-card text-primary"></i>
                <h2 className="admin-card-title">Payment Information</h2>
              </div>
            </div>
            <div className="admin-card-body">
              <div className="admin-order-payment-info-row">
                <span className="admin-order-payment-info-label">
                  Payment Method
                </span>
                <div>
                  <span
                    className={`admin-order-method-badge ${order.payment_method === "cod" ? "cod" : "online"}`}
                  >
                    <i
                      className={
                        order.payment_method === "cod"
                          ? "fa-solid fa-money-bill-wave"
                          : "fa-solid fa-credit-card"
                      }
                    ></i>
                    {order.payment_method === "cod"
                      ? "Cash on Delivery (COD)"
                      : "Razorpay Online"}
                  </span>
                </div>
              </div>

              <div className="admin-order-payment-info-row mt-3">
                <span className="admin-order-payment-info-label">
                  Payment Status
                </span>
                <div>
                  <StatusBadge status={order.payment_status} />
                </div>
              </div>

              {order.razorpay_order_id && (
                <div className="admin-order-technical-id-group mt-3 pt-3 border-top">
                  <span className="admin-order-technical-id-label">
                    Razorpay Order ID
                  </span>
                  <div className="admin-order-technical-id-value">
                    <code>{order.razorpay_order_id}</code>
                  </div>
                </div>
              )}

              {order.razorpay_payment_id && (
                <div className="admin-order-technical-id-group mt-2">
                  <span className="admin-order-technical-id-label">
                    Razorpay Payment ID
                  </span>
                  <div className="admin-order-technical-id-value">
                    <code>{order.razorpay_payment_id}</code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
