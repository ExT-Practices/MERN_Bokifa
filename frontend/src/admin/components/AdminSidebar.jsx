import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const AdminSidebar = ({ isOpen, onCloseMobile }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    navigate("/admin/login");
  };

  const navItems = [
    {
      path: "/admin/dashboard",
      icon: "fa-solid fa-chart-pie",
      label: "Dashboard",
    },
    { path: "/admin/products", icon: "fa-solid fa-book", label: "Products" },
    {
      path: "/admin/categories",
      icon: "fa-solid fa-list-check",
      label: "Categories",
    },
    {
      path: "/admin/orders",
      icon: "fa-solid fa-cart-shopping",
      label: "Orders",
    },
    { path: "/admin/users", icon: "fa-solid fa-users", label: "Users" },
    { path: "/admin/profile", icon: "fa-solid fa-user-gear", label: "Profile" },
  ];

  return (
    <>
      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div className="admin-sidebar-brand">
          <i className="fa-solid fa-book-bookmark text-primary"></i>
          <span>
            Bokifa<span className="brand-accent">.Admin</span>
          </span>
        </div>

        <div className="admin-sidebar-menu">
          <div
            className="text-uppercase small font-weight-bold px-3 py-2 text-muted"
            style={{ fontSize: "0.7rem", letterSpacing: "0.08em" }}
          >
            Management
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? "active" : ""}`
              }
              onClick={onCloseMobile}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-nav-item border-0 bg-transparent w-100 text-start text-danger"
            onClick={handleLogout}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={onCloseMobile}
      ></div>
    </>
  );
};

export default AdminSidebar;
