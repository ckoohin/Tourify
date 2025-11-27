const express = require('express');
const router = express.Router();
const permissionRoleController = require('../../controllers/authentication/permissionRoleController');
const permissionRoleValidator = require('../../validators/permissionRoleValidator');
const validate = require('../../middleware/validateMiddleware');
const { authenticate } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/authorize');

router.post(
  '/roles/:roleId/permissions',
  authenticate,
  authorize('roles.assign-permissions'),
  permissionRoleValidator.assign,
  validate,
  permissionRoleController.assignPermissions
);

router.delete(
  '/roles/:roleId/permissions',
  authenticate,
  authorize('roles.revoke-permissions'),
  permissionRoleValidator.revoke,
  validate,
  permissionRoleController.revokePermissions
);

router.get(
  '/roles/:roleId/permissions',
  authenticate,
  (req, res, next) => {
    const currentUserRoleId = req.user.role_id; 
    const requestedRoleId = parseInt(req.params.roleId);

    if (currentUserRoleId === requestedRoleId) {
      return next();
    }

    return authorize('roles.view')(req, res, next);
  },
  permissionRoleValidator.getPermissions,
  validate,
  permissionRoleController.getRolePermissions
);

module.exports = router;