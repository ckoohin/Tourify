const TourCategory = require("../../models/tours/TourCategory");
const { validationResult } = require("express-validator");

exports.getAll = async (req, res, next) => {
    try {
        const { is_active, parent_id } = req.query;

        const filters = {};
        if (is_active !== undefined) filters.is_active = parseInt(is_active);
        if (parent_id !== undefined)
            filters.parent_id =
                parent_id === "null" ? null : parseInt(parent_id);

        const categories = await TourCategory.findAll(filters);

        res.json({
            success: true,
            data: { categories },
        });
    } catch (error) {
        next(error);
    }
};

exports.getTree = async (req, res, next) => {
    try {
        const tree = await TourCategory.getTree();

        res.json({
            success: true,
            data: { tree },
        });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await TourCategory.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục",
            });
        }

        const children = await TourCategory.getChildren(id);

        res.json({
            success: true,
            data: {
                category,
                children,
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: errors.array(),
            });
        }

        const { name, slug, description, parent_id, display_order, is_active } =
            req.body;

        const slugExists = await TourCategory.slugExists(slug);
        if (slugExists) {
            return res.status(400).json({
                success: false,
                message: "Slug đã tồn tại",
            });
        }

        if (parent_id) {
            const parent = await TourCategory.findById(parent_id);
            if (!parent) {
                return res.status(400).json({
                    success: false,
                    message: "Danh mục cha không tồn tại",
                });
            }
        }

        const categoryId = await TourCategory.create({
            name,
            slug,
            description,
            parent_id,
            display_order,
            is_active,
        });

        const newCategory = await TourCategory.findById(categoryId);

        res.status(201).json({
            success: true,
            message: "Tạo danh mục thành công",
            data: { category: newCategory },
        });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
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
        const { name, slug, description, parent_id, display_order, is_active } =
            req.body;

        const category = await TourCategory.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục",
            });
        }

        if (slug && slug !== category.slug) {
            const slugExists = await TourCategory.slugExists(slug, id);
            if (slugExists) {
                return res.status(400).json({
                    success: false,
                    message: "Slug đã tồn tại",
                });
            }
        }

        if (parent_id && parseInt(parent_id) === parseInt(id)) {
            return res.status(400).json({
                success: false,
                message: "Không thể set danh mục cha là chính nó",
            });
        }

        if (parent_id) {
            const parent = await TourCategory.findById(parent_id);
            if (!parent) {
                return res.status(400).json({
                    success: false,
                    message: "Danh mục cha không tồn tại",
                });
            }
        }

        await TourCategory.update(id, {
            name,
            slug,
            description,
            parent_id,
            display_order,
            is_active,
        });

        const updatedCategory = await TourCategory.findById(id);

        res.json({
            success: true,
            message: "Cập nhật danh mục thành công",
            data: { category: updatedCategory },
        });
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await TourCategory.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục",
            });
        }

        await TourCategory.delete(id);

        res.json({
            success: true,
            message: "Xóa danh mục thành công",
        });
    } catch (error) {
        if (error.message.includes("Không thể xóa")) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        next(error);
    }
};

exports.updateOrder = async (req, res, next) => {
    try {
        const { orders } = req.body;

        if (!Array.isArray(orders) || orders.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
            });
        }

        await TourCategory.updateOrder(orders);

        res.json({
            success: true,
            message: "Cập nhật thứ tự thành công",
        });
    } catch (error) {
        next(error);
    }
};

exports.getChildren = async (req, res, next) => {
    try {
        const { id } = req.params;

        const children = await TourCategory.getChildren(id);

        res.json({
            success: true,
            data: { children },
        });
    } catch (error) {
        next(error);
    }
};
