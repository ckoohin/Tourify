const { query } = require('../../config/db');

class StaffAssignment {
  static async create(data, createdBy) {
    try {
      const {
        tour_departure_id,
        staff_id,
        role,
        assignment_date,
        notes
      } = data;

      const busySql = `
        SELECT sa.id, td.departure_code, td.departure_date, td.return_date
        FROM staff_assignments sa
        INNER JOIN tour_departures td ON sa.tour_departure_id = td.id
        WHERE sa.staff_id = ?
        AND td.status NOT IN ('cancelled', 'completed')
        AND (
          (td.departure_date <= ? AND td.return_date >= ?)
          OR (td.departure_date <= ? AND td.return_date >= ?)
          OR (td.departure_date >= ? AND td.return_date <= ?)
        )
      `;

      const [currentDeparture] = await query(
        'SELECT departure_date, return_date FROM tour_departures WHERE id = ?',
        [tour_departure_id]
      );

      if (!currentDeparture) {
        throw new Error('Không tìm thấy lịch khởi hành');
      }

      const { departure_date, return_date } = currentDeparture;

      const busyCheck = await query(busySql, [
        staff_id,
        departure_date, departure_date,
        return_date, return_date,
        departure_date, return_date
      ]);

      if (busyCheck.length > 0) {
        throw new Error(`Nhân sự đã được phân công cho tour ${busyCheck[0].departure_code} trong khoảng thời gian này`);
      }

      const sql = `
        INSERT INTO staff_assignments (
          tour_departure_id,
          staff_id,
          role,
          assignment_date,
          notes,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      const result = await query(sql, [
        tour_departure_id,
        staff_id,
        role,
        assignment_date || new Date().toISOString().split('T')[0],
        notes || null,
        createdBy
      ]);

      return await this.getById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const sql = `
        SELECT 
          sa.*,
          s.staff_code,
          s.full_name,
          s.staff_type,
          s.phone,
          s.email,
          td.departure_code,
          td.departure_date,
          td.return_date,
          u.name as created_by_name
        FROM staff_assignments sa
        INNER JOIN staff s ON sa.staff_id = s.id
        INNER JOIN tour_departures td ON sa.tour_departure_id = td.id
        LEFT JOIN users u ON sa.created_by = u.id
        WHERE sa.id = ?
      `;

      const [assignment] = await query(sql, [id]);
      return assignment || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const { role, assignment_date, notes } = data;

      const sql = `
        UPDATE staff_assignments
        SET 
          role = ?,
          assignment_date = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await query(sql, [role, assignment_date, notes || null, id]);
      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  static async confirm(id) {
    try {
      const sql = `
        UPDATE staff_assignments
        SET 
          confirmed = 1,
          confirmed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      await query(sql, [id]);
      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const sql = 'DELETE FROM staff_assignments WHERE id = ?';
      await query(sql, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getStaffSchedule(staffId, { date_from, date_to }) {
    try {
      const sql = `
        SELECT 
          sa.id,
          sa.role,
          sa.confirmed,
          td.id as departure_id,
          td.departure_code,
          td.departure_date,
          td.return_date,
          td.status,
          t.name as tour_name,
          t.code as tour_code
        FROM staff_assignments sa
        INNER JOIN tour_departures td ON sa.tour_departure_id = td.id
        INNER JOIN tour_versions tv ON td.tour_version_id = tv.id
        INNER JOIN tours t ON tv.tour_id = t.id
        WHERE sa.staff_id = ?
        AND td.departure_date >= ?
        AND td.return_date <= ?
        AND td.status NOT IN ('cancelled')
        ORDER BY td.departure_date, td.departure_time
      `;

      const assignments = await query(sql, [staffId, date_from, date_to]);
      return assignments;
    } catch (error) {
      throw error;
    }
  }

  static async checkAvailability(staffId, departure_date, return_date) {
    try {
      const sql = `
        SELECT COUNT(*) as count
        FROM staff_assignments sa
        INNER JOIN tour_departures td ON sa.tour_departure_id = td.id
        WHERE sa.staff_id = ?
        AND td.status NOT IN ('cancelled', 'completed')
        AND (
          (td.departure_date <= ? AND td.return_date >= ?)
          OR (td.departure_date <= ? AND td.return_date >= ?)
          OR (td.departure_date >= ? AND td.return_date <= ?)
        )
      `;

      const [result] = await query(sql, [
        staffId,
        departure_date, departure_date,
        return_date, return_date,
        departure_date, return_date
      ]);

      return result.count === 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = StaffAssignment;