import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook untuk polling data secara realtime
 * @param {Function} fetchFunction - Fungsi untuk fetch data
 * @param {number} intervalSeconds - Interval polling dalam detik (default: 30)
 * @param {boolean} enabled - Apakah polling aktif
 */
export const useRealtimePolling = (fetchFunction, intervalSeconds = 30, enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nextUpdateIn, setNextUpdateIn] = useState(intervalSeconds);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  const fetchData = useCallback(async (isManual = false) => {
    try {
      if (isManual) {
        setIsRefreshing(true);
      }
      const result = await fetchFunction();
      setData(result);
      setLastUpdated(new Date());
      setNextUpdateIn(intervalSeconds);
      setError(null);
    } catch (err) {
      console.error("Polling fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchFunction, intervalSeconds]);

  // Manual refresh
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Initial fetch dan setup polling
  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchData();

    // Setup polling interval
    intervalRef.current = setInterval(() => {
      fetchData();
    }, intervalSeconds * 1000);

    // Setup countdown
    countdownRef.current = setInterval(() => {
      setNextUpdateIn((prev) => {
        if (prev <= 1) return intervalSeconds;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchData, intervalSeconds, enabled]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    nextUpdateIn,
    isRefreshing,
    refresh,
    intervalSeconds,
  };
};

export default useRealtimePolling;
