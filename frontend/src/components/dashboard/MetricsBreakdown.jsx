import React from "react";
import { CheckCircle, XCircle, Clock, Calendar, BarChart3, Sparkles } from "lucide-react";

const MetricsBreakdown = ({ metrics }) => {
  if (!metrics) return null;

  const breakdownItems = [
    {
      label: "Total Submissions",
      value: metrics.total_submissions || 0,
      icon: CheckCircle,
      color: "emerald",
      gradient: "from-emerald-500 to-teal-500",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100",
    },
    {
      label: "Rejected Submissions",
      value: metrics.rejected_submissions || 0,
      icon: XCircle,
      color: "red",
      gradient: "from-red-500 to-rose-500",
      bgLight: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-100",
    },
    {
      label: "Rejection Ratio",
      value: `${((metrics.rejection_ratio || 0) * 100).toFixed(1)}%`,
      icon: Clock,
      color: "amber",
      gradient: "from-amber-500 to-orange-500",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-100",
    },
    {
      label: "Total Active Days",
      value: metrics.total_active_days || 0,
      icon: Calendar,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-100",
    },
  ];

  const overallScore = metrics.overall_score || 0;
  
  // Determine score color based on value
  const getScoreColor = (score) => {
    if (score >= 80) return { gradient: "from-emerald-500 to-teal-500", text: "text-emerald-600", bg: "bg-emerald-50" };
    if (score >= 60) return { gradient: "from-primary to-secondary", text: "text-primary", bg: "bg-primary-50" };
    if (score >= 40) return { gradient: "from-amber-500 to-orange-500", text: "text-amber-600", bg: "bg-amber-50" };
    return { gradient: "from-red-500 to-rose-500", text: "text-red-600", bg: "bg-red-50" };
  };

  const scoreColors = getScoreColor(overallScore);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-500">
      {/* Header Gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
      
      {/* Background Decoration */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-2xl" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Metrics Breakdown
              </h3>
              <p className="text-xs text-gray-500">Detailed performance metrics</p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-3 mb-6">
          {breakdownItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-xl ${item.bgLight} border ${item.borderColor} transition-all duration-300 hover:scale-[1.02] hover:shadow-md`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient} shadow-sm`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <span className={`text-lg font-bold ${item.textColor}`}>
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>

        {/* Overall Performance Section */}
        <div className={`relative overflow-hidden rounded-xl ${scoreColors.bg} border border-primary/10 p-5`}>
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-30">
            <div className={`absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br ${scoreColors.gradient} rounded-full blur-2xl`} />
            <div className={`absolute -bottom-10 -left-10 w-20 h-20 bg-gradient-to-tr ${scoreColors.gradient} rounded-full blur-2xl`} />
          </div>
          
          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className={`h-5 w-5 ${scoreColors.text}`} />
                <span className="font-semibold text-gray-800">Overall Performance</span>
              </div>
              <span className={`text-2xl font-bold ${scoreColors.text}`}>
                {overallScore.toFixed(1)}%
              </span>
            </div>
            
            {/* Progress Bar Container */}
            <div className="relative">
              {/* Background Track */}
              <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden shadow-inner">
                {/* Animated Progress */}
                <div
                  className={`h-full bg-gradient-to-r ${scoreColors.gradient} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                  style={{ width: `${overallScore}%` }}
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
              
              {/* Progress Markers */}
              <div className="flex justify-between mt-2 px-1">
                {[0, 25, 50, 75, 100].map((mark) => (
                  <span key={mark} className="text-xs text-gray-400">{mark}%</span>
                ))}
              </div>
            </div>

            {/* Performance Label */}
            <div className="mt-4 text-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${scoreColors.bg} ${scoreColors.text} border ${scoreColors.text.replace('text', 'border')}/20`}>
                {overallScore >= 80 ? "🌟 Excellent" : 
                 overallScore >= 60 ? "👍 Good" : 
                 overallScore >= 40 ? "📈 Improving" : "💪 Keep Going"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsBreakdown;
