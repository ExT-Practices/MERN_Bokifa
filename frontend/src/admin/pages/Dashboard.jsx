import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminStats } from "../../api/dashboardApi";
import { getAllOrders } from "../../api/orderApi";
import { getAllUsers } from "../../api/userApi";
import StatusBadge from "../components/StatusBadge";
import { CardSkeleton, TableSkeleton } from "../components/SkeletonLoader";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setError(null);
    setLoadingStats(true);
    setLoadingOrders(true);
    setLoadingUsers(true);

    try {
      // Fetch Stats
      const statsRes = await getAdminStats();
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
      setError("Failed to fetch dashboard statistics from the server.");
    } finally {
      setLoadingStats(false);
    }

    try {
      // Fetch Recent Orders
      const ordersRes = await getAllOrders({ page: 1, limit: 5 });
      if (ordersRes.success) {
        setRecentOrders(ordersRes.data || []);
      }
    } catch (err) {
      console.error("Failed to load recent orders:", err);
    } finally {
      setLoadingOrders(false);
    }

    try {
      // Fetch Recent Users
      const usersRes = await getAllUsers({ page: 1, limit: 5 });
      if (usersRes.success) {
        setRecentUsers(usersRes.data || []);
      }
    } catch (err) {
      console.error("Failed to load recent users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Admin Dashboard</h1>
          <p className="admin-page-subtitle">
            Overview of Bokifa bookstore performance, orders, and user metrics
          </p>
        </div>
        <div>
          <button
            className="btn btn-white btn-outline-secondary shadow-sm d-inline-flex align-items-center gap-2"
            onClick={fetchDashboardData}
            disabled={loadingStats}
          >
            <i className={`fa-solid fa-arrows-rotate ${loadingStats ? "fa-spin" : ""}`}></i>
            Refresh Data
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between mb-4">
          <div>
            <i className="fa-solid fa-triangle-exclamation me-2"></i>
            {error}
          </div>
          <button className="btn btn-sm btn-outline-danger" onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          {loadingStats ? (
            <CardSkeleton />
          ) : (
            <div className="stat-card">
              <div>
                <div className="stat-title">Total Revenue</div>
                <div className="stat-value text-success">
                  {formatCurrency(stats?.totalRevenue)}
                </div>
              </div>
              <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success">
                <i className="fa-solid fa-indian-rupee-sign"></i>
              </div>
            </div>
          )}
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          {loadingStats ? (
            <CardSkeleton />
          ) : (
            <div className="stat-card">
              <div>
                <div className="stat-title">Total Orders</div>
                <div className="stat-value">{stats?.totalOrders || 0}</div>
              </div>
              <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary">
                <i className="fa-solid fa-bag-shopping"></i>
              </div>
            </div>
          )}
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          {loadingStats ? (
            <CardSkeleton />
          ) : (
            <div className="stat-card">
              <div>
                <div className="stat-title">Pending Orders</div>
                <div className="stat-value text-warning">
                  {stats?.pendingOrders || 0}
                </div>
              </div>
              <div className="stat-icon-wrapper bg-warning bg-opacity-10 text-warning">
                <i className="fa-solid fa-clock"></i>
              </div>
            </div>
          )}
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          {loadingStats ? (
            <CardSkeleton />
          ) : (
            <div className="stat-card">
              <div>
                <div className="stat-title">Delivered Orders</div>
                <div className="stat-value text-info">
                  {stats?.deliveredOrders || 0}
                </div>
              </div>
              <div className="stat-icon-wrapper bg-info bg-opacity-10 text-info">
                <i className="fa-solid fa-box-open"></i>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Metrics Breakdown */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white border rounded-3 text-center">
            <small className="text-muted text-uppercase fw-bold" style={{ fontSize: "0.7rem" }}>Processing</small>
            <h4 className="fw-bold m-0 mt-1">{stats?.processingOrders || 0}</h4>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white border rounded-3 text-center">
            <small className="text-muted text-uppercase fw-bold" style={{ fontSize: "0.7rem" }}>Shipped</small>
            <h4 className="fw-bold m-0 mt-1">{stats?.shippedOrders || 0}</h4>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white border rounded-3 text-center">
            <small className="text-muted text-uppercase fw-bold" style={{ fontSize: "0.7rem" }}>Cancelled</small>
            <h4 className="fw-bold m-0 mt-1 text-danger">{stats?.cancelledOrders || 0}</h4>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white border rounded-3 text-center">
            <small className="text-muted text-uppercase fw-bold" style={{ fontSize: "0.7rem" }}>Paid Online</small>
            <h4 className="fw-bold m-0 mt-1 text-success">{stats?.paidOrders || 0}</h4>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Recent Users */}
      <div className="row g-4">
        {/* Recent Orders Widget */}
        <div className="col-12 col-lg-8">
          <div className="admin-card mb-0">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Recent Orders</h2>
              <Link to="/admin/orders" className="btn btn-sm btn-link text-decoration-none">
                View All Orders <i className="fa-solid fa-arrow-right ms-1"></i>
              </Link>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOrders ? (
                    <TableSkeleton rows={4} cols={7} />
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.order_id}>
                        <td>
                          <span className="fw-bold text-primary">#{order.order_number}</span>
                        </td>
                        <td>
                          <div className="fw-semibold">{order.shipping_name || order.user?.name || "Customer"}</div>
                          <small className="text-muted d-block">{order.user?.email || ""}</small>
                        </td>
                        <td className="text-muted small">
                          {new Date(order.createdAt || order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="fw-bold">{formatCurrency(order.total_amount)}</td>
                        <td>
                          <StatusBadge status={order.payment_status} />
                        </td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                        <td>
                          <Link
                            to={`/admin/orders/${order.order_id}`}
                            className="btn btn-sm btn-light border text-primary"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Customers Widget */}
        <div className="col-12 col-lg-4">
          <div className="admin-card mb-0">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Recent Customers</h2>
              <Link to="/admin/users" className="btn btn-sm btn-link text-decoration-none">
                View All
              </Link>
            </div>
            <div className="admin-card-body p-0">
              <ul className="list-group list-group-flush">
                {loadingUsers ? (
                  <div className="p-3">
                    <div className="placeholder-glow mb-3">
                      <span className="placeholder col-12 rounded py-3"></span>
                    </div>
                    <div className="placeholder-glow">
                      <span className="placeholder col-12 rounded py-3"></span>
                    </div>
                  </div>
                ) : recentUsers.length === 0 ? (
                  <li className="list-group-item text-center py-4 text-muted small">
                    No users registered yet.
                  </li>
                ) : (
                  recentUsers.map((user) => (
                    <li key={user.id} className="list-group-item d-flex align-items-center justify-content-between p-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-sm rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: "36px", height: "36px" }}>
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark small">{user.name}</div>
                          <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>{user.email}</small>
                        </div>
                      </div>
                      <Link to={`/admin/users/${user.id}`} className="btn btn-sm btn-outline-secondary py-1 px-2" style={{ fontSize: "0.75rem" }}>
                        View
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
