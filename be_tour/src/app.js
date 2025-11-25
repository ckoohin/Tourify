require("module-alias/register");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const path = require("path");

const { testConnection } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authentication/auth");
const roleRoutes = require("./routes/authentication/roleRoutes");
const permissionRoutes = require("./routes/authentication/permissionRoutes");
const permissionRoleRoutes = require("./routes/authentication/permissionRoleRoutes");
const tourCategoryRoutes = require("./routes/tours/tourCategoryRoutes");
const staffRoutes = require("./routes/staff/staff");
const supplierRoutes = require("./routes/suppliers/supplier.js");
const tourRoutes = require("./routes/tours/tourRoutes.js");
const tourImageRoutes = require("./routes/tours/tourImageRoutes.js");
const tourVersionRoutes = require("./routes/tours/tourVersionRoutes.js");
const tourPriceRoutes = require("./routes/tours/tourPriceRoutes.js");
const customerRoutes = require("./routes/customers/customer.js");
const bookingRoutes = require("./routes/bookings/booking.js");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(helmet());

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
});
app.use("/api", limiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tour-categories", tourCategoryRoutes);
app.use("/api/v1/staff", staffRoutes);
app.use("/api/v1/supplier", supplierRoutes);
app.use("/api/v1/tours", tourRoutes);
app.use("/api/v1/tours-image", tourImageRoutes);
app.use("/api/v1/tours-version", tourVersionRoutes);
app.use("/api/v1/tours-price", tourPriceRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/permissions", permissionRoutes);
app.use("/api/v1/permission-roles", permissionRoleRoutes);
app.use("/api/v1/customer", customerRoutes);
app.use("/api/v1/booking", bookingRoutes);

app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
    });
});
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await testConnection();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(
                `Environment: ${process.env.NODE_ENV || "development"}`
            );
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
