import { IAnalyticsRepository } from './analytics.repository';
import { RawAnalyticsEntity, RawDistribution, RawChartData } from './analytics.types';
import { pool } from '../../database/pool';

export class SqlAnalyticsRepository implements IAnalyticsRepository {
  async getAnalyticsSummary(): Promise<RawAnalyticsEntity> {
    const client = await pool.connect();
    
    try {
      // 1. Total detections
      const totalDetectionsRes = await client.query(`SELECT COUNT(*) FROM detections`);
      const totalDetections = parseInt(totalDetectionsRes.rows[0].count, 10);
      
      // 2. Unresolved Alerts & Critical Incidents
      const alertsRes = await client.query(`
        SELECT severity, COUNT(*) 
        FROM alerts 
        GROUP BY severity
      `);
      
      let unresolvedAlerts = 0;
      let criticalIncidents = 0;
      
      alertsRes.rows.forEach(r => {
        const count = parseInt(r.count, 10);
        unresolvedAlerts += count; // Assuming all are unresolved for this iteration
        if (r.severity === 'Critical' || r.severity === 'CRITICAL') {
          criticalIncidents += count;
        }
      });

      // 3. Animal Distribution
      const distRes = await client.query(`
        SELECT animal_type, COUNT(*) 
        FROM detections 
        GROUP BY animal_type
      `);
      
      const animalDistribution: RawDistribution[] = distRes.rows.map(r => ({
        category: r.animal_type,
        count: parseInt(r.count, 10)
      }));

      // 4. Confidence Distribution
      const confRes = await client.query(`
        SELECT 
          CASE 
            WHEN confidence >= 0.9 THEN '90-100%'
            WHEN confidence >= 0.75 THEN '75-89%'
            WHEN confidence >= 0.5 THEN '50-74%'
            ELSE '<50%'
          END as bracket,
          COUNT(*) as count
        FROM detections
        GROUP BY bracket
      `);
      
      const confidenceDistribution: RawDistribution[] = confRes.rows.map(r => ({
        category: r.bracket,
        count: parseInt(r.count, 10)
      }));

      // 5. Peak Hours (simplified)
      const peakHoursRes = await client.query(`
        SELECT to_char(created_at, 'HH24:00') as hour_str, COUNT(*) as count
        FROM detections
        GROUP BY hour_str
        ORDER BY count DESC
        LIMIT 3
      `);
      
      const peakHours = peakHoursRes.rows.map(r => r.hour_str);

      // 6. Trends
      // Weekly trend (last 7 days)
      const weeklyQuery = `
        SELECT to_char(created_at, 'Dy') as day_label, COUNT(*) as count 
        FROM detections 
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 days' 
        GROUP BY day_label, DATE(created_at)
        ORDER BY DATE(created_at)
      `;
      const weeklyRes = await client.query(weeklyQuery);
      const weekly: RawChartData = {
        labels: weeklyRes.rows.map(r => r.day_label),
        data: weeklyRes.rows.map(r => parseInt(r.count, 10))
      };

      // Daily trend (last 24 hours)
      const dailyQuery = `
        SELECT to_char(created_at, 'HH24:00') as time_label, COUNT(*) as count 
        FROM detections 
        WHERE created_at >= NOW() - INTERVAL '24 hours' 
        GROUP BY time_label 
        ORDER BY time_label
      `;
      const dailyRes = await client.query(dailyQuery);
      const daily: RawChartData = {
        labels: dailyRes.rows.map(r => r.time_label),
        data: dailyRes.rows.map(r => parseInt(r.count, 10))
      };

      // Monthly trend (last 4 weeks)
      const monthlyQuery = `
        SELECT to_char(created_at, 'W') as week_num, COUNT(*) as count 
        FROM detections 
        WHERE created_at >= NOW() - INTERVAL '1 month' 
        GROUP BY week_num 
        ORDER BY week_num
      `;
      const monthlyRes = await client.query(monthlyQuery);
      let monthly: RawChartData = {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        data: [0, 0, 0, 0]
      };
      
      if (monthlyRes.rows.length > 0) {
        const labels = monthlyRes.rows.map(r => `Week ${r.week_num}`);
        const data = monthlyRes.rows.map(r => parseInt(r.count, 10));
        monthly = { labels, data };
      }

      return {
        totalDetections,
        unresolvedAlerts,
        criticalIncidents,
        animalDistribution,
        confidenceDistribution,
        peakHours: peakHours.length > 0 ? peakHours : ['18:00', '20:00', '22:00'],
        trends: {
          daily: daily.labels.length > 0 ? daily : { labels: ["00:00"], data: [0] },
          weekly: weekly.labels.length > 0 ? weekly : { labels: ["Mon"], data: [0] },
          monthly
        }
      };
    } finally {
      client.release();
    }
  }
}
