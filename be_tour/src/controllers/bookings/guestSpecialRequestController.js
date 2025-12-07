const { validationResult } = require("express-validator");
const GuestSpecialRequest = require("../../models/bookings/GuestSpecialRequest");
const ApiResponse = require("../../utils/apiResponse");

/**
 * Lấy yêu cầu của khách
 */
async function getRequestsByGuest(req, res, next) {
    try {
        const { guestId } = req.params;

        const requests = await GuestSpecialRequest.getByBookingGuest(guestId);

        return ApiResponse.success(res, {
            message: "Lấy danh sách yêu cầu thành công",
            data: { requests }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Lấy yêu cầu của booking
 */
async function getRequestsByBooking(req, res, next) {
    try {
        const { bookingId } = req.params;

        const requests = await GuestSpecialRequest.getByBooking(bookingId);

        return ApiResponse.success(res, {
            message: "Lấy danh sách yêu cầu thành công",
            data: { requests }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Lấy yêu cầu theo tour departure
 */
async function getRequestsByTourDeparture(req, res, next) {
    try {
        const { tourDepartureId } = req.params;

        const requests = await GuestSpecialRequest.getByTourDeparture(tourDepartureId);

        return ApiResponse.success(res, {
            message: "Lấy danh sách yêu cầu thành công",
            data: { requests }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Lấy chi tiết yêu cầu
 */
async function getRequestById(req, res, next) {
    try {
        const { id } = req.params;

        const request = await GuestSpecialRequest.getById(id);

        if (!request) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy yêu cầu",
                statusCode: 404
            });
        }

        return ApiResponse.success(res, {
            message: "Lấy chi tiết yêu cầu thành công",
            data: { request }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Tạo yêu cầu mới
 */
async function createRequest(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ApiResponse.error(res, {
                message: "Dữ liệu không hợp lệ",
                statusCode: 400,
                errors: errors.array()
            });
        }

        const requestId = await GuestSpecialRequest.create(req.body);
        const newRequest = await GuestSpecialRequest.getById(requestId);

        return ApiResponse.success(res, {
            message: "Tạo yêu cầu thành công",
            data: { request: newRequest },
            statusCode: 201
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Cập nhật yêu cầu
 */
async function updateRequest(req, res, next) {
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

        const existingRequest = await GuestSpecialRequest.getById(id);
        if (!existingRequest) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy yêu cầu",
                statusCode: 404
            });
        }

        await GuestSpecialRequest.update(id, req.body);
        const updatedRequest = await GuestSpecialRequest.getById(id);

        return ApiResponse.success(res, {
            message: "Cập nhật yêu cầu thành công",
            data: { request: updatedRequest }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Cập nhật trạng thái yêu cầu
 */
async function updateRequestStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        if (!status) {
            return ApiResponse.error(res, {
                message: "Vui lòng cung cấp trạng thái",
                statusCode: 400
            });
        }

        const validStatuses = ['pending', 'acknowledged', 'fulfilled', 'cannot_fulfill'];
        if (!validStatuses.includes(status)) {
            return ApiResponse.error(res, {
                message: "Trạng thái không hợp lệ",
                statusCode: 400
            });
        }

        const request = await GuestSpecialRequest.getById(id);
        if (!request) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy yêu cầu",
                statusCode: 404
            });
        }

        await GuestSpecialRequest.updateStatus(id, status, notes);
        const updatedRequest = await GuestSpecialRequest.getById(id);

        return ApiResponse.success(res, {
            message: "Cập nhật trạng thái thành công",
            data: { request: updatedRequest }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Xóa yêu cầu
 */
async function deleteRequest(req, res, next) {
    try {
        const { id } = req.params;

        const request = await GuestSpecialRequest.getById(id);
        if (!request) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy yêu cầu",
                statusCode: 404
            });
        }

        const result = await GuestSpecialRequest.delete(id);

        if (result) {
            return ApiResponse.success(res, {
                message: "Xóa yêu cầu thành công"
            });
        } else {
            return ApiResponse.error(res, {
                message: "Xóa yêu cầu thất bại",
                statusCode: 500
            });
        }
    } catch (error) {
        next(error);
    }
}

/**
 * Thống kê yêu cầu
 */
async function getRequestStats(req, res, next) {
    try {
        const { bookingId } = req.query;

        const stats = await GuestSpecialRequest.getStatsByType(bookingId);

        return ApiResponse.success(res, {
            message: "Lấy thống kê yêu cầu thành công",
            data: { stats }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Lấy yêu cầu chưa xử lý
 */
async function getPendingRequests(req, res, next) {
    try {
        const { tourDepartureId } = req.query;

        const requests = await GuestSpecialRequest.getPendingRequests(tourDepartureId);

        return ApiResponse.success(res, {
            message: "Lấy danh sách yêu cầu chưa xử lý thành công",
            data: { requests }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getRequestsByGuest,
    getRequestsByBooking,
    getRequestsByTourDeparture,
    getRequestById,
    createRequest,
    updateRequest,
    updateRequestStatus,
    deleteRequest,
    getRequestStats,
    getPendingRequests
};