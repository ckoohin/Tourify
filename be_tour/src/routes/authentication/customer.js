const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomerFromController,
} = require("../../controllers/authentication/customerController.js");
const { authenticate } = require("../../middleware/authMiddleware");
const { authorize } = require("../../middleware/authorize");

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

module.exports = router;