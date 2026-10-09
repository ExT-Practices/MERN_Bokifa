import React from "react";

const StatusBadge = ({ status }) => {
  if (status === undefined || status === null) return null;

  const normalizedStatus = String(status).toLowerCase();

  let iconClass = "fa-solid fa-circle-dot";
  let label = status;

  switch (normalizedStatus) {
    case "pending":
      iconClass = "fa-solid fa-clock";
      label = "Pending";
      break;
    case "confirmed":
      iconClass = "fa-solid fa-circle-check";
      label = "Confirmed";
      break;
    case "processing":
      iconClass = "fa-solid fa-arrows-rotate";
      label = "Processing";
      break;
    case "shipped":
      iconClass = "fa-solid fa-truck-fast";
      label = "Shipped";
      break;
    case "delivered":
      iconClass = "fa-solid fa-box-open";
      label = "Delivered";
      break;
    case "cancelled":
      iconClass = "fa-solid fa-ban";
      label = "Cancelled";
      break;
    case "refunded":
      iconClass = "fa-solid fa-rotate-left";
      label = "Refunded";
      break;
    case "paid":
      iconClass = "fa-solid fa-check-double";
      label = "Paid";
      break;
    case "failed":
      iconClass = "fa-solid fa-circle-xmark";
      label = "Failed";
      break;
    case "approved":
      iconClass = "fa-solid fa-circle-check";
      label = "Approved";
      break;
    case "rejected":
      iconClass = "fa-solid fa-circle-xmark";
      label = "Rejected";
      break;
    case "cod":
      iconClass = "fa-solid fa-hand-holding-dollar";
      label = "Cash on Delivery";
      break;
    case "online":
      iconClass = "fa-solid fa-credit-card";
      label = "Razorpay / Online";
      break;
    case "active":
    case "true":
      iconClass = "fa-solid fa-toggle-on";
      label = "Active";
      break;
    case "inactive":
    case "false":
      iconClass = "fa-solid fa-toggle-off";
      label = "Inactive";
      break;
    case "admin":
      iconClass = "fa-solid fa-user-shield";
      label = "Admin";
      break;
    case "user":
      iconClass = "fa-solid fa-user";
      label = "User";
      break;
    default:
      label = String(status);
  }

  const statusClass =
    normalizedStatus === "true"
      ? "active"
      : normalizedStatus === "false"
        ? "inactive"
        : normalizedStatus;

  return (
    <span className={`status-badge ${statusClass}`}>
      <i className={iconClass}></i>
      {label}
    </span>
  );
};

export default StatusBadge;
