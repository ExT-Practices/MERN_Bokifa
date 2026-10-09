import React from "react";

const ConfirmModal = ({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  confirmVariant = "danger",
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h5 className="m-0 font-weight-bold text-dark">{title}</h5>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
            disabled={loading}
          ></button>
        </div>

        <div className="admin-modal-body">
          <p
            className="m-0 text-muted"
            style={{ fontSize: "0.95rem", lineHeight: "1.5" }}
          >
            {message}
          </p>
        </div>

        <div className="admin-modal-footer justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary px-4 font-weight-medium"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`btn btn-${confirmVariant} px-4 font-weight-medium`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
