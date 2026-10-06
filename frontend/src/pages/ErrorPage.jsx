import Footer from "../components/Footer";
import Header from "../components/Header";
import NewsLetter from "../components/NewsLetter";

const ErrorPage = () => {
  return (
    <>
      <Header />
      <div
        id="shopify-section-template--23597514522907__main"
        class="site-section"
        style={{ fontFamily: "manrope", fontWeight: "600" }}
      >
        <style type="text/css">
          {`
  .template-404 .title + * {
    margin-top: 1rem;
  }
  .template-404.center {
    text-align: center;
    padding: 50px 0;
  }
  /* .template-404 .title + * {
    background-color: var(--primary);
  }
  .template-404 a:hover {
    color: rgb(var(--primary-button-text-color));
  } */
  @media screen and (min-width: 750px) {
    .template-404 .title + * {
      margin-top: 2rem;
      background-color: #027a36; 
      color: white;
      line-height: 40px;
      padding: 0 20px;
    }
  }`}
        </style>

        <div class="template-404 page-width page-margin center">
          <p>404</p>
          <h1 class="title">We can’t find the page your are looking for</h1>
          <a
            href="/collections/all"
            class="button button--text button--primary button--small"
          >
            Continue shopping
          </a>
        </div>
      </div>
      <NewsLetter /> 
      <Footer />
    </>
  );
};
export default ErrorPage;
