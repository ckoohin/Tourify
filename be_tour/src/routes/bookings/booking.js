const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBookingFromController,
} = require("../../controllers/bookings/bookingController.js");
const { authenticate } = require("../../middleware/authMiddleware");
const { authorize } = require("../../middleware/authorize");

router.get("/:id", authenticate, authorize("booking.manage"), getBookingById);

router.get("/", authenticate, authorize("booking.manage"), getAllBookings);

router.post(
    "/",
    authenticate,
    authorize("booking.manage"),
    [
        body("booking_code")
            .trim()
            .notEmpty()
            .withMessage("Mã booking không được để trống")
            .isLength({ max: 50 })
            .withMessage("Mã booking tối đa 50 ký tự"),
        body("customer_id")
            .trim()
            .notEmpty()
            .withMessage("Mã khách hàng không được để trống")
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Mã khách hàng tối đa 11 ký tự"),
        body("tour_version_id")
            .trim()
            .notEmpty()
            .withMessage("Mã phiên bản tour không được để trống")
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Mã phiên bản tour tối đa 11 ký tự"),
        body("booking_type")
            .optional({ checkFalsy: true })
            .trim()
            .isIn(["individual", "group"])
            .withMessage(
                "Loại booking phải là một trong các giá trị: individual, group"
            ),
        body("departure_date")
            .trim()
            .notEmpty()
            .withMessage("Ngày khởi hành không được để trống")
            .isDate()
            .withMessage("Ngày khởi hành phải là ngày hợp lệ (YYYY-MM-DD)"),
        body("total_adults")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Trường này tối đa 11 ký tự"),
        body("total_children")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Trường này tối đa 11 ký tự"),
        body("total_infants")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Trường này tối đa 11 ký tự"),
        body("total_guests")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Trường này tối đa 11 ký tự"),
        body("unit_price")
            .trim()
            .notEmpty()
            .withMessage("Vui lòng nhập trường này")
            .isDecimal()
            .withMessage("Chỉ chấp nhận số dạng nguyên hoặc thập phân"),
        body("total_amount")
            .trim()
            .notEmpty()
            .withMessage("Vui lòng nhập trường này")
            .isDecimal()
            .withMessage("Chỉ chấp nhận số dạng nguyên hoặc thập phân"),
        body("discount_amount")
            .optional({ checkFalsy: true })
            .trim()
            .isDecimal()
            .withMessage("Chỉ chấp nhận số dạng nguyên hoặc thập phân"),
        body("final_amount")
            .optional({ checkFalsy: true })
            .trim()
            .isDecimal()
            .withMessage("Chỉ chấp nhận số dạng nguyên hoặc thập phân"),
        body("paid_amount")
            .optional({ checkFalsy: true })
            .trim()
            .isDecimal()
            .withMessage("Chỉ chấp nhận số dạng nguyên hoặc thập phân"),
        body("remaining_amount")
            .optional({ checkFalsy: true })
            .trim()
            .isDecimal()
            .withMessage("Chỉ chấp nhận số dạng nguyên hoặc thập phân"),
        body("currency")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 3 })
            .withMessage("Trường này tối đa 3 ký tự"),
        body("status")
            .optional({ checkFalsy: true })
            .trim()
            .isIn([
                "pending",
                "confirmed",
                "deposited",
                "paid",
                "completed",
                "cancelled",
            ])
            .withMessage(
                "Trạng thái booking phải là một trong các giá trị: pending , confirmed , deposited , paid , completed , cancelled "
            ),
        body("special_requests").optional({ checkFalsy: true }).trim(),
        body("coupon_code")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 50 })
            .withMessage("Trường này tối đa 50 ký tự"),
        body("internal_notes").optional({ checkFalsy: true }).trim(),
        body("cancel_reason").optional({ checkFalsy: true }).trim(),
        body("cancelled_at")
            .optional({ checkFalsy: true })
            .trim()
            .isISO8601()
            .withMessage(
                "Dữ liệu không hợp lệ, vui lòng nhập theo VD: 2025-11-25T13:20:00"
            )
            .toDate(),
        body("sales_person_id")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Trường này tối đa 11 ký tự"),
        body("created_by")
            .trim()
            .notEmpty()
            .withMessage("Vui lòng nhập trường này")
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Trường này tối đa 11 ký tự"),
    ],
    createBooking
);

