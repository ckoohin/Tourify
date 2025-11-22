const { query } = require("../../config/db");
require("dotenv").config();
const PORT = process.env.PORT || 5000;
// async function getAll() {
//     try {
//         let params = [];
//         const sql = `SELECT * FROM tours`;
//         const tours = await query(sql, params);
//         return tours;
//     } catch (error) {
//         throw error;
//     }
// }

async function getById(id) {
    try {
        let params = [id];
        const sql = `SELECT * FROM tour_images WHERE id=?`;
        const tourImg = await query(sql, params);
        return tourImg;
    } catch (error) {
        throw error;
    }
}

async function create(data, imgUrl) {
    try {
        const { tour_id, title, description, display_order, is_featured } =
            data;

        const image_url = `http://localhost:${PORT}/tourImg/${imgUrl}`;

        const sql = `INSERT INTO tour_images (tour_id, image_url, title, description, display_order, is_featured)
                    VALUES (?, ?, ?, ?, ?, ?)`;

        const result = await query(sql, [
            tour_id || null,
            image_url || null,
            title || null,
            description || null,
            display_order || null,
            is_featured || null,
        ]);

        return result.insertId;
    } catch (error) {
        throw error;
    }
}

// async function update(data, id) {
//     try {
//         const {
//             code,
//             name,
//             slug,
//             category_id,
//             description,
//             highlights,
//             duration_days,
//             duration_nights,
//             departure_location,
//             destination,
//             min_group_size,
//             max_group_size,
//             is_customizable,
//             qr_code,
//             booking_url,
//             status,
//             created_by,
//         } = data;

//         const sql =
//             "UPDATE `tours` SET `code` = ?, `name` = ?, `slug` = ?, `category_id` = ?, `description` = ?, `highlights` = ?, `duration_days` = ?, `duration_nights` = ?, `departure_location` = ?, `destination` = ?, `min_group_size` = ?, `max_group_size` = ?, `is_customizable` = ?, `qr_code` = ?, `booking_url` = ?, `status` = ?, `created_by` = ? WHERE `id` = ? LIMIT 1;";

//         const result = await query(sql, [
//             code || null,
//             name || null,
//             slug || null,
//             category_id || null,
//             description || null,
//             highlights || null,
//             duration_days || null,
//             duration_nights || null,
//             departure_location || null,
//             destination || null,
//             min_group_size || null,
//             max_group_size || null,
//             is_customizable || null,
//             qr_code || null,
//             booking_url || null,
//             status || null,
//             created_by || null,
//             id,
//         ]);

//         return result.affectedRows > 0;
//     } catch (error) {
//         throw error;
//     }
// }

// async function deleteTour(id) {
//     try {
//         const sql = "DELETE FROM `tours` WHERE id=?";
//         const result = await query(sql, [id]);

//         return result.affectedRows > 0;
//     } catch (error) {
//         throw error;
//     }
// }

module.exports = {
    create: create,
    getById: getById,
};
