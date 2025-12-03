const Report = require("../../models/financial/Report");
const ApiResponse = require("../../utils/apiResponse");
const {
  validationResult,
  query: validateQuery,
} = require("express-validator");
class ReportController{
    static async getTourProfitReport(req, res) {
    try {
      const { tour_departure_id } = req.params;

      const report = await Report.getTourProfitReport(tour_departure_id);

      return ApiResponse.success(res, {
        message: 'Lấy báo cáo lãi lỗ tour thành công',
        data: report
      });
    } catch (error) {
      console.error('Get tour profit report error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy báo cáo lãi lỗ tour',
        statusCode: 500,
        errors: error.message
      });
    }
  }

  static async getProfitReportByPeriod(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.error(res, {
          message: 'Dữ liệu không hợp lệ',
          statusCode: 400,
          errors: errors.array()
        });
      }

      const { start_date, end_date } = req.query;

      const report = await Report.getProfitReportByPeriod(start_date, end_date);

      const summary = report.reduce((acc, item) => ({
        total_income: acc.total_income + parseFloat(item.total_income),
        total_expense: acc.total_expense + parseFloat(item.total_expense),
        total_profit: acc.total_profit + parseFloat(item.net_profit),
        total_tours: acc.total_tours + 1
      }), {
        total_income: 0,
        total_expense: 0,
        total_profit: 0,
        total_tours: 0
      });

      return ApiResponse.success(res, {
        message: 'Lấy báo cáo lãi lỗ theo kỳ thành công',
        data: {
          tours: report,
          summary
        }
      });
    } catch (error) {
      console.error('Get profit report by period error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi lấy báo cáo lãi lỗ',
        statusCode: 500,
        errors: error.message
      });
    }
  }
  
  static validateProfitReportByPeriod() {
    return [
      validateQuery('start_date')
        .notEmpty().withMessage('Ngày bắt đầu không được để trống')
        .isDate().withMessage('Ngày bắt đầu không hợp lệ'),
      validateQuery('end_date')
        .notEmpty().withMessage('Ngày kết thúc không được để trống')
        .isDate().withMessage('Ngày kết thúc không hợp lệ')
    ];
  }
}
module.exports = ReportController;