const { query } = require("../../config/db");

class TourTransport {
    static async getByTourDeparture(tourDepartureId) {
        try {
            const sql = `
                SELECT 
                    tt.id,
                    tt.tour_departure_id,
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
                    tt.driver_id,
                    tt.notes,
                    tt.created_at,
                    
                    -- Driver info
                    s.full_name as driver_name,
                    s.phone as driver_phone,
                    
                    -- Tour departure info
                    td.departure_code
                    
                FROM tour_transports tt
                LEFT JOIN staff s ON tt.driver_id = s.id
                LEFT JOIN tour_departures td ON tt.tour_departure_id = td.id
                WHERE tt.tour_departure_id = ?
                ORDER BY tt.departure_datetime ASC
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
                    tt.id,
                    tt.tour_departure_id,
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
                    tt.driver_id,
                    tt.notes,
                    tt.created_by,
                    tt.created_at,
                    tt.updated_at,
                    
                    -- Driver info
                    s.full_name as driver_name,
                    s.phone as driver_phone,
                    s.email as driver_email,
                    
                    -- Tour departure info
                    td.departure_code,
                    tv.name as tour_version_name,
                    t.name as tour_name
                    
                FROM tour_transports tt
                LEFT JOIN staff s ON tt.driver_id = s.id
                LEFT JOIN tour_departures td ON tt.tour_departure_id = td.id
                LEFT JOIN tour_versions tv ON td.tour_version_id = tv.id
                LEFT JOIN tours t ON tv.tour_id = t.id
                WHERE tt.id = ?
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
                tour_departure_id,
                transport_type,
                transport_provider,
                route_from,
                route_to,
                departure_datetime,
                arrival_datetime,
                flight_number,
                vehicle_number,
                seat_class,
                total_seats,
                unit_price,
                total_price,
                currency,
                booking_status,
                booking_reference,
                driver_id,
                notes,
                created_by
            } = data;

            const sql = `
                INSERT INTO tour_transports (
                    tour_departure_id,
                    transport_type,
                    transport_provider,
                    route_from,
                    route_to,
                    departure_datetime,
                    arrival_datetime,
                    flight_number,
                    vehicle_number,
                    seat_class,
                    total_seats,
                    unit_price,
                    total_price,
                    currency,
                    booking_status,
                    booking_reference,
                    driver_id,
                    notes,
                    created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await query(sql, [
                tour_departure_id,
                transport_type,
                transport_provider || null,
                route_from,
                route_to,
                departure_datetime,
                arrival_datetime || null,
                flight_number || null,
                vehicle_number || null,
                seat_class || null,
                total_seats || null,
                unit_price || null,
                total_price || null,
                currency || 'VND',
                booking_status || 'pending',
                booking_reference || null,
                driver_id || null,
                notes || null,
                created_by
            ]);

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const {
                transport_type,
                transport_provider,
                route_from,
                route_to,
                departure_datetime,
                arrival_datetime,
                flight_number,
                vehicle_number,
                seat_class,
                total_seats,
                unit_price,
                total_price,
                currency,
                booking_status,
                booking_reference,
                driver_id,
                notes
            } = data;

            const sql = `
                UPDATE tour_transports
                SET 
                    transport_type = ?,
                    transport_provider = ?,
                    route_from = ?,
                    route_to = ?,
                    departure_datetime = ?,
                    arrival_datetime = ?,
                    flight_number = ?,
                    vehicle_number = ?,
                    seat_class = ?,
                    total_seats = ?,
                    unit_price = ?,
                    total_price = ?,
                    currency = ?,
                    booking_status = ?,
                    booking_reference = ?,
                    driver_id = ?,
                    notes = ?
                WHERE id = ?
            `;

            const result = await query(sql, [
                transport_type,
                transport_provider || null,
                route_from,
                route_to,
                departure_datetime,
                arrival_datetime || null,
                flight_number || null,
                vehicle_number || null,
                seat_class || null,
                total_seats || null,
                unit_price || null,
                total_price || null,
                currency || 'VND',
                booking_status || 'pending',
                booking_reference || null,
                driver_id || null,
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
            const sql = "DELETE FROM tour_transports WHERE id = ?";
            const result = await query(sql, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async updateBookingStatus(id, status, bookingReference = null) {
        try {
            const sql = `
                UPDATE tour_transports
                SET 
                    booking_status = ?,
                    booking_reference = COALESCE(?, booking_reference)
                WHERE id = ?
            `;

            const result = await query(sql, [status, bookingReference, id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getAvailableSeats(id) {
        try {
            const sql = `
                SELECT 
                    total_seats,
                    assigned_guests,
                    (total_seats - assigned_guests) as available_seats
                FROM tour_transports
                WHERE id = ?
            `;
            const results = await query(sql, [id]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            throw error;
        }
    }

    static async updateAssignedGuests(id) {
        try {
            const sql = `
                UPDATE tour_transports tt
                SET assigned_guests = (
                    SELECT COUNT(*)
                    FROM transport_guest_assignments tga
                    WHERE tga.tour_transport_id = tt.id
                )
                WHERE tt.id = ?
            `;
            const result = await query(sql, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = TourTransport;