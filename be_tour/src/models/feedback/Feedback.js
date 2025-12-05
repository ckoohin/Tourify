const { query } = require("../../config/db");

class Feedback {
    static async getAll(filters = {}, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            let conditions = [];
            let params = [];

            // Build WHERE conditions
            if (filters.feedback_type) {
                conditions.push("f.feedback_type = ?");
                params.push(filters.feedback_type);
            }

            if (filters.tour_departure_id) {
                conditions.push("f.tour_departure_id = ?");
                params.push(filters.tour_departure_id);
            }

            if (filters.supplier_id) {
                conditions.push("f.supplier_id = ?");
                params.push(filters.supplier_id);
            }

            if (filters.staff_id) {
                conditions.push("f.staff_id = ?");
                params.push(filters.staff_id);
            }

            if (filters.priority) {
                conditions.push("f.priority = ?");
                params.push(filters.priority);
            }

            if (filters.status) {
                conditions.push("f.status = ?");
                params.push(filters.status);
            }

            if (filters.submitted_by) {
                conditions.push("f.submitted_by = ?");
                params.push(filters.submitted_by);
            }

            if (filters.assigned_to) {
                conditions.push("f.assigned_to = ?");
                params.push(filters.assigned_to);
            }

            const whereClause = conditions.length > 0 
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

            const countSql = `
                SELECT COUNT(*) as total
                FROM feedbacks f
                ${whereClause}
            `;
            const [countResult] = await query(countSql, params);
            const total = countResult.total;

            const sql = `
                SELECT 
                    f.id,
                    f.feedback_type,
                    f.tour_departure_id,
                    f.supplier_id,
                    f.staff_id,
                    f.subject,
                    f.content,
                    f.priority,
                    f.status,
                    f.submitted_by,
                    f.assigned_to,
                    f.resolved_by,
                    f.resolved_at,
                    f.created_at,
                    f.updated_at,
                    
                    -- Tour departure info
                    td.departure_code,
                    tv.name as tour_version_name,
                    t.name as tour_name,
                    
                    -- Supplier info
                    s.company_name as supplier_name,
                    s.type as supplier_type,
                    
                    -- Staff info
                    st.full_name as staff_name,
                    st.staff_type,
                    
                    -- Submitted by user
                    u_submit.name as submitted_by_name,
                    u_submit.email as submitted_by_email,
                    
                    -- Assigned to user
                    u_assign.name as assigned_to_name,
                    
                    -- Resolved by user
                    u_resolve.name as resolved_by_name
                    
                FROM feedbacks f
                LEFT JOIN tour_departures td ON f.tour_departure_id = td.id
                LEFT JOIN tour_versions tv ON td.tour_version_id = tv.id
                LEFT JOIN tours t ON tv.tour_id = t.id
                LEFT JOIN suppliers s ON f.supplier_id = s.id
                LEFT JOIN staff st ON f.staff_id = st.id
                LEFT JOIN users u_submit ON f.submitted_by = u_submit.id
                LEFT JOIN users u_assign ON f.assigned_to = u_assign.id
                LEFT JOIN users u_resolve ON f.resolved_by = u_resolve.id
                ${whereClause}
                ORDER BY 
                    FIELD(f.status, 'open', 'in_progress', 'resolved', 'closed'),
                    FIELD(f.priority, 'high', 'medium', 'low'),
                    f.created_at DESC
                LIMIT ${limit} OFFSET ${offset}
            `;

            const feedbacks = await query(sql, params);

            return {
                feedbacks,
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

    static async getById(id) {
        try {
            const sql = `
                SELECT 
                    f.id,
                    f.feedback_type,
                    f.tour_departure_id,
                    f.supplier_id,
                    f.staff_id,
                    f.subject,
                    f.content,
                    f.priority,
                    f.status,
                    f.submitted_by,
                    f.assigned_to,
                    f.resolved_by,
                    f.resolved_at,
                    f.created_at,
                    f.updated_at,
                    
                    -- Tour departure info
                    td.departure_code,
                    td.departure_date,
                    tv.name as tour_version_name,
                    t.name as tour_name,
                    t.code as tour_code,
                    
                    -- Supplier info
                    s.company_name as supplier_name,
                    s.type as supplier_type,
                    s.phone as supplier_phone,
                    s.email as supplier_email,
                    
                    -- Staff info
                    st.full_name as staff_name,
                    st.staff_type,
                    st.phone as staff_phone,
                    st.email as staff_email,
                    
                    -- Submitted by user
                    u_submit.name as submitted_by_name,
                    u_submit.email as submitted_by_email,
                    
                    -- Assigned to user
                    u_assign.name as assigned_to_name,
                    u_assign.email as assigned_to_email,
                    
                    -- Resolved by user
                    u_resolve.name as resolved_by_name
                    
                FROM feedbacks f
                LEFT JOIN tour_departures td ON f.tour_departure_id = td.id
                LEFT JOIN tour_versions tv ON td.tour_version_id = tv.id
                LEFT JOIN tours t ON tv.tour_id = t.id
                LEFT JOIN suppliers s ON f.supplier_id = s.id
                LEFT JOIN staff st ON f.staff_id = st.id
                LEFT JOIN users u_submit ON f.submitted_by = u_submit.id
                LEFT JOIN users u_assign ON f.assigned_to = u_assign.id
                LEFT JOIN users u_resolve ON f.resolved_by = u_resolve.id
                WHERE f.id = ?
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
                feedback_type,
                tour_departure_id,
                supplier_id,
                staff_id,
                subject,
                content,
                priority,
                status,
                submitted_by,
                assigned_to
            } = data;

            const sql = `
                INSERT INTO feedbacks (
                    feedback_type,
                    tour_departure_id,
                    supplier_id,
                    staff_id,
                    subject,
                    content,
                    priority,
                    status,
                    submitted_by,
                    assigned_to
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await query(sql, [
                feedback_type,
                tour_departure_id || null,
                supplier_id || null,
                staff_id || null,
                subject,
                content,
                priority || 'medium',
                status || 'open',
                submitted_by,
                assigned_to || null
            ]);

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const {
                subject,
                content,
                priority,
                status,
                assigned_to
            } = data;

            const sql = `
                UPDATE feedbacks
                SET 
                    subject = ?,
                    content = ?,
                    priority = ?,
                    status = ?,
                    assigned_to = ?
                WHERE id = ?
            `;

            const result = await query(sql, [
                subject,
                content,
                priority,
                status,
                assigned_to || null,
                id
            ]);

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async updateStatus(id, status, userId = null) {
        try {
            let sql, params;

            if (status === 'resolved' || status === 'closed') {
                sql = `
                    UPDATE feedbacks
                    SET 
                        status = ?,
                        resolved_by = ?,
                        resolved_at = NOW()
                    WHERE id = ?
                `;
                params = [status, userId, id];
            } else {
                sql = `
                    UPDATE feedbacks
                    SET status = ?
                    WHERE id = ?
                `;
                params = [status, id];
            }

            const result = await query(sql, params);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async assignTo(id, assignedToId) {
        try {
            const sql = `
                UPDATE feedbacks
                SET 
                    assigned_to = ?,
                    status = CASE 
                        WHEN status = 'open' THEN 'in_progress'
                        ELSE status
                    END
                WHERE id = ?
            `;

            const result = await query(sql, [assignedToId, id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const sql = "DELETE FROM feedbacks WHERE id = ?";
            const result = await query(sql, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getStatsByType() {
        try {
            const sql = `
                SELECT 
                    feedback_type,
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
                    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
                    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
                    SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_count,
                    SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_count
                FROM feedbacks
                GROUP BY feedback_type
            `;

            return await query(sql);
        } catch (error) {
            throw error;
        }
    }

    static async getStatsBySupplier(supplierId) {
        try {
            const sql = `
                SELECT 
                    COUNT(*) as total_feedbacks,
                    AVG(CASE 
                        WHEN status = 'resolved' THEN 
                            TIMESTAMPDIFF(HOUR, created_at, resolved_at)
                        ELSE NULL 
                    END) as avg_resolution_hours,
                    SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_count,
                    SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium_priority_count,
                    SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low_priority_count
                FROM feedbacks
                WHERE supplier_id = ?
            `;

            const results = await query(sql, [supplierId]);
            return results[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Feedback;