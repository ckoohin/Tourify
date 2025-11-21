const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { authenticate, authorize } = require("../../middleware/authMiddleware");

const {
    getAllTourVersions,
    getTourVersionById,
    createTourVersion,
    updateTourVersion,
    deleteTourVersionFromController,
} = require("../../controllers/tours/tourVersionController");

router.get("/:id", getTourVersionById);
router.get("/", getAllTourVersions);

router.post(
    "/",
    // authenticate,
    // authorize("admin", "manager"),
    [
        body("tour_id")
            .trim()
            .notEmpty()
            .withMessage("Mã tour không được để trống")
            .isLength({ max: 11 })
            .withMessage("Mã tour tối đa 11 ký tự"),
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Tên phiên bản tour không được để trống")
            .isLength({ max: 100 })
            .withMessage("Tên phiên bản tour tối đa 100 ký tự"),
        body("type")
            .trim()
            .notEmpty()
            .withMessage("Loại tour không được để trống")
            .isIn(["seasonal", "promotion", "special", "standard"])
            .withMessage(
                "Trường này phải là một trong các giá trị: seasonal, promotion, special, standard"
            ),
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
        body("is_default").optional({ checkFalsy: true }),
        body("is_active").optional({ checkFalsy: true }),
    ],
    createTourVersion
);

router.put(
    "/:id",
    // authenticate,
    // authorize("admin", "manager"),
    [
        body("tour_id")
            .trim()
            .notEmpty()
            .withMessage("Mã tour không được để trống")
            .isLength({ max: 11 })
            .withMessage("Mã tour tối đa 11 ký tự"),
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Tên phiên bản tour không được để trống")
            .isLength({ max: 100 })
            .withMessage("Tên phiên bản tour tối đa 100 ký tự"),
        body("type")
            .trim()
            .notEmpty()
            .withMessage("Loại tour không được để trống")
            .isIn(["seasonal", "promotion", "special", "standard"])
            .withMessage(
                "Trường này phải là một trong các giá trị: seasonal, promotion, special, standard"
            ),
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
        body("is_default").optional({ checkFalsy: true }),
        body("is_active").optional({ checkFalsy: true }),
    ],
    updateTourVersion
);

router.delete(
    "/:id",
    // authenticate,
    // authorize("admin"),
    deleteTourVersionFromController
);

module.exports = router;
