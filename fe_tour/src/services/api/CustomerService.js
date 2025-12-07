import api from "./axios";

const customerService = {
    // Lấy danh sách (có tìm kiếm, lọc, phân trang)
    getAll: (params) => api.get("/customer", { params }),

    // Lấy tất cả danh sách khách hàng trong bảng quotes với status là sent
    getAllCustomerInQuotes: () => api.get("/customer/quotes"),

    // Lấy chi tiết
    getById: (id) => api.get(`/customer/${id}`),

    // Tạo mới
    create: (data) => api.post("/customer", data),

    // Cập nhật
    update: (id, data) => api.put(`/customer/${id}`, data),

    // Xóa
    delete: (id) => api.delete(`/customer/${id}`),

    // Xuất Excel
    exportExcel: async (params) => {
        return await api.get("/customer/export", {
            params,
            responseType: "blob",
        });
    },
};

export default customerService;
