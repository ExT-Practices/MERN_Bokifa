import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { loginUser } from "../../api/authApi";
import { useAccount } from "../context/AccountContext";
import "../styles/account.css";
import NewsLetter from "../../components/NewsLetter";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAccount();
  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await loginUser({
        email: email.trim(),
        password,
      });

      console.log("Login API Response:", response);

      // Backend returns user information inside `data`
      login(response.data, response.token);

      setEmail("");
      setPassword("");

      navigate("/account", { replace: true });
    } catch (error) {
      console.error("Login Error:", error);

      setErrors({
        api: error.response?.data?.message || "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="bk-account-wrapper" style={{ padding: "40px 0" }}>
        <div className="bk-account-auth-container">
          <div className="bk-account-auth-card">
            <Link to="/" className="bk-account-auth-logo">
              Ap Bokifa
            </Link>
            <h2 className="bk-account-auth-title">Sign in</h2>
            <p className="bk-account-auth-subtitle">
              Welcome back! Please enter your details to access your account.
            </p>

            <form onSubmit={handleLogin} noValidate>
              {errors.api && (
                <div
                  style={{
                    marginBottom: "18px",
                    padding: "12px 14px",
                    borderRadius: "6px",
                    background: "#fee2e2",
                    color: "#b91c1c",
                    fontSize: "14px",
                  }}
                >
                  {errors.api}
                </div>
              )}
              <div
                className="bk-account-form-group"
                style={{ marginBottom: "18px" }}
              >
                <label className="bk-account-label" htmlFor="login-email">
                  Email <span className="req">*</span>
                </label>
                <div className="bk-account-input-wrapper">
                  <input
                    id="login-email"
                    type="email"
                    className={`bk-account-input ${
                      errors.email ? "bk-account-input--error" : ""
                    }`}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && (
                  <span className="bk-account-field-error">{errors.email}</span>
                )}
              </div>

              <div
                className="bk-account-form-group"
                style={{ marginBottom: "14px" }}
              >
                <label className="bk-account-label" htmlFor="login-password">
                  Password <span className="req">*</span>
                </label>
                <div className="bk-account-input-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className={`bk-account-input ${
                      errors.password ? "bk-account-input--error" : ""
                    }`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="bk-account-input-icon"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <i
                      className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                    ></i>
                  </button>
                </div>
                {errors.password && (
                  <span className="bk-account-field-error">
                    {errors.password}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "24px",
                }}
              >
                <Link
                  to="/account/forgot-password"
                  style={{
                    color: "var(--bk-green-primary)",
                    fontSize: "13px",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="bk-account-btn bk-account-btn--primary bk-account-btn--full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <div className="bk-account-auth-footer">
              Don't have an account?{" "}
              <Link to="/account/register">Create account</Link>
            </div>
          </div>
        </div>
      </div>
      <NewsLetter />
      <Footer />
    </>
  );
};

export default LoginPage;
