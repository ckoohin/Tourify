import React, { useEffect, useState } from 'react';
import { Plus, Calendar, DollarSign, Trash2 } from 'lucide-react';
import tourService from '../../services/api/tourService';

const TourVersions = ({ tourId, versions = [] }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Calendar size={20} className="text-green-600"/>
          Phiên bản & Bảng giá
        </h3>
        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus size={16}/> Thêm Phiên bản
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Tên phiên bản</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Hiệu lực</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {versions.length === 0 ? (
              <tr><td colSpan="4" className="p-4 text-center text-slate-400">Chưa có phiên bản nào (VD: Tour Hè, Tour Tết...)</td></tr>
            ) : (
              versions.map((ver) => (
                <tr key={ver.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{ver.name}</td>
                  <td className="px-4 py-3 capitalize">{ver.type}</td>
                  <td className="px-4 py-3">{ver.valid_from} - {ver.valid_to}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-red-600 hover:text-red-800 p-1"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TourVersions;