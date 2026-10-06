import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminHeader = ({ onToggleMobile }) => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("adminUser");
    if (userStr) {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    navigate("/admin/login");
  };

  const getInitial = () => {
    if (adminUser && adminUser.name) {
      return adminUser.name.charAt(0).toUpperCase();
    }
    return "A";
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          className="admin-mobile-toggle"
          onClick={onToggleMobile}
          aria-label="Toggle Navigation"
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-none d-sm-inline-flex align-items-center gap-2"
        >
          <i className="fa-solid fa-store text-primary"></i>
          <span>View Customer Store</span>
        </a>
      </div>

      <div className="admin-header-right">
        <div className="dropdown">
          <div
            className="admin-user-pill dropdown-toggle border-0"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ cursor: "pointer" }}
          >
            <div className="admin-avatar">{getInitial()}</div>
            <div className="d-none d-md-block text-start me-1">
              <div
                className="lh-1 text-dark font-weight-bold"
                style={{ fontSize: "0.85rem" }}
              >
                {adminUser?.name || "Admin User"}
              </div>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                {adminUser?.email || "admin@bokifa.com"}
              </small>
            </div>
          </div>

          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2 rounded-3">
            <li>
              <Link
                className="dropdown-menu-item dropdown-item d-flex align-items-center gap-2 py-2"
                to="/admin/profile"
              >
                <i className="fa-solid fa-user-gear text-muted"></i>
                Admin Profile
              </Link>
            </li>
            <li>
              <a
                className="dropdown-menu-item dropdown-item d-flex align-items-center gap-2 py-2 d-sm-none"
                href="/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-solid fa-store text-muted"></i>
                View Shop
              </a>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button
                className="dropdown-menu-item dropdown-item text-danger d-flex align-items-center gap-2 py-2"
                onClick={handleLogout}
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
