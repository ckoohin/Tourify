const Staff = require('../../models/staff/Staff');
const { validationResult } = require('express-validator');

exports.getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { staff_type, status, search } = req.query;

    const filters = {};
    if (staff_type) filters.staff_type = staff_type;
    if (status) filters.status = status;
    if (search) filters.search = search;

    const result = await Staff.findAll(page, limit, filters);

    // Parse JSON fields
    result.data = result.data.map(staff => ({
      ...staff,
      languages: staff.languages ? JSON.parse(staff.languages) : [],
      certifications: staff.certifications ? JSON.parse(staff.certifications) : [],
      specializations: staff.specializations ? JSON.parse(staff.specializations) : [],
      vehicle_types: staff.vehicle_types ? JSON.parse(staff.vehicle_types) : []
    }));

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const staff = await Staff.findById(id);
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên'
      });
    }

    staff.languages = staff.languages ? JSON.parse(staff.languages) : [];
    staff.certifications = staff.certifications ? JSON.parse(staff.certifications) : [];
    staff.specializations = staff.specializations ? JSON.parse(staff.specializations) : [];
    staff.vehicle_types = staff.vehicle_types ? JSON.parse(staff.vehicle_types) : [];

    const stats = await Staff.getStats(id);

    res.json({
      success: true,
      data: { 
        staff,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const staffData = req.body;

    if (!staffData.staff_code) {
      staffData.staff_code = await Staff.generateStaffCode(staffData.staff_type);
    } else {
      const existing = await Staff.findByCode(staffData.staff_code);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Mã nhân viên đã tồn tại'
        });
      }
    }

    const phoneExists = await Staff.findAll(1, 1, { search: staffData.phone });
    if (phoneExists.data.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại đã được sử dụng'
      });
    }

    const staffId = await Staff.create(staffData);
    const newStaff = await Staff.findById(staffId);

    // Parse JSON fields
    newStaff.languages = newStaff.languages ? JSON.parse(newStaff.languages) : [];
    newStaff.certifications = newStaff.certifications ? JSON.parse(newStaff.certifications) : [];
    newStaff.specializations = newStaff.specializations ? JSON.parse(newStaff.specializations) : [];
    newStaff.vehicle_types = newStaff.vehicle_types ? JSON.parse(newStaff.vehicle_types) : [];

    res.status(201).json({
      success: true,
      message: 'Tạo nhân viên thành công',
      data: { staff: newStaff }
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const staffData = req.body;

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên'
      });
    }

    if (staffData.staff_code && staffData.staff_code !== staff.staff_code) {
      const existing = await Staff.findByCode(staffData.staff_code);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Mã nhân viên đã tồn tại'
        });
      }
    }

    await Staff.update(id, staffData);
    const updatedStaff = await Staff.findById(id);

    updatedStaff.languages = updatedStaff.languages ? JSON.parse(updatedStaff.languages) : [];
    updatedStaff.certifications = updatedStaff.certifications ? JSON.parse(updatedStaff.certifications) : [];
    updatedStaff.specializations = updatedStaff.specializations ? JSON.parse(updatedStaff.specializations) : [];
    updatedStaff.vehicle_types = updatedStaff.vehicle_types ? JSON.parse(updatedStaff.vehicle_types) : [];

    res.json({
      success: true,
      message: 'Cập nhật nhân viên thành công',
      data: { staff: updatedStaff }
    });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên'
      });
    }

    await Staff.delete(id);

    res.json({
      success: true,
      message: 'Xóa nhân viên thành công'
    });
  } catch (error) {
    if (error.message.includes('Không thể xóa')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Lấy nhân viên theo loại
 */
exports.getByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { status } = req.query;

    const staffList = await Staff.findByType(type, status || 'active');

    const parsedStaffList = staffList.map(staff => ({
      ...staff,
      languages: staff.languages ? JSON.parse(staff.languages) : [],
      certifications: staff.certifications ? JSON.parse(staff.certifications) : [],
      specializations: staff.specializations ? JSON.parse(staff.specializations) : [],
      vehicle_types: staff.vehicle_types ? JSON.parse(staff.vehicle_types) : []
    }));

    res.json({
      success: true,
      data: { staff: parsedStaffList }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp start_date và end_date'
      });
    }

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên'
      });
    }

    const schedule = await Staff.getSchedule(id, start_date, end_date);

    res.json({
      success: true,
      data: { schedule }
    });
  } catch (error) {
    next(error);
  }
};

exports.addSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scheduleData = req.body;

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên'
      });
    }

    await Staff.addSchedule(id, scheduleData);

    res.json({
      success: true,
      message: 'Cập nhật lịch làm việc thành công'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Kiểm tra nhân viên có rảnh không
 */
exports.checkAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ngày cần kiểm tra'
      });
    }

    const isAvailable = await Staff.isAvailable(id, date);

    res.json({
      success: true,
      data: { 
        available: isAvailable,
        date
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.findAvailable = async (req, res, next) => {
  try {
    const { start_date, end_date, staff_type } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp start_date và end_date'
      });
    }

    const availableStaff = await Staff.findAvailableStaff(
      start_date, 
      end_date, 
      staff_type
    );

    const parsedStaff = availableStaff.map(staff => ({
      ...staff,
      languages: staff.languages ? JSON.parse(staff.languages) : [],
      certifications: staff.certifications ? JSON.parse(staff.certifications) : [],
      specializations: staff.specializations ? JSON.parse(staff.specializations) : [],
      vehicle_types: staff.vehicle_types ? JSON.parse(staff.vehicle_types) : []
    }));

    res.json({
      success: true,
      data: { staff: parsedStaff }
    });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên'
      });
    }

    const stats = await Staff.getStats(id);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};