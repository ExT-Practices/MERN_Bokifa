import { useEffect } from "react";
import Swiper from "swiper";
import "swiper/css";
import "swiper/css/pagination";

export default function ChildCollections() {
  useEffect(() => {
    const swiper = new Swiper(".myswiper-1", {
      slidesPerView: 1,
      spaceBetween: 15,
      observer: true,
      observeParents: true,
      loop: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      speed: 1000,
      breakpoints: {
        320: {
          slidesPerView: 2,
          spaceBetween: 12,
        },
        576: {
          slidesPerView: 3,
          spaceBetween: 15,
        },
        768: {
          slidesPerView: 4,
          spaceBetween: 20,
        },
        992: {
          slidesPerView: 6,
          spaceBetween: 25,
        },
        1200: {
          slidesPerView: 8,
          spaceBetween: 30,
        },
      },
    });

    return () => swiper.destroy(true, true);
  }, []);

  return (
    <section
      id="shopify-section-template--23597515604251__child_collections_VHbHJF"
      className="site-section category-grid-section category-collection-section"
    >
      <section className="categories-collections-section section section--flush category-collection-item">
        <div className="container">
          <div className="section-header-wrapper">
            <header
              style={{ gap: "15px 0" }}
              className="section-header text-left d-flex flex-wrap align-items-center justify-content-between mb-30"
            >
              <div className="section__header-left">
                <h3 className="heading h3 mb-20">Top categories</h3>
              </div>

              <div
                style={{ gap: "20px" }}
                className="section-header-right d-flex flex-wrap"
              >
                <div className="btn-more">
                  <a href="/collection/all" className="button btn-outline">
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
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </header>
          </div>

          <div className="category-collection-list position-relative">
            <div className="custom-swiper myswiper-1 swiper-container product-swiper-list">
              <div className="swiper-wrapper">
                <div
                  id="block-collection_QqKMqf"
                  className="swiper-slide multicolumn-item"
                >
                  <a href="#" className="multicolumn-image-wrapper mb-4">
                    <img
                      loading="lazy"
                      sizes="(max-width: 740px) 25vw, (max-width: 999px) 20vw, 155px"
                      className="multicolumn-image"
                      alt=""
                      src="https://ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_typecollection_8.png?v=1729585074&width=80"
                      data-srcset=""
                      width="80"
                      height="80"
                    />
                  </a>
                  <div className="multicolumn-text-container text-center">
                    <a
                      href="#"
                      className="multicolumn-link heading h6 category-collection-title"
                    >
                      Fantasy
                    </a>
                  </div>
                </div>

                <div
                  id="block-collection_QqKMqf"
                  className="swiper-slide multicolumn-item"
                >
                  <a href="#" className="multicolumn-image-wrapper mb-4">
                    <img
                      loading="lazy"
                      sizes="(max-width: 740px) 25vw, (max-width: 999px) 20vw, 155px"
                      className="multicolumn-image"
                      alt=""
                      src="https://ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_typecollection_7.png?v=1729585074&width=80"
                      data-srcset=""
                      width="80"
                      height="80"
                    />
                  </a>
                  <div className="multicolumn-text-container text-center">
                    <a
                      href="#"
                      className="multicolumn-link heading h6 category-collection-title"
                    >
                      Horror
                    </a>
                  </div>
                </div>

                <div
                  id="block-collection_QqKMqf"
                  className="swiper-slide multicolumn-item"
                >
                  <a href="#" className="multicolumn-image-wrapper mb-4">
                    <img
                      loading="lazy"
                      sizes="(max-width: 740px) 25vw, (max-width: 999px) 20vw, 155px"
                      className="multicolumn-image"
                      alt=""
                      src="https://ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_typecollection_6.png?v=1729585073&width=80"
                      data-srcset=""
                      width="80"
                      height="80"
                    />
                  </a>
                  <div className="multicolumn-text-container text-center">
                    <a
                      href="#"
                      className="multicolumn-link heading h6 category-collection-title"
                    >
                      Family
                    </a>
                  </div>
                </div>

                <div
                  id="block-collection_QqKMqf"
                  className="swiper-slide multicolumn-item"
                >
                  <a href="#" className="multicolumn-image-wrapper mb-4">
                    <img
                      loading="lazy"
                      sizes="(max-width: 740px) 25vw, (max-width: 999px) 20vw, 155px"
                      className="multicolumn-image"
                      alt=""
                      src="https://ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_typecollection_5.png?v=1729585073&width=80"
                      data-srcset=""
                      width="80"
                      height="80"
                    />
                  </a>
                  <div className="multicolumn-text-container text-center">
                    <a
                      href="#"
                      className="multicolumn-link heading h6 category-collection-title"
                    >
                      Fiction
                    </a>
                  </div>
                </div>

                <div
                  id="block-collection_QqKMqf"
                  className="swiper-slide multicolumn-item"
                >
                  <a href="#" className="multicolumn-image-wrapper mb-4">
                    <img
                      loading="lazy"
                      sizes="(max-width: 740px) 25vw, (max-width: 999px) 20vw, 155px"
                      className="multicolumn-image"
                      alt=""
                      src="https://ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_typecollection_4.png?v=1729585074&width=80"
                      data-srcset=""
                      width="80"
                      height="80"
                    />
                  </a>
                  <div className="multicolumn-text-container text-center">
                    <a
                      href="#"
                      className="multicolumn-link heading h6 category-collection-title"
                    >
                      Romance
                    </a>
                  </div>
                </div>

                <div
                  id="block-collection_QqKMqf"
                  className="swiper-slide multicolumn-item"
                >
                  <a href="#" className="multicolumn-image-wrapper mb-4">
                    <img
                      loading="lazy"
                      sizes="(max-width: 740px) 25vw, (max-width: 999px) 20vw, 155px"
                      className="multicolumn-image"
                      alt=""
                      src="https://ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_typecollection_3.png?v=1729585074&width=80"
                      data-srcset=""
                      width="80"
                      height="80"
                    />
                  </a>
                  <div className="multicolumn-text-container text-center">
                    <a
                      href="#"
                      className="multicolumn-link heading h6 category-collection-title"
                    >
                      Kids
                    </a>
                  </div>
                </div>

                <div
                  id="block-collection_QqKMqf"
                  className="swiper-slide multicolumn-item"
                >
                  <a href="#" className="multicolumn-image-wrapper mb-4">
                    <img
                      loading="lazy"
                      sizes="(max-width: 740px) 25vw, (max-width: 999px) 20vw, 155px"
                      className="multicolumn-image"
                      alt=""
                      src="https://ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_typecollection_2.png?v=1729585074&width=80"
                      data-srcset=""
                      width="80"
                      height="80"
                    />
                  </a>
                  <div className="multicolumn-text-container text-center">
                    <a
                      href="#"
                      className="multicolumn-link heading h6 category-collection-title"
                    >
                      History
                    </a>
                  </div>
                </div>

                <div
                  id="block-collection_QqKMqf"
                  className="swiper-slide multicolumn-item"
                >
                  <a href="#" className="multicolumn-image-wrapper mb-4">
                    <img
                      loading="lazy"
                      sizes="(max-width: 740px) 25vw, (max-width: 999px) 20vw, 155px"
                      className="multicolumn-image"
                      alt=""
                      src="https://ap-bokifa.myshopify.com/cdn/shop/files/ap_bo_typecollection_1.png?v=1729585073&width=80"
                      data-srcset=""
                      width="80"
                      height="80"
                    />
                  </a>
                  <div className="multicolumn-text-container text-center">
                    <a
                      href="#"
                      className="multicolumn-link heading h6 category-collection-title"
                    >
                      Biography
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
