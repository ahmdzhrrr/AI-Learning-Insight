import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getMetrics,
  getInsights,
  generateInsights,
  getStudyTimeData,
  getWeeklyProgressData,
  getHistoricalData,
} from "../services/auth";
import MetricCard from "../components/dashboard/MetricCard";
import AverageStudyTimeChart from "../components/dashboard/AverageStudyTimeChart";
import WeeklyProgressChart from "../components/dashboard/WeeklyProgressChart";
import HistoricalComparisonChart from "../components/dashboard/HistoricalComparisonChart";
import MetricsBreakdown from "../components/dashboard/MetricsBreakdown";
import RealtimeStatus from "../components/dashboard/RealtimeStatus";
import {
  Brain,
  RefreshCw,
  TrendingUp,
  Clock,
  Target,
  Award,
  AlertCircle,
} from "lucide-react";

// ============================================
// KONFIGURASI INTERVAL REALTIME (dalam detik)
// ============================================
const REALTIME_CONFIG = {
  METRICS_INTERVAL: 10, // Data metrics refresh setiap 30 detik
  INSIGHTS_INTERVAL: 10, // Insights refresh setiap 60 detik
  CHARTS_INTERVAL: 10, // Charts refresh setiap 45 detik
};

const Dashboard = () => {
  const { user, logout } = useAuth();

  // Ref untuk track apakah component masih mounted
  const isMounted = useRef(true);
  const intervalsRef = useRef([]);

  // State untuk data
  const [metrics, setMetrics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [studyTimeData, setStudyTimeData] = useState([]);
  const [weeklyProgressData, setWeeklyProgressData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);

  // State untuk loading dan error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  // State untuk realtime status
  const [lastMetricsUpdate, setLastMetricsUpdate] = useState(null);
  const [lastChartsUpdate, setLastChartsUpdate] = useState(null);
  const [lastInsightsUpdate, setLastInsightsUpdate] = useState(null);
  const [nextMetricsUpdate, setNextMetricsUpdate] = useState(
    REALTIME_CONFIG.METRICS_INTERVAL
  );
  const [nextChartsUpdate, setNextChartsUpdate] = useState(
    REALTIME_CONFIG.CHARTS_INTERVAL
  );
  const [nextInsightsUpdate, setNextInsightsUpdate] = useState(
    REALTIME_CONFIG.INSIGHTS_INTERVAL
  );
  const [isRefreshingMetrics, setIsRefreshingMetrics] = useState(false);
  const [isRefreshingCharts, setIsRefreshingCharts] = useState(false);

  // Clear all intervals
  const clearAllIntervals = useCallback(() => {
    intervalsRef.current.forEach((id) => clearInterval(id));
    intervalsRef.current = [];
  }, []);

  // Safe state update (hanya jika masih mounted)
  const safeSetState = useCallback((setter, value) => {
    if (isMounted.current) {
      setter(value);
    }
  }, []);

  // Handle auth error
  const handleAuthError = useCallback(
    (error) => {
      if (error?.isAuthError) {
        console.log(
          "🔐 Auth error detected in Dashboard, clearing intervals..."
        );
        clearAllIntervals();
        // Tidak perlu logout manual, interceptor sudah handle
        return true;
      }
      return false;
    },
    [clearAllIntervals]
  );

  // Fetch metrics - refresh setiap 30 detik
  const fetchMetrics = useCallback(
    async (showRefresh = false) => {
      if (!user?.id || !isMounted.current) return;

      try {
        if (showRefresh) safeSetState(setIsRefreshingMetrics, true);
        const metricsData = await getMetrics(user.id);

        if (isMounted.current && metricsData) {
          setMetrics(metricsData);
          setLastMetricsUpdate(new Date());
          setNextMetricsUpdate(REALTIME_CONFIG.METRICS_INTERVAL);
          setError(null);
        }
      } catch (error) {
        if (handleAuthError(error)) return;
        console.error("Error fetching metrics:", error);
      } finally {
        safeSetState(setIsRefreshingMetrics, false);
      }
    },
    [user?.id, safeSetState, handleAuthError]
  );

  // Fetch charts data - refresh setiap 45 detik
  const fetchChartsData = useCallback(
    async (showRefresh = false) => {
      if (!user?.id || !isMounted.current) return;

      try {
        if (showRefresh) safeSetState(setIsRefreshingCharts, true);

        const [studyTime, weeklyProgress, historical] = await Promise.all([
          getStudyTimeData(user.id),
          getWeeklyProgressData(user.id),
          getHistoricalData(user.id),
        ]);

        if (isMounted.current) {
          setStudyTimeData(studyTime || []);
          setWeeklyProgressData(weeklyProgress || []);
          setHistoricalData(historical || []);
          setLastChartsUpdate(new Date());
          setNextChartsUpdate(REALTIME_CONFIG.CHARTS_INTERVAL);
        }
      } catch (error) {
        if (handleAuthError(error)) return;
        console.error("Error fetching charts data:", error);
      } finally {
        safeSetState(setIsRefreshingCharts, false);
      }
    },
    [user?.id, safeSetState, handleAuthError]
  );

  // Fetch insights - refresh setiap 60 detik
  const fetchInsights = useCallback(async () => {
    if (!user?.id || !isMounted.current) return;

    try {
      const insightsData = await getInsights(user.id);

      if (isMounted.current && insightsData) {
        setInsights(insightsData);
        setLastInsightsUpdate(new Date());
        setNextInsightsUpdate(REALTIME_CONFIG.INSIGHTS_INTERVAL);
      }
    } catch (error) {
      if (handleAuthError(error)) return;
      console.error("Error fetching insights:", error);
    }
  }, [user?.id, handleAuthError]);

  // Initial data fetch
  const fetchInitialData = useCallback(async () => {
    if (!user?.id) return;

    try {
      safeSetState(setLoading, true);
      safeSetState(setError, null);

      console.log("📊 Fetching initial data for user:", user.id);

      // Fetch semua data secara parallel
      const [metricsData, studyTime, weeklyProgress, historical] =
        await Promise.all([
          getMetrics(user.id),
          getStudyTimeData(user.id),
          getWeeklyProgressData(user.id),
          getHistoricalData(user.id),
        ]);

      if (!isMounted.current) return;

      setMetrics(metricsData);
      setStudyTimeData(studyTime || []);
      setWeeklyProgressData(weeklyProgress || []);
      setHistoricalData(historical || []);

      const now = new Date();
      setLastMetricsUpdate(now);
      setLastChartsUpdate(now);

      // Generate insights
      console.log("🧠 Generating insights...");
      const newInsights = await generateInsights(user.id);

      if (isMounted.current && newInsights) {
        setInsights(newInsights);
        setLastInsightsUpdate(now);
      }

      console.log("✅ Initial data loaded successfully");
    } catch (error) {
      if (handleAuthError(error)) return;

      console.error("Error fetching initial data:", error);
      if (isMounted.current) {
        setError("Failed to load data. Please try refreshing the page.");
      }
    } finally {
      safeSetState(setLoading, false);
    }
  }, [user?.id, safeSetState, handleAuthError]);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      clearAllIntervals();
    };
  }, [clearAllIntervals]);

  // Initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchInitialData();
    }
  }, [user?.id, fetchInitialData]);

  // ============================================
  // REALTIME POLLING SETUP
  // ============================================
  useEffect(() => {
    if (loading || !user?.id || !isMounted.current) return;

    console.log("⏰ Setting up realtime polling intervals...");

    // Metrics polling (setiap 30 detik)
    const metricsInterval = setInterval(() => {
      console.log("🔄 Auto-refresh Metrics");
      fetchMetrics(true);
    }, REALTIME_CONFIG.METRICS_INTERVAL * 1000);

    const metricsCountdown = setInterval(() => {
      setNextMetricsUpdate((prev) =>
        prev <= 1 ? REALTIME_CONFIG.METRICS_INTERVAL : prev - 1
      );
    }, 1000);

    // Charts polling (setiap 45 detik)
    const chartsInterval = setInterval(() => {
      console.log("🔄 Auto-refresh Charts");
      fetchChartsData(true);
    }, REALTIME_CONFIG.CHARTS_INTERVAL * 1000);

    const chartsCountdown = setInterval(() => {
      setNextChartsUpdate((prev) =>
        prev <= 1 ? REALTIME_CONFIG.CHARTS_INTERVAL : prev - 1
      );
    }, 1000);

    // Insights polling (setiap 60 detik)
    const insightsInterval = setInterval(() => {
      console.log("🔄 Auto-refresh Insights");
      fetchInsights();
    }, REALTIME_CONFIG.INSIGHTS_INTERVAL * 1000);

    const insightsCountdown = setInterval(() => {
      setNextInsightsUpdate((prev) =>
        prev <= 1 ? REALTIME_CONFIG.INSIGHTS_INTERVAL : prev - 1
      );
    }, 1000);

    // Store interval IDs for cleanup
    intervalsRef.current = [
      metricsInterval,
      metricsCountdown,
      chartsInterval,
      chartsCountdown,
      insightsInterval,
      insightsCountdown,
    ];

    return () => {
      clearAllIntervals();
    };
  }, [
    loading,
    user?.id,
    fetchMetrics,
    fetchChartsData,
    fetchInsights,
    clearAllIntervals,
  ]);

  // Handle generate insights manually
  const handleGenerateInsights = async () => {
    if (!user?.id) return;

    try {
      setGeneratingInsights(true);
      await generateInsights(user.id);
      const latestInsight = await getInsights(user.id);

      if (isMounted.current && latestInsight) {
        setInsights(latestInsight);
        setLastInsightsUpdate(new Date());
        setNextInsightsUpdate(REALTIME_CONFIG.INSIGHTS_INTERVAL);
      }
    } catch (error) {
      if (handleAuthError(error)) return;
      console.error("Error generating insights:", error);
    } finally {
      safeSetState(setGeneratingInsights, false);
    }
  };

  // Manual refresh all data
  const handleRefreshAll = async () => {
    setError(null);
    await Promise.all([
      fetchMetrics(true),
      fetchChartsData(true),
      fetchInsights(),
    ]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefreshAll}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Learning Dashboard
            </h1>
            <p className="text-gray-600">
              Track your learning progress and insights
            </p>
          </div>

          {/* Tombol Refresh Manual */}
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshingMetrics || isRefreshingCharts}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isRefreshingMetrics || isRefreshingCharts ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Realtime Status Indicator */}
      <RealtimeStatus
        metricsInterval={REALTIME_CONFIG.METRICS_INTERVAL}
        chartsInterval={REALTIME_CONFIG.CHARTS_INTERVAL}
        insightsInterval={REALTIME_CONFIG.INSIGHTS_INTERVAL}
        nextMetricsUpdate={nextMetricsUpdate}
        nextChartsUpdate={nextChartsUpdate}
        nextInsightsUpdate={nextInsightsUpdate}
        lastMetricsUpdate={lastMetricsUpdate}
        lastChartsUpdate={lastChartsUpdate}
        lastInsightsUpdate={lastInsightsUpdate}
        isRefreshingMetrics={isRefreshingMetrics}
        isRefreshingCharts={isRefreshingCharts}
      />

      {/* Insights Section */}
      {insights && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <Brain className="h-6 w-6 mr-2" />
                <h2 className="text-xl font-semibold">
                  Your Learning Style: {insights.learning_style}
                </h2>
                {/* Indicator refresh insights */}
                <span className="ml-3 text-xs bg-white/20 px-2 py-1 rounded-full">
                  Update in {nextInsightsUpdate}s
                </span>
              </div>
              <p className="text-white/90 mb-4 whitespace-pre-line">
                {insights.insight_text}
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  Confidence: {(insights.confidence_score * 100).toFixed(0)}%
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  Cluster: {insights.label || insights.cluster_label || "N/A"}
                </span>
              </div>
            </div>

            {/* Button regenerate insights */}
            <button
              onClick={handleGenerateInsights}
              disabled={generatingInsights}
              className="ml-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
              title="Regenerate Insights"
            >
              <RefreshCw
                className={`h-5 w-5 ${
                  generatingInsights ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="relative">
          <MetricCard
            title="Active Days"
            value={metrics?.total_active_days || 0}
            icon={TrendingUp}
            color="blue"
          />
          {isRefreshingMetrics && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        <div className="relative">
          <MetricCard
            title="Avg Completion Time"
            value={`${metrics?.avg_completion_time_hours?.toFixed(1) || 0}h`}
            icon={Clock}
            color="green"
          />
          {isRefreshingMetrics && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        <div className="relative">
          <MetricCard
            title="Journeys Completed"
            value={metrics?.total_journeys_completed || 0}
            icon={Target}
            color="purple"
          />
          {isRefreshingMetrics && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        <div className="relative">
          <MetricCard
            title="Avg Exam Score"
            value={`${metrics?.avg_exam_score?.toFixed(1) || 0}%`}
            icon={Award}
            color="yellow"
          />
          {isRefreshingMetrics && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="relative">
          <AverageStudyTimeChart data={studyTimeData} />
          {isRefreshingCharts && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Updating...
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <WeeklyProgressChart data={weeklyProgressData} />
          {isRefreshingCharts && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Updating...
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative">
          <HistoricalComparisonChart data={historicalData} />
          {isRefreshingCharts && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Updating...
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <MetricsBreakdown metrics={metrics} />
          {isRefreshingMetrics && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Updating...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
