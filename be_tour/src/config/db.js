const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tourify",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: "utf8mb4",
    timezone: "+07:00",
});

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Database connected successfully");
        connection.release();
        return true;
    } catch (error) {
        console.error("Database connection failed:", error.message);
        return false;
    }
};

const query = async (sql, params) => {
    try {
        console.log("\n===== DEBUG SQL EXECUTION =====");
        console.log("SQL:", sql);
        console.log("PARAMS:", params);
        console.log("PLACEHOLDERS:", (sql.match(/\?/g) || []).length);
        console.log("PARAM COUNT:", params?.length || 0);
        console.log("================================\n");

        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error("\n===== SQL ERROR DEBUG =====");
        console.error("SQL:", sql);
        console.error("PARAMS:", params);
        console.error("PLACEHOLDERS:", (sql.match(/\?/g) || []).length);
        console.error("PARAM COUNT:", params?.length || 0);
        console.error("ERROR:", error);
        console.error("================================\n");
        throw error;
    }
};

module.exports = {
    pool,
    query,
    testConnection,
};
