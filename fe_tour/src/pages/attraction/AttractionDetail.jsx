import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Loader2, 
  AlertTriangle, 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail,
  // --- Icons mới được thêm vào ---
  User,           // Cho Người liên hệ
  MapPin,         // Cho Địa chỉ
  Tag,            // Cho Dịch vụ
  FileText,       // Cho Hợp đồng
  Calendar,       // Cho Ngày tháng
  Ticket,         // Cho Booking
  CalendarCheck   // Cho Lịch sử Booking
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency } from '../../utils/formatters'; // 👈 Cần import hàm này

export default function AttractionDetail() {
  const { id } = useParams();
  const [attraction, setAttraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('services'); // 'services', 'contracts', 'bookings'

  // API 4: Lấy dữ liệu chi tiết
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ... (Logic fetch API của bạn) ...
        
        // --- GIẢ LẬP DỮ LIỆU ---
        const mockData = {
          id: id, company_name: 'Vinpearl Land Nha Trang', status: 'active',
          contact_person: 'Ms. Lan', phone: '0901234567', email: 'lan.vpl@vin.com',
          address: 'Đảo Hòn Tre', city: 'Nha Trang',
          services: [
            { id: 1, name: 'Vé vào cổng người lớn', unit_price: 800000 },
            { id: 2, name: 'Vé cáp treo 2 chiều', unit_price: 300000 }
          ],
          contracts: [
            { id: 1, contract_number: 'HD-VIN-2025', start_date: '2025-01-01', end_date: '2025-12-31', status: 'active' }
          ],
          bookings: [
            { id: 1, booking_code: 'SV-001', service_date: '2025-11-20', quantity: 15, total_amount: 12000000 }
          ]
        };
        // --- KẾT THÚC GIẢ LẬP ---
        
        await new Promise(res => setTimeout(res, 500)); // Giả lập chờ
        setAttraction(mockData);
      } catch (err) {
        setError('Không thể tải chi tiết',err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // --- SỬA 1: Hoàn thiện trạng thái Loading ---
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // --- SỬA 2: Hoàn thiện trạng thái Lỗi ---
  if (error || !attraction) {
    return (
      <div className="flex h-96 items-center justify-center p-6 bg-white border border-red-200 rounded-2xl">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="mt-4 text-lg font-bold text-slate-800">{error || 'Không tìm thấy điểm tham quan'}</h3>
          <Link to="/attractions" className="mt-4 inline-block text-primary hover:underline flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }
  
  // Xử lý StatusBadge (tái sử dụng từ TourCard)
  const statusMap = {
    active: { level: 'success', text: 'Hoạt động' },
    inactive: { level: 'info', text: 'Không hoạt động' },
    blacklist: { level: 'danger', text: 'Đã khóa' },
  };
  const currentStatus = statusMap[attraction.status] || statusMap.info;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header (Thêm class cho đẹp) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/attractions" className="flex items-center text-sm text-primary font-medium mb-1 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">{attraction.company_name}</h1>
          <div className="mt-2">
            <StatusBadge level={currentStatus.level} text={currentStatus.text} />
          </div>
        </div>
        <Link 
          to={`/attractions/edit/${id}`} 
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 flex items-center transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" /> 
          Sửa
        </Link>
      </div>
      
      {/* Layout 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- SỬA 3: Cột trái (Thêm icon & thông tin) --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-5">Thông tin liên hệ</h3>
            <div className="space-y-4">
              
              <div className="flex">
                <User className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500">Người liên hệ</div>
                  <div className="font-medium text-slate-700">{attraction.contact_person}</div>
                </div>
              </div>

              <div className="flex">
                <Phone className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500">Số điện thoại</div>
                  <a href={`tel:${attraction.phone}`} className="font-medium text-primary hover:underline">
                    {attraction.phone}
                  </a>
                </div>
              </div>
              
              <div className="flex">
                <Mail className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500">Email</div>
                  <a href={`mailto:${attraction.email}`} className="font-medium text-primary hover:underline">
                    {attraction.email}
                  </a>
                </div>
              </div>
              
              <div className="flex">
                <MapPin className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500">Địa chỉ</div>
                  <div className="font-medium text-slate-700">
                    {attraction.address}, {attraction.city}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* --- SỬA 4: Cột phải (Thiết kế chi tiết 3 Tab) --- */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200">
            <button onClick={() => setActiveTab('services')} className={`flex items-center gap-2 py-4 px-6 font-medium ${activeTab === 'services' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-800'}`}>
              <Tag className="w-4 h-4" /> Dịch vụ ({attraction.services.length})
            </button>
            <button onClick={() => setActiveTab('contracts')} className={`flex items-center gap-2 py-4 px-6 font-medium ${activeTab === 'contracts' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-800'}`}>
              <FileText className="w-4 h-4" /> Hợp đồng ({attraction.contracts.length})
            </button>
            <button onClick={() => setActiveTab('bookings')} className={`flex items-center gap-2 py-4 px-6 font-medium ${activeTab === 'bookings' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-800'}`}>
              <Ticket className="w-4 h-4" /> Lịch sử Booking ({attraction.bookings.length})
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            
            {/* Tab 1: Dịch vụ */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                {attraction.services.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {attraction.services.map(service => (
                      <li key={service.id} className="flex justify-between items-center py-3">
                        <span className="font-medium text-slate-700">{service.name}</span>
                        <span className="font-bold text-slate-800">{formatCurrency(service.unit_price)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-center py-4">Chưa có dịch vụ nào được định nghĩa.</p>
                )}
              </div>
            )}
            
            {/* Tab 2: Hợp đồng */}
            {activeTab === 'contracts' && (
              <div className="space-y-4">
                {attraction.contracts.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {attraction.contracts.map(contract => (
                      <li key={contract.id} className="py-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-slate-700 flex items-center">
                            <FileText className="w-4 h-4 mr-3 text-slate-500" />
                            {contract.contract_number}
                          </span>
                          <StatusBadge level={contract.status === 'active' ? 'success' : 'info'} text={contract.status} />
                        </div>
                        <div className="text-sm text-slate-500 ml-7 mt-1 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                          Hiệu lực: {contract.start_date} - {contract.end_date}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-center py-4">Không có hợp đồng nào.</p>
                )}
              </div>
            )}
            
            {/* Tab 3: Lịch sử Booking */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                {attraction.bookings.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {attraction.bookings.map(booking => (
                      <li key={booking.id} className="py-3">
                        <div className="flex justify-between items-center">
                          <Link to={`/service-bookings/${booking.id}`} className="font-medium text-primary hover:underline flex items-center">
                            <Ticket className="w-4 h-4 mr-3" />
                            {booking.booking_code}
                          </Link>
                          <span className="font-bold text-slate-800">{formatCurrency(booking.total_amount)}</span>
                        </div>
                        <div className="text-sm text-slate-500 ml-7 mt-1 flex items-center">
                          <CalendarCheck className="w-4 h-4 mr-2 text-slate-400" />
                          Ngày sử dụng: {booking.service_date} (Số lượng: {booking.quantity})
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-center py-4">Chưa có booking nào cho điểm tham quan này.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}