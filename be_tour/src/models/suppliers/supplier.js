const { query } = require("../../config/db");

async function getAll() {
    try {
        let params = [];
        const sql = `SELECT * FROM suppliers`;
        const suppliers = await query(sql, params);
        return suppliers;
    } catch (error) {
        throw error;
    }
}

async function getById(id) {
    try {
        let params = [id];
        const sql = `SELECT * FROM suppliers WHERE id=?`;
        const supplier = await query(sql, params);
        return supplier;
    } catch (error) {
        throw error;
    }
}

async function create(data) {
    try {
        const {
            code,
            type,
            company_name,
            tax_code,
            contact_person,
            phone,
            email,
            address,
            city,
            country,
            website,
            rating,
            total_bookings,
            payment_terms,
            credit_limit,
            status,
            notes,
        } = data;

        const sql = ` INSERT INTO suppliers (code, type, company_name, tax_code, contact_person, phone,email, address, city, country, website, rating, total_bookings, payment_terms, credit_limit, status, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `;

        const result = await query(sql, [
            code || null,
            type || null,
            company_name || null,
            tax_code || null,
            contact_person || null,
            phone || null,
            email || null,
            address || null,
            city || null,
            country || null,
            website || null,
            rating || null,
            total_bookings || null,
            payment_terms || null,
            credit_limit || null,
            status || null,
            notes || null,
        ]);

        return result.insertId;
    } catch (error) {
        throw error;
    }
}

async function update(data, id) {
    try {
        const {
            code,
            type,
            company_name,
            tax_code,
            contact_person,
            phone,
            email,
            address,
            city,
            country,
            website,
            rating,
            total_bookings,
            payment_terms,
            credit_limit,
            status,
            notes,
        } = data;

        const sql =
            "UPDATE `suppliers` SET `code`= ?,`type`=?,`company_name`=?,`tax_code`=?,`contact_person`=?,`phone`=?,`email`=?,`address`=?,`city`=?,`country`=?,`website`=?,`rating`=?,`total_bookings`=?,`payment_terms`=?,`credit_limit`=?,`status`=?,`notes`=?  WHERE id = ? LIMIT 1";

        const result = await query(sql, [
            code || null,
            type || null,
            company_name || null,
            tax_code || null,
            contact_person || null,
            phone || null,
            email || null,
            address || null,
            city || null,
            country || null,
            website || null,
            rating || null,
            total_bookings || null,
            payment_terms || null,
            credit_limit || null,
            status || null,
            notes || null,
            id,
        ]);

        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
}

async function deleteSupplier(id) {
    try {
        const sql = "DELETE FROM `suppliers` WHERE id=?";
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
    deleteSupplier: deleteSupplier,
};
