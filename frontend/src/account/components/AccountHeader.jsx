import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAccount } from "../context/AccountContext";

const AccountHeader = ({ title, subtitle }) => {
  const { user } = useAccount();
  const location = useLocation();

  const getBreadcrumbName = (pathname) => {
    if (pathname === "/account") return "Dashboard";
    if (pathname === "/account/orders") return "My Orders";
    if (pathname.startsWith("/account/orders/")) return "Order Details";
    if (pathname === "/account/profile") return "Personal Details";
    if (pathname === "/account/addresses") return "Saved Addresses";
    if (pathname === "/account/settings") return "Account Settings";
    return "Account";
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/account",
      icon: "fa-tachometer-alt",
    },
    {
      label: "Orders",
      path: "/account/orders",
      icon: "fa-shopping-bag",
    },
    {
      label: "Personal Details",
      path: "/account/profile",
      icon: "fa-user",
    },
    {
      label: "Addresses",
      path: "/account/addresses",
      icon: "fa-map-marker-alt",
    },
    {
      label: "Account Settings",
      path: "/account/settings",
      icon: "fa-cog",
    },
  ];

  // Safe user values
  const userName = user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="bk-account-header-banner">
      <div className="bk-account-container">
        {/* Breadcrumb Navigation */}
        <nav className="bk-account-breadcrumb" aria-label="breadcrumb">
          <Link to="/">Home</Link>

          <span className="bk-account-breadcrumb__sep">/</span>

          <Link to="/account">My Account</Link>

          {location.pathname !== "/account" && (
            <>
              <span className="bk-account-breadcrumb__sep">/</span>

              <span>{getBreadcrumbName(location.pathname)}</span>
            </>
          )}
        </nav>

        <div className="bk-account-header-banner__inner">
          <div>
            <h1 className="bk-account-header-banner__title">
              {title || `Welcome back, ${userName}!`}
            </h1>

            <p className="bk-account-header-banner__subtitle">
              {subtitle ||
                "Manage your account, orders, and personal information."}
            </p>
          </div>

          <div className="bk-account-header-banner__user-pill">
            {/* Avatar */}
            <div className="bk-account-avatar-placeholder">{userInitial}</div>

            {/* User information */}
            <div className="bk-account-user-meta">
              <span className="bk-account-user-meta__name">{userName}</span>

              <span className="bk-account-user-meta__sub">
                {user?.email || "Registered Member"}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile quick tabs bar */}
        <div className="bk-account-mobile-tabs" style={{ marginTop: "24px" }}>
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/account" &&
                location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`bk-account-mobile-tab ${
                  isActive ? "bk-account-mobile-tab--active" : ""
                }`}
              >
                <i className={`fas ${item.icon}`}></i>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AccountHeader;
 