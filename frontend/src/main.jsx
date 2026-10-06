import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { AccountProvider } from "./account/context/AccountContext";
import { CartProvider } from "./context/CartContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import App from "./App";
import WishListPage from "./pages/WishListPage";
import ShopPage from "./pages/ShopPage";
import BooksPage from "./pages/BooksPage";
import FamilyPage from "./pages/FamilyPage";
import NewBooks from "./pages/NewBooks";
import FantasyPage from "./pages/FantasyPage";
import FictionPage from "./pages/FictionPage";
import HorrorPage from "./pages/HorrorPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AboutUsPage from "./pages/AboutUsPage";
import ContactUsPage from "./pages/ContactUsPage";
import BlogsPage from "./pages/BlogsPage";
import OurTeamPage from "./pages/OurTeamPage";
import FAQsPage from "./pages/FAQsPage";
import ErrorPage from "./pages/ErrorPage";
import ProductDetails from "./pages/ProductDetails";
import ComparePage from "./pages/ComparePage";
import { WishlistProvider } from "./context/WishlistContext";

// Admin Panel Imports
import AdminLayout from "./admin/components/AdminLayout";
import AdminRoute from "./admin/components/AdminRoute";
import AdminLogin from "./admin/pages/AdminLogin";
import Dashboard from "./admin/pages/Dashboard";
import Products from "./admin/pages/Products";
import ProductForm from "./admin/pages/ProductForm";
import Categories from "./admin/pages/Categories";
import Orders from "./admin/pages/Orders";
import OrderDetails from "./admin/pages/OrderDetails";
import Users from "./admin/pages/Users";
import UserDetails from "./admin/pages/UserDetails";
import AdminProfile from "./admin/pages/AdminProfile";

// Account Pages
import LoginPage from "./account/pages/LoginPage";
import RegisterPage from "./account/pages/RegisterPage";
import ForgotPasswordPage from "./account/pages/ForgotPasswordPage";
import ResetPasswordPage from "./account/pages/ResetPasswordPage";
import DashboardPage from "./account/pages/DashboardPage";
import OrdersPage from "./account/pages/OrdersPage";
import OrderDetailsPage from "./account/pages/OrderDetailsPage";
import PersonalDetailsPage from "./account/pages/PersonalDetailsPage";
import AddressesPage from "./account/pages/AddressesPage";
import AccountSettingsPage from "./account/pages/AccountSettingsPage";

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { path: "/", element: <App /> },
      { path: "/pages/wishlist", element: <WishListPage /> },
      { path: "/pages/compare", element: <ComparePage /> },
      { path: "/collections/all", element: <ShopPage /> },
      { path: "/collection/books", element: <BooksPage /> },
      { path: "/collection/frontpage", element: <NewBooks /> },
      { path: "/collection/family", element: <FamilyPage /> },
      { path: "/collection/fantasy", element: <FantasyPage /> },
      { path: "/collection/fiction", element: <FictionPage /> },
      { path: "/collection/Horror", element: <HorrorPage /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/checkouts", element: <CheckoutPage /> },
      { path: "/pages/about-us", element: <AboutUsPage /> },
      { path: "/pages/contact", element: <ContactUsPage /> },
      { path: "/pages/blogs/news", element: <BlogsPage /> },
      { path: "/pages/meet-our-team", element: <OurTeamPage /> },
      { path: "/pages/faqs", element: <FAQsPage /> },
      { path: "/404", element: <ErrorPage /> },
      { path: "/products/:id", element: <ProductDetails /> },
    ],
  },

  //admin routes
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { path: "", element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "products", element: <Products /> },
      { path: "products/new", element: <ProductForm /> },
      { path: "products/:id", element: <ProductForm /> },
      { path: "categories", element: <Categories /> },
      { path: "orders", element: <Orders /> },
      { path: "orders/:id", element: <OrderDetails /> },
      { path: "users", element: <Users /> },
      { path: "users/:id", element: <UserDetails /> },
      { path: "profile", element: <AdminProfile /> },
    ],
  },
  // Account Routes
  { path: "/account/login", element: <LoginPage /> },
  { path: "/account/register", element: <RegisterPage /> },
  { path: "/account/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/account/reset-password", element: <ResetPasswordPage /> },
  { path: "/account", element: <DashboardPage /> },
  { path: "/account/orders", element: <OrdersPage /> },
  { path: "/account/orders/:orderId", element: <OrderDetailsPage /> },
  { path: "/account/profile", element: <PersonalDetailsPage /> },
  { path: "/account/addresses", element: <AddressesPage /> },
  { path: "/account/settings", element: <AccountSettingsPage /> },
]);

createRoot(document.getElementById("root")).render(
  <AccountProvider>
    <CartProvider>
      <WishlistProvider>
        <RouterProvider router={router} />
      </WishlistProvider>
    </CartProvider>
  </AccountProvider>,
);
