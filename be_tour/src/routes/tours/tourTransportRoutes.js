const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const AuthMiddleware = require("../../middleware/authMiddleware");
const { authorize } = require("../../middleware/authorize");
const {
    getTransportsByTourDeparture,
    getTransportById,
    createTransport,
    updateTransport,
    deleteTransport,
    updateBookingStatus,
    getAvailableSeats
} = require("../../controllers/tours/tourTransportController");

const transportValidation = [
    body("tour_departure_id")
        .notEmpty()
        .withMessage("ID tour departure không được để trống")
        .isInt()
        .withMessage("ID tour departure phải là số"),
    
    body("transport_type")
        .notEmpty()
        .withMessage("Loại phương tiện không được để trống")
        .isIn(["flight", "bus", "train", "boat", "car", "other"])
        .withMessage("Loại phương tiện không hợp lệ"),
    
    body("route_from")
        .notEmpty()
        .withMessage("Điểm đi không được để trống")
        .isLength({ max: 255 })
        .withMessage("Điểm đi tối đa 255 ký tự"),
    
    body("route_to")
        .notEmpty()
        .withMessage("Điểm đến không được để trống")
        .isLength({ max: 255 })
        .withMessage("Điểm đến tối đa 255 ký tự"),
    
    body("departure_datetime")
        .notEmpty()
        .withMessage("Thời gian khởi hành không được để trống")
        .isISO8601()
        .withMessage("Thời gian khởi hành không đúng định dạng"),
    
    body("arrival_datetime")
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage("Thời gian đến không đúng định dạng"),
    
    body("transport_provider")
        .optional({ checkFalsy: true })
        .isLength({ max: 255 })
        .withMessage("Nhà cung cấp tối đa 255 ký tự"),
    
    body("flight_number")
        .optional({ checkFalsy: true })
        .isLength({ max: 50 })
        .withMessage("Số hiệu chuyến bay tối đa 50 ký tự"),
    
    body("vehicle_number")
        .optional({ checkFalsy: true })
        .isLength({ max: 50 })
        .withMessage("Biển số xe tối đa 50 ký tự"),
    
    body("seat_class")
        .optional({ checkFalsy: true })
        .isLength({ max: 50 })
        .withMessage("Hạng ghế tối đa 50 ký tự"),
    
    body("total_seats")
        .optional({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage("Tổng số ghế phải là số nguyên dương"),
    
    body("unit_price")
        .optional({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage("Giá đơn vị phải là số không âm"),
    
    body("total_price")
        .optional({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage("Tổng giá phải là số không âm"),
    
    body("currency")
        .optional({ checkFalsy: true })
        .isLength({ max: 3 })
        .withMessage("Mã tiền tệ tối đa 3 ký tự"),
    
    body("booking_status")
        .optional({ checkFalsy: true })
        .isIn(["pending", "confirmed", "ticketed", "cancelled"])
        .withMessage("Trạng thái booking không hợp lệ"),
    
    body("booking_reference")
        .optional({ checkFalsy: true })
        .isLength({ max: 100 })
        .withMessage("Mã đặt chỗ tối đa 100 ký tự"),
    
    body("driver_id")
        .optional({ checkFalsy: true })
        .isInt()
        .withMessage("ID tài xế phải là số"),
    
    body("notes")
        .optional({ checkFalsy: true })
        .isLength({ max: 2000 })
        .withMessage("Ghi chú tối đa 2000 ký tự")
];

router.get(
    "/:id/available-seats",
    AuthMiddleware.authenticate,
    authorize("tours.manage", "guide.view"),
    getAvailableSeats
);

router.get(
    "/tour-departure/:tourDepartureId",
    AuthMiddleware.authenticate,
    authorize("tours.manage", "guide.view"),
    getTransportsByTourDeparture
);

router.get(
    "/:id",
    AuthMiddleware.authenticate,
    authorize("tours.manage", "guide.view"),
    getTransportById
);

router.post(
    "/",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    transportValidation,
    createTransport
);

router.put(
    "/:id",
    AuthMiddleware.authenticate,
    authorize("tours.manage",),
    [
        body("transport_type")
            .optional()
            .isIn(["flight", "bus", "train", "boat", "car", "other"])
            .withMessage("Loại phương tiện không hợp lệ"),
        
        body("route_from")
            .optional()
            .notEmpty()
            .withMessage("Điểm đi không được để trống")
            .isLength({ max: 255 })
            .withMessage("Điểm đi tối đa 255 ký tự"),
        
        body("route_to")
            .optional()
            .notEmpty()
            .withMessage("Điểm đến không được để trống")
            .isLength({ max: 255 })
            .withMessage("Điểm đến tối đa 255 ký tự"),
        
        body("departure_datetime")
            .optional()
            .isISO8601()
            .withMessage("Thời gian khởi hành không đúng định dạng"),
        
        ...transportValidation.slice(5) //Skip tour_departure_id, transport_type, route_from, route_to, departure_datetime
    ],
    updateTransport
);

router.patch(
    "/:id/booking-status",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    [
        body("booking_status")
            .notEmpty()
            .withMessage("Trạng thái booking không được để trống")
            .isIn(["pending", "confirmed", "ticketed", "cancelled"])
            .withMessage("Trạng thái booking không hợp lệ"),
        
        body("booking_reference")
            .optional({ checkFalsy: true })
            .isLength({ max: 100 })
            .withMessage("Mã đặt chỗ tối đa 100 ký tự")
    ],
    updateBookingStatus
);

router.delete(
    "/:id",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    deleteTransport
);

module.exports = router;