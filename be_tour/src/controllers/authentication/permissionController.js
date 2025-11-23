const PermissionModel = require('../../models/authentication/Permission');
const ApiResponse = require('../../utils/apiResponse');
const { slugify } = require('../../utils/slug');

class PermissionController {
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const { permissions, total } = await PermissionModel.findAll(page, limit, search);

      return ApiResponse.paginate(res, {
        message: 'Lấy danh sách quyền thành công',
        data: permissions,
        page,
        limit,
        total
      });
    } catch (error) {
      console.error('Get all permissions error:', error);
      return ApiResponse.error(res, { message: 'Lỗi khi lấy danh sách quyền' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      const permission = await PermissionModel.findById(id);
      if (!permission) {
        return ApiResponse.error(res, {
          message:'Không tìm thấy quyền',
          statusCode: 404
        });
      }

      return ApiResponse.success(res, {message: 'Lấy thông tin quyền thành công', data: permission});
    } catch (error) {
      console.error('Get permission by id error:', error);
      return ApiResponse.error(res, {message: 'Lỗi khi lấy thông tin quyền'});
    }
  }

  async create(req, res) {
    try {
      const { name, description } = req.body;

      const existingPermission = await PermissionModel.findByName(name);
      if (existingPermission) {
        return ApiResponse.error(res, {message: 'Tên quyền đã tồn tại', statusCode: 409});
      }

      const slug = slugify(name);

      const existingSlug = await PermissionModel.findBySlug(slug);
      if (existingSlug) {
        return ApiResponse.error(res, {message: 'Slug đã tồn tại, vui lòng đổi tên khác', statusCode: 409});
      }

      const permissionId = await PermissionModel.create({ name, slug, description });
      const newPermission = await PermissionModel.findById(permissionId);

      return ApiResponse.success(res, {message: 'Tạo quyền thành công', data: newPermission, statusCode: 201});
    } catch (error) {
      console.error('Create permission error:', error);
      return ApiResponse.error(res, {message: 'Lỗi khi tạo quyền'});
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const permission = await PermissionModel.findById(id);
      if (!permission) {
        return ApiResponse.error(res, {message: 'Không tìm thấy quyền', statusCode: 404});
      }

      const updateData = { description };

      if (name && name !== permission.name) {
        const existingPermission = await PermissionModel.findByName(name);
        if (existingPermission) {
          return ApiResponse.error(res, {message: 'Tên quyền đã tồn tại', statusCode: 409});
        }

        const slug = slugify(name);
        const existingSlug = await PermissionModel.findBySlug(slug);
        if (existingSlug) {
          return ApiResponse.error(res, {message: 'Slug đã tồn tại, vui lòng đổi tên khác', statusCode: 409});
        }

        updateData.name = name;
        updateData.slug = slug;
      }

      await PermissionModel.update(id, updateData);
      const updatedPermission = await PermissionModel.findById(id);

      return ApiResponse.success(res, {message: 'Cập nhật quyền thành công', data: updatedPermission});
    } catch (error) {
      console.error('Update permission error:', error);
      return ApiResponse.error(res, {message: 'Lỗi khi cập nhật quyền'});
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const permission = await PermissionModel.findById(id);
      if (!permission) {
        return ApiResponse.error(res, {message: 'Không tìm thấy quyền', statusCode: 404});
      }

      const isAssigned = await PermissionModel.isAssignedToRoles(id);
      if (isAssigned) {
        return ApiResponse.error(res, {message: 'Không thể xóa quyền đang được gán cho vai trò', statusCode: 409});
      }

      await PermissionModel.delete(id);

      return ApiResponse.success(res, {message:'Xóa quyền thành công'});
    } catch (error) {
      console.error('Delete permission error:', error);
      return ApiResponse.error(res, {message:'Lỗi khi xóa quyền'});
    }
  }
}

module.exports = new PermissionController();