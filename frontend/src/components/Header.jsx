import { useState, useEffect } from "react";
import CartSidebar from "./CartSidebar";
import AboutUsPage from "../pages/AboutUsPage";
import BlogsPage from "../pages/BlogsPage";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import NotificationDropdown from "./NotificationDropdown";
const Header = () => {
  const { cart, isCartOpen, openCart, closeCart } = useCart();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { wishlist } = useWishlist();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    const handleEscapeNav = (e) => {
      if (e.key === "Escape" && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscapeNav);
    return () => window.removeEventListener("keydown", handleEscapeNav);
  }, [isMobileNavOpen]);
  useEffect(() => {
    const dropdowns = [
      {
        form: document.getElementById("HeaderCountryForm"),
        buttonSelector: ".disclosure__button",
        listSelector: ".disclosure__list",
      },
      {
        form: document.getElementById("localization_form"),
        buttonSelector: ".disclosure__button",
        listSelector: "#LanguageList",
      },
    ];

    const closeAll = (exceptForm = null) => {
      dropdowns.forEach((d) => {
        if (!d.form) return;
        if (exceptForm && d.form === exceptForm) return;

        const btn = d.form.querySelector(d.buttonSelector);
        const list = d.form.querySelector(d.listSelector);

        if (btn && list) {
          list.hidden = true;
          btn.setAttribute("aria-expanded", "false");
        }
      });
    };

    const cleanupHandlers = [];

    dropdowns.forEach((d) => {
      if (!d.form) return;

      const button = d.form.querySelector(d.buttonSelector);
      const list = d.form.querySelector(d.listSelector);

      if (!button || !list) return;

      const handleButtonClick = (e) => {
        e.stopPropagation();

        const isOpen = button.getAttribute("aria-expanded") === "true";

        closeAll(d.form);

        if (!isOpen) {
          list.hidden = false;
          button.setAttribute("aria-expanded", "true");
        } else {
          list.hidden = true;
          button.setAttribute("aria-expanded", "false");
        }
      };

      button.addEventListener("click", handleButtonClick);
      cleanupHandlers.push(() =>
        button.removeEventListener("click", handleButtonClick),
      );
    });

    const handleDocumentClick = () => closeAll();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeAll();
      }
    };

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cleanupHandlers.forEach((cleanup) => cleanup());
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div
        id="shopify-section-sections--23597517570331__announcement_bar_c4nzng"
        className="site-section site-header-top site-announcement-bar"
      >
        <section>
          <ap-announcementbar
            auto-play=""
            cycle-speed="5"
            className="announcement-bar announcement-bar-multiple"
          >
            <div className="container position-relative">
              <button
                data-action="prev"
                className="tap-target tap-target-large btn-prev d-sm-block d-none"
              >
                <span className="visually-hidden">Previous</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="8"
                  height="13"
                  viewBox="0 0 8 13"
                  fill="none"
                >
                  <path
                    d="M0.535156 6.28516C0.279948 6.59505 0.279948 6.90495 0.535156 7.21484L5.78516 12.4648C6.09505 12.7201 6.40495 12.7201 6.71484 12.4648C6.97005 12.1549 6.97005 11.8451 6.71484 11.5352L1.92969 6.75L6.71484 1.96484C6.97005 1.65495 6.97005 1.34505 6.71484 1.03516C6.40495 0.779948 6.09505 0.779948 5.78516 1.03516L0.535156 6.28516Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </button>

              <div className="row announcement-row align-items-center">
                <ap-announcementbar-item
                  show=""
                  has-content=""
                  className="announcement-bar-item text-center col-12"
                >
                  <div className="announcement-bar-message announcement-text-md">
                    All books at least 50% off list prices every day
                  </div>
                  <div
                    className="announcement-bar-content has-image"
                    style={{ display: "none" }}
                  >
                    <div className="announcement-bar-content-overlay"></div>
                    <div className="announcement-bar-content-overflow">
                      <div className="announcement-bar-content-inner">
                        <button
                          type="button"
                          className="announcement-bar__close-button tap-target"
                          data-action="close-content"
                        >
                          <span className="visually-hidden">Close</span>
                          <svg
                            focusable="false"
                            width="14"
                            height="14"
                            className="icon icon--close"
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

                        <div className="announcement-bar-content-text-wrapper">
                          <div className="announcement-bar-content-text text-container">
                            <h3 className="heading"></h3>
                            <p></p>
                            <div className="button-wrapper">
                              <a href="" className="button button--primary"></a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>{" "}
                </ap-announcementbar-item>
                <ap-announcementbar-item
                  has-content=""
                  className="announcement-bar-item text-center col-12"
                  hidden
                  style={{ display: "none" }}
                >
                  <div className="announcement-bar-message announcement-text-md">
                    All books at least 50% off list prices every day
                  </div>
                  <div
                    className="announcement-bar-content has-image"
                    style={{ display: "none" }}
                  >
                    <div className="announcement-bar-content-overlay"></div>
                    <div className="announcement-bar-content-overflow">
                      <div className="announcement-bar-content-inner">
                        <button
                          type="button"
                          className="announcement-bar__close-button tap-target"
                          data-action="close-content"
                        >
                          <span className="visually-hidden">Close</span>
                          <svg
                            focusable="false"
                            width="14"
                            height="14"
                            className="icon icon--close"
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
                        <img
                          className="announcement-bar-content-image"
                          loading="lazy"
                          sizes="50vw"
                          alt=""
                          src="Liquid error (sections/announcement-bar line 173): invalid url input"
                          data-srcset="Liquid error (sections/announcement-bar line 174): invalid url input 400w, Liquid error (sections/announcement-bar line 174): invalid url input 500w, Liquid error (sections/announcement-bar line 174): invalid url input 600w, Liquid error (sections/announcement-bar line 174): invalid url input 700w, Liquid error (sections/announcement-bar line 174): invalid url input 800w, Liquid error (sections/announcement-bar line 174): invalid url input 900w, Liquid error (sections/announcement-bar line 174): invalid url input 1000w, Liquid error (sections/announcement-bar line 174): invalid url input 1200w, Liquid error (sections/announcement-bar line 174): invalid url input 1400w"
                          width="1400"
                          height="800"
                        />
                        <div className="announcement-bar-content-text-wrapper">
                          <div className="announcement-bar-content-text text-container">
                            <h3 className="heading"></h3>
                            <p></p>
                            <div className="button-wrapper">
                              <a href="" className="button button--primary"></a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ap-announcementbar-item>
              </div>

              <button
                data-action="next"
                className="tap-target tap-target-large btn-next d-sm-block d-none"
              >
                <span className="visually-hidden">Next</span>
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
              </button>
            </div>
          </ap-announcementbar>
        </section>
      </div>
      <div
        id="shopify-section-header-3"
        className="site-section site-header-main"
      >
        <ap-headerstore sticky className="header header-3" role="banner">
          <div className="header-wrapper">
            <div className="container">
              <div className="header_wrapper-row">
                <div className="header__icon-menu hide-on-desktop">
                  <button
                    className="header__icon-wrapper tap-target hide-on-desktop"
                    onClick={() => setIsMobileNavOpen(true)}
                    aria-label="Open mobile menu"
                  >
                    <span className="visually-hidden">Navigation</span>
                    <svg
                      focusable="false"
                      width="18"
                      height="14"
                      className="icon icon--header-hamburger"
                      viewBox="0 0 18 14"
                    >
                      <path
                        d="M0 1h18M0 13h18H0zm0-6h18H0z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      ></path>
                    </svg>
                  </button>
                  <a
                    href="/collections/all"
                    className="header__icon-wrapper tap-target hide-on-desktop"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileNavOpen(true);
                    }}
                    aria-label="Search"
                  >
                    <div className="icon-header">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                  </a>
                </div>
                <h1 className="header__logo center">
                  <a href="/" className="header__logo-link">
                    <span className="visually-hidden">Ap Bokifa</span>
                    <img
                      src="https://ap-bokifa.myshopify.com/cdn/shop/files/logo.png?v=1729482566"
                      width="150"
                      height="37.5"
                      className="header__logo-image"
                    />
                  </a>
                </h1>
                <nav className="header-icon search-icon-text header-search d-xl-block d-none">
                  <div className="header__search-bar predictive-search">
                    <form
                      className="predictive-search__form"
                      action="/search"
                      method="get"
                      role="search"
                    >
                      <input type="hidden" name="type" value="product" />
                      <input
                        type="hidden"
                        name="options[prefix]"
                        value="last"
                      />
                      <input
                        type="hidden"
                        name="options[unavailable_products]"
                        value="last"
                      />
                      <input
                        className="predictive-search__input"
                        is="ap-predictivesearchinput"
                        type="text"
                        name="q"
                        autoComplete="off"
                        autoCorrect="off"
                        ap-controlsaria="search-drawer"
                        ap-expanded-aria="false"
                        aria-label="Search"
                        placeholder="Search our store..."
                      />
                      <button
                        className="btn-search-header"
                        style={{ "letter-spacing": "1px" }}
                      >
                        <div className="icon-header">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            ></path>
                          </svg>
                        </div>
                        <span>Search</span>
                      </button>
                    </form>
                  </div>
                </nav>
                <div className="header__secondary-links">
                  <div className="d-flex align-items-center">
                    <div className="hide-on-phone">
                      <localization-form className="currency d-block">
                        <form
                          method="post"
                          action="/localization"
                          id="HeaderCountryForm"
                          acceptCharset="UTF-8"
                          className="localization-form"
                          enctype="multipart/form-data"
                        >
                          <input
                            type="hidden"
                            name="form_type"
                            value="localization"
                          />
                          <input type="hidden" name="utf8" value="✓" />
                          <input type="hidden" name="_method" value="put" />
                          <input type="hidden" name="return_to" value="/" />
                          <div className="no-js-hidden">
                            <div className="disclosure">
                              <button
                                type="button"
                                className="disclosure__button localization-form__select localization-selector"
                                aria-expanded="false"
                                aria-controls="FooterCountryList"
                                aria-describedby="FooterCountryLabel"
                              >
                                USD $
                                <svg
                                  aria-hidden
                                  focusable="false"
                                  role="presentation"
                                  className="icon icon-caret"
                                  viewBox="0 0 10 6"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z"
                                    fill="currentColor"
                                  ></path>
                                </svg>
                              </button>
                              <div className="disclosure__list-wrapper">
                                <ul
                                  id="idCountryList"
                                  role="list"
                                  className="disclosure__list list-unstyled disabled-name"
                                  hidden
                                >
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="AU"
                                    >
                                      <span className="localization-form__currency">
                                        AUD $
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="AT"
                                    >
                                      <span className="localization-form__currency">
                                        EUR €
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="BE"
                                    >
                                      <span className="localization-form__currency">
                                        EUR €
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="CA"
                                    >
                                      <span className="localization-form__currency">
                                        CAD $
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="CZ"
                                    >
                                      <span className="localization-form__currency">
                                        CZK Kč
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="DK"
                                    >
                                      <span className="localization-form__currency">
                                        DKK kr.
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="FI"
                                    >
                                      <span className="localization-form__currency">
                                        EUR €
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="FR"
                                    >
                                      <span className="localization-form__currency">
                                        EUR €
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="DE"
                                    >
                                      <span className="localization-form__currency">
                                        EUR €
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="HK"
                                    >
                                      <span className="localization-form__currency">
                                        HKD $
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="IE"
                                    >
                                      <span className="localization-form__currency">
                                        EUR €
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="IL"
                                    >
                                      <span className="localization-form__currency">
                                        ILS ₪
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="IT"
                                    >
                                      <span className="localization-form__currency">
                                        EUR €
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="JP"
                                    >
                                      <span className="localization-form__currency">
                                        JPY ¥
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="MY"
                                    >
                                      <span className="localization-form__currency">
                                        MYR RM
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="NL"
                                    >
                                      <span className="localization-form__currency">
                                        EUR €
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="NZ"
                                    >
                                      <span className="localization-form__currency">
                                        NZD $
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="NO"
                                    >
                                      <span className="localization-form__currency">
                                        USD $
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="PL"
                                    >
                                      <span className="localization-form__currency">
                                        PLN zł
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="PT"
                                    >
                                      <span className="localization-form__currency">
                                        EUR €
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="SG"
                                    >
                                      <span className="localization-form__currency">
                                        SGD $
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="KR"
                                    >
                                      <span className="localization-form__currency">
                                        KRW ₩
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="ES"
                                    >
                                      <span className="localization-form__currency">
                                        EUR €
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="SE"
                                    >
                                      <span className="localization-form__currency">
                                        SEK kr
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="CH"
                                    >
                                      <span className="localization-form__currency">
                                        CHF CHF
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="AE"
                                    >
                                      <span className="localization-form__currency">
                                        AED د.إ
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="GB"
                                    >
                                      <span className="localization-form__currency">
                                        GBP £
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large link disclosure__link--active focus-inset"
                                      href="#"
                                      aria-current="true"
                                      data-value="US"
                                    >
                                      <span className="localization-form__currency">
                                        USD $
                                      </span>
                                    </a>
                                  </li>
                                  <li
                                    className="disclosure__item"
                                    tabIndex="-1"
                                  >
                                    <a
                                      className="disclosure__link caption-large focus-inset"
                                      href="#"
                                      data-value="VN"
                                    >
                                      <span className="localization-form__currency">
                                        USD $
                                      </span>
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            </div>
                            <input
                              type="hidden"
                              name="country_code"
                              value="US"
                            />
                          </div>
                        </form>
                      </localization-form>
                    </div>
                    <div className="hide-on-phone">
                      <localization-form className="language d-block">
                        <form
                          method="post"
                          action="/localization"
                          id="localization_form"
                          acceptCharset="UTF-8"
                          className="localization-form"
                          enctype="multipart/form-data"
                        >
                          <input
                            type="hidden"
                            name="form_type"
                            value="localization"
                          />
                          <input type="hidden" name="utf8" value="✓" />
                          <input type="hidden" name="_method" value="put" />
                          <input type="hidden" name="return_to" value="/" />
                          <div className="disclosure">
                            <button
                              type="button"
                              className="disclosure__button"
                              aria-expanded="false"
                              aria-controls="LanguageList"
                            >
                              <svg
                                className="icon-earth d-none"
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 14 15"
                                fill="none"
                              >
                                <path
                                  d="M7 13.4375C7.10938 13.4557 7.28255 13.3737 7.51953 13.1914C7.75651 13.0273 8.02083 12.6719 8.3125 12.125C8.54948 11.6328 8.75 11.0495 8.91406 10.375H5.08594C5.25 11.0495 5.45052 11.6328 5.6875 12.125C5.97917 12.6719 6.24349 13.0273 6.48047 13.1914C6.71745 13.3737 6.89062 13.4557 7 13.4375ZM4.89453 9.0625H9.13281C9.16927 8.64323 9.1875 8.20573 9.1875 7.75C9.1875 7.29427 9.16927 6.85677 9.13281 6.4375H4.89453C4.83984 6.85677 4.8125 7.29427 4.8125 7.75C4.8125 8.20573 4.83984 8.64323 4.89453 9.0625ZM5.08594 5.125H8.91406C8.75 4.45052 8.54948 3.86719 8.3125 3.375C8.02083 2.82812 7.75651 2.47266 7.51953 2.30859C7.28255 2.1263 7.10938 2.04427 7 2.0625C6.89062 2.04427 6.71745 2.1263 6.48047 2.30859C6.24349 2.47266 5.97917 2.82812 5.6875 3.375C5.45052 3.86719 5.25 4.45052 5.08594 5.125ZM10.4453 6.4375C10.4818 6.85677 10.5 7.29427 10.5 7.75C10.5 8.20573 10.4818 8.64323 10.4453 9.0625H12.5234C12.6328 8.64323 12.6875 8.20573 12.6875 7.75C12.6875 7.29427 12.6328 6.85677 12.5234 6.4375H10.4453ZM12.0586 5.125C11.4388 3.97656 10.5365 3.12891 9.35156 2.58203C9.73438 3.29297 10.0352 4.14062 10.2539 5.125H12.0586ZM3.74609 5.125C3.94661 4.14062 4.2474 3.29297 4.64844 2.58203C3.46354 3.12891 2.5612 3.97656 1.94141 5.125H3.74609ZM1.47656 6.4375C1.36719 6.85677 1.3125 7.29427 1.3125 7.75C1.3125 8.20573 1.36719 8.64323 1.47656 9.0625H3.55469C3.51823 8.64323 3.5 8.20573 3.5 7.75C3.5 7.29427 3.51823 6.85677 3.55469 6.4375H1.47656ZM9.35156 12.918C10.5365 12.3711 11.4388 11.5234 12.0586 10.375H10.2539C10.0534 11.3594 9.7526 12.207 9.35156 12.918ZM4.64844 12.918C4.26562 12.207 3.96484 11.3594 3.74609 10.375H1.94141C2.5612 11.5234 3.46354 12.3711 4.64844 12.918ZM7 14.75C5.72396 14.7318 4.55729 14.4219 3.5 13.8203C2.44271 13.2005 1.58594 12.3438 0.929688 11.25C0.309896 10.138 0 8.97135 0 7.75C0 6.52865 0.309896 5.36198 0.929688 4.25C1.58594 3.15625 2.44271 2.29948 3.5 1.67969C4.55729 1.07812 5.72396 0.768229 7 0.75C8.27604 0.768229 9.44271 1.07812 10.5 1.67969C11.5573 2.29948 12.4141 3.15625 13.0703 4.25C13.6901 5.36198 14 6.52865 14 7.75C14 8.97135 13.6901 10.138 13.0703 11.25C12.4141 12.3438 11.5573 13.2005 10.5 13.8203C9.44271 14.4219 8.27604 14.7318 7 14.75Z"
                                  fill="#9FA4AA"
                                ></path>
                              </svg>
                              English
                              <svg
                                aria-hidden
                                focusable="false"
                                role="presentation"
                                className="icon icon-caret"
                                viewBox="0 0 10 6"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z"
                                  fill="currentColor"
                                ></path>
                              </svg>
                            </button>

                            <ul
                              id="LanguageList"
                              role="list"
                              className="disclosure__list"
                              hidden
                            >
                              <li className="disclosure__item" tabIndex="-1">
                                <a
                                  href="#"
                                  aria-current="true"
                                  hreflang="en"
                                  lang="en"
                                  data-value="en"
                                >
                                  English
                                </a>
                              </li>

                              <li className="disclosure__item" tabIndex="-1">
                                <a
                                  href="#"
                                  hreflang="fr"
                                  lang="fr"
                                  data-value="fr"
                                >
                                  Français
                                </a>
                              </li>

                              <li className="disclosure__item" tabIndex="-1">
                                <a
                                  href="#"
                                  hreflang="de"
                                  lang="de"
                                  data-value="de"
                                >
                                  Deutsch
                                </a>
                              </li>

                              <li className="disclosure__item" tabIndex="-1">
                                <a
                                  href="#"
                                  hreflang="it"
                                  lang="it"
                                  data-value="it"
                                >
                                  Italiano
                                </a>
                              </li>

                              <li className="disclosure__item" tabIndex="-1">
                                <a
                                  href="#"
                                  hreflang="ja"
                                  lang="ja"
                                  data-value="ja"
                                >
                                  日本語
                                </a>
                              </li>
                            </ul>

                            <input
                              type="hidden"
                              name="language_code"
                              value="en"
                            />
                          </div>
                        </form>
                      </localization-form>
                    </div>
                  </div>
                  <div className="header-icon header__icon-list">
                    <div className="header__icon-wrapper tap-target">
                      <div className="show-login">
                        <a
                          className="login-icon"
                          href="/account"
                          aria-label="Login"
                        >
                          <div className="icon-header">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>
                            </svg>
                          </div>
                        </a>
                        <ul className="user-block">
                          <li>
                            <a
                              href="/account/login"
                              className="header__icon-wrapper tap-target"
                              aria-label="Login"
                            >
                              Login
                            </a>
                          </li>
                          <li>
                            <a href="/account/register" title="Sign Up">
                              Sign Up
                            </a>
                          </li>
                          <li>
                            <a href="/cart" title="Check out">
                              Check out
                            </a>
                          </li>
                          <li>
                            <a
                              href="/pages/wishlist"
                              className="compare-link"
                            >
                              Wishlist (
                              <span id="wishlistcount">{wishlist.length}</span>)
                            </a>
                          </li>
                          <li>
                            <a href="/pages/compare" className="compare-link">
                              Compare (
                              <ap-comparecount id="comparecount">
                                0
                              </ap-comparecount>
                              )
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <NotificationDropdown />
                  <a
                    href="/pages/wishlist"
                    className="header-icon header__icon-wrapper tap-target header-wishlist"
                  >
                    <div className="icon-header">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M11.9932 5.13581C9.9938 2.7984 6.65975 2.16964 4.15469 4.31001C1.64964 6.45038 1.29697 10.029 3.2642 12.5604C4.89982 14.6651 9.84977 19.1041 11.4721 20.5408C11.6536 20.7016 11.7444 20.7819 11.8502 20.8135C11.9426 20.8411 12.0437 20.8411 12.1361 20.8135C12.2419 20.7819 12.3327 20.7016 12.5142 20.5408C14.1365 19.1041 19.0865 14.6651 20.7221 12.5604C22.6893 10.029 22.3797 6.42787 19.8316 4.31001C17.2835 2.19216 13.9925 2.7984 11.9932 5.13581Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                    <span
                      className="header-wishlist-count bubble-count"
                      id="wishlist-count"
                    >
                      {wishlist.length}
                    </span>
                  </a>
                  <a
                    href="addtocart.html"
                    is="ap-togglelink"
                    ap-controlsaria="mini-cart"
                    ap-expanded-aria={isCartOpen ? "true" : "false"}
                    className="header-icon header__icon-wrapper tap-target icon-cart"
                    aria-label="Cart"
                    data-no-instant=""
                    onClick={(e) => {
                      e.preventDefault();
                      openCart();
                    }}
                  >
                    <style></style>
                    <div className="icon-header">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M15.9996 8C15.9996 9.06087 15.5782 10.0783 14.828 10.8284C14.0779 11.5786 13.0605 12 11.9996 12C10.9387 12 9.92131 11.5786 9.17116 10.8284C8.42102 10.0783 7.99959 9.06087 7.99959 8M3.63281 7.40138L2.93281 15.8014C2.78243 17.6059 2.70724 18.5082 3.01227 19.2042C3.28027 19.8157 3.74462 20.3204 4.33177 20.6382C5.00006 21 5.90545 21 7.71623 21H16.283C18.0937 21 18.9991 21 19.6674 20.6382C20.2546 20.3204 20.7189 19.8157 20.9869 19.2042C21.2919 18.5082 21.2167 17.6059 21.0664 15.8014L20.3664 7.40138C20.237 5.84875 20.1723 5.07243 19.8285 4.48486C19.5257 3.96744 19.0748 3.5526 18.5341 3.29385C17.92 3 17.141 3 15.583 3L8.41623 3C6.85821 3 6.07921 3 5.4651 3.29384C4.92433 3.5526 4.47349 3.96744 4.17071 4.48486C3.82689 5.07243 3.76219 5.84875 3.63281 7.40138Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                    <ap-cartcount className="header-cart-count header-cart-count--floating bubble-count">
                      {cart.totalItems || 0}
                    </ap-cartcount>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{ "background-color": "#ffffff" }}
            className="header-bottom"
          >
            <div className="container">
              <div className="row align-items-center">
                <nav className="header__inline-navigation hide-on-pocket hide-on-laptop">
                  <nav className="header__inline-wrapper" role="navigation">
                    <ap-navigationofdesktop>
                      <ul
                        className="header__linklist list--unstyled hide-on-pocket hide-on-laptop"
                        role="list"
                      >
                        <li
                          className="header__linklist-item has-dropdown"
                          data-item-title="home"
                        >
                          <a
                            className="header__linklist-link link--animated menu-item--active"
                            href="/"
                          >
                            Home
                            <svg
                              className="icon-dropdown"
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="8"
                              viewBox="0 0 8 5"
                              fill="none"
                            >
                              <path
                                d="M0.94 0L4 3.09042L7.06 0L8 0.951417L4 5L0 0.951417L0.94 0Z"
                                fill="currentColor"
                              ></path>
                            </svg>
                          </a>
                        </li>
                        <li
                          className="header__linklist-item has-dropdown"
                          data-item-title="Shop"
                        >
                          <a
                            className="header__linklist-link link--animated"
                            href="/collections/all"
                            ap-controlsaria="desktop-menu-2"
                            ap-expanded-aria="false"
                          >
                            Shop
                            <svg
                              className="icon-dropdown"
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="8"
                              viewBox="0 0 8 5"
                              fill="none"
                            >
                              <path
                                d="M0.94 0L4 3.09042L7.06 0L8 0.951417L4 5L0 0.951417L0.94 0Z"
                                fill="currentColor"
                              ></path>
                            </svg>
                          </a>

                          {/* <div
                          id="desktop-menu-2"
                          className="mega-menu pt-2 pb-4 meganav-2"
                          hidden
                        >
                          <div className="container">
                            <div className="row">
                              <div
                                className="mega-menu__column mega-col mega-link col"
                                style={{opacity: '1'}}
                              >
                                <div className="row">
                                  <div className="col-sm-4">
                                    <div className="mega-col-inner">
                                      <div className="menu-title">
                                        <a href="#">Shop Layouts </a>
                                      </div>
                                      <div className="widget-inner">
                                        <ul className="nav-links">
                                          <li>
                                            <a href="/collections/frontpage"
                                              >Left sidebar
                                            </a>
                                          </li>
                                          <li>
                                            <a href="/collections/books"
                                              >Collection top
                                            </a>
                                          </li>
                                          <li>
                                            <a href="/collections"
                                              >List collection
                                            </a>
                                          </li>
                                          <li>
                                            <a href="/collections/fiction"
                                              >Coupon
                                            </a>
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-sm-4">
                                    <div className="mega-col-inner">
                                      <div className="menu-title">
                                        <a href="#">Product Layouts </a>
                                      </div>
                                      <div className="widget-inner">
                                        <ul className="nav-links">
                                          <li>
                                            <a
                                              href="https://ap-bokifa.myshopify.com/products/don-t-forget-the-girl"
                                              >Classic
                                            </a>
                                          </li>
                                          <li>
                                            <a
                                              href="https://ap-bokifa.myshopify.com/products/don-t-forget-the-girl?view=product-scroll"
                                              >Scroll fixed
                                            </a>
                                          </li>
                                          <li>
                                            <a
                                              href="https://ap-bokifa.myshopify.com/products/don-t-forget-the-girl?view=left-thumb"
                                              >Left Thumbnail
                                            </a>
                                          </li>
                                          <li>
                                            <a
                                              href="https://ap-bokifa.myshopify.com/products/don-t-forget-the-girl?view=right-thumb"
                                              >Right Thumbnail
                                            </a>
                                          </li>
                                          <li>
                                            <a
                                              href="https://ap-bokifa.myshopify.com/products/don-t-forget-the-girl?view=without-thumbnails"
                                              >Without Thumbnail
                                            </a>
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-sm-4">
                                    <div className="mega-col-inner">
                                      <div className="menu-title">
                                        <a href="#">Product Types </a>
                                      </div>
                                      <div className="widget-inner">
                                        <ul className="nav-links">
                                          <li>
                                            <a
                                              href="/products/scattershot-life-music-elton-and-me-5"
                                              >With video
                                            </a>
                                          </li>
                                          <li>
                                            <a
                                              href="https://ap-bokifa.myshopify.com/products/don-t-forget-the-girl?view=upssell"
                                              >Upssell
                                            </a>
                                          </li>
                                          <li>
                                            <a
                                              href="https://ap-bokifa.myshopify.com/products/don-t-forget-the-girl?view=crosssell"
                                              >Crosssell
                                            </a>
                                          </li>
                                          <li>
                                            <a
                                              href="/products/scattershot-life-music-elton-and-me-3"
                                              >Soldout - In coming
                                            </a>
                                          </li>
                                          <li>
                                            <a
                                              href="/products/a-good-morning-america-book-club-pick-2"
                                              >Product countdown
                                            </a>
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div
                                className="mega-menu__column mega-col col"
                                style={{maxWidth: '40%', flex: '0 0 40%', opacity: '1'}}
                              >
                                <div className="row">
                                  <div className="promotion_menu mb-4 mt-3">
                                    <div
                                      className="image-content__image-container overflow-hidden promotion_menu--container"
                                    >
                                      <div
                                        className="image-content__image-wrapper"
                                        style={{height: '280px'}}
                                      >
                                        <img
                                          src="//ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_megabanner.png?v=1729484991&amp;width=3000"
                                          className="mega-menu__image"
                                          data-srcset="//ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_megabanner.png?v=1729484991&amp;width=400 400w, //ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_megabanner.png?v=1729484991&amp;width=500 500w, //ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_megabanner.png?v=1729484991&amp;width=600 600w, //ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_megabanner.png?v=1729484991&amp;width=700 700w, //ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_megabanner.png?v=1729484991&amp;width=800 800w, //ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_megabanner.png?v=1729484991&amp;width=900 900w, //ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_megabanner.png?v=1729484991&amp;width=1000 1000w, //ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_megabanner.png?v=1729484991&amp;width=1200 1200w, //ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_megabanner.png?v=1729484991&amp;width=3000 1400w"
                                          loading="eager"
                                          draggable="false"
                                          sizes="100vw"
                                          width="3000"
                                          height="4204"
                                        />
                                      </div>
                                      <div
                                        className="promotion_menu--content d-flex align-items-center justify-content-end text-right"
                                      >
                                        <a
                                          className="promotion_menu--link"
                                          href=""
                                        ></a>
                                        <div
                                          className="position-relative promotion_menu--txt"
                                        >
                                          <div
                                            style={{color: '#ffffff'}}
                                            className="subtop mb-2"
                                          >
                                            Five day sale!
                                          </div>
                                          <div
                                            style={{color: '#ffffff'}}
                                            className="h3 mb-3"
                                          >
                                            Save 50%
                                          </div>
                                          <div
                                            style={{color: '#ffffff'}}
                                            className="mb-3"
                                          >
                                            <p>
                                              Use code BIGSALE50 at checkout
                                            </p>
                                          </div>
                                          <a className="button btn-base" href="">
                                            Shop now</a
                                          >
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div> */}
                        </li>
                        <li className="header__linklist-item site-nav__item site-nav__item-normal site-nav__item-1">
                          <a
                            href="/blogs/news"
                            className="header__linklist-link link--animated site-nav__link"
                          >
                            <span className="site-nav__title">Blogs </span>
                            <svg
                              className="icon-dropdown"
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="8"
                              viewBox="0 0 8 5"
                              fill="none"
                            >
                              <path
                                d="M0.94 0L4 3.09042L7.06 0L8 0.951417L4 5L0 0.951417L0.94 0Z"
                                fill="currentColor"
                              ></path>
                            </svg>
                          </a>
                          <div className="site-nav__dropdown site-nav__dropdown-1 meganav">
                            <ul className="meganav__nav">
                              <li className="site-nav__dropdown-container site-nav__dropdown-container--second-level">
                                <a
                                  href="/blogs/news-2"
                                  className="link-menu meganav__link"
                                >
                                  Blog - Standard
                                </a>
                              </li>

                              <li className="site-nav__dropdown-container site-nav__dropdown-container--second-level">
                                <a
                                  href="/pages/blogs/news"
                                  className="link-menu meganav__link"
                                >
                                  Blog - Grid
                                </a>
                              </li>

                              <li className="site-nav__dropdown-container site-nav__dropdown-container--second-level">
                                <a
                                  href="/blogs/news/5"
                                  className="link-menu meganav__link"
                                >
                                  Single Post
                                </a>
                              </li>
                            </ul>
                          </div>
                        </li>
                        <li className="header__linklist-item site-nav__item site-nav__item-normal site-nav__item-1">
                          <a
                            href="/pages/about-us"
                            className="header__linklist-link link--animated site-nav__link"
                          >
                            <span className="site-nav__title">Pages </span>
                            <svg
                              className="icon-dropdown"
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="8"
                              viewBox="0 0 8 5"
                              fill="none"
                            >
                              <path
                                d="M0.94 0L4 3.09042L7.06 0L8 0.951417L4 5L0 0.951417L0.94 0Z"
                                fill="currentColor"
                              ></path>
                            </svg>
                          </a>
                          <div className="site-nav__dropdown site-nav__dropdown-1 meganav">
                            <ul className="meganav__nav">
                              <li className="site-nav__dropdown-container site-nav__dropdown-container--second-level">
                                <a
                                  href="/pages/about-us"
                                  className="link-menu meganav__link"
                                >
                                  About Us
                                </a>
                              </li>

                              <li className="site-nav__dropdown-container site-nav__dropdown-container--second-level">
                                <a
                                  href="/pages/contact"
                                  className="link-menu meganav__link"
                                >
                                  Contact Us
                                </a>
                              </li>

                              <li className="site-nav__dropdown-container site-nav__dropdown-container--second-level">
                                <a
                                  href="/pages/meet-our-team"
                                  className="link-menu meganav__link"
                                >
                                  Our Team
                                </a>
                              </li>

                              <li className="site-nav__dropdown-container site-nav__dropdown-container--second-level">
                                <a
                                  href="/pages/faqs"
                                  className="link-menu meganav__link"
                                >
                                  Faqs
                                </a>
                              </li>

                              <li className="site-nav__dropdown-container site-nav__dropdown-container--second-level">
                                <a
                                  href="/pages/look-book"
                                  className="link-menu meganav__link"
                                >
                                  Lookbook
                                </a>
                              </li>

                              <li className="site-nav__dropdown-container site-nav__dropdown-container--second-level">
                                <a
                                  href="/404"
                                  className="link-menu meganav__link"
                                >
                                  404 Error
                                </a>
                              </li>
                            </ul>
                          </div>
                        </li>
                        <li className="header__linklist-item site-nav__item site-nav__item-1">
                          <a
                            href="/pages/contact"
                            className="header__linklist-link link--animated site-nav__link"
                          >
                            <span className="site-nav__title">Contact </span>
                          </a>
                        </li>
                      </ul>
                    </ap-navigationofdesktop>
                  </nav>
                </nav>
                <div
                  style={{ "font-size": "14px", "font-weight": "600" }}
                  className="header-contact hide-on-pocket hide-on-laptop"
                >
                  Need help? Call Us:
                  <b> +84 2500 888 33 </b>
                </div>
              </div>
            </div>
          </div>
        </ap-headerstore>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        className={`mobile-nav-overlay ${isMobileNavOpen ? "open" : ""}`}
        onClick={() => setIsMobileNavOpen(false)}
      />
      <div
        className={`mobile-nav-drawer ${isMobileNavOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        <div className="mobile-nav-header">
          <a
            href="/"
            className="mobile-nav-logo"
            onClick={() => setIsMobileNavOpen(false)}
          >
            <img
              src="https://ap-bokifa.myshopify.com/cdn/shop/files/logo.png?v=1729482566"
              alt="Ap Bokifa"
              width="120"
              height="30"
            />
          </a>
          <button
            type="button"
            className="mobile-nav-close"
            aria-label="Close navigation"
            onClick={() => setIsMobileNavOpen(false)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="mobile-nav-search">
          <form
            action="/collections/all"
            method="get"
            onSubmit={() => setIsMobileNavOpen(false)}
          >
            <div className="mobile-search-input-wrap">
              <input
                type="text"
                name="q"
                placeholder="Search our store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-search-input"
              />
              <button
                type="submit"
                className="mobile-search-btn"
                aria-label="Search"
              >
                <svg
                  width="18"
                  height="18"
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
          </form>
        </div>

        <div className="mobile-nav-content">
          <ul className="mobile-nav-list">
            <li className="mobile-nav-item">
              <a
                href="/"
                className="mobile-nav-link"
                onClick={() => setIsMobileNavOpen(false)}
              >
                Home
              </a>
            </li>
            <li className="mobile-nav-item">
              <div
                className="mobile-nav-link-row"
                onClick={() =>
                  setOpenSubMenu(openSubMenu === "shop" ? null : "shop")
                }
              >
                <a
                  href="/collections/all"
                  className="mobile-nav-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileNavOpen(false);
                  }}
                >
                  Shop
                </a>
                <button
                  type="button"
                  className="mobile-nav-toggle"
                  aria-label="Toggle shop submenu"
                  aria-expanded={openSubMenu === "shop"}
                >
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 8 5"
                    fill="none"
                    style={{
                      transform:
                        openSubMenu === "shop"
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <path
                      d="M0.94 0L4 3.09042L7.06 0L8 0.951417L4 5L0 0.951417L0.94 0Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
              {openSubMenu === "shop" && (
                <ul className="mobile-nav-submenu">
                  <li>
                    <a
                      href="/collections/all"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      All Books
                    </a>
                  </li>
                  <li>
                    <a
                      href="/collection/frontpage"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      New Books
                    </a>
                  </li>
                  <li>
                    <a
                      href="/collection/books"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      Featured Books
                    </a>
                  </li>
                  <li>
                    <a
                      href="/collection/fantasy"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      Fantasy
                    </a>
                  </li>
                  <li>
                    <a
                      href="/collection/fiction"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      Fiction
                    </a>
                  </li>
                  <li>
                    <a
                      href="/collection/Horror"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      Horror
                    </a>
                  </li>
                  <li>
                    <a
                      href="/collection/family"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      Family
                    </a>
                  </li>
                </ul>
              )}
            </li>
            <li className="mobile-nav-item">
              <div
                className="mobile-nav-link-row"
                onClick={() =>
                  setOpenSubMenu(openSubMenu === "pages" ? null : "pages")
                }
              >
                <span className="mobile-nav-link">Pages</span>
                <button
                  type="button"
                  className="mobile-nav-toggle"
                  aria-label="Toggle pages submenu"
                  aria-expanded={openSubMenu === "pages"}
                >
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 8 5"
                    fill="none"
                    style={{
                      transform:
                        openSubMenu === "pages"
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <path
                      d="M0.94 0L4 3.09042L7.06 0L8 0.951417L4 5L0 0.951417L0.94 0Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
              {openSubMenu === "pages" && (
                <ul className="mobile-nav-submenu">
                  <li>
                    <a
                      href="/pages/about-us"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="/pages/contact"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="/pages/meet-our-team"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      Our Team
                    </a>
                  </li>
                  <li>
                    <a
                      href="/pages/faqs"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      FAQs
                    </a>
                  </li>
                  <li>
                    <a
                      href="/pages/blogs/news"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      Blogs
                    </a>
                  </li>
                  <li>
                    <a
                      href="/pages/compare"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      Compare
                    </a>
                  </li>
                </ul>
              )}
            </li>
            <li className="mobile-nav-item">
              <a
                href="/pages/contact"
                className="mobile-nav-link"
                onClick={() => setIsMobileNavOpen(false)}
              >
                Contact
              </a>
            </li>
            <li className="mobile-nav-item">
              <a
                href="/pages/wishlist"
                className="mobile-nav-link mobile-nav-icon-link"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <span>Wishlist</span>
                <span className="mobile-nav-badge">{wishlist.length}</span>
              </a>
            </li>
            <li className="mobile-nav-item">
              <a
                href="/cart"
                className="mobile-nav-link mobile-nav-icon-link"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <span>Cart</span>
                <span className="mobile-nav-badge">{cart.totalItems || 0}</span>
              </a>
            </li>
            <li className="mobile-nav-item">
              <a
                href="/account"
                className="mobile-nav-link"
                onClick={() => setIsMobileNavOpen(false)}
              >
                My Account
              </a>
            </li>
          </ul>

          <div className="mobile-nav-footer">
            <div className="mobile-nav-contact">
              <span>Need help? Call Us:</span>
              <a href="tel:+84250088833">
                <b>+84 2500 888 33</b>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <div
        className={`mobile-nav-overlay ${isMobileNavOpen ? "open" : ""}`}
        onClick={() => setIsMobileNavOpen(false)}
        aria-hidden="true"
      ></div>

      <CartSidebar isCartOpen={isCartOpen} onClose={closeCart} />
      {showBackToTop && (
        <button
          id="back-to-top"
          className="js-back-to-top transition"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            role="presentation"
            className="icon icon-arrow-up"
            viewBox="0 0 32 32"
          >
            <path
              fill="#fff"
              d="M26.984 23.5l1.516-1.617L16 8.5 3.5 21.883 5.008 23.5 16 11.742z"
            />
          </svg>
        </button>
      )}
    </>
  );
};

export default Header;
