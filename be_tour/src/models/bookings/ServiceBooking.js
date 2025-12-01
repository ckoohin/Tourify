const { query } = require('../../config/db');

class ServiceBooking {
  static async create(data, createdBy) {
    try {
      const {
        tour_departure_id,
        supplier_id,
        supplier_service_id,
        service_date,
        service_time,
        quantity,
        unit_price,
        currency,
        notes
      } = data;

      const prefix = 'SRV';
      const timestamp = Date.now().toString().slice(-8);
      const booking_code = `${prefix}${timestamp}`;

      const total_amount = quantity * unit_price;

      const sql = `
        INSERT INTO service_bookings (
          booking_code,
          tour_departure_id,
          supplier_id,
          supplier_service_id,
          service_date,
          service_time,
          quantity,
          unit_price,
          total_amount,
          currency,
          notes,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await query(sql, [
        booking_code,
        tour_departure_id,
        supplier_id,
        supplier_service_id || null,
        service_date,
        service_time || null,
        quantity,
        unit_price,
        total_amount,
        currency || 'VND',
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
          sb.*,
          s.code as supplier_code,
          s.company_name as supplier_name,
          s.type as supplier_type,
          s.phone as supplier_phone,
          s.email as supplier_email,
          ss.name as service_name,
          ss.type as service_type,
          ss.unit as service_unit,
          td.departure_code,
          u.name as created_by_name
        FROM service_bookings sb
        INNER JOIN suppliers s ON sb.supplier_id = s.id
        LEFT JOIN supplier_services ss ON sb.supplier_service_id = ss.id
        INNER JOIN tour_departures td ON sb.tour_departure_id = td.id
        LEFT JOIN users u ON sb.created_by = u.id
        WHERE sb.id = ?
      `;

      const [booking] = await query(sql, [id]);
      return booking || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const {
        service_date,
        service_time,
        quantity,
        unit_price,
        notes
      } = data;

      const total_amount = quantity * unit_price;

      const sql = `
        UPDATE service_bookings
        SET 
          service_date = ?,
          service_time = ?,
          quantity = ?,
          unit_price = ?,
          total_amount = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await query(sql, [
        service_date,
        service_time || null,
        quantity,
        unit_price,
        total_amount,
        notes || null,
        id
      ]);

      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status, confirmation_number = null) {
    try {
      const sql = `
        UPDATE service_bookings
        SET 
          status = ?,
          confirmation_number = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await query(sql, [status, confirmation_number, id]);
      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [booking] = await query(
        'SELECT status FROM service_bookings WHERE id = ?',
        [id]
      );

      if (!booking) {
        throw new Error('Không tìm thấy dịch vụ');
      }

      if (booking.status === 'completed') {
        throw new Error('Không thể xóa dịch vụ đã hoàn thành');
      }

      const sql = 'DELETE FROM service_bookings WHERE id = ?';
      await query(sql, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getByDepartureId(departureId) {
    try {
      const sql = `
        SELECT 
          sb.*,
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

      const bookings = await query(sql, [departureId]);
      return bookings;
    } catch (error) {
      throw error;
    }
  }

  static async getStatsByDepartureId(departureId) {
    try {
      const sql = `
        SELECT 
          status,
          COUNT(*) as count,
          SUM(total_amount) as total_amount
        FROM service_bookings
        WHERE tour_departure_id = ?
        GROUP BY status
      `;

      const stats = await query(sql, [departureId]);
      return stats;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ServiceBooking;