const express = require('express');
const router = express.Router();
const TransactionController = require('../../controllers/financial/transactionController');
const AuthMiddleware = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/authorize');

router.get(
  '/',
  AuthMiddleware.authenticate,
  authorize('reports.view'),
  TransactionController.getTransactions
);

router.get(
  '/:id',
  AuthMiddleware.authenticate,
  authorize('reports.view'),
  TransactionController.getTransactionById
);

router.post(
  '/',
  AuthMiddleware.authenticate,
  authorize('bookings.create'),
  TransactionController.validateCreateTransaction(),
  TransactionController.createTransaction
);

router.put(
  '/:id',
  AuthMiddleware.authenticate,
  authorize('bookings.edit'),
  TransactionController.validateUpdateTransaction(),
  TransactionController.updateTransaction
);

router.patch(
  '/:id/approve',
  AuthMiddleware.authenticate,
  authorize('users.manage'),
  TransactionController.approveTransaction
);

router.delete(
  '/:id',
  AuthMiddleware.authenticate,
  authorize('bookings.delete'),
  TransactionController.deleteTransaction
);

module.exports = router;