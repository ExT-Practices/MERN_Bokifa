import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getAdminUserById,
  getAdminUserOrders,
  updateUserStatus,
} from "../../api/userApi";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import ToastContainer from "../components/ToastContainer";

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);

  // Status modal & action states
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
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

  const fetchUserData = async () => {
    setLoadingUser(true);
    setLoadingOrders(true);
    setError(null);

    // Fetch User Info
    try {
      const userRes = await getAdminUserById(id);
      if (userRes.success && userRes.data) {
        setUser(userRes.data);
      } else {
        setError(userRes.message || "User not found.");
      }
    } catch (err) {
      console.error("Fetch user error:", err);
      setError("Failed to fetch user details.");
    } finally {
      setLoadingUser(false);
    }

    // Fetch User Orders
    try {
      const ordersRes = await getAdminUserOrders(id);
      if (ordersRes.success) {
        setOrders(ordersRes.data || []);
      }
    } catch (err) {
      console.error("Fetch user orders error:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [id]);

  // Toggle user active status
  const handleConfirmToggleStatus = async () => {
    if (!user) return;
    const nextStatus = !user.is_active;

    setUpdatingStatus(true);
    try {
      const res = await updateUserStatus(user.id, nextStatus);
      if (res.success) {
        addToast(
          `User account ${nextStatus ? "activated" : "deactivated"} successfully.`,
          "success"
        );
        fetchUserData();
      } else {
        addToast(res.message || "Failed to update user status.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast(
        err.response?.data?.message || "Failed to update status.",
        "error"
      );
    } finally {
      setUpdatingStatus(false);
      setStatusModalOpen(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  if (loadingUser) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading user profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="alert alert-danger my-4 p-4 text-center">
        <i className="fa-solid fa-user-slash fs-3 mb-2 d-block"></i>
        <h5>User Not Found</h5>
        <p>{error || "The requested user account does not exist."}</p>
        <Link to="/admin/users" className="btn btn-outline-danger">
          Back to Users List
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <ConfirmModal
        isOpen={statusModalOpen}
        title={user.is_active ? "Deactivate User Account" : "Activate User Account"}
        message={`Are you sure you want to ${
          user.is_active ? "deactivate" : "activate"
        } account for "${user.name}" (${user.email})?`}
        confirmText={user.is_active ? "Deactivate Account" : "Activate Account"}
        confirmVariant={user.is_active ? "danger" : "success"}
        loading={updatingStatus}
        onConfirm={handleConfirmToggleStatus}
        onClose={() => setStatusModalOpen(false)}
      />

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customer Profile #{user.id}</h1>
          <p className="admin-page-subtitle">
            User details, status management, and complete purchase history
          </p>
        </div>
        <div>
          <Link to="/admin/users" className="btn btn-outline-secondary">
            <i className="fa-solid fa-arrow-left me-1"></i> Back to Users List
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* User Card */}
        <div className="col-12 col-lg-4">
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">User Account Details</h2>
            </div>
            <div className="admin-card-body">
              <div className="text-center pb-3 border-bottom mb-3">
                <div
                  className="avatar-lg rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-bold fs-3 mb-2 shadow-sm"
                  style={{ width: "64px", height: "64px" }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <h4 className="fw-bold text-dark mb-1">{user.name}</h4>
                <p className="text-muted small m-0">{user.email}</p>

                <div className="d-flex align-items-center justify-content-center gap-2 mt-3">
                  <StatusBadge status={user.role} />
                  <StatusBadge status={user.is_active !== undefined ? user.is_active : true} />
                </div>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "0.7rem" }}>
                  Registration Date
                </small>
                <div className="fw-semibold text-dark">
                  {user.createdAt || user.created_at
                    ? new Date(user.createdAt || user.created_at).toLocaleString("en-IN", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })
                    : "—"}
                </div>
              </div>

              <div className="mb-4">
                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "0.7rem" }}>
                  Total Placed Orders
                </small>
                <div className="fw-bold fs-5 text-primary">{orders.length} orders</div>
              </div>

              <button
                type="button"
                className={`btn w-100 font-weight-bold ${
                  user.is_active ? "btn-outline-danger" : "btn-outline-success"
                }`}
                onClick={() => setStatusModalOpen(true)}
              >
                <i className={`fa-solid ${user.is_active ? "fa-user-xmark" : "fa-user-check"} me-2`}></i>
                {user.is_active ? "Deactivate User Account" : "Activate User Account"}
              </button>
            </div>
          </div>
        </div>

        {/* User Order History */}
        <div className="col-12 col-lg-8">
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Order History ({orders.length})</h2>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th>Order Status</th>
                    <th>Total</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOrders ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                        Fetching user order history...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        This user has not placed any orders yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.order_id}>
                        <td>
                          <Link
                            to={`/admin/orders/${order.order_id}`}
                            className="fw-bold text-primary text-decoration-none"
                          >
                            #{order.order_number}
                          </Link>
                        </td>
                        <td className="text-muted small">
                          {new Date(order.created_at || order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="small">
                          {order.items?.length || 0} item(s)
                        </td>
                        <td>
                          <StatusBadge status={order.payment_status} />
                        </td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="fw-bold">{formatCurrency(order.total_amount)}</td>
                        <td className="text-end">
                          <Link
                            to={`/admin/orders/${order.order_id}`}
                            className="btn btn-sm btn-light border text-primary"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
