const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { testConnection } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authentication/auth");
const tourCategoryRoutes = require("./routes/tours/tourCategoryRoutes");
const staffRoutes = require("./routes/staff/staff");
const supplierRoutes = require("./routes/suppliers/supplierRoutes.js");

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173',
//   credentials: true
// }));

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

// Route nhà cung cấp
app.use("/api/v1/supplier", supplierRoutes);

// app.use('/api/v1/auth', require('./routes/authentication/auth'));
// app.use('/api/v1/tours', require('./routes/tourRoutes'));
// app.use('/api/v1/bookings', require('./routes/bookingRoutes'));
// app.use('/api/v1/users', require('./routes/userRoutes'));

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
