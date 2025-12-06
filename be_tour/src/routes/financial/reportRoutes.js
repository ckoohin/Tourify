const express = require('express');
const router = express.Router();
const ReportController = require('../../controllers/financial/reportController');
const AuthMiddleware = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/authorize');
router.get(
  '/tour-profit/:tour_departure_id',
  AuthMiddleware.authenticate,
  authorize('reports.view'),
  ReportController.getTourProfitReport
);

router.get(
  '/profit-by-period',
  AuthMiddleware.authenticate,
  authorize('reports.view'),
  ReportController.validateProfitReportByPeriod(),
  ReportController.getProfitReportByPeriod
);
module.exports = router;