const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const tourCategoryController = require("../../controllers/tours/tourCategoryController");
const { authenticate, authorize } = require("../../middleware/authMiddleware");

router.get("/", tourCategoryController.getAll);
router.get("/tree", tourCategoryController.getTree);
router.get("/:id", tourCategoryController.getById);
router.get("/:id/children", tourCategoryController.getChildren);
router.post(
    "/",
    authenticate,
    authorize("admin", "manager"),
    [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Tên danh mục không được để trống")
            .isLength({ max: 100 })
            .withMessage("Tên danh mục tối đa 100 ký tự"),
        body("slug")
            .trim()
            .notEmpty()
            .withMessage("Slug không được để trống")
            .matches(/^[a-z0-9-]+$/)
            .withMessage("Slug chỉ chứa chữ thường, số và dấu gạch ngang")
            .isLength({ max: 100 })
            .withMessage("Slug tối đa 100 ký tự"),
        body("description").optional().trim(),
        body("parent_id")
            .optional()
            .isInt()
            .withMessage("Parent ID phải là số"),
        body("display_order")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Thứ tự hiển thị phải là số >= 0"),
        body("is_active")
            .optional()
            .isBoolean()
            .withMessage("is_active phải là boolean"),
    ],
    tourCategoryController.create
);

router.put(
    "/:id",
    authenticate,
    authorize("admin", "manager"),
    [
        body("name")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Tên danh mục không được để trống")
            .isLength({ max: 100 })
            .withMessage("Tên danh mục tối đa 100 ký tự"),
        body("slug")
            .optional()
            .trim()
            .matches(/^[a-z0-9-]+$/)
            .withMessage("Slug chỉ chứa chữ thường, số và dấu gạch ngang")
            .isLength({ max: 100 })
            .withMessage("Slug tối đa 100 ký tự"),
        body("description").optional().trim(),
        body("parent_id")
            .optional()
            .custom(
                (value) => value === null || Number.isInteger(parseInt(value))
            )
            .withMessage("Parent ID phải là số hoặc null"),
        body("display_order")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Thứ tự hiển thị phải là số >= 0"),
        body("is_active")
            .optional()
            .isBoolean()
            .withMessage("is_active phải là boolean"),
    ],
    tourCategoryController.update
);

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    tourCategoryController.delete
);

router.post(
    "/reorder",
    authenticate,
    authorize("admin", "manager"),
    [
        body("orders")
            .isArray({ min: 1 })
            .withMessage("orders phải là mảng và không rỗng"),
        body("orders.*.id").isInt().withMessage("ID phải là số"),
        body("orders.*.display_order")
            .isInt({ min: 0 })
            .withMessage("display_order phải là số >= 0"),
    ],
    tourCategoryController.updateOrder
);

module.exports = router;
