const { validationResult } = require("express-validator");
const TransportGuestAssignment = require("../../models/tours/TransportGuestAssignment");
const TourTransport = require("../../models/tours/TourTransport");
const ApiResponse = require("../../utils/apiResponse");

/**
 * Lấy danh sách khách trong phương tiện
 */
async function getAssignmentsByTransport(req, res, next) {
    try {
        const { transportId } = req.params;

        const assignments = await TransportGuestAssignment.getByTransport(transportId);

        return ApiResponse.success(res, {
            message: "Lấy danh sách phân bổ thành công",
            data: { assignments }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Lấy phương tiện của khách
 */
async function getAssignmentsByGuest(req, res, next) {
    try {
        const { guestId } = req.params;

        const assignments = await TransportGuestAssignment.getByGuest(guestId);

        return ApiResponse.success(res, {
            message: "Lấy danh sách phương tiện thành công",
            data: { assignments }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Lấy chi tiết phân bổ
 */
async function getAssignmentById(req, res, next) {
    try {
        const { id } = req.params;

        const assignment = await TransportGuestAssignment.getById(id);

        if (!assignment) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy phân bổ",
                statusCode: 404
            });
        }

        return ApiResponse.success(res, {
            message: "Lấy chi tiết phân bổ thành công",
            data: { assignment }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Phân bổ khách vào phương tiện
 */
async function createAssignment(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ApiResponse.error(res, {
                message: "Dữ liệu không hợp lệ",
                statusCode: 400,
                errors: errors.array()
            });
        }

        const { tour_transport_id, seat_number } = req.body;

        // Kiểm tra phương tiện có tồn tại
        const transport = await TourTransport.getById(tour_transport_id);
        if (!transport) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy phương tiện",
                statusCode: 404
            });
        }

        // Kiểm tra còn chỗ trống không
        const seatInfo = await TourTransport.getAvailableSeats(tour_transport_id);
        if (seatInfo.available_seats <= 0) {
            return ApiResponse.error(res, {
                message: "Phương tiện đã hết chỗ",
                statusCode: 400
            });
        }

        // Kiểm tra ghế đã được sử dụng chưa (nếu có chỉ định ghế)
        if (seat_number) {
            const isTaken = await TransportGuestAssignment.isSeatTaken(
                tour_transport_id,
                seat_number
            );
            if (isTaken) {
                return ApiResponse.error(res, {
                    message: `Ghế ${seat_number} đã được sử dụng`,
                    statusCode: 400
                });
            }
        }

        const assignmentId = await TransportGuestAssignment.create(req.body);
        const newAssignment = await TransportGuestAssignment.getById(assignmentId);

        return ApiResponse.success(res, {
            message: "Phân bổ khách thành công",
            data: { assignment: newAssignment },
            statusCode: 201
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Cập nhật phân bổ
 */
async function updateAssignment(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ApiResponse.error(res, {
                message: "Dữ liệu không hợp lệ",
                statusCode: 400,
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { seat_number } = req.body;

        const existingAssignment = await TransportGuestAssignment.getById(id);
        if (!existingAssignment) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy phân bổ",
                statusCode: 404
            });
        }

        // Kiểm tra ghế mới có bị trùng không (nếu đổi ghế)
        if (seat_number && seat_number !== existingAssignment.seat_number) {
            const isTaken = await TransportGuestAssignment.isSeatTaken(
                existingAssignment.tour_transport_id,
                seat_number,
                id
            );
            if (isTaken) {
                return ApiResponse.error(res, {
                    message: `Ghế ${seat_number} đã được sử dụng`,
                    statusCode: 400
                });
            }
        }

        await TransportGuestAssignment.update(id, req.body);
        const updatedAssignment = await TransportGuestAssignment.getById(id);

        return ApiResponse.success(res, {
            message: "Cập nhật phân bổ thành công",
            data: { assignment: updatedAssignment }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Xóa phân bổ
 */
async function deleteAssignment(req, res, next) {
    try {
        const { id } = req.params;

        const assignment = await TransportGuestAssignment.getById(id);
        if (!assignment) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy phân bổ",
                statusCode: 404
            });
        }

        const result = await TransportGuestAssignment.delete(id);

        if (result) {
            return ApiResponse.success(res, {
                message: "Xóa phân bổ thành công"
            });
        } else {
            return ApiResponse.error(res, {
                message: "Xóa phân bổ thất bại",
                statusCode: 500
            });
        }
    } catch (error) {
        next(error);
    }
}

/**
 * Phân bổ hàng loạt
 */
async function bulkCreateAssignments(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ApiResponse.error(res, {
                message: "Dữ liệu không hợp lệ",
                statusCode: 400,
                errors: errors.array()
            });
        }

        const { assignments } = req.body;

        if (!Array.isArray(assignments) || assignments.length === 0) {
            return ApiResponse.error(res, {
                message: "Danh sách phân bổ không hợp lệ",
                statusCode: 400
            });
        }

        // Validate từng assignment
        for (const assignment of assignments) {
            // Kiểm tra phương tiện tồn tại
            const transport = await TourTransport.getById(assignment.tour_transport_id);
            if (!transport) {
                return ApiResponse.error(res, {
                    message: `Không tìm thấy phương tiện ID ${assignment.tour_transport_id}`,
                    statusCode: 404
                });
            }

            // Kiểm tra ghế trùng trong batch
            if (assignment.seat_number) {
                const duplicates = assignments.filter(a => 
                    a.tour_transport_id === assignment.tour_transport_id && 
                    a.seat_number === assignment.seat_number
                );
                if (duplicates.length > 1) {
                    return ApiResponse.error(res, {
                        message: `Ghế ${assignment.seat_number} bị trùng trong danh sách`,
                        statusCode: 400
                    });
                }

                // Kiểm tra ghế đã được sử dụng
                const isTaken = await TransportGuestAssignment.isSeatTaken(
                    assignment.tour_transport_id,
                    assignment.seat_number
                );
                if (isTaken) {
                    return ApiResponse.error(res, {
                        message: `Ghế ${assignment.seat_number} đã được sử dụng`,
                        statusCode: 400
                    });
                }
            }
        }

        const createdCount = await TransportGuestAssignment.bulkCreate(assignments);

        return ApiResponse.success(res, {
            message: `Phân bổ ${createdCount} khách thành công`,
            data: { createdCount },
            statusCode: 201
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Lấy danh sách ghế đã sử dụng
 */
async function getUsedSeats(req, res, next) {
    try {
        const { transportId } = req.params;

        const transport = await TourTransport.getById(transportId);
        if (!transport) {
            return ApiResponse.error(res, {
                message: "Không tìm thấy phương tiện",
                statusCode: 404
            });
        }

        const usedSeats = await TransportGuestAssignment.getUsedSeats(transportId);
        const seatInfo = await TourTransport.getAvailableSeats(transportId);

        return ApiResponse.success(res, {
            message: "Lấy danh sách ghế thành công",
            data: { 
                usedSeats,
                totalSeats: seatInfo.total_seats,
                assignedGuests: seatInfo.assigned_guests,
                availableSeats: seatInfo.available_seats
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAssignmentsByTransport,
    getAssignmentsByGuest,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    bulkCreateAssignments,
    getUsedSeats
};