const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const {
    getAllCustomers,
    fetchAllCustomersInQuotes,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomerFromController,
    createGuestsFromBooking,
    getGuestsFromBooking,
    checkBookingSlots,
    deleteGuestFromBooking,
} = require("../../controllers/authentication/customerController.js");
const { authenticate } = require("../../middleware/authMiddleware");
const { authorize } = require("../../middleware/authorize");

// route lấy danh sách khách hàng trong bảng quotes với điều kiện status = sent
router.get(
    "/quotes",
    authenticate,
    authorize("customer.manage"),
    fetchAllCustomersInQuotes
);

router.get("/:id", authenticate, authorize("customer.manage"), getCustomerById);

router.get("/", authenticate, authorize("customer.manage"), getAllCustomers);

router.post(
    "/",
    authenticate,
    authorize("customer.manage"),
    [
        body("user_id")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("User_id tối đa 11 ký tự"),
        body("customer_code")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 50 })
            .withMessage("Mã khách hàng tối đa 50 ký tự"),
        body("customer_type")
            .optional({ checkFalsy: true })
            .trim()
            .isIn(["individual", "company", "agent"])
            .withMessage(
                "Status phải là một trong các giá trị: individual, company, agent"
            ),
        body("full_name")
            .trim()
            .notEmpty()
            .withMessage("Tên khách hàng không được để trống")
            .isLength({ max: 255 })
            .withMessage("Tên khách hàng tối đa 255 ký tự"),
        ,
        body("email")
            .optional({ checkFalsy: true })
            .trim()
            .isEmail()
            .withMessage("Email không hợp lệ, vui lòng nhập lại")
            .isLength({ max: 255 })
            .withMessage("Email tối đa 255 ký tự"),
        ,
        body("phone")
            .trim()
            .notEmpty()
            .withMessage("Số điện thoại khách hàng không được để trống")
            .isLength({ max: 20 })
            .withMessage("Số điện thoại khách hàng tối đa 20 ký tự"),
        body("id_number")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 50 })
            .withMessage("Số chứng minh thư tối đa 50 ký tự"),
        body("birthday")
            .optional({ checkFalsy: true })
            .trim()
            .isDate()
            .withMessage("Ngày sinh phải là ngày hợp lệ (YYYY-MM-DD)"),
        body("gender")
            .optional({ checkFalsy: true })
            .trim()
            .isIn(["male", "female", "other"])
            .withMessage(
                "Giới tính phải là một trong các giá trị: male, female, other"
            ),
        body("nationality")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 100 })
            .withMessage("Quốc tịch tối đa 100 ký tự"),
        ,
        body("address").optional({ checkFalsy: true }).trim(),
        body("city")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 100 })
            .withMessage("Tên thành phố tối đa 100 ký tự"),
        body("country")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 100 })
            .withMessage("Tên quốc gia tối đa 100 ký tự"),
        body("company_name")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 255 })
            .withMessage("Tên công ty tối đa 100 ký tự"),
        body("tax_code")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 50 })
            .withMessage("Mã số thuế tối đa 50 ký tự"),
        body("notes").optional({ checkFalsy: true }).trim(),
        body("customer_source")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 100 })
            .withMessage("Nguồn khách tối đa 100 ký tự"),
        body("assigned_to")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Mã nhân viên chăm sóc tối đa 11 ký tự"),
        body("is_vip")
            .optional({ checkFalsy: true })
            .trim()
            .isIn(["0", "1"])
            .withMessage(
                "Trường này phải là một trong các giá trị: male, female, other"
            ),
        body("is_blacklist")
            .optional({ checkFalsy: true })
            .trim()
            .isIn(["0", "1"])
            .withMessage(
                "Trường này phải là một trong các giá trị: male, female, other"
            ),
    ],
    createCustomer
);

