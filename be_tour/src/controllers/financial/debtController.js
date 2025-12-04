const Debt = require("../../models/financial/Debt");
const ApiResponse = require("../../utils/apiResponse");
const {
  validationResult,
  body,
  query: validateQuery,
} = require("express-validator");
class DebtController{
    static async getDebts(req, res) {
    try {
      const {
        debt_type,
        debtor_type,
        debtor_id,
        status,
        due_from_date,
        due_to_date,
        page = 1,
        limit = 10
      } = req.query;

      const result = await Debt.getDebts({
        debtType: debt_type,
        debtorType: debtor_type,
        debtorId: debtor_id,
        status,
        dueFromDate: due_from_date,
        dueToDate: due_to_date,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      return ApiResponse.paginate(res, {
        message: 'Lấy danh sách công nợ thành công',
        data: result.debts,
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.total
      });
    } catch (error) {
      console.error('Get debts error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy danh sách công nợ',
        statusCode: 500,
        errors: error.message
      });
    }
  }

  static async getDebtById(req, res) {
    try {
      const { id } = req.params;

      const debt = await Debt.getDebtById(id);

      if (!debt) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy công nợ',
          statusCode: 404
        });
      }

      return ApiResponse.success(res, {
        message: 'Lấy thông tin công nợ thành công',
        data: debt
      });
    } catch (error) {
      console.error('Get debt error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy thông tin công nợ',
        statusCode: 500,
        errors: error.message
      });
    }
  }

  static async createDebt(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.error(res, {
          message: 'Dữ liệu không hợp lệ',
          statusCode: 400,
          errors: errors.array()
        });
      }

      const {
        debt_type,
        debtor_type,
        debtor_id,
        booking_id,
        invoice_id,
        original_amount,
        currency,
        due_date,
        notes
      } = req.body;

      const debtId = await Debt.createDebt({
        debtType: debt_type,
        debtorType: debtor_type,
        debtorId: debtor_id,
        bookingId: booking_id,
        invoiceId: invoice_id,
        originalAmount: original_amount,
        currency,
        dueDate: due_date,
        notes
      });

      return ApiResponse.success(res, {
        message: 'Tạo công nợ thành công',
        data: { id: debtId },
        statusCode: 201
      });
    } catch (error) {
      console.error('Create debt error:', error);
      return ApiResponse.error(res, {
        message: error.message || 'Lỗi khi tạo công nợ',
        statusCode: 500,
        errors: error.message
      });
    }
  }

  static async payDebt(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.error(res, {
          message: 'Dữ liệu không hợp lệ',
          statusCode: 400,
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { paid_amount } = req.body;

      const success = await Debt.payDebt(id, paid_amount);

      if (!success) {
        return ApiResponse.error(res, {
          message: 'Thanh toán công nợ thất bại',
          statusCode: 400
        });
      }

      return ApiResponse.success(res, {
        message: 'Thanh toán công nợ thành công'
      });
    } catch (error) {
      console.error('Pay debt error:', error);
      return ApiResponse.error(res, {
        message: error.message || 'Lỗi khi thanh toán công nợ',
        statusCode: 500,
        errors: error.message
      });
    }
  }

  static async updateOverdueDebts(req, res) {
    try {
      const count = await Debt.updateOverdueDebts();

      return ApiResponse.success(res, {
        message: `Đã cập nhật ${count} công nợ quá hạn`,
        data: { updated_count: count }
      });
    } catch (error) {
      console.error('Update overdue debts error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi cập nhật công nợ quá hạn',
        statusCode: 500,
        errors: error.message
      });
    }
  }

  static async getDebtsSummary(req, res) {
    try {
      const { debtor_type } = req.query;

      const summary = await Debt.getDebtsSummary(debtor_type);

      return ApiResponse.success(res, {
        message: 'Lấy tổng hợp công nợ thành công',
        data: summary
      });
    } catch (error) {
      console.error('Get debts summary error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy tổng hợp công nợ',
        statusCode: 500,
        errors: error.message
      });
    }
  }

  static async getUpcomingDebts(req, res) {
    try {
      const { days = 7 } = req.query;

      const debts = await Debt.getUpcomingDebts(parseInt(days));

      return ApiResponse.success(res, {
        message: 'Lấy danh sách công nợ sắp đến hạn thành công',
        data: debts
      });
    } catch (error) {
      console.error('Get upcoming debts error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy danh sách công nợ sắp đến hạn',
        statusCode: 500,
        errors: error.message
      });
    }
  }

  static validateCreateDebt() {
    return [
      body('debt_type')
        .notEmpty().withMessage('Loại công nợ không được để trống')
        .isIn(['receivable', 'payable']).withMessage('Loại công nợ không hợp lệ'),
      body('debtor_type')
        .notEmpty().withMessage('Loại đối tượng nợ không được để trống')
        .isIn(['customer', 'supplier']).withMessage('Loại đối tượng nợ không hợp lệ'),
      body('debtor_id')
        .notEmpty().withMessage('ID đối tượng nợ không được để trống')
        .isInt({ min: 1 }).withMessage('ID đối tượng nợ không hợp lệ'),
      body('original_amount')
        .notEmpty().withMessage('Số tiền không được để trống')
        .isFloat({ min: 0.01 }).withMessage('Số tiền phải lớn hơn 0')
    ];
  }

  static validatePayDebt() {
    return [
      body('paid_amount')
        .notEmpty().withMessage('Số tiền thanh toán không được để trống')
        .isFloat({ min: 0.01 }).withMessage('Số tiền thanh toán phải lớn hơn 0')
    ];
  }
}
module.exports = DebtController;