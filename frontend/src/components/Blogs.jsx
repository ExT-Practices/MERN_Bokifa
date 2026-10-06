import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
const blogs = [
  {
    id: 1,
    image: "images/blog_i_8.jpg",
    title: "Behind the Scenes with Author Victoria Aveyard",
  },
  {
    id: 2,
    image: "images/blog_i_7.jpg",
    title: "5 Attractive Bookstore WordPress Themes",
  },
  {
    id: 3,
    image: "images/blog_i_6.jpg",
    title: "Top 10 Books to Make It a Great Yeargh",
  },
  {
    id: 4,
    image: "images/blog_i_5.jpg",
    title: "Author Special: A Q&A with Brené Brown",
  },
  {
    id: 5,
    image: "images/blog_i_4_0d786b92-cfae-487f-b2c0-5d6e4ef47c7c.jpg",
    title: "Should You Feel Embarrassed for Reading Kids Bo...",
  },
  {
    id: 6,
    image: "images/blog_i_2.jpg",
    title: "Top 5 Tarot Decks for the Tarot World Summit",
  },
  {
    id: 7,
    image: "images/blog_i_1.jpg",
    title: "Top 10 Books to Make It a Great Year",
  },
];
const Blogs = () => {
  return (
    <>
      <section
        id="shopify-section-template--23597515604251__blog_carousel_E6E8Bj"
        className="site-section blog-section"
      >
        <section className="section blog-carousel-section">
          <div className="container">
            <div className="section-header-wrapper">
              <header
                style={{ gap: "15px 0" }}
                className="section-header text-left d-flex flex-wrap align-items-center justify-content-between mb-30"
              >
                <div className="section__header-left">
                  <h3 className="heading h3 mb-20">News & events</h3>
                </div>

                <div
                  style={{ gap: "20px" }}
                  className="section-header-right d-flex flex-wrap"
                >
                  <div className="btn-more">
                    <a href="/pages/blogs/news" className="button btn-outline">
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

            <div className="blog-carousel">
              <ap-blogcarousel
                className="blog-carousel-wrapper blog-carousel--center object-loaded"
                style={{ opacity: 1 }}
              >
                <Swiper
                  className="custom-swiper myswiper-4 swiper-container product-swiper-list"
                  modules={[Pagination]}
                  slidesPerView={1}
                  spaceBetween={15}
                  observer={true}
                  observeParents={true}
                  speed={1000}
                  pagination={{
                    el: ".swiper-pagination",
                    clickable: true,
                  }}
                  breakpoints={{
                    576: {
                      slidesPerView: 2,
                      spaceBetween: 15,
                    },
                    768: {
                      slidesPerView: 2,
                      spaceBetween: 30,
                    },
                    1200: {
                      slidesPerView: 3,
                      spaceBetween: 30,
                    },
                  }}
                >
                  {blogs.map((blog) => (
                    <SwiperSlide key={blog.id}>
                      <blog-item
                        className="blog-item blog-grid"
                        style={{ opacity: 1 }}
                      >
                        <div className="blog-card-item blog-card--horizontal image-zoom">
                          <div className="blog-card-thumb">
                            <a
                              href="#"
                              className="blog-card-image-container"
                            >
                              <img
                                className="blog-card-image"
                                src={blog.image}
                                width="1140"
                                height="620"
                                alt={blog.title}
                              />
                            </a>
                          </div>

                          <div className="blog-card-content text-container">
                            <div className="blog-card-details">
                              <div className="article">
                                <span className="blog-tag">
                                  <span className="title-blog">IN</span>

                                  <a
                                    className="blog-card-category tag-content fw-bold"
                                    href="#"
                                  >
                                    Tips & Tricks
                                  </a>
                                </span>

                                <span className="blog-date">Oct 24, 2024</span>

                                <span className="blog-author">
                                  <span className="title-blog">By</span>

                                  <span className="author fw-bold">Ha Ei</span>
                                </span>
                              </div>

                              <h3 className="blog-card-title heading h5">
                                <a href="#">{blog.title}</a>
                              </h3>
                            </div>
                          </div>
                        </div>
                      </blog-item>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </ap-blogcarousel>
            </div>
          </div>
        </section>
      </section>
      <div style={{ border: "0.5px solid #eae6e6" }}></div>
    </>
  );
};
export default Blogs;
