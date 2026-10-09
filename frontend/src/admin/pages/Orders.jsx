import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAllOrders } from "../../api/orderApi";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import TableSkeleton from "../components/SkeletonLoader";

const Orders = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const paymentStatusFilter = searchParams.get("payment_status") || "";
  const paymentMethodFilter = searchParams.get("payment_method") || "";

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search input state
  const [searchInput, setSearchInput] = useState(search);

  const fetchOrdersList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 10,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (paymentStatusFilter) params.payment_status = paymentStatusFilter;
      if (paymentMethodFilter) params.payment_method = paymentMethodFilter;

      const res = await getAllOrders(params);
      if (res.success) {
        setOrders(res.data || []);
        setPagination(res.pagination || null);
      } else {
        setError(res.message || "Failed to fetch orders.");
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError("Failed to communicate with order API server.");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    search,
    statusFilter,
    paymentStatusFilter,
    paymentMethodFilter,
  ]);

  useEffect(() => {
    fetchOrdersList();
  }, [fetchOrdersList]);

  // Keep searchInput in sync if URL searchParam changes externally
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

  const formatOrderDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatOrderTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const hasActiveFilters = Boolean(
    search || statusFilter || paymentStatusFilter || paymentMethodFilter,
  );

  return (
    <div className="admin-orders-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Order Management</h1>
          <p className="admin-page-subtitle">
            Track customer orders, update delivery status, and manage refunds
          </p>
        </div>

        {pagination && pagination.totalOrders !== undefined && (
          <div className="admin-orders-header-stat d-none d-sm-flex align-items-center">
            <div className="admin-orders-stat-badge">
              <i className="fa-solid fa-boxes-stacked"></i>
              <span>
                {pagination.totalOrders}{" "}
                {pagination.totalOrders === 1 ? "Order" : "Orders"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="admin-orders-toolbar">
        <form onSubmit={handleSearchSubmit} className="admin-orders-search">
          <i className="fa-solid fa-magnifying-glass admin-orders-search-icon"></i>
          <input
            type="text"
            className="form-control admin-orders-search-input"
            placeholder="Search by Order #, customer name, phone..."
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
              aria-label="Clear search text"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </form>

        <div className="admin-orders-filters">
          <div className="admin-orders-filter-select-wrapper">
            <select
              className="form-select admin-orders-select"
              value={statusFilter}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              aria-label="Filter by order status"
            >
              <option value="">All Order Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="admin-orders-filter-select-wrapper">
            <select
              className="form-select admin-orders-select"
              value={paymentStatusFilter}
              onChange={(e) =>
                handleFilterChange("payment_status", e.target.value)
              }
              aria-label="Filter by payment status"
            >
              <option value="">All Payment Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="admin-orders-filter-select-wrapper">
            <select
              className="form-select admin-orders-select"
              value={paymentMethodFilter}
              onChange={(e) =>
                handleFilterChange("payment_method", e.target.value)
              }
              aria-label="Filter by payment method"
            >
              <option value="">All Methods</option>
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="online">Online (Razorpay)</option>
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
        <div className="alert alert-danger admin-orders-error-alert d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation fs-5"></i>
            <span>{error}</span>
          </div>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={fetchOrdersList}
          >
            <i className="fa-solid fa-rotate-right me-1"></i> Retry
          </button>
        </div>
      )}

      {/* Orders Container Card */}
      <div className="admin-card admin-orders-card">
        {/* Desktop & Tablet Table (Hidden on small mobile) */}
        <div className="admin-table-container admin-orders-table-wrapper d-none d-md-block">
          <table className="admin-table admin-orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date & Time</th>
                <th>Method</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Total Amount</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={8} cols={8} />
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="admin-orders-empty-state">
                      <div className="admin-orders-empty-icon">
                        <i className="fa-solid fa-bag-shopping"></i>
                      </div>
                      <h3 className="admin-orders-empty-title">
                        No orders found
                      </h3>
                      <p className="admin-orders-empty-desc">
                        {hasActiveFilters
                          ? "No orders match your current search criteria or active filters."
                          : "There are no customer orders recorded in the system yet."}
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm mt-2"
                          onClick={handleClearAllFilters}
                        >
                          <i className="fa-solid fa-filter-circle-xmark me-1"></i>{" "}
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const customerName =
                    order.shipping_name || order.user?.name || "Guest Customer";
                  const customerContact =
                    order.user?.email || order.shipping_phone || "";
                  const initial = customerName.charAt(0).toUpperCase();

                  return (
                    <tr key={order.order_id} className="admin-order-row">
                      <td>
                        <Link
                          to={`/admin/orders/${order.order_id}`}
                          className="admin-order-id-link"
                        >
                          #{order.order_number}
                        </Link>
                      </td>
                      <td>
                        <div className="admin-order-customer">
                          <div className="admin-order-customer-avatar">
                            {initial}
                          </div>
                          <div className="admin-order-customer-info">
                            <span className="admin-order-customer-name">
                              {customerName}
                            </span>
                            {customerContact && (
                              <span className="admin-order-customer-contact">
                                {customerContact}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-order-datetime">
                          <span className="admin-order-date">
                            {formatOrderDate(
                              order.createdAt || order.created_at,
                            )}
                          </span>
                          <span className="admin-order-time">
                            {formatOrderTime(
                              order.createdAt || order.created_at,
                            )}
                          </span>
                        </div>
                      </td>
                      <td>
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
                          {order.payment_method === "cod" ? "COD" : "Razorpay"}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={order.payment_status} />
                      </td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td>
                        <span className="admin-order-total-amount">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </td>
                      <td className="text-end">
                        <Link
                          to={`/admin/orders/${order.order_id}`}
                          className="btn btn-sm admin-order-view-btn"
                        >
                          <span>View</span>
                          <i className="fa-solid fa-arrow-right ms-1"></i>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (Visible on screens < 768px) */}
        <div className="admin-orders-mobile-list d-md-none">
          {loading ? (
            <div className="p-3">
              <TableSkeleton rows={4} cols={1} />
            </div>
          ) : orders.length === 0 ? (
            <div className="admin-orders-empty-state p-4">
              <div className="admin-orders-empty-icon">
                <i className="fa-solid fa-bag-shopping"></i>
              </div>
              <h3 className="admin-orders-empty-title">No orders found</h3>
              <p className="admin-orders-empty-desc">
                {hasActiveFilters
                  ? "No orders match your current search or active filters."
                  : "There are no customer orders recorded yet."}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm mt-2"
                  onClick={handleClearAllFilters}
                >
                  <i className="fa-solid fa-filter-circle-xmark me-1"></i> Clear
                  Filters
                </button>
              )}
            </div>
          ) : (
            orders.map((order) => {
              const customerName =
                order.shipping_name || order.user?.name || "Guest Customer";
              const customerContact =
                order.user?.email || order.shipping_phone || "";
              const initial = customerName.charAt(0).toUpperCase();

              return (
                <div key={order.order_id} className="admin-order-mobile-card">
                  {/* Card Header: Order # + Status Badge */}
                  <div className="admin-order-mobile-card-header">
                    <Link
                      to={`/admin/orders/${order.order_id}`}
                      className="admin-order-id-link"
                    >
                      #{order.order_number}
                    </Link>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Customer Identity */}
                  <div className="admin-order-mobile-customer">
                    <div className="admin-order-customer-avatar">{initial}</div>
                    <div className="admin-order-customer-info">
                      <span className="admin-order-customer-name">
                        {customerName}
                      </span>
                      {customerContact && (
                        <span className="admin-order-customer-contact">
                          {customerContact}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meta Details Grid */}
                  <div className="admin-order-mobile-details-grid">
                    <div className="admin-order-mobile-detail-item">
                      <span className="admin-order-detail-label">
                        Date & Time
                      </span>
                      <span className="admin-order-detail-value">
                        {formatOrderDate(order.createdAt || order.created_at)} •{" "}
                        {formatOrderTime(order.createdAt || order.created_at)}
                      </span>
                    </div>
                    <div className="admin-order-mobile-detail-item">
                      <span className="admin-order-detail-label">Payment</span>
                      <div className="d-flex align-items-center gap-1 flex-wrap">
                        <span
                          className={`admin-order-method-badge ${order.payment_method === "cod" ? "cod" : "online"}`}
                        >
                          {order.payment_method === "cod" ? "COD" : "Razorpay"}
                        </span>
                        <StatusBadge status={order.payment_status} />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="admin-order-mobile-card-footer">
                    <div className="admin-order-mobile-total">
                      <span className="admin-order-mobile-total-label">
                        Total Amount
                      </span>
                      <span className="admin-order-mobile-total-val">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                    <Link
                      to={`/admin/orders/${order.order_id}`}
                      className="btn btn-sm admin-order-view-btn"
                    >
                      <span>View Order</span>
                      <i className="fa-solid fa-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Section */}
        {pagination && (
          <div className="admin-orders-pagination-wrapper">
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
