import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // sends httpOnly refresh token cookie automatically
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = window.__accessToken__; // set by AuthContext after login
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Silent refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        window.__accessToken__ = data.accessToken;
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original); // retry original request
      } catch {
        window.__accessToken__ = null;
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;