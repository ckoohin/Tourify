const {
    getProfit,
    getTotalBooking,
    getTotalCustomer,
    getAllToursRevenue,
    getBookingStatuses,
} = require("../../models/dashboard/dashboard.js");

async function getProfitFromController(req, res, next) {
    try {
        const profit = await getProfit();
        return res.json({
            success: true,
            data: { profit },
        });
    } catch (error) {
        next(error);
    }
}

async function getTotalBookingFromController(req, res, next) {
    try {
        const totalBooking = await getTotalBooking();
        return res.json({
            success: true,
            data: { totalBooking },
        });
    } catch (error) {
        next(error);
    }
}

async function getTotalCustomerFromController(req, res, next) {
    try {
        const totalCustomer = await getTotalCustomer();
        return res.json({
            success: true,
            data: { totalCustomer },
        });
    } catch (error) {
        next(error);
    }
}

async function getAllToursRevenueFromController(req, res, next) {
    try {
        const rows = await getAllToursRevenue();

        const result = [];

        rows.forEach((row) => {
            const duplicateRowIndex = result.findIndex((item) => {
                return item.id == row.id;
            });

            if (duplicateRowIndex != -1) {
                result[duplicateRowIndex].remaining_amount = String(
                    Number(result[duplicateRowIndex].remaining_amount) +
                        Number(row.remaining_amount)
                );
            } else {
                result.push(row);
            }
        });

        return res.json({
            success: true,
            data: { data: result },
        });
    } catch (error) {
        next(error);
    }
}

async function getBookingStatusesFromController(req, res, next) {
    try {
        const listStatus = [
            "pending",
            "confirmed",
            "deposited",
            "paid",
            "completed",
            "cancelled",
        ];

        const bookingStatusList = await getBookingStatuses();

        bookingStatusList.forEach((row) => {
            const index = listStatus.findIndex((item) => {
                return item == row.booking_status;
            });

            if (index != -1) {
                listStatus.splice(index, 1);
            }
        });

        if (listStatus.length > 0) {
            listStatus.forEach((status) => {
                bookingStatusList.push({
                    booking_status: status,
                    booking_count: 0,
                });
            });
        }

        return res.json({
            success: true,
            data: { bookingStatusList },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProfitFromController: getProfitFromController,
    getTotalBookingFromController: getTotalBookingFromController,
    getTotalCustomerFromController: getTotalCustomerFromController,
    getAllToursRevenueFromController: getAllToursRevenueFromController,
    getBookingStatusesFromController: getBookingStatusesFromController,
};
