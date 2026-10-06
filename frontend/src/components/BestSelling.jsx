import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const BestSelling = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist, wishlistUpdatingId } = useWishlist();
  useEffect(() => {
    const fetchBestSelling = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products", {
          params: {
            page: 2,
            limit: 10,
          },
        });

        setProducts((response.data.data || []).slice(0, 10));
      } catch (error) {
        console.error("Best Selling API Error:", error);
        setError(error.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchBestSelling();
  }, []);

  return (
    <>
      {" "}
      <section
        id="shopify-section-template--23597515604251__product_carousel_bcNNdU"
        className="site-section homepage-highlight-section"
      >
        <section id="section-template--23597515604251__product_carousel_bcNNdU">
          <div className="container">
            <div class>
              <div className="section__header-countdown">
                <header
                  style={{ gap: "15px 0" }}
                  className="section-header text-left d-flex flex-wrap align-items-center justify-content-between mb-30"
                >
                  <div className="section__header-left">
                    <h3 className="heading h3 mb-20">
                      Current bestselling books
                    </h3>
                  </div>
                  <div
                    style={{ gap: "20px" }}
                    className="section-header-right d-flex flex-wrap"
                  >
                    <div className="btn-more">
                      <a
                        href="/collections/all"
                        className="button btn-outline"
                      >
                        browse all
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="8"
                          height="13"
                          viewBox="0 0 8 13"
                          fill="none"
                        >
                          <path
                            d="M7.46484 6.28516C7.72005 6.59505 7.72005 6.90495 7.46484 7.21484L2.21484 12.4648C1.90495 12.7201 1.59505 12.7201 1.28516 12.4648C1.02995 12.1549 1.02995 11.8451 1.28516 11.5352L6.07031 6.75L1.28516 1.96484C1.02995 1.65495 1.02995 1.34505 1.28516 1.03516C1.59505 0.779948 1.90495 0.779948 2.21484 1.03516L7.46484 6.28516Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </header>
              </div>
              <Swiper
                className="custom-swiper myswiper swiper-container product-swiper-list"
                modules={[Navigation, Pagination]}
                spaceBetween={15}
                slidesPerView={1}
                breakpoints={{
                  320: {
                    slidesPerView: 2,
                    spaceBetween: 10,
                  },
                  480: {
                    slidesPerView: 2,
                    spaceBetween: 12,
                  },
                  576: {
                    slidesPerView: 2,
                    spaceBetween: 16,
                  },
                  768: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                  },
                  992: {
                    slidesPerView: 4,
                    spaceBetween: 24,
                  },
                  1200: {
                    slidesPerView: 6,
                    spaceBetween: 30,
                  },
                }}
              >
                {loading ? (
                  <SwiperSlide>
                    <div className="slider__item" style={{ opacity: 1 }}>
                      <div
                        className="product-card-bg h-100"
                        style={{
                          backgroundColor: "#ffffff",
                          position: "relative",
                        }}
                      >
                        <div className="product-card-inner">
                          <div className="product-card-info">
                            <div className="product-card-meta">
                              Loading products...
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ) : error ? (
                  <SwiperSlide>
                    <div className="slider__item" style={{ opacity: 1 }}>
                      <div
                        className="product-card-bg h-100"
                        style={{
                          backgroundColor: "#ffffff",
                          position: "relative",
                        }}
                      >
                        <div className="product-card-inner">
                          <div className="product-card-info">
                            <div className="product-card-meta">{error}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ) : (
                  products.map((product) => (
                    <SwiperSlide key={product.product_id}>
                      <div
                        className="slider__item"
                        style={{ opacity: 1 }}
                        id={`product-item-${product.product_id}`}
                      >
                        <div
                          className="product-card-bg h-100"
                          style={{
                            backgroundColor: "#ffffff",
                            position: "relative",
                          }}
                        >
                          <div className="product-card-inner">
                            <span className="product-card-divider"></span>
                            <div className="product-card-image-wrapper product-card-image-wrapper--multiple">
                              <div className="product-card-badge-list label-list label-list-sale">
                                <div className="label label--highlight">
                                  -15%
                                </div>
                              </div>
                              <div className="product-card-badge-list label-list label-list-sale">
                                {product.discount && (
                                  <div
                                    className={`label label--highlight ${product.discount === "SOLD" ? "label--subdued" : ""}`}
                                  >
                                    {product.discount}
                                  </div>
                                )}
                              </div>
                              <a
                                href={`/products/${product.product_id}`}
                                className="product-card-aspect-ratio aspect-ratio"
                                style={{
                                  paddingBottom: "100%",
                                  aspectRatio: 0.71,
                                }}
                              >
                                <img
                                  className="product-card-primary-image"
                                  loading="eager"
                                  src={`http://localhost:5000${product.image}`}
                                  sizes="(min-width: 1200px) 550px, (min-width: 750px) calc((100vw - 130px)/2), calc((100vw - 50px)/2)"
                                  width="520"
                                  height="728"
                                />
                                <img
                                  className="product-card-secondary-image"
                                  loading="eager"
                                  src={
                                    product.images?.[1]
                                      ? `http://localhost:5000${product.images[1]}`
                                      : `http://localhost:5000${product.image}`
                                  }
                                  sizes="(min-width: 1200px) 550px, (min-width: 750px) calc((100vw - 130px)/2), calc((100vw - 50px)/2)"
                                  width="520"
                                  height="728"
                                />
                              </a>
                              <div title="Add to Wishlist">
                                <ap-wishlistbutton
                                  className="product-action-btn wishlist-btn"
                                  data-id={product.product_id}
                                  onClick={() =>
                                    toggleWishlist(product.product_id)
                                  }
                                >
                                  <div className="icon-product">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="20"
                                      height="20"
                                      viewBox="0 0 20 20"
                                      fill="none"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M9.99381 2.87856C7.99273 1.20992 5.08354 0.891102 2.8126 2.83145C0.32332 4.95834 -0.0402306 8.54472 1.93052 11.0807C2.66674 12.028 4.09533 13.4422 5.45783 14.7282C6.83947 16.0323 8.21758 17.2643 8.89705 17.866C8.90151 17.87 8.9061 17.8741 8.91081 17.8782C8.97358 17.9339 9.0579 18.0086 9.13969 18.0702C9.23936 18.1453 9.38828 18.243 9.58926 18.3029C9.85277 18.3815 10.1357 18.3815 10.3992 18.3029C10.6002 18.243 10.7491 18.1453 10.8488 18.0702C10.9306 18.0086 11.0149 17.9339 11.0777 17.8782C11.0824 17.874 11.087 17.87 11.0914 17.866C11.7709 17.2643 13.149 16.0323 14.5307 14.7282C15.8932 13.4422 17.3218 12.028 18.058 11.0807C20.0199 8.55608 19.7144 4.9412 17.1655 2.82268C14.8714 0.915949 11.9924 1.20942 9.99381 2.87856ZM9.23432 4.9299C7.86249 3.32611 5.70788 2.98827 4.1118 4.352C2.42599 5.79239 2.20175 8.17034 3.50972 9.85343C4.13651 10.66 5.45191 11.9724 6.83064 13.2737C8.05026 14.4249 9.27051 15.5221 9.99425 16.1657C10.718 15.5221 11.9382 14.4249 13.1579 13.2737C14.5366 11.9724 15.852 10.66 16.4788 9.85343C17.7956 8.15897 17.585 5.77201 15.8871 4.36077C14.2448 2.99581 12.1185 3.33492 10.7542 4.92991C10.5642 5.15202 10.2865 5.27989 9.99425 5.27989C9.70196 5.27989 9.42431 5.15202 9.23432 4.9299Z"
                                        fill="none"
                                        stroke={
                                          isWishlisted(product.product_id)
                                            ? "#ff0000"
                                            : "currentColor"
                                        }
                                      />
                                    </svg>
                                  </div>
                                </ap-wishlistbutton>

                                <span className="text-name d-none">
                                  Add to Wishlist
                                </span>
                              </div>
                              <div className="product-action-buttons">
                                <div title="Quickview">
                                  <div className="product-action-btn quickview-btn">
                                    <div className="product-card-quick-form">
                                      <button className="button button--outline button--text button--full">
                                        <span className="loader-button-text">
                                          <span className="loader-button-text">
                                            <div className="icon-product">
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  clipRule="evenodd"
                                                  d="M5.40569 6.997C4.16878 8.02934 3.30115 9.2447 2.86227 9.93962C2.84737 9.9632 2.83498 9.98285 2.82426 9.99996C2.83498 10.0171 2.84737 10.0367 2.86227 10.0603C3.30115 10.7552 4.16878 11.9706 5.40569 13.0029C6.64025 14.0333 8.18242 14.8333 10.0003 14.8333C11.8183 14.8333 13.3604 14.0333 14.595 13.0029C15.8319 11.9706 16.6995 10.7552 17.1384 10.0603C17.1533 10.0367 17.1657 10.0171 17.1764 9.99996C17.1657 9.98285 17.1533 9.9632 17.1384 9.93962C16.6995 9.2447 15.8319 8.02934 14.595 6.997C13.3604 5.96662 11.8183 5.16663 10.0003 5.16663C8.18242 5.16663 6.64025 5.96662 5.40569 6.997ZM4.12416 5.46153C5.58338 4.24364 7.56408 3.16663 10.0003 3.16663C12.4366 3.16663 14.4173 4.24364 15.8765 5.46153C17.3334 6.67745 18.3304 8.08161 18.8294 8.87167C18.8361 8.8823 18.8431 8.8933 18.8504 8.90468C18.9481 9.05825 19.0896 9.2807 19.1606 9.59036C19.2182 9.8415 19.2182 10.1584 19.1606 10.4096C19.0896 10.7192 18.9481 10.9417 18.8504 11.0952C18.8431 11.1066 18.8361 11.1176 18.8294 11.1282C18.3304 11.9183 17.3334 13.3225 15.8765 14.5384C14.4173 15.7563 12.4366 16.8333 10.0003 16.8333C7.56408 16.8333 5.58339 15.7563 4.12416 14.5384C2.66729 13.3225 1.67023 11.9183 1.17127 11.1282C1.16455 11.1176 1.15755 11.1066 1.15031 11.0952C1.05259 10.9417 0.911025 10.7192 0.840047 10.4096C0.782484 10.1584 0.782484 9.8415 0.840047 9.59036C0.911026 9.2807 1.05259 9.05825 1.15031 8.90468C1.15755 8.8933 1.16455 8.8823 1.17127 8.87167C1.67023 8.08161 2.66729 6.67745 4.12416 5.46153ZM10.0003 8.49996C9.17191 8.49996 8.50034 9.17153 8.50034 9.99996C8.50034 10.8284 9.17191 11.5 10.0003 11.5C10.8288 11.5 11.5003 10.8284 11.5003 9.99996C11.5003 9.17153 10.8288 8.49996 10.0003 8.49996ZM6.50034 9.99996C6.50034 8.06696 8.06734 6.49996 10.0003 6.49996C11.9333 6.49996 13.5003 8.06696 13.5003 9.99996C13.5003 11.933 11.9333 13.5 10.0003 13.5C8.06734 13.5 6.50034 11.933 6.50034 9.99996Z"
                                                  fill="currentColor"
                                                ></path>
                                              </svg>
                                            </div>
                                          </span>
                                          <span
                                            className="loader-button-spinner"
                                            hidden
                                          >
                                            <div className="spinner">
                                              <svg
                                                focusable="false"
                                                width="24"
                                                height="24"
                                                className="icon icon--spinner"
                                                viewBox="25 25 50 50"
                                              >
                                                <circle
                                                  cx="50"
                                                  cy="50"
                                                  r="20"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="5"
                                                ></circle>
                                              </svg>
                                            </div>
                                          </span>
                                        </span>
                                        <span
                                          className="loader-button-spinner"
                                          hidden
                                        >
                                          <div className="spinner">
                                            <svg
                                              focusable="false"
                                              width="24"
                                              height="24"
                                              className="icon icon--spinner"
                                              viewBox="25 25 50 50"
                                            >
                                              <circle
                                                cx="50"
                                                cy="50"
                                                r="20"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="5"
                                              ></circle>
                                            </svg>
                                          </div>
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                  <span className="text-name">Quick view</span>
                                </div>
                                <div title="Add to Conpare">
                                  <ap-comparebutton className="product-action-btn compare-btn">
                                    <div className="icon-product">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          clipRule="evenodd"
                                          d="M8.74408 1.2442C9.06952 0.918763 9.59715 0.918763 9.92259 1.2442L12.4226 3.7442C12.748 4.06964 12.748 4.59727 12.4226 4.92271L9.92259 7.42271C9.59715 7.74815 9.06952 7.74815 8.74408 7.42271C8.41864 7.09727 8.41864 6.56964 8.74408 6.2442L9.82149 5.16679H7.66667C4.90524 5.16679 2.66667 7.40537 2.66667 10.1668C2.66667 12.1601 3.83306 13.8827 5.52424 14.686C5.93996 14.8835 6.11687 15.3806 5.91938 15.7963C5.7219 16.2121 5.2248 16.389 4.80909 16.1915C2.5587 15.1224 1 12.8275 1 10.1668C1 6.48489 3.98477 3.50012 7.66667 3.50012H9.82149L8.74408 2.42271C8.41864 2.09727 8.41864 1.56964 8.74408 1.2442ZM14.414 4.53724C14.6114 4.12152 15.1085 3.94461 15.5242 4.1421C17.7746 5.21114 19.3333 7.50611 19.3333 10.1668C19.3333 13.8487 16.3486 16.8335 12.6667 16.8335H10.5118L11.5893 17.9109C11.9147 18.2363 11.9147 18.7639 11.5893 19.0894C11.2638 19.4148 10.7362 19.4148 10.4107 19.0894L7.91074 16.5894C7.58531 16.2639 7.58531 15.7363 7.91074 15.4109L10.4107 12.9109C10.7362 12.5854 11.2638 12.5854 11.5893 12.9109C11.9147 13.2363 11.9147 13.7639 11.5893 14.0894L10.5118 15.1668H12.6667C15.4281 15.1668 17.6667 12.9282 17.6667 10.1668C17.6667 8.17347 16.5003 6.45093 14.8091 5.64753C14.3934 5.45005 14.2165 4.95295 14.414 4.53724Z"
                                          fill="currentColor"
                                        ></path>
                                      </svg>
                                    </div>
                                  </ap-comparebutton>
                                  <span className="text-name">
                                    Add to compare
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="product-card-info">
                              <div className="product-card-meta">
                                <div
                                  className="review-widget review-preview-badge review-preview-badge--with-link review-done-setup"
                                  data-widget-name="preview_badge"
                                  data-impressions-tracked="true"
                                  data-views-tracked="true"
                                >
                                  <div
                                    style={{ display: "none" }}
                                    className="review-summary-badge"
                                    data-average-rating="0.00"
                                    data-number-of-reviews="0"
                                    data-number-of-questions="0"
                                  >
                                    <span
                                      className="review-summary-stars"
                                      data-score="0.00"
                                      tabIndex="0"
                                      aria-label="0.00 stars"
                                      role="button"
                                    >
                                      <span className="review-star review-star-empty"></span>
                                      <span className="review-star review-star-empty"></span>
                                      <span className="review-star review-star-empty"></span>
                                      <span className="review-star review-star-empty"></span>
                                      <span className="review-star review-star-empty"></span>
                                    </span>
                                    <span className="review-summary-count">
                                      (0)
                                    </span>
                                  </div>
                                </div>
                                <a
                                  href={`/products/${product.product_id}`}
                                  className="product-card-title mb-1"
                                >
                                  {product.title || ""}
                                </a>
                                <div className="product-author my-2">
                                  <a href="#">{product.author || ""}</a>
                                </div>
                                <div className="product-description d-none">
                                  {product.description || ""}
                                </div>
                                <div className="product-price">
                                  <div className="product-card-price-container">
                                    <div className="price-list">
                                      <span className="price">
                                        <span className="visually-hidden">
                                          regular price
                                        </span>
                                        ₹{Number(product.price || 0).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="product-card-quantity">
                                  <div className="product-add-cart-action w-100">
                                    <div
                                      title="Add to cart"
                                      className="product-action-btn add-to-cart-btn"
                                    >
                                      <form
                                        onSubmit={async (e) => {
                                          e.preventDefault();
                                          await addToCart(
                                            product.product_id,
                                            1,
                                          );
                                        }}
                                        id={`product-form-${product.product_id}`}
                                        acceptCharset="UTF-8"
                                        className="product-card-form"
                                        enctype="multipart/form-data"
                                        data-is="ap-productform"
                                      >
                                        <button
                                          data-is="loader-button"
                                          type="submit"
                                          className="button button--outline button--text button--full"
                                        >
                                          <span className="loader-button-text">
                                            <span className="loader-button-text">
                                              <div className="icon-product">
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="9"
                                                  height="8"
                                                  viewBox="0 0 9 8"
                                                  fill="none"
                                                >
                                                  <path
                                                    d="M3.5 0H5.5V8H3.5V0Z"
                                                    fill="currentColor"
                                                  ></path>
                                                  <path
                                                    d="M0.5 5L0.5 3L8.5 3V5L0.5 5Z"
                                                    fill="currentColor"
                                                  ></path>
                                                </svg>
                                              </div>
                                              Add to cart
                                            </span>
                                            <span
                                              className="loader-button-spinner"
                                              hidden
                                            >
                                              <div className="spinner">
                                                <svg
                                                  focusable="false"
                                                  width="24"
                                                  height="24"
                                                  className="icon icon--spinner"
                                                  viewBox="25 25 50 50"
                                                >
                                                  <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="20"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="5"
                                                  ></circle>
                                                </svg>
                                              </div>
                                            </span>
                                          </span>
                                          <span
                                            className="loader-button-spinner"
                                            hidden
                                          >
                                            <div className="spinner">
                                              <svg
                                                focusable="false"
                                                width="25"
                                                height="25"
                                                className="icon icon--spinner"
                                                viewBox="25 25 50 50"
                                              >
                                                <circle
                                                  cx="50"
                                                  cy="50"
                                                  r="20"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="4"
                                                ></circle>
                                              </svg>
                                            </div>
                                          </span>
                                        </button>
                                        <button
                                          type="submit"
                                          className="product-card-quick-buy-btn hide-on-no-touch"
                                        >
                                          <span className="visually-hidden">
                                            <div className="icon-product">
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="9"
                                                height="8"
                                                viewBox="0 0 9 8"
                                                fill="none"
                                              >
                                                <path
                                                  d="M3.5 0H5.5V8H3.5V0Z"
                                                  fill="currentColor"
                                                ></path>
                                                <path
                                                  d="M0.5 5L0.5 3L8.5 3V5L0.5 5Z"
                                                  fill="currentColor"
                                                ></path>
                                              </svg>
                                            </div>
                                          </span>
                                          <svg
                                            focusable="false"
                                            width="22"
                                            height="21"
                                            className="icon icon--quick-buy"
                                            fill="none"
                                            viewBox="0 0 22 21"
                                          >
                                            <path
                                              d="M12 4H3L2 20H18C17.7517 16.0273 17.375 10 17.375 10"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                            ></path>
                                            <path
                                              d="M7 7V7C7 8.65685 8.34315 10 10 10V10C11.6569 10 13 8.65685 13 7V7"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                            ></path>
                                            <path
                                              d="M18 0V8M14 4H22"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                            ></path>
                                          </svg>
                                        </button>
                                      </form>
                                    </div>
                                    <span className="text-name">
                                      {" "}
                                      Add to cart{" "}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))
                )}
              </Swiper>
            </div>
          </div>
        </section>
      </section>
      <section
        id="shopify-section-template--23597515604251__image_banner_p8qhQF"
        className="site-section section section-image-banner"
      >
        <section className="image-banner">
          <div className="container">
            <div
              className="wrapper-banner-content object-loaded"
              style={{ opacity: "1" }}
            >
              <div className="banner-content has-overlay">
                <div className="banner-image">
                  <img
                    className="banner-list-image"
                    sizes="(max-width: 740px) 80vw, (max-width: 999px) 60vw, 425px"
                    src="images/bo_banner.webp"
                    height="450"
                    width="1530"
                    style={{ opacity: "1" }}
                    alt="Best Collection"
                  />
                </div>

                <div
                  id="text-text_Ug9hay"
                  className="container banner-text d-flex flex-column align-items-start justify-content-center"
                >
                  <div className="text-left">
                    <h3
                      style={{
                        color: "rgb(246, 250, 54)",
                        opacity: "1",
                      }}
                      className="heading sub-heading-2 mb-12"
                    >
                      Best Collection
                    </h3>

                    <h2
                      style={{
                        color: "rgb(255, 255, 255)",
                        opacity: "1",
                      }}
                      className="heading h3 image-banner-title_center fw-semibold text-uppercase mb-12"
                    >
                      Top favourite
                      <br />
                      thriller stories
                    </h2>

                    <p
                      style={{ color: "#ffffff" }}
                      className="image-banner-description mb-md-3 mb-2 pb-1"
                    >
                      Find our take on the best books of all time.
                    </p>

                    <a href="#" className="button btn-base">
                      discover now
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="8"
                        height="13"
                        viewBox="0 0 8 13"
                        fill="none"
                      >
                        <path
                          d="M7.46484 6.28516C7.72005 6.59505 7.72005 6.90495 7.46484 7.21484L2.21484 12.4648C1.90495 12.7201 1.59505 12.7201 1.28516 12.4648C1.02995 12.1549 1.02995 11.8451 1.28516 11.5352L6.07031 6.75L1.28516 1.96484C1.02995 1.65495 1.02995 1.34505 1.28516 1.03516C1.59505 0.779948 1.90495 0.779948 2.21484 1.03516L7.46484 6.28516Z"
                          fill="currentColor"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </>
  );
};

export default BestSelling;
