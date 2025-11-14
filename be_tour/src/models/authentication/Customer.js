const pool = require('../../config/db');

const createCustomer = async (data, client) => {
    const db = client || pool;
    const { name, email, phone, address, user_id } = data;
    const result = await db.query(
        'INSERT INTO customers (name, email, phone, address, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, email, phone, address, user_id]
    );
    return result.rows[0];
};

const findCustomerByUserId = async (userId) => {
    const result = await pool.query('SELECT * FROM customers WHERE user_id = $1', [userId]);
    return result.rows[0] || null;
};

module.exports = { createCustomer, findCustomerByUserId };