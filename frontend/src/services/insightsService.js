import api from "./api";

export const insightsService = {
  async getInsight(developerId) {
    const response = await api.get(`/api/developers/${developerId}/insights`);
    if (response.data.status === "success") {
      return response.data.data.insight;
    }
    throw new Error("Failed to get insights");
  },

  async generateInsight(developerId) {
    const response = await api.post(`/api/developers/${developerId}/insights`);
    if (response.data.status === "success") {
      return response.data.data.insight;
    }
    throw new Error("Failed to generate insights");
  },
};
