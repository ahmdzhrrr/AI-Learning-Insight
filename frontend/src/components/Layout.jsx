import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User, Brain, Menu, X, ChevronDown } from "lucide-react";

const Layout = () => {
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isUserDataReady, setIsUserDataReady] = useState(false);

  // Wait for user data to be ready
  useEffect(() => {
    if (!loading && user) {
      // Small delay to ensure data is properly loaded
      const timer = setTimeout(() => {
        setIsUserDataReady(true);
      }, 100);
      return () => clearTimeout(timer);
    } else if (!loading && !user) {
      setIsUserDataReady(true);
    }
  }, [loading, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest(".user-menu-container")) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  // Get display name with fallback
  const getDisplayName = () => {
    if (user?.name && user.name.trim() !== "") {
      return user.name;
    }
    if (user?.email) {
      // Extract name from email (before @)
      return user.email.split("@")[0];
    }
    return "User";
  };

  // Skeleton component for loading state
  const UserSkeleton = () => (
    <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/50 border border-white/60">
      <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
      <div className="space-y-2">
        <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
        <div className="w-24 h-2 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50 to-secondary/5">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 glass border-b border-white/20 shadow-lg shadow-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 lg:h-20">
            {/* Logo Section */}
            <div className="flex items-center">
              <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300" />

                {/* Logo Container */}
                <div className="relative flex items-center space-x-3 bg-gradient-to-r from-primary to-secondary p-2.5 rounded-xl">
                  <Brain className="h-6 w-6 lg:h-7 lg:w-7 text-white animate-pulse" />
                </div>
              </div>

              <div className="ml-3 lg:ml-4">
                <span className="font-bold text-lg lg:text-xl gradient-text">
                  AI Learning
                </span>
                <span className="hidden sm:inline font-bold text-lg lg:text-xl text-primary ml-1">
                  Insight
                </span>
                <p className="hidden lg:block text-xs text-gray-500 -mt-0.5">
                  Smart Analytics Dashboard
                </p>
              </div>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Show skeleton while loading */}
              {loading || !isUserDataReady ? (
                <UserSkeleton />
              ) : (
                /* User Info Card */
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/50 hover:bg-white/80 border border-white/60 transition-all duration-300 group"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      {/* Online Indicator */}
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>

                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                        {getDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[120px]">
                        {user?.email || ""}
                      </p>
                    </div>

                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 glass rounded-xl shadow-xl shadow-primary/10 border border-white/30 py-2 animate-[fadeInDown_0.2s_ease-out]">
                      {/* User Info in Dropdown */}
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email || ""}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-gray-600 hover:bg-white/60 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 glass border-t border-white/20 shadow-xl animate-[slideDown_0.3s_ease-out]">
            <div className="px-4 py-4 space-y-3">
              {/* User Info */}
              {loading || !isUserDataReady ? (
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/50">
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email || ""}</p>
                  </div>
                </div>
              )}

              {/* Logout */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-white btn-primary"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto py-6 text-center">
        <p className="text-sm text-gray-500">
          © 2025 AI Learning Insight. Team Capstone{" "}
          <span className="gradient-text font-semibold">A25-CS226</span>
        </p>
      </footer>
    </div>
  );
};

export default Layout;
