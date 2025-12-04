const { validationResult } = require("express-validator");
const TourItinerary = require("../../models/tours/TourItinerary");
const ApiResponse = require("../../utils/apiResponse");

async function getItinerariesByTourVersion(req, res, next) {
    try {
        const { tourVersionId } = req.params;

        const itineraries = await TourItinerary.getByTourVersion(tourVersionId);

        return ApiResponse.success(res, {
            message: "Lấy danh sách lịch trình thành công",
            data: { itineraries }
        });
    } catch (error) {
        next(error);
    }
}

async function getItineraryById(req, res, next) {
    try {
        const { id } = req.params;

        const itinerary = await TourItinerary.getById(id);

        if (!itinerary) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy lịch trình",
                statusCode: 404
            });
        }

        return ApiResponse.success(res, {
            message: "Lấy chi tiết lịch trình thành công",
            data: { itinerary }
        });
    } catch (error) {
        next(error);
    }
}

async function createItinerary(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ApiResponse.error(res, {
                message: "Dữ liệu không hợp lệ",
                statusCode: 400,
                errors: errors.array()
            });
        }

        const { tour_version_id, day_number } = req.body;

        const exists = await TourItinerary.isDayNumberExists(tour_version_id, day_number);
        if (exists) {
            return ApiResponse.error(res, {
                message: `Ngày ${day_number} đã tồn tại trong lịch trình`,
                statusCode: 400
            });
        }

        const itineraryId = await TourItinerary.create(req.body);
        const newItinerary = await TourItinerary.getById(itineraryId);

        return ApiResponse.success(res, {
            message: "Tạo lịch trình thành công",
            data: { itinerary: newItinerary },
            statusCode: 201
        });
    } catch (error) {
        next(error);
    }
}

async function updateItinerary(req, res, next) {
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
        const { tour_version_id, day_number } = req.body;

        const existingItinerary = await TourItinerary.getById(id);
        if (!existingItinerary) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy lịch trình",
                statusCode: 404
            });
        }

        // Kiểm tra day_number có bị trùng không (trừ chính nó)
        if (day_number) {
            const exists = await TourItinerary.isDayNumberExists(
                tour_version_id || existingItinerary.tour_version_id,
                day_number,
                id
            );
            if (exists) {
                return ApiResponse.error(res, {
                    message: `Ngày ${day_number} đã tồn tại trong lịch trình`,
                    statusCode: 400
                });
            }
        }

        await TourItinerary.update(id, req.body);
        const updatedItinerary = await TourItinerary.getById(id);

        return ApiResponse.success(res, {
            message: "Cập nhật lịch trình thành công",
            data: { itinerary: updatedItinerary }
        });
    } catch (error) {
        next(error);
    }
}

async function deleteItinerary(req, res, next) {
    try {
        const { id } = req.params;

        const itinerary = await TourItinerary.getById(id);
        if (!itinerary) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy lịch trình",
                statusCode: 404
            });
        }

        const result = await TourItinerary.delete(id);

        if (result) {
            return ApiResponse.success(res, {
                message: "Xóa lịch trình thành công"
            });
        } else {
            return ApiResponse.error(res, {
                message: "Xóa lịch trình thất bại",
                statusCode: 500
            });
        }
    } catch (error) {
        next(error);
    }
}

async function deleteAllItinerariesByTourVersion(req, res, next) {
    try {
        const { tourVersionId } = req.params;

        const deletedCount = await TourItinerary.deleteByTourVersion(tourVersionId);

        return ApiResponse.success(res, {
            message: `Đã xóa ${deletedCount} lịch trình`,
            data: { deletedCount }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getItinerariesByTourVersion,
    getItineraryById,
    createItinerary,
    updateItinerary,
    deleteItinerary,
    deleteAllItinerariesByTourVersion
};