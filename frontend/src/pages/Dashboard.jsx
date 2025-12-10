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
  Sparkles,
  Zap,
  ChevronRight,
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          {/* Animated Loading */}
          <div className="relative mb-8">
            {/* Outer Ring */}
            <div className="w-20 h-20 mx-auto border-4 border-primary/20 rounded-full" />
            {/* Spinning Ring */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 border-4 border-transparent border-t-primary rounded-full animate-spin" />
            {/* Center Icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <Brain className="h-6 w-6 text-white animate-pulse" />
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold gradient-text mb-2">
            Loading Dashboard
          </h3>
          <p className="text-gray-500 text-sm">
            Preparing your learning analytics...
          </p>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 mt-4">
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

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto px-4">
          {/* Error Illustration */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            {/* Decorative rings */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-dashed border-red-200 rounded-full animate-spin"
              style={{ animationDuration: "10s" }}
            />
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-500 mb-6">{error}</p>

          <button
            onClick={handleRefreshAll}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-white btn-primary shadow-lg shadow-primary/25"
          >
            <RefreshCw className="h-5 w-5" />
            <span className="font-medium">Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="animate-[fadeInLeft_0.6s_ease-out]">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
              Learning Dashboard
            </h1>
          </div>
          <p className="text-gray-500 flex items-center space-x-2">
            <span>Track your learning progress and insights</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-primary font-medium">
              Welcome back, {user?.name || "Learner"}!
            </span>
          </p>
        </div>

        {/* Refresh Button */}
        {/* <button
          onClick={handleRefreshAll}
          disabled={isRefreshingMetrics || isRefreshingCharts}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-white btn-primary shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed animate-[fadeInRight_0.6s_ease-out]"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isRefreshingMetrics || isRefreshingCharts ? "animate-spin" : ""
            }`}
          />
          <span className="font-medium">Refresh All</span>
        </button> */}
      </div>

      {/* Realtime Status Indicator */}
      <div className="animate-[fadeInUp_0.6s_ease-out] delay-100">
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
      </div>

      {/* Insights Section */}
      {insights && (
        <div className="animate-[fadeInUp_0.6s_ease-out] delay-200">
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-secondary" />

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Your Learning Style
                      </h2>
                      <p className="text-white/70 text-sm">
                        {insights.learning_style}
                      </p>
                    </div>

                    {/* Update Timer Badge */}
                    <span className="hidden sm:inline-flex items-center space-x-1 ml-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-xs">
                      <Zap className="h-3 w-3" />
                      <span>Update in {nextInsightsUpdate}s</span>
                    </span>
                  </div>

                  {/* Insight Text */}
                  <p className="text-white/90 leading-relaxed mb-6 whitespace-pre-line">
                    {insights.insight_text}
                  </p>

                  {/* Stats Badges */}
                  <div className="flex flex-wrap gap-3">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-white text-sm font-medium">
                        Confidence:{" "}
                        {(insights.confidence_score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-white text-sm font-medium">
                        Cluster:{" "}
                        {insights.label || insights.cluster_label || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Regenerate Button */}
                <button
                  onClick={handleGenerateInsights}
                  disabled={generatingInsights}
                  className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all duration-300 disabled:opacity-50 group"
                >
                  <RefreshCw
                    className={`h-5 w-5 ${
                      generatingInsights
                        ? "animate-spin"
                        : "group-hover:rotate-180 transition-transform duration-500"
                    }`}
                  />
                  <span className="font-medium">Regenerate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          {
            title: "Active Days",
            value: metrics?.total_active_days || 0,
            icon: TrendingUp,
            color: "primary",
            delay: 300,
          },
          {
            title: "Avg Completion Time",
            value: `${metrics?.avg_completion_time_hours?.toFixed(1) || 0}h`,
            icon: Clock,
            color: "emerald",
            delay: 400,
          },
          {
            title: "Journeys Completed",
            value: metrics?.total_journeys_completed || 0,
            icon: Target,
            color: "cyan",
            delay: 500,
          },
          {
            title: "Avg Exam Score",
            value: `${metrics?.avg_exam_score?.toFixed(1) || 0}%`,
            icon: Award,
            color: "amber",
            delay: 600,
          },
        ].map((metric, index) => (
          <div
            key={index}
            className="relative animate-[fadeInUp_0.6s_ease-out]"
            style={{ animationDelay: `${metric.delay}ms` }}
          >
            <MetricCard
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              color={metric.color}
            />
            {isRefreshingMetrics && (
              <div className="absolute top-3 right-3">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Grid - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="relative animate-[fadeInUp_0.6s_ease-out]"
          style={{ animationDelay: "700ms" }}
        >
          <AverageStudyTimeChart data={studyTimeData} />
          {isRefreshingCharts && (
            <div className="absolute top-5 right-5">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-gray-600 font-medium">
                  Updating...
                </span>
              </div>
            </div>
          )}
        </div>

        <div
          className="relative animate-[fadeInUp_0.6s_ease-out]"
          style={{ animationDelay: "800ms" }}
        >
          <WeeklyProgressChart data={weeklyProgressData} />
          {isRefreshingCharts && (
            <div className="absolute top-5 right-5">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-gray-600 font-medium">
                  Updating...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="relative animate-[fadeInUp_0.6s_ease-out]"
          style={{ animationDelay: "900ms" }}
        >
          <HistoricalComparisonChart data={historicalData} />
          {isRefreshingCharts && (
            <div className="absolute top-5 right-5">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-gray-600 font-medium">
                  Updating...
                </span>
              </div>
            </div>
          )}
        </div>

        <div
          className="relative animate-[fadeInUp_0.6s_ease-out]"
          style={{ animationDelay: "1000ms" }}
        >
          <MetricsBreakdown metrics={metrics} />
          {isRefreshingMetrics && (
            <div className="absolute top-5 right-5">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-gray-600 font-medium">
                  Updating...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