router.put(
    "/:id",
    authenticate,
    authorize("customer.manage"),
    [
        body("user_id")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("User_id tối đa 11 ký tự"),
        body("customer_code")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 50 })
            .withMessage("Mã khách hàng tối đa 50 ký tự"),
        body("customer_type")
            .optional({ checkFalsy: true })
            .trim()
            .isIn(["individual", "company", "agent"])
            .withMessage(
                "Status phải là một trong các giá trị: individual, company, agent"
            ),
        body("full_name")
            .trim()
            .notEmpty()
            .withMessage("Tên khách hàng không được để trống")
            .isLength({ max: 255 })
            .withMessage("Tên khách hàng tối đa 255 ký tự"),
        ,
        body("email")
            .optional({ checkFalsy: true })
            .trim()
            .isEmail()
            .withMessage("Email không hợp lệ, vui lòng nhập lại")
            .isLength({ max: 255 })
            .withMessage("Email tối đa 255 ký tự"),
        ,
        body("phone")
            .trim()
            .notEmpty()
            .withMessage("Số điện thoại khách hàng không được để trống")
            .isLength({ max: 20 })
            .withMessage("Số điện thoại khách hàng tối đa 20 ký tự"),
        body("id_number")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 50 })
            .withMessage("Số chứng minh thư tối đa 50 ký tự"),
        body("birthday")
            .optional({ checkFalsy: true })
            .trim()
            .isDate()
            .withMessage("Ngày sinh phải là ngày hợp lệ (YYYY-MM-DD)"),
        body("gender")
            .optional({ checkFalsy: true })
            .trim()
            .isIn(["male", "female", "other"])
            .withMessage(
                "Giới tính phải là một trong các giá trị: male, female, other"
            ),
        body("nationality")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 100 })
            .withMessage("Quốc tịch tối đa 100 ký tự"),
        ,
        body("address").optional({ checkFalsy: true }).trim(),
        body("city")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 100 })
            .withMessage("Tên thành phố tối đa 100 ký tự"),
        body("country")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 100 })
            .withMessage("Tên quốc gia tối đa 100 ký tự"),
        body("company_name")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 255 })
            .withMessage("Tên công ty tối đa 100 ký tự"),
        body("tax_code")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 50 })
            .withMessage("Mã số thuế tối đa 50 ký tự"),
        body("notes").optional({ checkFalsy: true }).trim(),
        body("customer_source")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 100 })
            .withMessage("Nguồn khách tối đa 100 ký tự"),
        body("assigned_to")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Vui lòng chỉ nhập số")
            .isLength({ max: 11 })
            .withMessage("Mã nhân viên chăm sóc tối đa 11 ký tự"),
        body("is_vip")
            .optional({ checkFalsy: true })
            .trim()
            .isIn(["0", "1"])
            .withMessage(
                "Trường này phải là một trong các giá trị: male, female, other"
            ),
        body("is_blacklist")
            .optional({ checkFalsy: true })
            .trim()
            .isIn(["0", "1"])
            .withMessage(
                "Trường này phải là một trong các giá trị: male, female, other"
            ),
    ],
    updateCustomer
);

router.delete(
    "/:id",
    authenticate,
    authorize("customer.manage"),
    deleteCustomerFromController
);

