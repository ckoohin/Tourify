const bcrypt = require('bcrypt');
const { query, getConnection } = require('../../config/db');
const { sendEmail } = require('../../services/emailService'); 
const Staff = require("../../models/staff/Staff");
const { validationResult } = require("express-validator");

exports.getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const { staff_type, status, search } = req.query;

    const filters = {};
    if (staff_type) filters.staff_type = staff_type;
    if (status) filters.status = status;
    if (search) filters.search = search;

    const result = await Staff.findAll(page, limit, filters);

    result.data = result.data.map((staff) => ({
      ...staff,
      languages: (() => {
        if (!staff.languages) return [];
        if (typeof staff.languages === "string") {
          try {
            return JSON.parse(staff.languages);
          } catch {
            return staff.languages.split(",");
          }
        }
        return Array.isArray(staff.languages) ? staff.languages : [];
      })(),
      certifications: (() => {
        if (!staff.certifications) return [];
        if (typeof staff.certifications === "string") {
          try {
            return JSON.parse(staff.certifications);
          } catch {
            return staff.certifications.split(",");
          }
        }
        return Array.isArray(staff.certifications) ? staff.certifications : [];
      })(),
      specializations: (() => {
        if (!staff.specializations) return [];
        if (typeof staff.specializations === "string") {
          try {
            return JSON.parse(staff.specializations);
          } catch {
            return staff.specializations.split(",");
          }
        }
        return Array.isArray(staff.specializations)
          ? staff.specializations
          : [];
      })(),
      vehicle_types: (() => {
        if (!staff.vehicle_types) return [];
        if (typeof staff.vehicle_types === "string") {
          try {
            return JSON.parse(staff.vehicle_types);
          } catch {
            return staff.vehicle_types.split(",");
          }
        }
        return Array.isArray(staff.vehicle_types) ? staff.vehicle_types : [];
      })(),
    }));

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Lỗi SQL:", error.message);
    next(error);
  }
};

