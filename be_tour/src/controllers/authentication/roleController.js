const RoleModel = require('../../models/authentication/Role');
const PermissionRoleModel = require('../../models/authentication/PermissionRole');
const ApiResponse = require('../../utils/apiResponse');
const { slugify } = require('../../utils/slug');

class RoleController {
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await RoleModel.findAll(page, limit, search);

      const roles = result.roles || [];
      const total = result.total || 0;

      return ApiResponse.paginate(res, {
        message: 'Lấy danh sách vai trò thành công',
        data: roles,
        page,
        limit,
        total
      });
    } catch (error) {
      console.error('Get all roles error:', error);
      return ApiResponse.error(res, {message: 'Lỗi khi lấy danh sách vai trò'});
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      const role = await RoleModel.findById(id);
      if (!role) {
        return ApiResponse.error(res, {message: 'Không tìm thấy vai trò', statusCode:404});
      }

      return ApiResponse.success(res, {
        message: 'Lấy thông tin vai trò thành công',
        data: role
      });
    } catch (error) {
      console.error('Get role by id error:', error);
      return ApiResponse.error(res, {message: 'Lỗi khi lấy thông tin vai trò'});
    }
  }

  async create(req, res) {
    try {
      console.log('Request body:', req.body);
      console.log('Current user permissions:', req.userPermissions);

      const { name, description } = req.body;

      const existingRole = await RoleModel.findByName(name);
      if (existingRole) {
        return ApiResponse.error(res, { message: 'Tên vai trò đã tồn tại', statusCode: 409 });
      }

      const slug = slugify(name);

      const existingSlug = await RoleModel.findBySlug(slug);
      if (existingSlug) {
        return ApiResponse.error(res, { message: 'Slug đã tồn tại, vui lòng đổi tên khác', statusCode: 409 });
      }

      let roleId; 

      try {
        roleId = await RoleModel.create({ name, slug, description });
      } catch (error) {
        console.error('SQL Error creating role:', error.message);
        return ApiResponse.error(res, {
          message: 'Lỗi khi tạo vai trò',
          errors: error.message
        });
      }

      console.log("DEBUG roleId:", roleId);

      const newRole = await RoleModel.findById(roleId);

      return ApiResponse.success(res, {
        message: 'Tạo vai trò thành công',
        data: newRole,
        statusCode: 201
      });

    } catch (error) {
      console.error('Create role error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi tạo vai trò',
        errors: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const role = await RoleModel.findById(id);
      if (!role) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy vai trò',
          statusCode: 404
        });
      }

      const updateData = { description };

      if (name && name !== role.name) {
        const existingRole = await RoleModel.findByName(name);
        if (existingRole) {
          return ApiResponse.error(res, {
            message: 'Tên vai trò đã tồn tại',
            statusCode: 409
          });
        }

        const slug = slugify(name);
        const existingSlug = await RoleModel.findBySlug(slug);
        if (existingSlug) {
          return ApiResponse.error(res, {
            message: 'Slug đã tồn tại, vui lòng đổi tên khác',
            statusCode: 409
          });
        }

        updateData.name = name;
        updateData.slug = slug;
      }

      await RoleModel.update(id, updateData);
      const updatedRole = await RoleModel.findById(id);

      return ApiResponse.success(res, {
        message: 'Cập nhật vai trò thành công',
        data: updatedRole,
        statusCode: 201
      });
    } catch (error) {
      console.error('Update role error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi cập nhật vai trò',
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const role = await RoleModel.findById(id);
      if (!role) {
        return ApiResponse.error(res, {
          message: 'Không tìm thấy vai trò',
          statusCode: 404
        });
      }

      const hasPermissions = await RoleModel.hasPermissions(id);
      if (hasPermissions) {
        return ApiResponse.error(res, {
          message: 'Không thể xóa vai trò đang có quyền được gán',
          statusCode: 409
        });
      }

      await RoleModel.delete(id);

      return ApiResponse.success(res, {
        message: 'Xóa vai trò thành công',
        statusCode: 201
      });
      
    } catch (error) {
      console.error('Delete role error:', error);
      return ApiResponse.error(res, {
        message: 'Lỗi khi xóa vai trò'
      });
    }
  }
}

module.exports = new RoleController();