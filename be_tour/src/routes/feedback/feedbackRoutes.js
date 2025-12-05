const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const AuthMiddleware = require("../../middleware/authMiddleware");
const { authorize } = require("../../middleware/authorize");

const {
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
} = require("../../controllers/feedback/feedbackController");

const feedbackValidation = [
    body("feedback_type")
        .notEmpty()
        .withMessage("Loại phản hồi không được để trống")
        .isIn(["tour", "service", "supplier", "staff", "system"])
        .withMessage("Loại phản hồi không hợp lệ"),
    
    body("tour_departure_id")
        .optional({ checkFalsy: true })
        .isInt()
        .withMessage("ID tour departure phải là số"),
    
    body("supplier_id")
        .optional({ checkFalsy: true })
        .isInt()
        .withMessage("ID nhà cung cấp phải là số"),
    
    body("staff_id")
        .optional({ checkFalsy: true })
        .isInt()
        .withMessage("ID nhân viên phải là số"),
    
    body("subject")
        .notEmpty()
        .withMessage("Tiêu đề không được để trống")
        .isLength({ max: 255 })
        .withMessage("Tiêu đề tối đa 255 ký tự"),
    
    body("content")
        .notEmpty()
        .withMessage("Nội dung không được để trống")
        .isLength({ max: 5000 })
        .withMessage("Nội dung tối đa 5000 ký tự"),
    
    body("priority")
        .optional({ checkFalsy: true })
        .isIn(["low", "medium", "high"])
        .withMessage("Mức độ ưu tiên không hợp lệ"),
    
    body("status")
        .optional({ checkFalsy: true })
        .isIn(["open", "in_progress", "resolved", "closed"])
        .withMessage("Trạng thái không hợp lệ"),
    
    body("assigned_to")
        .optional({ checkFalsy: true })
        .isInt()
        .withMessage("ID người được gán phải là số")
];

router.get(
    "/my-feedbacks",
    AuthMiddleware.authenticate,
    getMyFeedbacks
);

router.get(
    "/assigned-to-me",
    AuthMiddleware.authenticate,
    getAssignedToMe
);

router.get(
    "/stats",
    AuthMiddleware.authenticate,
    authorize("reports.view"),
    getFeedbackStats
);

router.get(
    "/stats/supplier/:supplierId",
    AuthMiddleware.authenticate,
    authorize("reports.view"),
    getFeedbackStatsBySupplier
);

router.get(
    "/",
    AuthMiddleware.authenticate,
    authorize("feedbacks.view"),
    getAllFeedbacks
);

router.get(
    "/:id",
    AuthMiddleware.authenticate,
    getFeedbackById
);

router.post(
    "/",
    AuthMiddleware.authenticate,
    feedbackValidation,
    createFeedback
);

router.put(
    "/:id",
    AuthMiddleware.authenticate,
    [
        body("subject")
            .optional()
            .notEmpty()
            .withMessage("Tiêu đề không được để trống")
            .isLength({ max: 255 })
            .withMessage("Tiêu đề tối đa 255 ký tự"),
        
        body("content")
            .optional()
            .notEmpty()
            .withMessage("Nội dung không được để trống")
            .isLength({ max: 5000 })
            .withMessage("Nội dung tối đa 5000 ký tự"),
        
        body("priority")
            .optional()
            .isIn(["low", "medium", "high"])
            .withMessage("Mức độ ưu tiên không hợp lệ"),
        
        body("status")
            .optional()
            .isIn(["open", "in_progress", "resolved", "closed"])
            .withMessage("Trạng thái không hợp lệ"),
        
        body("assigned_to")
            .optional({ checkFalsy: true })
            .isInt()
            .withMessage("ID người được gán phải là số")
    ],
    updateFeedback
);

router.patch(
    "/:id/status",
    AuthMiddleware.authenticate,
    [
        body("status")
            .notEmpty()
            .withMessage("Trạng thái không được để trống")
            .isIn(["open", "in_progress", "resolved", "closed"])
            .withMessage("Trạng thái không hợp lệ")
    ],
    updateFeedbackStatus
);

router.patch(
    "/:id/assign",
    AuthMiddleware.authenticate,
    authorize("feedbacks.manage"),
    [
        body("assigned_to")
            .notEmpty()
            .withMessage("Vui lòng chọn người xử lý")
            .isInt()
            .withMessage("ID người xử lý phải là số")
    ],
    assignFeedback
);

router.delete(
    "/:id",
    AuthMiddleware.authenticate,
    deleteFeedback
);

module.exports = router;