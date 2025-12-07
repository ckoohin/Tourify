const { validationResult } = require("express-validator");
const SupplierRating = require("../../models/suppliers/SupplierRating");
const ApiResponse = require("../../utils/apiResponse");

async function getRatingsBySupplier(req, res, next) {
    try {
        const { supplierId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await SupplierRating.getBySupplier(supplierId, page, limit);

        return ApiResponse.paginate(res, {
            message: "Lấy danh sách đánh giá thành công",
            data: result.ratings,
            page: result.pagination.currentPage,
            limit: result.pagination.limit,
            total: result.pagination.totalItems
        });
    } catch (error) {
        next(error);
    }
}

async function getRatingsByTourDeparture(req, res, next) {
    try {
        const { tourDepartureId } = req.params;

        const ratings = await SupplierRating.getByTourDeparture(tourDepartureId);

        return ApiResponse.success(res, {
            message: "Lấy danh sách đánh giá thành công",
            data: { ratings }
        });
    } catch (error) {
        next(error);
    }
}

async function createRating(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ApiResponse.error(res, {
                message: "Dữ liệu không hợp lệ",
                statusCode: 400,
                errors: errors.array()
            });
        }

        const { supplier_id, tour_departure_id, rating_type } = req.body;

        const hasRated = await SupplierRating.hasRated(
            tour_departure_id,
            supplier_id,
            req.user.id,
            rating_type
        );

        if (hasRated) {
            return ApiResponse.error(res, {
                message: "Bạn đã đánh giá loại này cho nhà cung cấp trong tour này rồi",
                statusCode: 400
            });
        }

        req.body.rated_by = req.user.id;

        const ratingId = await SupplierRating.create(req.body);

        return ApiResponse.success(res, {
            message: "Tạo đánh giá thành công",
            data: { id: ratingId },
            statusCode: 201
        });
    } catch (error) {
        next(error);
    }
}

async function updateRating(req, res, next) {
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

        const result = await SupplierRating.update(id, req.body);

        if (result) {
            return ApiResponse.success(res, {
                message: "Cập nhật đánh giá thành công"
            });
        } else {
            return ApiResponse.error(res, {
                message: "Không tìm thấy đánh giá",
                statusCode: 404
            });
        }
    } catch (error) {
        next(error);
    }
}

async function deleteRating(req, res, next) {
    try {
        const { id } = req.params;

        const result = await SupplierRating.delete(id);

        if (result) {
            return ApiResponse.success(res, {
                message: "Xóa đánh giá thành công"
            });
        } else {
            return ApiResponse.error(res, {
                message: "Không tìm thấy đánh giá",
                statusCode: 404
            });
        }
    } catch (error) {
        next(error);
    }
}

async function getRatingStats(req, res, next) {
    try {
        const { supplierId } = req.params;

        const stats = await SupplierRating.getStatsBySupplier(supplierId);

        return ApiResponse.success(res, {
            message: "Lấy thống kê đánh giá thành công",
            data: { stats }
        });
    } catch (error) {
        next(error);
    }
}

async function getRatingByTourAndSupplier(req, res, next) {
    try {
        const { tourDepartureId, supplierId } = req.params;

        const ratings = await SupplierRating.getByTourDepartureAndSupplier(
            tourDepartureId,
            supplierId
        );

        return ApiResponse.success(res, {
            message: "Lấy đánh giá thành công",
            data: { ratings }
        });
    } catch (error) {
        next(error);
    }
}

async function createBulkRatings(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ApiResponse.error(res, {
                message: "Dữ liệu không hợp lệ",
                statusCode: 400,
                errors: errors.array()
            });
        }

        const { tour_departure_id, ratings } = req.body;

        if (!Array.isArray(ratings) || ratings.length === 0) {
            return ApiResponse.error(res, {
                message: "Danh sách đánh giá không hợp lệ",
                statusCode: 400
            });
        }

        const createdIds = [];

        for (const rating of ratings) {
            const hasRated = await SupplierRating.hasRated(
                tour_departure_id,
                rating.supplier_id,
                req.user.id,
                rating.rating_type
            );

            if (!hasRated) {
                const ratingData = {
                    ...rating,
                    tour_departure_id,
                    rated_by: req.user.id
                };

                const ratingId = await SupplierRating.create(ratingData);
                createdIds.push(ratingId);
            }
        }

        return ApiResponse.success(res, {
            message: `Tạo ${createdIds.length} đánh giá thành công`,
            data: { createdIds },
            statusCode: 201
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getRatingsBySupplier,
    getRatingsByTourDeparture,
    createRating,
    updateRating,
    deleteRating,
    getRatingStats,
    getRatingByTourAndSupplier,
    createBulkRatings
};