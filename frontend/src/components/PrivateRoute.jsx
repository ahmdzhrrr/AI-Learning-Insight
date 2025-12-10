import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Brain } from "lucide-react";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50 to-secondary/5">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        {/* Loading Container */}
        <div className="relative z-10 text-center">
          {/* Animated Logo */}
          <div className="relative mb-8">
            {/* Outer Ring */}
            <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-primary/20 rounded-full" />
            
            {/* Spinning Ring */}
            <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-transparent border-t-primary rounded-full animate-spin" />
            
            {/* Inner Circle with Brain Icon */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold gradient-text">Loading Dashboard</h3>
            <p className="text-gray-500 text-sm">Please wait while we prepare your data...</p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