router.post(
    "/from-booking",
    authenticate,
    authorize("customer.manage"),
    [
        body("booking_id")
            .notEmpty()
            .withMessage("booking_id không được để trống")
            .isInt()
            .withMessage("booking_id phải là số nguyên"),
        
        body("guests")
            .notEmpty()
            .withMessage("Danh sách khách không được để trống")
            .isArray({ min: 1 })
            .withMessage("Danh sách khách phải là mảng và có ít nhất 1 khách"),
        
        body("guests.*.guest_type")
            .notEmpty()
            .withMessage("Loại khách không được để trống")
            .isIn(["adult", "child", "infant"])
            .withMessage("Loại khách phải là: adult, child, hoặc infant"),
        
        body("guests.*.title")
            .optional()
            .isIn(["Mr", "Mrs", "Ms", "Dr"])
            .withMessage("Title phải là: Mr, Mrs, Ms, hoặc Dr"),
        
        body("guests.*.first_name")
            .notEmpty()
            .withMessage("Tên không được để trống")
            .trim()
            .isLength({ max: 100 })
            .withMessage("Tên tối đa 100 ký tự"),
        
        body("guests.*.last_name")
            .notEmpty()
            .withMessage("Họ không được để trống")
            .trim()
            .isLength({ max: 100 })
            .withMessage("Họ tối đa 100 ký tự"),
        
        body("guests.*.full_name")
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage("Họ tên đầy đủ tối đa 255 ký tự"),
        
        body("guests.*.email")
            .optional({ checkFalsy: true })
            .isEmail()
            .withMessage("Email không hợp lệ")
            .isLength({ max: 255 })
            .withMessage("Email tối đa 255 ký tự"),
        
        body("guests.*.phone")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 20 })
            .withMessage("Số điện thoại tối đa 20 ký tự"),
        
        body("guests.*.birthday")
            .optional({ checkFalsy: true })
            .isDate()
            .withMessage("Ngày sinh phải là ngày hợp lệ (YYYY-MM-DD)"),
        
        body("guests.*.gender")
            .optional({ checkFalsy: true })
            .isIn(["male", "female", "other"])
            .withMessage("Giới tính phải là: male, female, hoặc other"),
        
        body("guests.*.nationality")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 100 })
            .withMessage("Quốc tịch tối đa 100 ký tự"),
        
        body("guests.*.id_number")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 50 })
            .withMessage("Số CMND/Passport tối đa 50 ký tự"),
        
        body("guests.*.id_issue_date")
            .optional({ checkFalsy: true })
            .isDate()
            .withMessage("Ngày cấp phải là ngày hợp lệ"),
        
        body("guests.*.id_expiry_date")
            .optional({ checkFalsy: true })
            .isDate()
            .withMessage("Ngày hết hạn phải là ngày hợp lệ"),
        
        body("guests.*.is_primary_contact")
            .optional()
            .isInt({ min: 0, max: 1 })
            .withMessage("is_primary_contact phải là 0 hoặc 1"),
        
        body("guests.*.special_requests")
            .optional({ checkFalsy: true })
            .trim(),
        
        body("guests.*.medical_notes")
            .optional({ checkFalsy: true })
            .trim(),
        
        body("guests.*.customer_id")
            .optional({ checkFalsy: true })
            .isInt()
            .withMessage("customer_id phải là số nguyên"),
        
        body("guests.*.customer_type")
            .optional()
            .isIn(["individual", "company", "agent"])
            .withMessage("customer_type phải là: individual, company, hoặc agent"),
        
        body("guests.*.address")
            .optional({ checkFalsy: true })
            .trim(),
        
        body("guests.*.city")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 100 })
            .withMessage("Thành phố tối đa 100 ký tự"),
        
        body("guests.*.country")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 100 })
            .withMessage("Quốc gia tối đa 100 ký tự"),
        
        body("guests.*.notes")
            .optional({ checkFalsy: true })
            .trim()
    ],
    createGuestsFromBooking
);

router.get(
    "/from-booking/:booking_id",
    authenticate,
    authorize("customer.manage"),
    [
        param("booking_id")
            .isInt()
            .withMessage("booking_id phải là số nguyên")
    ],
    getGuestsFromBooking
);

router.get(
    "/booking-slots/:booking_id",
    authenticate,
    authorize("customer.manage"),
    [
        param("booking_id")
            .isInt()
            .withMessage("booking_id phải là số nguyên")
    ],
    checkBookingSlots
);

router.delete(
    "/booking-guest/:booking_guest_id",
    authenticate,
    authorize("customer.manage"),
    [
        param("booking_guest_id")
            .isInt()
            .withMessage("booking_guest_id phải là số nguyên")
    ],
    deleteGuestFromBooking
);

module.exports = router;