import React from "react";

const DeliverySection = ({ formData, handleChange, errors }) => {
  return (
    <div className="checkout-section delivery-section">
      <h2 className="checkout-section-title" style={{ marginBottom: "14px" }}>
        Delivery
      </h2>

      {/* Country / Region Select */}
      <div className="checkout-input-group">
        <div className="checkout-field-labeled checkout-select-wrapper">
          <span className="checkout-floating-label">Country/Region</span>

          <select
            name="country"
            className="checkout-select checkout-input-with-label"
            value={formData.country || "Australia"}
            onChange={handleChange}
          >
            <option value="Australia">Australia</option>
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="New Zealand">New Zealand</option>
            <option value="India">India</option>
          </select>
        </div>
      </div>

      {/* First name & Last name */}
      <div className="checkout-input-group checkout-grid-2">
        <input
          type="text"
          name="firstName"
          className="checkout-input"
          placeholder="First name (optional)"
          value={formData.firstName || ""}
          onChange={handleChange}
        />

        <div>
          <input
            type="text"
            name="lastName"
            className={`checkout-input ${errors.lastName ? "error" : ""}`}
            placeholder="Last name"
            value={formData.lastName || ""}
            onChange={handleChange}
          />

          {errors.lastName && (
            <div className="checkout-error-text">{errors.lastName}</div>
          )}
        </div>
      </div>

      {/* Address with Search Icon */}
      <div className="checkout-input-group">
        <div className="checkout-input-wrapper">
          <input
            type="text"
            name="address"
            className={`checkout-input ${errors.address ? "error" : ""}`}
            placeholder="Address"
            value={formData.address || ""}
            onChange={handleChange}
          />

          <button
            type="button"
            className="checkout-input-icon-btn"
            title="Search address"
            onClick={(e) => e.preventDefault()}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        {errors.address && (
          <div className="checkout-error-text">{errors.address}</div>
        )}
      </div>

      {/* Apartment, suite, etc. */}
      <div className="checkout-input-group">
        <input
          type="text"
          name="apartment"
          className="checkout-input"
          placeholder="Apartment, suite, etc. (optional)"
          value={formData.apartment || ""}
          onChange={handleChange}
        />
      </div>

      {/* Suburb | State/territory | Postcode */}
      <div className="checkout-input-group checkout-grid-3">
        <div>
          <input
            type="text"
            name="suburb"
            className={`checkout-input ${errors.suburb ? "error" : ""}`}
            placeholder="Suburb"
            value={formData.suburb || ""}
            onChange={handleChange}
          />

          {errors.suburb && (
            <div className="checkout-error-text">{errors.suburb}</div>
          )}
        </div>

        <div>
          <div className="checkout-select-wrapper">
            <select
              name="state"
              className={`checkout-select ${errors.state ? "error" : ""}`}
              value={formData.state || ""}
              onChange={handleChange}
            >
              <option value="" disabled hidden>
                State/territory
              </option>

              <option value="ACT">Australian Capital Territory</option>

              <option value="NSW">New South Wales</option>

              <option value="NT">Northern Territory</option>

              <option value="QLD">Queensland</option>

              <option value="SA">South Australia</option>

              <option value="TAS">Tasmania</option>

              <option value="VIC">Victoria</option>

              <option value="WA">Western Australia</option>
              <option value="AP">Andhra Pradesh</option>
              <option value="AR">Arunachal Pradesh</option>
              <option value="AS">Assam</option>
              <option value="BH">Bihar</option>
              <option value="CG">Chhattisgarh</option>
              <option value="GO">Goa</option>
              <option value="GJ">Gujarat</option>
              <option value="HR">Haryana</option>
              <option value="HP">Himachal Pradesh</option>
              <option value="JH">Jharkhand</option>
              <option value="KA">Karnataka</option>
              <option value="KE">Kerala</option>
              <option value="MP">Madhya Pradesh</option>
              <option value="MH">Maharashtra</option>
              <option value="MN">Manipur</option>
              <option value="ME">Meghalaya</option>
              <option value="MI">Mizoram</option>
              <option value="NA">Nagaland</option>
              <option value="OD">Odisha</option>
              <option value="PB">Punjab</option>
              <option value="RJ">Rajasthan</option>
              <option value="SK">Sikkim</option>
              <option value="TN">Tamil Nadu</option>
              <option value="TL">Telangana</option>
              <option value="TR">Tripura</option>
              <option value="UP">Uttar Pradesh</option>
              <option value="UT">Uttarakhand</option>
              <option value="WB">West Bengal</option>
            </select>
          </div>

          {errors.state && (
            <div className="checkout-error-text">{errors.state}</div>
          )}
        </div>

        <div>
          <input
            type="text"
            name="postcode"
            className={`checkout-input ${errors.postcode ? "error" : ""}`}
            placeholder="Postcode"
            value={formData.postcode || ""}
            onChange={handleChange}
          />

          {errors.postcode && (
            <div className="checkout-error-text">{errors.postcode}</div>
          )}
        </div>
      </div>

      {/* Save Info Checkbox */}
      <div className="checkout-checkbox-row">
        <input
          type="checkbox"
          id="saveInfo"
          name="saveInfo"
          className="checkout-checkbox"
          checked={formData.saveInfo || false}
          onChange={handleChange}
        />

        <label htmlFor="saveInfo" className="checkout-checkbox-label"> 
          Save this information for next time
        </label>
      </div>
    </div>
  );
};

export default DeliverySection;
