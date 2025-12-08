const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const AuthMiddleware = require("../../middleware/authMiddleware");
const { authorize } = require("../../middleware/authorize");
const {
    getAssignmentsByTransport,
    getAssignmentsByGuest,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    bulkCreateAssignments,
    getUsedSeats
} = require("../../controllers/tours/transportGuestAssignmentController");

const assignmentValidation = [
    body("tour_transport_id")
        .notEmpty()
        .withMessage("ID phương tiện không được để trống")
        .isInt()
        .withMessage("ID phương tiện phải là số"),
    
    body("tour_departure_guest_id")
        .notEmpty()
        .withMessage("ID khách không được để trống")
        .isInt()
        .withMessage("ID khách phải là số"),
    
    body("seat_number")
        .optional({ checkFalsy: true })
        .isLength({ max: 20 })
        .withMessage("Số ghế tối đa 20 ký tự"),
    
    body("ticket_number")
        .optional({ checkFalsy: true })
        .isLength({ max: 100 })
        .withMessage("Số vé tối đa 100 ký tự"),
    
    body("baggage_allowance")
        .optional({ checkFalsy: true })
        .isLength({ max: 100 })
        .withMessage("Hành lý tối đa 100 ký tự"),
    
    body("additional_baggage")
        .optional({ checkFalsy: true })
        .isObject()
        .withMessage("Hành lý thêm phải là object"),
    
    body("special_meal")
        .optional({ checkFalsy: true })
        .isLength({ max: 100 })
        .withMessage("Suất ăn đặc biệt tối đa 100 ký tự"),
    
    body("special_assistance")
        .optional({ checkFalsy: true })
        .isLength({ max: 255 })
        .withMessage("Hỗ trợ đặc biệt tối đa 255 ký tự"),
    
    body("notes")
        .optional({ checkFalsy: true })
        .isLength({ max: 1000 })
        .withMessage("Ghi chú tối đa 1000 ký tự")
];

const bulkAssignmentValidation = [
    body("assignments")
        .notEmpty()
        .withMessage("Danh sách phân bổ không được để trống")
        .isArray({ min: 1 })
        .withMessage("Danh sách phân bổ phải là mảng và có ít nhất 1 phần tử"),
    
    body("assignments.*.tour_transport_id")
        .notEmpty()
        .withMessage("ID phương tiện không được để trống")
        .isInt()
        .withMessage("ID phương tiện phải là số"),
    
    body("assignments.*.tour_departure_guest_id")
        .notEmpty()
        .withMessage("ID khách không được để trống")
        .isInt()
        .withMessage("ID khách phải là số"),
    
    body("assignments.*.seat_number")
        .optional({ checkFalsy: true })
        .isLength({ max: 20 })
        .withMessage("Số ghế tối đa 20 ký tự"),
    
    body("assignments.*.ticket_number")
        .optional({ checkFalsy: true })
        .isLength({ max: 100 })
        .withMessage("Số vé tối đa 100 ký tự")
];

router.get(
    "/transport/:transportId/used-seats",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    getUsedSeats
);

router.get(
    "/transport/:transportId",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    getAssignmentsByTransport
);

router.get(
    "/guest/:guestId",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    getAssignmentsByGuest
);

router.get(
    "/:id",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    getAssignmentById
);

router.post(
    "/",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    assignmentValidation,
    createAssignment
);

router.post(
    "/bulk",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    bulkAssignmentValidation,
    bulkCreateAssignments
);

router.put(
    "/:id",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    [
        body("seat_number")
            .optional({ checkFalsy: true })
            .isLength({ max: 20 })
            .withMessage("Số ghế tối đa 20 ký tự"),
        
        body("ticket_number")
            .optional({ checkFalsy: true })
            .isLength({ max: 100 })
            .withMessage("Số vé tối đa 100 ký tự"),
        
        ...assignmentValidation.slice(4) //Skip tour_transport_id, tour_departure_guest_id, seat_number, ticket_number
    ],
    updateAssignment
);

router.delete(
    "/:id",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    deleteAssignment
);

module.exports = router;