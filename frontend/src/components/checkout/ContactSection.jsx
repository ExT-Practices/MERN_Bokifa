import React from "react";

const ContactSection = ({ formData, handleChange, errors }) => {
  return (
    <div className="checkout-section contact-section">
      <div className="checkout-section-header">
        <h2 className="checkout-section-title">Contact</h2>
        <a href="#signin" className="checkout-link" onClick={(e) => e.preventDefault()}>
          Sign in
        </a>
      </div>

      <div className="checkout-input-group">
        <div className="checkout-input-wrapper">
          <input
            type="text"
            name="emailOrPhone"
            className={`checkout-input ${errors.emailOrPhone ? "error" : ""}`}
            placeholder="Email or mobile phone number"
            value={formData.emailOrPhone || ""}
            onChange={handleChange}
          />
          <button
            type="button"
            className="checkout-input-icon-btn"
            title="Why do we ask for contact info?"
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
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </button>
        </div>
        {errors.emailOrPhone && (
          <div className="checkout-error-text">{errors.emailOrPhone}</div>
        )}
      </div>

      <div className="checkout-checkbox-row">
        <input
          type="checkbox"
          id="emailNews"
          name="emailNews"
          className="checkout-checkbox"
          checked={formData.emailNews || false}
          onChange={handleChange}
        />
        <label htmlFor="emailNews" className="checkout-checkbox-label">
          Email me with news and offers
        </label>
      </div>
    </div>
  );
};

export default ContactSection;
