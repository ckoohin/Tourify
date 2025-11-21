const { validationResult } = require("express-validator");
const { create, getById } = require("../../models/tours/TourImage.js");
const { upload } = require("../../services/tourService.js");
// async function getAllTours(req, res, next) {
//     try {
//         const tours = await getAll();
//         return res.json({
//             success: true,
//             data: { tours },
//         });
//     } catch (error) {
//         next(error);
//     }
// }

async function getTourImgById(req, res, next) {
    try {
        const { id } = req.params;
        const tourImg = await getById(id);
        return res.json({
            success: true,
            data: { tourImg },
        });
    } catch (error) {
        next(error);
    }
}

async function createImg(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: errors.array(),
            });
        }

        const tourImgId = await create(req.body, req.file.filename);
        const newTourImg = await getById(tourImgId);
        res.status(201).json({
            success: true,
            message: "Tạo tourImg thành công",
            data: { tourImg: newTourImg },
        });
    } catch (error) {
        next(error);
    }
}

// async function updateTour(req, res, next) {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Dữ liệu không hợp lệ",
//                 errors: errors.array(),
//             });
//         }

//         const { id } = req.params;

//         const result = await update(req.body, id);

//         if (result) {
//             const updatedTour = await getById(id);
//             res.status(201).json({
//                 success: true,
//                 message: "Cập nhật tour thành công",
//                 data: { updatedTour: updatedTour },
//             });
//         } else {
//             res.status(500).json({
//                 success: false,
//                 message: "Cập nhật tour thất bại, vui lòng kiểm tra lại",
//             });
//         }
//     } catch (error) {
//         next(error);
//     }
// }

// async function deleteTourFromController(req, res, next) {
//     try {
//         const { id } = req.params;

//         const result = await deleteTour(id);

//         if (result) {
//             res.status(201).json({
//                 success: true,
//                 message: "Xóa tour thành công",
//             });
//         } else {
//             res.status(500).json({
//                 success: false,
//                 message: "Xóa tour thất bại, vui lòng kiểm tra lại",
//             });
//         }
//     } catch (error) {
//         next(error);
//     }
// }

module.exports = {
    createImg: createImg,
};
