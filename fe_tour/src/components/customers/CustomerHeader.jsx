import React from 'react';
import { Plus } from 'lucide-react';

const CustomerHeader = ({ total, ExportAction, onAdd }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Khách hàng</h1>
        <p className="text-sm text-gray-500">Tổng số: {total} khách hàng</p>
      </div>
      <div className="flex gap-3">
        {ExportAction}
      </div>
    </div>
  );
};

export default CustomerHeader;