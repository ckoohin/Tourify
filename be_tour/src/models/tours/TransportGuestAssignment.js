const { query } = require("../../config/db");
const TourTransport = require('./TourTransport');

class TransportGuestAssignment {
    static async getByTransport(tourTransportId) {
        try {
            const sql = `
                SELECT 
                    tga.id,
                    tga.tour_transport_id,
                    tga.tour_departure_guest_id,
                    tga.seat_number,
                    tga.ticket_number,
                    tga.baggage_allowance,
                    tga.additional_baggage,
                    tga.special_meal,
                    tga.special_assistance,
                    tga.notes,
                    tga.created_at,
                    
                    -- Guest info
                    bg.first_name,
                    bg.last_name,
                    bg.full_name,
                    bg.guest_type,
                    bg.phone,
                    bg.email,
                    
                    -- Booking info
                    b.booking_code
                    
                FROM transport_guest_assignments tga
                INNER JOIN tour_departure_guests tdg ON tga.tour_departure_guest_id = tdg.id
                INNER JOIN booking_guests bg ON tdg.booking_guest_id = bg.id
                INNER JOIN bookings b ON bg.booking_id = b.id
                WHERE tga.tour_transport_id = ?
                ORDER BY tga.seat_number ASC
            `;
            return await query(sql, [tourTransportId]);
        } catch (error) {
            throw error;
        }
    }

    static async getByGuest(tourDepartureGuestId) {
        try {
            const sql = `
                SELECT 
                    tga.id,
                    tga.tour_transport_id,
                    tga.seat_number,
                    tga.ticket_number,
                    tga.baggage_allowance,
                    tga.special_meal,
                    tga.special_assistance,
                    
                    -- Transport info
                    tt.transport_type,
                    tt.transport_provider,
                    tt.route_from,
                    tt.route_to,
                    tt.departure_datetime,
                    tt.arrival_datetime,
                    tt.flight_number,
                    tt.vehicle_number,
                    tt.seat_class
                    
                FROM transport_guest_assignments tga
                INNER JOIN tour_transports tt ON tga.tour_transport_id = tt.id
                WHERE tga.tour_departure_guest_id = ?
                ORDER BY tt.departure_datetime ASC
            `;
            return await query(sql, [tourDepartureGuestId]);
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        try {
            const sql = `
                SELECT 
                    tga.*,
                    bg.full_name as guest_name,
                    bg.phone as guest_phone,
                    tt.transport_type,
                    tt.route_from,
                    tt.route_to,
                    tt.departure_datetime
                FROM transport_guest_assignments tga
                INNER JOIN tour_departure_guests tdg ON tga.tour_departure_guest_id = tdg.id
                INNER JOIN booking_guests bg ON tdg.booking_guest_id = bg.id
                INNER JOIN tour_transports tt ON tga.tour_transport_id = tt.id
                WHERE tga.id = ?
            `;
            const results = await query(sql, [id]);
            
            if (results.length > 0) {
                const assignment = results[0];
                if (assignment.additional_baggage) {
                    try {
                        assignment.additional_baggage = JSON.parse(assignment.additional_baggage);
                    } catch (e) {
                        assignment.additional_baggage = null;
                    }
                }
                return assignment;
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    static async create(data) {
        try {
            const {
                tour_transport_id,
                tour_departure_guest_id,
                seat_number,
                ticket_number,
                baggage_allowance,
                additional_baggage,
                special_meal,
                special_assistance,
                notes
            } = data;

            const sql = `
                INSERT INTO transport_guest_assignments (
                    tour_transport_id,
                    tour_departure_guest_id,
                    seat_number,
                    ticket_number,
                    baggage_allowance,
                    additional_baggage,
                    special_meal,
                    special_assistance,
                    notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await query(sql, [
                tour_transport_id,
                tour_departure_guest_id,
                seat_number || null,
                ticket_number || null,
                baggage_allowance || null,
                additional_baggage ? JSON.stringify(additional_baggage) : null,
                special_meal || null,
                special_assistance || null,
                notes || null
            ]);

            await TourTransport.updateAssignedGuests(tour_transport_id);

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const {
                seat_number,
                ticket_number,
                baggage_allowance,
                additional_baggage,
                special_meal,
                special_assistance,
                notes
            } = data;

            const sql = `
                UPDATE transport_guest_assignments
                SET 
                    seat_number = ?,
                    ticket_number = ?,
                    baggage_allowance = ?,
                    additional_baggage = ?,
                    special_meal = ?,
                    special_assistance = ?,
                    notes = ?
                WHERE id = ?
            `;

            const result = await query(sql, [
                seat_number || null,
                ticket_number || null,
                baggage_allowance || null,
                additional_baggage ? JSON.stringify(additional_baggage) : null,
                special_meal || null,
                special_assistance || null,
                notes || null,
                id
            ]);

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const assignment = await this.getById(id);
            if (!assignment) return false;

            const sql = "DELETE FROM transport_guest_assignments WHERE id = ?";
            const result = await query(sql, [id]);

            if (result.affectedRows > 0) {
                await TourTransport.updateAssignedGuests(assignment.tour_transport_id);
            }

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async bulkCreate(assignments) {
        try {
            if (!Array.isArray(assignments) || assignments.length === 0) {
                throw new Error('Danh sách phân bổ không hợp lệ');
            }
            const safe = v => v === undefined ? null : v;
            const rows = assignments.map(a => [
                safe(a.tour_transport_id),
                safe(a.tour_departure_guest_id),
                safe(a.seat_number),
                safe(a.ticket_number),
                safe(a.baggage_allowance),
                safe(a.additional_baggage ? JSON.stringify(a.additional_baggage) : null),
                safe(a.special_meal),
                safe(a.special_assistance),
                safe(a.notes)
            ]);

            const placeholders = rows.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");

            const sql = `
                INSERT INTO transport_guest_assignments (
                    tour_transport_id,
                    tour_departure_guest_id,
                    seat_number,
                    ticket_number,
                    baggage_allowance,
                    additional_baggage,
                    special_meal,
                    special_assistance,
                    notes
                )
                VALUES ${placeholders}
            `;

            const params = rows.flat(); 

            const result = await query(sql, params);

            const transportIds = [...new Set(assignments.map(a => a.tour_transport_id))];
            for (const transportId of transportIds) {
                await TourTransport.updateAssignedGuests(transportId);
            }

            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    static async isSeatTaken(tourTransportId, seatNumber, excludeId = null) {
        try {
            let sql = `
                SELECT id 
                FROM transport_guest_assignments 
                WHERE tour_transport_id = ? AND seat_number = ?
            `;
            const params = [tourTransportId, seatNumber];

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

    static async getUsedSeats(tourTransportId) {
        try {
            const sql = `
                SELECT seat_number
                FROM transport_guest_assignments
                WHERE tour_transport_id = ? AND seat_number IS NOT NULL
                ORDER BY seat_number
            `;
            const results = await query(sql, [tourTransportId]);
            return results.map(r => r.seat_number);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = TransportGuestAssignment;