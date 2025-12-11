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

// Chỉ lấy danh sách khách hàng trong bảng quotes với điều kiện status = sent
async function getAllCustomerInQuotes() {
    try {
        let params = [];
        const sql = `SELECT DISTINCT c.*
                    FROM customers c
                    JOIN quotes q ON c.id = q.customer_id
                    WHERE q.status='sent'`;
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

async function createCustomersFromBooking(bookingId, guestsData, userId) {
    const connection = await getConnection();
    try {
        await connection.beginTransaction();

        const [bookings] = await connection.execute(
            `SELECT b.*, tv.tour_id, td.id as tour_departure_id
             FROM bookings b
             LEFT JOIN tour_versions tv ON b.tour_version_id = tv.id
             LEFT JOIN tour_departures td ON td.tour_version_id = tv.id 
                AND td.departure_date = b.departure_date
             WHERE b.id = ?`,
            [bookingId]
        );

        if (!bookings || bookings.length === 0) {
            throw new Error("Booking không tồn tại");
        }

        const booking = bookings[0];
        
        if (!booking.tour_departure_id) {
            throw new Error("Chưa có tour departure cho booking này");
        }

        const totalGuestsInBooking = booking.total_guests;
        const totalGuestsToCreate = guestsData.length;

        if (totalGuestsToCreate > totalGuestsInBooking) {
            throw new Error(
                `Số lượng khách vượt quá booking (Đã đặt: ${totalGuestsInBooking}, Đang tạo: ${totalGuestsToCreate})`
            );
        }

        const createdGuests = [];

        for (const guestData of guestsData) {
            let customerId = guestData.customer_id;
            if (!customerId) {
                const [existingCustomers] = await connection.execute(
                    `SELECT id FROM customers 
                     WHERE (email = ? AND email IS NOT NULL) 
                        OR (phone = ? AND phone IS NOT NULL)
                     LIMIT 1`,
                    [guestData.email || null, guestData.phone || null]
                );

                if (existingCustomers.length > 0) {
                    customerId = existingCustomers[0].id;
                } else {
                    const customerCode = `CUS${Date.now()}${Math.floor(Math.random() * 1000)}`;
                    const [customerResult] = await connection.execute(
                        `INSERT INTO customers 
                        (customer_code, customer_type, full_name, email, phone, 
                         id_number, birthday, gender, nationality, address, city, 
                         country, notes, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                        [
                            customerCode,
                            guestData.customer_type || 'individual',
                            guestData.full_name,
                            guestData.email || null,
                            guestData.phone || null,
                            guestData.id_number || null,
                            guestData.birthday || null,
                            guestData.gender || null,
                            guestData.nationality || 'Vietnam',
                            guestData.address || null,
                            guestData.city || null,
                            guestData.country || 'Vietnam',
                            guestData.notes || null
                        ]
                    );
                    customerId = customerResult.insertId;
                }
            }

            const [bookingGuestResult] = await connection.execute(
                `INSERT INTO booking_guests 
                (booking_id, guest_type, title, first_name, last_name, 
                 birthday, gender, nationality, id_number, id_issue_date, id_expiry_date,
                 phone, email, is_primary_contact, special_requests, medical_notes, 
                 created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    bookingId,
                    guestData.guest_type || 'adult',
                    guestData.title || 'Mr',
                    guestData.first_name,
                    guestData.last_name,
                    guestData.birthday || null,
                    guestData.gender || null,
                    guestData.nationality || 'Vietnam',
                    guestData.id_number || null,
                    guestData.id_issue_date || null,
                    guestData.id_expiry_date || null,
                    guestData.phone || null,
                    guestData.email || null,
                    guestData.is_primary_contact || 0,
                    guestData.special_requests || null,
                    guestData.medical_notes || null
                ]
            );

            const bookingGuestId = bookingGuestResult.insertId;

            const [departureGuestResult] = await connection.execute(
                `INSERT INTO tour_departure_guests 
                (tour_departure_id, booking_id, booking_guest_id, 
                 checked_in, attendance_status, notes, created_at, updated_at)
                VALUES (?, ?, ?, 0, 'confirmed', ?, NOW(), NOW())`,
                [
                    booking.tour_departure_id,
                    bookingId,
                    bookingGuestId,
                    guestData.notes || null
                ]
            );

            createdGuests.push({
                customer_id: customerId,
                booking_guest_id: bookingGuestId,
                tour_departure_guest_id: departureGuestResult.insertId,
                full_name: `${guestData.first_name} ${guestData.last_name}`,
                guest_type: guestData.guest_type || 'adult'
            });
        }

        const [departureUpdate] = await connection.execute(
            `UPDATE tour_departures 
             SET confirmed_guests = confirmed_guests + ?
             WHERE id = ?`,
            [guestsData.length, booking.tour_departure_id]
        );

        await connection.commit();
        
        return {
            booking_id: bookingId,
            tour_departure_id: booking.tour_departure_id,
            guests_created: createdGuests.length,
            guests: createdGuests
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getCustomersFromBooking(bookingId) {
    try {
        const sql = `
            SELECT 
                c.id as customer_id,
                c.full_name as customer_full_name,
                c.email as customer_email,
                c.phone as customer_phone,
                bg.id as booking_guest_id,
                bg.guest_type,
                bg.full_name as guest_full_name,
                bg.birthday,
                bg.gender,
                bg.phone as guest_phone,
                bg.email as guest_email,
                bg.special_requests,
                bg.medical_notes,
                tdg.id as departure_guest_id,
                tdg.checked_in,
                tdg.attendance_status,
                tdg.room_number,
                tdg.room_type
            FROM booking_guests bg
            LEFT JOIN customers c ON c.id = (
                SELECT id FROM customers 
                WHERE (email = bg.email AND email IS NOT NULL) 
                   OR (phone = bg.phone AND phone IS NOT NULL)
                LIMIT 1
            )
            LEFT JOIN tour_departure_guests tdg ON tdg.booking_guest_id = bg.id
            WHERE bg.booking_id = ?
            ORDER BY bg.guest_type, bg.id
        `;

        const guests = await query(sql, [bookingId]);
        return guests;

    } catch (error) {
        throw error;
    }
}

async function checkAvailableSlots(bookingId) {
    try {
        const sql = `
            SELECT 
                b.total_adults,
                b.total_children,
                b.total_infants,
                b.total_guests,
                COUNT(CASE WHEN bg.guest_type = 'adult' THEN 1 END) as added_adults,
                COUNT(CASE WHEN bg.guest_type = 'child' THEN 1 END) as added_children,
                COUNT(CASE WHEN bg.guest_type = 'infant' THEN 1 END) as added_infants,
                COUNT(bg.id) as total_added
            FROM bookings b
            LEFT JOIN booking_guests bg ON b.id = bg.booking_id
            WHERE b.id = ?
            GROUP BY b.id
        `;

        const [result] = await query(sql, [bookingId]);

        if (!result) {
            throw new Error("Booking không tồn tại");
        }

        return {
            booking_id: bookingId,
            total_capacity: {
                adults: result.total_adults,
                children: result.total_children,
                infants: result.total_infants,
                total: result.total_guests
            },
            added: {
                adults: result.added_adults || 0,
                children: result.added_children || 0,
                infants: result.added_infants || 0,
                total: result.total_added || 0
            },
            available: {
                adults: result.total_adults - (result.added_adults || 0),
                children: result.total_children - (result.added_children || 0),
                infants: result.total_infants - (result.added_infants || 0),
                total: result.total_guests - (result.total_added || 0)
            }
        };

    } catch (error) {
        throw error;
    }
}

async function removeGuestFromBooking(bookingGuestId, userId) {
    const connection = await getConnection();
    try {
        await connection.beginTransaction();

        const [guests] = await connection.execute(
            `SELECT booking_id, guest_type FROM booking_guests WHERE id = ?`,
            [bookingGuestId]
        );

        if (!guests || guests.length === 0) {
            throw new Error("Khách không tồn tại");
        }

        const guest = guests[0];

        await connection.execute(
            `DELETE FROM tour_departure_guests WHERE booking_guest_id = ?`,
            [bookingGuestId]
        );

        await connection.execute(
            `DELETE FROM booking_guests WHERE id = ?`,
            [bookingGuestId]
        );

        await connection.execute(
            `UPDATE tour_departures td
             JOIN bookings b ON b.departure_date = td.departure_date
             SET td.confirmed_guests = td.confirmed_guests - 1
             WHERE b.id = ? AND td.confirmed_guests > 0`,
            [guest.booking_id]
        );

        await connection.commit();

        return {
            success: true,
            booking_guest_id: bookingGuestId,
            booking_id: guest.booking_id
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    getAll: getAll,
    getAllCustomerInQuotes: getAllCustomerInQuotes,
    getById: getById,
    create: create,
    update: update,
    deleteCustomer: deleteCustomer,
    createCustomersFromBooking,
    getCustomersFromBooking,
    checkAvailableSlots,
    removeGuestFromBooking
};
