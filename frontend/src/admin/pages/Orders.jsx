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
  }, [currentPage, search, statusFilter, paymentStatusFilter, paymentMethodFilter]);

  useEffect(() => {
    fetchOrdersList();
  }, [fetchOrdersList]);

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

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Order Management</h1>
          <p className="admin-page-subtitle">
            Track customer orders, update delivery status, and manage refunds
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-input-group">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            className="form-control"
            placeholder="Search by Order #, customer name, phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "150px" }}
            value={statusFilter}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Status Filter */}
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "150px" }}
            value={paymentStatusFilter}
            onChange={(e) => handleFilterChange("payment_status", e.target.value)}
          >
            <option value="">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>

          {/* Payment Method Filter */}
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "140px" }}
            value={paymentMethodFilter}
            onChange={(e) => handleFilterChange("payment_method", e.target.value)}
          >
            <option value="">All Methods</option>
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="online">Online (Razorpay)</option>
          </select>

          {(search || statusFilter || paymentStatusFilter || paymentMethodFilter) && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setSearchInput("");
                setSearchParams({});
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between mb-4">
          <div>
            <i className="fa-solid fa-triangle-exclamation me-2"></i>
            {error}
          </div>
          <button className="btn btn-sm btn-outline-danger" onClick={fetchOrdersList}>
            Retry
          </button>
        </div>
      )}

      {/* Orders Data Table */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer Name</th>
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
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <i className="fa-solid fa-cart-flatbed fs-2 mb-3 d-block text-secondary"></i>
                    No orders matching your search or filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.order_id}>
                    <td>
                      <Link
                        to={`/admin/orders/${order.order_id}`}
                        className="fw-bold text-primary text-decoration-none hover-primary"
                      >
                        #{order.order_number}
                      </Link>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">
                        {order.shipping_name || order.user?.name || "Guest Customer"}
                      </div>
                      <small className="text-muted d-block">{order.user?.email || order.shipping_phone || ""}</small>
                    </td>
                    <td className="text-muted small">
                      {new Date(order.createdAt || order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {order.payment_method === "cod" ? "COD" : "Razorpay Online"}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={order.payment_status} />
                    </td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>
                      <div className="fw-bold">{formatCurrency(order.total_amount)}</div>
                    </td>
                    <td className="text-end">
                      <Link
                        to={`/admin/orders/${order.order_id}`}
                        className="btn btn-sm btn-outline-primary fw-semibold px-3"
                      >
                        View Order
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="p-3">
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
