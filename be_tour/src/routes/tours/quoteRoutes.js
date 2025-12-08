const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { authenticate } = require("../../middleware/authMiddleware");
const { authorize } = require("../../middleware/authorize");

const {
    createQuoteHandler,
    getQuoteHandler,
    listQuotesHandler,
    updateStatusHandler,
    calculatePriceHandler,
    getCustomerQuotes,
} = require("../../controllers/tours/quoteController");

router.get("/", authenticate, authorize("quotes.manage"), listQuotesHandler);

router.get(
    "/customer-id/:id",
    authenticate,
    authorize("quotes.manage"),
    getCustomerQuotes
);

router.get("/:id", authenticate, authorize("quotes.manage"), getQuoteHandler);

router.post(
    "/calculate",
    authenticate,
    authorize("quotes.manage"),
    [
        body("tour_version_id")
            .notEmpty()
            .withMessage("Tour version ID không được để trống")
            .isInt()
            .withMessage("Tour version ID phải là số"),
        body("departure_date")
            .notEmpty()
            .withMessage("Ngày khởi hành không được để trống")
            .isDate()
            .withMessage("Ngày khởi hành không hợp lệ"),
    ],
    calculatePriceHandler
);

router.post(
    "/",
    authenticate,
    authorize("quotes.manage"),
    [
        body("customer_id")
            .notEmpty()
            .withMessage("Customer ID không được để trống")
            .isInt()
            .withMessage("Customer ID phải là số"),
        body("tour_version_id")
            .notEmpty()
            .withMessage("Tour version ID không được để trống")
            .isInt()
            .withMessage("Tour version ID phải là số"),
        body("departure_date")
            .notEmpty()
            .withMessage("Ngày khởi hành không được để trống")
            .isDate()
            .withMessage("Ngày khởi hành không hợp lệ"),
        body("adult_count")
            .optional({ checkFalsy: true })
            .isInt({ min: 0 })
            .withMessage("Số người lớn phải là số nguyên không âm"),
        body("child_count")
            .optional({ checkFalsy: true })
            .isInt({ min: 0 })
            .withMessage("Số trẻ em phải là số nguyên không âm"),
        body("infant_count")
            .optional({ checkFalsy: true })
            .isInt({ min: 0 })
            .withMessage("Số em bé phải là số nguyên không âm"),
        body("senior_count")
            .optional({ checkFalsy: true })
            .isInt({ min: 0 })
            .withMessage("Số người cao tuổi phải là số nguyên không âm"),
        body("discount_amount")
            .optional({ checkFalsy: true })
            .isFloat({ min: 0 })
            .withMessage("Số tiền giảm giá phải là số dương"),
    ],
    createQuoteHandler
);

router.put(
    "/:id/status",
    authenticate,
    authorize("quotes.manage"),
    [
        body("status")
            .notEmpty()
            .withMessage("Trạng thái không được để trống")
            .isIn(["draft", "sent", "accepted", "rejected", "expired"])
            .withMessage("Trạng thái không hợp lệ"),
    ],
    updateStatusHandler
);

module.exports = router;
