const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
    getAllBookingStatusHistory,
    getBookingStatusHistoryById,
    updateBookingStatusHistory,
    deleteBookingStatusHistoryFromController,
} = require("../../controllers/bookings/bookingStatusHistoryController.js");
const { authenticate } = require("../../middleware/authMiddleware");
const { authorize } = require("../../middleware/authorize");

router.get(
    "/:id",
    authenticate,
    authorize("bookingStatus.manage"),
    getBookingStatusHistoryById
);

router.get(
    "/",
    authenticate,
    authorize("bookingStatus.manage"),
    getAllBookingStatusHistory
);

router.put(
    "/:id",
    authenticate,
    authorize("bookingStatus.manage"),
    [
        body("booking_id")
            .trim()
            .notEmpty()
            .withMessage("Mã booking không được để trống")
            .isLength({ max: 11 })
            .withMessage("Mã booking tối đa 11 ký tự"),
        body("from_status")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 50 })
            .withMessage("Trạng thái cũ tối đa 50 ký tự"),
        body("to_status")
            .trim()
            .notEmpty()
            .withMessage("Trạng thái mới không được để trống")
            .isLength({ max: 50 })
            .withMessage("Trạng thái mới tối đa 50 ký tự"),
        body("changed_by")
            .trim()
            .notEmpty()
            .withMessage("Mã người thay đổi không được để trống")
            .isInt()
            .withMessage("Vui lòng chỉ nhập số"),
        body("image_url")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 255 })
            .withMessage("Url ảnh tối đa 255 ký tự"),
    ],
    updateBookingStatusHistory
);

router.delete(
    "/:id",
    authenticate,
    authorize("bookingStatus.manage"),
    deleteBookingStatusHistoryFromController
);

module.exports = router;
