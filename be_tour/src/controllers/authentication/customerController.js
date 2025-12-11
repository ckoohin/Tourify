const {
    getAll,
    getAllCustomerInQuotes,
    getById,
    create,
    update,
    deleteCustomer,
    createCustomersFromBooking,
    getCustomersFromBooking,
    checkAvailableSlots,
    removeGuestFromBooking
} = require("../../models/authentication/Customer.js");
const { validationResult } = require("express-validator");
const ApiResponse = require("../../utils/apiResponse");

async function getAllCustomers(req, res, next) {
    try {
        const customers = await getAll();
        return res.json({
            success: true,
            data: { customers },
        });
    } catch (error) {
        next(error);
    }
}

// Chỉ lấy danh sách khách hàng trong bảng quotes với điều kiện status = sent
async function fetchAllCustomersInQuotes(req, res, next) {
    try {
        const customers = await getAllCustomerInQuotes();
        return res.json({
            success: true,
            data: { customers },
        });
    } catch (error) {
        next(error);
    }
}

async function getCustomerById(req, res, next) {
    try {
        const { id } = req.params;
        const customer = await getById(id);
        return res.json({
            success: true,
            data: { customer },
        });
    } catch (error) {
        next(error);
    }
}

async function createCustomer(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: errors.array(),
            });
        }

        const customerId = await create(req.body);

        const newCustomer = await getById(customerId);

        res.status(201).json({
            success: true,
            message: "Tạo thông tin khách hàng thành công",
            data: { customer: newCustomer },
        });
    } catch (error) {
        next(error);
    }
}

async function updateCustomer(req, res, next) {
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
            const updatedCustomer = await getById(id);
            res.status(201).json({
                success: true,
                message: "Cập nhật thông tin khách hàng thành công",
                data: { updatedCustomer: updatedCustomer },
            });
        } else {
            res.status(500).json({
                success: false,
                message:
                    "Cập nhật thông tin khách hàng thất bại, vui lòng kiểm tra lại",
            });
        }
    } catch (error) {
        next(error);
    }
}

async function deleteCustomerFromController(req, res, next) {
    try {
        const { id } = req.params;

        const result = await deleteCustomer(id);

        if (result) {
            res.status(201).json({
                success: true,
                message: "Xóa thông tin khách hàng thành công",
            });
        } else {
            res.status(500).json({
                success: false,
                message:
                    "Xóa thông tin khách hàng thất bại, vui lòng kiểm tra lại",
            });
        }
    } catch (error) {
        next(error);
    }
}

async function createGuestsFromBooking(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ApiResponse.error(res, {
                message: "Dữ liệu không hợp lệ",
                statusCode: 400,
                errors: errors.array()
            });
        }

        const { booking_id, guests } = req.body;
        const userId = req.user.id;

        const availableSlots = await checkAvailableSlots(booking_id);

        if (availableSlots.available.total < guests.length) {
            return ApiResponse.error(res, {
                message: `Số lượng khách vượt quá số lượng đã booking. Còn trống: ${availableSlots.available.total} chỗ`,
                statusCode: 400,
                errors: availableSlots
            });
        }
        const guestsByType = {
            adult: guests.filter(g => g.guest_type === 'adult').length,
            child: guests.filter(g => g.guest_type === 'child').length,
            infant: guests.filter(g => g.guest_type === 'infant').length
        };

        if (guestsByType.adult > availableSlots.available.adults ||
            guestsByType.child > availableSlots.available.children ||
            guestsByType.infant > availableSlots.available.infants) {
            return ApiResponse.error(res, {
                message: "Số lượng khách theo từng loại vượt quá số lượng đã đặt",
                statusCode: 400,
                errors: {
                    available: availableSlots.available,
                    requesting: guestsByType
                }
            });
        }

        const result = await createCustomersFromBooking(booking_id, guests, userId);

        return ApiResponse.success(res, {
            message: "Tạo danh sách khách thành công",
            data: result,
            statusCode: 201
        });

    } catch (error) {
        console.error("Error creating guests from booking:", error);
        return ApiResponse.error(res, {
            message: error.message || "Có lỗi xảy ra khi tạo khách",
            statusCode: 500,
            errors: error
        });
    }
}

async function getGuestsFromBooking(req, res, next) {
    try {
        const { booking_id } = req.params;

        const guests = await getCustomersFromBooking(booking_id);

        return ApiResponse.success(res, {
            message: "Lấy danh sách khách thành công",
            data: { 
                booking_id: parseInt(booking_id),
                total_guests: guests.length,
                guests 
            }
        });

    } catch (error) {
        console.error("Error getting guests from booking:", error);
        return ApiResponse.error(res, {
            message: error.message || "Có lỗi xảy ra",
            statusCode: 500
        });
    }
}

async function checkBookingSlots(req, res, next) {
    try {
        const { booking_id } = req.params;

        const slots = await checkAvailableSlots(booking_id);

        return ApiResponse.success(res, {
            message: "Lấy thông tin chỗ trống thành công",
            data: slots
        });

    } catch (error) {
        console.error("Error checking booking slots:", error);
        return ApiResponse.error(res, {
            message: error.message || "Có lỗi xảy ra",
            statusCode: 500
        });
    }
}

async function deleteGuestFromBooking(req, res, next) {
    try {
        const { booking_guest_id } = req.params;
        const userId = req.user.id;

        const result = await removeGuestFromBooking(booking_guest_id, userId);

        return ApiResponse.success(res, {
            message: "Xóa khách thành công",
            data: result
        });

    } catch (error) {
        console.error("Error deleting guest from booking:", error);
        return ApiResponse.error(res, {
            message: error.message || "Có lỗi xảy ra khi xóa khách",
            statusCode: 500
        });
    }
}

module.exports = {
    getAllCustomers: getAllCustomers,
    fetchAllCustomersInQuotes: fetchAllCustomersInQuotes,
    getCustomerById: getCustomerById,
    createCustomer: createCustomer,
    updateCustomer: updateCustomer,
    deleteCustomerFromController: deleteCustomerFromController,
    createGuestsFromBooking,
    getGuestsFromBooking,
    checkBookingSlots,
    deleteGuestFromBooking
};
