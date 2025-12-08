const { query, getConnection } = require("../../config/db");

async function getAllQuotesByCustomerId(id) {
    try {
        let params = [id];
        const sql =
            "SELECT * FROM `quotes` WHERE customer_id = ? AND status = 'sent'";
        const quotes = await query(sql, params);
        return quotes;
    } catch (error) {
        throw error;
    }
}

async function calculateQuotePrice(data) {
    const {
        tour_version_id,
        departure_date,
        adult_count = 0,
        child_count = 0,
        infant_count = 0,
        senior_count = 0,
        additional_services = [],
    } = data;

    try {
        const prices = await query(
            `SELECT * FROM tour_prices
             WHERE tour_version_id = ?
             AND is_active = 1
             AND (valid_from IS NULL OR valid_from <= ?)
             AND (valid_to IS NULL OR valid_to >= ?)`,
            [tour_version_id, departure_date, departure_date]
        );

        if (!prices || prices.length === 0) {
            throw new Error("Không tìm thấy giá cho tour này");
        }

        let subtotal = 0;
        const breakdown = [];

        if (adult_count > 0) {
            const adultPrice = prices.find((p) => p.price_type === "adult");
            if (adultPrice) {
                const amount = parseFloat(adultPrice.price) * adult_count;
                subtotal += amount;
                breakdown.push({
                    type: "adult",
                    label: "Người lớn",
                    quantity: adult_count,
                    unit_price: parseFloat(adultPrice.price),
                    amount: amount,
                });
            }
        }

        if (child_count > 0) {
            const childPrice = prices.find((p) => p.price_type === "child");
            if (childPrice) {
                const amount = parseFloat(childPrice.price) * child_count;
                subtotal += amount;
                breakdown.push({
                    type: "child",
                    label: "Trẻ em",
                    quantity: child_count,
                    unit_price: parseFloat(childPrice.price),
                    amount: amount,
                });
            }
        }

        if (infant_count > 0) {
            const infantPrice = prices.find((p) => p.price_type === "infant");
            if (infantPrice) {
                const amount = parseFloat(infantPrice.price) * infant_count;
                subtotal += amount;
                breakdown.push({
                    type: "infant",
                    label: "Trẻ sơ sinh",
                    quantity: infant_count,
                    unit_price: parseFloat(infantPrice.price),
                    amount: amount,
                });
            }
        }

        if (senior_count > 0) {
            const seniorPrice = prices.find((p) => p.price_type === "senior");
            if (seniorPrice) {
                const amount = parseFloat(seniorPrice.price) * senior_count;
                subtotal += amount;
                breakdown.push({
                    type: "senior",
                    label: "Người cao tuổi",
                    quantity: senior_count,
                    unit_price: parseFloat(seniorPrice.price),
                    amount: amount,
                });
            }
        }

        if (additional_services && additional_services.length > 0) {
            additional_services.forEach((service) => {
                const amount =
                    parseFloat(service.unit_price) * service.quantity;
                subtotal += amount;
                breakdown.push({
                    type: "service",
                    label: service.name,
                    quantity: service.quantity,
                    unit_price: parseFloat(service.unit_price),
                    amount: amount,
                });
            });
        }

        return {
            subtotal,
            breakdown,
        };
    } catch (error) {
        throw error;
    }
}

function generateQuoteNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
    return `QT${timestamp}${random}`;
}

async function createQuote(data) {
    const connection = await getConnection();

    try {
        await connection.beginTransaction();

        const {
            customer_id,
            tour_version_id,
            departure_date,
            adult_count = 0,
            child_count = 0,
            infant_count = 0,
            senior_count = 0,
            additional_services = [],
            discount_amount = 0,
            special_requests = "",
            terms = "",
            valid_days = 7,
            created_by,
        } = data;

        console.log(departure_date);

        const priceData = await calculateQuotePrice({
            tour_version_id,
            departure_date,
            adult_count,
            child_count,
            infant_count,
            senior_count,
            additional_services,
        });

        const subtotal = priceData.subtotal;
        const final_amount = subtotal - discount_amount;

        const quote_number = generateQuoteNumber();

        const valid_until = new Date();
        valid_until.setDate(valid_until.getDate() + valid_days);

        const [result] = await connection.execute(
            `INSERT INTO quotes (
                quote_number,
                customer_id,
                tour_version_id,
                adult_count,
                child_count,
                infant_count,
                senior_count,
                departure_date,
                total_amount,
                discount_amount,
                final_amount,
                currency,
                valid_until,
                terms,
                status,
                created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                quote_number,
                customer_id,
                tour_version_id,
                adult_count,
                child_count,
                infant_count,
                senior_count,
                departure_date,
                subtotal,
                discount_amount,
                final_amount,
                "VND",
                valid_until,
                terms || null,
                "draft",
                created_by,
            ]
        );

        await connection.commit();

        return {
            id: result.insertId,
            quote_number,
            subtotal,
            discount_amount,
            final_amount,
            breakdown: priceData.breakdown,
            valid_until,
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getQuoteById(id) {
    try {
        const quotes = await query(
            `SELECT 
                q.*,
                c.full_name as customer_name,
                c.email as customer_email,
                c.phone as customer_phone,
                t.name as tour_name,
                t.code as tour_code,
                t.slug as tour_slug,
                tv.name as version_name,
                tv.type as version_type
             FROM quotes q
             LEFT JOIN customers c ON c.id = q.customer_id
             LEFT JOIN tour_versions tv ON tv.id = q.tour_version_id
             LEFT JOIN tours t ON t.id = tv.tour_id
             WHERE q.id = ?`,
            [id]
        );
        console.log(quotes);

        if (!quotes || quotes.length === 0) {
            return null;
        }

        return quotes[0];
    } catch (error) {
        throw error;
    }
}

async function updateQuoteStatus(id, status, updated_by) {
    try {
        const timestamp_field =
            status === "sent"
                ? "sent_at"
                : status === "accepted"
                  ? "response_at"
                  : null;

        let sql = "UPDATE quotes SET status = ?";
        const params = [status];

        if (timestamp_field) {
            sql += `, ${timestamp_field} = NOW()`;
        }

        sql += " WHERE id = ?";
        params.push(id);

        const result = await query(sql, params);
        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
}

async function getAllQuotes(filters = {}) {
    try {
        let sql = `
            SELECT 
                q.*,
                c.full_name as customer_name,
                c.email as customer_email,
                t.name as tour_name,
                t.code as tour_code
             FROM quotes q
             LEFT JOIN customers c ON c.id = q.customer_id
             LEFT JOIN tour_versions tv ON tv.id = q.tour_version_id
             LEFT JOIN tours t ON t.id = tv.tour_id
             WHERE 1=1
        `;
        const params = [];

        if (filters.status) {
            sql += " AND q.status = ?";
            params.push(filters.status);
        }

        if (filters.customer_id) {
            sql += " AND q.customer_id = ?";
            params.push(filters.customer_id);
        }

        if (filters.from_date) {
            sql += " AND q.created_at >= ?";
            params.push(filters.from_date);
        }

        if (filters.to_date) {
            sql += " AND q.created_at <= ?";
            params.push(filters.to_date);
        }

        sql += " ORDER BY q.created_at DESC";

        const quotes = await query(sql, params);
        return quotes;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createQuote,
    getQuoteById,
    updateQuoteStatus,
    getAllQuotes,
    calculateQuotePrice,
    getAllQuotesByCustomerId,
};
