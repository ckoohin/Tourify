const { query } = require('../../config/db');

class TourCategory {
  static async findAll(filters = {}) {
    let whereClauses = [];
    let params = [];

    if (filters.is_active !== undefined) {
      whereClauses.push('is_active = ?');
      params.push(filters.is_active);
    }

    if (filters.parent_id !== undefined) {
      if (filters.parent_id === null) {
        whereClauses.push('parent_id IS NULL');
      } else {
        whereClauses.push('parent_id = ?');
        params.push(filters.parent_id);
      }
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT 
        tc.*,
        parent.name as parent_name,
        COUNT(DISTINCT t.id) as total_tours
      FROM tour_categories tc
      LEFT JOIN tour_categories parent ON tc.parent_id = parent.id
      LEFT JOIN tours t ON t.category_id = tc.id
      ${whereClause}
      GROUP BY tc.id
      ORDER BY tc.display_order ASC, tc.created_at DESC
    `;

    return await query(sql, params);
  }

  static async getTree() {
    const categories = await this.findAll({ is_active: 1 });
    
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = { ...cat, children: [] };
    });

    const tree = [];
    categories.forEach(cat => {
      if (cat.parent_id) {
        if (categoryMap[cat.parent_id]) {
          categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
        }
      } else {
        tree.push(categoryMap[cat.id]);
      }
    });

    return tree;
  }

  static async findById(id) {
    const sql = `
      SELECT 
        tc.*,
        parent.name as parent_name,
        COUNT(DISTINCT t.id) as total_tours
      FROM tour_categories tc
      LEFT JOIN tour_categories parent ON tc.parent_id = parent.id
      LEFT JOIN tours t ON t.category_id = tc.id
      WHERE tc.id = ?
      GROUP BY tc.id
    `;
    
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async findBySlug(slug) {
    const sql = 'SELECT * FROM tour_categories WHERE slug = ?';
    const results = await query(sql, [slug]);
    return results[0] || null;
  }

  static async create(data) {
    const { name, slug, description, parent_id, display_order, is_active } = data;
    
    const sql = `
      INSERT INTO tour_categories (name, slug, description, parent_id, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [
      name,
      slug,
      description || null,
      parent_id || null,
      display_order || 0,
      is_active !== undefined ? is_active : 1
    ]);
    
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    const allowedFields = ['name', 'slug', 'description', 'parent_id', 'display_order', 'is_active'];
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const sql = `UPDATE tour_categories SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await query(sql, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const checkTours = await query(
      'SELECT COUNT(*) as count FROM tours WHERE category_id = ?',
      [id]
    );
    
    if (checkTours[0].count > 0) {
      throw new Error('Không thể xóa danh mục đang có tour');
    }

    const checkChildren = await query(
      'SELECT COUNT(*) as count FROM tour_categories WHERE parent_id = ?',
      [id]
    );
    
    if (checkChildren[0].count > 0) {
      throw new Error('Không thể xóa danh mục đang có danh mục con');
    }

    const sql = 'DELETE FROM tour_categories WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async getChildren(parentId) {
    const sql = `
      SELECT tc.*, COUNT(DISTINCT t.id) as total_tours
      FROM tour_categories tc
      LEFT JOIN tours t ON t.category_id = tc.id
      WHERE tc.parent_id = ?
      GROUP BY tc.id
      ORDER BY tc.display_order ASC
    `;
    
    return await query(sql, [parentId]);
  }

  static async updateOrder(orders) {
    const promises = orders.map(item => {
      return query(
        'UPDATE tour_categories SET display_order = ? WHERE id = ?',
        [item.display_order, item.id]
      );
    });
    
    await Promise.all(promises);
    return true;
  }

  static async slugExists(slug, excludeId = null) {
    let sql = 'SELECT COUNT(*) as count FROM tour_categories WHERE slug = ?';
    let params = [slug];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const result = await query(sql, params);
    return result[0].count > 0;
  }
}

module.exports = TourCategory;