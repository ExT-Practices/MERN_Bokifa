import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAllUsers, updateUserStatus } from "../../api/userApi";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";
import ToastContainer from "../components/ToastContainer";
import TableSkeleton from "../components/SkeletonLoader";

const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const roleFilter = searchParams.get("role") || "";

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search input state
  const [searchInput, setSearchInput] = useState(search);

  // Modal & Toast states
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchUsersList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 10,
      };
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;

      const res = await getAllUsers(params);
      if (res.success) {
        setUsers(res.data || []);
        setPagination(res.pagination || null);
      } else {
        setError(res.message || "Failed to fetch users.");
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      setError("Failed to communicate with user API server.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, roleFilter]);

  useEffect(() => {
    fetchUsersList();
  }, [fetchUsersList]);

  // Search submit
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

  // Role filter change
  const handleRoleChange = (role) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", "1");
    if (role) {
      newParams.set("role", role);
    } else {
      newParams.delete("role");
    }
    setSearchParams(newParams);
  };

  // Page change
  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  // Open status modal
  const handleOpenStatusModal = (user) => {
    setSelectedUser(user);
    setStatusModalOpen(true);
  };

  // Confirm Status Toggle
  const handleConfirmStatusToggle = async () => {
    if (!selectedUser) return;
    const nextStatus = !selectedUser.is_active;

    setUpdating(true);
    try {
      const res = await updateUserStatus(selectedUser.id, nextStatus);
      if (res.success) {
        addToast(
          `User "${selectedUser.name}" ${nextStatus ? "activated" : "deactivated"} successfully.`,
          "success"
        );
        fetchUsersList();
      } else {
        addToast(res.message || "Failed to update user status.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast(
        err.response?.data?.message || "Failed to update user status.",
        "error"
      );
    } finally {
      setUpdating(false);
      setStatusModalOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <ConfirmModal
        isOpen={statusModalOpen}
        title={selectedUser?.is_active ? "Deactivate User Account" : "Activate User Account"}
        message={`Are you sure you want to ${
          selectedUser?.is_active ? "deactivate" : "activate"
        } account for "${selectedUser?.name}" (${selectedUser?.email})?`}
        confirmText={selectedUser?.is_active ? "Deactivate" : "Activate"}
        confirmVariant={selectedUser?.is_active ? "danger" : "success"}
        loading={updating}
        onConfirm={handleConfirmStatusToggle}
        onClose={() => setStatusModalOpen(false)}
      />

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">User Management</h1>
          <p className="admin-page-subtitle">
            View registered customer accounts and toggle active account status
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-input-group">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            className="form-control"
            placeholder="Search by customer name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "140px" }}
            value={roleFilter}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          {(search || roleFilter) && (
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
          <button className="btn btn-sm btn-outline-danger" onClick={fetchUsersList}>
            Retry
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name & Email</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Registered Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={8} cols={6} />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No registered users match your filter.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-bold text-secondary">#{u.id}</td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-sm rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: "38px", height: "38px" }}>
                          {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <Link
                            to={`/admin/users/${u.id}`}
                            className="fw-bold text-dark text-decoration-none hover-primary d-block"
                          >
                            {u.name}
                          </Link>
                          <small className="text-muted">{u.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={u.role} />
                    </td>
                    <td>
                      <StatusBadge status={u.is_active !== undefined ? u.is_active : true} />
                    </td>
                    <td className="text-muted small">
                      {u.createdAt || u.created_at
                        ? new Date(u.createdAt || u.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/admin/users/${u.id}`}
                          className="btn btn-outline-secondary"
                          title="View Profile & Orders"
                        >
                          <i className="fa-solid fa-eye me-1"></i> Details
                        </Link>

                        <button
                          type="button"
                          className={`btn ${
                            u.is_active ? "btn-outline-danger" : "btn-outline-success"
                          }`}
                          title={u.is_active ? "Deactivate" : "Activate"}
                          onClick={() => handleOpenStatusModal(u)}
                        >
                          <i
                            className={`fa-solid ${
                              u.is_active ? "fa-user-xmark" : "fa-user-check"
                            }`}
                          ></i>
                        </button>
                      </div>
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

export default Users;
