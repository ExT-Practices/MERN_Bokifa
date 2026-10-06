import React, { useEffect, useState } from "react";
import AccountLayout from "../components/AccountLayout";
import { useAccount } from "../context/AccountContext";

const PersonalDetailsPage = () => {
  const { user, updateProfile } = useAccount();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // --------------------------------------------------
  // LOAD USER DATA INTO FORM
  // --------------------------------------------------

  useEffect(() => {
    if (!user) return;

    const fullName = user.name || "";

    const nameParts = fullName.trim().split(/\s+/);

    const firstName = nameParts.shift() || "";
    const lastName = nameParts.join(" ");

    setFormData({
      firstName,
      lastName,
      email: user.email || "",
      phone: user.phone || "",
    });
  }, [user]);

  // --------------------------------------------------
  // HANDLE INPUT
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------
  // SAVE CHANGES
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const fullName =
        `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

      await updateProfile({
        name: fullName,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (!user) {
    return (
      <AccountLayout>
        <div className="bk-account-card">
          <div style={{ padding: "30px", textAlign: "center" }}>
            <i className="fas fa-spinner fa-spin"></i>
            <p style={{ marginTop: "10px" }}>Loading your profile...</p>
          </div>
        </div>
      </AccountLayout>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <AccountLayout>
      <div className="bk-account-card">
        {/* HEADER */}
        <div className="bk-account-card__header">
          <div>
            <h2 className="bk-account-card__title">
              <i
                className="fas fa-user-edit"
                style={{
                  color: "var(--bk-green-primary)",
                }}
              ></i>
              Personal details
            </h2>

            <p className="bk-account-card__subtitle">
              Manage your personal information and contact details.
            </p>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} noValidate>
          {/* FIRST + LAST NAME */}
          <div
            className="bk-account-form-grid"
            style={{ marginBottom: "20px" }}
          >
            {/* FIRST NAME */}
            <div className="bk-account-form-group">
              <label className="bk-account-label" htmlFor="profile-firstName">
                First Name <span className="req">*</span>
              </label>

              <input
                id="profile-firstName"
                name="firstName"
                type="text"
                className={`bk-account-input ${
                  errors.firstName ? "bk-account-input--error" : ""
                }`}
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
              />

              {errors.firstName && (
                <span className="bk-account-field-error">
                  {errors.firstName}
                </span>
              )}
            </div>

            {/* LAST NAME */}
            <div className="bk-account-form-group">
              <label className="bk-account-label" htmlFor="profile-lastName">
                Last Name <span className="req">*</span>
              </label>

              <input
                id="profile-lastName"
                name="lastName"
                type="text"
                className={`bk-account-input ${
                  errors.lastName ? "bk-account-input--error" : ""
                }`}
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
              />

              {errors.lastName && (
                <span className="bk-account-field-error">
                  {errors.lastName}
                </span>
              )}
            </div>
          </div>

          {/* EMAIL + PHONE */}
          <div
            className="bk-account-form-grid"
            style={{ marginBottom: "28px" }}
          >
            {/* EMAIL */}
            <div className="bk-account-form-group">
              <label className="bk-account-label" htmlFor="profile-email">
                Email Address <span className="req">*</span>
              </label>

              <input
                id="profile-email"
                name="email"
                type="email"
                className={`bk-account-input ${
                  errors.email ? "bk-account-input--error" : ""
                }`}
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
              />

              {errors.email && (
                <span className="bk-account-field-error">{errors.email}</span>
              )}
            </div>

            {/* PHONE */}
            <div className="bk-account-form-group">
              <label className="bk-account-label" htmlFor="profile-phone">
                Phone Number <span className="req">*</span>
              </label>

              <input
                id="profile-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength="10"
                className={`bk-account-input ${
                  errors.phone ? "bk-account-input--error" : ""
                }`}
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit phone number"
              />

              {errors.phone && (
                <span className="bk-account-field-error">{errors.phone}</span>
              )}
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="submit"
              className="bk-account-btn bk-account-btn--primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving changes...
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </AccountLayout>
  );
};

export default PersonalDetailsPage;
