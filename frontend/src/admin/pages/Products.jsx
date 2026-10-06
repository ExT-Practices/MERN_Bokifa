import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts, deleteProduct, updateProduct } from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";
import ToastContainer from "../components/ToastContainer";
import TableSkeleton from "../components/SkeletonLoader";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category_id") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search input state
  const [searchInput, setSearchInput] = useState(search);

  // Modal & Toast states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
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

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories({ include_inactive: true });
        if (res.success) {
          setCategories(res.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products
  const fetchProductsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        include_inactive: "true",
      };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category_id = selectedCategory;

      const response = await getProducts(params);
      if (response.success) {
        setProducts(response.data || []);
        setPagination(response.pagination || null);
      } else {
        setError(response.message || "Failed to load products.");
      }
    } catch (err) {
      console.error("Fetch products error:", err);
      setError("Failed to communicate with backend API.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, selectedCategory]);

  useEffect(() => {
    fetchProductsList();
  }, [fetchProductsList]);

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

  // Handle Category filter change
  const handleCategoryChange = (catId) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", "1");
    if (catId) {
      newParams.set("category_id", catId);
    } else {
      newParams.delete("category_id");
    }
    setSearchParams(newParams);
  };

  // Handle Page change
  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  // Confirm delete product
  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    setActionLoading(true);
    try {
      const res = await deleteProduct(selectedProduct.product_id);
      if (res.success) {
        addToast(`Product "${selectedProduct.title}" deactivated successfully.`, "success");
        fetchProductsList();
      } else {
        addToast(res.message || "Failed to delete product.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error deactivating product.", "error");
    } finally {
      setActionLoading(false);
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    }
  };

  // Toggle Active/Inactive
  const handleToggleStatus = async (product) => {
    const newStatus = !product.is_active;
    const formData = new FormData();
    formData.append("is_active", newStatus);

    try {
      const res = await updateProduct(product.product_id, formData);
      if (res.success) {
        addToast(
          `Product "${product.title}" is now ${newStatus ? "Active" : "Inactive"}.`,
          "success"
        );
        fetchProductsList();
      } else {
        addToast(res.message || "Status update failed.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to update product status.", "error");
    }
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
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Deactivate Product"
        message={`Are you sure you want to deactivate "${selectedProduct?.title}"? It will no longer appear in the customer shop.`}
        confirmText="Deactivate"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products Management</h1>
          <p className="admin-page-subtitle">
            Manage bookstore inventory, prices, SKU, categories, and availability
          </p>
        </div>
        <div>
          <Link
            to="/admin/products/new"
            className="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm font-weight-bold"
          >
            <i className="fa-solid fa-plus"></i> Add New Product
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-input-group">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            className="form-control"
            placeholder="Search by title, author, SKU..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "180px" }}
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </option>
            ))}
          </select>

          {(search || selectedCategory) && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setSearchInput("");
                setSearchParams({});
              }}
            >
              <i className="fa-solid fa-xmark me-1"></i> Clear Filters
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
          <button className="btn btn-sm btn-outline-danger" onClick={fetchProductsList}>
            Retry
          </button>
        </div>
      )}

      {/* Products Data Table */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Author</th>
                <th>Categories</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={8} cols={8} />
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <i className="fa-solid fa-book-open fs-2 mb-3 d-block text-secondary"></i>
                    No products found matching your search or filters.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.product_id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image.startsWith("http") ? product.image : `http://localhost:5000${product.image}`}
                            alt={product.title}
                            className="rounded border object-fit-cover"
                            style={{ width: "42px", height: "54px" }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/42x54?text=Book";
                            }}
                          />
                        ) : (
                          <div
                            className="rounded border bg-light d-flex align-items-center justify-content-center text-muted"
                            style={{ width: "42px", height: "54px" }}
                          >
                            <i className="fa-solid fa-book"></i>
                          </div>
                        )}
                        <div>
                          <Link
                            to={`/admin/products/${product.product_id}`}
                            className="fw-bold text-dark text-decoration-none hover-primary d-block"
                            style={{ maxWidth: "240px" }}
                          >
                            {product.title}
                          </Link>
                          <small className="text-muted">ID: #{product.product_id}</small>
                        </div>
                      </div>
                    </td>
                    <td>{product.author || "—"}</td>
                    <td>
                      {product.categories && product.categories.length > 0 ? (
                        product.categories.map((c) => (
                          <span key={c.category_id} className="badge bg-light text-dark border me-1">
                            {c.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td>
                      <code className="text-dark small">{product.sku || "N/A"}</code>
                    </td>
                    <td>
                      <div className="fw-bold">{formatCurrency(product.price)}</div>
                      {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                        <small className="text-muted text-decoration-line-through">
                          {formatCurrency(product.compare_price)}
                        </small>
                      )}
                    </td>
                    <td>
                      <span
                        className={`fw-bold ${
                          product.stock_quantity <= 5
                            ? "text-danger"
                            : product.stock_quantity <= 15
                            ? "text-warning"
                            : "text-success"
                        }`}
                      >
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={product.is_active} />
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/admin/products/${product.product_id}`}
                          className="btn btn-outline-secondary"
                          title="Edit Product"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </Link>

                        <button
                          type="button"
                          className={`btn ${
                            product.is_active
                              ? "btn-outline-warning"
                              : "btn-outline-success"
                          }`}
                          title={product.is_active ? "Deactivate" : "Activate"}
                          onClick={() => handleToggleStatus(product)}
                        >
                          <i
                            className={`fa-solid ${
                              product.is_active ? "fa-eye-slash" : "fa-eye"
                            }`}
                          ></i>
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          title="Soft Delete"
                          onClick={() => handleDeleteClick(product)}
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

        {pagination && (
          <div className="p-3">
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
