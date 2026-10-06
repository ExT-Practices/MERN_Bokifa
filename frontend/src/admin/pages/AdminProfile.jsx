import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} from "../../api/authApi";
import StatusBadge from "../components/StatusBadge";
import ToastContainer from "../components/ToastContainer";

const AdminProfile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Update Profile Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Change Password Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Toast Container
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const toastId = Date.now();
    setToasts((prev) => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 4000);
  };

  const removeToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  // Fetch Profile
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const res = await getAdminProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setName(res.data.name || "");
        setEmail(res.data.email || "");

        // Keep localStorage updated
        localStorage.setItem("adminUser", JSON.stringify(res.data));
      }
    } catch (err) {
      console.error("Fetch admin profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Submit Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError("");

    if (!name.trim() || !email.trim()) {
      setProfileError("Name and email are required.");
      return;
    }

    setUpdatingProfile(true);
    try {
      const res = await updateAdminProfile({
        name: name.trim(),
        email: email.trim(),
      });
      if (res.success) {
        addToast("Profile details updated successfully.", "success");
        fetchProfileData();
      } else {
        setProfileError(res.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setProfileError(
        err.response?.data?.message || "Failed to update profile details.",
      );
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Submit Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword || !newPassword) {
      setPasswordError("Please enter both current and new password.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await changeAdminPassword({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        addToast("Password changed successfully.", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(res.message || "Failed to change password.");
      }
    } catch (err) {
      console.error(err);
      setPasswordError(
        err.response?.data?.message || "Current password is incorrect.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading profile settings...</p>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Admin Profile & Account Settings</h1>
          <p className="admin-page-subtitle">
            Manage your personal admin profile credentials and security password
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* Profile Card & Info */}
        <div className="col-12 col-lg-4">
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Admin Info</h2>
            </div>
            <div className="admin-card-body text-center">
              <div
                className="avatar-lg rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-bold fs-2 mb-3 shadow-sm"
                style={{ width: "72px", height: "72px" }}
              >
                {profile?.name ? profile.name.charAt(0).toUpperCase() : "A"}
              </div>

              <h4 className="fw-bold text-dark mb-1">{profile?.name}</h4>
              <p className="text-muted small mb-3">{profile?.email}</p>

              <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
                <StatusBadge status={profile?.role || "admin"} />
                <StatusBadge
                  status={
                    profile?.is_active !== undefined ? profile.is_active : true
                  }
                />
              </div>

              <div className="text-start bg-light p-3 rounded-3 mb-4 border">
                <small
                  className="text-muted d-block text-uppercase fw-bold mb-1"
                  style={{ fontSize: "0.7rem" }}
                >
                  Account Created
                </small>
                <div className="fw-semibold text-dark small">
                  {profile?.createdAt || profile?.created_at
                    ? new Date(
                        profile.createdAt || profile.created_at,
                      ).toLocaleString("en-IN", {
                        dateStyle: "long",
                      })
                    : "—"}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline-danger w-100 fw-bold"
                onClick={handleLogout}
                
              >
                <i className="fa-solid fa-right-from-bracket me-2"></i>
                Sign Out of Admin Panel
              </button>
            </div>
          </div>
        </div>

        {/* Update Forms */}
        <div className="col-12 col-lg-8">
          {/* Edit Profile Info Form */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Edit Profile Information</h2>
            </div>
            <div className="admin-card-body">
              {profileError && (
                <div className="alert alert-danger small mb-3">
                  {profileError}
                </div>
              )}

              <form onSubmit={handleUpdateProfile}>
                <div className="mb-3">
                  <label className="form-label font-weight-bold text-dark">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label font-weight-bold text-dark">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary font-weight-bold shadow-sm"
                  disabled={updatingProfile}
                >
                  {updatingProfile ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving Changes...
                    </>
                  ) : (
                    "Save Profile Details"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Change Password</h2>
            </div>
            <div className="admin-card-body">
              {passwordError && (
                <div className="alert alert-danger small mb-3">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label font-weight-bold text-dark">
                    Current Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <label className="form-label font-weight-bold text-dark">
                      New Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label font-weight-bold text-dark">
                      Confirm New Password{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-dark font-weight-bold shadow-sm"
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
