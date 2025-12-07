const { query } = require("../../config/db");

class GuestActivityCheckin {
  static async initializeCheckinsForDeparture(departureId) {
    try {
      const guests = await query(
        "SELECT id FROM tour_departure_guests WHERE tour_departure_id = ?",
        [departureId]
      );

      const activitiesSql = `
        SELECT 
          ia.id as activity_id,
          ia.itinerary_id,
          ti.day_number,
          ia.start_time,
          DATE_ADD(td.departure_date, INTERVAL (ti.day_number - 1) DAY) as activity_date
        FROM itinerary_activities ia
        INNER JOIN tour_itineraries ti ON ia.itinerary_id = ti.id
        INNER JOIN tour_versions tv ON ti.tour_version_id = tv.id
        INNER JOIN tour_departures td ON td.tour_version_id = tv.id
        WHERE td.id = ? AND ia.check_in_required = 1
        ORDER BY ti.day_number ASC, ia.start_time ASC
      `;
      const activities = await query(activitiesSql, [departureId]);

      const insertPromises = [];
      for (const guest of guests) {
        for (const activity of activities) {
          const insertSql = `
            INSERT IGNORE INTO guest_activity_checkins (
              tour_departure_id,
              tour_departure_guest_id,
              itinerary_activity_id,
              itinerary_id,
              day_number,
              activity_date,
              scheduled_time,
              check_in_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
          `;
          insertPromises.push(
            query(insertSql, [
              departureId,
              guest.id,
              activity.activity_id,
              activity.itinerary_id,
              activity.day_number,
              activity.activity_date,
              activity.start_time
            ])
          );
        }
      }

      await Promise.all(insertPromises);

      await query(`
        UPDATE tour_departure_guests tdg
        SET total_activities = (
          SELECT COUNT(*) 
          FROM guest_activity_checkins 
          WHERE tour_departure_guest_id = tdg.id
        )
        WHERE tour_departure_id = ?
      `, [departureId]);

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async checkInGuest(checkinId, checkedInBy, method = 'manual', location = null) {
    try {
      const locationLat = location?.lat || null;
      const locationLng = location?.lng || null;

      const sql = `
        UPDATE guest_activity_checkins
        SET 
          check_in_time = CURRENT_TIMESTAMP,
          check_in_status = 'checked_in',
          checked_in_by = ?,
          check_in_method = ?,
          location_lat = ?,
          location_lng = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND check_in_status = 'pending'
      `;

      const result = await query(sql, [
        checkedInBy,
        method,
        locationLat,
        locationLng,
        checkinId
      ]);

      if (result.affectedRows > 0) {
        await query(`
          UPDATE tour_departure_guests tdg
          SET checked_in_activities = (
            SELECT COUNT(*) 
            FROM guest_activity_checkins 
            WHERE tour_departure_guest_id = tdg.id 
              AND check_in_status = 'checked_in'
          )
          WHERE id = (
            SELECT tour_departure_guest_id 
            FROM guest_activity_checkins 
            WHERE id = ?
          )
        `, [checkinId]);

        return await this.getById(checkinId);
      }

      return null;
    } catch (error) {
      throw error;
    }
  }

  static async bulkCheckIn(activityId, guestIds, checkedInBy, method = 'manual') {
    try {
      const placeholders = guestIds.map(() => '?').join(',');
      const sql = `
        UPDATE guest_activity_checkins
        SET 
          check_in_time = CURRENT_TIMESTAMP,
          check_in_status = 'checked_in',
          checked_in_by = ?,
          check_in_method = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE itinerary_activity_id = ? 
          AND tour_departure_guest_id IN (${placeholders})
          AND check_in_status = 'pending'
      `;

      await query(sql, [checkedInBy, method, activityId, ...guestIds]);

      for (const guestId of guestIds) {
        await query(`
          UPDATE tour_departure_guests
          SET checked_in_activities = (
            SELECT COUNT(*) 
            FROM guest_activity_checkins 
            WHERE tour_departure_guest_id = ? 
              AND check_in_status = 'checked_in'
          )
          WHERE id = ?
        `, [guestId, guestId]);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async markExcused(checkinId, excuseReason) {
    try {
      const sql = `
        UPDATE guest_activity_checkins
        SET 
          check_in_status = 'excused',
          excuse_reason = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      await query(sql, [excuseReason, checkinId]);
      return await this.getById(checkinId);
    } catch (error) {
      throw error;
    }
  }

  static async autoMarkMissed() {
    try {
      const sql = `
        UPDATE guest_activity_checkins gac
        INNER JOIN itinerary_activities ia ON gac.itinerary_activity_id = ia.id
        SET 
          gac.check_in_status = 'missed',
          gac.updated_at = CURRENT_TIMESTAMP
        WHERE gac.check_in_status = 'pending'
          AND CONCAT(gac.activity_date, ' ', gac.scheduled_time) < 
              DATE_SUB(NOW(), INTERVAL ia.check_in_window_after MINUTE)
      `;
      const result = await query(sql);

      await query(`
        UPDATE tour_departure_guests tdg
        SET missed_activities = (
          SELECT COUNT(*) 
          FROM guest_activity_checkins 
          WHERE tour_departure_guest_id = tdg.id 
            AND check_in_status = 'missed'
        )
      `);

      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async autoCheckIn() {
    try {
      const sql = `
        UPDATE guest_activity_checkins gac
        INNER JOIN itinerary_activities ia ON gac.itinerary_activity_id = ia.id
        SET 
          gac.check_in_time = CURRENT_TIMESTAMP,
          gac.check_in_status = 'auto_checked',
          gac.check_in_method = 'auto',
          gac.updated_at = CURRENT_TIMESTAMP
        WHERE gac.check_in_status = 'pending'
          AND ia.auto_check_in = 1
          AND CONCAT(gac.activity_date, ' ', gac.scheduled_time) <= NOW()
      `;
      const result = await query(sql);

      await query(`
        UPDATE tour_departure_guests tdg
        SET checked_in_activities = (
          SELECT COUNT(*) 
          FROM guest_activity_checkins 
          WHERE tour_departure_guest_id = tdg.id 
            AND check_in_status IN ('checked_in', 'auto_checked')
        )
      `);

      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const sql = `
        SELECT 
          gac.*,
          ia.activity_name,
          ia.activity_type,
          ia.location,
          ia.check_in_window_before,
          ia.check_in_window_after,
          ti.title as day_title,
          bg.full_name as guest_name,
          bg.guest_type,
          s.name as checked_in_by_name
        FROM guest_activity_checkins gac
        INNER JOIN itinerary_activities ia ON gac.itinerary_activity_id = ia.id
        INNER JOIN tour_itineraries ti ON gac.itinerary_id = ti.id
        INNER JOIN tour_departure_guests tdg ON gac.tour_departure_guest_id = tdg.id
        INNER JOIN booking_guests bg ON tdg.booking_guest_id = bg.id
        LEFT JOIN users s ON gac.checked_in_by = s.id
        WHERE gac.id = ?
      `;
      const [checkin] = await query(sql, [id]);
      return checkin || null;
    } catch (error) {
      throw error;
    }
  }

  static async getByActivity(activityId, departureId) {
    try {
      const sql = `
        SELECT 
          gac.*,
          bg.full_name as guest_name,
          bg.guest_type,
          bg.phone,
          bg.email,
          b.booking_code,
          s.name as checked_in_by_name
        FROM guest_activity_checkins gac
        INNER JOIN tour_departure_guests tdg ON gac.tour_departure_guest_id = tdg.id
        INNER JOIN booking_guests bg ON tdg.booking_guest_id = bg.id
        INNER JOIN bookings b ON tdg.booking_id = b.id
        LEFT JOIN users s ON gac.checked_in_by = s.id
        WHERE gac.itinerary_activity_id = ?
          AND gac.tour_departure_id = ?
        ORDER BY gac.check_in_status, bg.guest_type, bg.full_name
      `;
      return await query(sql, [activityId, departureId]);
    } catch (error) {
      throw error;
    }
  }

  static async getByGuest(guestId) {
    try {
      const sql = `
        SELECT 
          gac.*,
          ia.activity_name,
          ia.activity_type,
          ia.location,
          ia.start_time,
          ia.end_time,
          ti.day_number,
          ti.title as day_title,
          s.name as checked_in_by_name
        FROM guest_activity_checkins gac
        INNER JOIN itinerary_activities ia ON gac.itinerary_activity_id = ia.id
        INNER JOIN tour_itineraries ti ON gac.itinerary_id = ti.id
        LEFT JOIN users s ON gac.checked_in_by = s.id
        WHERE gac.tour_departure_guest_id = ?
        ORDER BY gac.day_number ASC, ia.start_time ASC
      `;
      return await query(sql, [guestId]);
    } catch (error) {
      throw error;
    }
  }

  static async getByDate(departureId, activityDate) {
    try {
      const sql = `
        SELECT 
          gac.*,
          ia.activity_name,
          ia.activity_type,
          ia.location,
          ia.start_time,
          ia.end_time,
          bg.full_name as guest_name,
          bg.guest_type,
          s.name as checked_in_by_name
        FROM guest_activity_checkins gac
        INNER JOIN itinerary_activities ia ON gac.itinerary_activity_id = ia.id
        INNER JOIN tour_departure_guests tdg ON gac.tour_departure_guest_id = tdg.id
        INNER JOIN booking_guests bg ON tdg.booking_guest_id = bg.id
        LEFT JOIN users s ON gac.checked_in_by = s.id
        WHERE gac.tour_departure_id = ?
          AND gac.activity_date = ?
        ORDER BY ia.start_time ASC, bg.full_name ASC
      `;
      return await query(sql, [departureId, activityDate]);
    } catch (error) {
      throw error;
    }
  }

  static async getStatsForDeparture(departureId) {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_checkins,
          SUM(CASE WHEN check_in_status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN check_in_status = 'checked_in' THEN 1 ELSE 0 END) as checked_in,
          SUM(CASE WHEN check_in_status = 'missed' THEN 1 ELSE 0 END) as missed,
          SUM(CASE WHEN check_in_status = 'excused' THEN 1 ELSE 0 END) as excused,
          SUM(CASE WHEN check_in_status = 'auto_checked' THEN 1 ELSE 0 END) as auto_checked,
          ROUND(SUM(CASE WHEN check_in_status IN ('checked_in', 'auto_checked') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as attendance_rate
        FROM guest_activity_checkins
        WHERE tour_departure_id = ?
      `;
      const [stats] = await query(sql, [departureId]);
      return stats;
    } catch (error) {
      throw error;
    }
  }

  static async getStatsForActivity(activityId, departureId) {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_guests,
          SUM(CASE WHEN check_in_status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN check_in_status = 'checked_in' THEN 1 ELSE 0 END) as checked_in,
          SUM(CASE WHEN check_in_status = 'missed' THEN 1 ELSE 0 END) as missed,
          SUM(CASE WHEN check_in_status = 'excused' THEN 1 ELSE 0 END) as excused,
          SUM(CASE WHEN check_in_status = 'auto_checked' THEN 1 ELSE 0 END) as auto_checked
        FROM guest_activity_checkins
        WHERE itinerary_activity_id = ?
          AND tour_departure_id = ?
      `;
      const [stats] = await query(sql, [activityId, departureId]);
      return stats;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = GuestActivityCheckin;