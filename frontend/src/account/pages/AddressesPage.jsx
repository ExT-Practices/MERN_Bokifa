import React, { useState } from "react";
import AccountLayout from "../components/AccountLayout";
import { useAccount } from "../context/AccountContext";

const AddressesPage = () => {
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useAccount();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const initialFormState = {
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postcode: "",
    country: "India",
    phone: "",
    isDefault: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData(initialFormState);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setFormData({
      firstName: addr.firstName || "",
      lastName: addr.lastName || "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postcode: addr.postcode || "",
      country: addr.country || "India",
      phone: addr.phone || "",
      isDefault: !!addr.isDefault,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.postcode.trim()) newErrors.postcode = "Postcode is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingAddress) {
      updateAddress(editingAddress.id, formData);
    } else {
      addAddress(formData);
    }

    setIsModalOpen(false);
  };

  return (
    <AccountLayout>
      <div className="bk-account-card">
        <div className="bk-account-card__header">
          <div>
            <h2 className="bk-account-card__title">
              <i className="fas fa-map-marked-alt" style={{ color: "var(--bk-green-primary)" }}></i>
              My Addresses
            </h2>
            <p className="bk-account-card__subtitle">
              Manage your delivery addresses and set your default shipping destination.
            </p>
          </div>
          <button
            type="button"
            className="bk-account-btn bk-account-btn--primary"
            onClick={handleOpenAdd}
          >
            <i className="fas fa-plus"></i> Add new address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--bk-text-muted)" }}>
            <i
              className="fas fa-map-pin"
              style={{ fontSize: "40px", marginBottom: "16px", opacity: 0.5 }}
            ></i>
            <p>You have no saved addresses yet.</p>
          </div>
        ) : (
          <div className="bk-account-address-grid">
            {addresses.map((addr) => (
              <div
                key={addr.address_id}
                className={`bk-account-address-card ${
                  addr.isDefault ? "bk-account-address-card--default" : ""
                }`}
              >
                {addr.isDefault && (
                  <span className="bk-account-address-card__default-tag">
                    Default address
                  </span>
                )}
                <div className="bk-account-address-card__body">
                  <div className="bk-account-address-card__name">
                    {addr.firstName} {addr.lastName}
                  </div>
                  <div>{addr.addressLine1}</div>
                  {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                  <div>
                    {addr.city}, {addr.state} {addr.postcode}
                  </div>
                  <div>{addr.country}</div>
                  <div style={{ marginTop: "6px", color: "var(--bk-text-muted)" }}>
                    Phone: {addr.phone}
                  </div>
                </div>

                <div className="bk-account-address-card__actions">
                  <button
                    type="button"
                    className="bk-account-btn bk-account-btn--secondary bk-account-btn--sm"
                    onClick={() => handleOpenEdit(addr)}
                  >
                    <i className="fas fa-pen"></i> Edit
                  </button>
                  {!addr.isDefault && (
                    <>
                      <button
                        type="button"
                        className="bk-account-btn bk-account-btn--secondary bk-account-btn--sm"
                        onClick={() => setDefaultAddress(addr.address_id)}
                      >
                        Set as Default
                      </button>
                      <button
                        type="button"
                        className="bk-account-btn bk-account-btn--outline-danger bk-account-btn--sm"
                        onClick={() => setDeleteConfirmId(addr.address_id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="bk-account-modal-overlay">
          <div className="bk-account-modal">
            <div className="bk-account-modal__header">
              <h3 className="bk-account-modal__title">
                {editingAddress ? "Edit address" : "Add new address"}
              </h3>
              <button
                type="button"
                className="bk-account-input-icon"
                onClick={() => setIsModalOpen(false)}
                style={{ position: "static" }}
              >
                <i className="fas fa-times" style={{ fontSize: "18px" }}></i>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} noValidate>
              <div className="bk-account-modal__body">
                <div className="bk-account-form-grid" style={{ marginBottom: "16px" }}>
                  <div className="bk-account-form-group">
                    <label className="bk-account-label" htmlFor="addr-firstName">
                      First Name <span className="req">*</span>
                    </label>
                    <input
                      id="addr-firstName"
                      name="firstName"
                      type="text"
                      className={`bk-account-input ${
                        errors.firstName ? "bk-account-input--error" : ""
                      }`}
                      value={formData.firstName}
                      onChange={handleFormChange}
                    />
                    {errors.firstName && (
                      <span className="bk-account-field-error">{errors.firstName}</span>
                    )}
                  </div>

                  <div className="bk-account-form-group">
                    <label className="bk-account-label" htmlFor="addr-lastName">
                      Last Name <span className="req">*</span>
                    </label>
                    <input
                      id="addr-lastName"
                      name="lastName"
                      type="text"
                      className={`bk-account-input ${
                        errors.lastName ? "bk-account-input--error" : ""
                      }`}
                      value={formData.lastName}
                      onChange={handleFormChange}
                    />
                    {errors.lastName && (
                      <span className="bk-account-field-error">{errors.lastName}</span>
                    )}
                  </div>
                </div>

                <div className="bk-account-form-group" style={{ marginBottom: "16px" }}>
                  <label className="bk-account-label" htmlFor="addr-line1">
                    Street Address <span className="req">*</span>
                  </label>
                  <input
                    id="addr-line1"
                    name="addressLine1"
                    type="text"
                    className={`bk-account-input ${
                      errors.addressLine1 ? "bk-account-input--error" : ""
                    }`}
                    placeholder="House number and street name"
                    value={formData.addressLine1}
                    onChange={handleFormChange}
                  />
                  {errors.addressLine1 && (
                    <span className="bk-account-field-error">{errors.addressLine1}</span>
                  )}
                </div>

                <div className="bk-account-form-group" style={{ marginBottom: "16px" }}>
                  <label className="bk-account-label" htmlFor="addr-line2">
                    Apartment, suite, unit, etc. (optional)
                  </label>
                  <input
                    id="addr-line2"
                    name="addressLine2"
                    type="text"
                    className="bk-account-input"
                    placeholder="Apartment, suite, unit, etc."
                    value={formData.addressLine2}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="bk-account-form-grid" style={{ marginBottom: "16px" }}>
                  <div className="bk-account-form-group">
                    <label className="bk-account-label" htmlFor="addr-city">
                      City <span className="req">*</span>
                    </label>
                    <input
                      id="addr-city"
                      name="city"
                      type="text"
                      className={`bk-account-input ${
                        errors.city ? "bk-account-input--error" : ""
                      }`}
                      value={formData.city}
                      onChange={handleFormChange}
                    />
                    {errors.city && (
                      <span className="bk-account-field-error">{errors.city}</span>
                    )}
                  </div>

                  <div className="bk-account-form-group">
                    <label className="bk-account-label" htmlFor="addr-state">
                      State / Province <span className="req">*</span>
                    </label>
                    <input
                      id="addr-state"
                      name="state"
                      type="text"
                      className={`bk-account-input ${
                        errors.state ? "bk-account-input--error" : ""
                      }`}
                      value={formData.state}
                      onChange={handleFormChange}
                    />
                    {errors.state && (
                      <span className="bk-account-field-error">{errors.state}</span>
                    )}
                  </div>
                </div>

                <div className="bk-account-form-grid" style={{ marginBottom: "16px" }}>
                  <div className="bk-account-form-group">
                    <label className="bk-account-label" htmlFor="addr-postcode">
                      Postcode / ZIP <span className="req">*</span>
                    </label>
                    <input
                      id="addr-postcode"
                      name="postcode"
                      type="text"
                      className={`bk-account-input ${
                        errors.postcode ? "bk-account-input--error" : ""
                      }`}
                      value={formData.postcode}
                      onChange={handleFormChange}
                    />
                    {errors.postcode && (
                      <span className="bk-account-field-error">{errors.postcode}</span>
                    )}
                  </div>

                  <div className="bk-account-form-group">
                    <label className="bk-account-label" htmlFor="addr-country">
                      Country <span className="req">*</span>
                    </label>
                    <input
                      id="addr-country"
                      name="country"
                      type="text"
                      className="bk-account-input"
                      value={formData.country}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="bk-account-form-group" style={{ marginBottom: "16px" }}>
                  <label className="bk-account-label" htmlFor="addr-phone">
                    Phone Number <span className="req">*</span>
                  </label>
                  <input
                    id="addr-phone"
                    name="phone"
                    type="tel"
                    className={`bk-account-input ${
                      errors.phone ? "bk-account-input--error" : ""
                    }`}
                    value={formData.phone}
                    onChange={handleFormChange}
                  />
                  {errors.phone && (
                    <span className="bk-account-field-error">{errors.phone}</span>
                  )}
                </div>

                <label className="bk-account-checkbox-group">
                  <input
                    type="checkbox"
                    name="isDefault"
                    className="bk-account-checkbox"
                    checked={formData.isDefault}
                    onChange={handleFormChange}
                  />
                  <span className="bk-account-checkbox-label">
                    Set as my default shipping address
                  </span>
                </label>
              </div>

              <div className="bk-account-modal__footer">
                <button
                  type="button"
                  className="bk-account-btn bk-account-btn--secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="bk-account-btn bk-account-btn--primary">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="bk-account-modal-overlay">
          <div className="bk-account-modal" style={{ maxWidth: "420px" }}>
            <div className="bk-account-modal__header">
              <h3 className="bk-account-modal__title">Delete Address</h3>
            </div>
            <div className="bk-account-modal__body">
              <p>Are you sure you want to delete this saved address?</p>
            </div>
            <div className="bk-account-modal__footer">
              <button
                type="button"
                className="bk-account-btn bk-account-btn--secondary"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bk-account-btn bk-account-btn--outline-danger"
                onClick={() => {
                  deleteAddress(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
};

export default AddressesPage;