const parseField = (field) => {
  if (!field) return [];
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch {
      return field.split(",");
    }
  }
  return Array.isArray(field) ? field : [];
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findById(id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhân viên",
      });
    }

    staff.languages = parseField(staff.languages);
    staff.certifications = parseField(staff.certifications);
    staff.specializations = parseField(staff.specializations);
    staff.vehicle_types = parseField(staff.vehicle_types);

    const stats = await Staff.getStats(id);

    res.json({
      success: true,
      data: {
        staff,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let pass = '';
  for (let i = 0; i < 12; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass.replace(/(.{4})(.{4})(.{4})/, '$1-$2-$3');
};

exports.create = async (req, res, next) => {
  let connection;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: errors.array(),
      });
    }

    const data = req.body;
    connection = await getConnection(); 
    await connection.beginTransaction();

    if (!data.staff_code) {
      data.staff_code = await Staff.generateStaffCode(data.staff_type || 'tour_guide');
    } else {
      const codeExists = await Staff.findByCode(data.staff_code);
      if (codeExists) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: "Mã nhân viên đã tồn tại" });
      }
    }

    if (data.phone) {
      const phoneCheck = await query(
        `SELECT 1 FROM users WHERE phone = ? UNION SELECT 1 FROM staff WHERE phone = ? LIMIT 1`,
        [data.phone, data.phone],
        connection
      );
      if (phoneCheck.length > 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: "Số điện thoại đã được sử dụng" });
      }
    }

    if (data.email) {
      const emailCheck = await query(
        `SELECT id FROM users WHERE email = ? LIMIT 1`,
        [data.email],
        connection
      );
      if (emailCheck.length > 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: "Email đã được sử dụng" });
      }
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const roleId = data.staff_type === 'driver' ? 4 : 2; 

    const userResult = await query(
      `INSERT INTO users 
       (role_id, name, email, password, phone, status, is_active, user_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, 1, 2, NOW(), NOW())`,
      [
        roleId,
        data.full_name || 'Nhân viên mới',
        data.email || null,
        hashedPassword,
        data.phone || null,
      ],
      connection
    );

    const userId = userResult.insertId;

    const staffResult = await query(
      `INSERT INTO staff (
        user_id, staff_code, staff_type, full_name, birthday, gender,
        id_number, phone, email, address, languages, certifications,
        specializations, experience_years, driver_license_number,
        driver_license_class, vehicle_types, status, health_status, notes,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
      )`,
      [
        userId,
        data.staff_code,
        data.staff_type || 'tour_guide',
        data.full_name,
        data.birthday || null,
        data.gender || null,
        data.id_number || null,
        data.phone,
        data.email || null,
        data.address || null,
        JSON.stringify(data.languages || []),
        JSON.stringify(data.certifications || []),
        JSON.stringify(data.specializations || []),
        data.experience_years || 0,
        data.driver_license_number || null,
        data.driver_license_class || null,
        JSON.stringify(data.vehicle_types || []),
        data.status || 'active',
        data.health_status || null,
        data.notes || null,
      ],
      connection
    );

    const staffId = staffResult.insertId;

    await connection.commit();

    if (data.email) {
      const subject = "Chào mừng bạn đến với hệ thống Tourify!";
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #f9f9f9;">
          <h2 style="color: #1976d2;">Chào mừng bạn đến với Tourify!</h2>
          <p>Tài khoản nhân viên của bạn đã được tạo thành công bởi quản trị viên.</p>
          <p>Vui lòng sử dụng thông tin sau để đăng nhập:</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 5px solid #1976d2;">
            <p><strong>Email:</strong> <code>${data.email}</code></p>
            <p><strong>Mật khẩu tạm thời:</strong> 
              <code style="font-size: 1.4em; color: #d32f2f; background: #ffebee; padding: 5px 10px; border-radius: 4px;">
                ${tempPassword}
              </code>
            </p>
          </div>
          
          <p style="color: #d32f2f; font-weight: bold;">
            Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu!
          </p>
          
          <hr>
          <p>Trân trọng,<br><strong>Đội ngũ Tourify</strong></p>
        </div>
      `;

      try {
        await sendEmail(data.email, subject, html);
      } catch (err) {
        console.error("Gửi email thất bại (không ảnh hưởng kết quả):", err.message);
      }
    }

    const newStaff = await Staff.findById(staffId);

    const parseArray = (field) => {
      if (!field) return [];
      try { return JSON.parse(field); } catch { return []; }
    };

    if (newStaff) {
      newStaff.languages = parseArray(newStaff.languages);
      newStaff.certifications = parseArray(newStaff.certifications);
      newStaff.specializations = parseArray(newStaff.specializations);
      newStaff.vehicle_types = parseArray(newStaff.vehicle_types);
    }

    return res.status(201).json({
      success: true,
      message: "Tạo nhân viên thành công! Email đăng nhập đã được gửi.",
      data: { staff: newStaff },
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Lỗi tạo nhân viên:", error);
    return next(error);
  } finally {
    if (connection) connection.release();
  }
};

exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const staffData = req.body;

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhân viên",
      });
    }

    if (staffData.staff_code && staffData.staff_code !== staff.staff_code) {
      const existing = await Staff.findByCode(staffData.staff_code);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Mã nhân viên đã tồn tại",
        });
      }
    }

    await Staff.update(id, staffData);
    const updatedStaff = await Staff.findById(id);

    const parseJsonArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try {
        return JSON.parse(val);
      } catch {
        return val.split(",").map((v) => v.trim());
      }
    };

    updatedStaff.languages = parseJsonArray(updatedStaff.languages);
    updatedStaff.certifications = parseJsonArray(updatedStaff.certifications);
    updatedStaff.specializations = parseJsonArray(updatedStaff.specializations);
    updatedStaff.vehicle_types = parseJsonArray(updatedStaff.vehicle_types);

    res.json({
      success: true,
      message: "Cập nhật nhân viên thành công",
      data: { staff: updatedStaff },
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
        message: "Không tìm thấy nhân viên",
      });
    }

    await Staff.delete(id);

    res.json({
      success: true,
      message: "Xóa nhân viên thành công",
    });
  } catch (error) {
    if (error.message.includes("Không thể xóa")) {
      return res.status(400).json({
        success: false,
        message: error.message,
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

    const staffList = await Staff.findByType(type, status || "active");

    const parsedStaffList = staffList.map((staff) => ({
      ...staff,
      languages: staff.languages ? JSON.parse(staff.languages) : [],
      certifications: staff.certifications
        ? JSON.parse(staff.certifications)
        : [],
      specializations: staff.specializations
        ? JSON.parse(staff.specializations)
        : [],
      vehicle_types: staff.vehicle_types ? JSON.parse(staff.vehicle_types) : [],
    }));

    res.json({
      success: true,
      data: { staff: parsedStaffList },
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
        message: "Vui lòng cung cấp start_date và end_date",
      });
    }

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhân viên",
      });
    }

    const schedule = await Staff.getSchedule(id, start_date, end_date);

    res.json({
      success: true,
      data: { schedule },
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
        message: "Không tìm thấy nhân viên",
      });
    }

    await Staff.addSchedule(id, scheduleData);

    res.json({
      success: true,
      message: "Cập nhật lịch làm việc thành công",
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
        message: "Vui lòng cung cấp ngày cần kiểm tra",
      });
    }

    const isAvailable = await Staff.isAvailable(id, date);

    res.json({
      success: true,
      data: {
        available: isAvailable,
        date,
      },
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
        message: "Vui lòng cung cấp start_date và end_date",
      });
    }

    const availableStaff = await Staff.findAvailableStaff(
      start_date,
      end_date,
      staff_type
    );

    const parsedStaff = availableStaff.map((staff) => ({
      ...staff,
      languages: staff.languages ? JSON.parse(staff.languages) : [],
      certifications: staff.certifications
        ? JSON.parse(staff.certifications)
        : [],
      specializations: staff.specializations
        ? JSON.parse(staff.specializations)
        : [],
      vehicle_types: staff.vehicle_types ? JSON.parse(staff.vehicle_types) : [],
    }));

    res.json({
      success: true,
      data: { staff: parsedStaff },
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
        message: "Không tìm thấy nhân viên",
      });
    }

    const stats = await Staff.getStats(id);

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};