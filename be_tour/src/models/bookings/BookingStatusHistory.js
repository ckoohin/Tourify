const { query } = require("../../config/db");

async function getAll() {
    try {
        let params = [];
        const sql = "SELECT * FROM `booking_status_history`";
        const bookingStatusHistories = await query(sql, params);
        return bookingStatusHistories;
    } catch (error) {
        throw error;
    }
}

async function getById(id) {
    try {
        let params = [id];
        const sql = "SELECT * FROM `booking_status_history` WHERE id=?";
        const bookingStatusHistory = await query(sql, params);
        return bookingStatusHistory;
    } catch (error) {
        throw error;
    }
}

async function create(data) {
    try {
        const sql =
            "INSERT INTO `booking_status_history`(`booking_id`, `from_status`, `to_status`, `notes`, `changed_by`, `image_url`) VALUES (?, ?, ?, ?, ?, ?)";

        const result = await query(sql, [
            data.booking_id || null,
            data.from_status || null,
            data.to_status || null,
            data.notes || null,
            data.changed_by || null,
            data.image_url || null,
        ]);

        return result.insertId;
    } catch (error) {
        throw error;
    }
}

async function update(data, id) {
    try {
        const {
            booking_id,
            from_status,
            to_status,
            notes,
            changed_by,
            image_url,
        } = data;

        const sql =
            "UPDATE `booking_status_history` SET `booking_id`= ?,`from_status`= ?,`to_status`= ?,`notes`= ?,`changed_by`= ?,`image_url`=? WHERE id=?";

        const result = await query(sql, [
            booking_id || null,
            from_status || null,
            to_status || null,
            notes || null,
            changed_by || null,
            image_url || null,
            id,
        ]);

        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
}

async function deleteBookingStatusHistory(id) {
    try {
        const sql = "DELETE FROM `booking_status_history` WHERE id=?";
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
    deleteBookingStatusHistory: deleteBookingStatusHistory,
};
