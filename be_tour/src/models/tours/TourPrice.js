const { query } = require("../../config/db");

async function getAll() {
    try {
        let params = [];
        const sql = `SELECT * FROM tour_prices`;
        const tourPrices = await query(sql, params);
        return tourPrices;
    } catch (error) {
        throw error;
    }
}

async function getAllPriceByTourVersionId(id) {
    try {
        let params = [id, 1];
        const sql = `SELECT id, tour_version_id, price_type, price, currency, is_active FROM tour_prices where tour_version_id = ? AND is_active = ?`;
        const tourPrices = await query(sql, params);
        return tourPrices;
    } catch (error) {
        throw error;
    }
}

async function getById(id) {
    try {
        let params = [id];
        const sql = `SELECT * FROM tour_prices WHERE id=?`;
        const tourPrice = await query(sql, params);
        return tourPrice;
    } catch (error) {
        throw error;
    }
}

async function create(data) {
    try {
        const {
            tour_version_id,
            price_type,
            min_pax,
            max_pax,
            price,
            currency,
            valid_from,
            valid_to,
            description,
            is_active,
        } = data;

        const sql =
            "INSERT INTO `tour_prices`(`tour_version_id`, `price_type`, `min_pax`, `max_pax`, `price`, `currency`, `valid_from`, `valid_to`, `description`, `is_active`) VALUES (?,?,?,?,?,?,?,?,?,?)";

        const result = await query(sql, [
            tour_version_id || null,
            price_type || null,
            min_pax || null,
            max_pax || null,
            price || null,
            currency || null,
            valid_from || null,
            valid_to || null,
            description || null,
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
            tour_version_id,
            price_type,
            min_pax,
            max_pax,
            price,
            currency,
            valid_from,
            valid_to,
            description,
            is_active,
        } = data;

        const sql =
            "UPDATE `tour_prices` SET `tour_version_id`=?,`price_type`=?,`min_pax`=?,`max_pax`=?,`price`=?,`currency`=?,`valid_from`=?,`valid_to`=?,`description`=?,`is_active`=? WHERE id=?";

        const result = await query(sql, [
            tour_version_id || null,
            price_type || null,
            min_pax || null,
            max_pax || null,
            price || null,
            currency || null,
            valid_from || null,
            valid_to || null,
            description || null,
            is_active || null,
            id,
        ]);

        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
}

async function deleteTourPrice(id) {
    try {
        const sql = "DELETE FROM `tour_prices` WHERE id=?";
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
    deleteTourPrice: deleteTourPrice,
    getAllPriceByTourVersionId: getAllPriceByTourVersionId,
};
