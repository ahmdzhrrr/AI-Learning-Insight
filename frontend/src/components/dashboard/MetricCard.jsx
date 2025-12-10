import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "primary",
  trend = null,
  trendValue = null,
  subtitle = null,
  isLoading = false 
}) => {
  const colorClasses = {
    primary: {
      bg: "bg-gradient-to-br from-primary to-primary-light",
      bgLight: "bg-primary-50",
      text: "text-primary",
      shadow: "shadow-primary/20",
      ring: "ring-primary/20",
      iconBg: "bg-white/20",
    },
    secondary: {
      bg: "bg-gradient-to-br from-secondary to-secondary-light",
      bgLight: "bg-secondary/10",
      text: "text-secondary",
      shadow: "shadow-secondary/20",
      ring: "ring-secondary/20",
      iconBg: "bg-white/20",
    },
    teal: {
      bg: "bg-gradient-to-br from-teal-600 to-teal-400",
      bgLight: "bg-teal-50",
      text: "text-teal-600",
      shadow: "shadow-teal-500/20",
      ring: "ring-teal-500/20",
      iconBg: "bg-white/20",
    },
    emerald: {
      bg: "bg-gradient-to-br from-emerald-600 to-emerald-400",
      bgLight: "bg-emerald-50",
      text: "text-emerald-600",
      shadow: "shadow-emerald-500/20",
      ring: "ring-emerald-500/20",
      iconBg: "bg-white/20",
    },
    cyan: {
      bg: "bg-gradient-to-br from-cyan-600 to-cyan-400",
      bgLight: "bg-cyan-50",
      text: "text-cyan-600",
      shadow: "shadow-cyan-500/20",
      ring: "ring-cyan-500/20",
      iconBg: "bg-white/20",
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-500 to-amber-400",
      bgLight: "bg-amber-50",
      text: "text-amber-600",
      shadow: "shadow-amber-500/20",
      ring: "ring-amber-500/20",
      iconBg: "bg-white/20",
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-600 to-blue-400",
      bgLight: "bg-blue-50",
      text: "text-blue-600",
      shadow: "shadow-blue-500/20",
      ring: "ring-blue-500/20",
      iconBg: "bg-white/20",
    },
    green: {
      bg: "bg-gradient-to-br from-green-600 to-green-400",
      bgLight: "bg-green-50",
      text: "text-green-600",
      shadow: "shadow-green-500/20",
      ring: "ring-green-500/20",
      iconBg: "bg-white/20",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-600 to-purple-400",
      bgLight: "bg-purple-50",
      text: "text-purple-600",
      shadow: "shadow-purple-500/20",
      ring: "ring-purple-500/20",
      iconBg: "bg-white/20",
    },
    yellow: {
      bg: "bg-gradient-to-br from-yellow-500 to-yellow-400",
      bgLight: "bg-yellow-50",
      text: "text-yellow-600",
      shadow: "shadow-yellow-500/20",
      ring: "ring-yellow-500/20",
      iconBg: "bg-white/20",
    },
  };

  const colors = colorClasses[color] || colorClasses.primary;

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColorClass = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-gray-400";

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg p-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-gray-200" />
          <div className="w-16 h-4 bg-gray-200 rounded" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="w-24 h-3 bg-gray-200 rounded" />
          <div className="w-16 h-8 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-500 card-hover">
      {/* Background Gradient Decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
      
      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon Container */}
          <div className={`relative p-3 rounded-xl ${colors.bg} shadow-lg ${colors.shadow}`}>
            {/* Glow Effect */}
            <div className={`absolute inset-0 rounded-xl ${colors.bg} blur-lg opacity-50`} />
            <Icon className="relative h-6 w-6 text-white" />
          </div>

          {/* Trend Badge */}
          {trend && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
              trend === "up" ? "bg-emerald-50" : trend === "down" ? "bg-red-50" : "bg-gray-50"
            }`}>
              <TrendIcon className={`h-3 w-3 ${trendColorClass}`} />
              {trendValue && (
                <span className={`text-xs font-medium ${trendColorClass}`}>
                  {trendValue}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>

        {/* Value */}
        <div className="flex items-baseline space-x-2">
          <p className={`text-3xl font-bold ${colors.text} tracking-tight`}>
            {value}
          </p>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
        )}

        {/* Bottom Decoration Line */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      </div>
    </div>
  );
};

export default MetricCard;
