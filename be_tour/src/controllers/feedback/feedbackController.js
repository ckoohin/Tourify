const { validationResult } = require("express-validator");
const Feedback = require("../../models/feedback/Feedback");
const ApiResponse = require("../../utils/apiResponse");

async function getAllFeedbacks(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const filters = {
            feedback_type: req.query.feedback_type,
            tour_departure_id: req.query.tour_departure_id,
            supplier_id: req.query.supplier_id,
            staff_id: req.query.staff_id,
            priority: req.query.priority,
            status: req.query.status,
            submitted_by: req.query.submitted_by,
            assigned_to: req.query.assigned_to
        };

        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        const result = await Feedback.getAll(filters, page, limit);

        return ApiResponse.paginate(res, {
            message: "Lấy danh sách phản hồi thành công",
            data: result.feedbacks,
            page: result.pagination.currentPage,
            limit: result.pagination.limit,
            total: result.pagination.totalItems
        });
    } catch (error) {
        next(error);
    }
}

async function getFeedbackById(req, res, next) {
    try {
        const { id } = req.params;

        const feedback = await Feedback.getById(id);

        if (!feedback) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy phản hồi",
                statusCode: 404
            });
        }

        return ApiResponse.success(res, {
            message: "Lấy chi tiết phản hồi thành công",
            data: { feedback }
        });
    } catch (error) {
        next(error);
    }
}

async function createFeedback(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ApiResponse.error(res, {
                message: "Dữ liệu không hợp lệ",
                statusCode: 400,
                errors: errors.array()
            });
        }

        req.body.submitted_by = req.user.id;

        const feedbackId = await Feedback.create(req.body);
        const newFeedback = await Feedback.getById(feedbackId);

        return ApiResponse.success(res, {
            message: "Gửi phản hồi thành công",
            data: { feedback: newFeedback },
            statusCode: 201
        });
    } catch (error) {
        next(error);
    }
}

async function updateFeedback(req, res, next) {
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

        const existingFeedback = await Feedback.getById(id);
        if (!existingFeedback) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy phản hồi",
                statusCode: 404
            });
        }

        // Chỉ người tạo hoặc admin mới được sửa
        if (existingFeedback.submitted_by !== req.user.id && 
            req.user.role_slug !== 'admin') {
            return ApiResponse.error(res, {
                message: "Bạn không có quyền chỉnh sửa phản hồi này",
                statusCode: 403
            });
        }

        await Feedback.update(id, req.body);
        const updatedFeedback = await Feedback.getById(id);

        return ApiResponse.success(res, {
            message: "Cập nhật phản hồi thành công",
            data: { feedback: updatedFeedback }
        });
    } catch (error) {
        next(error);
    }
}

async function updateFeedbackStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return ApiResponse.error(res, {
                message: "Vui lòng cung cấp trạng thái",
                statusCode: 400
            });
        }

        const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return ApiResponse.error(res, {
                message: "Trạng thái không hợp lệ",
                statusCode: 400
            });
        }

        const feedback = await Feedback.getById(id);
        if (!feedback) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy phản hồi",
                statusCode: 404
            });
        }

        await Feedback.updateStatus(id, status, req.user.id);
        const updatedFeedback = await Feedback.getById(id);

        return ApiResponse.success(res, {
            message: "Cập nhật trạng thái thành công",
            data: { feedback: updatedFeedback }
        });
    } catch (error) {
        next(error);
    }
}

async function assignFeedback(req, res, next) {
    try {
        const { id } = req.params;
        const { assigned_to } = req.body;

        if (!assigned_to) {
            return ApiResponse.error(res, {
                message: "Vui lòng chọn người xử lý",
                statusCode: 400
            });
        }

        const feedback = await Feedback.getById(id);
        if (!feedback) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy phản hồi",
                statusCode: 404
            });
        }

        await Feedback.assignTo(id, assigned_to);
        const updatedFeedback = await Feedback.getById(id);

        return ApiResponse.success(res, {
            message: "Phân công xử lý thành công",
            data: { feedback: updatedFeedback }
        });
    } catch (error) {
        next(error);
    }
}

async function deleteFeedback(req, res, next) {
    try {
        const { id } = req.params;

        const feedback = await Feedback.getById(id);
        if (!feedback) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy phản hồi",
                statusCode: 404
            });
        }

        // Chỉ người tạo hoặc admin mới được xóa
        if (feedback.submitted_by !== req.user.id && 
            req.user.role_slug !== 'admin') {
            return ApiResponse.error(res, {
                message: "Bạn không có quyền xóa phản hồi này",
                statusCode: 403
            });
        }

        const result = await Feedback.delete(id);

        if (result) {
            return ApiResponse.success(res, {
                message: "Xóa phản hồi thành công"
            });
        } else {
            return ApiResponse.error(res, {
                message: "Xóa phản hồi thất bại",
                statusCode: 500
            });
        }
    } catch (error) {
        next(error);
    }
}

async function getFeedbackStats(req, res, next) {
    try {
        const statsByType = await Feedback.getStatsByType();

        return ApiResponse.success(res, {
            message: "Lấy thống kê thành công",
            data: { stats: statsByType }
        });
    } catch (error) {
        next(error);
    }
}

async function getFeedbackStatsBySupplier(req, res, next) {
    try {
        const { supplierId } = req.params;

        const stats = await Feedback.getStatsBySupplier(supplierId);

        return ApiResponse.success(res, {
            message: "Lấy thống kê nhà cung cấp thành công",
            data: { stats }
        });
    } catch (error) {
        next(error);
    }
}

async function getMyFeedbacks(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const filters = {
            submitted_by: req.user.id,
            feedback_type: req.query.feedback_type,
            status: req.query.status,
            priority: req.query.priority
        };

        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        const result = await Feedback.getAll(filters, page, limit);

        return ApiResponse.paginate(res, {
            message: "Lấy danh sách phản hồi của tôi thành công",
            data: result.feedbacks,
            page: result.pagination.currentPage,
            limit: result.pagination.limit,
            total: result.pagination.totalItems
        });
    } catch (error) {
        next(error);
    }
}

async function getAssignedToMe(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const filters = {
            assigned_to: req.user.id,
            feedback_type: req.query.feedback_type,
            status: req.query.status,
            priority: req.query.priority
        };

        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        const result = await Feedback.getAll(filters, page, limit);

        return ApiResponse.paginate(res, {
            message: "Lấy danh sách phản hồi được gán thành công",
            data: result.feedbacks,
            page: result.pagination.currentPage,
            limit: result.pagination.limit,
            total: result.pagination.totalItems
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllFeedbacks,
    getFeedbackById,
    createFeedback,
    updateFeedback,
    updateFeedbackStatus,
    assignFeedback,
    deleteFeedback,
    getFeedbackStats,
    getFeedbackStatsBySupplier,
    getMyFeedbacks,
    getAssignedToMe
};