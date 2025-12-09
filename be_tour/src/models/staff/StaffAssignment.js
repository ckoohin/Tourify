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
  
  static async getAll({ 
    page = 1, 
    limit = 10, 
    search,
    role,
    confirmed,
    tour_departure_id,
    staff_id,
    date_from,
    date_to,
    status
  }) {
    try {
      const offset = (page - 1) * limit;
      let whereConditions = [];
      let params = [];

      if (search) {
        whereConditions.push('(s.full_name LIKE ? OR s.staff_code LIKE ? OR td.departure_code LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (role) {
        whereConditions.push('sa.role = ?');
        params.push(role);
      }

      if (confirmed !== undefined) {
        whereConditions.push('sa.confirmed = ?');
        params.push(confirmed);
      }

      if (tour_departure_id) {
        whereConditions.push('sa.tour_departure_id = ?');
        params.push(tour_departure_id);
      }

      if (staff_id) {
        whereConditions.push('sa.staff_id = ?');
        params.push(staff_id);
      }

      if (date_from) {
        whereConditions.push('td.departure_date >= ?');
        params.push(date_from);
      }

      if (date_to) {
        whereConditions.push('td.return_date <= ?');
        params.push(date_to);
      }

      if (status) {
        whereConditions.push('td.status = ?');
        params.push(status);
      }

      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ') 
        : '';

      const countSql = `
        SELECT COUNT(*) as total
        FROM staff_assignments sa
        INNER JOIN staff s ON sa.staff_id = s.id
        INNER JOIN tour_departures td ON sa.tour_departure_id = td.id
        ${whereClause}
      `;
      const [countResult] = await query(countSql, params);
      const total = countResult.total;

      const sql = `
        SELECT 
          sa.id,
          sa.tour_departure_id,
          sa.staff_id,
          sa.role,
          sa.assignment_date,
          sa.confirmed,
          sa.confirmed_at,
          sa.notes,
          sa.created_at,
          sa.updated_at,
          s.staff_code,
          s.full_name,
          s.staff_type,
          s.phone,
          s.email,
          td.departure_code,
          td.departure_date,
          td.return_date,
          td.status as tour_status,
          tv.name as version_name,
          t.id as tour_id,
          t.code as tour_code,
          t.name as tour_name,
          t.duration_days,
          t.duration_nights,
          u.name as created_by_name
        FROM staff_assignments sa
        INNER JOIN staff s ON sa.staff_id = s.id
        INNER JOIN tour_departures td ON sa.tour_departure_id = td.id
        INNER JOIN tour_versions tv ON td.tour_version_id = tv.id
        INNER JOIN tours t ON tv.tour_id = t.id
        LEFT JOIN users u ON sa.created_by = u.id
        ${whereClause}
        ORDER BY td.departure_date DESC, sa.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      params.push(limit, offset);

      const assignments = await query(sql, params);

      return {
        data: assignments,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit)
        }
      };
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

  // static async confirm(id) {
  //   try {
  //     const sql = `
  //       UPDATE staff_assignments
  //       SET 
  //         confirmed = 1,
  //         confirmed_at = CURRENT_TIMESTAMP,
  //         updated_at = CURRENT_TIMESTAMP
  //       WHERE id = ?
  //     `;
  //     await query(sql, [id]);
  //     return await this.getById(id);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

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

static async getAll({ 
    page = 1, 
    limit = 10, 
    search,
    role,
    confirmed,
    tour_departure_id,
    staff_id,
    date_from,
    date_to,
    status
  }) {
    try {
      const offset = (page - 1) * limit;
      let whereConditions = [];
      let params = [];

      if (search) {
        whereConditions.push('(s.full_name LIKE ? OR s.staff_code LIKE ? OR td.departure_code LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (role) {
        whereConditions.push('sa.role = ?');
        params.push(role);
      }

      if (confirmed !== undefined) {
        whereConditions.push('sa.confirmed = ?');
        params.push(confirmed);
      }

      if (tour_departure_id) {
        whereConditions.push('sa.tour_departure_id = ?');
        params.push(tour_departure_id);
      }

      if (staff_id) {
        whereConditions.push('sa.staff_id = ?');
        params.push(staff_id);
      }

      if (date_from) {
        whereConditions.push('td.departure_date >= ?');
        params.push(date_from);
      }

      if (date_to) {
        whereConditions.push('td.return_date <= ?');
        params.push(date_to);
      }

      if (status) {
        whereConditions.push('td.status = ?');
        params.push(status);
      }

      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ') 
        : '';

      const countSql = `
        SELECT COUNT(*) as total
        FROM staff_assignments sa
        INNER JOIN staff s ON sa.staff_id = s.id
        INNER JOIN tour_departures td ON sa.tour_departure_id = td.id
        ${whereClause}
      `;
      const [countResult] = await query(countSql, params);
      const total = countResult.total;

      const sql = `
        SELECT 
          sa.id,
          sa.tour_departure_id,
          sa.staff_id,
          sa.role,
          sa.assignment_date,
          sa.confirmed,
          sa.confirmed_at,
          sa.notes,
          sa.created_at,
          sa.updated_at,
          s.staff_code,
          s.full_name,
          s.staff_type,
          s.phone,
          s.email,
          td.departure_code,
          td.departure_date,
          td.return_date,
          td.status as tour_status,
          tv.name as version_name,
          t.id as tour_id,
          t.code as tour_code,
          t.name as tour_name,
          t.duration_days,
          t.duration_nights,
          u.name as created_by_name
        FROM staff_assignments sa
        INNER JOIN staff s ON sa.staff_id = s.id
        INNER JOIN tour_departures td ON sa.tour_departure_id = td.id
        INNER JOIN tour_versions tv ON td.tour_version_id = tv.id
        INNER JOIN tours t ON tv.tour_id = t.id
        LEFT JOIN users u ON sa.created_by = u.id
        ${whereClause}
        ORDER BY td.departure_date DESC, sa.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      params.push(limit, offset);

      const assignments = await query(sql, params);

      return {
        data: assignments,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async getMyAssignments(staffId, { 
    page = 1, 
    limit = 10,
    status,
    date_from,
    date_to,
    role
  }) {
    try {
      const offset = (page - 1) * limit;
      let whereConditions = ['sa.staff_id = ?'];
      let params = [staffId];

      if (status) {
        whereConditions.push('td.status = ?');
        params.push(status);
      }

      if (role) {
        whereConditions.push('sa.role = ?');
        params.push(role);
      }

      if (date_from) {
        whereConditions.push('td.departure_date >= ?');
        params.push(date_from);
      }

      if (date_to) {
        whereConditions.push('td.departure_date <= ?');
        params.push(date_to);
      }

      const whereClause = whereConditions.join(' AND ');

      const countSql = `
        SELECT COUNT(*) as total
        FROM staff_assignments sa
        INNER JOIN tour_departures td ON sa.tour_departure_id = td.id
        WHERE ${whereClause}
      `;
      const [countResult] = await query(countSql, params);
      const total = countResult.total;

      const sql = `
        SELECT 
          sa.id as assignment_id,
          sa.role,
          sa.assignment_date,
          sa.confirmed,
          sa.confirmed_at,
          sa.notes as assignment_notes,
          td.id as departure_id,
          td.departure_code,
          td.departure_date,
          td.return_date,
          td.departure_time,
          td.meeting_point,
          td.meeting_time,
          td.max_guests,
          td.confirmed_guests,
          td.available_slots,
          td.status as departure_status,
          td.notes as departure_notes,
          tv.name as version_name,
          t.id as tour_id,
          t.code as tour_code,
          t.name as tour_name,
          t.duration_days,
          t.duration_nights,
          t.departure_location,
          t.destination,
          tc.name as category_name,
          tl.full_name as tour_leader_name,
          tl.phone as tour_leader_phone,
          tg.full_name as tour_guide_name,
          tg.phone as tour_guide_phone
        FROM staff_assignments sa
        INNER JOIN tour_departures td ON sa.tour_departure_id = td.id
        INNER JOIN tour_versions tv ON td.tour_version_id = tv.id
        INNER JOIN tours t ON tv.tour_id = t.id
        INNER JOIN tour_categories tc ON t.category_id = tc.id
        LEFT JOIN staff tl ON td.tour_leader_id = tl.id
        LEFT JOIN staff tg ON td.tour_guide_id = tg.id
        WHERE ${whereClause}
        ORDER BY td.departure_date DESC, td.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const assignments = await query(sql, params);

      return {
        data: assignments,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async getMyAssignmentDetail(staffId, departureId) {
    try {
      const [assignment] = await query(
        `SELECT * FROM staff_assignments 
         WHERE staff_id = ? AND tour_departure_id = ?`,
        [staffId, departureId]
      );

      if (!assignment) {
        throw new Error('Bạn không được phân công vào tour này');
      }

      const sql = `
        SELECT 
          td.*,
          tv.name as version_name,
          tv.type as version_type,
          t.id as tour_id,
          t.code as tour_code,
          t.name as tour_name,
          t.description as tour_description,
          t.highlights as tour_highlights,
          t.duration_days,
          t.duration_nights,
          t.departure_location,
          t.destination,
          tc.name as category_name,
          tl.id as tour_leader_id,
          tl.full_name as tour_leader_name,
          tl.phone as tour_leader_phone,
          tl.email as tour_leader_email,
          tg.id as tour_guide_id,
          tg.full_name as tour_guide_name,
          tg.phone as tour_guide_phone,
          tg.email as tour_guide_email
        FROM tour_departures td
        INNER JOIN tour_versions tv ON td.tour_version_id = tv.id
        INNER JOIN tours t ON tv.tour_id = t.id
        INNER JOIN tour_categories tc ON t.category_id = tc.id
        LEFT JOIN staff tl ON td.tour_leader_id = tl.id
        LEFT JOIN staff tg ON td.tour_guide_id = tg.id
        WHERE td.id = ?
      `;

      const [departure] = await query(sql, [departureId]);

      if (!departure) {
        throw new Error('Không tìm thấy lịch khởi hành');
      }

      const assignmentSql = `
        SELECT 
          sa.id as assignment_id,
          sa.role,
          sa.assignment_date,
          sa.confirmed,
          sa.confirmed_at,
          sa.notes
        FROM staff_assignments sa
        WHERE sa.staff_id = ? AND sa.tour_departure_id = ?
      `;
      const [myAssignment] = await query(assignmentSql, [staffId, departureId]);
      departure.my_assignment = myAssignment;

      const allStaffSql = `
        SELECT 
          sa.id,
          sa.role,
          sa.confirmed,
          s.id as staff_id,
          s.staff_code,
          s.full_name,
          s.phone,
          s.email
        FROM staff_assignments sa
        INNER JOIN staff s ON sa.staff_id = s.id
        WHERE sa.tour_departure_id = ?
        ORDER BY sa.role
      `;
      departure.all_staff = await query(allStaffSql, [departureId]);

      const guestsSql = `
        SELECT 
          tdg.id,
          tdg.checked_in,
          tdg.check_in_time,
          tdg.room_number,
          tdg.room_type,
          tdg.attendance_status,
          bg.guest_type,
          bg.title,
          bg.full_name,
          bg.phone,
          bg.email,
          bg.birthday,
          bg.gender,
          bg.nationality,
          bg.is_primary_contact,
          bg.special_requests,
          bg.medical_notes,
          b.booking_code
        FROM tour_departure_guests tdg
        INNER JOIN booking_guests bg ON tdg.booking_guest_id = bg.id
        INNER JOIN bookings b ON tdg.booking_id = b.id
        WHERE tdg.tour_departure_id = ?
        ORDER BY bg.is_primary_contact DESC, bg.guest_type, bg.full_name
      `;
      departure.guests = await query(guestsSql, [departureId]);

      const itinerarySql = `
        SELECT 
          ti.id,
          ti.day_number,
          ti.title,
          ti.description,
          ti.activities,
          ti.meals,
          ti.accommodation,
          ti.notes
        FROM tour_itineraries ti
        WHERE ti.tour_version_id = ?
        ORDER BY ti.day_number
      `;
      departure.itinerary = await query(itinerarySql, [departure.tour_version_id]);

      departure.itinerary.forEach(item => {
        if (item.activities) {
          try {
            item.activities = JSON.parse(item.activities);
          } catch (e) {
            item.activities = null;
          }
        }
        if (item.meals) {
          try {
            item.meals = JSON.parse(item.meals);
          } catch (e) {
            item.meals = null;
          }
        }
      });

      const servicesSql = `
        SELECT 
          sb.id,
          sb.booking_code,
          sb.service_date,
          sb.service_time,
          sb.quantity,
          sb.unit_price,
          sb.total_amount,
          sb.currency,
          sb.status,
          sb.confirmation_number,
          sb.notes,
          s.company_name as supplier_name,
          s.type as supplier_type,
          s.phone as supplier_phone,
          s.email as supplier_email,
          ss.name as service_name,
          ss.type as service_type
        FROM service_bookings sb
        INNER JOIN suppliers s ON sb.supplier_id = s.id
        LEFT JOIN supplier_services ss ON sb.supplier_service_id = ss.id
        WHERE sb.tour_departure_id = ?
        ORDER BY sb.service_date, sb.service_time
      `;
      departure.services = await query(servicesSql, [departureId]);

      const transportsSql = `
        SELECT 
          tt.id,
          tt.transport_type,
          tt.transport_provider,
          tt.route_from,
          tt.route_to,
          tt.departure_datetime,
          tt.arrival_datetime,
          tt.flight_number,
          tt.vehicle_number,
          tt.seat_class,
          tt.total_seats,
          tt.booking_status,
          tt.booking_reference,
          tt.notes,
          s.full_name as driver_name,
          s.phone as driver_phone
        FROM tour_transports tt
        LEFT JOIN staff s ON tt.driver_id = s.id
        WHERE tt.tour_departure_id = ?
        ORDER BY tt.departure_datetime
      `;
      departure.transports = await query(transportsSql, [departureId]);

      const logsSql = `
        SELECT 
          tl.id,
          tl.log_date,
          tl.log_time,
          tl.day_number,
          tl.log_type,
          tl.title,
          tl.content,
          tl.images,
          tl.location,
          tl.weather,
          u.name as created_by_name,
          tl.created_at
        FROM tour_logs tl
        LEFT JOIN users u ON tl.created_by = u.id
        WHERE tl.tour_departure_id = ?
        ORDER BY tl.log_date DESC, tl.log_time DESC
        LIMIT 10
      `;
      const logs = await query(logsSql, [departureId]);
      
      logs.forEach(log => {
        if (log.images) {
          try {
            log.images = JSON.parse(log.images);
          } catch (e) {
            log.images = [];
          }
        }
      });
      departure.recent_logs = logs;

      return departure;
    } catch (error) {
      throw error;
    }
  }

  static async getMyStats(staffId, { date_from, date_to }) {
    try {
      const params = [staffId];
      let dateFilter = '';

      if (date_from && date_to) {
        dateFilter = 'AND td.departure_date BETWEEN ? AND ?';
        params.push(date_from, date_to);
      }

      const sql = `
        SELECT 
          COUNT(DISTINCT sa.id) as total_assignments,
          COUNT(DISTINCT CASE WHEN td.status = 'completed' THEN sa.id END) as completed_tours,
          COUNT(DISTINCT CASE WHEN td.status = 'confirmed' THEN sa.id END) as upcoming_tours,
          COUNT(DISTINCT CASE WHEN td.status = 'in_progress' THEN sa.id END) as ongoing_tours,
          COUNT(DISTINCT CASE WHEN td.status = 'cancelled' THEN sa.id END) as cancelled_tours,
          COUNT(DISTINCT CASE WHEN sa.role = 'tour_leader' THEN sa.id END) as as_tour_leader,
          COUNT(DISTINCT CASE WHEN sa.role = 'tour_guide' THEN sa.id END) as as_tour_guide,
          COUNT(DISTINCT CASE WHEN sa.role = 'driver' THEN sa.id END) as as_driver
        FROM staff_assignments sa
        INNER JOIN tour_departures td ON sa.tour_departure_id = td.id
        WHERE sa.staff_id = ? ${dateFilter}
      `;

      const [stats] = await query(sql, params);
      return stats;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = StaffAssignment;