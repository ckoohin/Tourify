const { query } = require("../../config/db");

class ItineraryActivity {
  static async getByItinerary(itineraryId) {
    try {
      const sql = `
        SELECT 
          ia.*,
          ti.day_number,
          ti.title as day_title
        FROM itinerary_activities ia
        INNER JOIN tour_itineraries ti ON ia.itinerary_id = ti.id
        WHERE ia.itinerary_id = ?
        ORDER BY ia.activity_order ASC, ia.start_time ASC
      `;
      return await query(sql, [itineraryId]);
    } catch (error) {
      throw error;
    }
  }

  static async getByTourVersion(tourVersionId) {
    try {
      const sql = `
        SELECT 
          ia.*,
          ti.day_number,
          ti.title as day_title,
          ti.tour_version_id
        FROM itinerary_activities ia
        INNER JOIN tour_itineraries ti ON ia.itinerary_id = ti.id
        WHERE ti.tour_version_id = ?
        ORDER BY ti.day_number ASC, ia.activity_order ASC, ia.start_time ASC
      `;
      return await query(sql, [tourVersionId]);
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const sql = `
        SELECT 
          ia.*,
          ti.day_number,
          ti.title as day_title,
          ti.tour_version_id
        FROM itinerary_activities ia
        INNER JOIN tour_itineraries ti ON ia.itinerary_id = ti.id
        WHERE ia.id = ?
      `;
      const [activity] = await query(sql, [id]);
      return activity || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const {
        itinerary_id,
        activity_order,
        activity_name,
        activity_type,
        location,
        start_time,
        end_time,
        duration_minutes,
        description,
        check_in_required,
        check_in_window_before,
        check_in_window_after,
        auto_check_in,
        notes
      } = data;

      const sql = `
        INSERT INTO itinerary_activities (
          itinerary_id,
          activity_order,
          activity_name,
          activity_type,
          location,
          start_time,
          end_time,
          duration_minutes,
          description,
          check_in_required,
          check_in_window_before,
          check_in_window_after,
          auto_check_in,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await query(sql, [
        itinerary_id,
        activity_order,
        activity_name,
        activity_type,
        location || null,
        start_time,
        end_time || null,
        duration_minutes || null,
        description || null,
        check_in_required || 0,
        check_in_window_before || 30,
        check_in_window_after || 15,
        auto_check_in || 0,
        notes || null
      ]);

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const {
        activity_order,
        activity_name,
        activity_type,
        activity_status,
        location,
        start_time,
        end_time,
        duration_minutes,
        description,
        check_in_required,
        check_in_window_before,
        check_in_window_after,
        auto_check_in,
        notes
      } = data;

      const sql = `
        UPDATE itinerary_activities
        SET 
          activity_order = ?,
          activity_name = ?,
          activity_type = ?,
          activity_status = ?,
          location = ?,
          start_time = ?,
          end_time = ?,
          duration_minutes = ?,
          description = ?,
          check_in_required = ?,
          check_in_window_before = ?,
          check_in_window_after = ?,
          auto_check_in = ?,
          notes = ?
        WHERE id = ?
      `;

      await query(sql, [
        activity_order,
        activity_name,
        activity_type,
        activity_status,
        location || null,
        start_time,
        end_time || null,
        duration_minutes || null,
        description || null,
        check_in_required,
        check_in_window_before,
        check_in_window_after,
        auto_check_in,
        notes || null,
        id
      ]);

      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const sql = "DELETE FROM itinerary_activities WHERE id = ?";
      const result = await query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async deleteByItinerary(itineraryId) {
    try {
      const sql = "DELETE FROM itinerary_activities WHERE itinerary_id = ?";
      const result = await query(sql, [itineraryId]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async getCheckInActivitiesInTimeRange(departureId, startDate, endDate) {
    try {
      const sql = `
        SELECT 
          ia.*,
          ti.day_number,
          ti.title as day_title,
          tv.tour_id,
          DATE_ADD(td.departure_date, INTERVAL (ti.day_number - 1) DAY) as activity_date
        FROM itinerary_activities ia
        INNER JOIN tour_itineraries ti ON ia.itinerary_id = ti.id
        INNER JOIN tour_versions tv ON ti.tour_version_id = tv.id
        INNER JOIN tour_departures td ON td.tour_version_id = tv.id
        WHERE td.id = ?
          AND ia.check_in_required = 1
          AND DATE_ADD(td.departure_date, INTERVAL (ti.day_number - 1) DAY) BETWEEN ? AND ?
        ORDER BY ti.day_number ASC, ia.start_time ASC
      `;
      return await query(sql, [departureId, startDate, endDate]);
    } catch (error) {
      throw error;
    }
  }

  static async isActivityOrderExists(itineraryId, activityOrder, excludeId = null) {
    try {
      let sql = `
        SELECT id 
        FROM itinerary_activities 
        WHERE itinerary_id = ? AND activity_order = ?
      `;
      const params = [itineraryId, activityOrder];

      if (excludeId) {
        sql += " AND id != ?";
        params.push(excludeId);
      }

      const results = await query(sql, params);
      return results.length > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      const validStatuses = ['not_started', 'in_progress', 'closed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Trạng thái không hợp lệ');
      }

      const sql = `
        UPDATE itinerary_activities
        SET activity_status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      await query(sql, [status, id]);
      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  static async autoUpdateActivityStatus(departureId) {
    try {
      const now = new Date();
      
      await query(`
        UPDATE itinerary_activities ia
        INNER JOIN tour_itineraries ti ON ia.itinerary_id = ti.id
        INNER JOIN tour_versions tv ON ti.tour_version_id = tv.id
        INNER JOIN tour_departures td ON td.tour_version_id = tv.id
        SET ia.activity_status = 'in_progress'
        WHERE td.id = ?
          AND ia.activity_status = 'not_started'
          AND CONCAT(
            DATE_ADD(td.departure_date, INTERVAL (ti.day_number - 1) DAY),
            ' ',
            ia.start_time
          ) <= NOW()
          AND (
            ia.end_time IS NULL 
            OR CONCAT(
              DATE_ADD(td.departure_date, INTERVAL (ti.day_number - 1) DAY),
              ' ',
              ia.end_time
            ) >= NOW()
          )
      `, [departureId]);

      await query(`
        UPDATE itinerary_activities ia
        INNER JOIN tour_itineraries ti ON ia.itinerary_id = ti.id
        INNER JOIN tour_versions tv ON ti.tour_version_id = tv.id
        INNER JOIN tour_departures td ON td.tour_version_id = tv.id
        SET ia.activity_status = 'closed'
        WHERE td.id = ?
          AND ia.activity_status IN ('not_started', 'in_progress')
          AND ia.end_time IS NOT NULL
          AND CONCAT(
            DATE_ADD(td.departure_date, INTERVAL (ti.day_number - 1) DAY),
            ' ',
            ia.end_time
          ) < NOW()
      `, [departureId]);

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getActivitiesByDepartureDate(departureId, targetDate) {
    try {
      const sql = `
        SELECT 
          ia.*,
          ti.day_number,
          ti.title as day_title,
          DATE_ADD(td.departure_date, INTERVAL (ti.day_number - 1) DAY) as activity_date,
          CONCAT(
            DATE_ADD(td.departure_date, INTERVAL (ti.day_number - 1) DAY),
            ' ',
            ia.start_time
          ) as activity_datetime
        FROM itinerary_activities ia
        INNER JOIN tour_itineraries ti ON ia.itinerary_id = ti.id
        INNER JOIN tour_versions tv ON ti.tour_version_id = tv.id
        INNER JOIN tour_departures td ON td.tour_version_id = tv.id
        WHERE td.id = ?
          AND DATE_ADD(td.departure_date, INTERVAL (ti.day_number - 1) DAY) = ?
          AND ia.activity_status != 'cancelled'
        ORDER BY ia.start_time ASC
      `;
      return await query(sql, [departureId, targetDate]);
    } catch (error) {
      throw error;
    }
  }

  static async getTodayCheckInableActivities(departureId) {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const sql = `
        SELECT 
            ia.id,
            ia.activity_name,
            ia.activity_type,
            ia.location,
            ia.start_time,
            ia.end_time,
            ia.check_in_required,
            ia.check_in_window_before,
            ia.check_in_window_after,
            ia.activity_status,
            
            ANY_VALUE(ti.day_number) as day_number,
            ANY_VALUE(ti.title) as day_title,
            ANY_VALUE(td.departure_date) as departure_date,
            
            -- Tính ngày hoạt động
            DATE_ADD(ANY_VALUE(td.departure_date), INTERVAL (ANY_VALUE(ti.day_number) - 1) DAY) as activity_date,
            
            -- Thời gian bắt đầu đầy đủ
            CONCAT(
            DATE_ADD(ANY_VALUE(td.departure_date), INTERVAL (ANY_VALUE(ti.day_number) - 1) DAY),
            ' ',
            ia.start_time
            ) as activity_datetime,

            -- Thống kê check-in
            COUNT(gac.id) as total_guests,
            SUM(CASE WHEN gac.check_in_status = 'pending' THEN 1 ELSE 0 END) as pending_checkins,
            SUM(CASE WHEN gac.check_in_status = 'checked_in' THEN 1 ELSE 0 END) as completed_checkins,
            SUM(CASE WHEN gac.check_in_status = 'missed' THEN 1 ELSE 0 END) as missed_checkins,
            SUM(CASE WHEN gac.check_in_status = 'excused' THEN 1 ELSE 0 END) as excused_checkins

        FROM itinerary_activities ia
        INNER JOIN tour_itineraries ti ON ia.itinerary_id = ti.id
        INNER JOIN tour_versions tv ON ti.tour_version_id = tv.id
        INNER JOIN tour_departures td ON td.tour_version_id = tv.id
        LEFT JOIN guest_activity_checkins gac 
            ON gac.itinerary_activity_id = ia.id 
            AND gac.tour_departure_id = td.id
            AND gac.activity_date = CURDATE()

        WHERE td.id = ?
            AND ia.check_in_required = 1
            AND ia.activity_status IN ('not_started', 'in_progress')
            AND DATE_ADD(td.departure_date, INTERVAL (ti.day_number - 1) DAY) = ?

        GROUP BY ia.id, ia.start_time -- thêm start_time để ORDER BY ổn định

        ORDER BY ia.start_time ASC
        `;

        const results = await query(sql, [departureId, today]);

        return results;
    } catch (error) {
        console.error('Lỗi getTodayCheckInableActivities:', error.message);
        throw error;
    }
    }
}

module.exports = ItineraryActivity;