import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const getStoredUser = () => {
  if (typeof window === "undefined") return null;

  const saved = localStorage.getItem("user");
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const role = user?.role || null;

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("role", userData.role);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = useMemo(() => ({ user, role, login, logout }), [user, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
