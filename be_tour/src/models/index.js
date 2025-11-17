const sequelize = require("../config/db");
const User = require("./User");
const Role = require("./Role");
const Tour = require("./Tour");
const TourCategory = require("./TourCategory");
const Booking = require("./Booking");

// Define associations
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Role.hasMany(User, { foreignKey: "roleId", as: "users" });

Tour.belongsTo(TourCategory, { foreignKey: "categoryId", as: "category" });
TourCategory.hasMany(Tour, { foreignKey: "categoryId", as: "tours" });

Booking.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Booking, { foreignKey: "userId", as: "bookings" });

Booking.belongsTo(Tour, { foreignKey: "tourId", as: "tour" });
Tour.hasMany(Booking, { foreignKey: "tourId", as: "bookings" });

module.exports = {
    sequelize,
    User,
    Role,
    Tour,
    TourCategory,
    Booking,
};
