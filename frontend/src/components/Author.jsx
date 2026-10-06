import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
const authors = [
  {
    id: 1,
    image: "images/Rectangle_291.webp",
    name: "Summer Chandler",
  },
  {
    id: 2,
    image: "images/Rectangle_292.webp",
    name: "Dennis Daniels",
  },
  {
    id: 3,
    image: "images/Rectangle_293.webp",
    name: "Aubrie Butler",
  },
  {
    id: 4,
    image: "images/Rectangle_282.png",
    name: "Matias Casey",
  },
  {
    id: 5,
    image: "images/Rectangle_302.png",
    name: "Melany Rodriguez",
  },
  {
    id: 6,
    image: "images/Rectangle_288.png",
    name: "Camelia Doe",
  },
  {
    id: 7,
    image: "images/Rectangle_289.png",
    name: "Johan Sanford",
  },
  {
    id: 8,
    image: "images/Rectangle_290.png",
    name: "Joe Knight",
  },
  {
    id: 9,
    image: "images/Rectangle_302.png",
    name: "Summer Chandler",
  },
];
const Auther = () => {
  return (
    <>
      <section
        id="shopify-section-template--23597515604251__child_collections_C7HPCX"
        className="site-section category-grid-section category-collection-section"
      >
        <section className="author-collections-section section section-flush category-collection-item">
          <div className="container">
            <div className="section-header-wrapper">
              <header className="section__header text-center mb-50">
                <h3 className="heading h3 mb-20">Featured authors</h3>
              </header>
            </div>

            <div className="category-collection-list position-relative">
              <Swiper
                className="custom-swiper myswiper-2 swiper-container product-swiper-list"
                modules={[Navigation, Pagination]}
                slidesPerView={1}
                spaceBetween={15}
                observer={true}
                observeParents={true}
                loop={true}
                speed={1000}
                navigation={{
                  nextEl: ".swiper-button-next",
                  prevEl: ".swiper-button-prev",
                }}
                pagination={{
                  el: ".swiper-pagination",
                  clickable: true,
                }}
                breakpoints={{
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
                }}
              >
                {authors.map((author) => (
                  <SwiperSlide
                    key={author.id}
                    className="swiper-slide multicolumn-item"
                  >
                    <a href="#" className="multicolumn-image-wrapper mb-12">
                      <img
                        loading="lazy"
                        sizes="(max-width: 740px) 25vw, (max-width: 999px) 20vw, 155px"
                        className="multicolumn-image"
                        src={author.image}
                        width="120"
                        height="120"
                        alt={author.name}
                      />
                    </a>

                    <div className="multicolumn-text-container text--center">
                      <a
                        href="#"
                        className="multicolumn-link heading p category-collection-title fw-semibold"
                      >
                        {author.name}
                      </a>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <button className="swiper-button-next">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="30"
                  viewBox="0 0 16 30"
                  fill="none"
                >
                  <path
                    d="M14.875 14.625C15.0417 14.875 15.0417 15.125 14.875 15.375L1.375 28.875C1.125 29.0417 0.875 29.0417 0.625 28.875C0.458333 28.625 0.458333 28.375 0.625 28.125L13.8125 15L0.625 1.875C0.458333 1.625 0.458333 1.375 0.625 1.125C0.875 0.958333 1.125 0.958333 1.375 1.125L14.875 14.625Z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              <button className="swiper-button-prev">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="30"
                  viewBox="0 0 16 30"
                  fill="none"
                >
                  <path
                    d="M1.125 14.625C0.958333 14.875 0.958333 15.125 1.125 15.375L14.625 28.875C14.875 29.0417 15.125 29.0417 15.375 28.875C15.5417 28.625 15.5417 28.375 15.375 28.125L2.1875 15L15.375 1.875C15.5417 1.625 15.5417 1.375 15.375 1.125C15.125 0.958333 14.875 0.958333 14.625 1.125L1.125 14.625Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </section>
    </>
  );
};
export default Auther;
