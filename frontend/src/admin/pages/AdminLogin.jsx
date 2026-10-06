import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginAdmin } from "../../api/authApi";
import "../admin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/admin/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginAdmin({
        email,
        password,
      });

      if (response.success && response.token) {
        if (response.data && response.data.role !== "admin") {
          setError(
            "Access denied. Admin privileges are required to access this portal.",
          );

          setLoading(false);
          return;
        }

        /*
         * IMPORTANT:
         * Admin gets a separate token.
         * Customer token is untouched.
         */
        localStorage.setItem("adminToken", response.token);

        if (response.data) {
          localStorage.setItem("adminUser", JSON.stringify(response.data));
        }

        navigate(from, {
          replace: true,
        });
      } else {
        setError(
          response.message || "Login failed. Please check your credentials.",
        );
      }
    } catch (err) {
      console.error("Admin login error:", err);

      const errMsg =
        err.response?.data?.message ||
        "Failed to authenticate. Please check your network connection and server state.";

      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 bg-slate-900 px-3"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      }}
    >
      <div
        className="card border-0 shadow-lg rounded-4 overflow-hidden w-100"
        style={{
          maxWidth: "440px",
        }}
      >
        <div className="card-body p-4 p-sm-5 bg-white">
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3"
              style={{
                width: "64px",
                height: "64px",
              }}
            >
              <i className="fa-solid fa-user-shield fs-2"></i>
            </div>

            <h3 className="fw-bold text-dark mb-1">Bokifa Admin</h3>

            <p className="text-muted small">
              Sign in to your administration dashboard
            </p>
          </div>

          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show small d-flex align-items-center gap-2 mb-4"
              role="alert"
            >
              <i className="fa-solid fa-circle-exclamation fs-5 flex-shrink-0"></i>

              <div>{error}</div>

              <button
                type="button"
                className="btn-close"
                onClick={() => setError("")}
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label font-weight-bold text-dark small">
                Admin Email
              </label>

              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="fa-solid fa-envelope"></i>
                </span>

                <input
                  type="email"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="admin@bokifa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label font-weight-bold text-dark small">
                Password
              </label>

              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="fa-solid fa-lock"></i>
                </span>

                <input
                  type="password"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2.5 rounded-3 fw-bold text-white shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Signing In...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-2 border-top">
            <a
              href="/"
              className="text-muted small text-decoration-none hover-primary"
            >
              <i className="fa-solid fa-arrow-left me-1"></i>
              Back to Customer Site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
