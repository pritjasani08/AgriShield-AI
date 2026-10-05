import { ICommunityRepository } from './community.repository';
import { CommunityPostDto, CreateCommunityPostDto } from './community.types';
import { query } from '../../database';
import { logger } from '../../core/utils/logger';

export class SqlCommunityRepository implements ICommunityRepository {
  async getPosts(userId: string, limit: number = 20, offset: number = 0): Promise<CommunityPostDto[]> {
    const sql = `
      SELECT 
        cp.*,
        u.first_name || ' ' || u.last_name AS user_name,
        EXISTS(SELECT 1 FROM community_likes cl WHERE cl.post_id = cp.id AND cl.user_id = $1) as is_liked_by_me
      FROM community_posts cp
      JOIN users u ON cp.user_id = u.id
      ORDER BY cp.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [userId, limit, offset]);
    
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      content: row.content,
      animalType: row.animal_type,
      distance: row.distance,
      side: row.side,
      imageUrl: row.image_url,
      likesCount: row.likes_count,
      isLikedByMe: row.is_liked_by_me,
      createdAt: row.created_at,
    }));
  }

  async createPost(userId: string, data: CreateCommunityPostDto): Promise<CommunityPostDto> {
    const sql = `
      INSERT INTO community_posts (user_id, content, animal_type, distance, side, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      userId,
      data.content,
      data.animalType || null,
      data.distance || null,
      data.side || null,
      data.imageUrl || null
    ];
    
    const result = await query(sql, values);
    const row = result.rows[0];
    
    // Fetch user name
    const userSql = `SELECT first_name || ' ' || last_name AS user_name FROM users WHERE id = $1`;
    const userResult = await query(userSql, [userId]);
    const userName = userResult.rows[0]?.user_name || 'Unknown User';

    return {
      id: row.id,
      userId: row.user_id,
      userName,
      content: row.content,
      animalType: row.animal_type,
      distance: row.distance,
      side: row.side,
      imageUrl: row.image_url,
      likesCount: row.likes_count,
      isLikedByMe: false,
      createdAt: row.created_at,
    };
  }

  async likePost(postId: string, userId: string): Promise<boolean> {
    const checkSql = `SELECT 1 FROM community_likes WHERE post_id = $1 AND user_id = $2`;
    const checkResult = await query(checkSql, [postId, userId]);

    if (checkResult.rowCount && checkResult.rowCount > 0) {
      // Unlike
      await query(`DELETE FROM community_likes WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
      await query(`UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = $1`, [postId]);
      return false;
    } else {
      // Like
      await query(`INSERT INTO community_likes (post_id, user_id) VALUES ($1, $2)`, [postId, userId]);
      await query(`UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = $1`, [postId]);
      return true;
    }
  }
}
