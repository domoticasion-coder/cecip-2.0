import { apiFetch } from "./api";
import { DashboardStats } from "../types";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return await apiFetch<DashboardStats>("/api/dashboard/stats");
  },
};
