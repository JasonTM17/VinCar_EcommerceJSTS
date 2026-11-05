"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("autonova_token");
      const storedUser = localStorage.getItem("autonova_user");
      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
      // ignore JSON parse error
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("autonova_token", res.token);
    localStorage.setItem("autonova_user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("autonova_token");
    localStorage.removeItem("autonova_user");
    setToken(null);
    setUser(null);
  }, []);

  const ensureGuestAuth = useCallback(async () => {
    if (token) return token;
    const res = await login("customer@autonova.local", "Customer123!");
    return res.token;
  }, [token, login]);

  return {
    token,
    user,
    isLoggedIn: !!token,
    loading,
    login,
    logout,
    ensureGuestAuth,
  };
}
