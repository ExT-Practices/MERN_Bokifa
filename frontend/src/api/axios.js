import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    /*
     * Admin pages use adminToken.
     * Customer/user pages use normal token.
     */
    const isAdminPage = window.location.pathname.startsWith("/admin");

    const token = isAdminPage
      ? localStorage.getItem("adminToken")
      : localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      const isAdminPage = window.location.pathname.startsWith("/admin");

      if (isAdminPage && window.location.pathname !== "/admin/login") {
        /*
         * Only logout admin.
         * Do NOT touch customer's token.
         */
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
