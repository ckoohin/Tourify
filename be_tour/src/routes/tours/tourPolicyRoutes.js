const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const AuthMiddleware = require("../../middleware/authMiddleware");
const { authorize } = require("../../middleware/authorize");
const {
    getPoliciesByTour,
    getPolicyById,
    createPolicy,
    updatePolicy,
    deletePolicy,
    updatePolicyStatus,
    updatePolicyDisplayOrder
} = require("../../controllers/tours/tourPolicyController");

const policyValidation = [
    body("tour_id")
        .notEmpty()
        .withMessage("ID tour không được để trống")
        .isInt()
        .withMessage("ID tour phải là số"),
    
    body("policy_type")
        .notEmpty()
        .withMessage("Loại chính sách không được để trống")
        .isIn(["cancellation", "change", "refund", "deposit", "other"])
        .withMessage("Loại chính sách không hợp lệ"),
    
    body("title")
        .notEmpty()
        .withMessage("Tiêu đề không được để trống")
        .isLength({ max: 255 })
        .withMessage("Tiêu đề tối đa 255 ký tự"),
    
    body("content")
        .notEmpty()
        .withMessage("Nội dung không được để trống")
        .isLength({ max: 10000 })
        .withMessage("Nội dung tối đa 10000 ký tự"),
    
    body("display_order")
        .optional({ checkFalsy: true })
        .isInt({ min: 0 })
        .withMessage("Thứ tự hiển thị phải là số nguyên không âm"),
    
    body("is_active")
        .optional()
        .isBoolean()
        .withMessage("is_active phải là boolean")
];

router.get(
    "/tour/:tourId",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    getPoliciesByTour
);

router.get(
    "/:id",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    getPolicyById
);

router.post(
    "/",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    policyValidation,
    createPolicy
);

router.put(
    "/:id",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    [
        body("policy_type")
            .optional()
            .isIn(["cancellation", "change", "refund", "deposit", "other"])
            .withMessage("Loại chính sách không hợp lệ"),
        
        body("title")
            .optional()
            .notEmpty()
            .withMessage("Tiêu đề không được để trống")
            .isLength({ max: 255 })
            .withMessage("Tiêu đề tối đa 255 ký tự"),
        
        body("content")
            .optional()
            .notEmpty()
            .withMessage("Nội dung không được để trống")
            .isLength({ max: 10000 })
            .withMessage("Nội dung tối đa 10000 ký tự"),
        
        ...policyValidation.slice(4) //Skip tour_id, policy_type, title, content
    ],
    updatePolicy
);

router.delete(
    "/:id",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    deletePolicy
);

router.patch(
    "/:id/status",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    [
        body("is_active")
            .notEmpty()
            .withMessage("is_active không được để trống")
            .isBoolean()
            .withMessage("is_active phải là boolean")
    ],
    updatePolicyStatus
);

router.patch(
    "/:id/display-order",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    [
        body("display_order")
            .notEmpty()
            .withMessage("display_order không được để trống")
            .isInt({ min: 0 })
            .withMessage("display_order phải là số nguyên không âm")
    ],
    updatePolicyDisplayOrder
);

module.exports = router;