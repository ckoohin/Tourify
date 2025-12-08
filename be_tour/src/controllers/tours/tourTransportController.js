const { validationResult } = require("express-validator");
const TourTransport = require("../../models/tours/TourTransport");
const ApiResponse = require("../../utils/apiResponse");

/**
 * Lấy danh sách phương tiện của tour departure
 */
async function getTransportsByTourDeparture(req, res, next) {
    try {
        const { tourDepartureId } = req.params;

        const transports = await TourTransport.getByTourDeparture(tourDepartureId);

        return ApiResponse.success(res, {
            message: "Lấy danh sách phương tiện thành công",
            data: { transports }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Lấy chi tiết phương tiện
 */
async function getTransportById(req, res, next) {
    try {
        const { id } = req.params;

        const transport = await TourTransport.getById(id);

        if (!transport) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy phương tiện",
                statusCode: 404
            });
        }

        return ApiResponse.success(res, {
            message: "Lấy chi tiết phương tiện thành công",
            data: { transport }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Tạo phương tiện mới
 */
async function createTransport(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ApiResponse.error(res, {
                message: "Dữ liệu không hợp lệ",
                statusCode: 400,
                errors: errors.array()
            });
        }

        // Set created_by from authenticated user
        req.body.created_by = req.user.id;

        const transportId = await TourTransport.create(req.body);
        const newTransport = await TourTransport.getById(transportId);

        return ApiResponse.success(res, {
            message: "Tạo phương tiện thành công",
            data: { transport: newTransport },
            statusCode: 201
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Cập nhật phương tiện
 */
async function updateTransport(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ApiResponse.error(res, {
                message: "Dữ liệu không hợp lệ",
                statusCode: 400,
                errors: errors.array()
            });
        }

        const { id } = req.params;

        const existingTransport = await TourTransport.getById(id);
        if (!existingTransport) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy phương tiện",
                statusCode: 404
            });
        }

        await TourTransport.update(id, req.body);
        const updatedTransport = await TourTransport.getById(id);

        return ApiResponse.success(res, {
            message: "Cập nhật phương tiện thành công",
            data: { transport: updatedTransport }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Xóa phương tiện
 */
async function deleteTransport(req, res, next) {
    try {
        const { id } = req.params;

        const transport = await TourTransport.getById(id);
        if (!transport) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy phương tiện",
                statusCode: 404
            });
        }

        // Kiểm tra đã có khách được phân bổ chưa
        if (transport.assigned_guests > 0) {
            return ApiResponse.error(res, {
                message: "Không thể xóa phương tiện đã có khách được phân bổ",
                statusCode: 400
            });
        }

        const result = await TourTransport.delete(id);

        if (result) {
            return ApiResponse.success(res, {
                message: "Xóa phương tiện thành công"
            });
        } else {
            return ApiResponse.error(res, {
                message: "Xóa phương tiện thất bại",
                statusCode: 500
            });
        }
    } catch (error) {
        next(error);
    }
}

/**
 * Cập nhật trạng thái booking
 */
async function updateBookingStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { booking_status, booking_reference } = req.body;

        if (!booking_status) {
            return ApiResponse.error(res, {
                message: "Vui lòng cung cấp trạng thái booking",
                statusCode: 400
            });
        }

        const validStatuses = ['pending', 'confirmed', 'ticketed', 'cancelled'];
        if (!validStatuses.includes(booking_status)) {
            return ApiResponse.error(res, {
                message: "Trạng thái không hợp lệ",
                statusCode: 400
            });
        }

        const transport = await TourTransport.getById(id);
        if (!transport) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy phương tiện",
                statusCode: 404
            });
        }

        await TourTransport.updateBookingStatus(id, booking_status, booking_reference);
        const updatedTransport = await TourTransport.getById(id);

        return ApiResponse.success(res, {
            message: "Cập nhật trạng thái booking thành công",
            data: { transport: updatedTransport }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Lấy thông tin ghế còn trống
 */
async function getAvailableSeats(req, res, next) {
    try {
        const { id } = req.params;

        const transport = await TourTransport.getById(id);
        if (!transport) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy phương tiện",
                statusCode: 404
            });
        }

        const seatInfo = await TourTransport.getAvailableSeats(id);

        return ApiResponse.success(res, {
            message: "Lấy thông tin ghế thành công",
            data: { 
                transport_id: id,
                transport_type: transport.transport_type,
                ...seatInfo
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getTransportsByTourDeparture,
    getTransportById,
    createTransport,
    updateTransport,
    deleteTransport,
    updateBookingStatus,
    getAvailableSeats
};