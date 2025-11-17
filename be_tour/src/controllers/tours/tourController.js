const { validationResult } = require("express-validator");
const {
    getAll,
    getById,
    create,
    update,
    deleteTour,
} = require("../../models/tours/Tour.js");

async function getAllTours(req, res, next) {
    try {
        const tours = await getAll();

        const toursEdit = tours.map((row) => {
            const images = row.images
                ? row.images.split(";").map((imgStr) => {
                      const [
                          id,
                          image_url,
                          title,
                          description,
                          display_order,
                          is_featured,
                      ] = imgStr.split("|");
                      return {
                          id,
                          image_url,
                          title,
                          description,
                          display_order,
                          is_featured,
                      };
                  })
                : [];

            return {
                ...row,
                images,
            };
        });

        return res.json({
            success: true,
            data: { toursEdit },
        });
    } catch (error) {
        next(error);
    }
}

async function getTourById(req, res, next) {
    try {
        const { id } = req.params;
        const tour = await getById(id);
        return res.json({
            success: true,
            data: { tour },
        });
    } catch (error) {
        next(error);
    }
}

async function createTour(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: errors.array(),
            });
        }

        const tourId = await create(req.body);

        const newTour = await getById(tourId);

        res.status(201).json({
            success: true,
            message: "Tạo tour cấp thành công",
            data: { tour: newTour },
        });
    } catch (error) {
        next(error);
    }
}

async function updateTour(req, res, next) {
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
            const updatedTour = await getById(id);
            res.status(201).json({
                success: true,
                message: "Cập nhật tour thành công",
                data: { updatedTour: updatedTour },
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Cập nhật tour thất bại, vui lòng kiểm tra lại",
            });
        }
    } catch (error) {
        next(error);
    }
}

async function deleteTourFromController(req, res, next) {
    try {
        const { id } = req.params;

        const result = await deleteTour(id);

        if (result) {
            res.status(201).json({
                success: true,
                message: "Xóa tour thành công",
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Xóa tour thất bại, vui lòng kiểm tra lại",
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllTours: getAllTours,
    getTourById: getTourById,
    createTour: createTour,
    updateTour: updateTour,
    deleteTourFromController: deleteTourFromController,
};
