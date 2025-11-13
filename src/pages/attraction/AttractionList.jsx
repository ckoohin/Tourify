import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPinPlus,
  Search,
  MapPin,
  Edit2,
  Trash2,
} from 'lucide-react';

// --- DỮ LIỆU GIẢ (MOCK DATA) ---

// Danh sách 8 điểm tham quan chi tiết
const mockAttractions = [
  {
    id: 'AT001',
    name: 'Phố cổ Hội An',
    location: 'Quảng Nam',
    regionId: 'quangnam',
    typeId: 'culture',
    imageUrl: 'https://i.imgur.com/L8a5X9o.jpeg',
    description: 'Di sản văn hóa thế giới với kiến trúc cổ kính, đèn lồng rực rỡ và không khí yên bình.',
    tags: ['Di sản văn hóa'],
  },
  {
    id: 'AT002',
    name: 'Cầu Vàng (Bà Nà Hills)',
    location: 'Đà Nẵng',
    regionId: 'danang',
    typeId: 'entertainment',
    imageUrl: 'https://i.imgur.com/3c8b6mY.jpeg',
    description: 'Cây cầu đi bộ nổi tiếng với thiết kế bàn tay khổng lồ nâng đỡ, nằm trong khuôn viên Sun World Bà Nà Hills.',
    tags: ['Giải trí', 'Kiến trúc'],
  },
  {
    id: 'AT003',
    name: 'Hang Múa (Ninh Bình)',
    location: 'Ninh Bình',
    regionId: 'ninhbinh',
    typeId: 'nature',
    imageUrl: 'https://i.imgur.com/O6tT3W1.jpeg',
    description: 'Nổi tiếng với 500 bậc thang lên đỉnh núi, nơi có thể ngắm trọn vẹn cảnh quan Tam Cốc từ trên cao.',
    tags: ['Thiên nhiên'],
  },
  {
    id: 'AT004',
    name: 'Hồ Hoàn Kiếm & Đền Ngọc Sơn',
    location: 'Hà Nội',
    regionId: 'hanoi',
    typeId: 'history',
    imageUrl: 'https://i.imgur.com/7H1p8fD.jpeg',
    description: 'Biểu tượng của thủ đô Hà Nội, gắn liền với truyền thuyết trả gươm của Vua Lê Lợi. Bao gồm Tháp Rùa, cầu Thê Húc...',
    tags: ['Di tích lịch sử'],
  },
  {
    id: 'AT005',
    name: 'Bãi Sao (Phú Quốc)',
    location: 'Kiên Giang',
    regionId: 'kiengiang',
    typeId: 'beach',
    imageUrl: 'https://i.imgur.com/6bJ9Z8o.jpeg',
    description: 'Một trong những bãi biển đẹp nhất Phú Quốc với bờ cát trắng mịn như kem và nước biển xanh trong vắt.',
    tags: ['Bãi biển'],
  },
  {
    id: 'AT006',
    name: 'Chợ Bến Thành',
    location: 'TP. Hồ Chí Minh',
    regionId: 'hcm',
    typeId: 'culture',
    imageUrl: 'https://i.imgur.com/Y1X41bS.jpeg',
    description: 'Biểu tượng của Sài Gòn, nơi tập trung buôn bán sầm uất và cũng là điểm tham quan không thể bỏ qua.',
    tags: ['Biểu tượng', 'Văn hóa'],
  },
  {
    id: 'AT007',
    name: 'Vịnh Hạ Long',
    location: 'Quảng Ninh',
    regionId: 'quangninh',
    typeId: 'nature',
    imageUrl: 'https://i.imgur.com/gA5Q8hM.jpeg', // Ảnh mới
    description: 'Di sản thiên nhiên thế giới UNESCO, nổi tiếng với hàng ngàn đảo đá vôi và làn nước xanh ngọc bích.',
    tags: ['Thiên nhiên', 'Di sản văn hóa'],
  },
  {
    id: 'AT008',
    name: 'Dinh Độc Lập (Dinh Thống Nhất)',
    location: 'TP. Hồ Chí Minh',
    regionId: 'hcm',
    typeId: 'history',
    imageUrl: 'https://i.imgur.com/T5iN43h.jpeg', // Ảnh mới
    description: 'Di tích lịch sử quốc gia đặc biệt, nơi gắn liền với sự kiện lịch sử quan trọng của Việt Nam vào ngày 30/4/1975.',
    tags: ['Di tích lịch sử', 'Kiến trúc'],
  },
];

// Dữ liệu giả cho bộ lọc
const mockRegions = [
  { id: 'hanoi', name: 'Hà Nội' },
  { id: 'quangninh', name: 'Quảng Ninh' },
  { id: 'laocai', name: 'Lào Cai' },
  { id: 'quangnam', name: 'Quảng Nam' },
  { id: 'danang', name: 'Đà Nẵng' },
  { id: 'ninhbinh', name: 'Ninh Bình' },
  { id: 'kiengiang', name: 'Kiên Giang (Phú Quốc)' },
  { id: 'hcm', name: 'TP. Hồ Chí Minh' },
];

const mockTypes = [
  { id: 'nature', name: 'Thiên nhiên' },
  { id: 'history', name: 'Di tích lịch sử' },
  { id: 'culture', name: 'Văn hóa' },
  { id: 'entertainment', name: 'Giải trí' },
  { id: 'beach', name: 'Bãi biển' },
];

