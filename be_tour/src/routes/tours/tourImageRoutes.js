const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { authenticate } = require("../../middleware/authMiddleware");
const { authorize } = require("../../middleware/authorize");
const { createImg } = require("../../controllers/tours/tourImageController.js");
const { upload } = require("../../services/tourService.js");
// router.get("/:id", getTourById);
// router.get("/", getAllTours);

router.post(
    "/",
    authenticate,
    authorize("toursImage.manage"),
    upload.single("img"),
    [
        body("tour_id")
            .trim()
            .notEmpty()
            .withMessage("Tour_ID không được để trống")
            .isLength({ max: 50 })
            .withMessage("Mã code tối đa 50 ký tự"),
        body("title")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 255 })
            .withMessage("Tiêu đề tối đa 255 ký tự"),
        body("description").optional({ checkFalsy: true }).trim(),
        body("display_order")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Trường này chỉ được nhập số"),
        body("is_featured")
            .optional({ checkFalsy: true })
            .trim()
            .isInt()
            .withMessage("Trường này chỉ được nhập số"),
    ],
    createImg
);

// router.put(
//     "/:id",
//     // authenticate,
//     // authorize("admin", "manager"),
//     [
//         body("code")
//             .trim()
//             .notEmpty()
//             .withMessage("Mã code không được để trống")
//             .isLength({ max: 50 })
//             .withMessage("Mã code tối đa 50 ký tự"),
//         body("name")
//             .trim()
//             .notEmpty()
//             .withMessage("Tên tour không được để trống")
//             .isLength({ max: 255 })
//             .withMessage("Loại nhà cung cấp tối đa 255 ký tự"),
//         body("slug")
//             .trim()
//             .notEmpty()
//             .withMessage("Slug không được để trống")
//             .matches(/^[a-z0-9-]+$/)
//             .withMessage("Slug chỉ chứa chữ thường, số và dấu gạch ngang")
//             .isLength({ max: 255 })
//             .withMessage("Slug tối đa 255 ký tự"),
//         body("category_id")
//             .trim()
//             .notEmpty()
//             .withMessage("ID danh mục không được để trống")
//             .isInt()
//             .withMessage("Vui lòng chỉ nhập số")
//             .isLength({ max: 11 })
//             .withMessage("ID danh mục tối đa 11 ký tự"),
//         body("description").optional({ checkFalsy: true }),
//         body("highlights").optional({ checkFalsy: true }),
//         body("duration_days")
//             .trim()
//             .notEmpty()
//             .withMessage("Trường số ngày không được để trống")
//             .isInt()
//             .withMessage("Vui lòng chỉ nhập số")
//             .isLength({ max: 11 })
//             .withMessage("ID danh mục tối đa 11 ký tự"),
//         body("duration_nights")
//             .trim()
//             .notEmpty()
//             .withMessage("Trường số đêm không được để trống")
//             .isInt()
//             .withMessage("Vui lòng chỉ nhập số")
//             .isLength({ max: 11 })
//             .withMessage("ID danh mục tối đa 11 ký tự"),
//         body("departure_location")
//             .optional({ checkFalsy: true })
//             .isLength({ max: 255 })
//             .withMessage("Điểm khởi hành tối đa 255 ký tự"),
//         ,
//         body("destination")
//             .optional({ checkFalsy: true })
//             .isLength({ max: 255 })
//             .withMessage("Điểm đến tối đa 255 ký tự"),
//         ,
//         body("min_group_size")
//             .optional({ checkFalsy: true })
//             .isInt()
//             .withMessage("Vui lòng chỉ nhập số"),
//         ,
//         body("max_group_size")
//             .optional({ checkFalsy: true })
//             .isInt()
//             .withMessage("Vui lòng chỉ nhập số"),
//         ,
//         body("is_customizable")
//             .optional({ checkFalsy: true })
//             .isIn(["0", "1"])
//             .withMessage("Trường này phải là một trong các giá trị: 0,1"),
//         ,
//         body("qr_code")
//             .optional({ checkFalsy: true })
//             .isLength({ max: 255 })
//             .withMessage("Trường này tối đa 255 ký tự"),
//         ,
//         body("booking_url")
//             .optional({ checkFalsy: true })
//             .isLength({ max: 255 })
//             .withMessage("Trường này tối đa 255 ký tự"),
//         ,
//         body("status")
//             .trim()
//             .notEmpty()
//             .withMessage("Trường trạng thái không được để trống")
//             .isIn(["draft", "active", "inactive", "archived"])
//             .withMessage(
//                 "Trường này phải là một trong các giá trị: draft, active, inactive, archived"
//             ),
//         ,
//         body("created_by")
//             .trim()
//             .notEmpty()
//             .withMessage("ID người tạo không được để trống")
//             .isInt()
//             .withMessage("Vui lòng chỉ nhập số")
//             .isLength({ max: 11 })
//             .withMessage("ID người tạo tối đa 11 ký tự"),
//     ],
//     updateTour
// );

// router.delete(
//     "/:id",
//     // authenticate,
//     // authorize("admin"),
//     deleteTourFromController
// );

module.exports = router;
