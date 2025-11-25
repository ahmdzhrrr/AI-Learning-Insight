import api from "./api";

export const metricsService = {
  async getMetrics(developerId) {
    const response = await api.get(`/api/developers/${developerId}/metrics`);
    if (response.data.status === "success") {
      return response.data.data.metrics;
    }
    throw new Error("Failed to get metrics");
  },

  async updateMetrics(developerId, metrics) {
    const response = await api.put(
      `/api/developers/${developerId}/metrics`,
      metrics
    );
    if (response.data.status === "success") {
      return response.data.data.metrics;
    }
    throw new Error("Failed to update metrics");
  },
};