// --- CÁC COMPONENT CON & HÀM HỖ TRỢ ---

/**
 * Component render Tag (nhãn) với màu sắc tương ứng
 */
const AttractionTag = ({ tag }) => {
  const tagColors = {
    'Di sản văn hóa': 'text-amber-600 bg-amber-50',
    'Giải trí': 'text-cyan-600 bg-cyan-50',
    'Thiên nhiên': 'text-emerald-600 bg-emerald-50',
    'Di tích lịch sử': 'text-red-600 bg-red-50',
    'Bãi biển': 'text-blue-600 bg-blue-50',
    'Biểu tượng': 'text-gray-600 bg-gray-100',
    'Văn hóa': 'text-purple-600 bg-purple-50',
    'Kiến trúc': 'text-indigo-600 bg-indigo-50',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${tagColors[tag] || 'text-gray-600 bg-gray-100'}`}>
      {tag}
    </span>
  );
};

// --- COMPONENT CHÍNH ---

export default function AttractionList() {
  const [attractions, setAttractions] = useState([]);
  const [filteredAttractions, setFilteredAttractions] = useState([]);
  const [regions, setRegions] = useState([]);
  const [types, setTypes] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    regionId: 'all',
    typeId: 'all',
  });

  // 1. Khởi tạo dữ liệu (giả lập API call)
  useEffect(() => {
    setAttractions(mockAttractions);
    setFilteredAttractions(mockAttractions);
    setRegions(mockRegions);
    setTypes(mockTypes);
  }, []);

  // 2. Xử lý logic lọc mỗi khi filter thay đổi
  useEffect(() => {
    let result = [...attractions];
    const searchLower = filters.search.toLowerCase();

    // Lọc theo tìm kiếm (tên hoặc địa điểm)
    if (searchLower) {
      result = result.filter(
        (att) =>
          att.name.toLowerCase().includes(searchLower) ||
          att.location.toLowerCase().includes(searchLower)
      );
    }

    // Lọc theo Tỉnh/Thành
    if (filters.regionId !== 'all') {
      result = result.filter((att) => att.regionId === filters.regionId);
    }

    // Lọc theo loại hình
    if (filters.typeId !== 'all') {
      result = result.filter((att) => att.typeId === filters.typeId);
    }

    setFilteredAttractions(result);
  }, [filters, attractions]);

  // 3. Hàm xử lý khi thay đổi filter
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 4. Hàm xử lý xóa (giả lập)
  const handleDelete = (id, name) => {
    if (confirm(`Bạn có chắc chắn muốn xóa điểm tham quan "${name}"?`)) {
      // Logic xóa...
      alert(`Đã xóa ${name}`);
      // Cập nhật lại state
      const newAttractions = attractions.filter((att) => att.id !== id);
      setAttractions(newAttractions);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* PAGE HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Điểm tham quan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Cơ sở dữ liệu các địa điểm du lịch để xây dựng tour.
          </p>
        </div>
        <Link
          to="/attractions/create" // Đường dẫn này cần được định nghĩa trong App.jsx
          className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 shadow-sm shadow-blue-500/30 flex items-center transition-colors"
        >
          <MapPinPlus className="mr-2 text-lg" />
          Thêm điểm tham quan
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 focus-within:border-primary transition-colors w-full md:w-auto">
          <Search className="text-slate-400 w-5 h-5" />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Tên điểm đến, địa chỉ..."
            className="bg-transparent border-none outline-none ml-2 w-full text-sm text-slate-700"
          />
        </div>
        {/* Region Filter */}
        <select
          name="regionId"
          value={filters.regionId}
          onChange={handleFilterChange}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 cursor-pointer w-full md:w-48"
        >
          <option value="all">Tất cả Tỉnh/Thành</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
        {/* Type Filter */}
        <select
          name="typeId"
          value={filters.typeId}
          onChange={handleFilterChange}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 cursor-pointer w-full md:w-48"
        >
          <option value="all">Tất cả loại hình</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* ATTRACTIONS GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAttractions.map((att) => (
          <div
            key={att.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group flex flex-col"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={att.imageUrl}
                alt={att.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                <Link to={`/attractions/${att.id}`}>{att.name}</Link>
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="text-slate-400 text-sm w-4 h-4" />
                <span className="text-sm text-slate-500">{att.location}</span>
              </div>
              <div className="flex items-center flex-wrap gap-2 mb-4">
                {att.tags.map((tag) => (
                  <AttractionTag key={tag} tag={tag} />
                ))}
              </div>
              <p className="text-sm text-slate-500 mb-4 line-clamp-3 flex-1">
                {att.description}
              </p>
              <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
                <Link
                  to={`/attractions/${att.id}/edit`}
                  className="flex-1 px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Chỉnh sửa
                </Link>
                <button
                  onClick={() => handleDelete(att.id, att.name)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <p className="text-sm text-slate-500">
          Hiển thị <span className="font-medium text-slate-800">1</span> đến{' '}
          <span className="font-medium text-slate-800">{filteredAttractions.length}</span> trong
          tổng số <span className="font-medium text-slate-800">{attractions.length}</span> điểm
        </p>
        <div className="flex gap-2">
          {/* Logic pagination có thể được thêm vào sau */}
          <button
            className="px-3 py-1 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            disabled
          >
            Trước
          </button>
          <button className="px-3 py-1 bg-primary text-white rounded-md">1</button>
          <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
