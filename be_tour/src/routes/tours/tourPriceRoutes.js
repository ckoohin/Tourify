const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { authenticate, authorize } = require("../../middleware/authMiddleware");

const {
    getAllTourPrices,
    getTourPriceById,
    createTourPrice,
    updateTourPrice,
    deleteTourPriceFromController,
} = require("../../controllers/tours/tourPriceController.js");

router.get("/:id", getTourPriceById);
router.get("/", getAllTourPrices);

router.post(
    "/",
    // authenticate,
    // authorize("admin", "manager"),
    [
        body("tour_version_id")
            .trim()
            .notEmpty()
            .withMessage("Mã tour version không được để trống")
            .isLength({ max: 11 })
            .withMessage("Mã tour version tối đa 11 ký tự"),
        body("price_type")
            .trim()
            .notEmpty()
            .withMessage("Loại giá tour tour không được để trống")
            .isIn(["adult", "child", "infant", "senior", "group"])
            .withMessage(
                "Trường này phải là một trong các giá trị: adult, child, infant, senior, group"
            ),
        body("min_pax")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 11 })
            .withMessage("Trường này tối đa 11 ký tự")
            .isInt()
            .withMessage("Vui lòng nhập số"),
        body("max_pax")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 11 })
            .withMessage("Trường này tối đa 11 ký tự")
            .isInt()
            .withMessage("Vui lòng nhập số"),
        body("price")
            .trim()
            .notEmpty()
            .withMessage("Trường giá không được để trống")
            .isDecimal()
            .withMessage(
                "Vui nhập giá dưới dạng số thập phân. Dùng dấu chấm ngăn cách phần nguyên và phần thập phân"
            ),
        body("currency")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 3 })
            .withMessage("Trường đơn vị tiền tệ tối đa 3 ký tự"),
        body("valid_from")
            .optional({ checkFalsy: true })
            .trim()
            .isDate()
            .withMessage("valid_from phải là ngày hợp lệ (YYYY-MM-DD)"),
        body("valid_to")
            .optional({ checkFalsy: true })
            .trim()
            .isDate()
            .withMessage("valid_to phải là ngày hợp lệ (YYYY-MM-DD)"),
        body("description").optional({ checkFalsy: true }),
        body("is_active").optional({ checkFalsy: true }),
    ],
    createTourPrice
);

router.put(
    "/:id",
    // authenticate,
    // authorize("admin", "manager"),
    [
        body("tour_version_id")
            .trim()
            .notEmpty()
            .withMessage("Mã tour version không được để trống")
            .isLength({ max: 11 })
            .withMessage("Mã tour version tối đa 11 ký tự"),
        body("price_type")
            .trim()
            .notEmpty()
            .withMessage("Loại giá tour tour không được để trống")
            .isIn(["adult", "child", "infant", "senior", "group"])
            .withMessage(
                "Trường này phải là một trong các giá trị: adult, child, infant, senior, group"
            ),
        body("min_pax")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 11 })
            .withMessage("Trường này tối đa 11 ký tự")
            .isInt()
            .withMessage("Vui lòng nhập số"),
        body("max_pax")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 11 })
            .withMessage("Trường này tối đa 11 ký tự")
            .isInt()
            .withMessage("Vui lòng nhập số"),
        body("price")
            .trim()
            .notEmpty()
            .withMessage("Trường giá không được để trống")
            .isDecimal()
            .withMessage(
                "Vui nhập giá dưới dạng số thập phân. Dùng dấu chấm ngăn cách phần nguyên và phần thập phân"
            ),
        body("currency")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 3 })
            .withMessage("Trường đơn vị tiền tệ tối đa 3 ký tự"),
        body("valid_from")
            .optional({ checkFalsy: true })
            .trim()
            .isDate()
            .withMessage("valid_from phải là ngày hợp lệ (YYYY-MM-DD)"),
        body("valid_to")
            .optional({ checkFalsy: true })
            .trim()
            .isDate()
            .withMessage("valid_to phải là ngày hợp lệ (YYYY-MM-DD)"),
        body("description").optional({ checkFalsy: true }),
        body("is_active").optional({ checkFalsy: true }),
    ],
    updateTourPrice
);

router.delete(
    "/:id",
    // authenticate,
    // authorize("admin"),
    deleteTourPriceFromController
);

module.exports = router;
