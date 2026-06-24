import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

api.interceptors.request.use(function(config) {
  var token = window.__accessToken__;
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});

api.interceptors.response.use(
  function(res) { return res; },
  function(error) {
    var original = error.config;

    // never retry if the failed request was the refresh call itself
    if (original.url && original.url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401 && !original._retry) {
      original._retry = true;
      return axios.post(BASE + "/auth/refresh", {}, { withCredentials: true })
        .then(function(res) {
          window.__accessToken__ = res.data.accessToken;
          original.headers.Authorization = "Bearer " + res.data.accessToken;
          return api(original);
        })
        .catch(function() {
          window.__accessToken__ = null;
          window.location.href = "/login";
        });
    }

    return Promise.reject(error);
  }
);

export default api;