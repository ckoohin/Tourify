const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const AuthMiddleware = require("../../middleware/authMiddleware");
const { authorize } = require("../../middleware/authorize");
const {
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
} = require("../../controllers/bookings/guestSpecialRequestController");

const requestValidation = [
    body("booking_guest_id")
        .notEmpty()
        .withMessage("ID khách không được để trống")
        .isInt()
        .withMessage("ID khách phải là số"),
    
    body("request_type")
        .notEmpty()
        .withMessage("Loại yêu cầu không được để trống")
        .isIn(["dietary", "medical", "accessibility", "room", "other"])
        .withMessage("Loại yêu cầu không hợp lệ"),
    
    body("title")
        .notEmpty()
        .withMessage("Tiêu đề không được để trống")
        .isLength({ max: 255 })
        .withMessage("Tiêu đề tối đa 255 ký tự"),
    
    body("description")
        .optional({ checkFalsy: true })
        .isLength({ max: 2000 })
        .withMessage("Mô tả tối đa 2000 ký tự"),
    
    body("priority")
        .optional({ checkFalsy: true })
        .isIn(["low", "medium", "high", "critical"])
        .withMessage("Mức độ ưu tiên không hợp lệ"),
    
    body("status")
        .optional({ checkFalsy: true })
        .isIn(["pending", "acknowledged", "fulfilled", "cannot_fulfill"])
        .withMessage("Trạng thái không hợp lệ"),
    
    body("notes")
        .optional({ checkFalsy: true })
        .isLength({ max: 1000 })
        .withMessage("Ghi chú tối đa 1000 ký tự")
];

router.get(
    "/stats",
    AuthMiddleware.authenticate,
    authorize("bookings.view", "guide.view"),
    getRequestStats
);

router.get(
    "/pending",
    AuthMiddleware.authenticate,
    authorize("bookings.view", "guide.view"),
    getPendingRequests
);

router.get(
    "/tour-departure/:tourDepartureId",
    AuthMiddleware.authenticate,
    authorize("tours.manage", "guide.view"),
    getRequestsByTourDeparture
);

router.get(
    "/booking/:bookingId",
    AuthMiddleware.authenticate,
    authorize("bookings.view", "guide.view"),
    getRequestsByBooking
);

router.get(
    "/guest/:guestId",
    AuthMiddleware.authenticate,
    authorize("bookings.view", "guide.view"),
    getRequestsByGuest
);

router.get(
    "/:id",
    AuthMiddleware.authenticate,
    authorize("bookings.view", "guide.view"),
    getRequestById
);

router.post(
    "/",
    AuthMiddleware.authenticate,
    authorize("booking.manage", "guide.view"),
    requestValidation,
    createRequest
);

router.put(
    "/:id",
    AuthMiddleware.authenticate,
    authorize("booking.manage", "guide.view"),
    [
        body("request_type")
            .optional()
            .isIn(["dietary", "medical", "accessibility", "room", "other"])
            .withMessage("Loại yêu cầu không hợp lệ"),
        
        body("title")
            .optional()
            .notEmpty()
            .withMessage("Tiêu đề không được để trống")
            .isLength({ max: 255 })
            .withMessage("Tiêu đề tối đa 255 ký tự"),
        
        ...requestValidation.slice(3) //Skip booking_guest_id, request_type, title
    ],
    updateRequest
);

router.patch(
    "/:id/status",
    AuthMiddleware.authenticate,
    authorize("booking.manage", "guide.view"),
    [
        body("status")
            .notEmpty()
            .withMessage("Trạng thái không được để trống")
            .isIn(["pending", "acknowledged", "fulfilled", "cannot_fulfill"])
            .withMessage("Trạng thái không hợp lệ"),
        
        body("notes")
            .optional({ checkFalsy: true })
            .isLength({ max: 1000 })
            .withMessage("Ghi chú tối đa 1000 ký tự")
    ],
    updateRequestStatus
);

router.delete(
    "/:id",
    AuthMiddleware.authenticate,
    authorize("booking.manage", "guide.view"),
    deleteRequest
);

module.exports = router;