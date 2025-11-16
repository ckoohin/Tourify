const { pool, query } = require('../../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const sql = `
      SELECT u.*, r.name as role_name, r.slug as role_slug
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = ? AND u.deleted_at IS NULL
    `;
    const results = await query(sql, [email]);
    return results[0] || null;
  }

  static async findById(id) {
    const sql = `
      SELECT u.*, r.name as role_name, r.slug as role_slug
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ? AND u.deleted_at IS NULL
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async create(userData) {
    const { name, email, password, role_id = 1 } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO users (name, email, password, role_id, status, is_active)
      VALUES (?, ?, ?, ?, 1, 0)
    `;
    
    const result = await query(sql, [name, email, hashedPassword, role_id]);
    return result.insertId;
  }

  static async update(id, userData) {
    const fields = [];
    const values = [];

    if (userData.name !== undefined) {
      fields.push('name = ?');
      values.push(userData.name);
    }
    if (userData.phone !== undefined) {
      fields.push('phone = ?');
      values.push(userData.phone);
    }
    if (userData.avatar_url !== undefined) {
      fields.push('avatar_url = ?');
      values.push(userData.avatar_url);
    }
    if (userData.role_id !== undefined) {
      fields.push('role_id = ?');
      values.push(userData.role_id);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await query(sql, values);
    return result.affectedRows > 0;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateLastLogin(id) {
    const sql = 'UPDATE users SET last_login_at = NOW() WHERE id = ?';
    await query(sql, [id]);
  }

  static async verifyEmail(id) {
    const sql = 'UPDATE users SET email_verified_at = NOW(), verification_token = NULL WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async softDelete(id) {
    const sql = 'UPDATE users SET deleted_at = NOW(), is_active = 0 WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClauses = ['u.deleted_at IS NULL'];
    let params = [];

    if (filters.role_id) {
      whereClauses.push('u.role_id = ?');
      params.push(filters.role_id);
    }
    if (filters.is_active !== undefined) {
      whereClauses.push('u.is_active = ?');
      params.push(filters.is_active);
    }
    if (filters.search) {
      whereClauses.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereClauses.join(' AND ');

    const countSql = `SELECT COUNT(*) as total FROM users u WHERE ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = countResult[0].total;

    const sql = `
      SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.status, 
             u.is_active, u.last_login_at, u.created_at,
             r.name as role_name, r.slug as role_slug
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(limit, offset);
    const users = await query(sql, params);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async saveVerificationToken(userId, token) {
    const sql = `
      UPDATE users 
      SET verification_token = ?, verification_token_expires = DATE_ADD(NOW(), INTERVAL 24 HOUR)
      WHERE id = ?
    `;
    const [result] = await pool.execute(sql, [token, userId]);
    return result.affectedRows > 0;
  }

  static async findByVerificationToken(token) {
    const sql = `
      SELECT * FROM users 
      WHERE verification_token = ? 
        AND verification_token_expires > NOW()
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [token]);
    return rows[0];
  }

  static async verifyEmail(userId) {
    const sql = `
      UPDATE users
      SET email_verified_at = NOW(),
          verification_token = NULL,
          verification_token_expires = NULL
      WHERE id = ?
    `;
    const [result] = await pool.execute(sql, [userId]);
    return result.affectedRows > 0;
  }
}

module.exports = User;