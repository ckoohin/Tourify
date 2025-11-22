import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, Image as ImageIcon } from 'lucide-react';

const TourTable = ({ tours, onDelete }) => {
  if (!tours || tours.length === 0) {
    return <div className="p-8 text-center text-gray-500">Không có dữ liệu tour.</div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Tour / Mã</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phiên bản</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tours.map((tour) => (
            <tr key={tour.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-12 w-16 rounded bg-gray-100 flex items-center justify-center overflow-hidden border">
                  {tour.images && tour.images.length > 0 ? (
                    <img 
                        src={tour.images[0].url} 
                        alt={tour.name} 
                        className="h-full w-full object-cover" 
                        // Thêm xử lý lỗi ảnh nếu cần
                        onError={(e) => {e.target.src = 'https://via.placeholder.com/150?text=No+Img'}}
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{tour.name}</div>
                <div className="text-xs text-gray-500 font-mono">{tour.slug}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {tour.versions ? tour.versions.length : 0} phiên bản
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  tour.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {tour.status || 'Draft'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Link to={`/tours/edit/${tour.id}`} className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50">
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => onDelete(tour.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TourTable;