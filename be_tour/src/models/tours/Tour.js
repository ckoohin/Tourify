const { query } = require("../../config/db");
const { generateBookingUrl } = require("../../services/bookingUrlService");
const { generateTourQRCode } = require("../../services/qrCodeService");

async function getAll() {
    try {
        let params = [];
        const sql = `
        SELECT 
            t.id AS tour_id,
            t.code,
            t.name,
            t.slug,
            t.category_id,
            tc.name as category_name,  
            t.status,
            t.description,
            t.highlights,
            t.duration_days,
            t.duration_nights,
            t.departure_location,
            t.destination,
            t.min_group_size,
            t.max_group_size,
            t.is_customizable,
            t.updated_at,
            ti.id as tourImg_id,
            ti.image_url,
            ti.is_featured,
            tv.id as version_id,
            tv.name as tourVersion_name,
            tp.id as tourPrice_id,
            tp.price
        FROM tours t
        LEFT JOIN tour_categories tc ON t.category_id = tc.id -- Join lấy tên danh mục
        LEFT JOIN tour_images as ti ON t.id = ti.tour_id
        LEFT JOIN tour_versions tv ON tv.tour_id = t.id
        LEFT JOIN tour_prices tp ON tp.tour_version_id = tv.id
        ORDER BY t.created_at DESC;
        `;
        const tours = await query(sql, params);
        return tours;
    } catch (error) {
        throw error;
    }
}

async function getAllByKeyWord(keyword) {
    try {
        let params = [`%${keyword}%`, `%${keyword}%`];
        const sql = `
        SELECT 
            t.id AS tour_id,
            t.name,
            t.slug,
            t.description,
            t.highlights,
            t.duration_days,
            t.duration_nights,
            ti.id as tourImg_id,
            ti.image_url,
            tv.id,
            tv.name as tourVersion_name,
            tp.id as tourPrice_id,
            tp.price
        FROM tours t
        LEFT JOIN tour_images as ti ON t.id = ti.tour_id
        LEFT JOIN tour_versions tv ON tv.tour_id = t.id
        LEFT JOIN tour_prices tp ON tp.tour_version_id = tv.id
        WHERE t.name LIKE ? OR t.description LIKE ?
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
        const sql = `
        SELECT 
            t.id AS tour_id, t.code, t.name, t.slug, t.category_id, t.status, 
            t.description, t.highlights, t.duration_days, t.duration_nights, 
            t.departure_location, t.destination, t.min_group_size, t.max_group_size, 
            t.is_customizable, t.qr_code, t.booking_url, t.created_at, t.updated_at,
            
            ti.id as tourImg_id,
            ti.image_url,
            ti.is_featured,

            tv.id as version_id,
            tv.name as version_name,
            tv.type as version_type,
            tv.valid_from,
            tv.valid_to,
            
            tp.id as price_id,
            tp.price_type,
            tp.price,
            tp.currency
        FROM tours t
        LEFT JOIN tour_images ti ON ti.tour_id = t.id  
        LEFT JOIN tour_versions tv ON tv.tour_id = t.id
        LEFT JOIN tour_prices tp ON tp.tour_version_id = tv.id
        WHERE t.id = ?
        ORDER BY ti.is_featured DESC, tv.valid_from DESC; 
        `;
        const rows = await query(sql, params);
        return rows; 
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
            status,
            created_by,
        } = data;

        const sql = `INSERT INTO tours (code, name, slug, category_id, description, highlights, duration_days, duration_nights, departure_location, destination, min_group_size, max_group_size, is_customizable, status, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
            status || null,
            created_by || null,
        ]);

        const tourId = result.insertId;
        const booking_url = generateBookingUrl(slug, tourId);
        const qr_code = await generateTourQRCode(tourId, code, booking_url);

        await query(
            'UPDATE tours SET booking_url = ?, qr_code = ? WHERE id = ?',
            [booking_url, qr_code, tourId]
        );
        return tourId;
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

async function cloneTourModel(originalTourId, newData) {
    try {
        const originalTour = await query(
            'SELECT * FROM tours WHERE id = ?',
            [originalTourId]
        );

        if (!originalTour || originalTour.length === 0) {
            throw new Error('Tour không tồn tại');
        }

        const tour = originalTour[0];

        const tourResult = await query(
            `INSERT INTO tours (
                code, name, slug, category_id, description, highlights,
                duration_days, duration_nights, departure_location, destination,
                min_group_size, max_group_size, is_customizable,
                qr_code, booking_url, status, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)`,
            [
                newData.new_code,
                newData.new_name,
                newData.new_slug,
                tour.category_id,
                tour.description,
                tour.highlights,
                tour.duration_days,
                tour.duration_nights,
                tour.departure_location,
                tour.destination,
                tour.min_group_size,
                tour.max_group_size,
                tour.is_customizable,
                null,
                null,
                newData.created_by
            ]
        );

        const newTourId = tourResult.insertId;

        const images = await query(
            'SELECT * FROM tour_images WHERE tour_id = ?',
            [originalTourId]
        );

        for (const img of images) {
            await query(
                `INSERT INTO tour_images (
                    tour_id, image_url, title, description, display_order, is_featured
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    newTourId,
                    img.image_url,
                    img.title,
                    img.description,
                    img.display_order,
                    img.is_featured
                ]
            );
        }

        const policies = await query(
            'SELECT * FROM tour_policies WHERE tour_id = ?',
            [originalTourId]
        );

        for (const policy of policies) {
            await query(
                `INSERT INTO tour_policies (
                    tour_id, policy_type, title, content, display_order, is_active
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    newTourId,
                    policy.policy_type,
                    policy.title,
                    policy.content,
                    policy.display_order,
                    policy.is_active
                ]
            );
        }

        const versions = await query(
            'SELECT * FROM tour_versions WHERE tour_id = ?',
            [originalTourId]
        );

        for (const version of versions) {
            const versionResult = await query(
                `INSERT INTO tour_versions (
                    tour_id, name, type, valid_from, valid_to,
                    description, is_default, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newTourId,
                    version.name,
                    version.type,
                    version.valid_from,
                    version.valid_to,
                    version.description,
                    version.is_default,
                    version.is_active
                ]
            );

            const newVersionId = versionResult.insertId;

            const prices = await query(
                'SELECT * FROM tour_prices WHERE tour_version_id = ?',
                [version.id]
            );

            for (const price of prices) {
                await query(
                    `INSERT INTO tour_prices (
                        tour_version_id, price_type, min_pax, max_pax,
                        price, currency, valid_from, valid_to,
                        description, is_active
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        newVersionId,
                        price.price_type,
                        price.min_pax,
                        price.max_pax,
                        price.price,
                        price.currency,
                        price.valid_from,
                        price.valid_to,
                        price.description,
                        price.is_active
                    ]
                );
            }

            const itineraries = await query(
                'SELECT * FROM tour_itineraries WHERE tour_version_id = ?',
                [version.id]
            );

            for (const itinerary of itineraries) {
                await query(
                    `INSERT INTO tour_itineraries (
                        tour_version_id, day_number, title, description,
                        activities, meals, accommodation, notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        newVersionId,
                        itinerary.day_number,
                        itinerary.title,
                        itinerary.description,
                        itinerary.activities,
                        itinerary.meals,
                        itinerary.accommodation,
                        itinerary.notes
                    ]
                );
            }
        }

        return newTourId;

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
    getAllByKeyWord: getAllByKeyWord,
    cloneTourModel: cloneTourModel,
};
