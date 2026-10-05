import { IAuthRepository } from './auth.repository';
import { SignupDto } from './auth.types';
import { User } from '../../core/interfaces';
import { pool } from '../../database/pool';

export class SqlAuthRepository implements IAuthRepository {
  async findUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const query = `
      SELECT id, email, phone, first_name AS "firstName", last_name AS "lastName", role, created_at AS "createdAt", password_hash AS "passwordHash"
      FROM users
      WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }

  async findUserByPhone(phone: string): Promise<(User & { passwordHash: string }) | null> {
    const query = `
      SELECT id, email, phone, first_name AS "firstName", last_name AS "lastName", role, created_at AS "createdAt", password_hash AS "passwordHash"
      FROM users
      WHERE phone = $1
    `;
    const result = await pool.query(query, [phone]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }

  async findUserById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, phone, first_name AS "firstName", last_name AS "lastName", role, created_at AS "createdAt"
      FROM users
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }

  async createUser(dto: SignupDto & { passwordHash: string }): Promise<User> {
    const query = `
      INSERT INTO users (phone, email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, phone, email, first_name AS "firstName", last_name AS "lastName", role, created_at AS "createdAt"
    `;
    const result = await pool.query(query, [
      dto.mobile,
      dto.email || null,
      dto.passwordHash,
      dto.firstName,
      dto.lastName,
      'user'
    ]);
    return result.rows[0];
  }
}
