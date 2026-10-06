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
      addToast(err.response?.data?.message || "Failed to update status.", "error");
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
      addToast(err.response?.data?.message || "Failed to cancel order.", "error");
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
        addToast("Razorpay refund initiated and order cancelled successfully.", "success");
        fetchOrderDetails();
      } else {
        addToast(res.message || "Refund failed.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Refund operation failed.", "error");
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="alert alert-danger my-4 p-4 text-center">
        <i className="fa-solid fa-circle-exclamation fs-3 mb-2 d-block"></i>
        <h5>Failed to Load Order</h5>
        <p>{error || "Order not found."}</p>
        <Link to="/admin/orders" className="btn btn-outline-danger">
          Back to Orders List
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";
  const isPaidOnline = order.payment_method === "online" && order.payment_status === "paid";

  return (
    <div>
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

      <div className="admin-page-header">
        <div>
          <div className="d-flex align-items-center gap-3">
            <h1 className="admin-page-title m-0">Order #{order.order_number}</h1>
            <StatusBadge status={order.status} />
            <StatusBadge status={order.payment_status} />
          </div>
          <p className="admin-page-subtitle">
            Placed on{" "}
            {new Date(order.createdAt || order.created_at).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div>
          <Link to="/admin/orders" className="btn btn-outline-secondary">
            <i className="fa-solid fa-arrow-left me-1"></i> Back to Orders
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Line Items & Summary */}
        <div className="col-12 col-lg-8">
          {/* Order Items Table */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Ordered Items ({order.items?.length || 0})</h2>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.order_item_id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          {item.product?.image ? (
                            <img
                              src={
                                item.product.image.startsWith("http")
                                  ? item.product.image
                                  : `http://localhost:5000${item.product.image}`
                              }
                              alt={item.product_title}
                              className="rounded border object-fit-cover"
                              style={{ width: "40px", height: "50px" }}
                            />
                          ) : (
                            <div
                              className="rounded border bg-light d-flex align-items-center justify-content-center text-muted"
                              style={{ width: "40px", height: "50px" }}
                            >
                              <i className="fa-solid fa-book"></i>
                            </div>
                          )}
                          <div>
                            <div className="fw-bold text-dark">{item.product_title}</div>
                            {item.product?.author && (
                              <small className="text-muted">By {item.product.author}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{formatCurrency(item.product_price)}</td>
                      <td className="fw-bold">x{item.quantity}</td>
                      <td className="text-end fw-bold">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotal & Financial Breakdown */}
            <div className="p-4 border-top bg-light">
              <div className="row justify-content-end">
                <div className="col-12 col-md-6 col-lg-5">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal:</span>
                    <span className="fw-semibold">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Shipping Charge:</span>
                    <span className="fw-semibold">{formatCurrency(order.shipping_charge)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Discount:</span>
                    <span className="fw-semibold text-success">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fs-5 fw-bold text-dark">
                    <span>Total Amount:</span>
                    <span className="text-primary">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address Snapshot */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Shipping Address</h2>
            </div>
            <div className="admin-card-body">
              <div className="fw-bold fs-6 text-dark mb-1">{order.shipping_name}</div>
              <div className="text-muted mb-2">
                <i className="fa-solid fa-phone me-2"></i>
                {order.shipping_phone || "No phone provided"}
              </div>
              <div className="text-secondary" style={{ lineHeight: "1.6" }}>
                {order.shipping_address_line1}
                {order.shipping_address_line2 && `, ${order.shipping_address_line2}`}
                <br />
                {order.shipping_city}, {order.shipping_state} - {order.shipping_postal_code}
                <br />
                {order.shipping_country}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Admin Actions & Customer Info */}
        <div className="col-12 col-lg-4">
          {/* Admin Order Status Control */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Order Status Action</h2>
            </div>
            <div className="admin-card-body">
              {isCancelled || isDelivered ? (
                <div className="alert alert-secondary m-0 small">
                  <i className="fa-solid fa-info-circle me-1"></i>
                  This order is <strong>{order.status}</strong> and its status cannot be changed further.
                </div>
              ) : (
                <form onSubmit={handleUpdateStatus}>
                  <label className="form-label font-weight-bold text-dark">
                    Update Order Status
                  </label>
                  <select
                    className="form-select mb-3"
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
                    className="btn btn-primary w-100 fw-bold shadow-sm mb-3"
                    disabled={updatingStatus || selectedStatus === order.status}
                  >
                    {updatingStatus ? "Updating..." : "Update Status"}
                  </button>
                </form>
              )}

              {/* Danger Zone Actions */}
              {!isCancelled && !isDelivered && (
                <div className="border-top pt-3 mt-2 d-grid gap-2">
                  {isPaidOnline && (
                    <button
                      type="button"
                      className="btn btn-outline-warning text-dark font-weight-semibold"
                      onClick={() => setRefundModalOpen(true)}
                    >
                      <i className="fa-solid fa-rotate-left me-1"></i> Refund via Razorpay
                    </button>
                  )}

                  {order.status !== "shipped" && !isPaidOnline && (
                    <button
                      type="button"
                      className="btn btn-outline-danger font-weight-semibold"
                      onClick={() => setCancelModalOpen(true)}
                    >
                      <i className="fa-solid fa-ban me-1"></i> Cancel Order
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Customer Account Info */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Customer Account</h2>
            </div>
            <div className="admin-card-body">
              {order.user ? (
                <div>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="avatar-sm rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: "42px", height: "42px" }}>
                      {order.user.name ? order.user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="fw-bold text-dark">{order.user.name}</div>
                      <small className="text-muted d-block">{order.user.email}</small>
                    </div>
                  </div>
                  <Link
                    to={`/admin/users/${order.user.id}`}
                    className="btn btn-sm btn-outline-secondary w-100"
                  >
                    View Customer Profile & History
                  </Link>
                </div>
              ) : (
                <p className="text-muted small m-0">Guest User</p>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Payment Info</h2>
            </div>
            <div className="admin-card-body">
              <div className="mb-2">
                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "0.7rem" }}>Method</small>
                <div className="fw-bold text-dark">
                  {order.payment_method === "cod" ? "Cash on Delivery (COD)" : "Razorpay Online"}
                </div>
              </div>
              <div className="mb-2">
                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "0.7rem" }}>Payment Status</small>
                <StatusBadge status={order.payment_status} />
              </div>
              {order.razorpay_order_id && (
                <div className="mt-3 pt-2 border-top">
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>Razorpay Order ID:</small>
                  <code className="text-dark small">{order.razorpay_order_id}</code>
                </div>
              )}
              {order.razorpay_payment_id && (
                <div className="mt-2">
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>Razorpay Payment ID:</small>
                  <code className="text-dark small">{order.razorpay_payment_id}</code>
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
