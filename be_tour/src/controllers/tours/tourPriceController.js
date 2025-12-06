const { validationResult } = require("express-validator");
const {
    getAll,
    getById,
    create,
    update,
    deleteTourPrice,
    getAllPriceByTourVersionId
} = require("../../models/tours/TourPrice.js");

async function getAllTourPrices(req, res, next) {
    try {
        const tourPrices = await getAll();
        return res.json({
            success: true,
            data: { tourPrices },
        });
    } catch (error) {
        next(error);
    }
}

async function getAllPriceByTourVersionIdFromController(req, res, next) {
    try {
        const { id } = req.params;
        const tourPrices = await getAllPriceByTourVersionId(id);
        return res.json({
            success: true,
            data: { tourPrices },
        });
    } catch (error) {
        next(error);
    }
}

async function getTourPriceById(req, res, next) {
    try {
        const { id } = req.params;
        const tourPrice = await getById(id);
        return res.json({
            success: true,
            data: { tourPrice },
        });
    } catch (error) {
        next(error);
    }
}

async function createTourPrice(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: errors.array(),
            });
        }

        const tourPriceId = await create(req.body);

        const newTourPrice = await getById(tourPriceId);

        res.status(201).json({
            success: true,
            message: "Tạo tourPrice thành công",
            data: { tourPrice: newTourPrice },
        });
    } catch (error) {
        next(error);
    }
}

async function updateTourPrice(req, res, next) {
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
            const updatedTourPrice = await getById(id);
            res.status(201).json({
                success: true,
                message: "Cập nhật tourPrice thành công",
                data: { updatedTourPrice: updatedTourPrice },
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Cập nhật tourPrice thất bại, vui lòng kiểm tra lại",
            });
        }
    } catch (error) {
        next(error);
    }
}

async function deleteTourPriceFromController(req, res, next) {
    try {
        const { id } = req.params;

        const result = await deleteTourPrice(id);

        if (result) {
            res.status(201).json({
                success: true,
                message: "Xóa tourPrice thành công",
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Xóa tourPrice thất bại, vui lòng kiểm tra lại",
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllTourPrices: getAllTourPrices,
    getTourPriceById: getTourPriceById,
    createTourPrice: createTourPrice,
    updateTourPrice: updateTourPrice,
    deleteTourPriceFromController: deleteTourPriceFromController,
    getAllPriceByTourVersionIdFromController: getAllPriceByTourVersionIdFromController
};
