const { query } = require('../../config/db');

class Staff {
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClauses = [];
    let params = [];

    if (filters.staff_type) {
      whereClauses.push('s.staff_type = ?');
      params.push(filters.staff_type);
    }

    if (filters.status) {
      whereClauses.push('s.status = ?');
      params.push(filters.status);
    }

    if (filters.search) {
      whereClauses.push('(s.full_name LIKE ? OR s.phone LIKE ? OR s.email LIKE ? OR s.staff_code LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM staff s ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = countResult[0].total;

    const sql = `
      SELECT 
        s.*,
        u.email as user_email,
        u.name as user_name
      FROM staff s
      LEFT JOIN users u ON s.user_id = u.id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(limit, offset);
    const staffList = await query(sql, params);

    return {
      data: staffList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async findById(id) {
    const sql = `
      SELECT 
        s.*,
        u.email as user_email,
        u.name as user_name,
        u.is_active as user_is_active
      FROM staff s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `;
    
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async findByUserId(userId) {
    const sql = 'SELECT * FROM staff WHERE user_id = ?';
    const results = await query(sql, [userId]);
    return results[0] || null;
  }

  static async findByCode(code) {
    const sql = 'SELECT * FROM staff WHERE staff_code = ?';
    const results = await query(sql, [code]);
    return results[0] || null;
  }

  static async create(data) {
    const {
      user_id, staff_code, staff_type, full_name, birthday, gender,
      id_number, phone, email, address, languages, certifications,
      specializations, experience_years, driver_license_number,
      driver_license_class, vehicle_types, status, health_status, notes
    } = data;
    
    const sql = `
      INSERT INTO staff (
        user_id, staff_code, staff_type, full_name, birthday, gender,
        id_number, phone, email, address, languages, certifications,
        specializations, experience_years, driver_license_number,
        driver_license_class, vehicle_types, status, health_status, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [
      user_id || null,
      staff_code,
      staff_type,
      full_name,
      birthday || null,
      gender || null,
      id_number || null,
      phone,
      email || null,
      address || null,
      JSON.stringify(languages || []),
      JSON.stringify(certifications || []),
      JSON.stringify(specializations || []),
      experience_years || 0,
      driver_license_number || null,
      driver_license_class || null,
      JSON.stringify(vehicle_types || []),
      status || 'active',
      health_status || null,
      notes || null
    ]);
    
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    const allowedFields = [
      'user_id', 'staff_code', 'staff_type', 'full_name', 'birthday', 'gender',
      'id_number', 'phone', 'email', 'address', 'languages', 'certifications',
      'specializations', 'experience_years', 'driver_license_number',
      'driver_license_class', 'vehicle_types', 'status', 'health_status', 
      'notes', 'rating', 'total_tours'
    ];
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        if (['languages', 'certifications', 'specializations', 'vehicle_types'].includes(field)) {
          fields.push(`${field} = ?`);
          values.push(JSON.stringify(data[field]));
        } else {
          fields.push(`${field} = ?`);
          values.push(data[field]);
        }
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const sql = `UPDATE staff SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await query(sql, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const checkAssignments = await query(
      'SELECT COUNT(*) as count FROM staff_assignments WHERE staff_id = ?',
      [id]
    );
    
    if (checkAssignments[0].count > 0) {
      throw new Error('Không thể xóa nhân viên đã có lịch phân công');
    }

    const sql = 'DELETE FROM staff WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async findByType(type, status = 'active') {
    const sql = `
      SELECT s.*, u.email as user_email
      FROM staff s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.staff_type = ? AND s.status = ?
      ORDER BY s.full_name ASC
    `;
    
    return await query(sql, [type, status]);
  }

  static async getSchedule(staffId, startDate, endDate) {
    const sql = `
      SELECT 
        ss.*,
        td.departure_code,
        td.departure_date,
        td.return_date,
        t.name as tour_name
      FROM staff_schedules ss
      LEFT JOIN staff_assignments sa ON sa.staff_id = ss.staff_id 
        AND sa.assignment_date = ss.schedule_date
      LEFT JOIN tour_departures td ON sa.tour_departure_id = td.id
      LEFT JOIN tour_versions tv ON td.tour_version_id = tv.id
      LEFT JOIN tours t ON tv.tour_id = t.id
      WHERE ss.staff_id = ?
        AND ss.schedule_date BETWEEN ? AND ?
      ORDER BY ss.schedule_date ASC
    `;
    
    return await query(sql, [staffId, startDate, endDate]);
  }

  static async addSchedule(staffId, scheduleData) {
    const { schedule_date, schedule_type, start_time, end_time, notes } = scheduleData;
    
    const sql = `
      INSERT INTO staff_schedules (staff_id, schedule_date, schedule_type, start_time, end_time, notes)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        schedule_type = VALUES(schedule_type),
        start_time = VALUES(start_time),
        end_time = VALUES(end_time),
        notes = VALUES(notes)
    `;
    
    const result = await query(sql, [
      staffId,
      schedule_date,
      schedule_type,
      start_time || null,
      end_time || null,
      notes || null
    ]);
    
    return result.insertId || result.affectedRows > 0;
  }

  static async isAvailable(staffId, date) {
    const sql = `
      SELECT schedule_type
      FROM staff_schedules
      WHERE staff_id = ? AND schedule_date = ?
    `;
    
    const result = await query(sql, [staffId, date]);
    
    if (result.length === 0) return true; 
    
    const scheduleType = result[0].schedule_type;
    return scheduleType === 'available';
  }

  static async getStats(staffId) {
    const sql = `
      SELECT 
        COUNT(DISTINCT sa.tour_departure_id) as total_tours,
        AVG(s.rating) as avg_rating,
        COUNT(DISTINCT CASE WHEN td.status = 'completed' THEN sa.tour_departure_id END) as completed_tours,
        COUNT(DISTINCT CASE WHEN td.status = 'in_progress' THEN sa.tour_departure_id END) as ongoing_tours
      FROM staff s
      LEFT JOIN staff_assignments sa ON s.id = sa.staff_id
      LEFT JOIN tour_departures td ON sa.tour_departure_id = td.id
      WHERE s.id = ?
      GROUP BY s.id
    `;
    
    const results = await query(sql, [staffId]);
    return results[0] || null;
  }

  static async findAvailableStaff(startDate, endDate, staffType = null) {
    let typeCondition = staffType ? 'AND s.staff_type = ?' : '';
    let params = [startDate, endDate];
    
    if (staffType) {
      params.push(staffType);
    }

    const sql = `
      SELECT DISTINCT s.*
      FROM staff s
      WHERE s.status = 'active'
        ${typeCondition}
        AND s.id NOT IN (
          SELECT staff_id 
          FROM staff_schedules 
          WHERE schedule_date BETWEEN ? AND ?
            AND schedule_type IN ('busy', 'day_off', 'sick_leave', 'annual_leave')
        )
      ORDER BY s.rating DESC, s.total_tours ASC
    `;
    
    return await query(sql, params);
  }

  static async generateStaffCode(staffType) {
    const prefixes = {
      'tour_guide': 'HDV',
      'tour_leader': 'TL',
      'driver': 'TX',
      'coordinator': 'DH',
      'other': 'NV'
    };
    
    const prefix = prefixes[staffType] || 'NV';
    
    const sql = `
      SELECT staff_code 
      FROM staff 
      WHERE staff_code LIKE ?
      ORDER BY staff_code DESC 
      LIMIT 1
    `;
    
    const results = await query(sql, [`${prefix}%`]);
    
    if (results.length === 0) {
      return `${prefix}001`;
    }
    
    const lastCode = results[0].staff_code;
    const lastNumber = parseInt(lastCode.replace(prefix, ''));
    const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
    
    return `${prefix}${nextNumber}`;
  }
}

module.exports = Staff;