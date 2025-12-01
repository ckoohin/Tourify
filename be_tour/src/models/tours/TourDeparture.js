const { query } = require('../../config/db');

class TourDeparture {
  static async getAll({ 
    page = 1, 
    limit = 10, 
    tour_version_id, 
    status, 
    departure_date_from,
    departure_date_to,
    search 
  }) {
    try {
      const offset = (page - 1) * limit;
      let whereConditions = [];
      let params = [];

      if (tour_version_id) {
        whereConditions.push('td.tour_version_id = ?');
        params.push(tour_version_id);
      }

      if (status) {
        whereConditions.push('td.status = ?');
        params.push(status);
      }

      if (departure_date_from) {
        whereConditions.push('td.departure_date >= ?');
        params.push(departure_date_from);
      }

      if (departure_date_to) {
        whereConditions.push('td.departure_date <= ?');
        params.push(departure_date_to);
      }

      if (search) {
        whereConditions.push('(td.departure_code LIKE ? OR t.name LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ') 
        : '';

      const countSql = `
        SELECT COUNT(*) as total
        FROM tour_departures td
        INNER JOIN tour_versions tv ON td.tour_version_id = tv.id
        INNER JOIN tours t ON tv.tour_id = t.id
        ${whereClause}
      `;
      const [countResult] = await query(countSql, params);
      const total = countResult.total;

      const sql = `
        SELECT 
          td.*,
          tv.name as version_name,
          tv.type as version_type,
          t.code as tour_code,
          t.name as tour_name,
          t.duration_days,
          t.duration_nights,
          tc.name as category_name,
          tl.full_name as tour_leader_name,
          tg.full_name as tour_guide_name,
          u.name as created_by_name
        FROM tour_departures td
        INNER JOIN tour_versions tv ON td.tour_version_id = tv.id
        INNER JOIN tours t ON tv.tour_id = t.id
        INNER JOIN tour_categories tc ON t.category_id = tc.id
        LEFT JOIN staff tl ON td.tour_leader_id = tl.id
        LEFT JOIN staff tg ON td.tour_guide_id = tg.id
        LEFT JOIN users u ON td.created_by = u.id
        ${whereClause}
        ORDER BY td.departure_date DESC, td.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      params.push(limit, offset);

      const departures = await query(sql, params);

      return {
        data: departures,
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

  static async getById(id) {
    try {
      const sql = `
        SELECT 
          td.*,
          tv.name as version_name,
          tv.type as version_type,
          t.id as tour_id,
          t.code as tour_code,
          t.name as tour_name,
          t.duration_days,
          t.duration_nights,
          t.departure_location,
          t.destination,
          tc.name as category_name,
          tl.id as tour_leader_id,
          tl.staff_code as tour_leader_code,
          tl.full_name as tour_leader_name,
          tl.phone as tour_leader_phone,
          tg.id as tour_guide_id,
          tg.staff_code as tour_guide_code,
          tg.full_name as tour_guide_name,
          tg.phone as tour_guide_phone,
          u.name as created_by_name
        FROM tour_departures td
        INNER JOIN tour_versions tv ON td.tour_version_id = tv.id
        INNER JOIN tours t ON tv.tour_id = t.id
        INNER JOIN tour_categories tc ON t.category_id = tc.id
        LEFT JOIN staff tl ON td.tour_leader_id = tl.id
        LEFT JOIN staff tg ON td.tour_guide_id = tg.id
        LEFT JOIN users u ON td.created_by = u.id
        WHERE td.id = ?
      `;

      const [departure] = await query(sql, [id]);

      if (!departure) {
        return null;
      }

      const staffSql = `
        SELECT 
          sa.id,
          sa.role,
          sa.assignment_date,
          sa.confirmed,
          sa.confirmed_at,
          sa.notes,
          s.id as staff_id,
          s.staff_code,
          s.full_name,
          s.staff_type,
          s.phone,
          s.email
        FROM staff_assignments sa
        INNER JOIN staff s ON sa.staff_id = s.id
        WHERE sa.tour_departure_id = ?
        ORDER BY sa.role, sa.created_at
      `;
      departure.staff_assignments = await query(staffSql, [id]);

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
          ss.name as service_name,
          ss.type as service_type
        FROM service_bookings sb
        INNER JOIN suppliers s ON sb.supplier_id = s.id
        LEFT JOIN supplier_services ss ON sb.supplier_service_id = ss.id
        WHERE sb.tour_departure_id = ?
        ORDER BY sb.service_date, sb.service_time
      `;
      departure.service_bookings = await query(servicesSql, [id]);

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
          tt.assigned_guests,
          tt.unit_price,
          tt.total_price,
          tt.currency,
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
      departure.transports = await query(transportsSql, [id]);

      return departure;
    } catch (error) {
      throw error;
    }
  }

  static async create(data, createdBy) {
    try {
      const {
        tour_version_id,
        departure_date,
        return_date,
        departure_time,
        meeting_point,
        meeting_time,
        min_guests,
        max_guests,
        tour_leader_id,
        tour_guide_id,
        notes
      } = data;

      const prefix = 'DEP';
      const timestamp = Date.now().toString().slice(-8);
      const departure_code = `${prefix}${timestamp}`;

      const sql = `
        INSERT INTO tour_departures (
          departure_code,
          tour_version_id,
          departure_date,
          return_date,
          departure_time,
          meeting_point,
          meeting_time,
          min_guests,
          max_guests,
          tour_leader_id,
          tour_guide_id,
          notes,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await query(sql, [
        departure_code,
        tour_version_id,
        departure_date,
        return_date,
        departure_time || null,
        meeting_point || null,
        meeting_time || null,
        min_guests || 1,
        max_guests,
        tour_leader_id || null,
        tour_guide_id || null,
        notes || null,
        createdBy
      ]);

      return await this.getById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const {
        departure_date,
        return_date,
        departure_time,
        meeting_point,
        meeting_time,
        min_guests,
        max_guests,
        status,
        tour_leader_id,
        tour_guide_id,
        notes
      } = data;

      const sql = `
        UPDATE tour_departures
        SET 
          departure_date = ?,
          return_date = ?,
          departure_time = ?,
          meeting_point = ?,
          meeting_time = ?,
          min_guests = ?,
          max_guests = ?,
          status = ?,
          tour_leader_id = ?,
          tour_guide_id = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await query(sql, [
        departure_date,
        return_date,
        departure_time || null,
        meeting_point || null,
        meeting_time || null,
        min_guests,
        max_guests,
        status,
        tour_leader_id || null,
        tour_guide_id || null,
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
      const [checkBooking] = await query(
        'SELECT COUNT(*) as count FROM tour_departure_guests WHERE tour_departure_id = ?',
        [id]
      );

      if (checkBooking.count > 0) {
        throw new Error('Không thể xóa lịch khởi hành đã có khách đăng ký');
      }

      const sql = 'DELETE FROM tour_departures WHERE id = ?';
      await query(sql, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      const sql = `
        UPDATE tour_departures
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      await query(sql, [status, id]);
      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  static async getGuests(departureId, { page = 1, limit = 50 }) {
    try {
      const offset = (page - 1) * limit;

      const [countResult] = await query(
        'SELECT COUNT(*) as total FROM tour_departure_guests WHERE tour_departure_id = ?',
        [departureId]
      );
      const total = countResult.total;

      const sql = `
        SELECT 
          tdg.*,
          bg.guest_type,
          bg.title,
          bg.first_name,
          bg.last_name,
          bg.full_name,
          bg.birthday,
          bg.gender,
          bg.nationality,
          bg.id_number,
          bg.phone,
          bg.email,
          bg.is_primary_contact,
          bg.special_requests,
          bg.medical_notes,
          b.booking_code,
          c.full_name as customer_name,
          c.phone as customer_phone
        FROM tour_departure_guests tdg
        INNER JOIN booking_guests bg ON tdg.booking_guest_id = bg.id
        INNER JOIN bookings b ON tdg.booking_id = b.id
        INNER JOIN customers c ON b.customer_id = c.id
        WHERE tdg.tour_departure_id = ?
        ORDER BY bg.is_primary_contact DESC, bg.guest_type, bg.last_name
        LIMIT ${limit} OFFSET ${offset}
      `;

      const guests = await query(sql, [departureId]);

      for (let guest of guests) {
        const requestsSql = `
          SELECT * FROM guest_special_requests
          WHERE booking_guest_id = ?
          ORDER BY priority DESC, created_at DESC
        `;
        guest.special_requests_detail = await query(requestsSql, [guest.booking_guest_id]);
      }

      return {
        data: guests,
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

  static async checkInGuest(guestId, checkedInBy) {
    try {
      const sql = `
        UPDATE tour_departure_guests
        SET 
          checked_in = 1,
          check_in_time = CURRENT_TIMESTAMP,
          check_in_by = ?,
          attendance_status = 'checked_in',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      await query(sql, [checkedInBy, guestId]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async assignRoom(guestId, { room_number, room_type, roommate_id, notes }) {
    try {
      const sql = `
        UPDATE tour_departure_guests
        SET 
          room_number = ?,
          room_type = ?,
          roommate_id = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      await query(sql, [
        room_number || null,
        room_type || null,
        roommate_id || null,
        notes || null,
        guestId
      ]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TourDeparture;