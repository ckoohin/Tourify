const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplierFromController,
} = require("../../controllers/suppliers/supplierController.js");
const { authenticate, authorize } = require("../../middleware/authMiddleware");

router.get("/:id", getSupplierById);
router.get("/", getAllSuppliers);
router.post(
    "/",
    // authenticate,
    // authorize("admin", "manager"),
    [
        body("code")
            .trim()
            .notEmpty()
            .withMessage("Mã code không được để trống")
            .isLength({ max: 11 })
            .withMessage("Mã code tối đa 11 ký tự"),
        body("type")
            .trim()
            .notEmpty()
            .withMessage("Loại nhà cung cấp không được để trống")
            .isLength({ max: 255 })
            .withMessage("Loại nhà cung cấp tối đa 255 ký tự")
            .isIn([
                "hotel",
                "restaurant",
                "transport",
                "attraction",
                "visa",
                "insurance",
                "other",
            ])
            .withMessage(
                "Status phải là một trong các giá trị: hotel,restaurant,transport,attraction,visa,insurance,other"
            ),
        body("company_name")
            .trim()
            .notEmpty()
            .withMessage("Tên nhà cung cấp không được để trống")
            .isLength({ max: 255 })
            .withMessage("Tên nhà cung cấp tối đa 255 ký tự"),
        body("tax_code")
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage("Mã số thuế nhà cung cấp tối đa 50 ký tự"),
        ,
        body("contact_person")
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage("Tên đại diện nhà cung cấp tối đa 255 ký tự"),
        ,
        body("phone")
            .trim()
            .notEmpty()
            .withMessage("Số điện thoại nhà cung cấp không được để trống")
            .isLength({ max: 20 })
            .withMessage("Số điện thoại nhà cung cấp tối đa 20 ký tự"),
        body("email")
            .optional()
            .trim()
            .isEmail()
            .withMessage("Email không hợp không hợp lệ")
            .isLength({ max: 255 })
            .withMessage("Email nhà cung cấp tối đa 255 ký tự"),
        ,
        body("address").optional().trim(),
        body("city")
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage("Tên thành phố tối đa 100 ký tự"),
        ,
        body("country")
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage("Tên quốc gia tối đa 100 ký tự"),
        ,
        body("website")
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage("Địa chỉ website nhà cung cấp tối đa 100 ký tự"),
        ,
        body("rating").optional(),
        body("total_bookings")
            .optional()
            .trim()
            .isInt()
            .withMessage("Số lượng booking không hợp lệ")
            .isLength({ max: 11 })
            .withMessage("Số lượng booking tối đa 100 ký tự"),
        ,
        body("payment_terms")
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage("Điều khoản thanh toán tối đa 255 ký tự"),
        ,
        body("credit_limit").optional(),
        body("status")
            .optional()
            .trim()
            .isIn(["active", "inactive", "blacklist"])
            .withMessage(
                "Status phải là một trong các giá trị: active,inactive,blacklist"
            ),
        body("notes").optional().trim(),
    ],
    createSupplier
);

router.put(
    "/:id",
    // authenticate,
    // authorize("admin", "manager"),
    [
        body("code")
            .trim()
            .notEmpty()
            .withMessage("Mã code không được để trống")
            .isLength({ max: 11 })
            .withMessage("Mã code tối đa 11 ký tự"),
        body("type")
            .trim()
            .notEmpty()
            .withMessage("Loại nhà cung cấp không được để trống")
            .isLength({ max: 255 })
            .withMessage("Loại nhà cung cấp tối đa 255 ký tự")
            .isIn([
                "hotel",
                "restaurant",
                "transport",
                "attraction",
                "visa",
                "insurance",
                "other",
            ])
            .withMessage(
                "Status phải là một trong các giá trị: hotel,restaurant,transport,attraction,visa,insurance,other"
            ),
        body("company_name")
            .trim()
            .notEmpty()
            .withMessage("Tên nhà cung cấp không được để trống")
            .isLength({ max: 255 })
            .withMessage("Tên nhà cung cấp tối đa 255 ký tự"),
        body("tax_code")
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage("Mã số thuế nhà cung cấp tối đa 50 ký tự"),
        ,
        body("contact_person")
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage("Tên đại diện nhà cung cấp tối đa 255 ký tự"),
        ,
        body("phone")
            .trim()
            .notEmpty()
            .withMessage("Số điện thoại nhà cung cấp không được để trống")
            .isLength({ max: 20 })
            .withMessage("Số điện thoại nhà cung cấp tối đa 20 ký tự"),
        body("email")
            .optional()
            .trim()
            .isEmail()
            .withMessage("Email không hợp không hợp lệ")
            .isLength({ max: 255 })
            .withMessage("Email nhà cung cấp tối đa 255 ký tự"),
        ,
        body("address").optional().trim(),
        body("city")
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage("Tên thành phố tối đa 100 ký tự"),
        ,
        body("country")
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage("Tên quốc gia tối đa 100 ký tự"),
        ,
        body("website")
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage("Địa chỉ website nhà cung cấp tối đa 100 ký tự"),
        ,
        body("rating").optional(),
        body("total_bookings")
            .optional()
            .trim()
            .isInt()
            .withMessage("Số lượng booking không hợp lệ")
            .isLength({ max: 11 })
            .withMessage("Số lượng booking tối đa 100 ký tự"),
        ,
        body("payment_terms")
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage("Điều khoản thanh toán tối đa 255 ký tự"),
        ,
        body("credit_limit").optional(),
        body("status")
            .optional()
            .trim()
            .isIn(["active", "inactive", "blacklist"])
            .withMessage(
                "Status phải là một trong các giá trị: active,inactive,blacklist"
            ),
        body("notes").optional().trim(),
    ],
    updateSupplier
);

router.delete(
    "/:id",
    // authenticate,
    // authorize("admin"),
    deleteSupplierFromController
);

module.exports = router;
