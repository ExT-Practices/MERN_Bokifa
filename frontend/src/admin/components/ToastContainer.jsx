import React from "react";

const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container-custom">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-custom ${toast.type || "info"}`}>
          <i
            className={`fa-solid ${
              toast.type === "success"
                ? "fa-circle-check text-success"
                : toast.type === "error"
                ? "fa-circle-xmark text-danger"
                : "fa-circle-info text-info"
            } fs-5`}
          ></i>
          <div className="flex-grow-1">{toast.message}</div>
          <button
            type="button"
            className="btn-close btn-close-white ms-2"
            onClick={() => onDismiss(toast.id)}
            style={{ fontSize: "0.75rem" }}
          ></button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
