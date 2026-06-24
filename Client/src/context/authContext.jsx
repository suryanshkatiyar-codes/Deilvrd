import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  var userState = useState(null);
  var user = userState[0];
  var setUser = userState[1];

  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  function normalizeUser(u) {
    if (!u) return null;
    if (u.kyc) u.kycStatus = u.kyc.status;
    return u;
  }

  useEffect(function() {
    api.post("/auth/refresh")
      .then(function(res) {
        window.__accessToken__ = res.data.accessToken;
        return api.get("/users/me");
      })
      .then(function(res) {
        setUser(normalizeUser(res.data.user));
      })
      .catch(function() {
        // no active session, stay logged out
      })
      .finally(function() {
        setLoading(false);
      });
  }, []);

  function login(email, password) {
    return api.post("/auth/login", { email, password })
      .then(function(res) {
        window.__accessToken__ = res.data.accessToken;
        setUser(normalizeUser(res.data.user));
        return normalizeUser(res.data.user);
      });
  }

  function logout() {
    return api.post("/auth/logout")
      .then(function() {
        window.__accessToken__ = null;
        setUser(null);
      });
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}