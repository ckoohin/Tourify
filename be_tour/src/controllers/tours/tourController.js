const { validationResult } = require("express-validator");
const { slugify } = require("../../utils/slug");
const {
    getAll,
    getById,
    create,
    update,
    deleteTour,
    getAllByKeyWord,
    cloneTourModel,
} = require("../../models/tours/Tour.js");
const { query } = require("../../config/db.js");

const TourImage = require("../../models/tours/TourImage.js");

const mapTourData = (rows) => {
    const toursById = {};
    const versionsByTour = {};

    rows.forEach((row) => {
        const tourId = row.tour_id;
        const imageId = row.tourImg_id;
        const versionId = row.version_id; 
        const priceId = row.tourPrice_id;

        if (!toursById[tourId]) {
            toursById[tourId] = {
                id: tourId,
                code: row.code,
                name: row.name,
                slug: row.slug,
                category_id: row.category_id,
                category_name: row.category_name, 
                status: row.status,
                description: row.description,
                highlights: row.highlights,
                duration_days: row.duration_days,
                duration_nights: row.duration_nights,
                departure_location: row.departure_location,
                destination: row.destination,
                min_group_size: row.min_group_size,
                max_group_size: row.max_group_size,
                is_customizable: row.is_customizable,
                qr_code: row.qr_code,
                booking_url: row.booking_url,
                updated_at: row.updated_at,
                images: [],
                versions: [],
            };
            versionsByTour[tourId] = {};
        }

        const tour = toursById[tourId];
        const versionMap = versionsByTour[tourId];

        if (imageId) {
            const imageExists = tour.images.some((img) => img.id === imageId);
            if (!imageExists) {
                tour.images.push({
                    id: imageId,
                    url: row.image_url,
                    is_featured: row.is_featured,
                });
            }
        }

        if (versionId) {
            if (!versionMap[versionId]) {
                versionMap[versionId] = {
                    id: versionId,
                    name: row.tourVersion_name,
                    prices: [],
                };
                tour.versions.push(versionMap[versionId]);
            }

            if (priceId) {
                const priceExists = versionMap[versionId].prices.some(
                    (p) => p.id === priceId
                );
                if (!priceExists) {
                    versionMap[versionId].prices.push({
                        id: priceId,
                        price: row.price,
                    });
                }
            }
        }
    });

    return Object.values(toursById);
};

async function getAllTours(req, res, next) {
    try {
        const rows = await getAll();
        const tours = mapTourData(rows);
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
        const tours = mapTourData(rows);
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
        const rows = await getById(id);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tour" });
        }
        const firstRow = rows[0];
        const tour = {
            id: firstRow.tour_id,
            code: firstRow.code,
            name: firstRow.name,
            slug: firstRow.slug,
            category_id: firstRow.category_id,
            status: firstRow.status,
            description: firstRow.description,
            highlights: firstRow.highlights,
            duration_days: firstRow.duration_days,       
            duration_nights: firstRow.duration_nights,   
            departure_location: firstRow.departure_location, 
            destination: firstRow.destination,
            duration: `${firstRow.duration_days}N ${firstRow.duration_nights}Đ`,
            location: `${firstRow.departure_location} -> ${firstRow.destination}`,
            min_group_size: firstRow.min_group_size,
            max_group_size: firstRow.max_group_size,
            is_customizable: firstRow.is_customizable,
            qr_code: firstRow.qr_code,
            booking_url: firstRow.booking_url,
            created_at: firstRow.created_at,
            updated_at: firstRow.updated_at,
            images: [],
            versions: [] 
        };

        const versionsMap = {};
        const imagesMap = {};

        rows.forEach(row => {
            if (row.tourImg_id && !imagesMap[row.tourImg_id]) {
                imagesMap[row.tourImg_id] = true;
                tour.images.push({
                    id: row.tourImg_id,
                    url: row.image_url,
                    is_featured: row.is_featured
                });
            }
            if (row.version_id) {
                if (!versionsMap[row.version_id]) {
                    versionsMap[row.version_id] = {
                        id: row.version_id,
                        name: row.version_name,
                        type: row.version_type,
                        valid_from: row.valid_from,
                        valid_to: row.valid_to,
                        prices: [] 
                    };
                    tour.versions.push(versionsMap[row.version_id]);
                }

                if (row.price_id) {
                    versionsMap[row.version_id].prices.push({
                        id: row.price_id,
                        type: row.price_type, 
                        amount: row.price,
                        currency: row.currency
                    });
                }
            }
        });

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
        if (!errors.isEmpty()) return res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ", errors: errors.array() });

        if (!req.body.code) {
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            req.body.code = `TOUR-${randomNum}`;
        }
        if (req.body.name && !req.body.slug) {
            req.body.slug = slugify(req.body.name);
        }

        const tourId = await create(req.body);

        if (req.body.images && Array.isArray(req.body.images)) {
            for (const url of req.body.images) {
                if (typeof url === 'string') {
                    await TourImage.add(tourId, url);
                }
            }
        }


        const rows = await getById(tourId);
        const tours = mapTourData(rows);
        res.status(201).json({ success: true, message: "Tạo tour thành công", data: { tour: tours[0] } });
    } catch (error) { next(error); }

        res.status(201).json({
            success: true,
            message: "Tạo tour thành công",
            data: { tour: newTour },
        });
}

async function updateTour(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ", errors: errors.array() });

        const { id } = req.params;
        if (req.body.name && !req.body.slug) req.body.slug = slugify(req.body.name);

        await update(req.body, id);

        if (req.body.images && Array.isArray(req.body.images)) {
            await TourImage.deleteByTourId(id); 
            for (const url of req.body.images) {
                if (typeof url === 'string') {
                    await TourImage.add(id, url);
                }
            }
        }

        const rows = await getById(id);
        const tours = mapTourData(rows);
        res.status(201).json({ success: true, message: "Cập nhật tour thành công", data: { updatedTour: tours[0] } });
    } catch (error) { next(error); }
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
            created_by: req.user ? req.user.id : 1,
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
    getAllTours,
    getTourById,
    createTour,
    updateTour,
    deleteTourFromController,
    getAllToursByKeyWord,
    cloneTour,
};