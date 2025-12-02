const {
    getAll,
    getById,
    update,
    deleteBookingStatusHistory,
} = require("../../models/bookings/BookingStatusHistory.js");
const { validationResult } = require("express-validator");

async function getAllBookingStatusHistory(req, res, next) {
    try {
        const bookingStatusHistories = await getAll();
        return res.json({
            success: true,
            data: { bookingStatusHistories },
        });
    } catch (error) {
        next(error);
    }
}

async function getBookingStatusHistoryById(req, res, next) {
    try {
        const { id } = req.params;
        const bookingStatusHistory = await getById(id);
        return res.json({
            success: true,
            data: { bookingStatusHistory },
        });
    } catch (error) {
        next(error);
    }
}

async function updateBookingStatusHistory(req, res, next) {
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
            const updatedBookingStatusHistory = await getById(id);
            res.status(201).json({
                success: true,
                message: "Cập nhật trạng thái booking thành công",
                data: { updatedBookingStatusHistory },
            });
        } else {
            res.status(500).json({
                success: false,
                message:
                    "Cập nhật trạng thái booking thất bại, vui lòng kiểm tra lại",
            });
        }
    } catch (error) {
        next(error);
    }
}

async function deleteBookingStatusHistoryFromController(req, res, next) {
    try {
        const { id } = req.params;

        const result = await deleteBookingStatusHistory(id);

        if (result) {
            res.status(201).json({
                success: true,
                message: "Xóa thông tin thành công",
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Xóa thông tin thất bại, vui lòng kiểm tra lại",
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllBookingStatusHistory: getAllBookingStatusHistory,
    getBookingStatusHistoryById: getBookingStatusHistoryById,
    updateBookingStatusHistory: updateBookingStatusHistory,
    deleteBookingStatusHistoryFromController:
        deleteBookingStatusHistoryFromController,
};
