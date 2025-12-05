const {
    getAll,
    getAllCustomerInQuotes,
    getById,
    create,
    update,
    deleteCustomer,
} = require("../../models/authentication/Customer.js");
const { validationResult } = require("express-validator");

async function getAllCustomers(req, res, next) {
    try {
        const customers = await getAll();
        return res.json({
            success: true,
            data: { customers },
        });
    } catch (error) {
        next(error);
    }
}

// Chỉ lấy danh sách khách hàng trong bảng quotes với điều kiện status = sent
async function fetchAllCustomersInQuotes(req, res, next) {
    try {
        const customers = await getAllCustomerInQuotes();
        return res.json({
            success: true,
            data: { customers },
        });
    } catch (error) {
        next(error);
    }
}

async function getCustomerById(req, res, next) {
    try {
        const { id } = req.params;
        const customer = await getById(id);
        return res.json({
            success: true,
            data: { customer },
        });
    } catch (error) {
        next(error);
    }
}

async function createCustomer(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: errors.array(),
            });
        }

        const customerId = await create(req.body);

        const newCustomer = await getById(customerId);

        res.status(201).json({
            success: true,
            message: "Tạo thông tin khách hàng thành công",
            data: { customer: newCustomer },
        });
    } catch (error) {
        next(error);
    }
}

async function updateCustomer(req, res, next) {
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

        const result = await update(req.body, id);

        if (result) {
            const updatedCustomer = await getById(id);
            res.status(201).json({
                success: true,
                message: "Cập nhật thông tin khách hàng thành công",
                data: { updatedCustomer: updatedCustomer },
            });
        } else {
            res.status(500).json({
                success: false,
                message:
                    "Cập nhật thông tin khách hàng thất bại, vui lòng kiểm tra lại",
            });
        }
    } catch (error) {
        next(error);
    }
}

async function deleteCustomerFromController(req, res, next) {
    try {
        const { id } = req.params;

        const result = await deleteCustomer(id);

        if (result) {
            res.status(201).json({
                success: true,
                message: "Xóa thông tin khách hàng thành công",
            });
        } else {
            res.status(500).json({
                success: false,
                message:
                    "Xóa thông tin khách hàng thất bại, vui lòng kiểm tra lại",
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllCustomers: getAllCustomers,
    fetchAllCustomersInQuotes: fetchAllCustomersInQuotes,
    getCustomerById: getCustomerById,
    createCustomer: createCustomer,
    updateCustomer: updateCustomer,
    deleteCustomerFromController: deleteCustomerFromController,
};
