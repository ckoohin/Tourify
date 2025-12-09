const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthMiddleware = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/authorize');
const TourLogController = require('../../controllers/tours/tourLogController');

const tourLogValidators = {
  create: [
    body('tour_departure_id').isInt().withMessage('Tour departure ID không hợp lệ'),
    body('log_date').isDate().withMessage('Ngày ghi nhận không hợp lệ'),
    body('log_type').isIn(['activity', 'incident', 'feedback', 'note', 'photo']).withMessage('Loại nhật ký không hợp lệ'),
    body('content').notEmpty().withMessage('Nội dung là bắt buộc')
  ],
  update: [
    body('log_date').isDate().withMessage('Ngày ghi nhận không hợp lệ'),
    body('log_type').isIn(['activity', 'incident', 'feedback', 'note', 'photo']).withMessage('Loại nhật ký không hợp lệ'),
    body('content').notEmpty().withMessage('Nội dung là bắt buộc')
  ]
};

router.post('/',
  AuthMiddleware.authenticate,
  authorize('tours.edit', 'guide.view'),
  tourLogValidators.create,
  TourLogController.create
);

router.get('/departure/:departureId/stats',
  AuthMiddleware.authenticate,
  authorize('tours.view', 'guide.view'),
  TourLogController.getStats
);

router.get('/departure/:departureId',
  AuthMiddleware.authenticate,
  authorize('tours.view', 'guide.view'),
  TourLogController.getByDepartureId
);

router.get('/:id',
  AuthMiddleware.authenticate,
  authorize('tours.view', 'guide.view'),
  TourLogController.getById
);

router.put('/:id',
  AuthMiddleware.authenticate,
  authorize('tours.edit', 'guide.view'),
  tourLogValidators.update,
  TourLogController.update
);

router.delete('/:id',
  AuthMiddleware.authenticate,
  authorize('tours.delete', 'guide.view'),
  TourLogController.delete
);

module.exports = router;