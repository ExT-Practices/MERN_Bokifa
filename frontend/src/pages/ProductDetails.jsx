import Footer from "../components/Footer";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NewsLetter from "../components/NewsLetter";
import api from "../api/axios";
import { DETAILS, DETAILSss } from "../data/ProductsData";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAccount } from "../account/context/AccountContext";
import {
  getProductReviews,
  submitProductReview,
  getMyProductReview,
} from "../api/reviewApi";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist, wishlistUpdatingId } = useWishlist();
  const { user, isLoggedIn } = useAccount();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState("Hardcover");
  const [activeTab, setActiveTab] = useState("description");

  const toggleProductTab = (tab) => {
    setActiveTab((prev) => (prev === tab ? "" : tab));
  };
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Customer reviews states
  const [reviews, setReviews] = useState([]);
  const [reviewMeta, setReviewMeta] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    ratingPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  // Review submission form states
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState({
    type: "",
    message: "",
  });
  const [reviewSort, setReviewSort] = useState("most-recent");
  const [showLoginNotice, setShowLoginNotice] = useState(false);

  const fetchReviews = async () => {
    if (!id) return;
    try {
      setLoadingReviews(true);
      const res = await getProductReviews(id);
      if (res?.success) {
        setReviews(res.data || []);
        if (res.meta) {
          setReviewMeta(res.meta);
        }
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkUserReview = async () => {
    if (!id || !isLoggedIn) {
      setUserHasReviewed(false);
      setUserReview(null);
      return;
    }
    try {
      const res = await getMyProductReview(id);
      if (res?.success) {
        setUserHasReviewed(Boolean(res.hasReviewed));
        setUserReview(res.review || null);
      }
    } catch (err) {
      console.error("Failed to check user review:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReviews();
      checkUserReview();
    }
  }, [id, isLoggedIn]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewFeedback({ type: "", message: "" });

    if (!isLoggedIn) {
      setShowLoginNotice(true);
      return;
    }

    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      setReviewFeedback({
        type: "danger",
        message: "Please select a star rating (1 to 5).",
      });
      return;
    }

    if (!reviewTitle.trim()) {
      setReviewFeedback({
        type: "danger",
        message: "Please enter a review title.",
      });
      return;
    }

    if (!reviewComment.trim()) {
      setReviewFeedback({
        type: "danger",
        message: "Please enter your review comments.",
      });
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await submitProductReview(id, {
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });

      if (res?.success) {
        setReviewFeedback({
          type: "success",
          message:
            "Review submitted successfully. It will appear after approval.",
        });
        setReviewTitle("");
        setReviewComment("");
        setReviewRating(5);
        setUserHasReviewed(true);
        setUserReview(res.data || { status: "pending" });
        setShowReviewForm(false);
      } else {
        setReviewFeedback({
          type: "danger",
          message: res?.message || "Failed to submit review.",
        });
      }
    } catch (err) {
      console.error("Submit Review Error:", err);
      const errMsg =
        err.response?.data?.message ||
        "Failed to submit review. Please try again.";
      setReviewFeedback({
        type: "danger",
        message: errMsg,
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${id}`);

        setProduct(response.data.data || response.data);
      } catch (error) {
        console.error("Product Details API Error:", error);

        setError(error.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);
  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };
  const handleBuyNow = async () => {
    if (!product?.product_id) {
      return;
    }

    try {
      await addToCart(product.product_id, quantity);

      navigate("/checkouts");
    } catch (error) {
      console.error("Buy Now Error:", error);
    }
  };
  const handleIncreaseQuantity = () => {
    setQuantity((prev) => {
      const stock = Number(product?.stock_quantity || 0);

      if (stock <= 0) {
        return 1;
      }

      return Math.min(stock, prev + 1);
    });
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");

    if (!value) {
      setQuantity(1);
      return;
    }

    const numericValue = Number(value);
    const stock = Number(product?.stock_quantity || 0);

    if (stock > 0) {
      setQuantity(Math.min(stock, Math.max(1, numericValue)));
    } else {
      setQuantity(1);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!product?.product_id) {
      return;
    }

    try {
      await addToCart(product.product_id, quantity);
    } catch (error) {
      console.error("Product Details Add To Cart Error:", error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product?.product_id) {
      return;
    }

    try {
      await toggleWishlist(product.product_id);
    } catch (error) {
      console.error("Product Details Wishlist Error:", error);
    }
  };
  if (loading) {
    return (
      <>
        <Header />
        <div
          className="container"
          style={{ padding: "100px 0", textAlign: "center" }}
        >
          Loading product...
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div
          className="container"
          style={{ padding: "100px 0", textAlign: "center" }}
        >
          {error || "Product not found"}
        </div>
        <Footer />
      </>
    );
  }
  return (
    <>
      <Header />
      <section
        id="shopify-section-template--23597517013275__main"
        className="site-section section main-product-section"
      >
        <section>
          <style>
            {`
.product__media {
    width: 52%;
    padding: 0!important;
  }
  .product__info {
    width: 48%;
  }
  .main-product {
    margin: 0;
    gap: 70px;
    max-width: 1440px;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 70px;
  }
  .main-product-wrapper {
    padding: 0 15px 0;
    background-color: #fff;
    border-radius: 10px;
    margin-bottom: 30px;
  }
  .product-form {
    row-gap: 0;
  }
  .product-meta-title {
    margin-bottom: 21px;
  }
  .product-meta-price-container .price{
    font-size: 30px;
    line-height: 1;
    font-weight: 600;
    margin: 0;
  }
  .product__info .price--compare {
    color: var(--color-accent-1);
    font-weight: 400;
    font-size: 14px;
    line-height: 28px;
  }
  .product__info .label--highlight {
    width: 100%;
    border-radius: 0;
  }
  .product__info .review-widget.review-widget {
    margin-bottom: 11px;
  }
  .productinfo_title {
    font-weight: 600;
    color: rgb(var(--heading-color));
    text-transform: uppercase;
    line-height: 30px;
    display: inline-block;
    font-size: 12px;
  }
  .wp-sku-categories {
    display: flex;
    align-items: center;
    gap: 18px;
    font-size: 14px;
    flex-wrap: wrap;
    padding-bottom: 19px;
    border-bottom: 1px solid rgb(var(--border-color));
    margin-bottom: 22px;
  }
  .product-category-link ,
  .product-meta-sku-number {
    color: #000;
  }
  .product-description .elementor-size-default {
    display: none;
  }
  .product-form-variants {
    padding-top: 17px;
    margin-top: 29px;
    border-width: 1px 0 0px;
    border-style: solid;
    border-color: rgb(var(--border-color));
  }
  .product__info .product-form-variants {
    margin-bottom: 0;
  }
  .product-form-option-info {
    text-transform: uppercase;
    font-family: "Fraunces";
    font-weight: 700;
    font-size: 14px;
    line-height: 22px;
  }
  .product-form .quantity_wrapper .product-form-quantity-label {
    display: none!important;
  }
  .quantity_wrapper .product-form-payment-container {
    margin: 0;
  }
  .quantity-selector {
    border: 0px solid rgb(var(--border-color));
    background-color: #f6f6f6;
  }
  .quantity_wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 23px;
    margin-top: 29px;
    padding-top: 31px;
    border-top: 1px solid rgb(var(--border-color));
  }
  .product__info .product-form-buy-buttons {
    width: 100%;
  }
  .product__info .payment-button-wrapper ,
  .quantity_wrapper button#AddToCart {
    flex: 1;
  }
  @media (max-width: 576px) {
    .quantity_wrapper button#AddToCart {
      flex: unset;
    }
    .main-product {
      padding-bottom: 0;
    }
  }
  .quantity_wrapper .loader-button-text {
    flex-direction: row;
  }
  .product__info .text-name {
    display: block;
  }
  .product__info .product-form-payment-container {
    display: flex;
    flex-wrap: wrap;
  }
  .single_variation_wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0 25px;
    margin-bottom: 23px;
    text-align: center;
    flex-wrap: wrap;
    gap: 35px;
    border-bottom: 1px solid rgb(var(--border-color));
  }
  .btn-variation {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    text-transform: capitalize;
    cursor: pointer;
    transition: all .4s;
    font-size: 14px;
  }
  .product-form .text-name {
    display: block;
    color: var(--color-accent-1);
  }
  .product-form .icon-product {
    margin-bottom: -2px;
  }
  .single_variation_wrap .icon-product path {
    stroke: #DDDBD4;
  }
  .btn-variation.active path {
    stroke: red;
  }
  .policy-content {
    font-size: 14px;
    line-height: 30px;
    font-weight: 500;
  }
  .product__info .product-meta {
    margin-bottom: 0;
    padding-bottom: 0;
    border: none;
  }
  .policy-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .product-policy {
    margin-bottom: 23px;
    font-family: "manrope";
    font-weight: 700 !important;
  }
  .policy-icon {
    line-height: 1;
  }
  ap-upsell .slider__item ,
  ap-crossselling .slider__item {
    flex: 1;
  }
  .product-categories ,
  .product-tags {
    line-height: 30px;
    font-family: "manrope";
    font-weight: 700
  }
  .product-categories span ,
  .product-tags span {
    color: rgb(var(--heading-color));
  }
  .product-payment {
    padding: 22px 0 28px;
    text-align: center;
    border-radius: 5px;
    margin-bottom: 23px;
  }
  .product-payment-title {
    font-size: 14px;
    line-height: 18px;
    margin-bottom: 10px;
    font-family: "Fraunces";
    text-transform: uppercase;
    color: #000;
  }
  .product-meta-share-list svg {
    width: 16px;
    height: 16px;
  }
  .product-meta-share-item {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
  .product-meta-share-twitter {
    background-color: #1DA1F2;
  }
  .product-meta-share-facebook {
    background-color: #3B5998;
  }
  .product-meta-share-pinterest {
    background-color: #E60023;
  }
  .product-meta-share-linkedin {
    background-color: #0077B5;
  }
  @media screen and (min-width: 1000px) {
    :root {
      --anchor-offset: 140px; /* When the sticky form is activate, every scroll must be offset by an extra value */
    }
  }
  .main-product-section {
    margin-top: 0;
  }
  .product-description {
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    padding-bottom: 0;
    font-family: "manrope";
    font-weight: 600
  }
  @media (max-width: 999px) {
    .product__media ,
    .product__info {
      width: 100%;
    }
    .quantity_wrapper {
      flex-wrap: wrap;
    }
  }`}
          </style>
          <div className="container">
            <style data-shopify="">
              {`
              .breadcrumb svg{
        width: 20px;
        float: left;
        margin-right: 5px;
        margin-bottom: 5px;
    }`}
            </style>
            <nav aria-label="Breadcrumb" className="breadcrumb text--xsmall">
              <ol className="breadcrumb__list" role="list">
                <li className="breadcrumb__item">
                  <a className="breadcrumb__link" href="/">
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="home"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 576 512"
                      className="icon icon-home"
                    >
                      <path
                        fill="currentColor"
                        d="M541 229.16l-61-49.83v-77.4a6 6 0 0 0-6-6h-20a6 6 0 0 0-6 6v51.33L308.19 39.14a32.16 32.16 0 0 0-40.38 0L35 229.16a8 8 0 0 0-1.16 11.24l10.1 12.41a8 8 0 0 0 11.2 1.19L96 220.62v243a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16v-128l64 .3V464a16 16 0 0 0 16 16l128-.33a16 16 0 0 0 16-16V220.62L520.86 254a8 8 0 0 0 11.25-1.16l10.1-12.41a8 8 0 0 0-1.21-11.27zm-93.11 218.59h.1l-96 .3V319.88a16.05 16.05 0 0 0-15.95-16l-96-.27a16 16 0 0 0-16.05 16v128.14H128V194.51L288 63.94l160 130.57z"
                      ></path>
                    </svg>
                    Home
                  </a>
                </li>

                <li className="breadcrumb__item">
                  <span
                    className="breadcrumb__link"
                    ap-currentaria="page"
                    style={{ color: "#666" }}
                  >
                    {product.title}
                  </span>
                </li>
              </ol>
            </nav>
            <div className="main-product-wrapper">
              <div className="main-product product--thumbnails-bottom">
                <style data-shopify="">{`
.product__media-item-external_video iframe{
  width: 100%;
  height: 300px;
}
.modal-full .content-popup-modal {
  display: flex;
}
.modal-full iframe{
  width: 100%;
  height: 100%;
  max-width: 1000px;
  max-height: 560px;
  margin: auto;
  display: block;
}
.modal-full video{
  width: 100%;
  max-width: 1000px;
  margin: auto;
  max-height: 90%;
}
.product-popup-media{
  display: block;
  margin-top: 15px;
}
.product-popup-media svg{
  position: absolute;
  width: 100px;
  height: 100px;
  top: calc(50% - 50px);
  left: calc(50% - 50px);
  background-color: #fff;
  padding: 20px;
  border-radius: 50%;
}
.product__media-item {  
  margin-bottom: 15px;
}

.product__media-item {  
  opacity: 0;
  transition: all .4s;
}
.flickity-viewport .product__media-item ,
.product__media-item.d-show {
  opacity: 1;      
}`}</style>

                <div id="ap_product_detail_media" className="product__media">
                  <ap-productmedia
                    form-id="ap-productform-template--23597517013275__main-9713931944219"
                    autoplay-video={true}
                    thumbnails-position="bottom"
                    reveal-on-scroll={true}
                    product-handle="a-good-morning-america-book-club-pick-2"
                    className="object-loaded"
                    style={{ opacity: "1" }}
                  >
                    <div className="product-media-list-wrapper">
                      <ap-flickitycarousel
                        click-nav={true}
                        flickity-config='{
        "adaptiveHeight": true,
        "dragThreshold": 10,
        "initialIndex": ".is-initial-selected",
        "fade": false,
        "draggable": "&gt;1",
        "contain": true,  
        "imagesLoaded": true,  
        "resize": true,  
        "cellSelector": ".product__media-item:not(.is-filtered)",
        "percentPosition": false,
        "pageDots": false,
        "prevNextButtons": false
      }'
                        id="product-template--23597517013275__main-9713931944219-media-list"
                        className="product-media-list object-loaded flickity-enabled is-draggable is-hovering-left"
                      >
                        <div
                          id="product-template--23597517013275__main-39082503438619"
                          className="product__media-item product__media-item-image is-selected d-show"
                          data-media-type="image"
                          data-media-id="39082503438619"
                        >
                          <div
                            style={{ paddingTop: "140.0%" }}
                            className="product-media-image-wrapper aspect-ratio aspect-ratio--natural"
                          >
                            <img
                              loading="lazy"
                              sizes="(max-width: 999px) calc(100vw - 48px), 640px"
                              alt={product.title}
                              src={`http://localhost:5000${product.image}`}
                              width="520"
                              height="728"
                              style={{ opacity: "1" }}
                            />
                          </div>
                        </div>
                      </ap-flickitycarousel>
                      <button
                        is="toggle-button"
                        ap-controlsaria="product-template--23597517013275__main-9713931944219-zoom"
                        ap-expanded-aria="false"
                        className="tap-target product__zoom-button"
                      >
                        <span className="visually-hidden">Zoom</span>
                        <svg
                          fill="none"
                          focusable="false"
                          width="14"
                          height="14"
                          className="icon icon--image-zoom   "
                          viewBox="0 0 14 14"
                        >
                          <path
                            d="M9.50184 9.50184C11.4777 7.52595 11.5133 4.358 9.58134 2.42602C7.64936 0.494037 4.48141 0.529632 2.50552 2.50552C0.529632 4.48141 0.494037 7.64936 2.42602 9.58134C4.358 11.5133 7.52595 11.4777 9.50184 9.50184ZM9.50184 9.50184L13 13"
                            stroke="currentColor"
                            strokeWidth="2"
                          ></path>
                        </svg>
                      </button>
                    </div>
                    <ap-flickitycontrols
                      controls="product-template--23597517013275__main-9713931944219-media-list"
                      className="product__media-nav"
                    >
                      <button
                        className="product-media-nav-buttons  hide-on-laptop-up tap-target tap-target-large"
                        aria-label="Previous"
                        data-action="prev"
                      >
                        <svg
                          focusable="false"
                          width="17"
                          height="14"
                          className="icon icon--nav-arrow-left  icon--direction-aware "
                          viewBox="0 0 17 14"
                        >
                          <path
                            d="M17 7H2M8 1L2 7l6 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                          ></path>
                        </svg>
                      </button>

                      <div className="dots-nav dots-nav--centered hide-on-laptop-up">
                        <button
                          type="button"
                          tabIndex="-1"
                          className="dots-nav__item  tap-target"
                          ap-currentaria="true"
                          ap-controlsaria="product-template--23597517013275__main-39082503438619"
                          data-media-id="39082503438619"
                          data-action="select"
                        >
                          <span className="visually-hidden">Go to slide 1</span>
                        </button>
                      </div>
                      <ap-shadowscroll className="product-thumbnail-shadowscroll hide-on-pocket">
                        <template shadowrootmode="open">
                          <style>{`
        :host {
          display: inline-block;
          contain: layout;
          position: relative;
        }
        
        :host([hidden]) {
          display: none;
        }
        
        s {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          pointer-events: none;
          background-image:
            var(--ap-shadowscroll-top, radial-gradient(farthest-side at 50% 0%, rgba(0,0,0,.2), rgba(0,0,0,0))),
            var(--ap-shadowscroll-bottom, radial-gradient(farthest-side at 50% 100%, rgba(0,0,0,.2), rgba(0,0,0,0))),
            var(--ap-shadowscroll-left, radial-gradient(farthest-side at 0%, rgba(0,0,0,.2), rgba(0,0,0,0))),
            var(--ap-shadowscroll-right, radial-gradient(farthest-side at 100%, rgba(0,0,0,.2), rgba(0,0,0,0)));
          background-position: top, bottom, left, right;
          background-repeat: no-repeat;
          background-size: 100% var(--top, 0), 100% var(--bottom, 0), var(--left, 0) 100%, var(--right, 0) 100%;
        }
      `}</style>
                          <slot></slot>
                          <s
                            style={{
                              "--top": "0px",
                              "--bottom": "0px",
                              "--left": "0px",
                              "--right": "0px",
                            }}
                          ></s>
                        </template>
                        <div className="product__thumbnail-list hide-scrollbar">
                          <div className="product__thumbnail-list-inner">
                            <button
                              type="button"
                              tabIndex="-1"
                              reveal=""
                              className="product__thumbnail-item  hide-on-pocket"
                              ap-currentaria="true"
                              ap-controlsaria="product-template--23597517013275__main-39082503438619"
                              data-media-id="39082503438619"
                              data-action="select"
                              style={{ opacity: "1" }}
                            >
                              <div className="product__thumbnail">
                                <img
                                  loading="lazy"
                                  sizes="(max-width: 999px) 72px, 60px"
                                  alt={product.title}
                                  src={`http://localhost:5000${product.image}`}
                                  width="520"
                                  height="728"
                                />
                              </div>
                            </button>
                          </div>
                        </div>
                      </ap-shadowscroll>
                      <button
                        className="product-media-nav-buttons  hide-on-laptop-up tap-target tap-target-large"
                        aria-label="Next"
                        data-action="next"
                      >
                        <svg
                          focusable="false"
                          width="17"
                          height="14"
                          className="icon icon--nav-arrow-right  icon--direction-aware "
                          viewBox="0 0 17 14"
                        >
                          <path
                            d="M0 7h15M9 1l6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                          ></path>
                        </svg>
                      </button>
                    </ap-flickitycontrols>
                  </ap-productmedia>
                </div>
                <div className="product__info">
                  {/* PRODUCT META */}
                  <ap-productmeta
                    form-id="ap-productform-template--23597517013275__main-9713931944219"
                    ap-priceclass="price--large"
                    className="product-meta"
                  >
                    <div className="product-form">
                      <h1 className="product-meta-title heading h2">
                        {product.title}
                      </h1>
                      <div
                        id="shopify-block-ARlhFdlhwemVXdWVpN__judge_me_reviews_preview_badge_jM7Dxx"
                        className="theme-block app-block"
                        data-block-handle="preview_badge"
                        style={{ cursor: "pointer", marginBottom: "12px" }}
                        onClick={() => {
                          setActiveTab("reviews");
                          const el = document.getElementById(
                            "block-AaVhUbEdMRFUyU3o0b__judge_me_reviews_review_widget_WH7V8q",
                          );
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                      >
                        <div
                          className="review-widget review-preview-badge review-preview-badge--with-link review-done-setup"
                          data-widget-name="preview_badge"
                        >
                          <div className="review-summary-badge d-flex align-items-center gap-2">
                            <span
                              className="review-summary-stars d-inline-flex align-items-center"
                              tabIndex="0"
                              aria-label="See all reviews"
                              role="button"
                            >
                              {[1, 2, 3, 4, 5].map((s) => (
                                <i
                                  key={s}
                                  className={
                                    reviewMeta.averageRating >= s
                                      ? "ri-star-fill"
                                      : reviewMeta.averageRating >= s - 0.5
                                        ? "ri-star-half-fill"
                                        : "ri-star-line"
                                  }
                                  style={{
                                    fontSize: "16px",
                                    color:
                                      reviewMeta.averageRating >= s - 0.5
                                        ? "#f59e0b"
                                        : "#ccc",
                                    marginRight: "2px",
                                  }}
                                ></i>
                              ))}
                            </span>
                            <span
                              className="review-summary-count text-muted"
                              style={{ fontSize: "14px" }}
                            >
                              ({reviewMeta.totalReviews}{" "}
                              {reviewMeta.totalReviews === 1
                                ? "review"
                                : "reviews"}
                              )
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="wp-sku-categories">
                        <span
                          className="product-meta-sku text--subdued text--xxsmall"
                          data-product-sku-container=""
                        >
                          <span className="productinfo_title">SKU:</span>
                          <span
                            className="product-meta-sku-number"
                            data-product-sku-number=""
                          >
                            {product.sku}
                          </span>
                        </span>
                        <div className="product-categories d-none">
                          <span className="productinfo_title">
                            Categories :{" "}
                          </span>

                          <a className="product-category-link" href="books">
                            Books
                          </a>
                        </div>
                        <ap-inventoryproduct
                          form-id="ap-productform-template--23597517013275__main-9713931944219"
                          className="product-form-inventory-wrapper"
                        >
                          <span
                            className={`inventory ${
                              Number(product.stock_quantity) > 0
                                ? "inventory--high"
                                : "inventory--low"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="11"
                              viewBox="0 0 16 11"
                              fill="none"
                            >
                              <path
                                d="M0 4.71429L1.6 3.14286L8 9.42857L6.4 11L0 4.71429Z"
                                fill="#15D11C"
                              ></path>

                              <path
                                d="M14.4 0L16 1.57143L6.4 11L4.8 9.42857L14.4 0Z"
                                fill="#15D11C"
                              ></path>
                            </svg>

                            {Number(product.stock_quantity) > 0
                              ? "In Stock"
                              : "Out of Stock"}
                          </span>
                        </ap-inventoryproduct>
                      </div>

                      <div
                        className="product-meta-price-container"
                        role="region"
                        aria-live="polite"
                      >
                        <div className="price-list" data-product-price-list="">
                          <span className="price price--highlight price--large">
                            <span className="price">
                              <span className="visually-hidden">
                                Regular price
                              </span>
                              ₹{Number(product.price).toFixed(2)}
                            </span>
                          </span>
                        </div>

                        <div
                          className="product-meta-label-list label-list"
                          data-product-label-list=""
                        ></div>
                      </div>

                      <div className="timer" data-date="2226-10-15T21:30:00Z">
                        <div className="timer-display">
                          <div className="timer-block">
                            <span className="timer-block__num js-timer-days">
                              73099
                            </span>

                            <span className="timer-block__unit">Days</span>
                          </div>

                          <div className="timer-block">
                            <span className="timer-block__num js-timer-hours">
                              14
                            </span>

                            <span className="timer-block__unit">Hours</span>
                          </div>

                          <div className="timer-block">
                            <span className="timer-block__num js-timer-minutes">
                              8
                            </span>

                            <span className="timer-block__unit">Minutes</span>
                          </div>

                          <div className="timer-block">
                            <span className="timer-block__num js-timer-seconds">
                              16
                            </span>

                            <span className="timer-block__unit">Seconds</span>
                          </div>
                        </div>
                      </div>

                      <style>
                        {`
    .timer {

        background: #f6fafd;

        padding: 10px;

        margin: 10px 0;

    }

    .timer--expired {

        display: none;

    }

    .timer__title {

        @extend .paragraph;

        text-align: center;

    }

    .timer-display {

        display: -webkit-box;

        display: -ms-flexbox;

        display: flex;

        -ms-flex-wrap: wrap;

        flex-wrap: wrap;

        -webkit-box-pack: justify;

        -ms-flex-pack: justify;

        justify-content: space-between;

        margin-top: 5px;

    }

    .timer-block {

        position: relative;

        width: 25%;

        padding: 0 var(--container-distance);

        &:not(:last-child):after {

            content: ':';

            position: absolute;

            right: 0;

            top: 3px;

        }

    }

    .timer-block__num,

    .timer-block__unit {

        display: block;

        text-align: center;

    }
`}
                      </style>

                      <div className="product-description">
                        <p>{product.description}</p>
                      </div>

                      <ap-productvariants
                        handle="a-good-morning-america-book-club-pick-2"
                        form-id="ap-productform-template--23597517013275__main-9713931944219"
                        update-url={true}
                        className="product-form-variants"
                      >
                        <div
                          className="product-form-option-selector"
                          data-selector-type="block"
                        >
                          <div className="product-form-option-info">
                            <span className="product-form-option-name">
                              Format:
                            </span>
                            <span
                              id="option-template--23597517013275__main-1-value"
                              className="product-form-option-value"
                            >
                              Hardcover
                            </span>
                          </div>

                          <div className="block-swatch-list">
                            <div className="block-swatch ">
                              <input
                                className="block-swatch__radio visually-hidden"
                                type="radio"
                                name="option1"
                                form="ap-productform-template--23597517013275__main-9713931944219"
                                id="option-template--23597517013275__main-1-1"
                                value="Hardcover"
                                checked={true}
                                data-bind-value="option-template--23597517013275__main-1-value"
                              />

                              <label
                                className="block-swatch__item"
                                htmlFor="option-template--23597517013275__main-1-1"
                              >
                                Hardcover
                              </label>
                            </div>
                            <div className="block-swatch ">
                              <input
                                className="block-swatch__radio visually-hidden"
                                type="radio"
                                name="option1"
                                form="ap-productform-template--23597517013275__main-9713931944219"
                                id="option-template--23597517013275__main-1-2"
                                value="Paperback"
                                data-bind-value="option-template--23597517013275__main-1-value"
                              />

                              <label
                                className="block-swatch__item"
                                htmlFor="option-template--23597517013275__main-1-2"
                              >
                                Paperback
                              </label>
                            </div>
                            <div className="block-swatch ">
                              <input
                                className="block-swatch__radio visually-hidden"
                                type="radio"
                                name="option1"
                                form="ap-productform-template--23597517013275__main-9713931944219"
                                id="option-template--23597517013275__main-1-3"
                                value="Ebook"
                                data-bind-value="option-template--23597517013275__main-1-value"
                              />

                              <label
                                className="block-swatch__item"
                                htmlFor="option-template--23597517013275__main-1-3"
                              >
                                Ebook
                              </label>
                            </div>
                            <div className="block-swatch ">
                              <input
                                className="block-swatch__radio visually-hidden"
                                type="radio"
                                name="option1"
                                form="ap-productform-template--23597517013275__main-9713931944219"
                                id="option-template--23597517013275__main-1-4"
                                value="Audio cd"
                                data-bind-value="option-template--23597517013275__main-1-value"
                              />

                              <label
                                className="block-swatch__item"
                                htmlFor="option-template--23597517013275__main-1-4"
                              >
                                Audio cd
                              </label>
                            </div>
                          </div>
                        </div>

                        <noscript>
                          <label
                            className="input__block-label"
                            htmlFor="product-select-template--23597517013275__main-9713931944219"
                          >
                            Variant
                          </label>
                          <div className="select-wrapper">
                            <select
                              className="select"
                              autoComplete="off"
                              id="product-select-template--23597517013275__main-9713931944219"
                              name="id"
                              form="ap-productform-template--23597517013275__main-9713931944219"
                            >
                              <option
                                selected={true}
                                value="49524723450139"
                                data-sku=""
                              >
                                A Short History of Nearly Everything Hardcover -
                                $428.00
                              </option>

                              <option value="49524723482907" data-sku="">
                                A Short History of Nearly Everything Paperback -
                                $43.00
                              </option>

                              <option value="49524723515675" data-sku="">
                                A Short History of Nearly Everything Ebook -
                                $43.00
                              </option>

                              <option value="49524723548443" data-sku="">
                                A Short History of Nearly Everything Audio cd -
                                $43.00
                              </option>
                            </select>
                            <svg
                              focusable="false"
                              width="12"
                              height="8"
                              className="icon icon--chevron   "
                              viewBox="0 0 12 8"
                            >
                              <path
                                fill="none"
                                d="M1 1l5 5 5-5"
                                stroke="currentColor"
                                strokeWidth="2"
                              ></path>
                            </svg>
                          </div>
                        </noscript>
                      </ap-productvariants>
                      <div className="quantity_wrapper">
                        <div className="product-form-quantity">
                          <span className="product-form-quantity-label">
                            Quantity
                          </span>
                          <ap-quantityselector className="quantity-selector">
                            <button
                              type="button"
                              className="quantity-selector-button"
                              style={{ height: "50px", width: "50px" }}
                              onClick={handleDecreaseQuantity}
                              disabled={quantity <= 1}
                            >
                              <span className="visually-hidden">
                                Decrease quantity for A Short History of Nearly
                                Everything
                              </span>
                              <svg
                                focusable="false"
                                width="10"
                                height="2"
                                className="icon icon--minus-big   "
                                viewBox="0 0 10 2"
                              >
                                <path
                                  fill="currentColor"
                                  d="M0 0h10v2H0z"
                                ></path>
                              </svg>
                            </button>
                            <input
                              type="text"
                              form="ap-productform-template--23597517013275__main-9713931944219"
                              is="ap-inputnumber"
                              className="quantity-selector-input"
                              inputMode="numeric"
                              name="quantity"
                              autoComplete="off"
                              min="1"
                              max={product.stock_quantity}
                              value={quantity}
                              size="2"
                              aria-label="Quantity"
                              style={{ height: "50px", lineHeight: "50px" }}
                              onChange={handleQuantityChange}
                            />
                            <button
                              type="button"
                              className="quantity-selector-button"
                              style={{ height: "50px", width: "50px" }}
                              onClick={handleIncreaseQuantity}
                              disabled={
                                Number(product.stock_quantity || 0) <= 0 ||
                                quantity >= Number(product.stock_quantity || 0)
                              }
                            >
                              <span className="visually-hidden">
                                Increase quantity for A Short History of Nearly
                                Everything
                              </span>
                              <svg
                                focusable="false"
                                width="10"
                                height="10"
                                className="icon icon--plus-big   "
                                viewBox="0 0 10 10"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M4 6v4h2V6h4V4H6V0H4v4H0v2h4z"
                                  fill="currentColor"
                                ></path>
                              </svg>
                            </button>
                          </ap-quantityselector>
                        </div>
                        <div className="product-form-buy-buttons">
                          <form
                            method="post"
                            action="/cart/add"
                            id="ap-productform-template--23597517013275__main-9713931944219"
                            acceptCharset="UTF-8"
                            className="product-card-form"
                            enctype="multipart/form-data"
                            is="ap-productform"
                            onSubmit={handleAddToCart}
                          >
                            <input
                              type="hidden"
                              name="form_type"
                              value="product"
                            />
                            <input type="hidden" name="utf8" value="✓" />
                            <input
                              type="hidden"
                              name="form_type"
                              value="product"
                            />
                            <input type="hidden" name="utf8" value="✓" />
                            <input
                              type="hidden"
                              name="id"
                              value="49524723450139"
                            />
                            <input
                              type="hidden"
                              name="quantity"
                              value={quantity}
                            />
                            <ap-paymentcontainerproduct
                              id="ApolloProductSticky"
                              form-id="ap-productform-template--23597517013275__main-9713931944219"
                              className="product-form-payment-container"
                            >
                              <button
                                id="AddToCart"
                                type="submit"
                                is="loader-button"
                                data-use-primary=""
                                data-product-add-to-cart-button=""
                                data-button-content="Add to cart"
                                className="product-form-add-button button button--primary button--full"
                                disabled={
                                  Number(product.stock_quantity || 0) <= 0
                                }
                              >
                                <span className="loader-button-text">
                                  <span className="loader-button-text">
                                    Add to cart
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="21"
                                      height="19"
                                      viewBox="0 0 21 19"
                                      fill="none"
                                    >
                                      <path
                                        d="M0.84375 0.25H2.46094C3.28125 0.296875 3.86719 0.671875 4.21875 1.375H18.668C19.1367 1.39844 19.5117 1.58594 19.793 1.9375C20.0508 2.28906 20.1328 2.6875 20.0391 3.13281L18.5977 8.51172C18.4336 9.07422 18.1289 9.51953 17.6836 9.84766C17.2383 10.1992 16.7227 10.375 16.1367 10.375H6.01172L6.1875 11.3945C6.30469 11.8164 6.58594 12.0391 7.03125 12.0625H17.1562C17.6719 12.1094 17.9531 12.3906 18 12.9062C17.9531 13.4219 17.6719 13.7031 17.1562 13.75H7.03125C6.39844 13.75 5.85938 13.5625 5.41406 13.1875C4.94531 12.7891 4.65234 12.2969 4.53516 11.7109L2.70703 2.18359C2.68359 2.01953 2.60156 1.9375 2.46094 1.9375H0.84375C0.328125 1.89063 0.046875 1.60938 0 1.09375C0.046875 0.578125 0.328125 0.296875 0.84375 0.25ZM4.60547 3.0625L5.69531 8.6875H16.1367C16.5586 8.66406 16.8281 8.45312 16.9453 8.05469L18.3164 3.0625H4.60547ZM6.1875 18.25C5.55469 18.2266 5.0625 17.9453 4.71094 17.4062C4.42969 16.8438 4.42969 16.2812 4.71094 15.7188C5.0625 15.1797 5.55469 14.8984 6.1875 14.875C6.82031 14.8984 7.3125 15.1797 7.66406 15.7188C7.94531 16.2812 7.94531 16.8438 7.66406 17.4062C7.3125 17.9453 6.82031 18.2266 6.1875 18.25ZM18 16.5625C17.9766 17.1953 17.6953 17.6875 17.1562 18.0391C16.5938 18.3203 16.0312 18.3203 15.4688 18.0391C14.9297 17.6875 14.6484 17.1953 14.625 16.5625C14.6484 15.9297 14.9297 15.4375 15.4688 15.0859C16.0312 14.8047 16.5938 14.8047 17.1562 15.0859C17.6953 15.4375 17.9766 15.9297 18 16.5625Z"
                                        fill="white"
                                      ></path>
                                    </svg>
                                  </span>
                                  <span
                                    className="loader-button-spinner"
                                    hidden={true}
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
                                  hidden={true}
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

                              <div
                                data-shopify="payment-button"
                                className="payment-button-wrapper"
                              >
                                {" "}
                                <shopify-accelerated-checkout
                                  recommended="null"
                                  fallback='{"supports_subs":true,"supports_def_opts":true,"name":"buy_it_now","wallet_params":{}}'
                                  access-token="4bc4ec0d074b62709c788efd3476203b"
                                  buyer-country="AU"
                                  buyer-locale="en"
                                  buyer-currency="AUD"
                                  variant-params='[{"id":49524723450139,"requiresShipping":true},{"id":49524723482907,"requiresShipping":true},{"id":49524723515675,"requiresShipping":true},{"id":49524723548443,"requiresShipping":true}]'
                                  shop-id="90660143387"
                                  enabled-flags='["a1d1f9a1"]'
                                  disable-compat={true}
                                  requires-shipping={true}
                                >
                                  <template shadowrootmode="closed">
                                    <style>{`*{box-sizing:border-box}.wallet-button-fade-in{animation:.3s cubic-bezier(.1,.79,1,1) animation-fade-in}@keyframes animation-fade-in{0%{opacity:0}to{opacity:1}}button[aria-disabled=true]{opacity:.5;cursor:not-allowed}`}</style>
                                    <div className="wallet-button-fade-in wallet-button-wrapper">
                                      <slot name="button"></slot>
                                      <slot name="promise"></slot>
                                      <slot name="more-options"></slot>
                                    </div>
                                  </template>
                                  <shopify-buy-it-now-button
                                    access-token="4bc4ec0d074b62709c788efd3476203b"
                                    buyer-country="AU"
                                    buyer-currency="AUD"
                                    wallet-params="{}"
                                    page-type="product"
                                    slot="button"
                                    requires-shipping={true}
                                    call-to-action=""
                                  >
                                    <button
                                      type="button"
                                      className="checkout-payment-btn checkout-payment-btn-unbranded"
                                      onClick={handleBuyNow}
                                      disabled={
                                        Number(product?.stock_quantity || 0) <=
                                        0
                                      }
                                    >
                                      Buy it now
                                    </button>
                                  </shopify-buy-it-now-button>
                                </shopify-accelerated-checkout>{" "}
                              </div>
                            </ap-paymentcontainerproduct>
                            <input
                              type="hidden"
                              name="product-id"
                              value="9713931944219"
                            />
                            <input
                              type="hidden"
                              name="section-id"
                              value="template--23597517013275__main"
                            />
                          </form>
                        </div>
                      </div>
                      <div className="single_variation_wrap">
                        <ap-wishlistbutton
                          className="btn-variation wishlist-btn"
                          data-action={
                            isWishlisted(product.product_id) ? "remove" : "add"
                          }
                          data-id={product.product_id}
                          alt={
                            isWishlisted(product.product_id)
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                          disabled={wishlistUpdatingId === product.product_id}
                          onClick={handleWishlistToggle}
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
                                fill={
                                  isWishlisted(product.product_id)
                                    ? "#ff0000"
                                    : "none"
                                }
                                stroke={
                                  isWishlisted(product.product_id)
                                    ? "#ff0000"
                                    : "currentColor"
                                }
                              ></path>
                            </svg>
                          </div>
                          <span className="text-name">
                            {isWishlisted(product.product_id)
                              ? "Remove from wishlist"
                              : "Add to wishlist"}
                          </span>
                        </ap-wishlistbutton>
                        <ap-comparebutton
                          className="btn-variation compare-btn"
                          data-action="add"
                          data-id="9713931944219"
                          alt="Add to comparebutton"
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
                                d="M8.74408 1.2442C9.06952 0.918763 9.59715 0.918763 9.92259 1.2442L12.4226 3.7442C12.748 4.06964 12.748 4.59727 12.4226 4.92271L9.92259 7.42271C9.59715 7.74815 9.06952 7.74815 8.74408 7.42271C8.41864 7.09727 8.41864 6.56964 8.74408 6.2442L9.82149 5.16679H7.66667C4.90524 5.16679 2.66667 7.40537 2.66667 10.1668C2.66667 12.1601 3.83306 13.8827 5.52424 14.686C5.93996 14.8835 6.11687 15.3806 5.91938 15.7963C5.7219 16.2121 5.2248 16.389 4.80909 16.1915C2.5587 15.1224 1 12.8275 1 10.1668C1 6.48489 3.98477 3.50012 7.66667 3.50012H9.82149L8.74408 2.42271C8.41864 2.09727 8.41864 1.56964 8.74408 1.2442ZM14.414 4.53724C14.6114 4.12152 15.1085 3.94461 15.5242 4.1421C17.7746 5.21114 19.3333 7.50611 19.3333 10.1668C19.3333 13.8487 16.3486 16.8335 12.6667 16.8335H10.5118L11.5893 17.9109C11.9147 18.2363 11.9147 18.7639 11.5893 19.0894C11.2638 19.4148 10.7362 19.4148 10.4107 19.0894L7.91074 16.5894C7.58531 16.2639 7.58531 15.7363 7.91074 15.4109L10.4107 12.9109C10.7362 12.5854 11.2638 12.5854 11.5893 12.9109C11.9147 13.2363 11.9147 13.7639 11.5893 14.0894L10.5118 15.1668H12.6667C15.4281 15.1668 17.6667 12.9282 17.6667 10.1668C17.6667 8.17347 16.5003 6.45093 14.8091 5.64753C14.3934 5.45005 14.2165 4.95295 14.414 4.53724Z"
                                fill="currentColor"
                              ></path>
                            </svg>
                          </div>
                          <span className="text-name">Add to compare</span>
                        </ap-comparebutton>
                      </div>
                      <div className="product-policy">
                        <div className="policy-list">
                          <div className="policy-item">
                            <div className="policy-icon">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="21"
                                height="18"
                                viewBox="0 0 21 18"
                                fill="none"
                              >
                                <path
                                  d="M8.4375 1.5V4.875H14.2734L13.0781 2.16797C12.8672 1.74609 12.5156 1.52344 12.0234 1.5H8.4375ZM8.4375 6H7.3125H1.125V13.875C1.125 14.2031 1.23047 14.4727 1.44141 14.6836C1.65234 14.8945 1.92188 15 2.25 15H9.66797C9.87891 15.3984 10.125 15.7734 10.4062 16.125H2.25C1.61719 16.1016 1.08984 15.8789 0.667969 15.457C0.246094 15.0352 0.0234375 14.5078 0 13.875V5.92969C0 5.60156 0.0703125 5.29688 0.210938 5.01562L1.65234 1.71094C2.07422 0.867188 2.76562 0.421875 3.72656 0.375H12.0234C12.9844 0.421875 13.6758 0.867188 14.0977 1.71094L15.5742 5.01562C15.6914 5.29688 15.75 5.60156 15.75 5.92969V6H15.1875H14.625H12.375H8.4375ZM7.3125 4.875V1.5H3.72656C3.23438 1.52344 2.88281 1.74609 2.67188 2.16797L1.47656 4.875H7.3125ZM15.1875 8.25C14.4844 8.25 13.8281 8.42578 13.2188 8.77734C12.6094 9.12891 12.1289 9.60938 11.7773 10.2188C11.4258 10.8281 11.25 11.4844 11.25 12.1875C11.25 12.8906 11.4258 13.5469 11.7773 14.1562C12.1289 14.7656 12.6094 15.2461 13.2188 15.5977C13.8281 15.9492 14.4844 16.125 15.1875 16.125C15.8906 16.125 16.5469 15.9492 17.1562 15.5977C17.7656 15.2461 18.2461 14.7656 18.5977 14.1562C18.9492 13.5469 19.125 12.8906 19.125 12.1875C19.125 11.4844 18.9492 10.8281 18.5977 10.2188C18.2461 9.60938 17.7656 9.12891 17.1562 8.77734C16.5469 8.42578 15.8906 8.25 15.1875 8.25ZM15.1875 17.25C14.2734 17.25 13.4297 17.0273 12.6562 16.582C11.8828 16.1367 11.2617 15.5156 10.793 14.7188C10.3477 13.9219 10.125 13.0781 10.125 12.1875C10.125 11.2969 10.3477 10.4531 10.793 9.65625C11.2617 8.85938 11.8828 8.23828 12.6562 7.79297C13.4297 7.34766 14.2734 7.125 15.1875 7.125C16.1016 7.125 16.9453 7.34766 17.7188 7.79297C18.4922 8.23828 19.1133 8.85938 19.582 9.65625C20.0273 10.4531 20.25 11.2969 20.25 12.1875C20.25 13.0781 20.0273 13.9219 19.582 14.7188C19.1133 15.5156 18.4922 16.1367 17.7188 16.582C16.9453 17.0273 16.1016 17.25 15.1875 17.25ZM17.543 10.6758C17.7773 10.9336 17.7773 11.1914 17.543 11.4492L15.0117 13.9805C14.7539 14.2148 14.4961 14.2148 14.2383 13.9805L12.832 12.5742C12.5977 12.3164 12.5977 12.0586 12.832 11.8008C13.0898 11.5664 13.3477 11.5664 13.6055 11.8008L14.625 12.7852L16.7695 10.6758C17.0273 10.4414 17.2852 10.4414 17.543 10.6758Z"
                                  fill="#9FA4AA"
                                ></path>
                              </svg>
                            </div>
                            <div className="policy-content">
                              2 years warranty
                            </div>
                          </div>
                          <div className="policy-item">
                            <div className="policy-icon">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="23"
                                height="19"
                                viewBox="0 0 23 19"
                                fill="none"
                              >
                                <path
                                  d="M4.5 1.375C4.17188 1.375 3.90234 1.48047 3.69141 1.69141C3.48047 1.90234 3.375 2.17188 3.375 2.5V3.625H8.4375C8.78906 3.64844 8.97656 3.83594 9 4.1875C8.97656 4.53906 8.78906 4.72656 8.4375 4.75H0.5625C0.210938 4.72656 0.0234375 4.53906 0 4.1875C0.0234375 3.83594 0.210938 3.64844 0.5625 3.625H2.25V2.5C2.27344 1.86719 2.49609 1.33984 2.91797 0.917969C3.33984 0.496094 3.86719 0.273438 4.5 0.25H12.375C13.0078 0.273438 13.5352 0.496094 13.957 0.917969C14.3789 1.33984 14.6016 1.86719 14.625 2.5V3.625H16.9102C17.4258 3.625 17.8594 3.82422 18.2109 4.22266L20.9531 7.45703C21.2344 7.76172 21.375 8.125 21.375 8.54688V13.75H21.9375C22.2891 13.7734 22.4766 13.9609 22.5 14.3125C22.4766 14.6641 22.2891 14.8516 21.9375 14.875H20.25C20.2266 15.8359 19.8984 16.6328 19.2656 17.2656C18.6328 17.8984 17.8359 18.2266 16.875 18.25C15.9141 18.2266 15.1172 17.8984 14.4844 17.2656C13.8516 16.6328 13.5234 15.8359 13.5 14.875H9C8.97656 15.8359 8.64844 16.6328 8.01562 17.2656C7.38281 17.8984 6.58594 18.2266 5.625 18.25C4.66406 18.2266 3.86719 17.8984 3.23438 17.2656C2.60156 16.6328 2.27344 15.8359 2.25 14.875V13.75V10.375H3.375V12.3438C3.98438 11.8047 4.73438 11.5234 5.625 11.5C6.375 11.5234 7.03125 11.7344 7.59375 12.1328C8.15625 12.5547 8.56641 13.0938 8.82422 13.75H13.5V2.5C13.5 2.17188 13.3945 1.90234 13.1836 1.69141C12.9727 1.48047 12.7031 1.375 12.375 1.375H4.5ZM20.0742 8.125L17.332 4.96094C17.2383 4.82031 17.0977 4.75 16.9102 4.75H14.625V8.125H20.0742ZM14.625 9.25V12.3438C15.2344 11.8047 15.9844 11.5234 16.875 11.5C17.625 11.5234 18.2812 11.7344 18.8438 12.1328C19.4062 12.5547 19.8164 13.0938 20.0742 13.75H20.25V9.25H14.625ZM3.375 14.875C3.39844 15.7188 3.77344 16.3633 4.5 16.8086C5.25 17.2305 6 17.2305 6.75 16.8086C7.47656 16.3633 7.85156 15.7188 7.875 14.875C7.85156 14.0312 7.47656 13.3867 6.75 12.9414C6 12.5195 5.25 12.5195 4.5 12.9414C3.77344 13.3867 3.39844 14.0312 3.375 14.875ZM16.875 12.625C16.0312 12.6484 15.3867 13.0234 14.9414 13.75C14.5195 14.5 14.5195 15.25 14.9414 16C15.3867 16.7266 16.0312 17.1016 16.875 17.125C17.7188 17.1016 18.3633 16.7266 18.8086 16C19.2305 15.25 19.2305 14.5 18.8086 13.75C18.3633 13.0234 17.7188 12.6484 16.875 12.625ZM1.6875 5.875H9.5625C9.91406 5.89844 10.1016 6.08594 10.125 6.4375C10.1016 6.78906 9.91406 6.97656 9.5625 7H1.6875C1.33594 6.97656 1.14844 6.78906 1.125 6.4375C1.14844 6.08594 1.33594 5.89844 1.6875 5.875ZM0.5625 8.125H8.4375C8.78906 8.14844 8.97656 8.33594 9 8.6875C8.97656 9.03906 8.78906 9.22656 8.4375 9.25H0.5625C0.210938 9.22656 0.0234375 9.03906 0 8.6875C0.0234375 8.33594 0.210938 8.14844 0.5625 8.125Z"
                                  fill="#9FA4AA"
                                ></path>
                              </svg>
                            </div>
                            <div className="policy-content">
                              Delivery time: 1-2 business days
                            </div>
                          </div>
                          <div className="policy-item">
                            <div className="policy-icon">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="17"
                                viewBox="0 0 16 17"
                                fill="none"
                              >
                                <path
                                  d="M0.6875 6C0.335938 5.97656 0.148438 5.78906 0.125 5.4375V0.9375C0.148438 0.585938 0.335938 0.398438 0.6875 0.375C1.03906 0.398438 1.22656 0.585938 1.25 0.9375V4.20703C1.95312 3.03516 2.89062 2.10937 4.0625 1.42969C5.23438 0.75 6.54688 0.398438 8 0.375C9.47656 0.398438 10.8008 0.761719 11.9727 1.46484C13.168 2.14453 14.1055 3.08203 14.7852 4.27734C15.4883 5.44922 15.8516 6.77344 15.875 8.25C15.8516 9.72656 15.4883 11.0508 14.7852 12.2227C14.1055 13.418 13.168 14.3555 11.9727 15.0352C10.8008 15.7383 9.47656 16.1016 8 16.125C6.57031 16.1016 5.28125 15.7617 4.13281 15.1055C2.98438 14.4492 2.04688 13.5586 1.32031 12.4336C1.22656 12.2461 1.22656 12.0703 1.32031 11.9062C1.41406 11.7188 1.57812 11.625 1.8125 11.625C2.02344 11.625 2.19922 11.7188 2.33984 11.9062C2.94922 12.8438 3.74609 13.5938 4.73047 14.1562C5.71484 14.6953 6.80469 14.9766 8 15C9.92188 14.9531 11.5156 14.2969 12.7812 13.0312C14.0469 11.7656 14.7031 10.1719 14.75 8.25C14.7031 6.32812 14.0469 4.73438 12.7812 3.46875C11.5156 2.20312 9.92188 1.54687 8 1.5C6.73438 1.52344 5.59766 1.82812 4.58984 2.41406C3.55859 3.02344 2.75 3.84375 2.16406 4.875H5.1875C5.53906 4.89844 5.72656 5.08594 5.75 5.4375C5.72656 5.78906 5.53906 5.97656 5.1875 6H0.6875Z"
                                  fill="#9FA4AA"
                                ></path>
                              </svg>
                            </div>
                            <div className="policy-content">
                              Free 90 days return
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        style={{ backgroundColor: "#f6f6f6" }}
                        className="product-payment"
                      >
                        <div className="product-payment-title">
                          Payment Options
                        </div>
                        <div className="product-payment-image">
                          <img
                            loading="lazy"
                            sizes="(max-width: 999px) 100vw, 72vw"
                            alt=""
                            src="//ap-bokifa.myshopify.com/cdn/shop/files/img.png?v=1729845696&amp;width=350"
                            data-srcset="//ap-bokifa.myshopify.com/cdn/shop/files/img.png?v=1729845696&amp;width=2000 2000w"
                            width="350"
                            height="35"
                          />
                        </div>
                      </div>

                      <div className="product-categories">
                        <span>Categories : </span>

                        <a className="product-category-link" href="books">
                          Books,
                        </a>

                        <a className="product-category-link" href="books-new">
                          Books New,
                        </a>

                        <a className="product-category-link" href="fantasy">
                          Fantasy,
                        </a>

                        <a className="product-category-link" href="fiction">
                          Fiction,
                        </a>

                        <a className="product-category-link" href="kids-books">
                          Kids Books,
                        </a>

                        <a className="product-category-link" href="non-fiction">
                          Non Fiction
                        </a>
                      </div>
                      <div className="product-tags">
                        <span>Tags : </span>

                        <a
                          href="/collections/all/ebook"
                          className="link-product-tag"
                        >
                          Ebook
                        </a>
                      </div>
                      <div className="product-meta-aside">
                        <div className="product-meta-share text--subdued">
                          <button
                            is="ap-sharetogglebutton"
                            share-url=""
                            share-title="A Short History of Nearly Everything"
                            className="product-meta-share-label link hidden-tablet-and-up d-none"
                            ap-controlsaria="mobile-share-buttons-template--23597517013275__main"
                            ap-expanded-aria="false"
                          >
                            Share
                          </button>
                          <apollopop-content
                            id="mobile-share-buttons-template--23597517013275__main"
                            className="popover hidden-tablet-and-up"
                          >
                            <span className="popover__overlay"></span>
                            <header className="popover__header">
                              <span className="popover__title heading h6 d-none">
                                Share
                              </span>
                              <button
                                type="button"
                                className="popover__close-button tap-target tap-target-large"
                                data-action="close"
                                title="Close"
                              >
                                <svg
                                  focusable="false"
                                  width="14"
                                  height="14"
                                  className="icon icon--close   "
                                  viewBox="0 0 14 14"
                                >
                                  <path
                                    d="M13 13L1 1M13 1L1 13"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                  ></path>
                                </svg>
                              </button>
                            </header>
                            <div className="mobile-share-buttons">
                              <a
                                className="mobile-share-buttons__item mobile-share-buttons__item--facebook"
                                href="//www.facebook.com/sharer.php?u=https://ap-bokifa.myshopify.com/products/a-good-morning-america-book-club-pick-2"
                                target="_blank"
                                rel="noopener"
                                aria-label="Share on Facebook"
                              >
                                <svg
                                  fill="none"
                                  focusable="false"
                                  width="24"
                                  height="24"
                                  className="icon icon--facebook-share-mobile   "
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M10.1834 21.85L10.1834 12.982H7.2002L7.2002 9.52604H10.1834V6.98204C10.062 5.75969 10.4857 4.54599 11.3415 3.66478C12.1972 2.78357 13.398 2.32449 14.6234 2.41004C15.5143 2.40481 16.4047 2.45289 17.2898 2.55404V5.63804L15.4598 5.63804C14.9879 5.53818 14.4974 5.68116 14.1532 6.01892C13.8089 6.35669 13.6566 6.84437 13.7474 7.31804L13.7474 9.52604L17.1698 9.52604L16.7234 12.982H13.7522V21.85H10.1834Z"
                                    fill="#3B5998"
                                  ></path>
                                </svg>
                                Facebook
                              </a>

                              <a
                                className="mobile-share-buttons__item mobile-share-buttons__item--pinterest"
                                href="https://pinterest.com/pin/create/button/?url=/products/a-good-morning-america-book-club-pick-2&amp;media=//ap-bokifa.myshopify.com/cdn/shop/files/bo_pro_15.jpg?v=1728615410&amp;width=520&amp;description=A Short History of Nearly Everything"
                                target="_blank"
                                rel="noopener"
                                aria-label="Pin on Pinterest"
                              >
                                <svg
                                  fill="none"
                                  focusable="false"
                                  width="24"
                                  height="24"
                                  className="icon icon--pinterest-share-mobile   "
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M11.7648 2.40138C15.3543 2.34682 17.602 3.80113 18.6595 6.35148C19.0087 7.1931 19.3817 8.74117 19.1015 10.0256C18.9898 10.5384 18.9581 11.0736 18.8069 11.5569C18.4993 12.5394 18.0993 13.4092 17.5694 14.1592C16.8499 15.1782 15.7582 15.8653 14.3872 16.2109C13.1746 16.5164 12.0593 16.059 11.4113 15.5678C11.2048 15.4115 10.9279 15.2073 10.8515 14.9251C10.8417 14.9251 10.8318 14.9251 10.822 14.9251C10.7755 15.4401 10.5782 15.9868 10.4389 16.4561C10.2461 17.1053 10.2086 17.7774 9.96749 18.3849C9.69999 19.0592 9.37509 19.6772 9.02467 20.253C8.84068 20.5549 8.33293 21.5884 7.9639 21.5999C7.92354 21.5224 7.90737 21.4925 7.90493 21.3551C7.7861 21.1659 7.86888 20.8468 7.81652 20.5893C7.73505 20.1883 7.67161 19.466 7.75769 19.0588C7.75769 18.8444 7.75769 18.6296 7.75769 18.4157C7.85257 17.9742 7.84882 17.5217 7.9639 17.0991C8.21425 16.1787 8.35354 15.2038 8.61211 14.2512C8.86057 13.3361 9.08856 12.3352 9.28987 11.4038C9.33529 11.1934 9.07963 10.5886 9.02467 10.3628C8.85134 9.65014 8.9833 8.66239 9.20146 8.12713C9.47618 7.45323 10.2804 6.4241 11.3229 6.68821C12.1607 6.90037 12.694 7.80624 12.413 8.95421C12.1181 10.159 11.7356 11.2383 11.4702 12.4443C11.4019 12.7551 11.5194 13.0852 11.588 13.2714C11.8361 13.9431 12.5882 14.5955 13.5916 14.3432C15.1126 13.9603 15.785 12.5834 16.2435 11.0974C16.3676 10.6955 16.3527 10.3157 16.4498 9.87241C16.6545 8.93705 16.5676 7.54083 16.273 6.81057C15.8008 5.64018 14.9198 4.89011 13.7095 4.48339C13.3756 4.42221 13.0416 4.36103 12.7077 4.29985C12.1486 4.17176 11.0822 4.36412 10.7041 4.48339C9.01386 5.01777 7.96723 5.91043 7.3157 7.51486C7.09393 8.06111 6.97235 8.61484 6.9327 9.38251C6.92276 9.47451 6.91294 9.5665 6.90314 9.6585C7.03364 10.3447 7.04691 10.7994 7.3157 11.3118C7.44838 11.5644 7.76346 11.7634 7.81652 12.0772C7.84781 12.2621 7.71227 12.5412 7.66931 12.6895C7.60427 12.9136 7.62792 13.1702 7.52193 13.3634C7.33028 13.712 6.8084 13.4501 6.57911 13.3018C5.38697 12.5324 4.40437 10.3073 4.95855 8.15795C5.04391 7.82607 5.0481 7.53731 5.16476 7.23932C5.8878 5.39455 6.96659 4.26111 8.5237 3.28922C9.10717 2.9252 9.89394 2.74473 10.6157 2.55456C10.9987 2.50352 11.3818 2.45245 11.7648 2.40138Z"
                                    fill="#BD081C"
                                  ></path>
                                </svg>
                                Pinterest
                              </a>

                              <a
                                className="mobile-share-buttons__item mobile-share-buttons__item--twitter"
                                href="//twitter.com/share?text=&amp;url=https://ap-bokifa.myshopify.com/products/a-good-morning-america-book-club-pick-2"
                                target="_blank"
                                rel="noopener"
                                aria-label="Tweet on Twitter"
                              >
                                <svg
                                  fill="none"
                                  focusable="false"
                                  width="24"
                                  height="24"
                                  className="icon icon--twitter-share-mobile   "
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M15.414 4.96068C16.9196 4.93626 17.7211 5.43865 18.4864 6.07724C19.1362 6.02649 19.9806 5.69424 20.478 5.46269C20.6391 5.38182 20.8004 5.30133 20.9616 5.22046C20.6775 5.92312 20.2923 6.47359 19.7004 6.89092C19.5689 6.98361 19.4384 7.10911 19.2736 7.16824C19.2736 7.17091 19.2736 7.17396 19.2736 7.17663C20.1171 7.16863 20.8129 6.82034 21.4737 6.63114C21.4737 6.63417 21.4737 6.63723 21.4737 6.64028C21.1266 7.14535 20.6568 7.65767 20.1556 8.02502C19.9532 8.17227 19.7509 8.31951 19.5486 8.46676C19.5597 9.28425 19.5354 10.0643 19.3684 10.7518C18.3977 14.7465 15.8254 17.4588 11.7534 18.6203C10.2913 19.0377 7.92842 19.2089 6.25322 18.8282C5.42246 18.6394 4.67201 18.4262 3.96773 18.1443C3.57662 17.9875 3.21425 17.8181 2.86766 17.6251C2.75395 17.5614 2.64012 17.4981 2.52626 17.4343C2.90422 17.445 3.34615 17.54 3.76862 17.4778C4.15075 17.4214 4.52554 17.4359 4.87817 17.3653C5.75753 17.1887 6.53832 16.9552 7.21099 16.5947C7.53708 16.42 8.03189 16.2148 8.26361 15.963C7.82698 15.9699 7.43107 15.8772 7.10676 15.7727C5.84923 15.366 5.11723 14.6187 4.64102 13.4961C5.02212 13.5338 6.11978 13.6246 6.37642 13.4266C5.89678 13.4026 5.43547 13.1482 5.10574 12.9589C4.09421 12.3795 3.26926 11.4075 3.27545 9.91215C3.40826 9.96975 3.54108 10.0277 3.67378 10.0853C3.92789 10.1834 4.18618 10.2356 4.48934 10.2932C4.61736 10.3173 4.87337 10.3863 5.02034 10.3363C5.01403 10.3363 5.0077 10.3363 5.00138 10.3363C4.80571 10.1277 4.48682 9.98884 4.29014 9.76491C3.64126 9.02638 3.0331 7.88999 3.41774 6.53614C3.51528 6.19282 3.6701 5.88956 3.83503 5.60993C3.84137 5.61298 3.84768 5.61565 3.85402 5.61871C3.92952 5.76328 4.098 5.86973 4.2049 5.99065C4.53629 6.36678 4.94508 6.70514 5.36174 7.00345C6.7813 8.02007 8.0597 8.64453 10.1129 9.10725C10.6336 9.22437 11.2357 9.31401 11.8578 9.31476C11.6829 8.84899 11.7391 8.09522 11.8767 7.64432C12.2227 6.51058 12.9743 5.69272 14.0768 5.25479C14.3404 5.15026 14.6329 5.07396 14.9397 5.01256C15.0978 4.9954 15.256 4.97823 15.414 4.96068Z"
                                    fill="#1DA1F2"
                                  ></path>
                                </svg>
                                Twitter
                              </a>

                              <a
                                className="mobile-share-buttons__item mobile-share-buttons__item--mail"
                                href="mailto:?&amp;subject=&amp;body=/products/a-good-morning-america-book-club-pick-2"
                                aria-label="Share by e-mail"
                              >
                                <svg
                                  fill="none"
                                  focusable="false"
                                  width="24"
                                  height="24"
                                  className="icon icon--email-share-mobile   "
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    d="M21.9135 2.08691L15.3396 20.8695L11.583 12.4173M21.9135 2.08691L3.13086 8.66083L11.583 12.4173M21.9135 2.08691L11.583 12.4173"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  ></path>
                                </svg>
                                E-mail
                              </a>
                            </div>
                          </apollopop-content>

                          <div className="product-meta-share-list hidden-phone">
                            <a
                              className="product-meta-share-item product-meta-share-facebook link tap-target"
                              href="//www.facebook.com/sharer.php?u=https://ap-bokifa.myshopify.com/products/a-good-morning-america-book-club-pick-2"
                              target="_blank"
                              rel="noopener"
                              aria-label="Share on Facebook"
                            >
                              <svg
                                focusable="false"
                                width="8"
                                height="14"
                                className="icon icon--facebook   "
                                viewBox="0 0 9 17"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M2.486 16.2084L2.486 8.81845H0L0 5.93845L2.486 5.93845L2.486 3.81845C2.38483 2.79982 2.73793 1.78841 3.45107 1.05407C4.16421 0.319722 5.16485 -0.0628415 6.186 0.00844868C6.9284 0.00408689 7.67039 0.0441585 8.408 0.128449V2.69845L6.883 2.69845C6.4898 2.61523 6.08104 2.73438 5.79414 3.01585C5.50724 3.29732 5.3803 3.70373 5.456 4.09845L5.456 5.93845H8.308L7.936 8.81845H5.46L5.46 16.2084H2.486Z"
                                  fill="currentColor"
                                ></path>
                              </svg>
                            </a>

                            <a
                              className="product-meta-share-item product-meta-share-twitter link tap-target"
                              href="//twitter.com/share?text=&amp;url=https://ap-bokifa.myshopify.com/products/a-good-morning-america-book-club-pick-2"
                              target="_blank"
                              rel="noopener"
                              aria-label="Tweet on Twitter"
                            >
                              <svg
                                focusable="false"
                                width="17"
                                height="14"
                                className="icon icon--twitter   "
                                viewBox="0 0 20 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M12.845 2.13398C14.0997 2.11363 14.7676 2.53229 15.4054 3.06445C15.9468 3.02216 16.6505 2.74528 17.065 2.55232C17.1993 2.48493 17.3337 2.41786 17.468 2.35046C17.2312 2.93602 16.9103 3.39474 16.417 3.74251C16.3074 3.81976 16.1987 3.92434 16.0613 3.97362C16.0613 3.97584 16.0613 3.97838 16.0613 3.98061C16.7643 3.97394 17.3441 3.6837 17.8947 3.52603C17.8947 3.52856 17.8947 3.5311 17.8947 3.53365C17.6055 3.95454 17.214 4.38147 16.7963 4.6876C16.6277 4.8103 16.4591 4.93301 16.2905 5.05571C16.2997 5.73696 16.2795 6.38704 16.1404 6.95989C15.3314 10.2888 13.1878 12.5491 9.7945 13.517C8.5761 13.8648 6.60702 14.0075 5.21102 13.6903C4.51872 13.5329 3.89334 13.3552 3.30644 13.1203C2.98052 12.9896 2.67854 12.8485 2.38972 12.6876C2.29496 12.6346 2.2001 12.5818 2.10522 12.5287C2.42018 12.5376 2.78846 12.6168 3.14052 12.5649C3.45896 12.5179 3.77128 12.53 4.06514 12.4712C4.79794 12.324 5.4486 12.1294 6.00916 11.829C6.2809 11.6834 6.69324 11.5124 6.88634 11.3026C6.52248 11.3083 6.19256 11.2311 5.9223 11.144C4.87436 10.8051 4.26436 10.1824 3.86752 9.2468C4.1851 9.27827 5.09982 9.35394 5.31368 9.18894C4.91398 9.16891 4.52956 8.95688 4.25478 8.7992C3.41184 8.31634 2.72438 7.50634 2.72954 6.26021C2.84022 6.30821 2.9509 6.35653 3.06148 6.40453C3.27324 6.48622 3.48848 6.52978 3.74112 6.57778C3.8478 6.59781 4.06114 6.65534 4.18362 6.6137C4.17836 6.6137 4.17308 6.6137 4.16782 6.6137C4.00476 6.43982 3.73902 6.32411 3.57512 6.1375C3.03438 5.52206 2.52758 4.57507 2.84812 3.44686C2.9294 3.16077 3.05842 2.90805 3.19586 2.67502C3.20114 2.67757 3.2064 2.67979 3.21168 2.68234C3.2746 2.80282 3.415 2.89152 3.50408 2.99229C3.78024 3.30573 4.1209 3.5877 4.46812 3.83629C5.65108 4.68347 6.71642 5.20386 8.42738 5.58946C8.86134 5.68706 9.36308 5.76176 9.88146 5.76238C9.73578 5.37424 9.78258 4.7461 9.89726 4.37035C10.1856 3.42557 10.8119 2.74402 11.7307 2.37907C11.9504 2.29197 12.1941 2.22838 12.4498 2.17722C12.5815 2.16291 12.7133 2.14861 12.845 2.13398Z"
                                  fill="currentColor"
                                ></path>
                              </svg>
                            </a>

                            <a
                              className="product-meta-share-item product-meta-share-pinterest link tap-target"
                              href="https://pinterest.com/pin/create/button/?url=/products/a-good-morning-america-book-club-pick-2&amp;media=//ap-bokifa.myshopify.com/cdn/shop/files/bo_pro_15.jpg?v=1728615410&amp;width=520&amp;description=A Short History of Nearly Everything"
                              target="_blank"
                              rel="noopener"
                              aria-label="Pin on Pinterest"
                            >
                              <svg
                                focusable="false"
                                width="10"
                                height="14"
                                className="icon icon--pinterest   "
                                viewBox="0 0 12 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M5.8042 0.00123531C8.79537 -0.0442356 10.6685 1.16769 11.5498 3.29299C11.8407 3.99433 12.1516 5.28439 11.9181 6.35474C11.825 6.78208 11.7985 7.22812 11.6726 7.63086C11.4163 8.4496 11.0829 9.17441 10.6413 9.79945C10.0418 10.6486 9.13196 11.2212 7.98951 11.5091C6.97899 11.7637 6.04959 11.3826 5.50954 10.9732C5.33747 10.843 5.10674 10.6728 5.04304 10.4377C5.03488 10.4377 5.0267 10.4377 5.01853 10.4377C4.97972 10.8669 4.81532 11.3224 4.69924 11.7135C4.53858 12.2545 4.50733 12.8146 4.3064 13.3208C4.08349 13.8828 3.81274 14.3978 3.52072 14.8776C3.36739 15.1292 2.94427 15.9904 2.63675 16C2.60311 15.9354 2.58964 15.9105 2.58761 15.796C2.48858 15.6383 2.55757 15.3724 2.51393 15.1578C2.44604 14.8236 2.39317 14.2217 2.46491 13.8824C2.46491 13.7038 2.46491 13.5248 2.46491 13.3465C2.54397 12.9786 2.54085 12.6015 2.63675 12.2494C2.84537 11.4824 2.96145 10.6699 3.17692 9.87611C3.38398 9.11352 3.57396 8.27939 3.74172 7.50321C3.77957 7.32789 3.56652 6.82389 3.52072 6.63572C3.37628 6.04186 3.48624 5.21874 3.66805 4.77269C3.89698 4.21111 4.56717 3.3535 5.43589 3.57359C6.13407 3.75039 6.57846 4.50528 6.34437 5.46192C6.09862 6.46589 5.7798 7.3653 5.5587 8.37035C5.50173 8.62933 5.59968 8.90442 5.65687 9.05958C5.86357 9.61934 6.49037 10.163 7.32652 9.95278C8.59396 9.63365 9.15431 8.48627 9.53645 7.24791C9.63981 6.91302 9.62743 6.59647 9.70831 6.22709C9.87894 5.44763 9.80648 4.28411 9.56098 3.67556C9.16753 2.70023 8.43329 2.07518 7.42471 1.73624C7.1465 1.68526 6.86819 1.63427 6.58988 1.58329C6.12397 1.47655 5.23532 1.63685 4.92023 1.73624C3.51171 2.18156 2.63952 2.92544 2.09658 4.26247C1.91177 4.71767 1.81046 5.17911 1.77741 5.81884C1.76913 5.8955 1.76094 5.97217 1.75278 6.04883C1.86153 6.62068 1.87259 6.99959 2.09658 7.42657C2.20715 7.63711 2.46971 7.8029 2.51393 8.06444C2.54001 8.2185 2.42705 8.45105 2.39125 8.57467C2.33705 8.76137 2.35676 8.97522 2.26844 9.13625C2.10873 9.42678 1.67383 9.20852 1.48275 9.08491C0.489307 8.44373 -0.329526 6.5895 0.132284 4.79837C0.20342 4.5218 0.206915 4.28118 0.304126 4.03285C0.906661 2.49554 1.80565 1.55101 3.10325 0.741098C3.58947 0.437749 4.24511 0.287354 4.84657 0.128885C5.16574 0.0863481 5.48503 0.0437917 5.8042 0.00123531Z"
                                  fill="currentColor"
                                ></path>
                              </svg>
                            </a>

                            <a
                              className="product-meta-share-item product-meta-share-linkedin link tap-target"
                              href="//linkedin.com/share?text=&amp;url=https://ap-bokifa.myshopify.com/products/a-good-morning-america-book-club-pick-2"
                              target="_blank"
                              rel="noopener"
                              aria-label="Tweet on linkedin"
                            >
                              <svg
                                className="icon icon--linkedin"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"
                                  fill="currentColor"
                                ></path>
                              </svg>
                            </a>

                            <a
                              className="product-meta-share-item product-meta-share-mail link tap-target d-none"
                              href="mailto:?&amp;subject=A Short History of Nearly Everything&amp;body=/products/a-good-morning-america-book-club-pick-2"
                              aria-label="Share by e-mail"
                            >
                              <svg
                                focusable="false"
                                width="13"
                                height="13"
                                className="icon icon--share   "
                                viewBox="0 0 18 18"
                              >
                                <path
                                  d="M17 1l-5.6 16-3.2-7.2M17 1L1 6.6l7.2 3.2M17 1L8.2 9.8"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </svg>
                            </a>
                          </div>
                        </div>
                        <button
                          is="toggle-button"
                          className="product-meta-help link text--subdued hidden-phone d-none"
                          ap-controlsaria="product-template--23597517013275__main-help-drawer"
                          ap-expanded-aria="false"
                        >
                          Need help?
                        </button>
                      </div>

                      <ap-drawercontent
                        id="product-template--23597517013275__main-help-drawer"
                        className="drawer drawer--large hidden-phone"
                      >
                        <span className="drawer__overlay"></span>
                        <header className="drawer__header">
                          <p className="drawer__title heading h6">Help</p>

                          <button
                            type="button"
                            className="drawer__close-button tap-target"
                            data-action="close"
                            title="Close"
                          >
                            <svg
                              focusable="false"
                              width="14"
                              height="14"
                              className="icon icon--close   "
                              viewBox="0 0 14 14"
                            >
                              <path
                                d="M13 13L1 1M13 1L1 13"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                              ></path>
                            </svg>
                          </button>
                        </header>

                        <div className="drawer__content drawer__content--padded-start">
                          <div className="rte">
                            <p>
                              If you have any questions, you are always welcome
                              to contact us. We'll get back to you as soon as
                              possible, withing 24 hours on weekdays.
                            </p>
                            <h6>Customer service</h6>
                            <p>
                              All questions about your order, return and
                              delivery must be sent to our customer service team
                              by e-mail at{" "}
                              <a href="mailto:yourstore@yourdomain.com">
                                yourstore@yourdomain.com
                              </a>
                            </p>
                            <h6>Sale &amp; Press</h6>
                            <p>
                              If you are interested in selling our products,
                              need more information about our brand or wish to
                              make a collaboration, please contact us at{" "}
                              <a href="mailto:press@yourdomain.com">
                                press@yourdomain.com
                              </a>
                            </p>
                          </div>
                        </div>
                      </ap-drawercontent>
                      <apollopop-content
                        id="product-template--23597517013275__main-help-popover"
                        className="popover hide-on-laptop-up"
                        hidden={true}
                      >
                        <span className="popover__overlay"></span>

                        <header className="popover__header">
                          <p className="popover__title heading h6">Help</p>
                          <button
                            type="button"
                            className="popover__close-button tap-target tap-target-large"
                            data-action="close"
                            title="Close"
                          >
                            <svg
                              focusable="false"
                              width="14"
                              height="14"
                              className="icon icon--close   "
                              viewBox="0 0 14 14"
                            >
                              <path
                                d="M13 13L1 1M13 1L1 13"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                              ></path>
                            </svg>
                          </button>
                        </header>

                        <div className="popover__content">
                          <div className="rte">
                            <p>
                              If you have any questions, you are always welcome
                              to contact us. We'll get back to you as soon as
                              possible, withing 24 hours on weekdays.
                            </p>
                            <h6>Customer service</h6>
                            <p>
                              All questions about your order, return and
                              delivery must be sent to our customer service team
                              by e-mail at{" "}
                              <a href="mailto:yourstore@yourdomain.com">
                                yourstore@yourdomain.com
                              </a>
                            </p>
                            <h6>Sale &amp; Press</h6>
                            <p>
                              If you are interested in selling our products,
                              need more information about our brand or wish to
                              make a collaboration, please contact us at{" "}
                              <a href="mailto:press@yourdomain.com">
                                press@yourdomain.com
                              </a>
                            </p>
                          </div>
                        </div>
                      </apollopop-content>
                    </div>
                  </ap-productmeta>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
      <section
        id="shopify-section-template--23597517013275__b4b2e57a-b15e-4f11-b27e-b0500d52dc70"
        class="site-section product-content-section"
      >
        <style>{`.product-content {
  flex-direction: column;
  gap: 50px;
  margin: 0;
  padding-top: 30px;
  max-width: 1470px;
  margin-left: auto;
  margin-right: auto;
  padding-bottom: 68px;
  padding-left: 15px;
  padding-right: 15px;
}
.product-content__featured-products {
  width: 100%;
  margin-top: 60px;
  margin-bottom: 60px;
}
.product-content__featured-products-list {
  grid-template-columns: 1fr 1fr 1fr 1fr;
  margin-top: 23px;
}
.ap-productrecommendations .scroller__inner {
  margin: 0 calc(-1 * var(--container-distance));
}
.nav-tabs-item {
  font-size: 18px;
  line-height: 22px;
  text-transform: capitalize;
  letter-spacing: 0;
  padding: 16px 34px;
  border-radius: 5px;
  font-family: var(--hd-font-family);
}
.nav-tabs-item:hover {
  color: var(--color-accent-1);
}
#shopify-section-template--23597517013275__b4b2e57a-b15e-4f11-b27e-b0500d52dc70 .wp-product-content {
  background-color: #fff;
  border-radius: 10px;
}
#shopify-section-template--23597517013275__b4b2e57a-b15e-4f11-b27e-b0500d52dc70 .nav-tabs-position {
  display: none;
}
#shopify-section-template--23597517013275__b4b2e57a-b15e-4f11-b27e-b0500d52dc70 .nav-tabs-item-list {
  padding-bottom: 30px;
  gap: 0;
  margin-bottom: 60px;
}
#shopify-section-template--23597517013275__b4b2e57a-b15e-4f11-b27e-b0500d52dc70 .nav-tabs-item[ap-expanded-aria=true] {
  background-color: #09331a;
  color: #fff;
}
@media (max-width:1299px) {
  .product-content__featured-products-list {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px 0;
  }
}
@media (max-width: 999px) {
  ap-productrecommendations .scroller {
      overflow-x: hidden;
  }
}
@media (max-width: 991px) {
  .product-content__featured-products-list {
    grid-template-columns: 1fr 1fr;
    grid-gap: 10px 0;
    padding: 0 var(--container-distance);
    grid-auto-flow: row;
  }
}
@media (max-width: 480px) {
  .product-content__featured-products-list {
    grid-template-columns: 1fr;
    grid-gap: 15px 0;
    grid-auto-flow: unset;
    grid-auto-columns: unset; 
  }
  .product-content__featured-products .product-card {
    
  }
}
@media screen and (min-width: 1000px) {
  .product-content__tabs {
    width: 100%;
  }
}`}</style>
        <section className="container">
          <div className="wp-product-content">
            <div
              id="product-9713931944219-content"
              className="product-content anchor"
            >
              <div
                className="product-content__tabs anchor"
                id="product-9713931944219-tabs"
              >
                <div className="product-tabs">
                  <ap-navtabs
                    arrows=""
                    className="nav-tabs-wrapper nav-tabs-wrapper--loose hide-on-pocket"
                  >
                    <ap-scrollablecontent className="nav-tabs-scroller hide-scrollbar">
                      <div className="nav-tabs-scroller-inner">
                        <div className="nav-tabs-item-list">
                          <button
                            type="button"
                            className={`nav-tabs-item heading heading--small ${
                              activeTab === "description" ? "is-active" : ""
                            }`}
                            ap-expanded-aria={
                              activeTab === "description" ? "true" : "false"
                            }
                            ap-controlsaria="block-7cca183b-2a77-4cb3-a100-ae76a5e24b66"
                            onClick={() => setActiveTab("description")}
                          >
                            Description
                          </button>
                          <button
                            type="button"
                            className={`nav-tabs-item heading heading--small ${
                              activeTab === "additional" ? "is-active" : ""
                            }`}
                            ap-expanded-aria={
                              activeTab === "additional" ? "true" : "false"
                            }
                            ap-controlsaria="block-5d25217f-c0a7-454c-9bdf-2e9b6e9cfd03"
                            onClick={() => setActiveTab("additional")}
                          >
                            Additional information
                          </button>
                          <button
                            type="button"
                            className={`nav-tabs-item heading heading--small ${
                              activeTab === "reviews" ? "is-active" : ""
                            }`}
                            ap-expanded-aria={
                              activeTab === "reviews" ? "true" : "false"
                            }
                            ap-controlsaria="block-AaVhUbEdMRFUyU3o0b__judge_me_reviews_review_widget_WH7V8q"
                            onClick={() => setActiveTab("reviews")}
                          >
                            Reviews{" "}
                            {reviewMeta.totalReviews > 0
                              ? `(${reviewMeta.totalReviews})`
                              : ""}
                          </button>
                        </div>
                        <span
                          className="nav-tabs-position is-initialized"
                          style={{
                            "--scale": " 0.13161875945537066",
                            " --translate": "198.85057471264366%",
                          }}
                        ></span>
                      </div>
                    </ap-scrollablecontent>
                    <div className="nav-tabs-arrows">
                      <button className="nav-tabs-arrow-item">
                        <span className="visually-hidden">Previous</span>
                        <svg
                          focusable="false"
                          width="6"
                          height="9"
                          className="icon icon--product-tab-left  icon--direction-aware "
                          viewBox="0 0 6 9"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M2.554 4.5L6 1.054 4.946 0l-4.5 4.5 4.5 4.5L6 7.946 2.554 4.5z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </button>
                      <button className="nav-tabs-arrow-item">
                        <span className="visually-hidden">Next</span>
                        <svg
                          focusable="false"
                          width="6"
                          height="9"
                          className="icon icon--product-tab-right  icon--direction-aware "
                          viewBox="0 0 6 9"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M3.446 4.5L0 1.054 1.054 0l4.5 4.5-4.5 4.5L0 7.946 3.446 4.5z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </ap-navtabs>
                  <div className="product-tabs__content">
                    <div
                      id="block-7cca183b-2a77-4cb3-a100-ae76a5e24b66"
                      className={`product-tabs__tab-item-wrapper ${
                        activeTab === "description" ? "is-active" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="collapsible-toggle heading heading--small hide-on-laptop-up"
                        aria-expanded={activeTab === "description"}
                        onClick={() => toggleProductTab("description")}
                      >
                        Description
                        <svg
                          focusable="false"
                          width="12"
                          height="8"
                          className="icon icon--chevron   "
                          viewBox="0 0 12 8"
                        >
                          <path
                            fill="none"
                            d="M1 1l5 5 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                          ></path>
                        </svg>
                      </button>
                      <div
                        id="block-7cca183b-2a77-4cb3-a100-ae76a5e24b66-content"
                        className={`product-mobile-tab-content ${
                          activeTab === "description" ? "is-open" : ""
                        }`}
                      >
                        <div className="product-tabs__tab-item-content rte">
                          <p>
                            From the author of The Longest Ride and The Return
                            comes a novel about the enduring legacy of first
                            love, and the decisions that haunt us forever. 1996
                            was the year that changed everything for Maggie
                            Dawes. Sent away at sixteen to live with an aunt she
                            barely knew in Ocracoke, a remote village on North
                            Carolina's Outer Banks, she could think only of the
                            friends and family she left behind . . . until she
                            met Bryce Trickett, one of the few teenagers on the
                            island. <br />
                            <br />
                            Handsome, genuine, and newly admitted to West Point,
                            Bryce showed her how much there was to love about
                            the wind-swept beach town--and introduced her to
                            photography, a passion that would define the rest of
                            her life. A collection of 10 well-researched board
                            books to introduce a wide range of learning topics
                            and everyday objects to the little scholars. The
                            topics included in the set are - ABC, Numbers,
                            Shapes, Colours, Wild Animals, Farm Animals and
                            Pets, Birds, Fruits, Vegetables and Transport.
                          </p>
                        </div>

                        <div className="product-tabs__trust-list hide-on-pocket">
                          <button
                            is="toggle-button"
                            className="product-tabs__trust-title icon-text link text--subdued hide-on-phone"
                            ap-controlsaria="product-template--23597517013275__b4b2e57a-b15e-4f11-b27e-b0500d52dc70-trust-1-drawer"
                            ap-expanded-aria="false"
                            style={{ display: "inline-flex" }}
                          >
                            <svg
                              fill="none"
                              focusable="false"
                              width="29"
                              height="24"
                              className="icon icon--picto-fast-delivery   product-tabs__trust-icon"
                              viewBox="0 0 29 24"
                            >
                              <path
                                d="M4 3H20V8M20 17H11.68C11.68 17 11 16 10 16M20 17V8M20 17H22.32M20 8H26.5L28 12.5V17H25.68C25.68 17 25 16 24 16M24 16C25 16 26 17 26 18C26 19 25 20 24 20C23 20 22 19 22 18C22 17.6527 22.1206 17.3054 22.32 17M24 16C23.3473 16 22.6946 16.426 22.32 17M10 16C11 16 12 17 12 18C12 19 11 20 10 20C9 20 8 19 8 18C8 17.6527 8.12061 17.3054 8.31996 17M10 16C9.3473 16 8.69459 16.426 8.31996 17M8.31996 17H4M10 12H3M10 8H1"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>
                            </svg>
                            Shipping &amp; Returns
                          </button>
                          <button
                            is="toggle-button"
                            className="product-tabs__trust-title icon-text link text--subdued hide-on-tablet-up"
                            ap-controlsaria="product-template--23597517013275__b4b2e57a-b15e-4f11-b27e-b0500d52dc70-trust-1-popover"
                            ap-expanded-aria="false"
                          >
                            <svg
                              fill="none"
                              focusable="false"
                              width="29"
                              height="24"
                              className="icon icon--picto-fast-delivery   product-tabs__trust-icon"
                              viewBox="0 0 29 24"
                            >
                              <path
                                d="M4 3H20V8M20 17H11.68C11.68 17 11 16 10 16M20 17V8M20 17H22.32M20 8H26.5L28 12.5V17H25.68C25.68 17 25 16 24 16M24 16C25 16 26 17 26 18C26 19 25 20 24 20C23 20 22 19 22 18C22 17.6527 22.1206 17.3054 22.32 17M24 16C23.3473 16 22.6946 16.426 22.32 17M10 16C11 16 12 17 12 18C12 19 11 20 10 20C9 20 8 19 8 18C8 17.6527 8.12061 17.3054 8.31996 17M10 16C9.3473 16 8.69459 16.426 8.31996 17M8.31996 17H4M10 12H3M10 8H1"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>
                            </svg>
                            Shipping &amp; Returns
                          </button>

                          <button
                            is="toggle-button"
                            className="product-tabs__trust-title icon-text link text--subdued hide-on-phone"
                            ap-controlsaria="product-template--23597517013275__b4b2e57a-b15e-4f11-b27e-b0500d52dc70-trust-2-drawer"
                            ap-expanded-aria="false"
                            style={{ display: "inline-flex" }}
                          >
                            <svg
                              fill="none"
                              focusable="false"
                              width="24"
                              height="24"
                              className="icon icon--picto-warranty   product-tabs__trust-icon"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M5.25463 14C4.15672 12.6304 3.5 10.8919 3.5 9C3.5 4.58172 7.08172 1 11.5 1C15.9183 1 19.5 4.58172 19.5 9C19.5 10.8919 18.8433 12.6304 17.7454 14M5.25463 14L1.5 20L4.5 19L5.5 22L8.5 16.4185M5.25463 14C6.15126 15.1185 7.13226 15.9095 8.5 16.4185M8.5 16.4185C9.36872 16.7418 10.5187 17 11.5 17C12.5609 17 13.5736 16.7935 14.5 16.4185M17.7454 14L21.5 20L18.5 19L17.5 22L14.5 16.4185M17.7454 14C16.8949 15.0609 15.7797 15.9005 14.5 16.4185"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>
                              <path
                                d="M8 9.72727L10.1473 12L14.5 7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>
                            </svg>
                            Warranty
                          </button>
                          <button
                            is="toggle-button"
                            className="product-tabs__trust-title icon-text link text--subdued hide-on-tablet-up"
                            ap-controlsaria="product-template--23597517013275__b4b2e57a-b15e-4f11-b27e-b0500d52dc70-trust-2-popover"
                            ap-expanded-aria="false"
                          >
                            <svg
                              fill="none"
                              focusable="false"
                              width="24"
                              height="24"
                              className="icon icon--picto-warranty   product-tabs__trust-icon"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M5.25463 14C4.15672 12.6304 3.5 10.8919 3.5 9C3.5 4.58172 7.08172 1 11.5 1C15.9183 1 19.5 4.58172 19.5 9C19.5 10.8919 18.8433 12.6304 17.7454 14M5.25463 14L1.5 20L4.5 19L5.5 22L8.5 16.4185M5.25463 14C6.15126 15.1185 7.13226 15.9095 8.5 16.4185M8.5 16.4185C9.36872 16.7418 10.5187 17 11.5 17C12.5609 17 13.5736 16.7935 14.5 16.4185M17.7454 14L21.5 20L18.5 19L17.5 22L14.5 16.4185M17.7454 14C16.8949 15.0609 15.7797 15.9005 14.5 16.4185"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>
                              <path
                                d="M8 9.72727L10.1473 12L14.5 7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>
                            </svg>
                            Warranty
                          </button>

                          <button
                            is="toggle-button"
                            className="product-tabs__trust-title icon-text link text--subdued hide-on-phone"
                            ap-controlsaria="product-template--23597517013275__b4b2e57a-b15e-4f11-b27e-b0500d52dc70-trust-3-drawer"
                            ap-expanded-aria="false"
                            style={{ display: "inline-flex" }}
                          >
                            <svg
                              fill="none"
                              focusable="false"
                              width="24"
                              height="24"
                              className="icon icon--picto-secure-payment   product-tabs__trust-icon"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M4 18H1V6M4 18V16H6M4 18V22H11V18M6 16C6 15.6667 6 15.3 6 14.5C6 13.5 6.73438 13 7.5 13C8.26562 13 9 13.5 9 14.5C9 15.3 9 15.6667 9 16M6 16H9M9 16H11V18M11 18H23V6M1 6V2H23V6M1 6H23M9 10H5M19 10V14H13V10H19Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>
                            </svg>
                            Secure Payment
                          </button>
                          <button
                            is="toggle-button"
                            className="product-tabs__trust-title icon-text link text--subdued hide-on-tablet-up"
                            ap-controlsaria="product-template--23597517013275__b4b2e57a-b15e-4f11-b27e-b0500d52dc70-trust-3-popover"
                            ap-expanded-aria="false"
                          >
                            <svg
                              fill="none"
                              focusable="false"
                              width="24"
                              height="24"
                              className="icon icon--picto-secure-payment   product-tabs__trust-icon"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M4 18H1V6M4 18V16H6M4 18V22H11V18M6 16C6 15.6667 6 15.3 6 14.5C6 13.5 6.73438 13 7.5 13C8.26562 13 9 13.5 9 14.5C9 15.3 9 15.6667 9 16M6 16H9M9 16H11V18M11 18H23V6M1 6V2H23V6M1 6H23M9 10H5M19 10V14H13V10H19Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>
                            </svg>
                            Secure Payment
                          </button>
                        </div>
                      </div>
                    </div>

                    <div
                      id="block-5d25217f-c0a7-454c-9bdf-2e9b6e9cfd03"
                      className={`product-tabs__tab-item-wrapper ${
                        activeTab === "additional" ? "is-active" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="collapsible-toggle heading heading--small hide-on-laptop-up"
                        aria-expanded={activeTab === "additional"}
                        onClick={() => toggleProductTab("additional")}
                      >
                        Additional information
                        <svg
                          focusable="false"
                          width="12"
                          height="8"
                          className="icon icon--chevron   "
                          viewBox="0 0 12 8"
                        >
                          <path
                            fill="none"
                            d="M1 1l5 5 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                          ></path>
                        </svg>
                      </button>
                      <div
                        id="block-5d25217f-c0a7-454c-9bdf-2e9b6e9cfd03-content"
                        className={`product-mobile-tab-content ${
                          activeTab === "additional" ? "is-open" : ""
                        }`}
                      >
                        <div className="product-tabs__tab-item-content rte">
                          <p>
                            By changing our most important processes and
                            products, we have already made a big leap forward.
                            This ranges from the increased use of more
                            sustainable fibers to the use of more
                            environmentally friendly printing processes to the
                            development of efficient waste management in our
                            value chain.
                          </p>
                          <p>
                            <a
                              href="https://ap-leotheme.myshopify.com/pages/sustainability"
                              title="Sustainability"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Learn more about sustainability
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      id="block-AaVhUbEdMRFUyU3o0b__judge_me_reviews_review_widget_WH7V8q"
                      className={`product-tabs__tab-item-wrapper ${
                        activeTab === "reviews" ? "is-active" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="collapsible-toggle heading heading--small hide-on-laptop-up"
                        aria-expanded={activeTab === "reviews"}
                        onClick={() => toggleProductTab("reviews")}
                      >
                        Reviews{" "}
                        {reviewMeta.totalReviews > 0
                          ? `(${reviewMeta.totalReviews})`
                          : ""}
                        <svg
                          focusable="false"
                          width="12"
                          height="8"
                          className="icon icon--chevron   "
                          viewBox="0 0 12 8"
                        >
                          <path
                            fill="none"
                            d="M1 1l5 5 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                          ></path>
                        </svg>
                      </button>
                      <div
                        id="block-AaVhUbEdMRFUyU3o0b__judge_me_reviews_review_widget_WH7V8q-content"
                        className={`product-mobile-tab-content ${
                          activeTab === "reviews" ? "is-open" : ""
                        }`}
                      >
                        <div
                          id="shopify-product-reviews"
                          className="product-reviews-spr"
                          data-id="9713931944219"
                        >
                          <div
                            id="shopify-block-AaVhUbEdMRFUyU3o0b__judge_me_reviews_review_widget_WH7V8q"
                            className="theme-block app-block"
                            data-block-handle="review_widget"
                          >
                            <div style={{ clear: "both" }}></div>
                            <div
                              id="judgeme_product_reviews"
                              className="review-widget review-widget review-done-setup-widget"
                              data-product-title="A Short History of Nearly Everything"
                              data-id="9713931944219"
                              data-product-id="9713931944219"
                              data-widget="review"
                              data-shop-reviews="false"
                              data-shop-reviews-count="0"
                              data-cart-eligible-template="false"
                              data-shop-average-rating="3.29"
                              data-shop-review-count="7"
                              data-empty-state="empty_widget"
                              data-entry-point="review_widget.js"
                              data-entry-key="review-widget/main.js"
                              data-block-id="AaVhUbEdMRFUyU3o0b__judge_me_reviews_review_widget_WH7V8q"
                              data-customer-logged-in="false"
                              style={{ maxWidth: "1200px", margin: "0 auto" }}
                              data-widget-name="review_widget"
                              data-impressions-tracked="true"
                              data-views-tracked="true"
                            >
                              <div className="review-container py-4">
                                <div className="review-header text-center mb-4">
                                  <h2 className="review-title fs-3 fw-bold mb-3">
                                    Customer Reviews
                                  </h2>

                                  {/* Review Feedback Alert */}
                                  {reviewFeedback.message && (
                                    <div
                                      className={`alert alert-${reviewFeedback.type} alert-dismissible fade show mx-auto mb-4 text-start`}
                                      style={{ maxWidth: "650px" }}
                                      role="alert"
                                    >
                                      <div className="d-flex align-items-center">
                                        <i
                                          className={`me-2 fs-5 ${
                                            reviewFeedback.type === "success"
                                              ? "ri-checkbox-circle-line text-success"
                                              : "ri-error-warning-line text-danger"
                                          }`}
                                        ></i>
                                        <div>{reviewFeedback.message}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Review Summary Score and Histogram */}
                                  <div className="review-row-stars d-flex flex-column align-items-center justify-content-center">
                                    <div className="review-summary text-center">
                                      <div className="review-summary-inner">
                                        <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                                          <div className="review-summary-stars-list d-inline-flex align-items-center">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                              <i
                                                key={s}
                                                className={
                                                  reviewMeta.averageRating >= s
                                                    ? "ri-star-fill text-warning"
                                                    : reviewMeta.averageRating >=
                                                        s - 0.5
                                                      ? "ri-star-half-fill text-warning"
                                                      : "ri-star-line text-muted"
                                                }
                                                style={{
                                                  fontSize: "20px",
                                                  color:
                                                    reviewMeta.averageRating >=
                                                    s - 0.5
                                                      ? "#f59e0b"
                                                      : "#ccc",
                                                  marginRight: "2px",
                                                }}
                                              ></i>
                                            ))}
                                          </div>
                                          {reviewMeta.totalReviews > 0 && (
                                            <span className="fw-bold fs-5 text-dark ms-1">
                                              {reviewMeta.averageRating.toFixed(
                                                1,
                                              )}
                                            </span>
                                          )}
                                        </div>

                                        <div className="review-summary-text text-muted">
                                          {reviewMeta.totalReviews > 0
                                            ? `Based on ${reviewMeta.totalReviews} ${
                                                reviewMeta.totalReviews === 1
                                                  ? "review"
                                                  : "reviews"
                                              }`
                                            : "No reviews yet. Be the first to write a review!"}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Star Rating Breakdown / Histogram */}
                                    {reviewMeta.totalReviews > 0 && (
                                      <div
                                        className="review-histogram w-100 my-3 text-start"
                                        style={{ maxWidth: "420px" }}
                                      >
                                        {[5, 4, 3, 2, 1].map((star) => {
                                          const count =
                                            reviewMeta.ratingCounts?.[star] ||
                                            0;
                                          const pct =
                                            reviewMeta.ratingPercentages?.[
                                              star
                                            ] || 0;
                                          return (
                                            <div
                                              key={star}
                                              className="d-flex align-items-center gap-2 mb-1"
                                              style={{ fontSize: "13px" }}
                                            >
                                              <span
                                                style={{
                                                  width: "35px",
                                                  color: "#555",
                                                  fontWeight: "600",
                                                }}
                                              >
                                                {star} ★
                                              </span>
                                              <div
                                                className="progress flex-grow-1"
                                                style={{
                                                  height: "8px",
                                                  backgroundColor: "#e9ecef",
                                                  borderRadius: "4px",
                                                }}
                                              >
                                                <div
                                                  className="progress-bar"
                                                  role="progressbar"
                                                  style={{
                                                    width: `${pct}%`,
                                                    backgroundColor: "#027a36",
                                                    borderRadius: "4px",
                                                  }}
                                                  aria-valuenow={pct}
                                                  aria-valuemin="0"
                                                  aria-valuemax="100"
                                                ></div>
                                              </div>
                                              <span
                                                className="text-muted text-end"
                                                style={{ width: "30px" }}
                                              >
                                                {count}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Write a Review Button / Customer State */}
                                    <div className="review-widget-actions mt-3">
                                      {!isLoggedIn ? (
                                        <div>
                                          {!showLoginNotice ? (
                                            <button
                                              type="button"
                                              className="btn btn-success px-4 py-2 fw-semibold"
                                              style={{
                                                backgroundColor: "#027a36",
                                                borderColor: "#027a36",
                                              }}
                                              onClick={() =>
                                                setShowLoginNotice(true)
                                              }
                                            >
                                              Write a review
                                            </button>
                                          ) : (
                                            <div
                                              className="alert alert-info d-flex align-items-center justify-content-between gap-3 text-start p-3 mx-auto"
                                              style={{ maxWidth: "480px" }}
                                            >
                                              <div className="d-flex align-items-center gap-2">
                                                <i className="ri-information-line fs-5"></i>
                                                <span>
                                                  Please login to write a
                                                  review.
                                                </span>
                                              </div>
                                              <button
                                                type="button"
                                                className="btn btn-sm btn-primary text-white text-nowrap"
                                                onClick={() =>
                                                  navigate("/account/login")
                                                }
                                              >
                                                Log In
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      ) : userHasReviewed ? (
                                        <div
                                          className={`alert ${
                                            userReview?.status === "pending"
                                              ? "alert-warning"
                                              : "alert-success"
                                          } d-flex align-items-center justify-content-center gap-2 px-4 py-2 mx-auto`}
                                          style={{ maxWidth: "450px" }}
                                        >
                                          <i
                                            className={
                                              userReview?.status === "pending"
                                                ? "ri-time-line fs-5 text-warning"
                                                : "ri-checkbox-circle-line fs-5 text-success"
                                            }
                                          ></i>
                                          <span>
                                            {userReview?.status === "pending"
                                              ? "Your review is awaiting approval."
                                              : "You have already reviewed this product."}
                                          </span>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          className="btn btn-success px-4 py-2 fw-semibold"
                                          style={{
                                            backgroundColor: "#027a36",
                                            borderColor: "#027a36",
                                          }}
                                          onClick={() =>
                                            setShowReviewForm(!showReviewForm)
                                          }
                                        >
                                          {showReviewForm
                                            ? "Close Form"
                                            : "Write a review"}
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Review Form */}
                                  {showReviewForm &&
                                    isLoggedIn &&
                                    !userHasReviewed && (
                                      <div
                                        className="review-form-wrapper mt-4 pt-4 border-top text-start mx-auto"
                                        style={{ maxWidth: "600px" }}
                                      >
                                        <form
                                          className="review-form"
                                          onSubmit={handleSubmitReview}
                                          noValidate
                                        >
                                          <h3 className="review-form-title fs-5 fw-bold mb-3">
                                            Write a review
                                          </h3>

                                          {/* Rating Selector */}
                                          <div className="review-form-fieldset mb-3">
                                            <label className="form-label fw-semibold d-block mb-1">
                                              Rating{" "}
                                              <span className="text-danger">
                                                *
                                              </span>
                                            </label>
                                            <div
                                              className="d-flex align-items-center gap-1"
                                              style={{ cursor: "pointer" }}
                                            >
                                              {[1, 2, 3, 4, 5].map((star) => {
                                                const active =
                                                  (hoverRating ||
                                                    reviewRating) >= star;
                                                return (
                                                  <i
                                                    key={star}
                                                    className={
                                                      active
                                                        ? "ri-star-fill"
                                                        : "ri-star-line"
                                                    }
                                                    style={{
                                                      fontSize: "26px",
                                                      color: active
                                                        ? "#f59e0b"
                                                        : "#ccc",
                                                      transition: "color 0.15s",
                                                    }}
                                                    onMouseEnter={() =>
                                                      setHoverRating(star)
                                                    }
                                                    onMouseLeave={() =>
                                                      setHoverRating(0)
                                                    }
                                                    onClick={() =>
                                                      setReviewRating(star)
                                                    }
                                                    title={`${star} Star${
                                                      star > 1 ? "s" : ""
                                                    }`}
                                                  ></i>
                                                );
                                              })}
                                              <span
                                                className="ms-2 text-muted"
                                                style={{ fontSize: "14px" }}
                                              >
                                                ({hoverRating || reviewRating}{" "}
                                                of 5 stars)
                                              </span>
                                            </div>
                                          </div>

                                          {/* Review Title */}
                                          <div className="review-form-fieldset mb-3">
                                            <label className="form-label fw-semibold mb-1">
                                              Review Title{" "}
                                              <span className="text-danger">
                                                *
                                              </span>
                                            </label>
                                            <input
                                              type="text"
                                              className="form-control"
                                              placeholder="Give your review a title (e.g. Great book!)"
                                              value={reviewTitle}
                                              onChange={(e) =>
                                                setReviewTitle(e.target.value)
                                              }
                                              required
                                            />
                                          </div>

                                          {/* Review Content */}
                                          <div className="review-form-fieldset mb-3">
                                            <label className="form-label fw-semibold mb-1">
                                              Review Content{" "}
                                              <span className="text-danger">
                                                *
                                              </span>
                                            </label>
                                            <textarea
                                              className="form-control"
                                              rows="4"
                                              placeholder="Share your thoughts about this product..."
                                              value={reviewComment}
                                              onChange={(e) =>
                                                setReviewComment(e.target.value)
                                              }
                                              required
                                            ></textarea>
                                          </div>

                                          {/* Reviewer Display Details */}
                                          <div
                                            className="review-form-fieldset mb-3 text-muted"
                                            style={{ fontSize: "13px" }}
                                          >
                                            <i className="ri-user-line me-1"></i>{" "}
                                            Submitting as:{" "}
                                            <strong>
                                              {user?.name || "Customer"}
                                            </strong>{" "}
                                            ({user?.email})
                                          </div>

                                          {/* Form Actions */}
                                          <div className="d-flex align-items-center gap-3 mt-4">
                                            <button
                                              type="button"
                                              className="btn btn-outline-secondary px-4 py-2"
                                              onClick={() => {
                                                setShowReviewForm(false);
                                                setReviewFeedback({
                                                  type: "",
                                                  message: "",
                                                });
                                              }}
                                              disabled={submittingReview}
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              type="submit"
                                              className="btn btn-success px-4 py-2 d-flex align-items-center gap-2 text-white"
                                              style={{
                                                backgroundColor: "#027a36",
                                                borderColor: "#027a36",
                                              }}
                                              disabled={submittingReview}
                                            >
                                              {submittingReview ? (
                                                <>
                                                  <span
                                                    className="spinner-border spinner-border-sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                  ></span>
                                                  Submitting...
                                                </>
                                              ) : (
                                                "Submit Review"
                                              )}
                                            </button>
                                          </div>
                                        </form>
                                      </div>
                                    )}
                                </div>

                                {/* Approved Reviews Section */}
                                <div className="review-body mt-4 pt-4 border-top text-start">
                                  {reviews.length > 0 && (
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                                      <h4
                                        className="fw-bold mb-0"
                                        style={{ fontSize: "18px" }}
                                      >
                                        Reviews ({reviews.length})
                                      </h4>
                                      <div className="d-flex align-items-center gap-2">
                                        <label
                                          htmlFor="review-sort-select"
                                          className="text-muted small mb-0"
                                        >
                                          Sort:
                                        </label>
                                        <select
                                          id="review-sort-select"
                                          className="form-select form-select-sm"
                                          style={{ width: "150px" }}
                                          value={reviewSort}
                                          onChange={(e) =>
                                            setReviewSort(e.target.value)
                                          }
                                        >
                                          <option value="most-recent">
                                            Most Recent
                                          </option>
                                          <option value="highest-rating">
                                            Highest Rating
                                          </option>
                                          <option value="lowest-rating">
                                            Lowest Rating
                                          </option>
                                        </select>
                                      </div>
                                    </div>
                                  )}

                                  {/* Loading State */}
                                  {loadingReviews ? (
                                    <div className="text-center py-5">
                                      <div
                                        className="spinner-border text-success"
                                        role="status"
                                      >
                                        <span className="visually-hidden">
                                          Loading reviews...
                                        </span>
                                      </div>
                                      <p className="text-muted mt-2">
                                        Loading reviews...
                                      </p>
                                    </div>
                                  ) : reviews.length > 0 ? (
                                    <div className="review-list">
                                      {[...reviews]
                                        .sort((a, b) => {
                                          if (reviewSort === "highest-rating") {
                                            return b.rating - a.rating;
                                          }
                                          if (reviewSort === "lowest-rating") {
                                            return a.rating - b.rating;
                                          }
                                          return (
                                            new Date(b.created_at || 0) -
                                            new Date(a.created_at || 0)
                                          );
                                        })
                                        .map((r) => {
                                          const reviewDate = r.created_at
                                            ? new Date(
                                                r.created_at,
                                              ).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                              })
                                            : "";
                                          const reviewerName =
                                            r.user?.name || "Verified Customer";

                                          return (
                                            <div
                                              key={r.review_id}
                                              className="review-item py-3 border-bottom"
                                              style={{
                                                borderColor: "rgba(0,0,0,0.08)",
                                              }}
                                            >
                                              <div className="d-flex align-items-center justify-content-between mb-2">
                                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                                  <span className="d-inline-flex align-items-center">
                                                    {[1, 2, 3, 4, 5].map(
                                                      (s) => (
                                                        <i
                                                          key={s}
                                                          className={
                                                            r.rating >= s
                                                              ? "ri-star-fill"
                                                              : "ri-star-line"
                                                          }
                                                          style={{
                                                            fontSize: "15px",
                                                            color:
                                                              r.rating >= s
                                                                ? "#f59e0b"
                                                                : "#ccc",
                                                            marginRight: "2px",
                                                          }}
                                                        ></i>
                                                      ),
                                                    )}
                                                  </span>
                                                  {r.title && (
                                                    <strong className="fw-semibold ms-2">
                                                      {r.title}
                                                    </strong>
                                                  )}
                                                </div>
                                                <span className="text-muted small">
                                                  {reviewDate}
                                                </span>
                                              </div>
                                              <p
                                                className="mb-2 text-dark"
                                                style={{
                                                  lineHeight: "1.6",
                                                  whiteSpace: "pre-wrap",
                                                }}
                                              >
                                                {r.comment}
                                              </p>
                                              <div className="d-flex align-items-center gap-1 text-muted small">
                                                <i className="ri-user-3-line"></i>
                                                <span>— {reviewerName}</span>
                                                <span
                                                  className="badge bg-light text-success ms-2 border"
                                                  style={{ fontSize: "11px" }}
                                                >
                                                  <i className="ri-shield-check-line me-1"></i>{" "}
                                                  Verified Customer
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-muted">
                                      <i
                                        className="ri-chat-1-line"
                                        style={{
                                          fontSize: "36px",
                                          color: "#ccc",
                                        }}
                                      ></i>
                                      <p className="mt-2 mb-0">
                                        No reviews yet. Be the first to write a
                                        review!
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="container-fluid"></div>
      </section>
      <section
        id="shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb"
        class="site-section section recenty-section"
      >
        <style data-shopify="">
          {`    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb {margin: 60px 0;}

    

    

    
      @media(max-width: 767px){
        #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb {
          
            margin: 40px 0;
          
          
        }
      }`}
        </style>
        <style>
          {`  #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb .product-list {
    overflow: hidden;
  }

  @media screen and (max-width: 740px) {
    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb {
      --section-products-per-row: 1;
    }
    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb .product-list-inner--scroller{
      grid-auto-columns: 25%;
    }
    .recently-wp-content {
      padding: 1px;
    }
  } 

  @media screen and (min-width: 741px) {
    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb {
      --section-products-per-row: 2;
    }
    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb .product-list-inner--scroller{
      grid-auto-columns: 25%;
      padding: 1px;
    }
  }

  @media screen and (min-width: 1000px) {
    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb {
      --section-products-per-row: 3;
    }
    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb .product-list-inner--scroller{
      grid-auto-columns: 25%;
      padding: 1px;
    }
  }

  @media screen and (min-width: 1200px) {
    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb {
      --section-products-per-row: 4;
    }
    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb .product-list-inner--scroller{
      grid-auto-columns: 25%;
      padding: 1px;
      padding-bottom: 55px;
    }
  }`}
        </style>
        <ap-recentlyproductsviewed
          section-id="template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb"
          products-count="10"
          class="section section--flush"
        >
          <div class="container vertical-breather vertical-breather--tight vertical-breather--margin">
            <header class="section__header text-center mb-5">
              <h2 class="heading h3">Related Products</h2>
            </header>
            <ap-productlist
              stagger-apparition
              class="product-list object-loaded"
              style={{ opacity: "1" }}
            >
              <div class="scroller">
                <div class="recently-wp-content">
                  <div
                    class="product-list-inner product-list-inner--scroller product-list-inner--desktop-no-scroller hide-scrollbar"
                    style={{
                      gridTemplateColumns:
                        "repeat(\n                        auto-fit,\n                        calc(100% / 4 - 0px * (3 - 1) / 3)\n                      )",
                    }}
                  >
                    {DETAILS.map((product) => (
                      <product-item
                        className="slider__item"
                        id={`product-item-${product.id}`}
                        key={product.id}
                        style={{ opacity: "1" }}
                        data-stock={product.stock}
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
                              {product.discount && (
                                <div className="product-card-badge-list label-list label-list-sale">
                                  <div
                                    className={`label label--highlight ${
                                      product.discount === "SOLD"
                                        ? "label--subdued"
                                        : ""
                                    }`}
                                  >
                                    {product.discount}
                                  </div>
                                </div>
                              )}
                              <a
                                href="#"
                                className="product-card-aspect-ratio aspect-ratio"
                                style={{
                                  paddingBottom: "100%",
                                  aspectRatio: "0.71",
                                }}
                              >
                                <img
                                  className="product-card-primary-image"
                                  loading="eager"
                                  src={product.image}
                                  sizes="(min-width: 1200px) 550px, (min-width: 750px) calc((100vw - 130px)/2), calc((100vw - 50px)/2)"
                                  width="520"
                                  height="728"
                                  alt={product.title}
                                />
                                <img
                                  className="product-card-secondary-image"
                                  loading="eager"
                                  src={product.secondaryImage}
                                  sizes="(min-width: 1200px) 550px, (min-width: 750px) calc((100vw - 130px)/2), calc((100vw - 50px)/2)"
                                  width="520"
                                  height="728"
                                  alt={product.title}
                                />
                              </a>
                              <div title="Add to Wishlist">
                                <ap-wishlistbutton className="product-action-btn wishlist-btn">
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
                                        fill="currentColor"
                                      ></path>
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
                                            hidden="true"
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
                                          hidden="true"
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
                                <a href="#" className="product-card-title mb-1">
                                  {product.title}
                                </a>
                                <div className="product-author my-2">
                                  <a href="#">{product.author}</a>
                                </div>
                                <div className="product-description d-none">
                                  {product.description}
                                </div>
                                <div className="product-price">
                                  <div className="product-card-price-container">
                                    <div className="price-list">
                                      <span className="price">
                                        <span className="visually-hidden">
                                          regular price
                                        </span>
                                        ₹{product.price}
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
                                        method="post"
                                        action="/cart/add"
                                        id="ap-productform-template--23597515604251__product_carousel_bcNNdU-9713931944219"
                                        acceptCharset="UTF-8"
                                        className="product-card-form"
                                        encType="multipart/form-data"
                                        is="ap-productform"
                                      >
                                        <button
                                          is="loader-button"
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
                                              hidden="true"
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
                                            hidden="true"
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
                      </product-item>
                    ))}
                  </div>
                </div>
              </div>
            </ap-productlist>
          </div>
        </ap-recentlyproductsviewed>
      </section>
      <section
        id="shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb"
        class="site-section section recenty-section"
      >
        <style data-shopify="">
          {`    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb {margin: 60px 0;}

    

    

    
      @media(max-width: 767px){
        #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb {
          
            margin: 40px 0;
          
          
        }
      }`}
        </style>
        <style>
          {`  #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb .product-list {
    overflow: hidden;
  }

  @media screen and (max-width: 740px) {
    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb {
      --section-products-per-row: 1;
    }
    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb .product-list-inner--scroller{
      grid-auto-columns: 25%;
    }
    .recently-wp-content {
      padding: 1px;
    }
  } 

  @media screen and (min-width: 741px) {
    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb {
      --section-products-per-row: 2;
    }
    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb .product-list-inner--scroller{
      grid-auto-columns: 25%;
      padding: 1px;
    }
  }

  @media screen and (min-width: 1000px) {
    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb {
      --section-products-per-row: 3;
    }
    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb .product-list-inner--scroller{
      grid-auto-columns: 25%;
      padding: 1px;
    }
  }

  @media screen and (min-width: 1200px) {
    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb {
      --section-products-per-row: 4;
    }
    #shopify-section-template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb .product-list-inner--scroller{
      grid-auto-columns: 25%;
      padding: 1px;
      padding-bottom: 55px;
    }
  }`}
        </style>
        <ap-recentlyproductsviewed
          section-id="template--23597517013275__7f59f038-f024-4094-9ff4-3fb2cc033feb"
          products-count="10"
          class="section section--flush"
        >
          <div class="container vertical-breather vertical-breather--tight vertical-breather--margin">
            <header class="section__header text-center mb-5">
              <h2 class="heading h3">You may also like</h2>
            </header>
            <ap-productlist
              stagger-apparition
              class="product-list object-loaded"
              style={{ opacity: "1" }}
            >
              <div class="scroller">
                <div class="recently-wp-content">
                  <div
                    class="product-list-inner product-list-inner--scroller product-list-inner--desktop-no-scroller hide-scrollbar"
                    style={{
                      gridTemplateColumns:
                        "repeat(\n                        auto-fit,\n                        calc(100% / 4 - 0px * (3 - 1) / 3)\n                      )",
                    }}
                  >
                    {DETAILSss.map((product) => (
                      <product-item
                        className="slider__item"
                        id={`product-item-${product.id}`}
                        key={product.id}
                        style={{ opacity: "1" }}
                        data-stock={product.stock}
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
                              {product.discount && (
                                <div className="product-card-badge-list label-list label-list-sale">
                                  <div
                                    className={`label label--highlight ${
                                      product.discount === "SOLD"
                                        ? "label--subdued"
                                        : ""
                                    }`}
                                  >
                                    {product.discount}
                                  </div>
                                </div>
                              )}
                              <a
                                href="#"
                                className="product-card-aspect-ratio aspect-ratio"
                                style={{
                                  paddingBottom: "100%",
                                  aspectRatio: "0.71",
                                }}
                              >
                                <img
                                  className="product-card-primary-image"
                                  loading="eager"
                                  src={product.image}
                                  sizes="(min-width: 1200px) 550px, (min-width: 750px) calc((100vw - 130px)/2), calc((100vw - 50px)/2)"
                                  width="520"
                                  height="728"
                                  alt={product.title}
                                />
                                <img
                                  className="product-card-secondary-image"
                                  loading="eager"
                                  src={product.secondaryImage}
                                  sizes="(min-width: 1200px) 550px, (min-width: 750px) calc((100vw - 130px)/2), calc((100vw - 50px)/2)"
                                  width="520"
                                  height="728"
                                  alt={product.title}
                                />
                              </a>
                              <div title="Add to Wishlist">
                                <ap-wishlistbutton className="product-action-btn wishlist-btn">
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
                                        fill="currentColor"
                                      ></path>
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
                                            hidden="true"
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
                                          hidden="true"
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
                                <a href="#" className="product-card-title mb-1">
                                  {product.title}
                                </a>
                                <div className="product-author my-2">
                                  <a href="#">{product.author}</a>
                                </div>
                                <div className="product-description d-none">
                                  {product.description}
                                </div>
                                <div className="product-price">
                                  <div className="product-card-price-container">
                                    <div className="price-list">
                                      <span className="price">
                                        <span className="visually-hidden">
                                          regular price
                                        </span>
                                        ₹{product.price}
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
                                        method="post"
                                        action="/cart/add"
                                        id="ap-productform-template--23597515604251__product_carousel_bcNNdU-9713931944219"
                                        acceptCharset="UTF-8"
                                        className="product-card-form"
                                        encType="multipart/form-data"
                                        is="ap-productform"
                                      >
                                        <button
                                          is="loader-button"
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
                                              hidden="true"
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
                                            hidden="true"
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
                      </product-item>
                    ))}
                  </div>
                </div>
              </div>
            </ap-productlist>
          </div>
        </ap-recentlyproductsviewed>
      </section>
      <NewsLetter />
      <Footer />
    </>
  );
};
export default ProductDetails;