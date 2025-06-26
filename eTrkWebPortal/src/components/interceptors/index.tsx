import axios, {
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosResponse,
} from "axios";
import { useNavigate } from "react-router-dom";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,

  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
  },
});
``;

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accesstoken");

    if (token) {
      if (!config.headers) {
        // Initialize headers as an empty object if undefined
        config.headers = {} as AxiosRequestHeaders;
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling token expiration
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to token expiration
    if (
      error.response &&
      error.response.status == 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Get the refresh token from local storage
        const refreshToken = localStorage.getItem("refreshtoken");

        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        // Make a request to refresh the access token
        const refreshResponse = await api.post("/refreshtoken", {
          refreshToken,
        });

        const { accessToken } = refreshResponse.data;

        // Update the access token in local storage
        localStorage.setItem("accesstoken", accessToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure (e.g., logout user)
        console.error("Failed to refresh token:", refreshError);
        // Clear local storage or perform logout action
        localStorage.clear();
        // Redirect user to login page
        const navigate = useNavigate();
        navigate("/");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
