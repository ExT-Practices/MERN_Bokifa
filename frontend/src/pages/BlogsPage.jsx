import Footer from "../components/Footer";
import Header from "../components/Header";
import NewsLetter from "../components/NewsLetter";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
const blogs = [
  {
    id: 1,
    image: "/images/blog_i_8.jpg",
    title: "Behind the Scenes with Author Victoria Aveyard",
  },
  {
    id: 2,
    image: "/images/blog_i_7.jpg",
    title: "5 Attractive Bookstore WordPress Themes",
  },
  {
    id: 3,
    image: "/images/blog_i_6.jpg",
    title: "Top 10 Books to Make It a Great Yeargh",
  },
  {
    id: 4,
    image: "/images/blog_i_5.jpg",
    title: "Author Special: A Q&A with Brené Brown",
  },
  {
    id: 5,
    image: "/images/blog_i_4_0d786b92-cfae-487f-b2c0-5d6e4ef47c7c.jpg",
    title: "Should You Feel Embarrassed for Reading Kids Bo...",
  },
  {
    id: 6,
    image: "/images/blog_i_2.jpg",
    title: "Top 5 Tarot Decks for the Tarot World Summit",
  },
];
const BlogsPage = () => {
  const productListRef = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.batch("blog-item", {
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
  }, []);
  return (
    <>
      <Header />
      <section
        id="shopify-section-template--23597514752283__breadcrumb_blog_zgRwqA"
        class="site-section section section-blog"
      >
        <style data-shopify="">{`.main-blog-title {
      margin-bottom: 8px;
    }
  
    .title-blog-content {
      color: #000;
      font-size: 2rem;
      text-align: center;
    }.blog-breadcrumb-header {
        margin: ;
      }
      .breadcrumb__list {
        padding: 0;   
      }
      .breadcrumb__link ,
      .breadcrumb__item+.breadcrumb__item:before {
        color: #ffffff;
      }
      .main-blog-title {
        text-align: left;
      }
      .blog-breadcrumb-header .breadcrumb-wrapper {
        padding-top: 35px;
        padding-bottom: 35px;
        
          background-image: url(//ap-bokifa.myshopify.com/cdn/shop/files/Mask_group_13_1.jpg?v=1729915599&width=2000);
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
        
        min-height: 450px;
        border-radius: 0;
        text-align: center;
        
          background-color: #000000;
        
      }
      .main-content-blog {
        padding-bottom: 60px;
      }
      .breadcrumb-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }`}</style>
        <div class="blog-breadcrumb-header">
          <div class="full">
            <div class="breadcrumb-wrapper">
              <h1
                style={{
                  color: "#ffffff",
                  fontSize: "74px",
                  fontFamily: "manrope",
                }}
                class="main-blog-title blog-title h1 fw-bolder"
              >
                News
              </h1>
              <style data-shopify="">{`.breadcrumb svg{
        width: 20px;
        float: left;
        margin-right: 5px;
        margin-bottom: 5px;
    }`}</style>
              <nav aria-label="Breadcrumb" class="breadcrumb text--xsmall">
                <ol class="breadcrumb__list" role="list">
                  <li class="breadcrumb__item">
                    <a class="breadcrumb__link" href="/">
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="home"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 576 512"
                        class="icon icon-home"
                      >
                        <path
                          fill="currentColor"
                          d="M541 229.16l-61-49.83v-77.4a6 6 0 0 0-6-6h-20a6 6 0 0 0-6 6v51.33L308.19 39.14a32.16 32.16 0 0 0-40.38 0L35 229.16a8 8 0 0 0-1.16 11.24l10.1 12.41a8 8 0 0 0 11.2 1.19L96 220.62v243a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16v-128l64 .3V464a16 16 0 0 0 16 16l128-.33a16 16 0 0 0 16-16V220.62L520.86 254a8 8 0 0 0 11.25-1.16l10.1-12.41a8 8 0 0 0-1.21-11.27zm-93.11 218.59h.1l-96 .3V319.88a16.05 16.05 0 0 0-15.95-16l-96-.27a16 16 0 0 0-16.05 16v128.14H128V194.51L288 63.94l160 130.57z"
                          class=""
                        ></path>
                      </svg>
                      Home
                    </a>
                  </li>

                  <li class="breadcrumb__item">
                    <span class="breadcrumb__link" ap-currentaria="page">
                      News
                    </span>
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </section>
      <section
        id="shopify-section-template--23597514752283__main"
        class="site-section section main-blog-section"
      >
        <style data-shopify="">
          {`.blog-main-content {
    padding-top: 27px;
    padding-bottom: 27px;
  }

  @media screen and (min-width: 750px) {
    .blog-main-content {
      padding-top: 36px;
      padding-bottom: 36px;
    }
  }

  .main-blog-section {
    margin: 0;
  }`}
        </style>
        <div class="container">
          <div class="row">
            <div class="main-blog page-width blog-main-content">
              <h1 class="title--primary mb-3">News</h1>
              <ap-listarticle
                stagger-apparition
                class="article-list article-list--stacked object-loaded"
                style={{ opacity: "1" }}
                ref={productListRef}
              >
                {blogs.map((blog) => (
                  <blog-item
                    className="blog-item blog-grid"
                    style={{ opacity: 1 }}
                  >
                    <div className="blog-card-item blog-card--horizontal image-zoom">
                      <div className="blog-card-thumb">
                        <a href="#" className="blog-card-image-container">
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
                          <span class="circle-divider">
                            <time datetime="2024-10-24T07:32:29Z">
                              October 24, 2024
                            </time>
                          </span>
                          <p class="blog-card-excerpt rte-width">
                            Lorem ipsum dolor sit amet, consectetur adipisicing
                            elit, sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua. Ut enim ad minim veniam, quis
                            nostrud exercitation ullamco laboris nisi...
                          </p>
                          <div class="blog-card-footer">
                            <span>1 comment</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </blog-item>
                ))}
              </ap-listarticle>
              <div class="pagination-wrapper">
                <nav
                  class="pagination"
                  role="navigation"
                  aria-label="Pagination"
                >
                  <ul class="pagination__list list-unstyled" role="list">
                    <li>
                      <a
                        role="link"
                        aria-disabled="true"
                        class="pagination__item pagination__item--current light"
                        ap-currentaria="page"
                        aria-label="Page 1"
                      >
                        1
                      </a>
                    </li>
                    <li>
                      <a
                        href="/blogs/news?page=2"
                        class="pagination__item link"
                        aria-label="Page 2"
                      >
                        2
                      </a>
                    </li>
                    <li>
                      <a
                        href="/blogs/news?page=2"
                        class="pagination__item pagination__item--prev pagination__item-arrow link motion-reduce"
                        aria-label="Next page"
                      >
                        <svg
                          aria-hidden="true"
                          focusable="false"
                          role="presentation"
                          class="icon icon-caret"
                          viewBox="0 0 10 6"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
      <NewsLetter />
      <Footer />
    </>
  );
};
export default BlogsPage;
