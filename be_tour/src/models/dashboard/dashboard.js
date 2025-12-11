const { query } = require("../../config/db");

async function getProfit() {
    try {
        let params = [];
        const sql = "SELECT SUM(final_amount) AS profit FROM bookings";
        const profit = await query(sql, params);
        return profit;
    } catch (error) {
        throw error;
    }
}

async function getTotalBooking() {
    try {
        let params = [];
        const sql = "SELECT COUNT(id) AS totalBooking FROM bookings";
        const totalBooking = await query(sql, params);
        return totalBooking;
    } catch (error) {
        throw error;
    }
}

async function getTotalCustomer() {
    try {
        let params = [];
        const sql = "SELECT SUM(total_guests) AS totalCustomer FROM bookings";
        const totalCustomer = await query(sql, params);
        return totalCustomer;
    } catch (error) {
        throw error;
    }
}

async function getAllToursRevenue() {
    try {
        let params = [];
        const sql = `SELECT 
            t.id,
            t.name,
            bk.remaining_amount
        FROM bookings bk
        LEFT JOIN tour_versions tv ON bk.tour_version_id = tv.id    
        INNER JOIN tours t ON t.id =tv.tour_id
        `;
        const result = await query(sql, params);
        return result;
    } catch (error) {
        throw error;
    }
}

async function getBookingStatuses() {
    try {
        let params = [];
        const sql = `SELECT 
            status AS booking_status,
            COUNT(*) AS booking_count
        FROM 
            bookings
        WHERE 
            status IN ('pending','confirmed','deposited','paid','completed','cancelled')
        GROUP BY 
            status`;
        const result = await query(sql, params);
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getProfit: getProfit,
    getTotalBooking: getTotalBooking,
    getTotalCustomer: getTotalCustomer,
    getAllToursRevenue: getAllToursRevenue,
    getBookingStatuses: getBookingStatuses,
};
