const { query } = require("../../config/db");

async function getAll(tour_id = null) {
    try {
        let sql = `SELECT * FROM tour_versions`;
        let params = [];

        if (tour_id) {
            sql += ` WHERE tour_id = ? ORDER BY valid_from DESC`;
            params.push(tour_id);
        } else {
            sql += ` ORDER BY created_at DESC`;
        }
        const tourVersions = await query(sql, params);
        return tourVersions;
    } catch (error) {
        throw error;
    }
}

async function getById(id) {
    try {
        let params = [id];
        const sql = `SELECT * FROM tour_versions WHERE id=?`;
        const tourVersion = await query(sql, params);
        return tourVersion;
    } catch (error) {
        throw error;
    }
}

async function create(data) {
    try {
        const {
            tour_id,
            name,
            type,
            valid_from,
            valid_to,
            description,
            is_default,
            is_active,
        } = data;

        const sql =
            "INSERT INTO tour_versions (`tour_id`, `name`, `type`, `valid_from`, `valid_to`, `description`, `is_default`, `is_active`) VALUES (?,?,?,?,?,?,?,?)";

        const result = await query(sql, [
            tour_id || null,
            name || null,
            type || null,
            valid_from || null,
            valid_to || null,
            description || null,
            is_default || null,
            is_active || null,
        ]);

        return result.insertId;
    } catch (error) {
        throw error;
    }
}

async function update(data, id) {
    try {
        const {
            tour_id,
            name,
            type,
            valid_from,
            valid_to,
            description,
            is_default,
            is_active,
        } = data;

        const sql =
            "UPDATE `tour_versions` SET `tour_id`=?,`name`=?,`type`=?,`valid_from`=?,`valid_to`=?,`description`=?,`is_default`=?,`is_active`=? WHERE id=?";

        const result = await query(sql, [
            tour_id || null,
            name || null,
            type || null,
            valid_from || null,
            valid_to || null,
            description || null,
            is_default || null,
            is_active || null,
            id,
        ]);

        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
}

async function deleteTourVersion(id) {
    try {
        const sql = "DELETE FROM `tour_versions` WHERE id=?";
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
    deleteTourVersion: deleteTourVersion,
};
