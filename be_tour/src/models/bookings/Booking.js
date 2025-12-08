const { query } = require("../../config/db");

async function getAll() {
    try {
        let params = [];
        const sql = "SELECT * FROM `bookings` ORDER BY created_at DESC";
        const bookings = await query(sql, params);
        return bookings;
    } catch (error) {
        throw error;
    }
}

async function getById(id) {
    try {
        let params = [id];
        const sql = "SELECT * FROM `bookings` WHERE id=?";
        const booking = await query(sql, params);
        return booking;
    } catch (error) {
        throw error;
    }
}

async function create(data) {
    try {
        const {
            booking_code,
            customer_id,
            tour_version_id,
            booking_type,
            departure_date,
            total_adults,
            total_children,
            total_infants,
            total_senior,
            // total_guests,
            unit_price,
            total_amount,
            discount_amount,
            // final_amount,
            paid_amount,
            // remaining_amount,
            currency,
            status,
            special_requests,
            coupon_code,
            internal_notes,
            cancel_reason,
            cancelled_at,
            sales_person_id,
            created_by,
        } = data;

        const sql =
            "INSERT INTO `bookings`(`booking_code`, `customer_id`, `tour_version_id`, `booking_type`, `departure_date`, `total_adults`, `total_children`, `total_infants`, `total_senior`, `unit_price`, `total_amount`, `discount_amount`, `paid_amount`, `currency`, `status`, `special_requests`, `coupon_code`, `internal_notes`, `cancel_reason`, `cancelled_at`, `sales_person_id`, `created_by`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        const result = await query(sql, [
            booking_code || null,
            customer_id || null,
            tour_version_id || null,
            booking_type || null,
            departure_date || null,
            total_adults || 0,
            total_children || 0,
            total_infants || 0,
            total_senior || 0,
            // total_guests,
            unit_price || 0,
            total_amount || 0,
            discount_amount || 0,
            // final_amount,
            paid_amount || 0,
            // remaining_amount,
            currency || "VND",
            status || "pending",
            special_requests || null,
            coupon_code || null,
            internal_notes || null,
            cancel_reason || null,
            cancelled_at || null,
            sales_person_id || null,
            created_by || null,
        ]);

        return result.insertId;
    } catch (error) {
        throw error;
    }
}

async function update(data, id) {
    try {
        const {
            booking_code,
            customer_id,
            tour_version_id,
            booking_type,
            departure_date,
            total_adults,
            total_children,
            total_infants,
            // total_guests,
            unit_price,
            total_amount,
            discount_amount,
            // final_amount,
            paid_amount,
            // remaining_amount,
            currency,
            status,
            special_requests,
            coupon_code,
            internal_notes,
            cancel_reason,
            cancelled_at,
            sales_person_id,
            created_by,
        } = data;

        const sql =
            "UPDATE `bookings` SET `booking_code`=?,`customer_id`=?,`tour_version_id`=?,`booking_type`=?,`departure_date`=?,`total_adults`=?,`total_children`=?,`total_infants`=?,`unit_price`=?,`total_amount`=?,`discount_amount`=?,`paid_amount`=?,`currency`=?,`status`=?,`special_requests`=?,`coupon_code`=?,`internal_notes`=?,`cancel_reason`=?,`cancelled_at`=?,`sales_person_id`=?,`created_by`=? WHERE id=?";

        const result = await query(sql, [
            booking_code || null,
            customer_id || null,
            tour_version_id || null,
            booking_type || null,
            departure_date || null,
            total_adults || 0,
            total_children || 0,
            total_infants || 0,
            // total_guests,
            unit_price || 0,
            total_amount || 0,
            discount_amount || 0,
            // final_amount,
            paid_amount || 0,
            // remaining_amount,
            currency || null,
            status || null,
            special_requests || null,
            coupon_code || null,
            internal_notes || null,
            cancel_reason || null,
            cancelled_at || null,
            sales_person_id || null,
            created_by || null,
            id,
        ]);

        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
}

async function deleteBooking(id) {
    try {
        const sql = "DELETE FROM `bookings` WHERE id=?";
        const result = await query(sql, [id]);

        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAll: getAll,
    getById: getById,
    create: create,
    update: update,
    deleteBooking: deleteBooking,
};
