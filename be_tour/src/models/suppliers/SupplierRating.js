const { query } = require("../../config/db");

class SupplierRating {
    static async getBySupplier(supplierId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;

            const countSql = `
                SELECT COUNT(*) as total
                FROM supplier_ratings
                WHERE supplier_id = ?
            `;
            const [countResult] = await query(countSql, [supplierId]);
            const total = countResult.total;

            const sql = `
                SELECT 
                    sr.id,
                    sr.supplier_id,
                    sr.tour_departure_id,
                    sr.service_booking_id,
                    sr.rating_type,
                    sr.rating,
                    sr.comment,
                    sr.rated_by,
                    sr.rated_at,
                    
                    -- Tour info
                    td.departure_code,
                    td.departure_date,
                    tv.name as tour_version_name,
                    t.name as tour_name,
                    
                    -- Rater info
                    u.name as rater_name,
                    u.email as rater_email
                    
                FROM supplier_ratings sr
                LEFT JOIN tour_departures td ON sr.tour_departure_id = td.id
                LEFT JOIN tour_versions tv ON td.tour_version_id = tv.id
                LEFT JOIN tours t ON tv.tour_id = t.id
                LEFT JOIN users u ON sr.rated_by = u.id
                WHERE sr.supplier_id = ?
                ORDER BY sr.rated_at DESC
                LIMIT ${limit} OFFSET ${offset}
            `;

            const ratings = await query(sql, [supplierId]);

            return {
                ratings,
                pagination: {
                    currentPage: page,
                    limit,
                    totalItems: total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    static async getByTourDeparture(tourDepartureId) {
        try {
            const sql = `
                SELECT 
                    sr.id,
                    sr.supplier_id,
                    sr.rating_type,
                    sr.rating,
                    sr.comment,
                    sr.rated_by,
                    sr.rated_at,
                    
                    s.company_name as supplier_name,
                    s.type as supplier_type,
                    
                    u.name as rater_name
                    
                FROM supplier_ratings sr
                LEFT JOIN suppliers s ON sr.supplier_id = s.id
                LEFT JOIN users u ON sr.rated_by = u.id
                WHERE sr.tour_departure_id = ?
                ORDER BY sr.rated_at DESC
            `;

            return await query(sql, [tourDepartureId]);
        } catch (error) {
            throw error;
        }
    }

    static async create(data) {
        try {
            const {
                supplier_id,
                tour_departure_id,
                service_booking_id,
                rating_type,
                rating,
                comment,
                rated_by
            } = data;

            const sql = `
                INSERT INTO supplier_ratings (
                    supplier_id,
                    tour_departure_id,
                    service_booking_id,
                    rating_type,
                    rating,
                    comment,
                    rated_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await query(sql, [
                supplier_id,
                tour_departure_id || null,
                service_booking_id || null,
                rating_type,
                rating,
                comment || null,
                rated_by
            ]);

            await this.updateSupplierAverageRating(supplier_id);

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const { rating_type, rating, comment } = data;

            const sql = `
                UPDATE supplier_ratings
                SET 
                    rating_type = ?,
                    rating = ?,
                    comment = ?
                WHERE id = ?
            `;

            const result = await query(sql, [
                rating_type,
                rating,
                comment || null,
                id
            ]);

            // Lấy supplier_id để cập nhật rating trung bình
            if (result.affectedRows > 0) {
                const [rating_record] = await query(
                    "SELECT supplier_id FROM supplier_ratings WHERE id = ?",
                    [id]
                );
                if (rating_record) {
                    await this.updateSupplierAverageRating(rating_record.supplier_id);
                }
            }

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            // Lấy supplier_id trước khi xóa
            const [rating_record] = await query(
                "SELECT supplier_id FROM supplier_ratings WHERE id = ?",
                [id]
            );

            const sql = "DELETE FROM supplier_ratings WHERE id = ?";
            const result = await query(sql, [id]);

            // Cập nhật rating trung bình
            if (result.affectedRows > 0 && rating_record) {
                await this.updateSupplierAverageRating(rating_record.supplier_id);
            }

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async updateSupplierAverageRating(supplierId) {
        try {
            const sql = `
                UPDATE suppliers
                SET rating = (
                    SELECT COALESCE(AVG(rating), 0)
                    FROM supplier_ratings
                    WHERE supplier_id = ?
                )
                WHERE id = ?
            `;

            await query(sql, [supplierId, supplierId]);
        } catch (error) {
            throw error;
        }
    }

    static async getStatsBySupplier(supplierId) {
        try {
            const sql = `
                SELECT 
                    rating_type,
                    COUNT(*) as total_ratings,
                    AVG(rating) as avg_rating,
                    MIN(rating) as min_rating,
                    MAX(rating) as max_rating
                FROM supplier_ratings
                WHERE supplier_id = ?
                GROUP BY rating_type
            `;

            return await query(sql, [supplierId]);
        } catch (error) {
            throw error;
        }
    }

    static async getByTourDepartureAndSupplier(tourDepartureId, supplierId) {
        try {
            const sql = `
                SELECT 
                    sr.id,
                    sr.rating_type,
                    sr.rating,
                    sr.comment,
                    sr.rated_by,
                    sr.rated_at,
                    u.name as rater_name
                FROM supplier_ratings sr
                LEFT JOIN users u ON sr.rated_by = u.id
                WHERE sr.tour_departure_id = ? AND sr.supplier_id = ?
                ORDER BY sr.rated_at DESC
            `;

            return await query(sql, [tourDepartureId, supplierId]);
        } catch (error) {
            throw error;
        }
    }

    static async hasRated(tourDepartureId, supplierId, ratedBy, ratingType) {
        try {
            const sql = `
                SELECT id
                FROM supplier_ratings
                WHERE tour_departure_id = ? 
                  AND supplier_id = ?
                  AND rated_by = ?
                  AND rating_type = ?
            `;

            const results = await query(sql, [tourDepartureId, supplierId, ratedBy, ratingType]);
            return results.length > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = SupplierRating;