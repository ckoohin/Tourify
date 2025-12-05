const { validationResult } = require("express-validator");
const TourPolicy = require("../../models/tours/TourPolicy");
const ApiResponse = require("../../utils/apiResponse");

async function getPoliciesByTour(req, res, next) {
    try {
        const { tourId } = req.params;
        const { type } = req.query;

        let policies;
        if (type) {
            policies = await TourPolicy.getByTourAndType(tourId, type);
        } else {
            policies = await TourPolicy.getByTour(tourId);
        }

        return ApiResponse.success(res, {
            message: "Lấy danh sách chính sách thành công",
            data: { policies }
        });
    } catch (error) {
        next(error);
    }
}

async function getPolicyById(req, res, next) {
    try {
        const { id } = req.params;

        const policy = await TourPolicy.getById(id);

        if (!policy) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy chính sách",
                statusCode: 404
            });
        }

        return ApiResponse.success(res, {
            message: "Lấy chi tiết chính sách thành công",
            data: { policy }
        });
    } catch (error) {
        next(error);
    }
}

async function createPolicy(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ApiResponse.error(res, {
                message: "Dữ liệu không hợp lệ",
                statusCode: 400,
                errors: errors.array()
            });
        }

        const policyId = await TourPolicy.create(req.body);
        const newPolicy = await TourPolicy.getById(policyId);

        return ApiResponse.success(res, {
            message: "Tạo chính sách thành công",
            data: { policy: newPolicy },
            statusCode: 201
        });
    } catch (error) {
        next(error);
    }
}

async function updatePolicy(req, res, next) {
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

        const existingPolicy = await TourPolicy.getById(id);
        if (!existingPolicy) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy chính sách",
                statusCode: 404
            });
        }

        await TourPolicy.update(id, req.body);
        const updatedPolicy = await TourPolicy.getById(id);

        return ApiResponse.success(res, {
            message: "Cập nhật chính sách thành công",
            data: { policy: updatedPolicy }
        });
    } catch (error) {
        next(error);
    }
}

async function deletePolicy(req, res, next) {
    try {
        const { id } = req.params;

        const policy = await TourPolicy.getById(id);
        if (!policy) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy chính sách",
                statusCode: 404
            });
        }

        const result = await TourPolicy.delete(id);

        if (result) {
            return ApiResponse.success(res, {
                message: "Xóa chính sách thành công"
            });
        } else {
            return ApiResponse.error(res, {
                message: "Xóa chính sách thất bại",
                statusCode: 500
            });
        }
    } catch (error) {
        next(error);
    }
}

async function updatePolicyStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (is_active === undefined) {
            return ApiResponse.error(res, {
                message: "Vui lòng cung cấp trạng thái is_active",
                statusCode: 400
            });
        }

        const policy = await TourPolicy.getById(id);
        if (!policy) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy chính sách",
                statusCode: 404
            });
        }

        await TourPolicy.updateStatus(id, is_active);
        const updatedPolicy = await TourPolicy.getById(id);

        return ApiResponse.success(res, {
            message: "Cập nhật trạng thái thành công",
            data: { policy: updatedPolicy }
        });
    } catch (error) {
        next(error);
    }
}

async function updatePolicyDisplayOrder(req, res, next) {
    try {
        const { id } = req.params;
        const { display_order } = req.body;

        if (display_order === undefined) {
            return ApiResponse.error(res, {
                message: "Vui lòng cung cấp display_order",
                statusCode: 400
            });
        }

        const policy = await TourPolicy.getById(id);
        if (!policy) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy chính sách",
                statusCode: 404
            });
        }

        await TourPolicy.updateDisplayOrder(id, display_order);
        const updatedPolicy = await TourPolicy.getById(id);

        return ApiResponse.success(res, {
            message: "Cập nhật thứ tự hiển thị thành công",
            data: { policy: updatedPolicy }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPoliciesByTour,
    getPolicyById,
    createPolicy,
    updatePolicy,
    deletePolicy,
    updatePolicyStatus,
    updatePolicyDisplayOrder
};