router.put(
    "/:id",
    authenticate,
    authorize("booking.manage"),
    [
        body("booking_code")
            .trim()
            .notEmpty()
            .withMessage("Mã booking không được để trống")
            .isLength({ max: 50 })
            .withMessage("Mã booking tối đa 50 ký tự"),
        body("customer_id")
            .trim()
            .notEmpty()
            .withMessage("Mã khách hàng không được để trống")
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Mã khách hàng tối đa 11 ký tự"),
        body("tour_version_id")
            .trim()
            .notEmpty()
            .withMessage("Mã phiên bản tour không được để trống")
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Mã phiên bản tour tối đa 11 ký tự"),
        body("booking_type")
            .optional({ checkFalsy: true })
            .trim()
            .isIn(["individual", "group"])
            .withMessage(
                "Loại booking phải là một trong các giá trị: individual, group"
            ),
        body("departure_date")
            .trim()
            .notEmpty()
            .withMessage("Ngày khởi hành không được để trống")
            .isDate()
            .withMessage("Ngày khởi hành phải là ngày hợp lệ (YYYY-MM-DD)"),
        body("total_adults")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Trường này tối đa 11 ký tự"),
        body("total_children")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Trường này tối đa 11 ký tự"),
        body("total_infants")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Trường này tối đa 11 ký tự"),
        body("total_guests")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Trường này tối đa 11 ký tự"),
        body("unit_price")
            .trim()
            .notEmpty()
            .withMessage("Vui lòng nhập trường này")
            .isDecimal()
            .withMessage("Chỉ chấp nhận số dạng nguyên hoặc thập phân"),
        body("total_amount")
            .trim()
            .notEmpty()
            .withMessage("Vui lòng nhập trường này")
            .isDecimal()
            .withMessage("Chỉ chấp nhận số dạng nguyên hoặc thập phân"),
        body("discount_amount")
            .optional({ checkFalsy: true })
            .trim()
            .isDecimal()
            .withMessage("Chỉ chấp nhận số dạng nguyên hoặc thập phân"),
        body("final_amount")
            .optional({ checkFalsy: true })
            .trim()
            .isDecimal()
            .withMessage("Chỉ chấp nhận số dạng nguyên hoặc thập phân"),
        body("paid_amount")
            .optional({ checkFalsy: true })
            .trim()
            .isDecimal()
            .withMessage("Chỉ chấp nhận số dạng nguyên hoặc thập phân"),
        body("remaining_amount")
            .optional({ checkFalsy: true })
            .trim()
            .isDecimal()
            .withMessage("Chỉ chấp nhận số dạng nguyên hoặc thập phân"),
        body("currency")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 3 })
            .withMessage("Trường này tối đa 3 ký tự"),
        body("status")
            .optional({ checkFalsy: true })
            .trim()
            .isIn([
                "pending",
                "confirmed",
                "deposited",
                "paid",
                "completed",
                "cancelled",
            ])
            .withMessage(
                "Trạng thái booking phải là một trong các giá trị: pending , confirmed , deposited , paid , completed , cancelled "
            ),
        body("special_requests").optional({ checkFalsy: true }).trim(),
        body("coupon_code")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 50 })
            .withMessage("Trường này tối đa 50 ký tự"),
        body("internal_notes").optional({ checkFalsy: true }).trim(),
        body("cancel_reason").optional({ checkFalsy: true }).trim(),
        body("cancelled_at")
            .optional({ checkFalsy: true })
            .trim()
            .isISO8601()
            .withMessage(
                "Dữ liệu không hợp lệ, vui lòng nhập theo VD: 2025-11-25T13:20:00"
            )
            .toDate(),
        body("sales_person_id")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Trường này tối đa 11 ký tự"),
        body("created_by")
            .trim()
            .notEmpty()
            .withMessage("Vui lòng nhập trường này")
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Trường này tối đa 11 ký tự"),
    ],
    updateBooking
);

router.delete(
    "/:id",
    authenticate,
    authorize("booking.manage"),
    deleteBookingFromController
);

module.exports = router;