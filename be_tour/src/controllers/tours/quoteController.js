const { validationResult } = require("express-validator");
const {
    createQuote,
    getQuoteById,
    updateQuoteStatus,
    getAllQuotes,
    calculateQuotePrice,
    getAllQuotesByCustomerId,
} = require("../../models/tours/Quote");

// Lấy tất cả báo giá của customer ID chỉ định
async function getCustomerQuotes(req, res, next) {
    try {
        const { id } = req.params;
        const quotes = await getAllQuotesByCustomerId(id);
        return res.json({
            success: true,
            data: { quotes },
        });
    } catch (error) {
        next(error);
    }
}

async function createQuoteHandler(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: errors.array(),
            });
        }

        const quoteData = {
            ...req.body,
            created_by: req.user.id,
        };

        const quote = await createQuote(quoteData);

        res.status(201).json({
            success: true,
            message: "Tạo báo giá thành công",
            data: { quote },
        });
    } catch (error) {
        next(error);
    }
}

async function getQuoteHandler(req, res, next) {
    try {
        const { id } = req.params;
        const quote = await getQuoteById(id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy báo giá",
            });
        }

        res.json({
            success: true,
            data: { quote },
        });
    } catch (error) {
        next(error);
    }
}

async function listQuotesHandler(req, res, next) {
    try {
        const filters = {
            status: req.query.status,
            customer_id: req.query.customer_id,
            from_date: req.query.from_date,
            to_date: req.query.to_date,
        };

        const quotes = await getAllQuotes(filters);

        res.json({
            success: true,
            data: { quotes },
        });
    } catch (error) {
        next(error);
    }
}

async function updateStatusHandler(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await updateQuoteStatus(id, status, req.user.id);

        if (result) {
            res.json({
                success: true,
                message: "Cập nhật trạng thái thành công",
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy báo giá",
            });
        }
    } catch (error) {
        next(error);
    }
}

//Preview trước khi tạo báo giá
async function calculatePriceHandler(req, res, next) {
    try {
        const priceData = await calculateQuotePrice(req.body);

        res.json({
            success: true,
            data: priceData,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createQuoteHandler,
    getQuoteHandler,
    listQuotesHandler,
    updateStatusHandler,
    calculatePriceHandler,
    getCustomerQuotes,
};
