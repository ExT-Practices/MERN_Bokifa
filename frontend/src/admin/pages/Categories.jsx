import React, { useState, useEffect } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categoryApi";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import ToastContainer from "../components/ToastContainer";
import TableSkeleton from "../components/SkeletonLoader";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Create/Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryActive, setCategoryActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Confirm Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast notifications
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

  // Fetch Categories List
  const fetchCategoryList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCategories({ include_inactive: true });
      if (res.success) {
        setCategories(res.data || []);
      } else {
        setError(res.message || "Failed to load categories.");
      }
    } catch (err) {
      console.error("Fetch categories error:", err);
      setError("Failed to communicate with backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryList();
  }, []);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryActive(true);
    setFormError("");
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name || "");
    setCategoryActive(cat.is_active !== undefined ? cat.is_active : true);
    setFormError("");
    setModalOpen(true);
  };

  // Save Category (Create or Edit)
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!categoryName.trim()) {
      setFormError("Category name is required.");
      return;
    }

    setSaving(true);
    try {
      let res;
      if (editingCategory) {
        res = await updateCategory(editingCategory.category_id, {
          name: categoryName.trim(),
          is_active: categoryActive,
        });
      } else {
        res = await createCategory({ name: categoryName.trim() });
      }

      if (res.success) {
        addToast(
          `Category "${categoryName}" ${
            editingCategory ? "updated" : "created"
          } successfully.`,
          "success"
        );
        setModalOpen(false);
        fetchCategoryList();
      } else {
        setFormError(res.message || "Operation failed.");
      }
    } catch (err) {
      console.error("Save category error:", err);
      setFormError(
        err.response?.data?.message || "Failed to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  // Open Confirm Deactivate Modal
  const handleOpenDelete = (cat) => {
    setSelectedForDelete(cat);
    setDeleteModalOpen(true);
  };

  // Confirm Deactivate
  const handleConfirmDelete = async () => {
    if (!selectedForDelete) return;
    setDeleting(true);
    try {
      const res = await deleteCategory(selectedForDelete.category_id);
      if (res.success) {
        addToast(
          `Category "${selectedForDelete.name}" deactivated successfully.`,
          "success"
        );
        fetchCategoryList();
      } else {
        addToast(res.message || "Failed to deactivate category.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to deactivate category.", "error");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setSelectedForDelete(null);
    }
  };

  // Toggle Category Status directly
  const handleToggleCategoryStatus = async (cat) => {
    const newStatus = !cat.is_active;
    try {
      const res = await updateCategory(cat.category_id, {
        is_active: newStatus,
      });
      if (res.success) {
        addToast(
          `Category "${cat.name}" is now ${newStatus ? "Active" : "Inactive"}.`,
          "success"
        );
        fetchCategoryList();
      } else {
        addToast(res.message || "Failed to update category status.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to update category status.", "error");
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Deactivate Category"
        message={`Are you sure you want to deactivate category "${selectedForDelete?.name}"?`}
        confirmText="Deactivate"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />

      {/* Category Create/Edit Modal */}
      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-bottom d-flex align-items-center justify-content-between">
              <h5 className="m-0 font-weight-bold text-dark">
                {editingCategory ? `Edit Category #${editingCategory.category_id}` : "Add New Category"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setModalOpen(false)}
              ></button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div className="p-4">
                {formError && (
                  <div className="alert alert-danger small mb-3">{formError}</div>
                )}

                <div className="mb-3">
                  <label className="form-label font-weight-bold text-dark">
                    Category Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Science Fiction"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  />
                </div>

                {editingCategory && (
                  <div className="form-check form-switch pt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="catActiveSwitch"
                      checked={categoryActive}
                      onChange={(e) => setCategoryActive(e.target.checked)}
                    />
                    <label className="form-check-label font-weight-bold text-dark ms-2" htmlFor="catActiveSwitch">
                      Active Status
                    </label>
                  </div>
                )}
              </div>

              <div className="p-3 bg-light d-flex justify-content-end gap-2 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 font-weight-bold"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : editingCategory ? (
                    "Update Category"
                  ) : (
                    "Create Category"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Category Management</h1>
          <p className="admin-page-subtitle">
            Organize bookstore catalog categories for fiction, non-fiction, new releases, etc.
          </p>
        </div>
        <div>
          <button
            className="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm font-weight-bold"
            onClick={handleOpenCreate}
          >
            <i className="fa-solid fa-plus"></i> Add New Category
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-group">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            className="form-control"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <button
            className="btn btn-outline-secondary"
            onClick={() => setSearchTerm("")}
          >
            Clear Search
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between mb-4">
          <div>
            <i className="fa-solid fa-triangle-exclamation me-2"></i>
            {error}
          </div>
          <button className="btn btn-sm btn-outline-danger" onClick={fetchCategoryList}>
            Retry
          </button>
        </div>
      )}

      {/* Category Table */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category Name</th>
                <th>Status</th>
                <th>Created Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={5} cols={5} />
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.category_id}>
                    <td className="fw-bold text-secondary">#{cat.category_id}</td>
                    <td>
                      <div className="fw-bold text-dark">{cat.name}</div>
                    </td>
                    <td>
                      <StatusBadge status={cat.is_active} />
                    </td>
                    <td className="text-muted small">
                      {cat.createdAt || cat.created_at
                        ? new Date(cat.createdAt || cat.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          title="Edit Category Name"
                          onClick={() => handleOpenEdit(cat)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>

                        <button
                          type="button"
                          className={`btn ${
                            cat.is_active ? "btn-outline-warning" : "btn-outline-success"
                          }`}
                          title={cat.is_active ? "Deactivate" : "Activate"}
                          onClick={() => handleToggleCategoryStatus(cat)}
                        >
                          <i
                            className={`fa-solid ${
                              cat.is_active ? "fa-eye-slash" : "fa-eye"
                            }`}
                          ></i>
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          title="Deactivate Category"
                          onClick={() => handleOpenDelete(cat)}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories;
