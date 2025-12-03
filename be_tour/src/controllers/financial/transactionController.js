const Transaction = require("../../models/financial/Transaction");
const ApiResponse = require("../../utils/apiResponse");
const {
  validationResult,
  body,
  query: validateQuery,
} = require("express-validator");

class TransactionController {
  static async getTransactions(req, res) {
    try {
      const {
        tour_departure_id,
        type,
        category,
        start_date,
        end_date,
        page = 1,
        limit = 10,
      } = req.query;

      const result = await Transaction.getTourTransactions({
        tourDepartureId: tour_departure_id,
        type,
        category,
        startDate: start_date,
        endDate: end_date,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return ApiResponse.paginate(res, {
        message: "Lấy danh sách giao dịch thành công",
        data: result.transactions,
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.total,
      });
    } catch (error) {
      console.error("Get transactions error:", error);
      return ApiResponse.error(res, {
        message: "Lỗi khi lấy danh sách giao dịch",
        statusCode: 500,
        errors: error.message,
      });
    }
  }

  static async getTransactionById(req, res) {
    try {
      const { id } = req.params;

      const transaction = await Transaction.getTransactionById(id);

      if (!transaction) {
        return ApiResponse.error(res, {
          message: "Không tìm thấy giao dịch",
          statusCode: 404,
        });
      }

      return ApiResponse.success(res, {
        message: "Lấy thông tin giao dịch thành công",
        data: transaction,
      });
    } catch (error) {
      console.error("Get transaction error:", error);
      return ApiResponse.error(res, {
        message: "Lỗi khi lấy thông tin giao dịch",
        statusCode: 500,
        errors: error.message,
      });
    }
  }

  static async createTransaction(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.error(res, {
          message: "Dữ liệu không hợp lệ",
          statusCode: 400,
          errors: errors.array(),
        });
      }

      const {
        type,
        category,
        booking_id,
        tour_departure_id,
        supplier_id,
        amount,
        currency,
        transaction_date,
        payment_method,
        description,
        reference_number,
        receipt_url,
      } = req.body;

      const result = await Transaction.createTransaction({
        type,
        category,
        bookingId: booking_id,
        tourDepartureId: tour_departure_id,
        supplierId: supplier_id,
        amount,
        currency,
        transactionDate: transaction_date,
        paymentMethod: payment_method,
        description,
        referenceNumber: reference_number,
        receiptUrl: receipt_url,
        createdBy: req.user.id,
      });

      return ApiResponse.success(res, {
        message: "Tạo giao dịch thành công",
        data: result,
        statusCode: 201,
      });
    } catch (error) {
      console.error("Create transaction error:", error);
      return ApiResponse.error(res, {
        message: error.message || "Lỗi khi tạo giao dịch",
        statusCode: 500,
        errors: error.message,
      });
    }
  }

  static async updateTransaction(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.error(res, {
          message: "Dữ liệu không hợp lệ",
          statusCode: 400,
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const {
        category,
        amount,
        transaction_date,
        payment_method,
        description,
        reference_number,
        receipt_url,
      } = req.body;

      const success = await Transaction.updateTransaction(id, {
        category,
        amount,
        transactionDate: transaction_date,
        paymentMethod: payment_method,
        description,
        referenceNumber: reference_number,
        receiptUrl: receipt_url,
      });

      if (!success) {
        return ApiResponse.error(res, {
          message: "Không tìm thấy giao dịch hoặc cập nhật thất bại",
          statusCode: 404,
        });
      }

      return ApiResponse.success(res, {
        message: "Cập nhật giao dịch thành công",
      });
    } catch (error) {
      console.error("Update transaction error:", error);
      return ApiResponse.error(res, {
        message: error.message || "Lỗi khi cập nhật giao dịch",
        statusCode: 500,
        errors: error.message,
      });
    }
  }

  static async approveTransaction(req, res) {
    try {
      const { id } = req.params;

      const success = await Transaction.approveTransaction(id, req.user.id);

      if (!success) {
        return ApiResponse.error(res, {
          message: "Không tìm thấy giao dịch",
          statusCode: 404,
        });
      }

      return ApiResponse.success(res, {
        message: "Phê duyệt giao dịch thành công",
      });
    } catch (error) {
      console.error("Approve transaction error:", error);
      return ApiResponse.error(res, {
        message: "Lỗi khi phê duyệt giao dịch",
        statusCode: 500,
        errors: error.message,
      });
    }
  }

  static async deleteTransaction(req, res) {
    try {
      const { id } = req.params;

      const success = await Transaction.deleteTransaction(id);

      if (!success) {
        return ApiResponse.error(res, {
          message: "Không tìm thấy giao dịch",
          statusCode: 404,
        });
      }

      return ApiResponse.success(res, {
        message: "Xóa giao dịch thành công",
      });
    } catch (error) {
      console.error("Delete transaction error:", error);
      return ApiResponse.error(res, {
        message: "Lỗi khi xóa giao dịch",
        statusCode: 500,
        errors: error.message,
      });
    }
  }

  static async getTourTransactionSummary(req, res) {
    try {
      const { tour_departure_id } = req.params;

      const summary =
        await Transaction.getTourTransactionSummary(tour_departure_id);

      return ApiResponse.success(res, {
        message: "Lấy tổng hợp tài chính thành công",
        data: summary,
      });
    } catch (error) {
      console.error("Get Transaction summary error:", error);
      return ApiResponse.error(res, {
        message: "Lỗi khi lấy tổng hợp tài chính",
        statusCode: 500,
        errors: error.message,
      });
    }
  }

  static validateCreateTransaction() {
    return [
      body('type')
        .notEmpty().withMessage('Loại giao dịch không được để trống')
        .isIn(['income', 'expense']).withMessage('Loại giao dịch không hợp lệ'),
      body('category')
        .notEmpty().withMessage('Danh mục không được để trống')
        .isLength({ max: 100 }).withMessage('Danh mục không được quá 100 ký tự'),
      body('amount')
        .notEmpty().withMessage('Số tiền không được để trống')
        .isFloat({ min: 0.01 }).withMessage('Số tiền phải lớn hơn 0'),
      body('transaction_date')
        .notEmpty().withMessage('Ngày giao dịch không được để trống')
        .isDate().withMessage('Ngày giao dịch không hợp lệ'),
      body('payment_method')
        .notEmpty().withMessage('Phương thức thanh toán không được để trống')
        .isIn(['cash', 'bank_transfer', 'credit_card', 'e_wallet', 'other'])
        .withMessage('Phương thức thanh toán không hợp lệ')
    ];
  }

  static validateUpdateTransaction() {
    return [
      body('amount')
        .optional()
        .isFloat({ min: 0.01 }).withMessage('Số tiền phải lớn hơn 0'),
      body('transaction_date')
        .optional()
        .isDate().withMessage('Ngày giao dịch không hợp lệ')
    ];
  }
}
module.exports = TransactionController;
