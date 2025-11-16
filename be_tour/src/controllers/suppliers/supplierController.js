const {
    getAll,
    getById,
    create,
    update,
    deleteSupplier,
} = require("../../models/suppliers/Supplier.js");
const { validationResult } = require("express-validator");

async function getAllSuppliers(req, res, next) {
    try {
        const suppliers = await getAll();
        return res.json({
            success: true,
            data: { suppliers },
        });
    } catch (error) {
        next(error);
    }
}

async function getSupplierById(req, res, next) {
    try {
        const { id } = req.params;
        const supplier = await getById(id);
        return res.json({
            success: true,
            data: { supplier },
        });
    } catch (error) {
        next(error);
    }
}

async function createSupplier(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: errors.array(),
            });
        }

        const supplierId = await create(req.body);

        const newSupplier = await getById(supplierId);

        res.status(201).json({
            success: true,
            message: "Tạo nhà cung cấp thành công",
            data: { supplier: newSupplier },
        });
    } catch (error) {
        next(error);
    }
}

async function updateSupplier(req, res, next) {
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
            const updatedSupplier = await getById(id);
            res.status(201).json({
                success: true,
                message: "Cập nhật nhà cung cấp thành công",
                data: { updatedSupplier: updatedSupplier },
            });
        } else {
            res.status(500).json({
                success: false,
                message:
                    "Cập nhật nhà cung cấp thất bại, vui lòng kiểm tra lại",
            });
        }
    } catch (error) {
        next(error);
    }
}

async function deleteSupplierFromController(req, res, next) {
    try {
        const { id } = req.params;

        const result = await deleteSupplier(id);

        if (result) {
            res.status(201).json({
                success: true,
                message: "Xóa nhà cung cấp thành công",
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Xóa nhà cung cấp thất bại, vui lòng kiểm tra lại",
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllSuppliers: getAllSuppliers,
    getSupplierById: getSupplierById,
    createSupplier: createSupplier,
    updateSupplier: updateSupplier,
    deleteSupplierFromController: deleteSupplierFromController,
};
