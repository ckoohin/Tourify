const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const AuthMiddleware = require("../../middleware/authMiddleware");
const { authorize } = require("../../middleware/authorize");

const {
    getRatingsBySupplier,
    getRatingsByTourDeparture,
    createRating,
    updateRating,
    deleteRating,
    getRatingStats,
    getRatingByTourAndSupplier,
    createBulkRatings
} = require("../../controllers/suppliers/supplierRatingController");

const ratingValidation = [
    body("supplier_id")
        .notEmpty()
        .withMessage("ID nhà cung cấp không được để trống")
        .isInt()
        .withMessage("ID nhà cung cấp phải là số"),
    
    body("tour_departure_id")
        .optional({ checkFalsy: true })
        .isInt()
        .withMessage("ID tour departure phải là số"),
    
    body("service_booking_id")
        .optional({ checkFalsy: true })
        .isInt()
        .withMessage("ID service booking phải là số"),
    
    body("rating_type")
        .notEmpty()
        .withMessage("Loại đánh giá không được để trống")
        .isIn(["service_quality", "punctuality", "communication", "value", "overall"])
        .withMessage("Loại đánh giá không hợp lệ"),
    
    body("rating")
        .notEmpty()
        .withMessage("Điểm đánh giá không được để trống")
        .isFloat({ min: 0, max: 5 })
        .withMessage("Điểm đánh giá phải từ 0 đến 5"),
    
    body("comment")
        .optional({ checkFalsy: true })
        .isLength({ max: 1000 })
        .withMessage("Nhận xét tối đa 1000 ký tự")
];

const bulkRatingValidation = [
    body("tour_departure_id")
        .notEmpty()
        .withMessage("ID tour departure không được để trống")
        .isInt()
        .withMessage("ID tour departure phải là số"),
    
    body("ratings")
        .notEmpty()
        .withMessage("Danh sách đánh giá không được để trống")
        .isArray({ min: 1 })
        .withMessage("Danh sách đánh giá phải là mảng và có ít nhất 1 phần tử"),
    
    body("ratings.*.supplier_id")
        .notEmpty()
        .withMessage("ID nhà cung cấp không được để trống")
        .isInt()
        .withMessage("ID nhà cung cấp phải là số"),
    
    body("ratings.*.rating_type")
        .notEmpty()
        .withMessage("Loại đánh giá không được để trống")
        .isIn(["service_quality", "punctuality", "communication", "value", "overall"])
        .withMessage("Loại đánh giá không hợp lệ"),
    
    body("ratings.*.rating")
        .notEmpty()
        .withMessage("Điểm đánh giá không được để trống")
        .isFloat({ min: 0, max: 5 })
        .withMessage("Điểm đánh giá phải từ 0 đến 5"),
    
    body("ratings.*.comment")
        .optional({ checkFalsy: true })
        .isLength({ max: 1000 })
        .withMessage("Nhận xét tối đa 1000 ký tự")
];

router.get(
    "/stats/supplier/:supplierId",
    AuthMiddleware.authenticate,
    authorize("reports.view"),
    getRatingStats
);

router.get(
    "/tour-departure/:tourDepartureId/supplier/:supplierId",
    AuthMiddleware.authenticate,
    getRatingByTourAndSupplier
);

router.get(
    "/tour-departure/:tourDepartureId",
    AuthMiddleware.authenticate,
    getRatingsByTourDeparture
);

router.get(
    "/supplier/:supplierId",
    AuthMiddleware.authenticate,
    getRatingsBySupplier
);

router.post(
    "/",
    AuthMiddleware.authenticate,
    ratingValidation,
    createRating
);

router.post(
    "/bulk",
    AuthMiddleware.authenticate,
    bulkRatingValidation,
    createBulkRatings
);

router.put(
    "/:id",
    AuthMiddleware.authenticate,
    [
        body("rating_type")
            .optional()
            .isIn(["service_quality", "punctuality", "communication", "value", "overall"])
            .withMessage("Loại đánh giá không hợp lệ"),
        
        body("rating")
            .optional()
            .isFloat({ min: 0, max: 5 })
            .withMessage("Điểm đánh giá phải từ 0 đến 5"),
        
        body("comment")
            .optional({ checkFalsy: true })
            .isLength({ max: 1000 })
            .withMessage("Nhận xét tối đa 1000 ký tự")
    ],
    updateRating
);

router.delete(
    "/:id",
    AuthMiddleware.authenticate,
    authorize("ratings.manage"),
    deleteRating
);

module.exports = router;