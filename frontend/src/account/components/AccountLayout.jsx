import React from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AccountHeader from "./AccountHeader";
import AccountSidebar from "./AccountSidebar";
import { useAccount } from "../context/AccountContext";
import "../styles/account.css";

const ToastNotification = () => {
  const { toastMessage } = useAccount();
  if (!toastMessage) return null;

  const typeClass =
    toastMessage.type === "error"
      ? "bk-account-toast--error"
      : toastMessage.type === "info"
        ? "bk-account-toast--info"
        : "";

  return (
    <div className={`bk-account-toast ${typeClass}`}>
      <i
        className={`fas ${
          toastMessage.type === "error"
            ? "fa-exclamation-circle"
            : toastMessage.type === "info"
              ? "fa-info-circle"
              : "fa-check-circle"
        }`}
      ></i>
      <span>{toastMessage.message}</span>
    </div>
  );
};

const MobileAccountTabs = () => {
  const location = useLocation();
  const tabs = [
    { path: "/account", label: "Dashboard", icon: "fa-tachometer-alt" },
    { path: "/account/orders", label: "Orders", icon: "fa-box" },
    { path: "/account/profile", label: "Profile", icon: "fa-user" },
    { path: "/account/addresses", label: "Addresses", icon: "fa-map-marker-alt" },
    { path: "/account/settings", label: "Settings", icon: "fa-cog" },
  ];

  return (
    <div className="bk-account-mobile-tabs">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`bk-account-mobile-tab ${isActive ? "bk-account-mobile-tab--active" : ""}`}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

const LayoutContent = ({ children, title, subtitle, hideSidebar = false }) => {
  return (
    <>
      <Header />
      <div className="bk-account-wrapper">
        <AccountHeader title={title} subtitle={subtitle} />
        <main className="bk-account-container">
          {hideSidebar ? (
            <div className="bk-account-main-content">{children}</div>
          ) : (
            <div className="bk-account-layout-grid">
              <AccountSidebar />
              <div className="bk-account-main-content">
                <MobileAccountTabs />
                {children}
              </div>
            </div>
          )}
        </main>
      </div>
      <ToastNotification />
      <Footer />
    </>
  );
};

const AccountLayout = ({ children, title, subtitle, hideSidebar = false }) => {
  return (
    <LayoutContent title={title} subtitle={subtitle} hideSidebar={hideSidebar}>
      {children}
    </LayoutContent>
  );
};

export default AccountLayout;
