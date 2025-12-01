const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthMiddleware = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/authorize');
const ServiceBookingController = require('../../controllers/bookings/serviceBookingController');

const serviceBookingValidators = {
  create: [
    body('tour_departure_id').isInt().withMessage('Tour departure ID không hợp lệ'),
    body('supplier_id').isInt().withMessage('Supplier ID không hợp lệ'),
    body('service_date').isDate().withMessage('Ngày dịch vụ không hợp lệ'),
    body('quantity').isInt({ min: 1 }).withMessage('Số lượng không hợp lệ'),
    body('unit_price').isFloat({ min: 0 }).withMessage('Đơn giá không hợp lệ')
  ],
  update: [
    body('service_date').isDate().withMessage('Ngày dịch vụ không hợp lệ'),
    body('quantity').isInt({ min: 1 }).withMessage('Số lượng không hợp lệ'),
    body('unit_price').isFloat({ min: 0 }).withMessage('Đơn giá không hợp lệ')
  ]
};

router.post('/',
  AuthMiddleware.authenticate,
  authorize('tours.edit'),
  serviceBookingValidators.create,
  ServiceBookingController.create
);

router.get('/:id',
  AuthMiddleware.authenticate,
  authorize('tours.view'),
  ServiceBookingController.getById
);

router.put('/:id',
  AuthMiddleware.authenticate,
  authorize('tours.edit'),
  serviceBookingValidators.update,
  ServiceBookingController.update
);

router.patch('/:id/status',
  AuthMiddleware.authenticate,
  authorize('tours.edit'),
  ServiceBookingController.updateStatus
);

router.delete('/:id',
  AuthMiddleware.authenticate,
  authorize('tours.delete'),
  ServiceBookingController.delete
);

module.exports = router;