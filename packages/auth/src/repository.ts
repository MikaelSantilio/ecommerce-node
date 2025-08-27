import bcrypt from 'bcrypt';
import pool from './database';
import { User, CreateUserRequest } from './types';

export class UserRepository {
  static async createUser(userData: CreateUserRequest): Promise<User> {
    const { email, password } = userData;
    const passwordHash = await bcrypt.hash(password, 12);

    const query = `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email, created_at, updated_at
    `;

    const values = [email, passwordHash];
    const result = await pool.query(query, values);

    return {
      id: result.rows[0].id,
      email: result.rows[0].email,
      password_hash: passwordHash,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at,
    };
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password_hash: row.password_hash,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  static async findById(id: number): Promise<User | null> {
    const query = 'SELECT id, email, created_at, updated_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password_hash: '', // Não retornar hash da senha
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
