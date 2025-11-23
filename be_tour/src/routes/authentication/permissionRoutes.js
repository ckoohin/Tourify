const express = require('express');
const router = express.Router();
const permissionController = require('../../controllers/authentication/permissionController');
const permissionValidator = require('../../validators/permissionValidator');
const validate = require('../../middleware/validateMiddleware');
const { authenticate } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/authorize');

router.get(
  '/',
  authenticate,
  authorize('permissions.view'),
  permissionValidator.getAll,
  validate,
  permissionController.getAll
);

router.get(
  '/:id',
  authenticate,
  authorize('permissions.view'),
  permissionValidator.getById,
  validate,
  permissionController.getById
);

router.post(
  '/',
  authenticate,
  authorize('permissions.create'),
  permissionValidator.create,
  validate,
  permissionController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('permissions.edit'),
  permissionValidator.update,
  validate,
  permissionController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('permissions.delete'),
  permissionValidator.delete,
  validate,
  permissionController.delete
);

module.exports = router;