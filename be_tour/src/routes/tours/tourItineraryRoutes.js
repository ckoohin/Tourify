const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const AuthMiddleware = require("../../middleware/authMiddleware");
const { authorize } = require("../../middleware/authorize");
const {
    getItinerariesByTourVersion,
    getItineraryById,
    createItinerary,
    updateItinerary,
    deleteItinerary,
    deleteAllItinerariesByTourVersion
} = require("../../controllers/tours/tourItineraryController");

const itineraryValidation = [
    body("tour_version_id")
        .notEmpty()
        .withMessage("ID tour version không được để trống")
        .isInt()
        .withMessage("ID tour version phải là số"),
    
    body("day_number")
        .notEmpty()
        .withMessage("Số ngày không được để trống")
        .isInt({ min: 1 })
        .withMessage("Số ngày phải là số nguyên dương"),
    
    body("title")
        .notEmpty()
        .withMessage("Tiêu đề không được để trống")
        .isLength({ max: 255 })
        .withMessage("Tiêu đề tối đa 255 ký tự"),
    
    body("description")
        .optional({ checkFalsy: true })
        .isLength({ max: 5000 })
        .withMessage("Mô tả tối đa 5000 ký tự"),
    
    body("activities")
        .optional({ checkFalsy: true })
        .isArray()
        .withMessage("Activities phải là mảng"),
    
    body("meals")
        .optional({ checkFalsy: true })
        .isObject()
        .withMessage("Meals phải là object"),
    
    body("meals.breakfast")
        .optional()
        .isBoolean()
        .withMessage("Breakfast phải là boolean"),
    
    body("meals.lunch")
        .optional()
        .isBoolean()
        .withMessage("Lunch phải là boolean"),
    
    body("meals.dinner")
        .optional()
        .isBoolean()
        .withMessage("Dinner phải là boolean"),
    
    body("accommodation")
        .optional({ checkFalsy: true })
        .isLength({ max: 255 })
        .withMessage("Accommodation tối đa 255 ký tự"),
    
    body("notes")
        .optional({ checkFalsy: true })
        .isLength({ max: 1000 })
        .withMessage("Notes tối đa 1000 ký tự")
];

router.get(
    "/tour-version/:tourVersionId",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    getItinerariesByTourVersion
);

router.get(
    "/:id",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    getItineraryById
);

router.post(
    "/",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    itineraryValidation,
    createItinerary
);

router.put(
    "/:id",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    [
        body("day_number")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Số ngày phải là số nguyên dương"),
        
        body("title")
            .optional()
            .notEmpty()
            .withMessage("Tiêu đề không được để trống")
            .isLength({ max: 255 })
            .withMessage("Tiêu đề tối đa 255 ký tự"),
        
        ...itineraryValidation.slice(3) //Skip tour_version_id, day_number, title
    ],
    updateItinerary
);

router.delete(
    "/:id",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    deleteItinerary
);

router.delete(
    "/tour-version/:tourVersionId/all",
    AuthMiddleware.authenticate,
    authorize("tours.manage"),
    deleteAllItinerariesByTourVersion
);

module.exports = router;