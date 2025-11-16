import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, AlertTriangle, Users, Bus, FileText, DollarSign, Edit, ArrowLeft } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge'; // 👈 Tái sử dụng

export default function ScheduleDetail() {
  const { id } = useParams();
  const [departure, setDeparture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('guests'); // 'guests', 'staff', 'services', 'expenses'

  // API 2: Lấy chi tiết 1 lịch khởi hành (gồm dữ liệu lồng nhau)
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      // TODO: Gọi API GET /api/v1/departures/:id
      // BE phải trả về dữ liệu JOIN đầy đủ:
      // {
      //   ...departureInfo (status, dates, ...),
      //   tour: { name, code },
      //   guests: [ ...danh sách khách từ tour_departure_guests ],
      //   assigned_staff: [ ...danh sách nhân sự từ staff_assignments ],
      //   services: [ ...dịch vụ từ service_bookings ],
      //   expenses: [ ...chi phí từ tour_expenses ]
      // }
      
      // (Mock data)
      setDeparture({
        id: id,
        tour: { name: 'Tour Hạ Long Du Thuyền 5 Sao', code: 'HL032' },
        departure_date: '2025-11-20',
        return_date: '2025-11-22',
        status: 'confirmed',
        guests: [{id: 1, name: 'Nguyễn Văn A', phone: '090...'}],
        assigned_staff: [{id: 1, name: 'Trần Văn B', role: 'HDV Chính'}],
        services: [],
        expenses: []
      });
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  if (loading) { /* ... Render Loading ... */ }
  if (!departure) { /* ... Render Error/Not Found ... */ }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 1. Header Chi tiết */}
      <div className="flex justify-between items-start">
        <div>
          <Link to="/schedules" className="flex items-center text-sm text-primary ...">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại Lịch
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">{departure.tour.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <StatusBadge level="success" text="Đã xác nhận" /> {/* (Dựa trên departure.status) */}
            <span className="text-sm text-slate-500">Mã: <span className="font-medium">{departure.tour.code}</span></span>
          </div>
        </div>
        <Link to={`/schedules/edit/${id}`} className="px-4 py-2 bg-white ...">
          <Edit className="w-4 h-4 mr-2" />
          Chỉnh sửa
        </Link>
      </div>
      
      {/* 2. Tabs Vận hành */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab('guests')} className={`flex items-center gap-2 py-4 px-6 font-medium ${activeTab === 'guests' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}>
            <Users className="w-5 h-5" /> Danh sách khách ({departure.guests.length})
          </button>
          <button onClick={() => setActiveTab('staff')} className={`flex items-center gap-2 py-4 px-6 font-medium ${activeTab === 'staff' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}>
            <Users className="w-5 h-5" /> Nhân sự ({departure.assigned_staff.length})
          </button>
          {/* (Các tab khác cho Dịch vụ, Chi phí...) */}
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'guests' && (
            <div>
              <h3 className="text-lg font-bold mb-4">Danh sách khách (Manifest)</h3>
              {/* Render bảng danh sách khách (departure.guests) */}
              {/* Tái sử dụng component <Table> nếu có */}
            </div>
          )}
          {activeTab === 'staff' && (
            <div>
              <h3 className="text-lg font-bold mb-4">Nhân sự phụ trách</h3>
              {/* Render danh sách nhân sự (departure.assigned_staff) */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}