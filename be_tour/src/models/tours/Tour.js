const { query } = require("../../config/db");

async function getAll() {
    try {
        let params = [];
        const sql = `
        SELECT 
            tours.id AS tour_id,
            tours.code,
            tours.name,
            tours.slug,
            tours.category_id,
            tours.description,
            tours.highlights,
            tours.duration_days,
            tours.duration_nights,
            tours.departure_location,
            tours.destination,
            tours.min_group_size,
            tours.max_group_size,
            tours.is_customizable,
            tours.qr_code,
            tours.booking_url,
            tours.status,
            GROUP_CONCAT(
                CONCAT(
                    tour_images.id, '|',
                    tour_images.image_url, '|',
                    tour_images.title, '|',
                    tour_images.description, '|',
                    tour_images.display_order, '|',
                    tour_images.is_featured
                ) SEPARATOR ';'
            ) AS images
        FROM tours
        LEFT JOIN tour_images ON tours.id = tour_images.tour_id
        GROUP BY tours.id
        `;
        const tours = await query(sql, params);
        return tours;
    } catch (error) {
        throw error;
    }
}

async function getById(id) {
    try {
        let params = [id];
        const sql = `SELECT * FROM tours WHERE id=?`;
        const tour = await query(sql, params);
        return tour;
    } catch (error) {
        throw error;
    }
}

async function create(data) {
    try {
        const {
            code,
            name,
            slug,
            category_id,
            description,
            highlights,
            duration_days,
            duration_nights,
            departure_location,
            destination,
            min_group_size,
            max_group_size,
            is_customizable,
            qr_code,
            booking_url,
            status,
            created_by,
        } = data;

        const sql = `INSERT INTO tours (code, name, slug, category_id, description, highlights, duration_days, duration_nights, departure_location, destination, min_group_size, max_group_size, is_customizable, qr_code, booking_url, status, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const result = await query(sql, [
            code || null,
            name || null,
            slug || null,
            category_id || null,
            description || null,
            highlights || null,
            duration_days || null,
            duration_nights || null,
            departure_location || null,
            destination || null,
            min_group_size || null,
            max_group_size || null,
            is_customizable || null,
            qr_code || null,
            booking_url || null,
            status || null,
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
            code,
            name,
            slug,
            category_id,
            description,
            highlights,
            duration_days,
            duration_nights,
            departure_location,
            destination,
            min_group_size,
            max_group_size,
            is_customizable,
            qr_code,
            booking_url,
            status,
            created_by,
        } = data;

        const sql =
            "UPDATE `tours` SET `code` = ?, `name` = ?, `slug` = ?, `category_id` = ?, `description` = ?, `highlights` = ?, `duration_days` = ?, `duration_nights` = ?, `departure_location` = ?, `destination` = ?, `min_group_size` = ?, `max_group_size` = ?, `is_customizable` = ?, `qr_code` = ?, `booking_url` = ?, `status` = ?, `created_by` = ? WHERE `id` = ? LIMIT 1;";

        const result = await query(sql, [
            code || null,
            name || null,
            slug || null,
            category_id || null,
            description || null,
            highlights || null,
            duration_days || null,
            duration_nights || null,
            departure_location || null,
            destination || null,
            min_group_size || null,
            max_group_size || null,
            is_customizable || null,
            qr_code || null,
            booking_url || null,
            status || null,
            created_by || null,
            id,
        ]);

        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
}

async function deleteTour(id) {
    try {
        const sql = "DELETE FROM `tours` WHERE id=?";
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
    deleteTour: deleteTour,
};
