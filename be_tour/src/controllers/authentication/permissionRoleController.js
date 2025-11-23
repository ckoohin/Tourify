const PermissionRoleModel = require('../../models/authentication/PermissionRole');
const RoleModel = require('../../models/authentication/Role');
const PermissionModel = require('../../models/authentication/Permission');
const ApiResponse = require('../../utils/apiResponse');

class PermissionRoleController {
  async assignPermissions(req, res) {
    try {
      const { roleId } = req.params;
      const { permissionIds } = req.body;

      const role = await RoleModel.findById(roleId);
      if (!role) {
        return ApiResponse.error(res, {message: 'Không tìm thấy vai trò', statusCode: 404});
      }

      const permissions = await PermissionModel.findByIds(permissionIds);
      if (permissions.length !== permissionIds.length) {
        const foundIds = permissions.map(p => p.id);
        const notFoundIds = permissionIds.filter(id => !foundIds.includes(id));
        return ApiResponse.error(res, {
          message: 'Một số quyền không tồn tại', 
          statusCode: 404, 
          notFoundIds
        });
      }

      const existingPermissions = await PermissionRoleModel.checkPermissionsExist(
        roleId, 
        permissionIds
      );

      const newPermissionIds = permissionIds.filter(
        id => !existingPermissions.includes(id)
      );

      if (newPermissionIds.length === 0) {
        return ApiResponse.error(res, {message: 'Tất cả quyền đã được gán cho vai trò này', statusCode: 409});
      }

      await PermissionRoleModel.assignPermissions(roleId, newPermissionIds);

      const updatedPermissions = await PermissionRoleModel.getRolePermissions(roleId);

      return ApiResponse.success(res, {
        message: 'Gán quyền cho vai trò thành công',
        statusCode: 200,
        data: {
          role,
          assignedCount: newPermissionIds.length,
          totalPermissions: updatedPermissions.length,
          permissions: updatedPermissions
        }
      });
    } catch (error) {
      console.error('Assign permissions error:', error);
      return ApiResponse.error(res, {message: 'Lỗi khi gán quyền cho vai trò'});
    }
  }

  async revokePermissions(req, res) {
    try {
      const { roleId } = req.params;
      const { permissionIds } = req.body;

      const role = await RoleModel.findById(roleId);
      if (!role) {
        return ApiResponse.error(res, {message: 'Không tìm thấy vai trò', statusCode: 404});
      }

      const existingPermissions = await PermissionRoleModel.checkPermissionsExist(
        roleId, 
        permissionIds
      );

      if (existingPermissions.length === 0) {
        return ApiResponse.error(res, {message: 'Không có quyền nào được gán cho vai trò này', statusCode: 404});
      }

      const revokedCount = await PermissionRoleModel.revokePermissions(
        roleId, 
        existingPermissions
      );

      const remainingPermissions = await PermissionRoleModel.getRolePermissions(roleId);

      return ApiResponse.success(res, {
        message: 'Thu hồi quyền khỏi vai trò thành công',
        data: {
          role,
          revokedCount,
          totalPermissions: remainingPermissions.length,
          permissions: remainingPermissions
        }
      });
    } catch (error) {
      console.error('Revoke permissions error:', error);
      return ApiResponse.error(res, {message: 'Lỗi khi thu hồi quyền khỏi vai trò'});
    }
  }

  async getRolePermissions(req, res) {
    try {
      const { roleId } = req.params;

      const role = await RoleModel.findById(roleId);
      if (!role) {
        return ApiResponse.error(res, {message: 'Không tìm thấy vai trò', statusCode: 404});
      }

      const permissions = await PermissionRoleModel.getRolePermissions(roleId);

      return ApiResponse.success(res, {
        message: 'Lấy danh sách quyền của vai trò thành công',
        data: {
          role,
          totalPermissions: permissions.length,
          permissions
        }
      });
    } catch (error) {
      console.error('Get role permissions error:', error);
      return ApiResponse.error(res, {message: 'Lỗi khi lấy danh sách quyền của vai trò'});
    }
  }
}

module.exports = new PermissionRoleController();