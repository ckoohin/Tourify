const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthMiddleware = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/authorize');
const TourExpenseController = require('../../controllers/tours/tourExpenseController');

const tourExpenseValidators = {
  create: [
    body('tour_departure_id').isInt().withMessage('Tour departure ID không hợp lệ'),
    body('expense_category').notEmpty().withMessage('Danh mục chi phí là bắt buộc'),
    body('expense_date').isDate().withMessage('Ngày chi không hợp lệ'),
    body('amount').isFloat({ min: 0 }).withMessage('Số tiền không hợp lệ'),
    body('payment_method').isIn(['cash', 'bank_transfer', 'credit_card', 'company_card']).withMessage('Phương thức thanh toán không hợp lệ')
  ],
  update: [
    body('expense_category').notEmpty().withMessage('Danh mục chi phí là bắt buộc'),
    body('expense_date').isDate().withMessage('Ngày chi không hợp lệ'),
    body('amount').isFloat({ min: 0 }).withMessage('Số tiền không hợp lệ'),
    body('payment_method').isIn(['cash', 'bank_transfer', 'credit_card', 'company_card']).withMessage('Phương thức thanh toán không hợp lệ')
  ]
};

router.post('/',
  AuthMiddleware.authenticate,
  authorize('tours.edit'),
  tourExpenseValidators.create,
  TourExpenseController.create
);

router.get('/:id',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  TourExpenseController.getById
);

router.put('/:id',
  AuthMiddleware.authenticate,
  authorize('tours.edit'),
  tourExpenseValidators.update,
  TourExpenseController.update
);

router.patch('/:id/approve',
  AuthMiddleware.authenticate,
  authorize('tours.edit'),
  TourExpenseController.approve
);

router.delete('/:id',
  AuthMiddleware.authenticate,
  authorize('tours.delete'),
  TourExpenseController.delete
);

module.exports = router;