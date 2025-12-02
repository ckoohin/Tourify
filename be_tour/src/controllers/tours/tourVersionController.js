const { validationResult } = require("express-validator");
const {
    getAll,
    getById,
    create,
    update,
    deleteTourVersion,
} = require("../../models/tours/TourVersion.js");

async function getAllTourVersions(req, res, next) {
    try {
        const { tour_id } = req.query; 
        const tourVersions = await getAll(tour_id);
        
        return res.json({
            success: true,
            data: { tourVersions },
        });
    } catch (error) {
        next(error);
    }
}

async function getTourVersionById(req, res, next) {
    try {
        const { id } = req.params;
        const tourVersion = await getById(id);
        return res.json({
            success: true,
            data: { tourVersion },
        });
    } catch (error) {
        next(error);
    }
}

async function createTourVersion(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: errors.array(),
            });
        }

        const tourVersionId = await create(req.body);

        const newTourVersion = await getById(tourVersionId);

        res.status(201).json({
            success: true,
            message: "Tạo tourVersion thành công",
            data: { tourVersion: newTourVersion },
        });
    } catch (error) {
        next(error);
    }
}

async function updateTourVersion(req, res, next) {
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
            const updatedTourVersion = await getById(id);
            res.status(201).json({
                success: true,
                message: "Cập nhật tourVersion thành công",
                data: { updatedTourVersion: updatedTourVersion },
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Cập nhật tourVersion thất bại, vui lòng kiểm tra lại",
            });
        }
    } catch (error) {
        next(error);
    }
}

async function deleteTourVersionFromController(req, res, next) {
    try {
        const { id } = req.params;

        const result = await deleteTourVersion(id);

        if (result) {
            res.status(201).json({
                success: true,
                message: "Xóa tourVersion thành công",
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Xóa tourVersion thất bại, vui lòng kiểm tra lại",
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllTourVersions: getAllTourVersions,
    getTourVersionById: getTourVersionById,
    createTourVersion: createTourVersion,
    updateTourVersion: updateTourVersion,
    deleteTourVersionFromController: deleteTourVersionFromController,
};
