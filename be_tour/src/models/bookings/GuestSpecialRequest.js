const { query } = require("../../config/db");

class GuestSpecialRequest {
    static async getByBookingGuest(bookingGuestId) {
        try {
            const sql = `
                SELECT 
                    gsr.id,
                    gsr.booking_guest_id,
                    gsr.request_type,
                    gsr.title,
                    gsr.description,
                    gsr.priority,
                    gsr.status,
                    gsr.notes,
                    gsr.created_at,
                    gsr.updated_at,
                    
                    -- Guest info
                    bg.first_name,
                    bg.last_name,
                    bg.full_name,
                    bg.guest_type,
                    
                    -- Booking info
                    b.booking_code
                    
                FROM guest_special_requests gsr
                INNER JOIN booking_guests bg ON gsr.booking_guest_id = bg.id
                INNER JOIN bookings b ON bg.booking_id = b.id
                WHERE gsr.booking_guest_id = ?
                ORDER BY 
                    FIELD(gsr.priority, 'critical', 'high', 'medium', 'low'),
                    gsr.created_at DESC
            `;
            return await query(sql, [bookingGuestId]);
        } catch (error) {
            throw error;
        }
    }

    static async getByBooking(bookingId) {
        try {
            const sql = `
                SELECT 
                    gsr.id,
                    gsr.booking_guest_id,
                    gsr.request_type,
                    gsr.title,
                    gsr.description,
                    gsr.priority,
                    gsr.status,
                    gsr.notes,
                    gsr.created_at,
                    gsr.updated_at,
                    
                    -- Guest info
                    bg.first_name,
                    bg.last_name,
                    bg.full_name,
                    bg.guest_type,
                    bg.phone,
                    bg.email
                    
                FROM guest_special_requests gsr
                INNER JOIN booking_guests bg ON gsr.booking_guest_id = bg.id
                WHERE bg.booking_id = ?
                ORDER BY 
                    FIELD(gsr.priority, 'critical', 'high', 'medium', 'low'),
                    bg.full_name ASC
            `;
            return await query(sql, [bookingId]);
        } catch (error) {
            throw error;
        }
    }

