import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";

const AccountSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAccount();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/account/login");
  };

  const navLinks = [
    { label: "Dashboard", path: "/account", icon: "fa-tachometer-alt" },
    { label: "Orders", path: "/account/orders", icon: "fa-shopping-bag" },
    { label: "Personal details", path: "/account/profile", icon: "fa-user" },
    { label: "Addresses", path: "/account/addresses", icon: "fa-map-marker-alt" },
    { label: "Account settings", path: "/account/settings", icon: "fa-cog" },
  ];

  return (
    <aside className="bk-account-sidebar">
      <ul className="bk-account-sidebar__menu">
        {navLinks.map((link) => {
          const isActive =
            location.pathname === link.path ||
            (link.path !== "/account" && location.pathname.startsWith(link.path));

          return (
            <li key={link.path} className="bk-account-sidebar__item">
              <Link
                to={link.path}
                className={`bk-account-sidebar__link ${
                  isActive ? "bk-account-sidebar__link--active" : ""
                }`}
              >
                <i className={`fas ${link.icon} bk-account-sidebar__icon`}></i>
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
        <li className="bk-account-sidebar__item">
          <a
            href="#logout"
            onClick={handleLogout}
            className="bk-account-sidebar__link bk-account-sidebar__link--logout"
          >
            <i className="fas fa-sign-out-alt bk-account-sidebar__icon"></i>
            <span>Logout</span>
          </a>
        </li>
      </ul>
    </aside>
  );
};

export default AccountSidebar;
