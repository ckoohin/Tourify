const express = require("express");
const router = express.Router();
const {
    getProfitFromController,
    getTotalBookingFromController,
    getTotalCustomerFromController,
    getAllToursRevenueFromController,
    getBookingStatusesFromController,
} = require("../../controllers/dashboard/dashboardController.js");

router.get("/profit", getProfitFromController);
router.get("/totalBooking", getTotalBookingFromController);
router.get("/totalCustomer", getTotalCustomerFromController);
router.get("/toursRevenue", getAllToursRevenueFromController);
router.get("/bookingStatus", getBookingStatusesFromController);

module.exports = router;
