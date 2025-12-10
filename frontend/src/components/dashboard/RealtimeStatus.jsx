import React from "react";
import { Activity, Database, BarChart3, Brain, Clock } from "lucide-react";

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

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-green-500" />
        <h3 className="text-sm font-semibold text-gray-700">Realtime Status</h3>
        <span className="flex items-center gap-1 ml-auto text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metrics Status */}
        <div className="border border-gray-100 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-600">Metrics Data</span>
            {isRefreshingMetrics && (
              <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Interval:</span>
              <span className="font-medium text-gray-700">{metricsInterval} detik</span>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Update berikutnya:</span>
              <span className={`font-medium ${nextMetricsUpdate <= 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                {nextMetricsUpdate}s
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${getProgressPercentage(nextMetricsUpdate, metricsInterval)}%` }}
              ></div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>Last: {formatTime(lastMetricsUpdate)}</span>
            </div>
          </div>
        </div>

        {/* Charts Status */}
        <div className="border border-gray-100 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-medium text-gray-600">Charts Data</span>
            {isRefreshingCharts && (
              <span className="ml-auto w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Interval:</span>
              <span className="font-medium text-gray-700">{chartsInterval} detik</span>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Update berikutnya:</span>
              <span className={`font-medium ${nextChartsUpdate <= 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                {nextChartsUpdate}s
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${getProgressPercentage(nextChartsUpdate, chartsInterval)}%` }}
              ></div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>Last: {formatTime(lastChartsUpdate)}</span>
            </div>
          </div>
        </div>

        {/* Insights Status */}
        <div className="border border-gray-100 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-medium text-gray-600">AI Insights</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Interval:</span>
              <span className="font-medium text-gray-700">{insightsInterval} detik</span>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Update berikutnya:</span>
              <span className={`font-medium ${nextInsightsUpdate <= 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                {nextInsightsUpdate}s
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${getProgressPercentage(nextInsightsUpdate, insightsInterval)}%` }}
              ></div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>Last: {formatTime(lastInsightsUpdate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Keterangan Interval */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          📊 <strong>Metrics</strong>: refresh setiap <strong>{metricsInterval} detik</strong> | 
          📈 <strong>Charts</strong>: refresh setiap <strong>{chartsInterval} detik</strong> | 
          🧠 <strong>Insights</strong>: refresh setiap <strong>{insightsInterval} detik</strong>
        </p>
      </div>
    </div>
  );
};

export default RealtimeStatus;
