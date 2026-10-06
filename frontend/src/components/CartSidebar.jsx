import { useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
const CartSidebar = ({ isCartOpen, onClose }) => {
  const { cart, updateCartItem, removeFromCart, cartLoading, updatingId } =
    useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isCartOpen) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, onClose]);

  const handleQuantityChange = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;

    if (newQuantity < 1) return;

    try {
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      console.error("Sidebar Quantity Update Error:", error);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error("Sidebar Remove Error:", error);
    }
  };

  return (
    <>
      <div
        id="shopify-section-mini-cart"
        className="site-section mini-cart-drawer-section"
      >
        <ap-cartdrawer
          className="mini-cart drawer drawer--large"
          open={isCartOpen ? "" : undefined}
        >
          <span className="drawer__overlay" onClick={onClose}></span>

          <header className="offcanvas-header">
            <p className="drawer_title heading h6">
              <svg
                focusable="false"
                width="20"
                height="18"
                className="icon icon--header-cart"
                style={{ marginRight: "12px" }}
                viewBox="0 0 20 18"
              >
                <path
                  d="M3 1h14l1 16H2L3 1z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M7 4v0a3 3 0 003 3v0a3 3 0 003-3v0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>

              <span className="drawer-title-text">Your cart</span>
            </p>

            <button
              type="button"
              className="drawer__close-button top-area"
              aria-label="Close"
              onClick={onClose}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </header>

          {cartLoading ? (
            <div className="drawer-content drawer_content-center">
              <p>Loading cart...</p>
            </div>
          ) : cart.items.length === 0 ? (
            <div className="drawer-content drawer_content-center">
              <p>Your cart is empty</p>

              <div className="button-wrapper">
                <Link
                  to="/"
                  className="button button--primary"
                  onClick={onClose}
                >
                  Start shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="drawer-content" style={{ width: "100%" }}>
              {cart.items.map((item) => {
                const product = item.product;

                const productImage = product?.image
                  ? `http://localhost:5000${product.image}`
                  : "";

                const isUpdating = updatingId === item.product_id;

                return (
                  <div
                    key={item.cart_item_id}
                    className="cart-item-content-wrapper"
                    style={{
                      opacity: isUpdating ? 0.6 : 1,
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    <Link
                      to={`/products/${item.product_id}`}
                      className="cart-item-image-wrapper"
                      onClick={onClose}
                    >
                      {productImage ? (
                        <img
                          className="cart-item-image"
                          loading="lazy"
                          src={productImage}
                          alt={product?.title || "Product"}
                        />
                      ) : (
                        <div
                          className="cart-item-image"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f5f5f5",
                          }}
                        >
                          No Image
                        </div>
                      )}
                    </Link>

                    <div className="cart-item-info">
                      <div className="product-card-meta">
                        <Link
                          to={`/products/${item.product_id}`}
                          className="product-card-title text--small"
                          onClick={onClose}
                        >
                          {product?.title || "Product"}
                        </Link>

                        {product?.author && (
                          <div
                            className="text--small"
                            style={{
                              marginTop: "4px",
                              opacity: 0.7,
                            }}
                          >
                            {product.author}
                          </div>
                        )}

                        <div className="product-card-price-container text--small">
                          <div className="price-list">
                            <span className="price">
                              ₹{Number(item.price || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="cart-item-quantity">
                        <div className="quantity-selector quantity-selector--small">
                          <button
                            type="button"
                            className="quantity-selector-button"
                            aria-label="Decrease quantity"
                            disabled={isUpdating || item.quantity <= 1}
                            onClick={() =>
                              handleQuantityChange(
                                item.product_id,
                                item.quantity,
                                -1,
                              )
                            }
                          >
                            <svg width="8" height="2" viewBox="0 0 8 2">
                              <path fill="currentColor" d="M0 0h8v2H0z" />
                            </svg>
                          </button>

                          <input
                            className="quantity-selector-input text--xsmall"
                            type="text"
                            value={item.quantity}
                            size="2"
                            aria-label="Quantity"
                            readOnly
                          />

                          <button
                            type="button"
                            className="quantity-selector-button"
                            aria-label="Increase quantity"
                            disabled={isUpdating}
                            onClick={() =>
                              handleQuantityChange(
                                item.product_id,
                                item.quantity,
                                1,
                              )
                            }
                          >
                            <svg width="8" height="8" viewBox="0 0 8 8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3 5v3h2V5h3V3H5V0H3v3H0v2h3z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                        </div>

                        <button
                          type="button"
                          className="cart-item-remove-button link text--subdued text--xxsmall"
                          disabled={isUpdating}
                          onClick={() => handleRemove(item.product_id)}
                        >
                          remove
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-price-container text--small hide-on-phone">
                      <div className="price-list price-list--stack">
                        <span className="price">
                          ₹{Number(item.subtotal || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {cart.items.length > 0 && (
            <footer className="mini-cart__drawer-footer drawer__footer drawer__footer--tight drawer__footer--bordered">
              <div className="cart-footer-price">
                <span className="cart-subtotal-title">Subtotal:</span>

                <span className="cart-subtotal">
                  ₹{Number(cart.totalAmount || 0).toFixed(2)}
                </span>
              </div>

              <p className="cart-policies">
                Taxes and shipping calculated at checkout
              </p>

              <div>
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="cart-button button button--primary button--full"
                >
                  View Cart
                </Link>

                <Link
                  to="/checkouts"
                  onClick={onClose}
                  className="checkout-button button button--primary button--full"
                  style={{ marginTop: "10px" }}
                >
                  Checkout
                </Link>
              </div>
            </footer>
          )}
        </ap-cartdrawer>
      </div>
    </>
  );
};
export default CartSidebar;
