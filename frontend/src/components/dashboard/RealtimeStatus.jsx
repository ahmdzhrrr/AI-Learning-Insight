import React from "react";
import { Activity, Database, BarChart3, Brain, Clock, Wifi, Zap } from "lucide-react";

const RealtimeStatus = ({
  metricsInterval,
  chartsInterval,
  insightsInterval,
  nextMetricsUpdate,
  nextChartsUpdate,
  nextInsightsUpdate,
  lastMetricsUpdate,
  lastChartsUpdate,
  lastInsightsUpdate,
  isRefreshingMetrics,
  isRefreshingCharts,
}) => {
  const formatTime = (date) => {
    if (!date) return "-";
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getProgressPercentage = (next, total) => {
    return ((total - next) / total) * 100;
  };

  const statusItems = [
    {
      id: "metrics",
      label: "Metrics Data",
      icon: Database,
      color: "primary",
      gradient: "from-primary to-secondary",
      bgLight: "bg-primary-50",
      textColor: "text-primary",
      borderColor: "border-primary/20",
      interval: metricsInterval,
      nextUpdate: nextMetricsUpdate,
      lastUpdate: lastMetricsUpdate,
      isRefreshing: isRefreshingMetrics,
    },
    {
      id: "charts",
      label: "Charts Data",
      icon: BarChart3,
      color: "violet",
      gradient: "from-violet-500 to-purple-500",
      bgLight: "bg-violet-50",
      textColor: "text-violet-600",
      borderColor: "border-violet-200",
      interval: chartsInterval,
      nextUpdate: nextChartsUpdate,
      lastUpdate: lastChartsUpdate,
      isRefreshing: isRefreshingCharts,
    },
    {
      id: "insights",
      label: "AI Insights",
      icon: Brain,
      color: "amber",
      gradient: "from-amber-500 to-orange-500",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-200",
      interval: insightsInterval,
      nextUpdate: nextInsightsUpdate,
      lastUpdate: lastInsightsUpdate,
      isRefreshing: false,
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg border border-white/50 mb-8">
      {/* Header Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
      
      {/* Background Decoration */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-secondary/5 to-primary/5 rounded-full blur-3xl" />
      
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
                <Activity className="h-5 w-5 text-white" />
              </div>
              {/* Pulse Ring */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">Realtime Status</h3>
              <p className="text-xs text-gray-500">Live data synchronization</p>
            </div>
          </div>
          
          {/* Live Badge */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
            <Wifi className="h-4 w-4 text-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-emerald-600">Connected</span>
          </div>
        </div>

        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusItems.map((item, index) => {
            const Icon = item.icon;
            const progress = getProgressPercentage(item.nextUpdate, item.interval);
            const isUrgent = item.nextUpdate <= 5;
            
            return (
              <div
                key={item.id}
                className={`relative overflow-hidden rounded-xl border ${item.borderColor} bg-gradient-to-br from-white to-gray-50/50 p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02]`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Refreshing Indicator */}
                {item.isRefreshing && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" />
                )}
                
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.gradient}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  
                  {/* Status Dot */}
                  {item.isRefreshing && (
                    <span className="flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full bg-gradient-to-r ${item.gradient} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r ${item.gradient}`}></span>
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  {/* Interval */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 flex items-center space-x-1">
                      <Zap className="h-3 w-3" />
                      <span>Interval</span>
                    </span>
                    <span className="font-semibold text-gray-700">{item.interval}s</span>
                  </div>
                  
                  {/* Next Update */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Next update</span>
                    </span>
                    <span className={`font-semibold ${isUrgent ? 'text-orange-500 animate-pulse' : 'text-gray-700'}`}>
                      {item.nextUpdate}s
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.gradient} rounded-full transition-all duration-1000 ease-linear relative overflow-hidden`}
                      style={{ width: `${progress}%` }}
                    >
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                  </div>
                  
                  {/* Last Update */}
                  <div className="flex items-center justify-end space-x-1 text-xs text-gray-400 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>Last: {formatTime(item.lastUpdate)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1.5">
              <Database className="h-3.5 w-3.5 text-primary" />
              <span>Metrics: <strong className="text-gray-700">{metricsInterval}s</strong></span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="flex items-center space-x-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-violet-500" />
              <span>Charts: <strong className="text-gray-700">{chartsInterval}s</strong></span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="flex items-center space-x-1.5">
              <Brain className="h-3.5 w-3.5 text-amber-500" />
              <span>AI Insights: <strong className="text-gray-700">{insightsInterval}s</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeStatus;