    static async getByTourDeparture(tourDepartureId) {
        try {
            const sql = `
                SELECT 
                    gsr.id,
                    gsr.booking_guest_id,
                    gsr.request_type,
                    gsr.title,
                    gsr.description,
                    gsr.priority,
                    gsr.status,
                    gsr.notes,
                    gsr.created_at,
                    gsr.updated_at,
                    
                    -- Guest info
                    bg.full_name,
                    bg.guest_type,
                    bg.phone,
                    
                    -- Booking info
                    b.booking_code,
                    b.id as booking_id
                    
                FROM guest_special_requests gsr
                INNER JOIN booking_guests bg ON gsr.booking_guest_id = bg.id
                INNER JOIN bookings b ON bg.booking_id = b.id
                INNER JOIN tour_departures td ON b.departure_date = td.departure_date
                WHERE td.id = ?
                ORDER BY 
                    FIELD(gsr.priority, 'critical', 'high', 'medium', 'low'),
                    bg.full_name ASC
            `;
            return await query(sql, [tourDepartureId]);
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        try {
            const sql = `
                SELECT 
                    gsr.id,
                    gsr.booking_guest_id,
                    gsr.request_type,
                    gsr.title,
                    gsr.description,
                    gsr.priority,
                    gsr.status,
                    gsr.notes,
                    gsr.created_at,
                    gsr.updated_at,
                    
                    -- Guest info
                    bg.first_name,
                    bg.last_name,
                    bg.full_name,
                    bg.guest_type,
                    bg.phone,
                    bg.email,
                    
                    -- Booking info
                    b.booking_code,
                    b.id as booking_id
                    
                FROM guest_special_requests gsr
                INNER JOIN booking_guests bg ON gsr.booking_guest_id = bg.id
                INNER JOIN bookings b ON bg.booking_id = b.id
                WHERE gsr.id = ?
            `;
            const results = await query(sql, [id]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            throw error;
        }
    }

    static async create(data) {
        try {
            const {
                booking_guest_id,
                request_type,
                title,
                description,
                priority,
                status,
                notes
            } = data;

            const sql = `
                INSERT INTO guest_special_requests (
                    booking_guest_id,
                    request_type,
                    title,
                    description,
                    priority,
                    status,
                    notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await query(sql, [
                booking_guest_id,
                request_type,
                title,
                description || null,
                priority || 'medium',
                status || 'pending',
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
                request_type,
                title,
                description,
                priority,
                status,
                notes
            } = data;

            const sql = `
                UPDATE guest_special_requests
                SET 
                    request_type = ?,
                    title = ?,
                    description = ?,
                    priority = ?,
                    status = ?,
                    notes = ?
                WHERE id = ?
            `;

            const result = await query(sql, [
                request_type,
                title,
                description || null,
                priority,
                status,
                notes || null,
                id
            ]);

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async updateStatus(id, status, notes = null) {
        try {
            const sql = `
                UPDATE guest_special_requests
                SET 
                    status = ?,
                    notes = CASE 
                        WHEN ? IS NOT NULL THEN CONCAT(IFNULL(notes, ''), '\n', ?)
                        ELSE notes 
                    END
                WHERE id = ?
            `;

            const result = await query(sql, [status, notes, notes, id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const sql = "DELETE FROM guest_special_requests WHERE id = ?";
            const result = await query(sql, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getStatsByType(bookingId = null) {
        try {
            let sql = `
                SELECT 
                    gsr.request_type,
                    COUNT(*) as total,
                    SUM(CASE WHEN gsr.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                    SUM(CASE WHEN gsr.status = 'acknowledged' THEN 1 ELSE 0 END) as acknowledged_count,
                    SUM(CASE WHEN gsr.status = 'fulfilled' THEN 1 ELSE 0 END) as fulfilled_count,
                    SUM(CASE WHEN gsr.status = 'cannot_fulfill' THEN 1 ELSE 0 END) as cannot_fulfill_count,
                    SUM(CASE WHEN gsr.priority = 'critical' THEN 1 ELSE 0 END) as critical_count,
                    SUM(CASE WHEN gsr.priority = 'high' THEN 1 ELSE 0 END) as high_count
                FROM guest_special_requests gsr
                INNER JOIN booking_guests bg ON gsr.booking_guest_id = bg.id
            `;

            const params = [];
            if (bookingId) {
                sql += " WHERE bg.booking_id = ?";
                params.push(bookingId);
            }

            sql += " GROUP BY gsr.request_type";

            return await query(sql, params);
        } catch (error) {
            throw error;
        }
    }

    static async getPendingRequests(tourDepartureId = null) {
        try {
            let sql = `
                SELECT 
                    gsr.id,
                    gsr.booking_guest_id,
                    gsr.request_type,
                    gsr.title,
                    gsr.priority,
                    gsr.status,
                    bg.full_name,
                    bg.phone,
                    b.booking_code
                FROM guest_special_requests gsr
                INNER JOIN booking_guests bg ON gsr.booking_guest_id = bg.id
                INNER JOIN bookings b ON bg.booking_id = b.id
            `;

            const params = [];
            const conditions = ["gsr.status IN ('pending', 'acknowledged')"];

            if (tourDepartureId) {
                sql += " INNER JOIN tour_departures td ON b.departure_date = td.departure_date";
                conditions.push("td.id = ?");
                params.push(tourDepartureId);
            }

            sql += ` WHERE ${conditions.join(" AND ")}`;
            sql += ` ORDER BY FIELD(gsr.priority, 'critical', 'high', 'medium', 'low')`;

            return await query(sql, params);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = GuestSpecialRequest;