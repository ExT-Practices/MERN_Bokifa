import React, { useState } from "react";
import { useCart } from "../../context/CartContext";

const OrderSummary = ({ discountApplied, setDiscountApplied }) => {
  const [discountCode, setDiscountCode] = useState("");
  const [discountMsg, setDiscountMsg] = useState("");

  const { cart, cartLoading } = useCart();

  const handleApplyDiscount = (e) => {
    e.preventDefault();

    if (!discountCode.trim()) return;

    setDiscountApplied(true);
    setDiscountMsg("Discount code applied!");
  };

  const getProductImage = (product) => {
    if (!product?.image) {
      return "/images/bo_pro_10.webp";
    }

    if (
      product.image.startsWith("http://") ||
      product.image.startsWith("https://") ||
      product.image.startsWith("/")
    ) {
      return product.image;
    }

    return `/${product.image}`;
  };

  const cartItems = cart?.items || [];

  const subtotal = Number(cart?.totalAmount || 0);

  return (
    <div className="order-summary-container">
      {/* Product Item Row */}

      {cartLoading ? (
        <div className="order-product-row">
          <div className="order-product-info">
            <div className="order-product-details">
              <span className="order-product-title">Loading cart...</span>
            </div>
          </div>
        </div>
      ) : cartItems.length > 0 ? (
        cartItems.map((item) => {
          const product = item.product || {};

          return (
            <div
              className="order-product-row"
              key={item.cart_item_id || item.product_id}
            >
              <div className="order-product-info">
                <div className="order-product-image-wrapper">
                  <img
                    src={`http://localhost:5000${product.image}`}
                    alt={product.title || "Product"}
                    className="order-product-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/bo_pro_10.webp";
                    }}
                  />

                  <span className="order-product-badge">{item.quantity}</span>
                </div>

                <div className="order-product-details">
                  <span className="order-product-title">
                    {product.title || "Product"}
                  </span>

                  <span className="order-product-variant">
                    {product.author || "Book"}
                  </span>
                </div>
              </div>

              <span className="order-product-price">
                ₹{Number(item.subtotal || 0).toFixed(2)}
              </span>
            </div>
          );
        })
      ) : (
        <div className="order-product-row">
          <div className="order-product-info">
            <div className="order-product-details">
              <span className="order-product-title">Your cart is empty</span>
            </div>
          </div>
        </div>
      )}

      {/* Discount Code Section */}
      <div className="discount-code-wrapper">
        <input
          type="text"
          className="discount-input"
          placeholder="Discount code"
          value={discountCode}
          onChange={(e) => {
            setDiscountCode(e.target.value);

            if (discountMsg) {
              setDiscountMsg("");
            }
          }}
        />

        <button
          type="button"
          className={`discount-btn ${discountCode.trim() ? "active" : ""}`}
          onClick={handleApplyDiscount}
          disabled={!discountCode.trim()}
        >
          Apply
        </button>
      </div>

      {discountMsg && (
        <div
          style={{
            color: "#2e7d32",
            fontSize: "13px",
            marginBottom: "16px",
            marginTop: "-16px",
          }}
        >
          {discountMsg}
        </div>
      )}

      {/* Price Summary Table */}
      <div className="price-summary-table">
        <div className="price-summary-row">
          <span>Subtotal</span>

          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="price-summary-row">
          <span>Shipping</span>

          <span style={{ color: "#707070" }}>Enter shipping address</span>
        </div>

        <div className="price-summary-row total-row">
          <span className="total-label">Total</span>

          <div className="total-price-wrapper">
            <span className="total-currency">INR</span>

            <span className="total-amount">₹{subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
