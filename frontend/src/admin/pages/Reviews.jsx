import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getAllReviews,
  updateReviewStatus,
  deleteReview,
} from "../../api/reviewApi";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import TableSkeleton from "../components/SkeletonLoader";
import ConfirmModal from "../components/ConfirmModal";
import ToastContainer from "../components/ToastContainer";

const Reviews = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const ratingFilter = searchParams.get("rating") || "";

  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search input state
  const [searchInput, setSearchInput] = useState(search);

  // Modals & Action state
  const [selectedReview, setSelectedReview] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

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

  const fetchReviewsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 10,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (ratingFilter) params.rating = ratingFilter;

      const res = await getAllReviews(params);
      if (res.success) {
        setReviews(res.data || []);
        setPagination(res.pagination || null);
      } else {
        setError(res.message || "Failed to fetch reviews.");
      }
    } catch (err) {
      console.error("Fetch reviews error:", err);
      setError("Failed to communicate with review API server.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, ratingFilter]);

  useEffect(() => {
    fetchReviewsList();
  }, [fetchReviewsList]);

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

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Render Star Icons
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fa-star ${
            i <= rating ? "fa-solid star-gold" : "fa-regular star-gray"
          }`}
          style={{ fontSize: "0.85rem" }}
        ></i>,
      );
    }
    return (
      <span className="rating-stars d-inline-flex align-items-center gap-1">
        {stars}
        <span className="ms-1 fw-bold text-dark small">({rating})</span>
      </span>
    );
  };

  // Change review status
  const handleStatusChange = async (reviewId, newStatus) => {
    setUpdatingStatusId(reviewId);
    try {
      const res = await updateReviewStatus(reviewId, newStatus);
      if (res.success) {
        addToast(
          `Review marked as ${newStatus.toUpperCase()} successfully!`,
          "success",
        );
        if (selectedReview && selectedReview.review_id === reviewId) {
          setSelectedReview((prev) => ({ ...prev, status: newStatus }));
        }
        fetchReviewsList();
      } else {
        addToast(res.message || "Failed to update review status", "error");
      }
    } catch (err) {
      console.error("Status update error:", err);
      addToast(
        err.response?.data?.message || "Failed to update review status",
        "error",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Open delete confirm modal
  const handleInitiateDelete = (review) => {
    setReviewToDelete(review);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    setDeleting(true);
    try {
      const res = await deleteReview(reviewToDelete.review_id);
      if (res.success) {
        addToast("Review deleted successfully!", "success");
        setDeleteModalOpen(false);
        setDetailsModalOpen(false);
        setReviewToDelete(null);
        fetchReviewsList();
      } else {
        addToast(res.message || "Failed to delete review", "error");
      }
    } catch (err) {
      console.error("Delete review error:", err);
      addToast(
        err.response?.data?.message || "Failed to delete review",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenDetails = (review) => {
    setSelectedReview(review);
    setDetailsModalOpen(true);
  };

  const hasActiveFilters = Boolean(search || statusFilter || ratingFilter);

  return (
    <div className="admin-reviews-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title d-flex align-items-center gap-2">
            <i className="fa-solid fa-star text-warning"></i>
            Reviews Management
          </h1>
          <p className="admin-page-subtitle">
            Moderate customer product ratings, manage approvals, and review
            feedback
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-white btn-outline-secondary shadow-sm d-inline-flex align-items-center gap-2"
            onClick={fetchReviewsList}
            disabled={loading}
          >
            <i
              className={`fa-solid fa-arrows-rotate ${loading ? "fa-spin" : ""}`}
            ></i>
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
            placeholder="Search by customer, product, review title..."
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
              value={statusFilter}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              aria-label="Filter by review status"
            >
              <option value="">All Review Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="admin-orders-filter-select-wrapper">
            <select
              className="form-select admin-orders-select"
              value={ratingFilter}
              onChange={(e) => handleFilterChange("rating", e.target.value)}
              aria-label="Filter by star rating"
            >
              <option value="">All Star Ratings</option>
              <option value="5">5 Stars (★★★★★)</option>
              <option value="4">4 Stars (★★★★☆)</option>
              <option value="3">3 Stars (★★★☆☆)</option>
              <option value="2">2 Stars (★★☆☆☆)</option>
              <option value="1">1 Star (★☆☆☆☆)</option>
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
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={fetchReviewsList}
          >
            <i className="fa-solid fa-rotate-right me-1"></i> Retry
          </button>
        </div>
      )}

      {/* Reviews Table Card */}
      <div className="admin-card mb-4">
        <div className="admin-card-header d-flex align-items-center justify-content-between">
          <h2 className="admin-card-title">Customer Feedback & Ratings</h2>
          {pagination && pagination.totalReviews !== undefined && (
            <span
              className="badge bg-light text-dark border px-2 py-1"
              style={{ fontSize: "0.8rem" }}
            >
              {pagination.totalReviews}{" "}
              {pagination.totalReviews === 1 ? "Review" : "Reviews"}
            </span>
          )}
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Rating</th>
                <th>Review Details</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={6} cols={7} />
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                      <i className="fa-regular fa-comment-dots fa-2x mb-2 text-secondary opacity-50"></i>
                      <p className="m-0 fw-semibold">No reviews found.</p>
                      <small className="text-muted">
                        {hasActiveFilters
                          ? "Try adjusting your search criteria."
                          : "Customer reviews and feedback will be listed here."}
                      </small>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((review) => {
                  const isUpdating = updatingStatusId === review.review_id;

                  return (
                    <tr key={review.review_id}>
                      {/* Customer */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold"
                            style={{
                              width: "32px",
                              height: "32px",
                              fontSize: "0.8rem",
                              flexShrink: 0,
                            }}
                          >
                            {review.user?.name
                              ? review.user.name.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                          <div>
                            <div className="fw-semibold text-dark small">
                              {review.user?.name || "Customer"}
                            </div>
                            <small
                              className="text-muted d-block"
                              style={{ fontSize: "0.72rem" }}
                            >
                              {review.user?.email || ""}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* Product */}
                      <td>
                        <div
                          className="d-flex align-items-center gap-2"
                          style={{ maxWidth: "220px" }}
                        >
                          {review.product?.image ? (
                            <img
                              src={review.product.image}
                              alt={review.product.title}
                              className="rounded border"
                              style={{
                                width: "32px",
                                height: "42px",
                                objectFit: "cover",
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div
                              className="rounded border bg-light d-flex align-items-center justify-content-center text-muted"
                              style={{
                                width: "32px",
                                height: "42px",
                                flexShrink: 0,
                              }}
                            >
                              <i
                                className="fa-solid fa-book"
                                style={{ fontSize: "0.8rem" }}
                              ></i>
                            </div>
                          )}
                          <div className="text-truncate">
                            <span className="fw-medium text-dark small d-block text-truncate">
                              {review.product?.title ||
                                `Product #${review.product_id}`}
                            </span>
                            <small
                              className="text-muted"
                              style={{ fontSize: "0.72rem" }}
                            >
                              ID: #{review.product_id}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td>{renderStars(review.rating)}</td>

                      {/* Review Details / Preview */}
                      <td>
                        <div style={{ maxWidth: "260px" }}>
                          {review.title && (
                            <div className="fw-bold text-dark small text-truncate mb-1">
                              {review.title}
                            </div>
                          )}
                          <p
                            className="m-0 text-muted small text-truncate"
                            style={{ fontSize: "0.8rem" }}
                            title={review.comment}
                          >
                            {review.comment}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <StatusBadge status={review.status} />
                      </td>

                      {/* Date */}
                      <td className="text-muted small">
                        {formatDate(review.created_at || review.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="text-end">
                        <div className="d-inline-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-light border text-primary"
                            onClick={() => handleOpenDetails(review)}
                            title="View Complete Review"
                          >
                            <i className="fa-solid fa-eye me-1"></i> View
                          </button>

                          {review.status !== "approved" && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              onClick={() =>
                                handleStatusChange(review.review_id, "approved")
                              }
                              disabled={isUpdating}
                              title="Approve Review"
                            >
                              <i className="fa-solid fa-check"></i>
                            </button>
                          )}

                          {review.status !== "rejected" && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-warning"
                              onClick={() =>
                                handleStatusChange(review.review_id, "rejected")
                              }
                              disabled={isUpdating}
                              title="Reject Review"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleInitiateDelete(review)}
                            title="Delete Review"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
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
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Review Details & Moderation Modal */}
      {detailsModalOpen && selectedReview && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setDetailsModalOpen(false)}
        >
          <div
            className="admin-modal-dialog"
            style={{ maxWidth: "560px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h5 className="m-0 font-weight-bold text-dark d-flex align-items-center gap-2">
                  <i className="fa-solid fa-star text-warning"></i>
                  Review Details
                </h5>
                <small className="text-muted">
                  Review #{selectedReview.review_id}
                </small>
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setDetailsModalOpen(false)}
              ></button>
            </div>

            <div className="admin-modal-body">
              {/* Product Header */}
              <div className="p-3 bg-light rounded-3 mb-3 d-flex align-items-center gap-3">
                {selectedReview.product?.image ? (
                  <img
                    src={selectedReview.product.image}
                    alt={selectedReview.product.title}
                    className="rounded border"
                    style={{
                      width: "45px",
                      height: "60px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="rounded border bg-white d-flex align-items-center justify-content-center text-muted"
                    style={{ width: "45px", height: "60px" }}
                  >
                    <i className="fa-solid fa-book"></i>
                  </div>
                )}
                <div className="flex-grow-1">
                  <small
                    className="text-muted text-uppercase fw-bold"
                    style={{ fontSize: "0.68rem" }}
                  >
                    Reviewed Product
                  </small>
                  <h6 className="fw-bold text-dark m-0 mb-1">
                    {selectedReview.product?.title ||
                      `Product #${selectedReview.product_id}`}
                  </h6>
                  <Link
                    to={`/products/${selectedReview.product_id}`}
                    target="_blank"
                    className="small text-primary text-decoration-none d-inline-flex align-items-center gap-1"
                  >
                    View Store Page{" "}
                    <i
                      className="fa-solid fa-arrow-up-right-from-square"
                      style={{ fontSize: "0.7rem" }}
                    ></i>
                  </Link>
                </div>
              </div>

              {/* Customer and Status Bar */}
              <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                <div>
                  <small
                    className="text-muted d-block"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Submitted By:
                  </small>
                  <span className="fw-bold text-dark small">
                    {selectedReview.user?.name || "Customer"}
                  </span>
                  <small className="text-muted d-block">
                    {selectedReview.user?.email || ""}
                  </small>
                </div>
                <div className="text-end">
                  <small
                    className="text-muted d-block mb-1"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Moderation Status:
                  </small>
                  <StatusBadge status={selectedReview.status} />
                </div>
              </div>

              {/* Rating & Submission Time */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <small
                    className="text-muted d-block mb-1"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Customer Rating:
                  </small>
                  <div>{renderStars(selectedReview.rating)}</div>
                </div>
                <div className="text-end">
                  <small
                    className="text-muted d-block"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Date Submitted:
                  </small>
                  <span className="small text-dark fw-medium">
                    {formatDate(
                      selectedReview.created_at || selectedReview.createdAt,
                    )}
                  </span>
                </div>
              </div>

              {/* Full Review Content */}
              <div className="border rounded-3 p-3 bg-white mb-3">
                {selectedReview.title && (
                  <h6 className="fw-bold text-dark mb-2">
                    {selectedReview.title}
                  </h6>
                )}
                <p
                  className="m-0 text-secondary"
                  style={{
                    fontSize: "0.92rem",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedReview.comment}
                </p>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  setDetailsModalOpen(false);
                  handleInitiateDelete(selectedReview);
                }}
              >
                <i className="fa-solid fa-trash-can me-1"></i> Delete
              </button>

              <div className="d-flex align-items-center gap-2">
                {selectedReview.status !== "approved" && (
                  <button
                    type="button"
                    className="btn btn-success btn-sm px-3"
                    onClick={() =>
                      handleStatusChange(selectedReview.review_id, "approved")
                    }
                    disabled={updatingStatusId === selectedReview.review_id}
                  >
                    <i className="fa-solid fa-check me-1"></i> Approve
                  </button>
                )}

                {selectedReview.status !== "rejected" && (
                  <button
                    type="button"
                    className="btn btn-warning btn-sm text-dark px-3"
                    onClick={() =>
                      handleStatusChange(selectedReview.review_id, "rejected")
                    }
                    disabled={updatingStatusId === selectedReview.review_id}
                  >
                    <i className="fa-solid fa-xmark me-1"></i> Reject
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Customer Review"
        message={`Are you sure you want to permanently delete this review for "${
          reviewToDelete?.product?.title || "this product"
        }" by ${reviewToDelete?.user?.name || "the customer"}? This action cannot be undone.`}
        confirmText="Delete Review"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setReviewToDelete(null);
          }
        }}
      />

      {/* Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default Reviews;
