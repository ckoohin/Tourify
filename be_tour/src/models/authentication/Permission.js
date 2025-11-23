const { query } = require('../../config/db');

class PermissionModel {
  static async findAll(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM permissions';
    let countSql = 'SELECT COUNT(*) as total FROM permissions';
    const params = [];

    if (search) {
      sql += ' WHERE name LIKE ? OR description LIKE ?';
      countSql += ' WHERE name LIKE ? OR description LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY id DESC LIMIT ${limit} OFFSET ${offset} `;
    
    const permissions = await query(sql, [...params, limit, offset]);
    const countResult = await query(countSql, params);
    const total = countResult[0]?.total || 0;

    return { permissions, total };
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM permissions WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByName(name) {
    const rows = await query('SELECT * FROM permissions WHERE name = ?', [name]);
    return rows[0];
  }

  static async findBySlug(slug) {
    const rows = await query('SELECT * FROM permissions WHERE slug = ?', [slug]);
    return rows[0];
  }

  static async findByIds(ids) {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const rows = await query(
      `SELECT * FROM permissions WHERE id IN (${placeholders})`,
      ids
    );
    return rows;
  }

  static async create(data) {
    const result = await query(
      'INSERT INTO permissions (name, slug, description) VALUES (?, ?, ?)',
      [data.name, data.slug, data.description]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.slug !== undefined) {
      fields.push('slug = ?');
      values.push(data.slug);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }

    if (fields.length === 0) {
      return 0;
    }

    values.push(id);

    const result = await query(
      `UPDATE permissions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const result = await query('DELETE FROM permissions WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async isAssignedToRoles(id) {
    const rows = await query(
      'SELECT COUNT(*) as count FROM permission_role WHERE permission_id = ?',
      [id]
    );
    return rows[0]?.count > 0;
  }
}

module.exports = PermissionModel;