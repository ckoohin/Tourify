const jwt = require("jsonwebtoken");
const User = require("../models/authentication/User");
const ApiResponse = require("../utils/apiResponse");

class AuthMiddleware {
  static async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return ApiResponse.error(res, {
          message: "Vui lòng đăng nhập để tiếp tục",
          statusCode: 401
        });
      }

      const token = authHeader.substring(7);

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );

      const user = await User.findById(decoded.id);

      if (!user) {
        return ApiResponse.error(res, {
          message: "Token không hợp lệ",
          statusCode: 401
        });
      }

      if (!user.is_active) {
        return ApiResponse.error(res, {
          message: "Tài khoản đã bị khóa",
          statusCode: 403
        });
      }

      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role_id: user.role_id,
        role_name: user.role_name,
        role_slug: user.role_slug
      };

      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return ApiResponse.error(res, {
          message: "Token không hợp lệ",
          statusCode: 401
        });
      }
      if (error.name === "TokenExpiredError") {
        return ApiResponse.error(res, {
          message: "Token đã hết hạn",
          statusCode: 401
        });
      }

      return ApiResponse.error(res, {
        message: "Lỗi xác thực",
        statusCode: 500
      });
    }
  }

  /**
   * Phân quyền — kiểm tra role_slug trong token
   * @param  {...string} roles 
   */
  static authorize(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return ApiResponse.error(res, {
          message: "Vui lòng đăng nhập",
          statusCode: 401
        });
      }

      if (!roles.includes(req.user.role_slug)) {
        return ApiResponse.error(res, {
          message: "Bạn không có quyền truy cập",
          statusCode: 403
        });
      }

      next();
    };
  }

  /**
   * Xác thực tùy chọn — nếu có token thì verify, không có thì cho qua
   */
  static async optionalAuthenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id);

      if (user && user.is_active) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role_id: user.role_id,
          role_name: user.role_name,
          role_slug: user.role_slug
        };
      }

      next();
    } catch (error) {
      next(); 
    }
  }
}

module.exports = AuthMiddleware;