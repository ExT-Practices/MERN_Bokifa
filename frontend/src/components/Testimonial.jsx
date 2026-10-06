import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
const testimonials = [
  {
    id: 1,
    author: "Joanne H.",
    date: "Dec 1, 2024",
    title: "This is my favorite bookshop",
    content:
      "Love that you give books to those in need. Great service and can find great value here especially as I prefer hardcover books to add to my collection.",
  },
  {
    id: 2,
    author: "Viorel M.",
    date: "Dec 1, 2024",
    title: "Quick and easy",
    content:
      "Costs are low, there's always promotions or discounts, the website is easy to navigate, and knowing that the impact of purchasing makes me feel like I'm doing something good.",
  },
  {
    id: 3,
    author: "Ciaren R.",
    date: "Dec 1, 2024",
    title: "Excellent service",
    content:
      "The books were wrapped securely and arrived in pristine condition. I sent an email after to books arrived to ask about the author, and I received a prompt reply.",
  },
  {
    id: 4,
    author: "Margaret C.",
    date: "Dec 1, 2024",
    title: "Best Bookshop ever!",
    content:
      "I am so happy to find a site where I can shop for unusual items. The packaging was phenomenal and my book arrived on time in perfect condition.",
  },
];

const Testimonial = () => {
  return (
    <>
      <section
        id="shopify-section-template--23597515604251__testimonial_carousel_NnFhMg"
        className="site-section testimonial-carousel-section"
      >
        <section
          className="section testimonial-carousel-section"
          id="sectiontemplate--23597515604251__testimonial_carousel_NnFhMg"
        >
          <div className="container">
            <header
              style={{ gap: "15px 0" }}
              className="section__header text-left d-flex flex-wrap align-items-center justify-content-between mb-30"
            >
              <div className="section__header-left">
                <h3 className="heading h3 mb-20">What client says</h3>

                <div className="heading-description">
                  <span
                    className="d-xl-block d-none"
                    style={{
                      position: "absolute",
                      right: "100px",
                      top: 0,
                      minWidth: "200px",
                      padding: "60px 0",
                      textAlign: "center",
                      backgroundColor: "#027a36",
                      borderRadius: "50%",
                      color: "#e2bb80",
                      maxHeight: "200px",
                      fontWeight: 900,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "40px",
                        lineHeight: 1,
                        fontFamily: "manrope",
                      }}
                    >
                      4.8
                    </span>
                    /5
                    <img
                      alt=""
                      src="https://cdn.shopify.com/s/files/1/0906/6014/3387/files/rating.png?v=1729765926"
                      loading="lazy"
                      style={{
                        display: "block",
                        margin: "4px auto 6px",
                      }}
                    />
                    <span
                      style={{
                        display: "block",
                        fontSize: "11px",
                        lineHeight: "18px",
                        fontWeight: 600,
                        textDecoration: "underline",
                        color: "#fff",
                      }}
                    >
                      12,598 Verified Reviews
                    </span>
                  </span>
                </div>
              </div>

              <div
                style={{ gap: "20px" }}
                className="section__header-right d-flex flex-wrap"
              ></div>
            </header>

            <div className="testimonial-carousel">
              <Swiper
                className="custom-swiper myswiper-3 swiper-container product-swiper-list"
                modules={[Pagination]}
                slidesPerView={1}
                spaceBetween={15}
                observer={true}
                observeParents={true}
                loop={true}
                speed={1000}
                pagination={{
                  el: ".swiper-pagination",
                  clickable: true,
                }}
                breakpoints={{
                  360: {
                    slidesPerView: 1,
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
                {testimonials.map((testimonial) => (
                  <SwiperSlide
                    key={testimonial.id}
                    className="swiper-slide testimonial-carousel-item"
                    style={{
                      backgroundColor: "rgb(255, 255, 255)",
                      borderRadius: "20px",
                    }}
                  >
                    <div className="testimonial-carousel-box d-flex text-left h-100">
                      <div className="testimonial-carousel-info">
                        <div
                          style={{ color: "#332f2c" }}
                          className="testimonial__author fw-semibold mb-1"
                        >
                          {testimonial.author}
                        </div>

                        <div className="quote-content-top">
                          <ul className="quote-rating list-unstyled">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <li className="rated" key={star}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                >
                                  <path
                                    d="M3.825 20L6.15 12.4L0 8H7.6L10 0L12.4 8H20L13.85 12.4L16.175 20L10 15.3L3.825 20Z"
                                    fill="#FF961B"
                                  />
                                </svg>
                              </li>
                            ))}
                          </ul>

                          <div className="testimonial__time">
                            {testimonial.date}
                          </div>
                        </div>

                        <div
                          style={{ color: "#332f2c" }}
                          className="testimonial__content-title sub-heading heading mb-4"
                        >
                          {testimonial.title}
                        </div>

                        <blockquote className="testimonial__content blockquote">
                          {testimonial.content}
                        </blockquote>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      </section>
      <section id="shopify-section-template--23597515604251__service_nizft6">
        <section className="testimonial-services-banner">
          <div className="container">
            <div className="row">
              <div
                id="block-service_jcmV7G"
                className="col-xl-3 col-md-6 col-12"
              >
                <service-item
                  className="d-block mb-xl-0 mb-4 object-loaded"
                  style={{ backgroundColor: "#fff", opacity: 1 }}
                >
                  <div className="service-feature-item text-center">
                    <div className="service-feature-icon mb-4">
                      <img
                        className="service-feature-image"
                        reveal=""
                        loading="lazy"
                        sizes="(max-width: 740px) 80vw, (max-width: 999px) 60vw, 425px"
                        alt=""
                        src="images/box_1.png"
                        height="36"
                        width="36"
                        style={{ opacity: 1 }}
                      />
                    </div>

                    <div className="service-feature-content">
                      <h5
                        style={{ color: "#000000", opacity: 1 }}
                        className="heading service-feature-title p mb-2"
                      >
                        fast delivery
                      </h5>

                      <p
                        style={{ color: "rgb(154, 154, 154)", opacity: 1 }}
                        className="service-feature-description"
                      >
                        free standard delivery
                      </p>
                    </div>
                  </div>
                </service-item>
              </div>

              <div
                id="block-service_L4xGEE"
                className="col-xl-3 col-md-6 col-12"
              >
                <service-item
                  className="d-block mb-xl-0 mb-4 object-loaded"
                  style={{ backgroundColor: "#fff", opacity: 1 }}
                >
                  <div className="service-feature-item text-center">
                    <div className="service-feature-icon mb-4">
                      <img
                        className="service-feature-image"
                        reveal=""
                        loading="lazy"
                        sizes="(max-width: 740px) 80vw, (max-width: 999px) 60vw, 425px"
                        alt=""
                        src="images/gift-box_1.png"
                        height="36"
                        width="36"
                        style={{ opacity: 1 }}
                      />
                    </div>

                    <div className="service-feature-content">
                      <h5
                        style={{ color: "#000000", opacity: 1 }}
                        className="heading service-feature-title p mb-2"
                      >
                        best price & offers
                      </h5>

                      <p
                        style={{ color: "rgb(154, 154, 154)", opacity: 1 }}
                        className="service-feature-description"
                      >
                        Multiple gift option available
                      </p>
                    </div>
                  </div>
                </service-item>
              </div>

              <div
                id="block-service_yCWkr3"
                className="col-xl-3 col-md-6 col-12"
              >
                <service-item
                  className="d-block mb-xl-0 mb-4 object-loaded"
                  style={{ backgroundColor: "#fff", opacity: 1 }}
                >
                  <div className="service-feature-item text-center">
                    <div className="service-feature-icon mb-4">
                      <img
                        className="service-feature-image"
                        reveal=""
                        loading="lazy"
                        sizes="(max-width: 740px) 80vw, (max-width: 999px) 60vw, 425px"
                        alt=""
                        src="images/fire_1.png"
                        height="36"
                        width="36"
                        style={{ opacity: 1 }}
                      />
                    </div>

                    <div className="service-feature-content">
                      <h5
                        style={{ color: "#000000", opacity: 1 }}
                        className="heading service-feature-title p mb-2"
                      >
                        great daily deal
                      </h5>

                      <p
                        style={{ color: "rgb(154, 154, 154)", opacity: 1 }}
                        className="service-feature-description"
                      >
                        Orders $50 or more
                      </p>
                    </div>
                  </div>
                </service-item>
              </div>

              <div
                id="block-service_yCWkr3"
                className="col-xl-3 col-md-6 col-12"
              >
                <service-item
                  className="d-block mb-xl-0 mb-4 object-loaded"
                  style={{ backgroundColor: "#fff", opacity: 1 }}
                >
                  <div className="service-feature-item text-center">
                    <div className="service-feature-icon mb-4">
                      <img
                        className="service-feature-image"
                        reveal=""
                        loading="lazy"
                        sizes="(max-width: 740px) 80vw, (max-width: 999px) 60vw, 425px"
                        alt=""
                        src="images/book6_1.png"
                        height="36"
                        width="36"
                        style={{ opacity: 1 }}
                      />
                    </div>

                    <div className="service-feature-content">
                      <h5
                        style={{ color: "#000000", opacity: 1 }}
                        className="heading service-feature-title p mb-2"
                      >
                        click & collect
                      </h5>

                      <p
                        style={{ color: "rgb(154, 154, 154)", opacity: 1 }}
                        className="service-feature-description"
                      >
                        Check your local stores now
                      </p>
                    </div>
                  </div>
                </service-item>
              </div>
            </div>
          </div>
        </section>
      </section>
      <div style={{ border: "0.5px solid #eae6e6" }}></div>
    </>
  );
};
export default Testimonial;
