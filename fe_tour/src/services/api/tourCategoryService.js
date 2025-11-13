import api from './axios';

export const tourCategoryService = {
  getAll: async () => {
    const response = await api.get('/tour-categories');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tour-categories/${id}`);
    return response.data;
  },

  create: async (categoryData) => {
    const response = await api.post('/tour-categories', categoryData);
    return response.data;
  },

  update: async (id, categoryData) => {
    const response = await api.put(`/tour-categories/${id}`, categoryData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tour-categories/${id}`);
    return response.data;
  }
};

// import api from '../config/api';

// const tourCategoryService = {
//   /**
//    * Lấy tất cả danh mục
//    */
//   getAll: async (params = {}) => {
//     return await api.get('/tour-categories', { params });
//   },

//   /**
//    * Lấy cây danh mục
//    */
//   getTree: async () => {
//     return await api.get('/tour-categories/tree');
//   },

//   /**
//    * Lấy chi tiết danh mục
//    */
//   getById: async (id) => {
//     return await api.get(`/tour-categories/${id}`);
//   },

//   /**
//    * Lấy danh mục con
//    */
//   getChildren: async (id) => {
//     return await api.get(`/tour-categories/${id}/children`);
//   },

//   /**
//    * Tạo danh mục mới
//    */
//   create: async (data) => {
//     return await api.post('/tour-categories', data);
//   },

//   /**
//    * Cập nhật danh mục
//    */
//   update: async (id, data) => {
//     return await api.put(`/tour-categories/${id}`, data);
//   },

//   /**
//    * Xóa danh mục
//    */
//   delete: async (id) => {
//     return await api.delete(`/tour-categories/${id}`);
//   },

//   /**
//    * Cập nhật thứ tự hiển thị
//    */
//   updateOrder: async (orders) => {
//     return await api.post('/tour-categories/reorder', { orders });
//   }
// };

// export default tourCategoryService;