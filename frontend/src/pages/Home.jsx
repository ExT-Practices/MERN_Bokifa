import Header from "../components/Header";
import SlideShow from "../components/SlideShow";
import WeekHighlight from "../components/WeekHighLight";
import CategoriesSlide from "../components/CategoriesSlide";
import BestSelling from "../components/BestSelling";
import HalfPrice from "../components/HalfPrice";
import PicksForYou from "../components/PicksForYou";
import Auther from "../components/Author";
import Testimonial from "../components/Testimonial";
import Blogs from "../components/Blogs";
import NewsLetter from "../components/NewsLetter";
import Footer from "../components/Footer";
const Home = () => {
  return (
    <>
      <Header />
      <SlideShow />
      <WeekHighlight />
      <CategoriesSlide />
      <BestSelling/>
      <HalfPrice/>
      <PicksForYou/>
      <Auther/>
      <Testimonial/>
      <Blogs/>
      <NewsLetter/>
      <Footer/>
    </>
  );
};
export default Home;
