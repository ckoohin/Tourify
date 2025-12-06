const express = require('express');
const router = express.Router();
const DebtController = require('../../controllers/financial/debtController');
const AuthMiddleware = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/authorize');

router.get(
  '/',
  AuthMiddleware.authenticate,
  authorize('reports.view'),
  DebtController.getDebts
);

router.get(
  '/summary',
  AuthMiddleware.authenticate,
  authorize('reports.view'),
  DebtController.getDebtsSummary
);

router.get(
  '/upcoming',
  AuthMiddleware.authenticate,
  authorize('reports.view'),
  DebtController.getUpcomingDebts
);
module.exports = router;

router.get(
  '/:id',
  AuthMiddleware.authenticate,
  authorize('reports.view'),
  DebtController.getDebtById
);

router.post(
  '/',
  AuthMiddleware.authenticate,
  authorize('bookings.create'),
  DebtController.validateCreateDebt(),
  DebtController.createDebt
);

router.patch(
  '/:id/pay',
  AuthMiddleware.authenticate,
  authorize('bookings.edit'),
  DebtController.validatePayDebt(),
  DebtController.payDebt
);

router.patch(
  '/update-overdue',
  AuthMiddleware.authenticate,
  authorize('users.manage'),
  DebtController.updateOverdueDebts
);