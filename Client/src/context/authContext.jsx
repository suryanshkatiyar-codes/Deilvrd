import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true); // checking session on mount

  // On app load — try to restore session via refresh token cookie
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        window.__accessToken__ = data.accessToken;
        setUser(data.user);
      } catch {
        // no valid session — fine, stay logged out
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    window.__accessToken__ = data.accessToken;
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    window.__accessToken__ = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);