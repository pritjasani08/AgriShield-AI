import { ApiClient } from "../lib/api";

import { DashboardSummaryDto } from "../../../backend/src/modules/dashboard/dashboard.types";

export class DashboardService {
  static async getSummary() {
    const data = await ApiClient.get<DashboardSummaryDto>("/dashboard/summary");
    return DashboardService.mapDashboardResponse(data);
  }

  static mapDashboardResponse(data: DashboardSummaryDto) {
    const dailyTrend = data.charts.dailyTrend.labels.map((label, i) => ({
      day: label,
      intrusions: data.charts.dailyTrend.series[i] || 0,
    }));

    const weeklyActivity = data.charts.weeklyTrend.labels.map((label, i) => ({
      week: label,
      intrusions: data.charts.weeklyTrend.series[i] || 0,
      deterred: Math.floor((data.charts.weeklyTrend.series[i] || 0) * 0.8),
    }));

    const monthlyActivity = data.charts.monthlyTrend.labels.map((label, i) => ({
      month: label,
      intrusions: data.charts.monthlyTrend.series[i] || 0,
    }));

    const distribution = data.charts.animalDistribution.map((d) => ({
      name: d.species,
      value: d.value,
    }));

    return {
      ...data,
      dailyTrend,
      weeklyActivity,
      monthlyActivity,
      distribution,
      recentAlerts: data.recentAlerts || [],
    };
  }
}
