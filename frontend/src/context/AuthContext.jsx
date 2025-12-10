import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
} from "../services/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  // Check auth on mount
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        console.log("📝 No token found, user not authenticated");
        setUser(null);
        setLoading(false);
        return;
      }

      console.log("🔍 Checking authentication...");
      const userData = await getCurrentUser();
      
      if (userData) {
        console.log("✅ User authenticated:", userData.email);
        setUser(userData);
        setAuthError(null);
      } else {
        console.log("❌ No user data returned");
        setUser(null);
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error);
      
      // Hanya hapus token jika error adalah auth error (401)
      // JANGAN hapus token untuk network error atau error lain
      if (error.isAuthError || error.response?.status === 401) {
        console.log("🔐 Token invalid, clearing...");
        localStorage.removeItem("access_token");
        setUser(null);
        setAuthError("Session expired. Please login again.");
      } else if (error.isNetworkError) {
        // Network error - jangan hapus token, mungkin hanya offline sementara
        console.log("🌐 Network error, keeping token...");
        setAuthError("Network error. Please check your connection.");
        // Tetap set user null tapi jangan hapus token
        // User bisa coba refresh halaman nanti
      } else {
        // Error lain yang tidak diketahui
        console.log("⚠️ Unknown error, keeping token for retry...");
        setAuthError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      setAuthError(null);
      console.log("🔑 Attempting login...");
      
      const response = await apiLogin(email, password);
      const { access_token, user } = response.data;

      if (!access_token) {
        throw new Error("No access token received");
      }

      console.log("✅ Login successful, storing token...");
      localStorage.setItem("access_token", access_token);
      setUser(user);
      navigate("/");

      return { success: true };
    } catch (error) {
      console.error("❌ Login failed:", error);
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      setAuthError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = useCallback(() => {
    console.log("👋 Logging out...");
    apiLogout();
    setUser(null);
    setAuthError(null);
    navigate("/login");
  }, [navigate]);

  // Function untuk refresh auth (bisa dipanggil manual)
  const refreshAuth = useCallback(async () => {
    setLoading(true);
    await checkAuth();
  }, [checkAuth]);

  // Clear error
  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = {
    user,
    login,
    logout,
    loading,
    authError,
    clearError,
    refreshAuth,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
