import axios from "axios";
import router from "~/router";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("admin");
      if (router.currentRoute.value.path !== "/login") {
        router.push("/login");
      }
      return new Promise(() => {});
    }
    return Promise.reject(error);
  },
);
