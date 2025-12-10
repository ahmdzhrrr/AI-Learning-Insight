import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Brain,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-primary-50 to-secondary/10">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl" />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full opacity-30"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #004343 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-[fadeInUp_0.6s_ease-out]">
        {/* Card Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-3xl blur-lg opacity-20 animate-pulse" />

        {/* Main Card */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-primary/10 border border-white/50 overflow-hidden">
          {/* Top Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

          {/* Decorative Corner */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl" />

          <div className="relative p-8 sm:p-10">
            {/* Logo & Header */}
            <div className="text-center mb-8 animate-[fadeInDown_0.6s_ease-out]">
              {/* Animated Logo */}
              <div className="relative inline-flex mb-6">
                {/* Outer Ring Animation */}
                <div
                  className="absolute inset-0 w-20 h-20 border-2 border-dashed border-primary/30 rounded-2xl animate-spin"
                  style={{ animationDuration: "10s" }}
                />

                {/* Logo Container */}
                <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 group-hover:shadow-2xl transition-shadow duration-300">
                  {/* Inner Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                  <Brain className="h-10 w-10 text-white relative z-10" />
                </div>

                {/* Sparkle */}
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  AI Learning Insight
                </span>
              </h1>
              <p className="text-gray-500 text-sm">
                Masuk untuk melanjutkan pembelajaran Anda
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 animate-[fadeIn_0.3s_ease-out]">
                <div className="p-1 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-red-700 text-sm font-medium">
                    Login Gagal
                  </p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="relative group">
                  {/* Icon */}
                  <div
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                      focusedField === "email"
                        ? "text-primary"
                        : "text-gray-400"
                    }`}
                  >
                    <Mail className="h-5 w-5" />
                  </div>

                  {/* Input */}
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border-2 border-gray-100 rounded-xl text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/5"
                    placeholder="nama@email.com"
                  />

                  {/* Focus Ring Animation */}
                  <div
                    className={`absolute inset-0 rounded-xl border-2 border-primary/50 transition-opacity duration-300 pointer-events-none ${
                      focusedField === "email" ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative group">
                  {/* Icon */}
                  <div
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                      focusedField === "password"
                        ? "text-primary"
                        : "text-gray-400"
                    }`}
                  >
                    <Lock className="h-5 w-5" />
                  </div>

                  {/* Input */}
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50/50 border-2 border-gray-100 rounded-xl text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/5"
                    placeholder="••••••••"
                  />

                  {/* Show/Hide Password Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors duration-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>

                  {/* Focus Ring Animation */}
                  <div
                    className={`absolute inset-0 rounded-xl border-2 border-primary/50 transition-opacity duration-300 pointer-events-none ${
                      focusedField === "password" ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-4 px-6 rounded-xl text-white font-semibold overflow-hidden transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {/* Button Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] transition-all duration-500 group-hover:bg-[position:100%_0]" />

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>

                  {/* Shadow */}
                  <div className="absolute inset-0 rounded-xl shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:shadow-primary/40 transition-shadow duration-300" />

                  {/* Button Content */}
                  <span className="relative flex items-center justify-center space-x-2">
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk</span>
                        <svg
                          className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Footer */}
            {/* <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-xs text-gray-400">
                © 2025 AI Learning Insight.
                <br />
                <span className="gradient-text font-semibold">
                  Team Capstone A25-CS226
                </span>
              </p>
            </div> */}
          </div>
        </div>

        {/* Bottom Decoration */}
        <div className="mt-6 flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary opacity-30"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* CSS for float animation */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
