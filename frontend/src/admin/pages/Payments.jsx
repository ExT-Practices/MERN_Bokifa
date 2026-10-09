import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAllPayments, refundOrderPayment } from "../../api/paymentApi";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import TableSkeleton from "../components/SkeletonLoader";
import ConfirmModal from "../components/ConfirmModal";
import ToastContainer from "../components/ToastContainer";

const Payments = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const paymentStatusFilter = searchParams.get("payment_status") || "";
  const paymentMethodFilter = searchParams.get("payment_method") || "";

  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search input state
  const [searchInput, setSearchInput] = useState(search);

  // Modals & Refund state
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [orderToRefund, setOrderToRefund] = useState(null);
  const [refunding, setRefunding] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchPaymentsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 10,
      };
      if (search.trim()) params.search = search.trim();
      if (paymentStatusFilter) params.payment_status = paymentStatusFilter;
      if (paymentMethodFilter) params.payment_method = paymentMethodFilter;

      const res = await getAllPayments(params);
      if (res.success) {
        setPayments(res.data || []);
        setPagination(res.pagination || null);
      } else {
        setError(res.message || "Failed to fetch payment records.");
      }
    } catch (err) {
      console.error("Fetch payments error:", err);
      setError("Failed to communicate with payment API server.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, paymentStatusFilter, paymentMethodFilter]);

  useEffect(() => {
    fetchPaymentsList();
  }, [fetchPaymentsList]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", "1");
    if (searchInput.trim()) {
      newParams.set("search", searchInput.trim());
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

  // Filter change handlers
  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", "1");
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // Clear all filters handler
  const handleClearAllFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  // Pagination handler
  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(`${type}-${text}`);
    addToast(`Copied ${type} to clipboard!`, "success");
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Open details modal
  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setDetailsModalOpen(true);
  };

  // Open refund confirmation
  const handleInitiateRefund = (payment) => {
    setOrderToRefund(payment);
    setRefundModalOpen(true);
  };

  // Execute refund
  const handleConfirmRefund = async () => {
    if (!orderToRefund) return;
    setRefunding(true);
    try {
      const res = await refundOrderPayment(orderToRefund.order_id);
      if (res.success) {
        addToast(
          `Refund of ${formatCurrency(orderToRefund.total_amount)} processed successfully!`,
          "success"
        );
        setRefundModalOpen(false);
        setDetailsModalOpen(false);
        setOrderToRefund(null);
        fetchPaymentsList();
      } else {
        addToast(res.message || "Failed to process refund", "error");
      }
    } catch (err) {
      console.error("Refund error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to initiate refund with Razorpay.";
      addToast(errMsg, "error");
    } finally {
      setRefunding(false);
    }
  };

  const hasActiveFilters = Boolean(
    search || paymentStatusFilter || paymentMethodFilter
  );

  return (
    <div className="admin-payments-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title d-flex align-items-center gap-2">
            <i className="fa-solid fa-credit-card text-primary"></i>
            Payments Management
          </h1>
          <p className="admin-page-subtitle">
            Track online and cash-on-delivery transactions, inspect gateway references, and process refunds
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-white btn-outline-secondary shadow-sm d-inline-flex align-items-center gap-2"
            onClick={fetchPaymentsList}
            disabled={loading}
          >
            <i className={`fa-solid fa-arrows-rotate ${loading ? "fa-spin" : ""}`}></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="admin-orders-toolbar">
        <form onSubmit={handleSearchSubmit} className="admin-orders-search">
          <i className="fa-solid fa-magnifying-glass admin-orders-search-icon"></i>
          <input
            type="text"
            className="form-control admin-orders-search-input"
            placeholder="Search by Order #, Customer, Razorpay ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              className="admin-orders-search-clear"
              onClick={() => {
                setSearchInput("");
                const newParams = new URLSearchParams(searchParams);
                newParams.delete("search");
                newParams.set("page", "1");
                setSearchParams(newParams);
              }}
              aria-label="Clear search"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </form>

        <div className="admin-orders-filters">
          <div className="admin-orders-filter-select-wrapper">
            <select
              className="form-select admin-orders-select"
              value={paymentStatusFilter}
              onChange={(e) => handleFilterChange("payment_status", e.target.value)}
              aria-label="Filter by payment status"
            >
              <option value="">All Payment Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="admin-orders-filter-select-wrapper">
            <select
              className="form-select admin-orders-select"
              value={paymentMethodFilter}
              onChange={(e) => handleFilterChange("payment_method", e.target.value)}
              aria-label="Filter by payment method"
            >
              <option value="">All Payment Methods</option>
              <option value="online">Razorpay / Online</option>
              <option value="cod">Cash on Delivery (COD)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-outline-secondary admin-orders-clear-btn"
              onClick={handleClearAllFilters}
            >
              <i className="fa-solid fa-filter-circle-xmark me-1"></i>
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation fs-5"></i>
            <span>{error}</span>
          </div>
          <button className="btn btn-sm btn-outline-danger" onClick={fetchPaymentsList}>
            <i className="fa-solid fa-rotate-right me-1"></i> Retry
          </button>
        </div>
      )}

      {/* Payments Container Card */}
      <div className="admin-card mb-4">
        <div className="admin-card-header d-flex align-items-center justify-content-between">
          <h2 className="admin-card-title">Transaction Records</h2>
          {pagination && pagination.totalOrders !== undefined && (
            <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: "0.8rem" }}>
              {pagination.totalOrders} {pagination.totalOrders === 1 ? "Record" : "Records"}
            </span>
          )}
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date & Time</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Amount</th>
                <th>Gateway Reference</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={6} cols={8} />
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                      <i className="fa-solid fa-receipt fa-2x mb-2 text-secondary opacity-50"></i>
                      <p className="m-0 fw-semibold">No payment records found.</p>
                      <small className="text-muted">
                        {hasActiveFilters
                          ? "Try adjusting or clearing your filters."
                          : "Orders and payment transactions will appear here."}
                      </small>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((order) => {
                  const isOnline = order.payment_method === "online";
                  const isPaid = order.payment_status === "paid";
                  const isRefunded = order.payment_status === "refunded";

                  return (
                    <tr key={order.order_id}>
                      {/* Order Number */}
                      <td>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none fw-bold text-primary"
                          onClick={() => handleViewDetails(order)}
                          title="View Payment Details"
                        >
                          #{order.order_number}
                        </button>
                      </td>

                      {/* Customer */}
                      <td>
                        <div className="fw-semibold text-dark">
                          {order.shipping_name || order.user?.name || "Guest Customer"}
                        </div>
                        <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                          {order.user?.email || order.shipping_phone || ""}
                        </small>
                      </td>

                      {/* Date & Time */}
                      <td>
                        <div className="text-dark small fw-medium">
                          {formatDate(order.created_at || order.createdAt)}
                        </div>
                        <small className="text-muted d-block" style={{ fontSize: "0.72rem" }}>
                          {formatTime(order.created_at || order.createdAt)}
                        </small>
                      </td>

                      {/* Payment Method */}
                      <td>
                        {isOnline ? (
                          <span className="status-badge online">
                            <i className="fa-solid fa-credit-card"></i>
                            Razorpay Online
                          </span>
                        ) : (
                          <span className="status-badge cod">
                            <i className="fa-solid fa-hand-holding-dollar"></i>
                            Cash on Delivery
                          </span>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td>
                        <StatusBadge status={order.payment_status} />
                      </td>

                      {/* Amount */}
                      <td>
                        <span className="fw-bold text-dark">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </td>

                      {/* Gateway Reference */}
                      <td>
                        {isOnline ? (
                          <div>
                            {order.razorpay_payment_id ? (
                              <div className="d-flex align-items-center gap-1">
                                <code
                                  className="text-primary bg-light px-2 py-1 rounded"
                                  style={{ fontSize: "0.75rem" }}
                                  title={order.razorpay_payment_id}
                                >
                                  {order.razorpay_payment_id.length > 16
                                    ? `${order.razorpay_payment_id.slice(0, 14)}...`
                                    : order.razorpay_payment_id}
                                </code>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link p-0 text-muted"
                                  onClick={() => handleCopy(order.razorpay_payment_id, "Payment ID")}
                                  title="Copy Payment ID"
                                >
                                  <i
                                    className={`fa-solid ${
                                      copiedId === `Payment ID-${order.razorpay_payment_id}`
                                        ? "fa-check text-success"
                                        : "fa-copy"
                                    }`}
                                    style={{ fontSize: "0.8rem" }}
                                  ></i>
                                </button>
                              </div>
                            ) : (
                              <small className="text-muted fst-italic">Payment Pending</small>
                            )}
                            {order.razorpay_order_id && (
                              <small
                                className="text-muted d-block"
                                style={{ fontSize: "0.7rem" }}
                                title={order.razorpay_order_id}
                              >
                                Ref: {order.razorpay_order_id.slice(-8)}
                              </small>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted small">COD / On Delivery</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="text-end">
                        <div className="d-inline-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-light border text-primary"
                            onClick={() => handleViewDetails(order)}
                            title="View Payment Details"
                          >
                            <i className="fa-solid fa-eye me-1"></i> Details
                          </button>

                          {isOnline && isPaid && !isRefunded && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleInitiateRefund(order)}
                              title="Process Refund"
                            >
                              <i className="fa-solid fa-rotate-left me-1"></i> Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="px-3 pb-3">
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {detailsModalOpen && selectedPayment && (
        <div className="admin-modal-backdrop" onClick={() => setDetailsModalOpen(false)}>
          <div
            className="admin-modal-dialog"
            style={{ maxWidth: "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h5 className="m-0 font-weight-bold text-dark d-flex align-items-center gap-2">
                  <i className="fa-solid fa-receipt text-primary"></i>
                  Payment Details
                </h5>
                <small className="text-muted">Order #{selectedPayment.order_number}</small>
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setDetailsModalOpen(false)}
              ></button>
            </div>

            <div className="admin-modal-body">
              {/* Status & Amount Header Card */}
              <div className="p-3 bg-light rounded-3 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2 border">
                <div>
                  <small className="text-muted text-uppercase fw-bold d-block" style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                    Payment Status
                  </small>
                  <div className="mt-1">
                    <StatusBadge status={selectedPayment.payment_status} />
                  </div>
                </div>
                <div className="text-end">
                  <small className="text-muted text-uppercase fw-bold d-block" style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                    Total Amount
                  </small>
                  <span className="fw-bold fs-5 text-dark">
                    {formatCurrency(selectedPayment.total_amount)}
                  </span>
                </div>
              </div>

              {/* 2-Column Grid: Financial Breakdown + Customer Details */}
              <div className="row g-3 mb-3">
                {/* Financial Breakdown */}
                <div className="col-12 col-sm-6">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-none">
                    <h6 className="fw-bold mb-2 small text-uppercase text-muted" style={{ letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                      Amount Summary
                    </h6>
                    <div className="d-flex justify-content-between py-1 small">
                      <span className="text-muted">Subtotal</span>
                      <span className="fw-semibold">{formatCurrency(selectedPayment.subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 small">
                      <span className="text-muted">Shipping</span>
                      <span className="fw-semibold">
                        {Number(selectedPayment.shipping_charge) === 0
                          ? "Free"
                          : formatCurrency(selectedPayment.shipping_charge)}
                      </span>
                    </div>
                    {Number(selectedPayment.discount) > 0 && (
                      <div className="d-flex justify-content-between py-1 small text-success">
                        <span>Discount</span>
                        <span className="fw-semibold">-{formatCurrency(selectedPayment.discount)}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between py-1 border-top mt-2 fw-bold small">
                      <span>Grand Total</span>
                      <span className="text-primary">{formatCurrency(selectedPayment.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="col-12 col-sm-6">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-none">
                    <h6 className="fw-bold mb-2 small text-uppercase text-muted" style={{ letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                      Customer Info
                    </h6>
                    <div className="fw-semibold text-dark small mb-1">
                      {selectedPayment.shipping_name || selectedPayment.user?.name || "Customer"}
                    </div>
                    {selectedPayment.user?.email && (
                      <div className="text-muted small text-truncate mb-1" title={selectedPayment.user.email}>
                        <i className="fa-regular fa-envelope me-1 text-muted" style={{ fontSize: "0.75rem" }}></i>
                        {selectedPayment.user.email}
                      </div>
                    )}
                    {selectedPayment.shipping_phone && (
                      <div className="text-muted small">
                        <i className="fa-solid fa-phone me-1 text-muted" style={{ fontSize: "0.75rem" }}></i>
                        {selectedPayment.shipping_phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Gateway & Transaction References */}
              <div className="border rounded-3 p-3 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="fw-bold m-0 small text-uppercase text-muted" style={{ letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                    Gateway References
                  </h6>
                  <span className={`badge ${selectedPayment.payment_method === "online" ? "bg-primary-subtle text-primary border border-primary-subtle" : "bg-secondary-subtle text-secondary border border-secondary-subtle"} fw-semibold`} style={{ fontSize: "0.72rem" }}>
                    {selectedPayment.payment_method === "online" ? "Razorpay Online" : "Cash on Delivery (COD)"}
                  </span>
                </div>

                {selectedPayment.payment_method === "online" && (
                  <>
                    <div className="mb-2">
                      <small className="text-muted d-block" style={{ fontSize: "0.72rem" }}>
                        Razorpay Payment ID:
                      </small>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <code className="text-dark bg-light px-2 py-1 rounded small flex-grow-1 text-truncate border" style={{ fontSize: "0.8rem" }}>
                          {selectedPayment.razorpay_payment_id || "Not generated yet"}
                        </code>
                        {selectedPayment.razorpay_payment_id && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary py-1 px-2"
                            title="Copy Payment ID"
                            onClick={() => handleCopy(selectedPayment.razorpay_payment_id, "Payment ID")}
                          >
                            <i className={copiedId?.includes(selectedPayment.razorpay_payment_id) ? "fa-solid fa-check text-success" : "fa-solid fa-copy"}></i>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted d-block" style={{ fontSize: "0.72rem" }}>
                        Razorpay Order ID:
                      </small>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <code className="text-dark bg-light px-2 py-1 rounded small flex-grow-1 text-truncate border" style={{ fontSize: "0.8rem" }}>
                          {selectedPayment.razorpay_order_id || "Not generated yet"}
                        </code>
                        {selectedPayment.razorpay_order_id && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary py-1 px-2"
                            title="Copy Order ID"
                            onClick={() => handleCopy(selectedPayment.razorpay_order_id, "Order ID")}
                          >
                            <i className={copiedId?.includes(selectedPayment.razorpay_order_id) ? "fa-solid fa-check text-success" : "fa-solid fa-copy"}></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-2 pt-2 border-top d-flex align-items-center justify-content-between flex-wrap gap-1">
                  <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                    Transaction Timestamp:
                  </small>
                  <span className="small text-dark fw-medium" style={{ fontSize: "0.78rem" }}>
                    {formatDate(selectedPayment.created_at || selectedPayment.createdAt)} at{" "}
                    {formatTime(selectedPayment.created_at || selectedPayment.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <Link
                to={`/admin/orders/${selectedPayment.order_id}`}
                className="btn btn-outline-primary btn-sm"
              >
                <i className="fa-solid fa-arrow-up-right-from-square me-1"></i> Full Order Details
              </Link>

              <div className="d-flex align-items-center gap-2">
                {selectedPayment.payment_method === "online" &&
                  selectedPayment.payment_status === "paid" && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleInitiateRefund(selectedPayment)}
                    >
                      <i className="fa-solid fa-rotate-left me-1"></i> Process Refund
                    </button>
                  )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-3"
                  onClick={() => setDetailsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      <ConfirmModal
        isOpen={refundModalOpen}
        title="Confirm Razorpay Refund"
        message={`Are you sure you want to refund ${formatCurrency(
          orderToRefund?.total_amount
        )} for Order #${orderToRefund?.order_number}? This will initiate a direct refund through Razorpay to the customer's original payment method.`}
        confirmText="Yes, Issue Refund"
        confirmVariant="danger"
        loading={refunding}
        onConfirm={handleConfirmRefund}
        onClose={() => {
          if (!refunding) {
            setRefundModalOpen(false);
            setOrderToRefund(null);
          }
        }}
      />

      {/* Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default Payments;