import React from "react";

const PaymentSection = ({ formData, handleChange, errors }) => {
  return (
    <div className="checkout-section payment-section">
      <h2 className="checkout-section-title">Payment</h2>
      <p className="checkout-section-subtitle">
        All transactions are secure and encrypted.
      </p>

      <div className="payment-card-container">
        {/* Selected Payment Method Header */}
        <div className="payment-card-header">
          <span>Credit card</span>
        </div>

        {/* Card Body & Fields */}
        <div className="payment-card-body">
          {/* Testing Instruction Box */}
          <div className="testing-instruction-box">
            <div className="testing-instruction-title">Testing instruction</div>
            <div>Use these values to test your checkout:</div>
            <ul className="testing-instruction-list">
              <li>
                <strong>1</strong> to simulate an approved transaction
              </li>
              <li>
                <strong>2</strong> to simulate a declined transaction
              </li>
              <li>
                <strong>3</strong> to simulate a gateway failure
              </li>
            </ul>
            <div>Use any future expiration date and any 3-digit security code.</div>
            <div style={{ marginTop: "8px" }}>
              <a
                href="#support"
                className="checkout-link"
                onClick={(e) => e.preventDefault()}
              >
                Get support
              </a>
            </div>
          </div>

          {/* Card Fields */}
          <div className="checkout-input-group">
            <div className="checkout-input-wrapper">
              <input
                type="text"
                name="cardNumber"
                className={`checkout-input ${errors.cardNumber ? "error" : ""}`}
                placeholder="Card number"
                value={formData.cardNumber || ""}
                onChange={handleChange}
              />
              <button
                type="button"
                className="checkout-input-icon-btn"
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </button>
            </div>
            {errors.cardNumber && (
              <div className="checkout-error-text">{errors.cardNumber}</div>
            )}
          </div>

          <div className="checkout-input-group checkout-grid-2">
            <div>
              <input
                type="text"
                name="cardExpiry"
                className={`checkout-input ${errors.cardExpiry ? "error" : ""}`}
                placeholder="Expiration date (MM / YY)"
                value={formData.cardExpiry || ""}
                onChange={handleChange}
              />
              {errors.cardExpiry && (
                <div className="checkout-error-text">{errors.cardExpiry}</div>
              )}
            </div>
            <div>
              <div className="checkout-input-wrapper">
                <input
                  type="text"
                  name="cardCvc"
                  className={`checkout-input ${errors.cardCvc ? "error" : ""}`}
                  placeholder="Security code"
                  value={formData.cardCvc || ""}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="checkout-input-icon-btn"
                  title="3-digit code on back of card"
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
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </button>
              </div>
              {errors.cardCvc && (
                <div className="checkout-error-text">{errors.cardCvc}</div>
              )}
            </div>
          </div>

          <div className="checkout-input-group">
            <input
              type="text"
              name="cardName"
              className={`checkout-input ${errors.cardName ? "error" : ""}`}
              placeholder="Name on card"
              value={formData.cardName || ""}
              onChange={handleChange}
            />
            {errors.cardName && (
              <div className="checkout-error-text">{errors.cardName}</div>
            )}
          </div>

          {/* Billing Address Checkbox */}
          <div className="checkout-checkbox-row" style={{ marginTop: "16px" }}>
            <input
              type="checkbox"
              id="useShippingAsBilling"
              name="useShippingAsBilling"
              className="checkout-checkbox"
              checked={formData.useShippingAsBilling !== false}
              onChange={handleChange}
            />
            <label
              htmlFor="useShippingAsBilling"
              className="checkout-checkbox-label"
            >
              Use shipping address as billing address
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
