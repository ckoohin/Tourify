const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/authentication/roleController');
const roleValidator = require('../../validators/roleValidator');
const validate = require('../../middleware/validateMiddleware');
const { authenticate } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/authorize');

router.get(
  '/',
  authenticate,
  authorize('roles.view'),
  roleValidator.getAll,
  validate,
  roleController.getAll
);

router.get(
  '/:id',
  authenticate,
  authorize('roles.view'),
  roleValidator.getById,
  validate,
  roleController.getById
);

router.post(
  '/',
  authenticate,
  authorize('roles.create'),
  roleValidator.create,
  validate,
  roleController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('roles.edit'),
  roleValidator.update,
  validate,
  roleController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('roles.delete'),
  roleValidator.delete,
  validate,
  roleController.delete
);

module.exports = router;