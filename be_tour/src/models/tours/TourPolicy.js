const { query } = require("../../config/db");

class TourPolicy {
    static async getByTour(tourId) {
        try {
            const sql = `
                SELECT 
                    id,
                    tour_id,
                    policy_type,
                    title,
                    content,
                    display_order,
                    is_active,
                    created_at,
                    updated_at
                FROM tour_policies
                WHERE tour_id = ?
                ORDER BY display_order ASC, id ASC
            `;
            return await query(sql, [tourId]);
        } catch (error) {
            throw error;
        }
    }

    static async getByTourAndType(tourId, policyType) {
        try {
            const sql = `
                SELECT 
                    id,
                    tour_id,
                    policy_type,
                    title,
                    content,
                    display_order,
                    is_active,
                    created_at,
                    updated_at
                FROM tour_policies
                WHERE tour_id = ? AND policy_type = ?
                ORDER BY display_order ASC
            `;
            return await query(sql, [tourId, policyType]);
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        try {
            const sql = `
                SELECT 
                    id,
                    tour_id,
                    policy_type,
                    title,
                    content,
                    display_order,
                    is_active,
                    created_at,
                    updated_at
                FROM tour_policies
                WHERE id = ?
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
                tour_id,
                policy_type,
                title,
                content,
                display_order,
                is_active
            } = data;

            const sql = `
                INSERT INTO tour_policies (
                    tour_id,
                    policy_type,
                    title,
                    content,
                    display_order,
                    is_active
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;

            const result = await query(sql, [
                tour_id,
                policy_type,
                title,
                content,
                display_order || 0,
                is_active !== undefined ? is_active : 1
            ]);

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const {
                policy_type,
                title,
                content,
                display_order,
                is_active
            } = data;

            const sql = `
                UPDATE tour_policies
                SET 
                    policy_type = ?,
                    title = ?,
                    content = ?,
                    display_order = ?,
                    is_active = ?
                WHERE id = ?
            `;

            const result = await query(sql, [
                policy_type,
                title,
                content,
                display_order,
                is_active,
                id
            ]);

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const sql = "DELETE FROM tour_policies WHERE id = ?";
            const result = await query(sql, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async deleteByTour(tourId) {
        try {
            const sql = "DELETE FROM tour_policies WHERE tour_id = ?";
            const result = await query(sql, [tourId]);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    static async updateStatus(id, isActive) {
        try {
            const sql = "UPDATE tour_policies SET is_active = ? WHERE id = ?";
            const result = await query(sql, [isActive, id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async updateDisplayOrder(id, displayOrder) {
        try {
            const sql = "UPDATE tour_policies SET display_order = ? WHERE id = ?";
            const result = await query(sql, [displayOrder, id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = TourPolicy;