const {
    getAll,
    getById,
    create,
    update,
    deleteBooking,
} = require("../../models/bookings/Booking.js");
const { validationResult } = require("express-validator");

async function getAllBookings(req, res, next) {
    try {
        const bookings = await getAll();
        return res.json({
            success: true,
            data: { bookings },
        });
    } catch (error) {
        next(error);
    }
}

async function getBookingById(req, res, next) {
    try {
        const { id } = req.params;
        const booking = await getById(id);
        return res.json({
            success: true,
            data: { booking },
        });
    } catch (error) {
        next(error);
    }
}

async function createBooking(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: errors.array(),
            });
        }

        const bookingId = await create(req.body);

        const newBooking = await getById(bookingId);

        res.status(201).json({
            success: true,
            message: "Tạo thông tin booking thành công",
            data: { booking: newBooking },
        });
    } catch (error) {
        next(error);
    }
}

async function updateBooking(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: errors.array(),
            });
        }

        const { id } = req.params;

        const result = await update(req.body, id);

        if (result) {
            const updatedBooking = await getById(id);
            res.status(201).json({
                success: true,
                message: "Cập nhật thông tin booking thành công",
                data: { updatedBooking },
            });
        } else {
            res.status(500).json({
                success: false,
                message:
                    "Cập nhật thông tin booking thất bại, vui lòng kiểm tra lại",
            });
        }
    } catch (error) {
        next(error);
    }
}

async function deleteBookingFromController(req, res, next) {
    try {
        const { id } = req.params;

        const result = await deleteBooking(id);

        if (result) {
            res.status(201).json({
                success: true,
                message: "Xóa thông tin booking thành công",
            });
        } else {
            res.status(500).json({
                success: false,
                message:
                    "Xóa thông tin booking thất bại, vui lòng kiểm tra lại",
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllBookings: getAllBookings,
    getBookingById: getBookingById,
    createBooking: createBooking,
    updateBooking: updateBooking,
    deleteBookingFromController: deleteBookingFromController,
};
