exports.notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route không tìm thấy - ${req.originalUrl}`,
    });
};

/**
 * Middleware xử lý lỗi chung
 */
exports.errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV === "development") {
        console.error("Error:", err);
    }

    const response = {
        success: false,
        message: err.message || "Đã xảy ra lỗi server",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    };

    if (err.code === "ER_DUP_ENTRY") {
        response.message = "Dữ liệu đã tồn tại trong hệ thống";
        return res.status(400).json(response);
    }

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
        response.message = "Dữ liệu tham chiếu không hợp lệ";
        return res.status(400).json(response);
    }

    if (err.code === "ECONNREFUSED") {
        response.message = "Không thể kết nối database";
        return res.status(500).json(response);
    }

    if (err.name === "ValidationError") {
        response.message = "Dữ liệu không hợp lệ";
        response.errors = err.errors;
        return res.status(400).json(response);
    }

    if (err.name === "JsonWebTokenError") {
        response.message = "Token không hợp lệ";
        return res.status(401).json(response);
    }

    if (err.name === "TokenExpiredError") {
        response.message = "Token đã hết hạn";
        return res.status(401).json(response);
    }

    // Lỗi truy vấn sql
    if (err.code === "ER_PARSE_ERROR") {
        response.message = "Lỗi câu truy vấn";
        return res.json(response);
    }

    // Trả về lỗi chung
    res.status(statusCode).json(response);
};

/**
 * Wrapper cho async function để catch error
 * Sử dụng: asyncHandler(async (req, res, next) => { ... })
 */
exports.asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
