const { validationResult } = require("express-validator");
const QRCode = require('qrcode');
const {
    getAll,
    getById,
    create,
    update,
    deleteTour,
    getAllByKeyWord,
    cloneTourModel,
} = require("../../models/tours/Tour.js");

async function getAllTours(req, res, next) {
    try {
        const rows = await getAll();
        const toursById = {};
        const versionsByTour = {};

        rows.forEach((row) => {
            const tourId = row.tour_id;
            const imageId = row.tourImg_id;
            const versionId = row.id;
            const priceId = row.tourPrice_id;

            if (!toursById[tourId]) {
                toursById[tourId] = {
                    id: tourId,
                    name: row.name,
                    slug: row.slug,
                    images: [],
                    versions: [],
                };

                versionsByTour[tourId] = {};
            }

            const tour = toursById[tourId];
            const versionMap = versionsByTour[tourId];

            if (imageId) {
                const imageExists = tour.images.some(
                    (img) => img.id === imageId
                );

                if (!imageExists) {
                    tour.images.push({
                        id: imageId,
                        url: row.image_url,
                    });
                }
            }

            if (versionId && !versionMap[versionId]) {
                versionMap[versionId] = {
                    id: versionId,
                    name: row.tourVersion_name,
                    prices: [],
                };

                tour.versions.push(versionMap[versionId]);
            }

            if (priceId) {
                const priceExists = versionMap[versionId].prices.some(
                    (price) => price.id === priceId
                );

                if (!priceExists) {
                    versionMap[versionId].prices.push({
                        id: priceId,
                        price: row.price,
                    });
                }
            }
        });

        const tours = Object.values(toursById);

        console.log(tours);

        return res.json({
            success: true,
            data: { tours },
        });
    } catch (error) {
        next(error);
    }
}

async function getAllToursByKeyWord(req, res, next) {
    try {
        const keyword = req.query.keyword || "";
        const rows = await getAllByKeyWord(keyword);
        const toursById = {};
        const versionsByTour = {};

        rows.forEach((row) => {
            const tourId = row.tour_id;
            const imageId = row.tourImg_id;
            const versionId = row.id;
            const priceId = row.tourPrice_id;

            if (!toursById[tourId]) {
                toursById[tourId] = {
                    id: tourId,
                    name: row.name,
                    slug: row.slug,
                    images: [],
                    versions: [],
                };

                versionsByTour[tourId] = {};
            }

            const tour = toursById[tourId];
            const versionMap = versionsByTour[tourId];

            if (imageId) {
                const imageExists = tour.images.some(
                    (img) => img.id === imageId
                );

                if (!imageExists) {
                    tour.images.push({
                        id: imageId,
                        url: row.image_url,
                    });
                }
            }

            if (versionId && !versionMap[versionId]) {
                versionMap[versionId] = {
                    id: versionId,
                    name: row.tourVersion_name,
                    prices: [],
                };

                tour.versions.push(versionMap[versionId]);
            }

            if (priceId) {
                const priceExists = versionMap[versionId].prices.some(
                    (price) => price.id === priceId
                );

                if (!priceExists) {
                    versionMap[versionId].prices.push({
                        id: priceId,
                        price: row.price,
                    });
                }
            }
        });

        const tours = Object.values(toursById);

        console.log(tours);

        return res.json({
            success: true,
            data: { tours },
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

async function cloneTour(req, res, next) {
    try {
        const { id } = req.params;
        const { new_name, new_code, new_slug } = req.body;

        if (!new_name || !new_code || !new_slug) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp tên, mã và slug cho tour mới",
            });
        }

        const clonedTourId = await cloneTourModel(id, {
            new_name,
            new_code,
            new_slug,
            created_by: req.user.id, 
        });

        const newTour = await getById(clonedTourId);

        res.status(201).json({
            success: true,
            message: "Clone tour thành công",
            data: { tour: newTour },
        });
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
    getAllToursByKeyWord: getAllToursByKeyWord,
    cloneTour: cloneTour,
};
