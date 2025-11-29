import React from 'react';
import { Search, Filter } from 'lucide-react';

/**
 * 
 * @param {Array} allCustomers 
 * @param {Object} filters 
 * @returns {Object} 
 */
export const filterAndPaginateCustomers = (allCustomers, filters) => {
  let result = [...allCustomers];

  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(c => 
      (c.full_name && c.full_name.toLowerCase().includes(term)) ||
      (c.customer_code && c.customer_code.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  }

  if (filters.type) {
    result = result.filter(c => c.customer_type === filters.type);
  }

  const total = result.length;
  const totalPages = Math.ceil(total / filters.limit);

  let currentPage = filters.page;
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = 1; 
  }

  const startIndex = (currentPage - 1) * filters.limit;
  const endIndex = startIndex + filters.limit;
  const paginatedData = result.slice(startIndex, endIndex);

  return { 
    data: paginatedData, 
    total,
    totalPages,
    shouldResetPage: filters.page > totalPages && totalPages > 0 
  };
};

const CustomerFilters = ({ filters, onChange }) => {
  const handleSearchChange = (e) => {
    onChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handleTypeChange = (e) => {
    onChange({ ...filters, type: e.target.value, page: 1 });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[250px] relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Tìm theo tên, SĐT, email..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          value={filters.search}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="w-full md:w-48">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer transition-all"
            value={filters.type}
            onChange={handleTypeChange}
          >
            <option value="">Tất cả loại khách</option>
            <option value="individual">Cá nhân</option>
            <option value="company">Doanh nghiệp</option>
            <option value="agent">Đại lý</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CustomerFilters;