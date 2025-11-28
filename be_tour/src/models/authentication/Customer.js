const { query } = require("../../config/db");

async function getAll() {
    try {
        let params = [];
        const sql = "SELECT * FROM `customers`";
        const customers = await query(sql, params);
        return customers;
    } catch (error) {
        throw error;
    }
}

async function getById(id) {
    try {
        let params = [id];
        const sql = "SELECT * FROM `customers` WHERE id=?";
        const customer = await query(sql, params);
        return customer;
    } catch (error) {
        throw error;
    }
}

async function create(data) {
    try {
        const {
            user_id,
            customer_code,
            customer_type,
            full_name,
            email,
            phone,
            id_number,
            birthday,
            gender,
            nationality,
            address,
            city,
            country,
            company_name,
            tax_code,
            notes,
            customer_source,
            assigned_to,
            is_vip,
            is_blacklist,
        } = data;

        const sql =
            "INSERT INTO `customers`(`user_id`, `customer_code`, `customer_type`, `full_name`, `email`, `phone`, `id_number`, `birthday`, `gender`, `nationality`, `address`, `city`, `country`, `company_name`, `tax_code`, `notes`, `customer_source`, `assigned_to`, `is_vip`, `is_blacklist`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        const result = await query(sql, [
            user_id || null,
            customer_code || null,
            customer_type || null,
            full_name || null,
            email || null,
            phone || null,
            id_number || null,
            birthday || null,
            gender || null,
            nationality || null,
            address || null,
            city || null,
            country || null,
            company_name || null,
            tax_code || null,
            notes || null,
            customer_source || null,
            assigned_to || null,
            is_vip || null,
            is_blacklist || null,
        ]);

        return result.insertId;
    } catch (error) {
        throw error;
    }
}

async function update(data, id) {
    try {
        const {
            user_id,
            customer_code,
            customer_type,
            full_name,
            email,
            phone,
            id_number,
            birthday,
            gender,
            nationality,
            address,
            city,
            country,
            company_name,
            tax_code,
            notes,
            customer_source,
            assigned_to,
            is_vip,
            is_blacklist,
        } = data;

        const sql =
            "UPDATE `customers` SET `user_id`=?,`customer_code`=?,`customer_type`=?,`full_name`=?,`email`=?,`phone`=?,`id_number`=?,`birthday`=?,`gender`=?,`nationality`=?,`address`=?,`city`=?,`country`=?,`company_name`=?,`tax_code`=?,`notes`=?,`customer_source`=?,`assigned_to`=?,`is_vip`=?,`is_blacklist`=? WHERE id=?";

        const result = await query(sql, [
            user_id || null,
            customer_code || null,
            customer_type || null,
            full_name || null,
            email || null,
            phone || null,
            id_number || null,
            birthday || null,
            gender || null,
            nationality || null,
            address || null,
            city || null,
            country || null,
            company_name || null,
            tax_code || null,
            notes || null,
            customer_source || null,
            assigned_to || null,
            is_vip || null,
            is_blacklist || null,
            id,
        ]);

        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
}

async function deleteCustomer(id) {
    try {
        const sql = "DELETE FROM `customers` WHERE id=?";
        const result = await query(sql, [id]);

        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAll: getAll,
    getById: getById,
    create: create,
    update: update,
    deleteCustomer: deleteCustomer,
};