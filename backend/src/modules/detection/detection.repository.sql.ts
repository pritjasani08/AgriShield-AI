import { IDetectionRepository } from './detection.repository';
import { RawDetectionResult } from '../../core/providers/detection';
import { pool } from '../../database/pool';
import { RiskLevel } from '../../core/enums';

export class SqlDetectionRepository implements IDetectionRepository {
  async saveDetection(result: RawDetectionResult): Promise<{ id: string }> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const insertDetectionQuery = `
        INSERT INTO detections (animal_type, confidence, risk_level, bbox_x, bbox_y, bbox_w, bbox_h)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      
      const detectionRes = await client.query(insertDetectionQuery, [
        result.animalType,
        result.confidence,
        result.riskLevel,
        result.boundingBox.x,
        result.boundingBox.y,
        result.boundingBox.width,
        result.boundingBox.height
      ]);
      
      const detectionId = detectionRes.rows[0].id;
      
      // Conditionally create an alert for HIGH or CRITICAL risk
      if (result.riskLevel === RiskLevel.HIGH || result.riskLevel === RiskLevel.CRITICAL) {
        const severity = result.riskLevel === RiskLevel.CRITICAL ? 'Critical' : 'Warning';
        const message = `High risk detection: ${result.animalType} detected with ${Math.round(result.confidence * 100)}% confidence`;
        
        const insertAlertQuery = `
          INSERT INTO alerts (detection_id, message, severity)
          VALUES ($1, $2, $3)
        `;
        await client.query(insertAlertQuery, [detectionId, message, severity]);
      }
      
      await client.query('COMMIT');
      return { id: detectionId };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getHistory(limit: number, offset: number): Promise<any[]> {
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT id, animal_type, confidence, risk_level, created_at
        FROM detections
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);
      return res.rows;
    } finally {
      client.release();
    }
  }
}
