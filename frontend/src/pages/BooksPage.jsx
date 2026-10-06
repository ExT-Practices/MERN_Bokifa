import Footer from "../components/Footer";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { Books } from "../data/ProductsData";
import api from "../api/axios";
import NewsLetter from "../components/NewsLetter";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
gsap.registerPlugin(ScrollTrigger);
const BooksPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isWishlisted, toggleWishlist, wishlistUpdatingId } = useWishlist();
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const productListRef = useRef(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [openFilters, setOpenFilters] = useState({
    availability: true,
    price: true,
    format: true,
    brand: true,
    category: true,
    ratingCount: true,
  });

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(359);

  const [sortBy, setSortBy] = useState("manual");

  const [stockFilter, setStockFilter] = useState({
    in: false,
    out: false,
  });

  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsFilterOpen(false);
        setIsSortOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClearAll = (e) => {
    if (e) e.preventDefault();
    setMinPrice(0);
    setMaxPrice(priceMax);
    setStockFilter({ in: false, out: false });
  };

  const minGap = 1;
  const priceMax = 359;
  const minPercent = (minPrice / priceMax) * 100;
  const maxPercent = (maxPrice / priceMax) * 100;
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products", {
          params: {
            category_id: 14,
            page: 1,
            limit: 28,
          },
        });

        setProducts(response.data.data || []);
      } catch (error) {
        console.error("Books API Error:", error);

        setError(error.response?.data?.message || "Failed to load books");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);
  const isAvailabilityOpen = openFilters.availability;
  const isPriceOpen = openFilters.price;
  const isFormatOpen = openFilters.format;
  const isBrandOpen = openFilters.brand;
  const isCategoryOpen = openFilters.category;
  const isRatingOpen = openFilters.ratingCount;
  const toggleFilter = (filterName) => {
    setOpenFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };
  const filteredProducts = products.filter((product) => {
    const priceMatch = product.price >= minPrice && product.price <= maxPrice;

    const { in: inChecked, out: outChecked } = stockFilter;

    let stockMatch = true;

    if (inChecked || outChecked) {
      stockMatch =
        (inChecked && Number(product.stock_quantity) > 0) ||
        (outChecked && Number(product.stock_quantity) <= 0);
    }

    return priceMatch && stockMatch;
  });
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "title-ascending":
        return a.title.localeCompare(b.title);

      case "title-descending":
        return b.title.localeCompare(a.title);

      case "price-ascending":
        return a.price - b.price;

      case "price-descending":
        return b.price - a.price;

      case "date-ascending":
        return a.product_id - b.product_id;

      case "date-descending":
        return b.product_id - a.product_id;

      case "best-selling":
        return 0;

      case "manual":
      default:
        return 0;
    }
  });
  useEffect(() => {
    // Filter drawer
    const toggleBtn = document.querySelector(".filter-toggle");
    const drawer = document.querySelector(".product-facet-aside");
    const overlay = document.querySelector(".drawer__overlay");
    const closeBtn = document.querySelector('[data-action="close"]');

    const closeDrawer = () => drawer?.classList.remove("open");
    const toggleDrawer = () => drawer?.classList.toggle("open");

    toggleBtn?.addEventListener("click", toggleDrawer);
    closeBtn?.addEventListener("click", closeDrawer);
    overlay?.addEventListener("click", closeDrawer);

    // Filter accordions
    const items = document.querySelectorAll(".product-facet-filter-item");
    const accordionCleanups = [];

    items.forEach((item) => {
      const button = item.querySelector(".collapsible-toggle");
      const content = item.querySelector(".collapsible");
      const icon = item.querySelector(".icon-chevron-down");
      if (!button || !content) return;

      const isOpen = button.getAttribute("ap-expanded-aria") === "true";
      content.style.height = isOpen ? `${content.scrollHeight}px` : "0px";
      content.style.overflow = "hidden";
      content.style.transition = "height 0.3s ease";
      if (icon) {
        icon.style.transition = "transform 0.3s ease";
        icon.style.transform = isOpen ? "rotate(180deg)" : "rotate(0deg)";
      }

      const handleClick = () => {
        const open = button.getAttribute("ap-expanded-aria") === "true";
        if (open) {
          content.style.height = `${content.scrollHeight}px`;
          requestAnimationFrame(() => {
            content.style.height = "0px";
          });
          button.setAttribute("ap-expanded-aria", "false");
          if (icon) icon.style.transform = "rotate(0deg)";
        } else {
          content.style.height = `${content.scrollHeight}px`;
          button.setAttribute("ap-expanded-aria", "true");
          if (icon) icon.style.transform = "rotate(180deg)";
        }
      };
      button.addEventListener("click", handleClick);
      accordionCleanups.push(() =>
        button.removeEventListener("click", handleClick),
      );
    });

    // Price range
    const wrapper = document.querySelector(".price-range");
    let priceCleanups = [];
    if (wrapper) {
      const ranges = wrapper.querySelectorAll(".range");
      const rangeMin = ranges[0];
      const rangeMax = ranges[1];
      const inputMin = wrapper.querySelector("#filter\\.v\\.price\\.gte");
      const inputMax = wrapper.querySelector("#filter\\.v\\.price\\.lte");
      const rangeGroup = wrapper.querySelector(".range-group");
      const minGap = 1;
      const maxValue = parseInt(rangeMax?.max || "359", 10);

      const updateTrack = () => {
        if (!rangeMin || !rangeMax || !rangeGroup) return;
        const percentMin = (rangeMin.value / maxValue) * 100;
        const percentMax = (rangeMax.value / maxValue) * 100;
        rangeGroup.style.background = `linear-gradient(to right, rgb(226,226,226) 0%, rgb(226,226,226) ${percentMin}%, rgba(102,102,102,0.7) ${percentMin}%, rgba(102,102,102,0.7) ${percentMax}%, rgb(226,226,226) ${percentMax}%, rgb(226,226,226) 100%)`;
      };
      const syncFromSliderMin = () => {
        if (+rangeMin.value >= +rangeMax.value - minGap)
          rangeMin.value = +rangeMax.value - minGap;
        if (inputMin) inputMin.value = rangeMin.value;
        updateTrack();
        filterByPrice();
      };
      const syncFromSliderMax = () => {
        if (+rangeMax.value <= +rangeMin.value + minGap)
          rangeMax.value = +rangeMin.value + minGap;
        if (inputMax) inputMax.value = rangeMax.value;
        updateTrack();
        filterByPrice();
      };
      const syncFromInputMin = () => {
        let value = parseInt(inputMin?.value, 10) || 0;
        if (value < 0) value = 0;
        if (value > +rangeMax.value - minGap) value = +rangeMax.value - minGap;
        rangeMin.value = value;
        if (inputMin) inputMin.value = value;
        updateTrack();
        filterByPrice();
      };
      const syncFromInputMax = () => {
        let value = parseInt(inputMax?.value, 10) || 0;
        if (value > maxValue) value = maxValue;
        if (value < +rangeMin.value + minGap) value = +rangeMin.value + minGap;
        rangeMax.value = value;
        if (inputMax) inputMax.value = value;
        updateTrack();
        filterByPrice();
      };
      const filterByPrice = () => {
        const products = document.querySelectorAll(
          "#ap_productlist product-item",
        );
        const min = parseFloat(inputMin?.value) || 0;
        const max = parseFloat(inputMax?.value) || 999999;
        products.forEach((product) => {
          const price =
            parseFloat(
              product
                .querySelector(".price")
                ?.innerText.replace(/[^0-9.]/g, ""),
            ) || 0;
          product.style.display = price >= min && price <= max ? "" : "none";
        });
      };
      rangeMin?.addEventListener("input", syncFromSliderMin);
      rangeMax?.addEventListener("input", syncFromSliderMax);
      inputMin?.addEventListener("input", syncFromInputMin);
      inputMax?.addEventListener("input", syncFromInputMax);
      updateTrack();
      priceCleanups = [
        () => rangeMin?.removeEventListener("input", syncFromSliderMin),
        () => rangeMax?.removeEventListener("input", syncFromSliderMax),
        () => inputMin?.removeEventListener("input", syncFromInputMin),
        () => inputMax?.removeEventListener("input", syncFromInputMax),
      ];
    }

    // Sort popover
    const sortButton = document.getElementById("toggle-button");
    const popover = document.getElementById("ap-sortbypopover");
    const popoverClose = popover?.querySelector('[data-action="close"]');
    const selectedText = document.getElementById("sort-by-selected-value");
    const closePopover = () => popover?.removeAttribute("open");
    const togglePopover = (e) => {
      e.stopPropagation();
      if (popover?.hasAttribute("open")) closePopover();
      else popover?.setAttribute("open", "");
    };
    const outsideClick = (e) => {
      if (
        popover &&
        !popover.contains(e.target) &&
        !sortButton?.contains(e.target)
      )
        closePopover();
    };
    sortButton?.addEventListener("click", togglePopover);
    popoverClose?.addEventListener("click", closePopover);
    document.addEventListener("click", outsideClick);

    const radios = popover?.querySelectorAll("input[type='radio']") || [];
    const productContainer = document.getElementById("ap_productlist");
    const getTitle = (product) =>
      product.querySelector(".product-card-title")?.innerText.trim() ||
      "";
    const getPrice = (product) =>
      parseFloat(
        product.querySelector(".price")?.innerText.replace(/[^0-9.]/g, ""),
      ) || 0;
    const getIdNumber = (product) =>
      parseInt(product.id.replace("product-item-", ""), 10) || 0;

    const radioCleanups = [];
    radios.forEach((radio) => {
      const handleChange = () => {
        if (!radio.checked) return;
        const label = radio.nextElementSibling?.textContent.trim() || "";
        if (selectedText) selectedText.textContent = label;
        sortProducts(label);
        closePopover();
        sortButton?.setAttribute("aria-expanded", "false");
      };
      radio.addEventListener("change", handleChange);
      radioCleanups.push(() =>
        radio.removeEventListener("change", handleChange),
      );
    });

    // Availability filter
    const inStockCheckbox = document.getElementById(
      "filter-filter.v.availability-1",
    );
    const outStockCheckbox = document.getElementById(
      "filter-filter.v.availability-2",
    );
    const filterProducts = () => {
      if (!inStockCheckbox || !outStockCheckbox) return;
      const inChecked = inStockCheckbox.checked;
      const outChecked = outStockCheckbox.checked;
      document
        .querySelectorAll("#ap_productlist product-item")
        .forEach((product) => {
          const stock = product.dataset.stock || "in";
          if (!inChecked && !outChecked) product.style.display = "";
          else
            product.style.display =
              (inChecked && stock === "in") || (outChecked && stock === "out")
                ? ""
                : "none";
        });
    };
    inStockCheckbox?.addEventListener("change", filterProducts);
    outStockCheckbox?.addEventListener("change", filterProducts);

    return () => {
      toggleBtn?.removeEventListener("click", toggleDrawer);
      closeBtn?.removeEventListener("click", closeDrawer);
      overlay?.removeEventListener("click", closeDrawer);
      accordionCleanups.forEach((fn) => fn());
      priceCleanups.forEach((fn) => fn());
      sortButton?.removeEventListener("click", togglePopover);
      popoverClose?.removeEventListener("click", closePopover);
      document.removeEventListener("click", outsideClick);
      radioCleanups.forEach((fn) => fn());
      inStockCheckbox?.removeEventListener("change", filterProducts);
      outStockCheckbox?.removeEventListener("change", filterProducts);
    };
  }, [loading]);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.batch("product-item", {
        start: "top 90%",
        once: true,

        onEnter: (batch) => {
          gsap.from(batch, {
            y: 50,
            opacity: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
            overwrite: true,

            onComplete: function () {
              gsap.set(this.targets(), {
                clearProps: "transform",
              });
            },
          });
        },
      });
    }, productListRef);

    return () => ctx.revert();
  }, [products]);
  if (loading) {
    return (
      <>
        <Header />
        <div className="container py-5 text-center">Loading books...</div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container py-5 text-center">{error}</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div
        id="shopify-section-template--24248446714139__banner"
        className="site-section collection-banner-section"
      >
        <section>
          <div className="container">
            <ap-textoverlayimage
              className="image-overlay image-overlay--small object-loaded"
              style={{ opacity: "1" }}
            >
              <div className="image-overlay__image-wrapper"></div>
              <div className="w-100">
                <div
                  className="image-overlay__content-wrapper"
                  style={{ opacity: "1" }}
                >
                  <div className="image-overlay__content content-box text-container content-box-- content-box--center content-box--text-center">
                    <nav className="breadcrumb text--xsmall">
                      <ol className="breadcrumb__list">
                        <li className="breadcrumb__item">
                          <a
                            className="breadcrumb__link"
                            href="/"
                            style={{ color: "#000" }}
                          >
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
                                className=""
                              ></path>
                            </svg>
                            Home
                          </a>
                        </li>
                        <li className="breadcrumb__item">
                          <span
                            className="breadcrumb__link"
                            style={{ color: "#000" }}
                          >
                            Books
                          </span>
                        </li>
                      </ol>
                    </nav>
                    <h2 className="heading h1 mb-4 pb-2">
                      <ap-splitlines style={{ opacity: "1" }}>
                        <span style={{ opacity: "1", fontSize: "70px" }}>
                          Books
                        </span>
                      </ap-splitlines>
                    </h2>
                    <div
                      className="image-overlay__text-container my-0"
                      reveal=""
                      style={{ opacity: "1" }}
                    >
                      <span data-mce-fragment="1">
                        <p>
                          <meta charset="utf-8" />
                          <span></span>
                          <span></span>
                          <span>
                            Discover your favorite book: you will find a wide
                            range of selected books from bestseller <br />
                            to newcomer, children's book to crime novel or
                            thriller to science fiction novel.
                          </span>
                        </p>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ap-textoverlayimage>
            <ap-linkbar className="link-bar">
              <div className="container">
                <div className="link-bar-wrapper">
                  <span className="link-bar-title heading heading--small text--subdued"></span>

                  <div className="link-bar-scroller hide-scrollbar">
                    <ul
                      className="link-bar-list list--unstyled"
                      role="list"
                    >
                      <li className="link-bar-item">
                        <a href="/" className="link-bar-link link--animated">
                          Action Books
                        </a>
                      </li>

                      <li className="link-bar-item">
                        <a href="/" className="link-bar-link link--animated">
                          Comedy
                        </a>
                      </li>

                      <li className="link-bar-item">
                        <a href="/" className="link-bar-link link--animated">
                          Drama
                        </a>
                      </li>

                      <li className="link-bar-item">
                        <a href="/" className="link-bar-link link--animated">
                          Horror
                        </a>
                      </li>

                      <li className="link-bar-item">
                        <a href="/" className="link-bar-link link--animated">
                          Kids Books
                        </a>
                      </li>

                      <li className="link-bar-item">
                        <a href="/" className="link-bar-link link--animated">
                          Top 50 Books
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </ap-linkbar>
          </div>
        </section>
      </div>
      <div
        id="shopify-section-template--24248446714139__product-grid"
        className="site-section main-collection-section"
      >
        <section className="collection-top">
          <div className="container">
            <ap-productfacet
              className="product-facet"
              section-id="template--24248446714139__product-grid"
            >
              <div
                className={`mobile-filter-backdrop ${isFilterOpen ? "open" : ""}`}
                onClick={() => setIsFilterOpen(false)}
              />
              <div
                className={`product-facet-aside ${
                  isFilterOpen ? "open" : ""
                }`}
              >
                <ap-safesticky
                  className="product-facet-aside-inner"
                  offset="30"
                  style={{ top: "-322.817px" }}
                >
                  <ap-facetfilters
                    id="ap-facetfilters"
                    className="product-facet-filters"
                    always-visible=""
                  >
                    <header className="drawer__header hide-on-laptop-up">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <p className="drawer__title heading h6" style={{ margin: 0 }}>
                          Filters
                        </p>
                        <button
                          type="button"
                          className="drawer__header-action link text--subdued"
                          onClick={handleClearAll}
                          style={{ margin: 0, textDecoration: "underline", background: "none", border: "none", color: "#027a36", cursor: "pointer", fontSize: "14px" }}
                        >
                          Clear all
                        </button>
                      </div>
                      <button
                        type="button"
                        className="drawer__close-button tap-target"
                        onClick={() => setIsFilterOpen(false)}
                        title="Close"
                        aria-label="Close filters"
                      >
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
                    </header>
                    <div className="drawer__content">
                      <form id="ap-facetfilters-form">
                        <input
                          id="input-s"
                          type="hidden"
                          name="sort_by"
                          value="title-ascending"
                        />
                        <input type="hidden" name="q" value="" />
                        <input type="hidden" name="type" value="product" />
                        <input
                          type="hidden"
                          name="option[prefix]"
                          value="last"
                        />
                        <input
                          type="hidden"
                          name="option[unavailable_products]"
                          value="last"
                        />
                        <div className="product-facet-active-list tag-list hide-on-phone"></div>
                        <div className="product-facet-categories hide-on-pocket">
                          <div className="collapsible-toggle product-facet-categories-title heading h6 product-facet-filters-header">
                            Categories
                          </div>
                          <div className="product-facet-categories-list">
                            <Link to="/collection/frontpage">
                              Books New<span className="count"> (28) </span>
                            </Link>

                            <Link to="/collection/books">
                              Books<span className="count"> (28) </span>
                            </Link>

                            <Link to="/collection/family">
                              Family<span className="count"> (7) </span>
                            </Link>

                            <Link to="/collection/fantasy">
                              Fantasy<span className="count"> (7) </span>
                            </Link>

                            <Link to="/collection/fiction">
                              Fiction<span className="count"> (28) </span>
                            </Link>

                            <Link to="/collection/horror">
                              Horror<span className="count"> (7) </span>
                            </Link>
                          </div>
                        </div>
                        <div className="product-facet-filter-list">
                          <div className="product-facet-filter-item">
                            <button
                              type="button"
                              is="toggle-button"
                              className="collapsible-toggle text--strong"
                              ap-controlsaria="filter.v.availability"
                              ap-expanded-aria="true"
                              onClick={() => toggleFilter("availability")}
                            >
                              Availability
                              <svg
                                aria-hidden="true"
                                focusable="false"
                                role="presentation"
                                width="8"
                                height="6"
                                viewBox="0 0 8 6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={`icon-chevron-down ${
                                  isAvailabilityOpen ? "is-open" : ""
                                }`}
                                style={{
                                  transform: isAvailabilityOpen
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                  transition: "transform 0.3s ease",
                                }}
                              >
                                <path
                                  className="icon-chevron-down-left"
                                  d="M4 4.5L7 1.5"
                                  stroke="currentColor"
                                  strokeWidth="1.25"
                                  strokeLinecap="square"
                                ></path>
                                <path
                                  className="icon-chevron-down-right"
                                  d="M4 4.5L1 1.5"
                                  stroke="currentColor"
                                  strokeWidth="1.25"
                                  strokeLinecap="square"
                                ></path>
                              </svg>
                            </button>
                            <div
                              id="filter.v.availability"
                              className={`collapsible ${
                                isAvailabilityOpen ? "is-open" : ""
                              }`}
                              animate-items=""

                              style={{
                                height: isAvailabilityOpen ? "auto" : "0px",
                                overflow: "hidden",
                                transition: "height 0.3s ease",
                              }}
                              open
                            >
                              <div className="collapsible__content">
                                <div className="checkbox-container">
                                  <input
                                    className="checkbox"
                                    type="checkbox"
                                    name="filter.v.availability"
                                    id="filter-filter.v.availability-1"
                                    value="1"
                                    checked={stockFilter.in}
                                    onChange={(e) =>
                                      setStockFilter((prev) => ({
                                        ...prev,
                                        in: e.target.checked,
                                      }))
                                    }
                                  />
                                  <label htmlFor="filter-filter.v.availability-1">
                                    In stock (27)
                                  </label>
                                </div>
                                <div className="checkbox-container">
                                  <input
                                    className="checkbox"
                                    type="checkbox"
                                    name="filter.v.availability"
                                    id="filter-filter.v.availability-2"
                                    value="0"
                                    checked={stockFilter.out}
                                    onChange={(e) =>
                                      setStockFilter((prev) => ({
                                        ...prev,
                                        out: e.target.checked,
                                      }))
                                    }
                                  />
                                  <label htmlFor="filter-filter.v.availability-2">
                                    Out of stock (2)
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="product-facet-filter-item">
                            <button
                              type="button"
                              is="toggle-button"
                              className="collapsible-toggle text--strong"
                              ap-controlsaria="filter.v.price"
                              ap-expanded-aria="true"
                              onClick={() => toggleFilter("price")}
                            >
                              Price
                              <svg
                                aria-hidden="true"
                                focusable="false"
                                role="presentation"
                                width="8"
                                height="6"
                                viewBox="0 0 8 6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={`icon-chevron-down ${
                                  isPriceOpen ? "is-open" : ""
                                }`}
                                style={{
                                  transform: isPriceOpen
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                  transition: "transform 0.3s ease",
                                }}
                              >
                                <path
                                  className="icon-chevron-down-left"
                                  d="M4 4.5L7 1.5"
                                  stroke="currentColor"
                                  strokeWidth="1.25"
                                  strokeLinecap="square"
                                ></path>
                                <path
                                  className="icon-chevron-down-right"
                                  d="M4 4.5L1 1.5"
                                  stroke="currentColor"
                                  strokeWidth="1.25"
                                  strokeLinecap="square"
                                ></path>
                              </svg>
                            </button>
                            <ap-contentcollapsible
                              id="filter.v.price"
                              className={`collapsible ${
                                isPriceOpen ? "is-open" : ""
                              }`}
                              animate-items=""
                              style={{
                                height: isPriceOpen ? "auto" : "0px",
                                overflow: "hidden",
                                transition: "height 0.3s ease",
                              }}
                              open=""
                            >
                              <div className="collapsible__content">
                                <ap-pricerange className="price-range">
                                  <div
                                    className="price-range-group range-group"
                                    style={{
                                      background: `linear-gradient(
      to right,
      rgb(226, 226, 226) 0%,
      rgb(226, 226, 226) ${minPercent}%,
      rgba(102, 102, 102, 0.7) ${minPercent}%,
      rgba(102, 102, 102, 0.7) ${maxPercent}%,
      rgb(226, 226, 226) ${maxPercent}%,
      rgb(226, 226, 226) 100%
    )`,
                                    }}
                                  >
                                    <input
                                      type="range"
                                      aria-label="From price"
                                      className="range"
                                      min="0"
                                      max="359"
                                      value={minPrice}
                                      onChange={(e) => {
                                        const value = Number(e.target.value);

                                        if (value < maxPrice - minGap) {
                                          setMinPrice(value);
                                        }
                                      }}
                                    />
                                    <input
                                      type="range"
                                      aria-label="To price"
                                      className="range"
                                      min="0"
                                      max="359"
                                      value={maxPrice}
                                      onChange={(e) => {
                                        const value = Number(e.target.value);

                                        if (value > minPrice + minGap) {
                                          setMaxPrice(value);
                                        }
                                      }}
                                    />
                                  </div>

                                  <div className="price-range-input-group">
                                    <div className="price-range-input input-prefix text--xsmall">
                                      <span className="input-prefix__value text--subdued">
                                        ₹
                                      </span>
                                      <input
                                        aria-label="From price"
                                        className="input-prefix__field"
                                        type="number"
                                        inputmode="numeric"
                                        value={minPrice}
                                        onChange={(e) => {
                                          let value =
                                            parseInt(e.target.value, 10) || 0;

                                          if (value < 0) {
                                            value = 0;
                                          }

                                          if (value > maxPrice - minGap) {
                                            value = maxPrice - minGap;
                                          }

                                          setMinPrice(value);
                                        }}
                                        placeholder="0"
                                      />
                                    </div>

                                    <span className="price-range-delimiter text--small">
                                      to
                                    </span>

                                    <div className="price-range-input input-prefix text--xsmall">
                                      <span className="input-prefix__value text--subdued">
                                        ₹
                                      </span>
                                      <input
                                        aria-label="To price"
                                        className="input-prefix__field"
                                        type="number"
                                        inputmode="numeric"
                                        value={maxPrice}
                                        onChange={(e) => {
                                          let value =
                                            parseInt(e.target.value, 10) || 0;

                                          if (value > priceMax) {
                                            value = priceMax;
                                          }

                                          if (value < minPrice + minGap) {
                                            value = minPrice + minGap;
                                          }

                                          setMaxPrice(value);
                                        }}
                                        placeholder="359"
                                      />
                                    </div>
                                  </div>
                                </ap-pricerange>
                              </div>
                            </ap-contentcollapsible>
                          </div>
                          <div className="product-facet-filter-item">
                            <button
                              type="button"
                              is="toggle-button"
                              className="collapsible-toggle text--strong"
                              ap-controlsaria="filter.v.option.format"
                              ap-expanded-aria="true"
                              onClick={() => toggleFilter("format")}
                            >
                              Format
                              <svg
                                aria-hidden="true"
                                focusable="false"
                                role="presentation"
                                width="8"
                                height="6"
                                viewBox="0 0 8 6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={`icon-chevron-down ${
                                  isFormatOpen ? "is-open" : ""
                                }`}
                                style={{
                                  transform: isFormatOpen
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                  transition: "transform 0.3s ease",
                                }}
                              >
                                <path
                                  className="icon-chevron-down-left"
                                  d="M4 4.5L7 1.5"
                                  stroke="currentColor"
                                  strokeWidth="1.25"
                                  strokeLinecap="square"
                                ></path>
                                <path
                                  className="icon-chevron-down-right"
                                  d="M4 4.5L1 1.5"
                                  stroke="currentColor"
                                  strokeWidth="1.25"
                                  strokeLinecap="square"
                                ></path>
                              </svg>
                            </button>
                            <ap-contentcollapsible
                              id="filter.v.option.format"
                              className={`collapsible ${
                                isFormatOpen ? "is-open" : ""
                              }`}
                              animate-items=""
                              style={{
                                height: isFormatOpen ? "auto" : "0px",
                                overflow: "hidden",
                                transition: "height 0.3s ease",
                              }}
                              open=""
                            >
                              <div className="collapsible__content">
                                <div className="checkbox-container">
                                  <input
                                    className="checkbox"
                                    type="checkbox"
                                    name="filter.v.option.format"
                                    id="filter-filter.v.option.format-1"
                                    value="Audio cd"
                                  />
                                  <label htmlFor="filter-filter.v.option.format-1">
                                    Audio cd (28)
                                  </label>
                                </div>
                                <div className="checkbox-container">
                                  <input
                                    className="checkbox"
                                    type="checkbox"
                                    name="filter.v.option.format"
                                    id="filter-filter.v.option.format-2"
                                    value="Ebook"
                                  />
                                  <label htmlFor="filter-filter.v.option.format-2">
                                    Ebook (28)
                                  </label>
                                </div>
                                <div className="checkbox-container">
                                  <input
                                    className="checkbox"
                                    type="checkbox"
                                    name="filter.v.option.format"
                                    id="filter-filter.v.option.format-3"
                                    value="Hardcover"
                                  />
                                  <label htmlFor="filter-filter.v.option.format-3">
                                    Hardcover (28)
                                  </label>
                                </div>
                                <div className="checkbox-container">
                                  <input
                                    className="checkbox"
                                    type="checkbox"
                                    name="filter.v.option.format"
                                    id="filter-filter.v.option.format-4"
                                    value="Paperback"
                                  />
                                  <label htmlFor="filter-filter.v.option.format-4">
                                    Paperback (28)
                                  </label>
                                </div>
                              </div>
                            </ap-contentcollapsible>
                          </div>
                          <div className="product-facet-filter-item">
                            <button
                              type="button"
                              is="toggle-button"
                              className="collapsible-toggle text--strong"
                              ap-controlsaria="filter.p.vendor"
                              ap-expanded-aria="true"
                              onClick={() => toggleFilter("brand")}
                            >
                              Brand
                              <svg
                                aria-hidden="true"
                                focusable="false"
                                role="presentation"
                                width="8"
                                height="6"
                                viewBox="0 0 8 6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={`icon-chevron-down ${
                                  isBrandOpen ? "is-open" : ""
                                }`}
                                style={{
                                  transform: isBrandOpen
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                  transition: "transform 0.3s ease",
                                }}
                              >
                                <path
                                  className="icon-chevron-down-left"
                                  d="M4 4.5L7 1.5"
                                  stroke="currentColor"
                                  strokeWidth="1.25"
                                  strokeLinecap="square"
                                ></path>
                                <path
                                  className="icon-chevron-down-right"
                                  d="M4 4.5L1 1.5"
                                  stroke="currentColor"
                                  strokeWidth="1.25"
                                  strokeLinecap="square"
                                ></path>
                              </svg>
                            </button>
                            <ap-contentcollapsible
                              id="filter.p.vendor"
                              className={`collapsible ${
                                isBrandOpen ? "is-open" : ""
                              }`}
                              animate-items=""
                              style={{
                                height: isBrandOpen ? "auto" : "0px",
                                overflow: "hidden",
                                transition: "height 0.3s ease",
                              }}
                              open=""
                            >
                              <div className="collapsible__content">
                                <div className="checkbox-container">
                                  <input
                                    className="checkbox"
                                    type="checkbox"
                                    name="filter.p.vendor"
                                    id="filter-filter.p.vendor-1"
                                    value="Ap Bokifa"
                                  />
                                  <label htmlFor="filter-filter.p.vendor-1">
                                    Ap Bokifa (28)
                                  </label>
                                </div>
                              </div>
                            </ap-contentcollapsible>
                          </div>
                          <div className="product-facet-filter-item">
                            <button
                              type="button"
                              is="toggle-button"
                              className="collapsible-toggle text--strong"
                              ap-controlsaria="filter.p.t.category"
                              ap-expanded-aria="true"
                              onClick={() => toggleFilter("category")}
                            >
                              Category
                              <svg
                                aria-hidden="true"
                                focusable="false"
                                role="presentation"
                                width="8"
                                height="6"
                                viewBox="0 0 8 6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={`icon-chevron-down ${
                                  isCategoryOpen ? "is-open" : ""
                                }`}
                                style={{
                                  transform: isCategoryOpen
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                  transition: "transform 0.3s ease",
                                }}
                              >
                                <path
                                  className="icon-chevron-down-left"
                                  d="M4 4.5L7 1.5"
                                  stroke="currentColor"
                                  strokeWidth="1.25"
                                  strokeLinecap="square"
                                ></path>
                                <path
                                  className="icon-chevron-down-right"
                                  d="M4 4.5L1 1.5"
                                  stroke="currentColor"
                                  strokeWidth="1.25"
                                  strokeLinecap="square"
                                ></path>
                              </svg>
                            </button>
                            <ap-contentcollapsible
                              id="filter.p.t.category"
                              className={`collapsible ${
                                isCategoryOpen ? "is-open" : ""
                              }`}
                              animate-items=""
                              style={{
                                height: isCategoryOpen ? "auto" : "0px",
                                overflow: "hidden",
                                transition: "height 0.3s ease",
                              }}
                              open=""
                            >
                              <div className="collapsible__content">
                                <div className="checkbox-container">
                                  <input
                                    className="checkbox"
                                    type="checkbox"
                                    name="filter.p.t.category"
                                    id="filter-filter.p.t.category-1"
                                    value="me-1-2"
                                  />
                                  <label htmlFor="filter-filter.p.t.category-1">
                                    E-Books (28)
                                  </label>
                                </div>
                              </div>
                            </ap-contentcollapsible>
                          </div>
                          <div className="product-facet-filter-item">
                            <button
                              type="button"
                              is="toggle-button"
                              className="collapsible-toggle text--strong"
                              ap-controlsaria="filter.p.m.reviews.rating_count"
                              ap-expanded-aria="true"
                              onClick={() => toggleFilter("ratingCount")}
                            >
                              Product rating count
                              <svg
                                aria-hidden="true"
                                focusable="false"
                                role="presentation"
                                width="8"
                                height="6"
                                viewBox="0 0 8 6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={`icon-chevron-down ${
                                  isRatingOpen ? "is-open" : ""
                                }`}
                                style={{
                                  transform: isRatingOpen
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                  transition: "transform 0.3s ease",
                                }}
                              >
                                <path
                                  className="icon-chevron-down-left"
                                  d="M4 4.5L7 1.5"
                                  stroke="currentColor"
                                  strokeWidth="1.25"
                                  strokeLinecap="square"
                                ></path>
                                <path
                                  className="icon-chevron-down-right"
                                  d="M4 4.5L1 1.5"
                                  stroke="currentColor"
                                  strokeWidth="1.25"
                                  strokeLinecap="square"
                                ></path>
                              </svg>
                            </button>
                            <ap-contentcollapsible
                              id="filter.p.m.reviews.rating_count"
                              className={`collapsible ${
                                isRatingOpen ? "is-open" : ""
                              }`}
                              animate-items=""
                              style={{
                                height: isRatingOpen ? "auto" : "0px",
                                overflow: "hidden",
                                transition: "height 0.3s ease",
                              }}
                              open=""
                            >
                              <div className="collapsible__content">
                                <div className="checkbox-container">
                                  <input
                                    className="checkbox"
                                    type="checkbox"
                                    name="filter.p.m.reviews.rating_count"
                                    id="filter-filter.p.m.reviews.rating_count-1"
                                    value="1"
                                  />
                                  <label htmlFor="filter-filter.p.m.reviews.rating_count-1">
                                    1 (3)
                                  </label>
                                </div>
                                <div className="checkbox-container">
                                  <input
                                    className="checkbox"
                                    type="checkbox"
                                    name="filter.p.m.reviews.rating_count"
                                    id="filter-filter.p.m.reviews.rating_count-2"
                                    value="4"
                                  />
                                  <label htmlFor="filter-filter.p.m.reviews.rating_count-2">
                                    4 (1)
                                  </label>
                                </div>
                              </div>
                            </ap-contentcollapsible>
                          </div>
                        </div>
                        <noscript>
                          <button
                            type="submit"
                            className="product-facet-submit button button--secondary"
                          >
                            Apply filters
                          </button>
                        </noscript>
                      </form>
                    </div>
                  </ap-facetfilters>
                </ap-safesticky>
              </div>
              <div id="facet-main" className="product-facet-main anchor">
                <div className="product-facet-meta-bar anchor">
                  <div className="mobile-facet-toolbar hide-on-desktop">
                    <button
                      type="button"
                      className="mobile-filter-btn"
                      onClick={() => setIsFilterOpen(true)}
                      aria-label="Open filters"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M15.2 3.5H12.9a.6.6 0 0 1 0-1.2h2.3a.6.6 0 0 1 0 1.2zM6.6 3.5H.8a.6.6 0 0 1 0-1.2h5.8a.6.6 0 0 1 0 1.2zM.8 8.6h1.5a.6.6 0 0 1 0-1.2H.8a.6.6 0 0 1 0 1.2zM8.7 8.6h6.5a.6.6 0 0 1 0-1.2H8.7a.6.6 0 0 1 0 1.2zM15.2 13.7H12.9a.6.6 0 0 1 0-1.2h2.3a.6.6 0 0 1 0 1.2zM6.6 13.7H.8a.6.6 0 0 1 0-1.2h5.8a.6.6 0 0 1 0 1.2zM9.7 4.8a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8zm0-2.6a.7.7 0 1 0 0 1.4.7.7 0 0 0 0-1.4zM9.7 15a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8zm0-2.6a.7.7 0 1 0 0 1.4.7.7 0 0 0 0-1.4zM5.5 9.9a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8zm0-2.6a.7.7 0 1 0 0 1.4.7.7 0 0 0 0-1.4z" />
                      </svg>
                      <span>Filters</span>
                    </button>
                    <div className="mobile-sort-container">
                      <button
                        type="button"
                        className="mobile-sort-btn"
                        onClick={() => setIsSortOpen(!isSortOpen)}
                      >
                        <span>Sort by</span>
                        <svg
                          width="10"
                          height="6"
                          viewBox="0 0 10 6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M1 1l4 4 4-4" />
                        </svg>
                      </button>
                      {isSortOpen && (
                        <div className="mobile-sort-dropdown">
                          <button
                            type="button"
                            className={`mobile-sort-option ${
                              sortBy === "manual" ? "active" : ""
                            }`}
                            onClick={() => {
                              setSortBy("manual");
                              setIsSortOpen(false);
                            }}
                          >
                            Featured
                          </button>
                          <button
                            type="button"
                            className={`mobile-sort-option ${
                              sortBy === "best-selling" ? "active" : ""
                            }`}
                            onClick={() => {
                              setSortBy("best-selling");
                              setIsSortOpen(false);
                            }}
                          >
                            Best selling
                          </button>
                          <button
                            type="button"
                            className={`mobile-sort-option ${
                              sortBy === "title-ascending" ? "active" : ""
                            }`}
                            onClick={() => {
                              setSortBy("title-ascending");
                              setIsSortOpen(false);
                            }}
                          >
                            Alphabetically, A-Z
                          </button>
                          <button
                            type="button"
                            className={`mobile-sort-option ${
                              sortBy === "title-descending" ? "active" : ""
                            }`}
                            onClick={() => {
                              setSortBy("title-descending");
                              setIsSortOpen(false);
                            }}
                          >
                            Alphabetically, Z-A
                          </button>
                          <button
                            type="button"
                            className={`mobile-sort-option ${
                              sortBy === "price-ascending" ? "active" : ""
                            }`}
                            onClick={() => {
                              setSortBy("price-ascending");
                              setIsSortOpen(false);
                            }}
                          >
                            Price, low to high
                          </button>
                          <button
                            type="button"
                            className={`mobile-sort-option ${
                              sortBy === "price-descending" ? "active" : ""
                            }`}
                            onClick={() => {
                              setSortBy("price-descending");
                              setIsSortOpen(false);
                            }}
                          >
                            Price, high to low
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className="product-facet-meta-item product-facet-meta-count"
                    role="status"
                  >
                    {filteredProducts.length} products
                  </span>
                  <div className="product-facet-meta-item product-facet-meta-sort">
                    <span className="product-facet-sort-title text--subdued hide-on-pocket">
                      Sort by
                    </span>
                    <div className="popover-container">
                      <button
                        type="button"
                        id="toggle-button"
                        className="popover-button hide-on-pocket"
                        ap-expanded-aria="false"
                        aria-expanded="false"
                      >
                        <span
                          id="sort-by-selected-value"
                          style={{ pointerEvents: "none" }}
                        >
                          Alphabetically, A-Z
                        </span>
                        <svg
                          focusable="false"
                          width="12"
                          height="8"
                          className="icon icon--chevron icon--inline"
                          viewBox="0 0 12 8"
                        >
                          <path
                            fill="none"
                            d="M1 1l5 5 5-5"
                            stroke="currentColor"
                            stroke-width="2"
                          ></path>
                        </svg>
                      </button>
                      <ap-sortbypopover
                        id="ap-sortbypopover"
                        className="popover"
                      >
                        <span className="popover__overlay"></span>
                        <header className="popover__header">
                          <span className="popover__title heading h6">
                            Sort by
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
                              className="icon icon--close"
                              viewBox="0 0 14 14"
                            >
                              <path
                                d="M13 13L1 1M13 1L1 13"
                                stroke="currentColor"
                                stroke-width="2"
                                fill="none"
                              ></path>
                            </svg>
                          </button>
                        </header>
                        <div className="popover__content">
                          <div className="popover__choice-list">
                            <label className="popover__choice-item">
                              <input
                                type="radio"
                                data-bind-value="sort-by-selected-value"
                                name="sort_by"
                                value="manual"
                                checked={sortBy === "manual"}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="visually-hidden"
                              />
                              <span className="popover__choice-label">
                                Featured
                              </span>
                            </label>
                            <label className="popover__choice-item">
                              <input
                                type="radio"
                                data-bind-value="sort-by-selected-value"
                                name="sort_by"
                                value="best-selling"
                                checked={sortBy === "best-selling"}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="visually-hidden"
                              />
                              <span className="popover__choice-label">
                                Best selling
                              </span>
                            </label>
                            <label className="popover__choice-item">
                              <input
                                type="radio"
                                data-bind-value="sort-by-selected-value"
                                name="sort_by"
                                value="title-ascending"
                                checked={sortBy === "title-ascending"}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="visually-hidden"
                              />
                              <span className="popover__choice-label">
                                Alphabetically, A-Z
                              </span>
                            </label>
                            <label className="popover__choice-item">
                              <input
                                type="radio"
                                data-bind-value="sort-by-selected-value"
                                name="sort_by"
                                value="title-descending"
                                checked={sortBy === "title-descending"}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="visually-hidden"
                              />
                              <span className="popover__choice-label">
                                Alphabetically, Z-A
                              </span>
                            </label>
                            <label className="popover__choice-item">
                              <input
                                type="radio"
                                data-bind-value="sort-by-selected-value"
                                name="sort_by"
                                value="price-ascending"
                                checked={sortBy === "price-ascending"}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="visually-hidden"
                              />
                              <span className="popover__choice-label">
                                Price, low to high
                              </span>
                            </label>
                            <label className="popover__choice-item">
                              <input
                                type="radio"
                                data-bind-value="sort-by-selected-value"
                                name="sort_by"
                                value="price-descending"
                                checked={sortBy === "price-descending"}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="visually-hidden"
                              />
                              <span className="popover__choice-label">
                                Price, high to low
                              </span>
                            </label>
                            <label className="popover__choice-item">
                              <input
                                type="radio"
                                data-bind-value="sort-by-selected-value"
                                name="sort_by"
                                value="date-ascending"
                                checked={sortBy === "date-ascending"}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="visually-hidden"
                              />
                              <span className="popover__choice-label">
                                Date, old to new
                              </span>
                            </label>
                            <label className="popover__choice-item">
                              <input
                                type="radio"
                                data-bind-value="sort-by-selected-value"
                                name="sort_by"
                                value="date-descending"
                                checked={sortBy === "date-descending"}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="visually-hidden"
                              />
                              <span className="popover__choice-label">
                                Date, new to old
                              </span>
                            </label>
                          </div>
                        </div>
                      </ap-sortbypopover>
                    </div>
                  </div>
                </div>
                <ap-productlist
                  className="product-facet-product-list product-list anchor object-loaded"
                  stagger-apparition
                  style={{ opacity: "1" }}
                >
                  <div
                    id="ap_productlist"
                    className="product-list-inner"
                    ref={productListRef}
                  >
                    {sortedProducts.map((product) => (
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
                                href={`/products/${product.product_id}`}
                                className="product-card-aspect-ratio aspect-ratio"
                                style={{
                                  paddingBottom: "100%",
                                  aspectRatio: "0.71",
                                }}
                              >
                                <img
                                  className="product-card-primary-image"
                                  loading="eager"
                                  src={`http://localhost:5000${product.image}`}
                                  alt={product.title}
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
                                  alt={product.title}
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
                                <a
                                  href="#"
                                  className="product-card-title mb-1"
                                >
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
                                        id={`product-form-${product.product_id}`}
                                        className="product-card-form"
                                        onSubmit={async (e) => {
                                          e.preventDefault();
                                          if (Number(product.stock_quantity) <= 0) return;
                                          try {
                                            await addToCart(product.product_id, 1);
                                          } catch (error) {
                                            console.error("Add To Cart Error:", error);
                                          }
                                        }}
                                      >
                                        <button
                                          type="submit"
                                          className="button button--outline button--text button--full"
                                          disabled={Number(product.stock_quantity) <= 0}
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
                    <ap-quickbuy
                      id="product-template--24248446714139__product-grid-9713933517083-drawer"
                      href="/products/the-city-and-its-uncertain-walls-a-novel-3?view=quick-buy-drawer"
                      className="drawer drawer--large drawer--quick-buy hide-on-phone"
                    ></ap-quickbuy>
                  </div>
                </ap-productlist>
              </div>
            </ap-productfacet>
          </div>
        </section>
      </div>
      <NewsLetter />
      <Footer />
    </>
  );
};
export default BooksPage;
