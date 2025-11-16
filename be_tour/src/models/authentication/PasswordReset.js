const pool = require('../../config/db');

const createOrUpdateResetToken = async (email, token, expires) => {
    await pool.query(
        `INSERT INTO password_resets (email, token, expires, created_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (email) DO UPDATE SET token = $2, expires = $3, created_at = NOW()`,
        [email, token, expires]
    );
};

const findTokenRecord = async (token) => {
    const result = await pool.query('SELECT * FROM password_resets WHERE token = $1', [token]);
    return result.rows[0] || null;
};

const deleteTokenByToken = async (token) => {
    await pool.query('DELETE FROM password_resets WHERE token = $1', [token]);
};

module.exports = { createOrUpdateResetToken, findTokenRecord, deleteTokenByToken };